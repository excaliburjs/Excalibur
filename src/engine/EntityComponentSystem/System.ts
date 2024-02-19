import { Scene } from '../Scene';
import { SystemPriority } from './Priority';
import { World } from './World';

/**
 * Enum that determines whether to run the system in the update or draw phase
 */
export enum SystemType {
  Update = 'update',
  Draw = 'draw'
}

/**
 * An Excalibur [[System]] that updates entities of certain types.
 * Systems are scene specific
 *
 *
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
export abstract class System {

  /**
   * Determine whether the system is called in the [[SystemType.Update]] or the [[SystemType.Draw]] phase. Update is first, then Draw.
   */
  abstract readonly systemType: SystemType;

  /**
   * System can execute in priority order, by default all systems are priority 0. Lower values indicated higher priority.
   * For a system to execute before all other a lower priority value (-1 for example) must be set.
   * For a system to execute after all other a higher priority value (10 for example) must be set.
   */
  public priority: number = SystemPriority.Average;

  /**
   * Optionally specify an initialize handler
   * @param scene
   */
  initialize?(world: World, scene: Scene): void;

  /**
   * Update all entities that match this system's types
   * @param entities Entities to update that match this system's types
   * @param elapsedMs Time in milliseconds
   */
  abstract update(elapsedMs: number): void;

  /**
   * Optionally run a preupdate before the system processes matching entities
   * @param scene
   * @param elapsedMs Time in milliseconds since the last frame
   */
  preupdate?(scene: Scene, elapsedMs: number): void;

  /**
   * Optionally run a postupdate after the system processes matching entities
   * @param scene
   * @param elapsedMs Time in milliseconds since the last frame
   */
  postupdate?(scene: Scene, elapsedMs: number): void;
}
