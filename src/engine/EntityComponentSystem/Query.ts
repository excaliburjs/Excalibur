import { Entity } from './Entity';
import { buildTypeKey } from './Util';
import { Observable } from '../Util/Observable';
import { Util, Component, ComponentCtor } from '..';
import { AddedEntity, RemovedEntity } from './System';

/**
 * Represents query for entities that match a list of types that is cached and observable
 *
 * Queries can be strongly typed by supplying a type union in the optional type parameter
 * ```typescript
 * const queryAB = new ex.Query<ComponentTypeA | ComponentTypeB>(['A', 'B']);
 * ```
 */
export class Query<T extends Component = Component> extends Observable<AddedEntity | RemovedEntity> {
  public types: readonly string[];
  private _entities: Entity[] = [];
  private _key: string;
  public get key(): string {
    if (this._key) {
      return this._key;
    }
    return (this._key = buildTypeKey(this.types));
  }

  constructor(types: readonly string[]);
  constructor(types: readonly ComponentCtor<T>[]);
  constructor(types: readonly string[] | readonly ComponentCtor<T>[]) {
    super();
    if (types[0] instanceof Function) {
      this.types = (types as ComponentCtor<T>[]).map(T =>  (new T).type);
    } else {
      this.types = types as string[];
    }
  }

  /**
   * Returns a list of entities that match the query
   *
   * @param sort Optional sorting function to sort entities returned from the query
   */
  public getEntities(sort?: (a: Entity, b: Entity) => number): Entity[] {
    if (sort) {
      this._entities.sort(sort);
    }
    return this._entities;
  }

  /**
   * Add an entity to the query, will only be added if the entity matches the query types
   * @param entity
   */
  public addEntity(entity: Entity): void {
    if (!Util.contains(this._entities, entity) && this.matches(entity)) {
      this._entities.push(entity);
      this.notifyAll(new AddedEntity(entity));
    }
  }

  /**
   * If the entity is part of the query it will be removed regardless of types
   * @param entity
   */
  public removeEntity(entity: Entity): void {
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
   * Returns whether the list of ComponentTypes have at least the same types as the query
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

  public contain(type: string) {
    return this.types.indexOf(type) > -1;
  }
}
