import { Entity } from './Entity';
import { buildTypeKey } from './Util';
import { Query } from './Query';
import { Component } from './Component';
import { World } from './World';

/**
 * The query manager is responsible for updating all queries when entities/components change
 */
export class QueryManager {
  private _queries: { [entityComponentKey: string]: Query<any> } = {};

  constructor(private _world: World<any>) {}

  /**
   * Adds a query to the manager and populates with any entities that match
   * @param query
   */
  private _addQuery(query: Query<any>) {
    this._queries[buildTypeKey(query.types)] = query;
    for (const entity of this._world.entityManager.entities) {
      query.addEntity(entity);
    }
  }

  /**
   * Removes the query if there are no observers left
   * @param query
   */
  public maybeRemoveQuery(query: Query): void {
    if (query.observers.length === 0) {
      query.clear();
      delete this._queries[buildTypeKey(query.types)];
    }
  }

  /**
   * Adds the entity to any matching query in the query manage
   * @param entity
   */
  public addEntity(entity: Entity) {
    for (const queryType in this._queries) {
      if (this._queries[queryType]) {
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
      this._queries[queryType].removeEntity(entity);
    }
  }

  /**
   * Creates a populated query and returns, if the query already exists that will be returned instead of a new instance
   * @param types
   */
  public createQuery<T extends Component = Component>(types: readonly string[]): Query<T> {
    const maybeExistingQuery = this.getQuery<T>(types);
    if (maybeExistingQuery) {
      return maybeExistingQuery;
    }
    const query = new Query<T>(types);
    this._addQuery(query);
    return query;
  }

  /**
   * Retrieves an existing query by types if it exists otherwise returns null
   * @param types
   */
  public getQuery<T extends Component = Component>(types: readonly string[]): Query<T> {
    const key = buildTypeKey(types);
    if (this._queries[key]) {
      return this._queries[key] as Query<T>;
    }
    return null;
  }
}
