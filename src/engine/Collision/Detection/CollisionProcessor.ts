import { FrameStats } from '../../Debug';
import { Pair } from './Pair';
import { Collider } from '../Colliders/Collider';
import { CollisionContact } from './CollisionContact';
import { RayCastOptions } from './RayCastOptions';
import { Ray } from '../../Math/ray';
import { RayCastHit } from './RayCastHit';
import { ExcaliburGraphicsContext } from '../../Graphics/Context/ExcaliburGraphicsContext';
import { BoundingBox } from '../BoundingBox';
import { Vector } from '../../Math/vector';

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
