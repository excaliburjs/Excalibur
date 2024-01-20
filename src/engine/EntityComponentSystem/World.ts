import { Scene } from '../Scene';
import { Component, ComponentCtor } from './Component';
import { Entity } from './Entity';
import { EntityManager } from './EntityManager';
import { Query } from './Query';
import { QueryManager } from './QueryManager';
import { System, SystemType } from './System';
import { SystemCtor, SystemManager, isSystemConstructor } from './SystemManager';

/**
 * The World is a self-contained entity component system for a particular context.
 */
export class World {
  public queryManager: QueryManager = new QueryManager();
  public entityManager: EntityManager = new EntityManager(this);
  public systemManager: SystemManager = new SystemManager(this);

  /**
   * The context type is passed to the system updates
   * @param scene
   */
  constructor(public scene: Scene) {}

  /**
   * Query the ECS world for entities that match your components
   * @param requiredTypes 
   * @returns 
   */
  query<TKnownComponentCtors extends ComponentCtor<Component>>(requiredTypes: TKnownComponentCtors[]): Query<TKnownComponentCtors> {
    return this.queryManager.createQuery(requiredTypes);
  }

  /**
   * Update systems by type and time elapsed in milliseconds
   */
  update(type: SystemType, delta: number) {
    if (type === SystemType.Update) {
      this.entityManager.updateEntities(this.scene, delta);
    }
    this.systemManager.updateSystems(type, this.scene, delta);
    this.entityManager.findEntitiesForRemoval();
    this.entityManager.processComponentRemovals();
    this.entityManager.processEntityRemovals();
  }

  /**
   * Add an entity to the ECS world
   * @param entity
   */
  add(entity: Entity): void;
  /**
   * Add a system to the ECS world
   * @param system
   */
  add(system: System): void;
  add(system: SystemCtor<System>): void;
  add(entityOrSystem: Entity | System | SystemCtor<System>): void {
    if (entityOrSystem instanceof Entity) {
      this.entityManager.addEntity(entityOrSystem);
    }

    if (entityOrSystem instanceof System || isSystemConstructor(entityOrSystem)) {
      this.systemManager.addSystem(entityOrSystem);
    }
  }

  /**
   * Remove an entity from the ECS world
   * @param entity
   */
  remove(entity: Entity, deferred?: boolean): void;
  /**
   * Remove a system from the ECS world
   * @param system
   */
  remove(system: System): void;
  remove(entityOrSystem: Entity | System, deferred = true): void {
    if (entityOrSystem instanceof Entity) {
      this.entityManager.removeEntity(entityOrSystem, deferred);
    }

    if (entityOrSystem instanceof System) {
      this.systemManager.removeSystem(entityOrSystem);
    }
  }

  clearEntities(): void {
    this.entityManager.clear();
  }

  clearSystems(): void {
    this.systemManager.clear();
  }
}
