import { Entity } from './Entity';
import { Engine } from '../Engine';
import { Message, Observer } from '../Util/Observable';
import { Component } from './Component';

export enum SystemType {
  Update = 'update',
  Draw = 'draw'
}

/**
 * An Excalibur [[System]] that updates entities of certain types.
 * Systems are scene specific
 */
export abstract class System<T extends Component = Component> implements Observer<AddedEntity | RemovedEntity> {
  /**
   * The types of entities that this system operates on
   */
  abstract readonly types: string[];

  abstract readonly systemType: SystemType;

  /**
   * System can execute in priority order, by default all systems are priority 0. Lower values indicated higher priority.
   * For a system to execute before all other a lower priority value (-1 for example) must be set.
   * For a system to exectue after all other a higher priority value (10 for example) must be set.
   */
  public priority: number = 0;

  /**
   * Update all entities that match this system's types
   * @param entities Entities to update that match this system's typse
   * @param delta Time in milliseconds
   */
  abstract update(entities: Entity<T>[], delta: number): void;

  /**
   * Optionally run a preupdate before the system processes matching entities
   * @param engine
   * @param delta Time in milliseconds since the last frame
   */
  preupdate?: (engine: Engine, delta: number) => void;

  /**
   * Optionally run a postupdate after the system processes matching entities
   * @param engine
   * @param delta Time in milliseconds since the last frame
   */
  postupdate?: (engine: Engine, delta: number) => void;

  /**
   * Optionally run a debug draw step to visualize the internals of the system
   */
  debugDraw?: (ctx: CanvasRenderingContext2D, delta: number) => void;

  /**
   * Systems observe when entities match their types or no longer match their types, override
   * @param _entityAddedOrRemoved
   */
  public notify(_entityAddedOrRemoved: AddedEntity | RemovedEntity) {
    // Override me
  }
}

/**
 * An [[Entity]] with [[Component]] types that matches a [[System]] types exists in the current scene.
 */
export class AddedEntity implements Message<Entity> {
  readonly type: 'Entity Added' = 'Entity Added';
  constructor(public data: Entity) {}
}

/**
 * Type guard to check for AddedEntity messages
 * @param x
 */
export function isAddedSystemEntity(x: Message<Entity>): x is AddedEntity {
  return !!x && x.type === 'Entity Added';
}

/**
 * An [[Entity]] with [[Component]] types that no longer matches a [[System]] types exists in the current scene.
 */
export class RemovedEntity implements Message<Entity> {
  readonly type: 'Entity Removed' = 'Entity Removed';
  constructor(public data: Entity) {}
}

/**
 *
 */
export function isRemoveSystemEntity(x: Message<Entity>): x is RemovedEntity {
  return !!x && x.type === 'Entity Removed';
}
