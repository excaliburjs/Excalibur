import { ComponentType } from './ComponentTypes';
import { Entity, AddedComponent, RemovedComponent } from './Entity';
import { EntityManager } from './EntityManager';
import { buildEntityComponentKey } from './Util';
import { Observable } from '../Util/Observable';
import { Util } from '..';
import { AddedEntity, RemovedEntity } from './System';

/**
 * Represents a type query that is cached and observable
 */
export class Query extends Observable<AddedEntity | RemovedEntity> {
  public entities: Entity[] = [];
  public get key(): string {
    return buildEntityComponentKey(this.types);
  }

  public constructor(public types: ComponentType[]) {
    super();
  }

  /**
   * Entity belongs in query
   * @param entity
   */
  public addEntity(entity: Entity): void {
    if (!Util.contains(this.entities, entity)) {
      this.entities.push(entity);
      this.notifyAll(new AddedEntity(entity));
    }
  }

  public removeEntity(entity: Entity): void {
    if (Util.removeItemFromArray(entity, this.entities)) {
      this.notifyAll(new RemovedEntity(entity));
    }
  }

  public clear() {
    this.entities.length = 0;
  }

  /**
   * Entities types match query
   * @param entity
   */
  public matches(entity: Entity): boolean;
  public matches(types: ComponentType[]): boolean;
  public matches(typesOrEntity: ComponentType[] | Entity): boolean {
    let types: ComponentType[] = [];
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
