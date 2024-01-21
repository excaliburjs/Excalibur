import { Entity } from './Entity';
import { Query } from './Query';
import { Component, ComponentCtor } from './Component';

/**
 * The query manager is responsible for updating all queries when entities/components change
 */
export class QueryManager {
  private _queries = new Map<string, Query<any>>();
  private _addComponentHandlers = new Map<Entity, (c: Component) => any>();
  private _removeComponentHandlers = new Map<Entity, (c: Component) => any>();
  private _componentToQueriesIndex = new Map<ComponentCtor<any>, Query<any>[]>();

  public createQuery<TKnownComponentCtors extends ComponentCtor<Component>>(
    requiredComponents: TKnownComponentCtors[]): Query<TKnownComponentCtors> {
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

    return query;
  }

  private _createAddComponentHandler = (entity: Entity) => (c: Component) => {
    this.addComponent(entity, c);
  };

  private _createRemoveComponentHandler = (entity: Entity) => (c: Component) => {
    this.removeComponent(entity, c);
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

    let added = false;
    for (const [_, query] of this._queries.entries()) {
      added = query.checkAndAdd(entity) || added;
    }
    if (added) {
      entity.componentAdded$.subscribe(addComponent);
      entity.componentRemoved$.subscribe(removeComponent);
    }
  }

  /**
   * Scans queries and locates any that need this entity removed
   * @param entity
   */
  removeEntity(entity: Entity) {
    const addComponent = this._addComponentHandlers.get(entity);
    const removeComponent = this._removeComponentHandlers.get(entity);
    for (const [_, query] of this._queries.entries()) {
      query.removeEntity(entity);
    }
    if (addComponent) {
      entity.componentAdded$.unsubscribe(addComponent);
    }
    if (removeComponent) {
      entity.componentRemoved$.unsubscribe(removeComponent);
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
}
