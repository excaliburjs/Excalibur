import { Entity } from './Entity';
import { EntityManager } from './EntityManager';
import { QueryManager } from './QueryManager';
import { System, SystemType } from './System';
import { SystemManager } from './SystemManager';

/**
 * The World is a self-contained entity component system for a particular context.
 */
export class World<ContextType> {
  public queryManager: QueryManager = new QueryManager(this);
  public entityManager: EntityManager = new EntityManager(this);
  public systemManager: SystemManager<ContextType> = new SystemManager<ContextType>(this);

  /**
   * The context type is passed to the system updates
   * @param context
   */
  constructor(public context: ContextType) {}

  /**
   * Update systems by type and time elapsed in milliseconds
   */
  update(type: SystemType, delta: number) {
    this.systemManager.updateSystems(type, this.context, delta);
    this.entityManager.processComponentRemovals();
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
  add(system: System<any, ContextType>): void;
  add(entityOrSystem: Entity | System<any, ContextType>): void {
    if (entityOrSystem instanceof Entity) {
      this.entityManager.addEntity(entityOrSystem);
    }

    if (entityOrSystem instanceof System) {
      this.systemManager.addSystem(entityOrSystem);
    }
  }

  /**
   * Remove an entity from the ECS world
   * @param entity
   */
  remove(entity: Entity): void;
  /**
   * Remove a system from the ECS world
   * @param system
   */
  remove(system: System<any, ContextType>): void;
  remove(entityOrSystem: Entity | System<any, ContextType>): void {
    if (entityOrSystem instanceof Entity) {
      this.entityManager.removeEntity(entityOrSystem);
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
