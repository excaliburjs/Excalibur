import { Entity } from './Entity';
import { Observable } from '../Util/Observable';
import { Component, ComponentCtor } from '../EntityComponentSystem/Component';

export type ComponentInstance<T> = T extends ComponentCtor<infer R> ? R : never;

/**
 * Represents query for entities that match a list of types that is cached and observable
 *
 * Queries can be strongly typed by supplying a type union in the optional type parameter
 * ```typescript
 * const queryAB = new ex.Query<ComponentTypeA | ComponentTypeB>(['A', 'B']);
 * ```
 */
export class Query<TKnownComponentCtors extends ComponentCtor<Component> = never> {
  public readonly id: string;
  public components = new Set<TKnownComponentCtors>();
  public entities: Entity<ComponentInstance<TKnownComponentCtors>>[] = [];
  public entityAdded$ = new Observable<Entity<ComponentInstance<TKnownComponentCtors>>>();
  public entityRemoved$ = new Observable<Entity<ComponentInstance<TKnownComponentCtors>>>(); // TODO is this accurate with deferred removal?

  constructor(public readonly requiredComponents: TKnownComponentCtors[]) {
    for (const type of requiredComponents) {
      this.components.add(type);
    }
    // TODO what happens if a user defines the same type name as a built in type
    // ! TODO this could be dangerous depending on the bundler's settings for names
    // Maybe some kind of hash function is better here?
    this.id = requiredComponents.slice().map(c => c.name).sort().join('-');
  }

  /**
   * Potentially adds an entity to a query index, returns true if added, false if not
   * @param entity
   */
  checkAndAdd(entity: Entity) {
    if (!this.entities.includes(entity) && entity.hasAll(Array.from(this.components))) {
      this.entities.push(entity);
      this.entityAdded$.notifyAll(entity);
      return true;
    }
    return false;
  }

  removeEntity(entity: Entity) {
    const index = this.entities.indexOf(entity);
    if (index > -1) {
      this.entities.splice(index, 1);
      this.entityRemoved$.notifyAll(entity);
    }
  }

  /**
   * Returns a list of entities that match the query
   * @param sort Optional sorting function to sort entities returned from the query
   */
  public getEntities(sort?: (a: Entity, b: Entity) => number): Entity<ComponentInstance<TKnownComponentCtors>>[] {
    if (sort) {
      this.entities.sort(sort);
    }
    return this.entities;
  }
}