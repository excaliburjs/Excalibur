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
 * An Excalibur {@apilink System} that updates entities of certain types.
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
 * class MySystem extends System {
 *   static priority = SystemPriority.Lowest;
 *   public readonly systemType = SystemType.Update;
 *   public query: Query<typeof TransformComponent>;
 *   constructor(public world: World) {
 *   super();
 *      this.query = this.world.query([TransformComponent]);
 *   }
 *   public update(elapsed: number) {
 *      ...
 *   }
 * }
 * ```
 */
export abstract class System {
  /**
   * Determine whether the system is called in the {@apilink SystemType.Update} or the {@apilink SystemType.Draw} phase. Update is first, then Draw.
   */
  abstract readonly systemType: SystemType;

  /**
   * System can execute in priority order, by default all systems are priority 0. Lower values indicated higher priority.
   * For a system to execute before all other a lower priority value (-1 for example) must be set.
   * For a system to execute after all other a higher priority value (10 for example) must be set.
   */
  public static priority: number = SystemPriority.Average;

  /**
   * Optionally specify an initialize handler
   * @param scene
   */
  initialize?(world: World, scene: Scene): void;

  /**
   * Update all entities that match this system's types
   * @param elapsed Time in milliseconds
   */
  abstract update(elapsed: number): void;

  /**
   * Optionally run a preupdate before the system processes matching entities
   * @param scene
   * @param elapsed Time in milliseconds since the last frame
   */
  preupdate?(scene: Scene, elapsed: number): void;

  /**
   * Optionally run a postupdate after the system processes matching entities
   * @param scene
   * @param elapsed Time in milliseconds since the last frame
   */
  postupdate?(scene: Scene, elapsed: number): void;
}
