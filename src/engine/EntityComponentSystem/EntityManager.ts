import { Entity, RemovedComponent, AddedComponent, isAddedComponent, isRemovedComponent } from './Entity';
import { Component } from './Component';
import { Observer } from '../Util/Observable';
import { ComponentType } from './ComponentTypes';
import { System, AddedEntity, RemovedEntity } from './System';
import { Util } from '..';
import { QueryManager } from './QueryManager';

const getName = (obj: any) => obj.constructor.name;

// Add/Remove entitys and components

export class EntityManager implements Observer<RemovedComponent | AddedComponent> {
  public entities: Entity[] = [];
  public _entityIndex: { [entityId: string]: Entity } = {};

  constructor(private _queryManager: QueryManager) {}

  notify(message: RemovedComponent | AddedComponent): void {
    if (isAddedComponent(message)) {
      this._queryManager.addComponent(message.data.entity, message.data.component);
    }

    if (isRemovedComponent(message)) {
      this._queryManager.removeComponent(message.data.entity, message.data.component);
    }
  }

  public addEntity(entity: Entity): void {
    if (entity) {
      this._entityIndex[entity.id] = entity;
      this._queryManager.addEntity(entity);
      entity.changes.register(this);
    }
  }

  public removeEntity(id: number) {
    const entity = this._entityIndex[id];
    delete this._entityIndex[id];
    if (entity) {
      this._queryManager.removeEntity(entity);
      entity.changes.unregister(this);
    }
  }

  public queryById(id: number): Entity {
    return this._entityIndex[id];
  }
}
