import { Scene } from '../Scene';
import { Logger } from '../Util/Log';
import { Component, ComponentCtor } from './Component';
import { Entity } from './Entity';
import { EntityManager } from './EntityManager';
import { Query } from './Query';
import { QueryManager } from './QueryManager';
import { System, SystemType } from './System';
import { SystemCtor, SystemManager, isSystemConstructor } from './SystemManager';
import { TagQuery } from './TagQuery';

/**
 * The World is a self-contained entity component system for a particular context.
 */
export class World {
  private _logger = Logger.getInstance();
  public queryManager: QueryManager = new QueryManager(this);
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
   */
  query<TKnownComponentCtors extends ComponentCtor<Component>>(requiredTypes: TKnownComponentCtors[]): Query<TKnownComponentCtors> {
    return this.queryManager.createQuery(requiredTypes);
  }

  queryTags<TKnownTags extends string>(requiredTags: TKnownTags[]): TagQuery<TKnownTags> {
    return this.queryManager.createTagQuery(requiredTags);
  }

  /**
   * Update systems by type and time elapsed in milliseconds
   */
  update(type: SystemType, elapsed: number) {
    if (type === SystemType.Update) {
      this.entityManager.updateEntities(this.scene, elapsed);
    }
    this.systemManager.updateSystems(type, this.scene, elapsed);
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
      return;
    }

    if (entityOrSystem instanceof System || isSystemConstructor(entityOrSystem)) {
      this.systemManager.addSystem(entityOrSystem);
      return;
    }

    this._logger.warn(
      `Could not add entity/system ${(entityOrSystem as any).constructor.name} to Excalibur!\n\n` +
        `If this looks like an Excalibur type, this can be caused by 2 versions of excalibur being included on the page.\n\n` +
        `Check your bundler settings to make sure this is not the case! Excalibur has ESM & UMD bundles be sure one 1 is loaded.`
    );
  }

  /**
   * Get a system out of the ECS world
   */
  get(system: SystemCtor<System>) {
    return this.systemManager.get(system);
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
      return;
    }

    if (entityOrSystem instanceof System) {
      this.systemManager.removeSystem(entityOrSystem);
      return;
    }

    this._logger.warn(
      `Could not remove entity/system ${(entityOrSystem as any).constructor.name} to Excalibur!\n\n` +
        `If this looks like an Excalibur type, this can be caused by 2 versions of excalibur being included on the page.\n\n` +
        `Check your bundler settings to make sure this is not the case! Excalibur has ESM & UMD bundles be sure one 1 is loaded.`
    );
  }

  get entities() {
    return this.entityManager.entities;
  }

  clearEntities(): void {
    this.entityManager.clear();
  }

  clearSystems(): void {
    this.systemManager.clear();
  }
}
