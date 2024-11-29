import { Entity } from './Entity';
import { Query } from './Query';
import { Component, ComponentCtor } from './Component';
import { World } from './World';
import { TagQuery } from './TagQuery';

/**
 * The query manager is responsible for updating all queries when entities/components change
 */
export class QueryManager {
  private _queries = new Map<string, Query<any>>();
  private _addComponentHandlers = new Map<Entity, (c: Component) => any>();
  private _removeComponentHandlers = new Map<Entity, (c: Component) => any>();
  private _componentToQueriesIndex = new Map<ComponentCtor<any>, Query<any>[]>();

  private _tagQueries = new Map<string, TagQuery<any>>();
  private _addTagHandlers = new Map<Entity, (tag: string) => any>();
  private _removeTagHandlers = new Map<Entity, (tag: string) => any>();
  private _tagToQueriesIndex = new Map<string, TagQuery<any>[]>();

  constructor(private _world: World) {}

  public createQuery<TKnownComponentCtors extends ComponentCtor<Component>>(
    requiredComponents: TKnownComponentCtors[]
  ): Query<TKnownComponentCtors> {
    const id = Query.createId(requiredComponents);
    if (this._queries.has(id)) {
      // short circuit if query is already created
      return this._queries.get(id) as Query<TKnownComponentCtors>;
    }

    const query = new Query(requiredComponents);

    this._queries.set(query.id, query);

    // index maintenance
    for (const component of requiredComponents) {
      const queries = this._componentToQueriesIndex.get(component);
      if (!queries) {
        this._componentToQueriesIndex.set(component, [query]);
      } else {
        queries.push(query);
      }
    }

    for (const entity of this._world.entities) {
      this.addEntity(entity);
    }

    return query;
  }

  public createTagQuery<TKnownTags extends string>(requiredTags: TKnownTags[]): TagQuery<TKnownTags> {
    const id = TagQuery.createId(requiredTags);
    if (this._tagQueries.has(id)) {
      // short circuit if query is already created
      return this._tagQueries.get(id) as TagQuery<TKnownTags>;
    }

    const query = new TagQuery(requiredTags);

    this._tagQueries.set(query.id, query);

    // index maintenance
    for (const tag of requiredTags) {
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
      query.checkAndAdd(entity);
    }
    for (const tagQuery of this._tagQueries.values()) {
      tagQuery.checkAndAdd(entity);
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
    }
    if (removeComponent) {
      entity.componentRemoved$.unsubscribe(removeComponent);
    }

    // Handle tags
    const addTag = this._addTagHandlers.get(entity);
    const removeTag = this._removeTagHandlers.get(entity);
    for (const tagQuery of this._tagQueries.values()) {
      tagQuery.removeEntity(entity);
    }

    if (addTag) {
      entity.tagAdded$.unsubscribe(addTag);
    }
    if (removeTag) {
      entity.tagRemoved$.unsubscribe(removeTag);
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
      query.checkAndAdd(entity);
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
      query.removeEntity(entity);
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
      query.checkAndAdd(entity);
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
    }
  }
}
