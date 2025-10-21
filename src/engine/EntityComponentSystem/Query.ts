import type { Entity } from './Entity';
import { Observable } from '../Util/Observable';
import type { Component, ComponentCtor } from '../EntityComponentSystem/Component';

export type ComponentInstance<T> = T extends ComponentCtor<infer R> ? R : never;

/**
 * Turns `Entity<A | B>` into `Entity<A> | Entity<B>`
 */
export type DistributeEntity<T> = T extends infer U extends Component ? Entity<U> : never;

export interface QueryParams<
  TKnownComponentCtors extends ComponentCtor<Component> = never,
  TAnyComponentCtors extends ComponentCtor<Component> = never
> {
  components?: {
    all?: TKnownComponentCtors[];
    any?: TAnyComponentCtors[];
    not?: ComponentCtor<Component>[];
  };
  tags?: {
    all?: string[];
    any?: string[];
    not?: string[];
  };
}

export type QueryEntity<
  TAllComponentCtors extends ComponentCtor<Component> = never,
  TAnyComponentCtors extends ComponentCtor<Component> = never
> = [TAnyComponentCtors] extends [never] // (trick to exclude `never` explicitly)
  ? Entity<ComponentInstance<TAllComponentCtors>>
  : Entity<ComponentInstance<TAllComponentCtors>> | DistributeEntity<ComponentInstance<TAnyComponentCtors>>;

/**
 * Represents query for entities that match a list of types that is cached and observable
 *
 * Queries can be strongly typed by supplying a type union in the optional type parameter
 * ```typescript
 * const queryAB = new ex.Query<ComponentTypeA | ComponentTypeB>(['A', 'B']);
 * ```
 */
export class Query<
  TAllComponentCtors extends ComponentCtor<Component> = never,
  TAnyComponentCtors extends ComponentCtor<Component> = never
> {
  public readonly id: string;

  private _entities: QueryEntity<TAllComponentCtors, TAnyComponentCtors>[] = [];
  public get entities() {
    if (this._dirty) {
      this._entities = Array.from(this.entitiesSet);
      this._dirty = false;
    }
    return this._entities;
  }

  public entitiesSet: Set<QueryEntity<TAllComponentCtors, TAnyComponentCtors>> = new Set();

  /**
   * This fires right after the component or tag is added
   */
  public entityAdded$ = new Observable<QueryEntity<TAllComponentCtors, TAnyComponentCtors>>();
  /**
   * This fires right before the component or tag is actually removed from the entity, it will still be available for cleanup purposes
   */
  public entityRemoved$ = new Observable<QueryEntity<TAllComponentCtors, TAnyComponentCtors>>();

  public readonly filter = {
    components: {
      all: new Set<TAllComponentCtors>(),
      any: new Set<TAnyComponentCtors>(),
      not: new Set<ComponentCtor<Component>>()
    },
    tags: {
      all: new Set<string>(),
      any: new Set<string>(),
      not: new Set<string>()
    }
  };
  private _dirty: boolean = false;

  constructor(params: TAllComponentCtors[] | QueryParams<TAllComponentCtors, TAnyComponentCtors>) {
    if (Array.isArray(params)) {
      params = { components: { all: params } } as QueryParams<TAllComponentCtors, TAnyComponentCtors>;
    }

    this.filter.components.all = new Set(params.components?.all ?? []);
    this.filter.components.any = new Set(params.components?.any ?? []);
    this.filter.components.not = new Set(params.components?.not ?? []);
    this.filter.tags.all = new Set(params.tags?.all ?? []);
    this.filter.tags.any = new Set(params.tags?.any ?? []);
    this.filter.tags.not = new Set(params.tags?.not ?? []);

    this.id = Query.createId(params);
  }

  static createId(params: Function[] | QueryParams<any, any>) {
    // TODO what happens if a user defines the same type name as a built in type
    // ! TODO this could be dangerous depending on the bundler's settings for names
    // Maybe some kind of hash function is better here?
    if (Array.isArray(params)) {
      params = { components: { all: params } } as QueryParams<any, any>;
    }

    const anyComponents = params.components?.any ? `any_${Query.hashComponents(new Set(params.components?.any))}` : '';
    const allComponents = params.components?.all ? `all_${Query.hashComponents(new Set(params.components?.all))}` : '';
    const notComponents = params.components?.not ? `not_${Query.hashComponents(new Set(params.components?.not))}` : '';

    const anyTags = params.tags?.any ? `any_${Query.hashTags(new Set(params.tags?.any))}` : '';
    const allTags = params.tags?.all ? `all_${Query.hashTags(new Set(params.tags?.all))}` : '';
    const notTags = params.tags?.not ? `not_${Query.hashTags(new Set(params.tags?.not))}` : '';

    return [anyComponents, allComponents, notComponents, anyTags, allTags, notTags].filter(Boolean).join('-');
  }

  static hashTags(set: Set<string>) {
    return Array.from(set)
      .map((t) => `t_${t}`)
      .sort()
      .join('-');
  }

  static hashComponents(set: Set<ComponentCtor<Component>>) {
    return Array.from(set)
      .map((c) => `c_${c.name}`)
      .sort()
      .join('-');
  }

  matchesNotFilter(entity: Entity): boolean {
    for (const component of this.filter.components.not) {
      // if (entity._componentsToRemove.includes(component)) continue;
      if (entity.has(component)) {
        return true;
      }
    }

    // check if entity has none of the tags
    for (const tag of this.filter.tags.not) {
      if (entity.hasTag(tag)) {
        return true;
      }
    }
    return false;
  }

  matches(entity: Entity): boolean {
    // Components & Tags

    // IMPORTANT: Check NOT conditions first, all exclusions first

    // check if entity has none of the components
    for (const component of this.filter.components.not) {
      // if (entity._componentsToRemove.includes(component)) continue;
      if (entity.has(component)) {
        return false;
      }
    }

    // check if entity has none of the tags
    for (const tag of this.filter.tags.not) {
      if (entity.hasTag(tag)) {
        return false;
      }
    }

    // check if entity has all components
    for (const component of this.filter.components.all) {
      // if (entity._componentsToRemove.includes(component)) continue;
      if (!entity.has(component)) {
        return false;
      }
    }

    // check if entity has all tags
    for (const tag of this.filter.tags.all) {
      if (!entity.hasTag(tag)) {
        return false;
      }
    }

    // check if entity has any components
    if (this.filter.components.any.size > 0) {
      let found = false;
      for (const component of this.filter.components.any) {
        if (entity.has(component)) {
          found = true;
          break;
        }
      }

      if (!found) {
        return false;
      }
    }

    // check if entity has any tags
    if (this.filter.tags.any.size > 0) {
      let found = false;
      for (const tag of this.filter.tags.any) {
        if (entity.hasTag(tag)) {
          found = true;
          break;
        }
      }

      if (!found) {
        return false;
      }
    }

    return true;
  }

  /**
   * Potentially adds or removes an entity from a query index, returns true if added, false if not added or was removed.
   * @param entity
   */
  checkAndModify(entity: Entity): boolean {
    const inCurrentQuery = this.entitiesSet.has(entity);

    if (inCurrentQuery && this.matchesNotFilter(entity)) {
      this.removeEntity(entity);
      return false;
    }

    const matches = this.matches(entity);

    if (inCurrentQuery && !matches) {
      this.removeEntity(entity);
      return false;
    }

    if (!inCurrentQuery && matches) {
      this._dirty = true;
      this.entitiesSet.add(entity);
      this.entityAdded$.notifyAll(entity);
      return true;
    }

    return false;
  }

  removeEntity(entity: Entity) {
    const removed = this.entitiesSet.delete(entity);
    if (removed) {
      this._dirty = true;
      this.entityRemoved$.notifyAll(entity);
    }
  }

  /**
   * Returns a list of entities that match the query
   * @param sort Optional sorting function to sort entities returned from the query
   */
  public getEntities(sort?: (a: Entity, b: Entity) => number): QueryEntity<TAllComponentCtors, TAnyComponentCtors>[] {
    if (sort) {
      this.entities.sort(sort);
    }
    return this.entities as QueryEntity<TAllComponentCtors, TAnyComponentCtors>[];
  }
}
