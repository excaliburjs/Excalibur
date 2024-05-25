import { Entity } from './Entity';
import { World } from './World';
import { removeItemFromArray } from '../Util/Util';
import { Scene } from '../Scene';

// Add/Remove entities and components

export class EntityManager {
  public entities: Entity[] = [];
  public _entityIndex: { [entityId: string]: Entity } = {};

  constructor(private _world: World) {}

  /**
   * Runs the entity lifecycle
   * @param scene
   * @param elapsed
   */
  public updateEntities(scene: Scene, elapsed: number) {
    for (let entityIndex = 0; entityIndex < this.entities.length; entityIndex++) {
      const entity = this.entities[entityIndex];
      entity.update(scene.engine, elapsed);
      if (!entity.active) {
        this.removeEntity(entity);
      }
    }
  }

  public findEntitiesForRemoval() {
    for (let entityIndex = 0; entityIndex < this.entities.length; entityIndex++) {
      const entity = this.entities[entityIndex];
      if (!entity.active) {
        this.removeEntity(entity);
      }
    }
  }

  /**
   * Adds an entity to be tracked by the EntityManager
   * @param entity
   */
  public addEntity(entity: Entity): void {
    entity.active = true;
    entity.scene = this._world.scene;
    if (entity && !this._entityIndex[entity.id]) {
      this._entityIndex[entity.id] = entity;
      this.entities.push(entity);
      this._world.queryManager.addEntity(entity);

      // if entity has children
      entity.children.forEach((c) => {
        c.scene = entity.scene;
        this.addEntity(c);
      });
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
      entity.active = false;
    }

    if (entity && deferred) {
      this._entitiesToRemove.push(entity);
      return;
    }

    delete this._entityIndex[id];
    if (entity) {
      entity.scene = null;
      removeItemFromArray(entity, this.entities);
      this._world.queryManager.removeEntity(entity);

      // if entity has children
      entity.children.forEach((c) => {
        c.scene = null;
        this.removeEntity(c, deferred);
      });
      entity.childrenAdded$.clear();
      entity.childrenRemoved$.clear();

      // stats
      if (this._world?.scene?.engine) {
        this._world.scene.engine.stats.currFrame.actors.killed++;
      }
    }
  }

  private _entitiesToRemove: Entity[] = [];
  public processEntityRemovals(): void {
    for (let entityIndex = 0; entityIndex < this._entitiesToRemove.length; entityIndex++) {
      const entity = this._entitiesToRemove[entityIndex];
      if (entity.active) {
        continue;
      }
      this.removeEntity(entity, false);
    }
    this._entitiesToRemove.length = 0;
  }

  public processComponentRemovals(): void {
    for (let entityIndex = 0; entityIndex < this.entities.length; entityIndex++) {
      const entity = this.entities[entityIndex];
      entity.processComponentRemoval();
    }
  }

  public getById(id: number): Entity {
    return this._entityIndex[id];
  }

  public getByName(name: string): Entity[] {
    return this.entities.filter((e) => e.name === name);
  }

  public clear(): void {
    for (let i = this.entities.length - 1; i >= 0; i--) {
      this.removeEntity(this.entities[i]);
    }
  }
}
