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

  public entities: QueryEntity<TAllComponentCtors, TAnyComponentCtors>[] = [];

  /**
   * This fires right after the component is added
   */
  public entityAdded$ = new Observable<QueryEntity<TAllComponentCtors, TAnyComponentCtors>>();
  /**
   * This fires right before the component is actually removed from the entity, it will still be available for cleanup purposes
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

  matches(entity: Entity): boolean {
    // Components
    // check if entity has all components
    for (const component of this.filter.components.all) {
      if (!entity.has(component)) {
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

    // check if entity has none of the components
    for (const component of this.filter.components.not) {
      if (entity.has(component)) {
        return false;
      }
    }

    // Tags
    // check if entity has all tags
    for (const tag of this.filter.tags.all) {
      if (!entity.hasTag(tag)) {
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

    // check if entity has none of the tags
    for (const tag of this.filter.tags.not) {
      if (entity.hasTag(tag)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Potentially adds an entity to a query index, returns true if added, false if not
   * @param entity
   */
  checkAndAdd(entity: Entity) {
    if (this.matches(entity) && !this.entities.includes(entity)) {
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
  public getEntities(sort?: (a: Entity, b: Entity) => number): QueryEntity<TAllComponentCtors, TAnyComponentCtors>[] {
    if (sort) {
      this.entities.sort(sort);
    }
    return this.entities as QueryEntity<TAllComponentCtors, TAnyComponentCtors>[];
  }
}
