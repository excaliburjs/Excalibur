import { Entity } from './Entity';
import { buildTypeKey } from './Util';
import { Observable } from '../Util/Observable';
import { Util, Component } from '..';
import { AddedEntity, RemovedEntity } from './System';

/**
 * Represents query for entities that match a list of types that is cached and observable
 *
 * Queries can be strongly typed by supplying a type union in the optional type parameter
 * ```typescript
 * const queryAB = new ex.Query<ComponentTypeA, ComponentTypeB>(['A', 'B']);
 * ```
 */
export class Query<T extends Component = Component> extends Observable<AddedEntity | RemovedEntity> {
  private _entities: Entity<T>[] = [];
  public get key(): string {
    return buildTypeKey(this.types);
  }

  constructor(public types: string[], public sortCompare?: (a: Entity, b: Entity) => number) {
    super();
  }

  /**
   * Returns a list of entities that match the query
   */
  public getEntities(): Entity<T>[] {
    if (this.sortCompare) {
      this._entities.sort(this.sortCompare);
    }
    return this._entities;
  }

  /**
   * Add an entity to the query, will only be added if the entity matches the query types
   * @param entity
   */
  public addEntity(entity: Entity<T>): void {
    if (!Util.contains(this._entities, entity) && this.matches(entity)) {
      this._entities.push(entity);
      this.notifyAll(new AddedEntity(entity));
    }
  }

  /**
   * If the entity is part of the query it will be removed regardless of types
   * @param entity
   */
  public removeEntity(entity: Entity<T>): void {
    if (Util.removeItemFromArray(entity, this._entities)) {
      this.notifyAll(new RemovedEntity(entity));
    }
  }

  /**
   * Removes all entities and observers from the query
   */
  public clear(): void {
    this._entities.length = 0;
    for (const observer of this.observers) {
      this.unregister(observer);
    }
  }

  /**
   * Returns whether the entity's types match query
   * @param entity
   */
  public matches(entity: Entity): boolean;
  /**
   * Returns whether the list of ComponentTypes match the query
   * @param types
   */
  public matches(types: string[]): boolean;
  public matches(typesOrEntity: string[] | Entity): boolean {
    let types: string[] = [];
    if (typesOrEntity instanceof Entity) {
      types = typesOrEntity.types;
    } else {
      types = typesOrEntity;
    }

    let matches = true;
    for (const type of this.types) {
      matches = matches && types.indexOf(type) > -1;
      if (!matches) {
        return false;
      }
    }
    return matches;
  }
}
