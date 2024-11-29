import { Observable } from '../Util/Observable';
import { Entity } from './Entity';

export class TagQuery<TKnownTags extends string = never> {
  public readonly id: string;
  public tags = new Set<TKnownTags>();
  public entities: Entity<any>[] = [];
  /**
   * This fires right after the component is added
   */
  public entityAdded$ = new Observable<Entity<any>>();
  /**
   * This fires right before the component is actually removed from the entity, it will still be available for cleanup purposes
   */
  public entityRemoved$ = new Observable<Entity<any>>();

  constructor(public readonly requiredTags: TKnownTags[]) {
    if (requiredTags.length === 0) {
      throw new Error('Cannot create tag query without tags');
    }
    for (const tag of requiredTags) {
      this.tags.add(tag);
    }

    this.id = TagQuery.createId(requiredTags);
  }

  static createId(requiredComponents: string[]) {
    return requiredComponents.slice().sort().join('-');
  }

  checkAndAdd(entity: Entity) {
    if (!this.entities.includes(entity) && entity.hasAllTags(Array.from(this.tags))) {
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
  public getEntities(sort?: (a: Entity, b: Entity) => number): Entity<any>[] {
    if (sort) {
      this.entities.sort(sort);
    }
    return this.entities;
  }
}
