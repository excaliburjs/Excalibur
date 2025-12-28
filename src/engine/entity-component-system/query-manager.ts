import type { Entity } from './entity';
import type { QueryParams } from './query';
import { Query } from './query';
import type { Component, ComponentCtor } from './component';
import type { World } from './world';

/**
 * The query manager is responsible for updating all queries when entities/components change
 */
export class QueryManager {
  private _queries = new Map<string, Query<any, any>>();
  private _addComponentHandlers = new Map<Entity, (c: Component) => any>();
  private _removeComponentHandlers = new Map<Entity, (c: Component) => any>();

  private _componentToQueriesIndex = new Map<ComponentCtor<any>, Query<any, any>[]>();
  private _tagToQueriesIndex = new Map<string, Query<any, any>[]>();

  private _addTagHandlers = new Map<Entity, (tag: string) => any>();
  private _removeTagHandlers = new Map<Entity, (tag: string) => any>();

  constructor(private _world: World) {}

  public createQuery<
    TKnownComponentCtors extends ComponentCtor<Component> = never,
    TAnyComponentCtors extends ComponentCtor<Component> = never
  >(
    params: TKnownComponentCtors[] | QueryParams<TKnownComponentCtors, TAnyComponentCtors>
  ): Query<TKnownComponentCtors, TAnyComponentCtors> {
    const id = Query.createId(params);
    if (this._queries.has(id)) {
      // short circuit if query is already created
      return this._queries.get(id) as Query<TKnownComponentCtors>;
    }

    const query = new Query<TKnownComponentCtors, TAnyComponentCtors>(params);

    this._queries.set(query.id, query);

    // index maintenance
    // components
    for (const component of [...query.filter.components.all, ...query.filter.components.any, ...query.filter.components.not]) {
      const queries = this._componentToQueriesIndex.get(component);
      if (!queries) {
        this._componentToQueriesIndex.set(component, [query]);
      } else {
        queries.push(query);
      }
    }
    // tags
    for (const tag of [...query.filter.tags.all, ...query.filter.tags.any, ...query.filter.tags.not]) {
      const queries = this._tagToQueriesIndex.get(tag);

      if (!queries) {
        this._tagToQueriesIndex.set(tag, [query]);
      } else {
        queries.push(query);
      }
    }

    for (const entity of this._world.entities) {
      this.addEntity(entity);
    }

    return query;
  }

  private _createAddComponentHandler = (entity: Entity) => (c: Component) => {
    this.addComponent(entity, c);
  };

  private _createRemoveComponentHandler = (entity: Entity) => (c: Component) => {
    this.removeComponent(entity, c);
  };

  private _createAddTagHandler = (entity: Entity) => (tag: string) => {
    this.addTag(entity, tag);
  };

  private _createRemoveTagHandler = (entity: Entity) => (tag: string) => {
    this.removeTag(entity, tag);
  };

  /**
   * Scans queries and locates any that need this entity added
   * @param entity
   */
  addEntity(entity: Entity) {
    const maybeAddComponent = this._addComponentHandlers.get(entity);
    const maybeRemoveComponent = this._removeComponentHandlers.get(entity);
    const addComponent = maybeAddComponent ?? this._createAddComponentHandler(entity);
    const removeComponent = maybeRemoveComponent ?? this._createRemoveComponentHandler(entity);
    this._addComponentHandlers.set(entity, addComponent);
    this._removeComponentHandlers.set(entity, removeComponent);

    const maybeAddTag = this._addTagHandlers.get(entity);
    const maybeRemoveTag = this._removeTagHandlers.get(entity);
    const addTag = maybeAddTag ?? this._createAddTagHandler(entity);
    const removeTag = maybeRemoveTag ?? this._createRemoveTagHandler(entity);
    this._addTagHandlers.set(entity, addTag);
    this._removeTagHandlers.set(entity, removeTag);

    for (const query of this._queries.values()) {
      query.checkAndModify(entity);
    }

    entity.componentAdded$.subscribe(addComponent);
    entity.componentRemoved$.subscribe(removeComponent);
    entity.tagAdded$.subscribe(addTag);
    entity.tagRemoved$.subscribe(removeTag);
  }

  /**
   * Scans queries and locates any that need this entity removed
   * @param entity
   */
  removeEntity(entity: Entity) {
    // Handle components
    const addComponent = this._addComponentHandlers.get(entity);
    const removeComponent = this._removeComponentHandlers.get(entity);
    for (const query of this._queries.values()) {
      query.removeEntity(entity);
    }
    if (addComponent) {
      entity.componentAdded$.unsubscribe(addComponent);
      this._addComponentHandlers.delete(entity);
    }
    if (removeComponent) {
      entity.componentRemoved$.unsubscribe(removeComponent);
      this._removeComponentHandlers.delete(entity);
    }

    // Handle tags
    const addTag = this._addTagHandlers.get(entity);
    const removeTag = this._removeTagHandlers.get(entity);

    if (addTag) {
      entity.tagAdded$.unsubscribe(addTag);
      this._addTagHandlers.delete(entity);
    }
    if (removeTag) {
      entity.tagRemoved$.unsubscribe(removeTag);
      this._removeTagHandlers.delete(entity);
    }
  }

  /**
   * Updates any queries when a component is added to an entity
   * @param entity
   * @param component
   */
  addComponent(entity: Entity, component: Component) {
    const queries = this._componentToQueriesIndex.get(component.constructor as ComponentCtor<any>) ?? [];
    for (const query of queries) {
      query.checkAndModify(entity);
    }
  }

  /**
   * Updates any queries when a component is removed from an entity
   * @param entity
   * @param component
   */
  removeComponent(entity: Entity, component: Component) {
    const queries = this._componentToQueriesIndex.get(component.constructor as ComponentCtor<any>) ?? [];
    for (const query of queries) {
      // so this should not be called
      query.checkAndModify(entity, component.constructor as ComponentCtor<any>);
    }
  }

  /**
   * Updates any queries when a tag is added to an entity
   * @param entity
   * @param tag
   */
  addTag(entity: Entity, tag: string) {
    const queries = this._tagToQueriesIndex.get(tag) ?? [];
    for (const query of queries) {
      query.checkAndModify(entity);
    }
  }

  /**
   * Updates any queries when a component is removed from an entity
   * @param entity
   * @param tag
   */
  removeTag(entity: Entity, tag: string) {
    const queries = this._tagToQueriesIndex.get(tag) ?? [];
    for (const query of queries) {
      query.removeEntity(entity);
      query.checkAndModify(entity);
    }
  }
}
