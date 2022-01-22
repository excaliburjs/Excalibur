import { Entity, RemovedComponent, AddedComponent, isAddedComponent, isRemovedComponent } from './Entity';
import { Observer } from '../Util/Observable';
import { World } from './World';
import { Util } from '..';

// Add/Remove entities and components

export class EntityManager<ContextType = any> implements Observer<RemovedComponent | AddedComponent> {
  public entities: Entity[] = [];
  public _entityIndex: { [entityId: string]: Entity } = {};

  constructor(private _world: World<ContextType>) {}

  /**
   * Runs the entity lifecycle
   * @param _context
   */
  public updateEntities(_context: ContextType, elapsed: number) {
    for (const entity of this.entities) {
      // TODO is this right?
      entity.update((_context as any).engine, elapsed);
      if (!entity.active) {
        this.removeEntity(entity);
      }
    }
  }

  public findEntitiesForRemoval() {
    for (const entity of this.entities) {
      if (!entity.active) {
        this.removeEntity(entity);
      }
    }
  }

  /**
   * EntityManager observes changes on entities
   * @param message
   */
  public notify(message: RemovedComponent | AddedComponent): void {
    if (isAddedComponent(message)) {
      // we don't need the component, it's already on the entity
      this._world.queryManager.addEntity(message.data.entity);
    }

    if (isRemovedComponent(message)) {
      this._world.queryManager.removeComponent(message.data.entity, message.data.component);
    }
  }

  /**
   * Adds an entity to be tracked by the EntityManager
   * @param entity
   */
  public addEntity(entity: Entity): void {
    entity.active = true;
    if (entity && !this._entityIndex[entity.id]) {
      this._entityIndex[entity.id] = entity;
      this.entities.push(entity);
      this._world.queryManager.addEntity(entity);
      entity.componentAdded$.register(this);
      entity.componentRemoved$.register(this);

      // if entity has children
      entity.children.forEach((c) => this.addEntity(c));
      entity.childrenAdded$.register({
        notify: (e) => {
          this.addEntity(e);
        }
      });
      entity.childrenRemoved$.register({
        notify: (e) => {
          this.removeEntity(e, false);
        }
      });
    }
  }

  public removeEntity(entity: Entity, deferred?: boolean): void;
  public removeEntity(id: number, deferred?: boolean): void;
  public removeEntity(idOrEntity: number | Entity, deferred = true): void {
    let id = 0;
    if (idOrEntity instanceof Entity) {
      id = idOrEntity.id;
    } else {
      id = idOrEntity;
    }
    const entity = this._entityIndex[id];
    if (entity && entity.active) {
      entity.kill();
    }

    if (entity && deferred) {
      this._entitiesToRemove.push(entity);
      return;
    }

    delete this._entityIndex[id];
    if (entity) {
      Util.removeItemFromArray(entity, this.entities);
      this._world.queryManager.removeEntity(entity);
      entity.componentAdded$.unregister(this);
      entity.componentRemoved$.unregister(this);

      // if entity has children
      entity.children.forEach((c) => this.removeEntity(c, deferred));
      entity.childrenAdded$.clear();
      entity.childrenRemoved$.clear();

      // stats
      if ((this._world.context as any)?.engine) {
        (this._world.context as any).engine.stats.currFrame.actors.killed++;
      }
    }
  }

  private _entitiesToRemove: Entity[] = [];
  public processEntityRemovals(): void {
    for (const entity of this._entitiesToRemove) {
      if (entity.active) {
        continue;
      }
      this.removeEntity(entity, false);
    }
  }

  public processComponentRemovals(): void {
    for (const entity of this.entities) {
      entity.processComponentRemoval();
    }
  }

  public getById(id: number): Entity {
    return this._entityIndex[id];
  }

  public getByName(name: string): Entity[]{
    return this.entities.filter(e => e.name === name);
  }

  public clear(): void {
    for (const entity of this.entities) {
      this.removeEntity(entity);
    }
  }
}
