import { CollisionGroup } from '../Group/CollisionGroup';
import { RayCastHit } from './RayCastHit';

export interface RayCastOptions {
  /**
   * Optionally specify the maximum distance in pixels to ray cast, default is Infinity
   */
  maxDistance?: number;
  /**
   * Optionally specify a collision group to target in the ray cast, default is All.
   */
  collisionGroup?: CollisionGroup;
  /**
   * Optionally specify a collision mask to target multiple collision categories
   */
  collisionMask?: number;
  /**
   * Optionally search for all colliders that intersect the ray cast.
   *
   * Default false
   */
  searchAllColliders?: boolean;
  /**
   * Optionally ignore things with CollisionGroup.All and only test against things with an explicit group
   *
   * Default false
   */
  ignoreCollisionGroupAll?: boolean;

  /**
   * Optionally provide a any filter function to filter on arbitrary qualities of a ray cast hit
   *
   * Filters run after any collision mask/collision group filtering, it is the last decision
   *
   * Returning true means you want to include the collider in your results, false means exclude it
   */
  filter?: (hit: RayCastHit) => boolean;
}
