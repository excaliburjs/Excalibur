import { Entity } from './Entity';
import { buildEntityTypeKey } from './Util';
import { Query } from './Query';
import { Component } from './Component';
import { Scene } from '../Scene';
import { System } from './System';

export class QueryManager {
  private _queries: { [entityComponentKey: string]: Query } = {};

  constructor(public scene: Scene) {}

  public addQuery(query: Query) {
    if (this._queries[buildEntityTypeKey(query.types)]) {
      query = this._queries[buildEntityTypeKey(query.types)];
    } else {
      this._queries[buildEntityTypeKey(query.types)] = query;
    }

    for (const entity of this.scene.entityManager.entities) {
      if (query.matches(entity.types)) {
        query.addEntity(entity);
      }
    }
  }

  public removeQuery(query: Query) {
    query.clear();
    delete this._queries[buildEntityTypeKey(query.types)];
  }

  // todo this is weird, and not needed?
  public addComponent(entity: Entity, _component: Component) {
    this.addEntity(entity);
  }

  /**
   * Adds the entity to any matching query
   * @param entity
   */
  public addEntity(entity: Entity) {
    for (const queryType in this._queries) {
      if (this._queries[queryType].matches(entity.types)) {
        this._queries[queryType].addEntity(entity);
      }
    }
  }

  /**
   * Removes an entity from queries if the removed component disqualifies it
   * @param entity
   * @param component
   */
  public removeComponent(entity: Entity, component: Component) {
    for (const queryType in this._queries) {
      if (this._queries[queryType].matches(entity.types.concat([component.type]))) {
        this._queries[queryType].removeEntity(entity);
      }
    }
  }

  /**
   * Removes an entity from all queries it is currently a part of
   * @param entity
   */
  public removeEntity(entity: Entity) {
    for (const queryType in this._queries) {
      if (this._queries[queryType].entities.indexOf(entity) > -1) {
        this._queries[queryType].removeEntity(entity);
      }
    }
  }

  public createQuery(types: string[]): Query {
    const query = new Query(types);
    this.addQuery(query);

    return query;
  }

  /**
   * Potentially removes the query if observers of the query fall to zero
   * @param types
   */
  public maybeRemoveQueryBySystem(system: System): void {
    if (this._queries[buildEntityTypeKey(system.types)]) {
      const query = this._queries[buildEntityTypeKey(system.types)];
      query.unregister(system);
      if (query.observers.length === 0) {
        delete this._queries[buildEntityTypeKey(system.types)];
      }
    }
  }
}
