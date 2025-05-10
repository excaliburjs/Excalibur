import type { FrameStats } from '../../Debug';
import type { Pair } from './Pair';
import type { Collider } from '../Colliders/Collider';
import type { CollisionContact } from './CollisionContact';
import type { RayCastOptions } from './RayCastOptions';
import type { Ray } from '../../Math/ray';
import type { RayCastHit } from './RayCastHit';
import type { ExcaliburGraphicsContext } from '../../Graphics/Context/ExcaliburGraphicsContext';
import type { BoundingBox } from '../BoundingBox';
import type { Vector } from '../../Math/vector';

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
   * Query the collision processor for colliders that contain the point
   * @param point
   */
  query(point: Vector): Collider[];

  /**
   * Query the collision processor for colliders that overlap with the bounds
   * @param bounds
   */
  query(bounds: BoundingBox): Collider[];

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
  broadphase(targets: Collider[], elapsed: number, stats?: FrameStats): Pair[];

  /**
   * Identify actual collisions from those pairs, and calculate collision impulse
   */
  narrowphase(pairs: Pair[], stats?: FrameStats): CollisionContact[];

  /**
   * Update the internal structures to track colliders
   */
  update(targets: Collider[], elapsed: number): number;

  /**
   * Draw any debug information
   */
  debug(ex: ExcaliburGraphicsContext, elapsed: number): void;
}
