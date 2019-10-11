import { Entity } from './Entity';
import { buildEntityComponentKey } from './Util';
import { Query } from './Query';
import { EntityManager } from './EntityManager';
import { Component } from './Component';

export class QueryManager {
  private _queries: { [entityComponentKey: string]: Query } = {};

  constructor(private _entityManager: EntityManager) {}

  public addQuery(query: Query) {
    if (this._queries[buildEntityComponentKey(query.types)]) {
      query = this._queries[buildEntityComponentKey(query.types)];
    } else {
      this._queries[buildEntityComponentKey(query.types)] = query;
    }

    for (const entity of this._entityManager.entities) {
      this.addEntity(entity);
    }
  }

  public removeQuery(query: Query) {
    query.clear();
    delete this._queries[buildEntityComponentKey(query.types)];
  }

  // todo this is weird
  public addComponent(entity: Entity, component: Component) {
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
}
