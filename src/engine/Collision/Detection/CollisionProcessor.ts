import { FrameStats } from '../../Debug';
import { Pair } from './Pair';
import { Collider } from '../Colliders/Collider';
import { CollisionContact } from './CollisionContact';
import { RayCastOptions } from './RayCastOptions';
import { Ray } from '../../Math/ray';
import { RayCastHit } from './RayCastHit';
import { ExcaliburGraphicsContext } from '../../Graphics/Context/ExcaliburGraphicsContext';

/**
 * Definition for collision processor
 *
 * Collision processors are responsible for tracking colliders and identifying contacts between them
 */
export interface CollisionProcessor {
  /**
   *
   */
  rayCast(ray: Ray, options?: RayCastOptions): RayCastHit[];

  /**
   * Get all tracked colliders
   */
  getColliders(): readonly Collider[];

  /**
   * Track collider in collision processor
   */
  track(target: Collider): void;

  /**
   * Untrack collider in collision processor
   */
  untrack(target: Collider): void;

  /**
   * Detect potential collision pairs given a list of colliders
   */
  broadphase(targets: Collider[], delta: number, stats?: FrameStats): Pair[];

  /**
   * Identify actual collisions from those pairs, and calculate collision impulse
   */
  narrowphase(pairs: Pair[], stats?: FrameStats): CollisionContact[];

  /**
   * Update the internal structures to track colliders
   */
  update(targets: Collider[], delta: number): number;

  /**
   * Draw any debug information
   */
  debug(ex: ExcaliburGraphicsContext, delta: number): void;
}
