import { ComponentType } from './ComponentTypes';
import { Entity } from './Entity';
import { Engine } from '../Engine';
import { Message, Observer } from '../Util/Observable';

/**
 * An Excalibur [[System]] that updates entities of certain types.
 * Systems are scene specific
 */
export abstract class System implements Observer<AddedEntity | RemovedEntity> {
  /**
   * The types of entities that this system operates on
   */
  readonly types: ComponentType[];

  /**
   * Update all entities that match this system's types
   * @param entities Entities to update that match this system's typse
   * @param delta Time in milliseconds
   */
  abstract update(entities: Entity[], delta: number): void;

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

  public notify(addedOrRemoved: AddedEntity | RemovedEntity) {
    // pass
  }
}

/**
 * An [[Entity]] with [[Component]] types that matches a [[System]] types exists in the current scene.
 */
export class AddedEntity implements Message<Entity> {
  readonly type: 'Entity Added' = 'Entity Added';
  constructor(public data: Entity) {}
}

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

export function isRemoveSystemEntity(x: Message<Entity>): x is RemovedEntity {
  return !!x && x.type === 'Entity Removed';
}
