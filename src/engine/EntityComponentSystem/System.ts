import { Entity } from './Entity';
import { Message, Observer } from '../Util/Observable';
import { Component } from './Component';
import { Scene } from '../Scene';

/**
 * Enum that determines whether to run the system in the update or draw phase
 */
export enum SystemType {
  Update = 'update',
  Draw = 'draw'
}

export type SystemTypes<ComponentTypes> = ComponentTypes extends Component<infer TypeName> ? TypeName : never;

/**
 * An Excalibur [[System]] that updates entities of certain types.
 * Systems are scene specific
 *
 * Excalibur Systems currently require at least 1 Component type to operated
 *
 * Multiple types are declared as a type union
 * For example:
 *
 * ```typescript
 * class MySystem extends System<ComponentA | ComponentB> {
 *   public readonly types = ['a', 'b'] as const;
 *   public readonly systemType = SystemType.Update;
 *   public update(entities: Entity<ComponentA | ComponentB>) {
 *      ...
 *   }
 * }
 * ```
 */
export abstract class System<ComponentTypeUnion extends Component = Component, ContextType = Scene>
implements Observer<AddedEntity | RemovedEntity> {
  /**
   * The types of entities that this system operates on
   * For example ['transform', 'motion']
   */
  abstract readonly types: readonly SystemTypes<ComponentTypeUnion>[];

  /**
   * Determine whether the system is called in the [[SystemType.Update]] or the [[SystemType.Draw]] phase. Update is first, then Draw.
   */
  abstract readonly systemType: SystemType;

  /**
   * System can execute in priority order, by default all systems are priority 0. Lower values indicated higher priority.
   * For a system to execute before all other a lower priority value (-1 for example) must be set.
   * For a system to exectue after all other a higher priority value (10 for example) must be set.
   */
  public priority: number = 0;

  /**
   * Optionally specify a sort order for entities passed to the your system
   * @param a The left entity
   * @param b The right entity
   */
  sort?(a: Entity<ComponentTypeUnion>, b: Entity<ComponentTypeUnion>): number;

  /**
   * Optionally specify an initialize handler
   * @param scene
   */
  initialize?(engine: ContextType): void;

  /**
   * Update all entities that match this system's types
   * @param entities Entities to update that match this system's typse
   * @param delta Time in milliseconds
   */
  abstract update(entities: Entity<ComponentTypeUnion>[], delta: number): void;

  /**
   * Optionally run a preupdate before the system processes matching entities
   * @param engine
   * @param delta Time in milliseconds since the last frame
   */
  preupdate?(engine: ContextType, delta: number): void;

  /**
   * Optionally run a postupdate after the system processes matching entities
   * @param engine
   * @param delta Time in milliseconds since the last frame
   */
  postupdate?(engine: ContextType, delta: number): void;

  /**
   * Optionally run a debug draw step to visualize the internals of the system
   */
  debugDraw?(ctx: CanvasRenderingContext2D, delta: number): void;

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
 * type guard to check for the RemovedEntity message
 */
export function isRemoveSystemEntity(x: Message<Entity>): x is RemovedEntity {
  return !!x && x.type === 'Entity Removed';
}
