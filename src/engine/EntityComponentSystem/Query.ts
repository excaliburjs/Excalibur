import { ComponentType } from './ComponentTypes';
import { Entity } from './Entity';
import { buildEntityTypeKey } from './Util';
import { Observable } from '../Util/Observable';
import { Util, Component } from '..';
import { AddedEntity, RemovedEntity } from './System';

/**
 * Represents a type query that is cached and observable
 */
export class Query<T extends Component = Component> extends Observable<AddedEntity | RemovedEntity> {
  public entities: Entity<T>[] = [];
  public get key(): string {
    return buildEntityTypeKey(this.types);
  }

  public constructor(public types: ComponentType[]) {
    super();
  }

  /**
   * Entity belongs in query
   * @param entity
   */
  public addEntity(entity: Entity<T>): void {
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

  /**
   * Removes all entities and observers from the query
   */
  public clear(): void {
    this.entities.length = 0;
    for (const observer of this.observers) {
      this.unregister(observer);
    }
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
