import { Vector } from '../Algebra';
import { Collider } from './Collider';

/**
 * Collision contacts are used internally by Excalibur to resolve collision between colliders. This
 * Pair prevents collisions from being evaluated more than one time
 */
export class CollisionContact {
  /**
   * The first collider in the collision
   */
  colliderA: Collider;
  /**
   * The second collider in the collision
   */
  colliderB: Collider;
  /**
   * The minimum translation vector to resolve penetration, pointing away from colliderA
   */
  mtv: Vector;
  /**
   * The point of collision shared between colliderA and colliderB
   */
  point: Vector;
  /**
   * The collision normal, pointing away from colliderA
   */
  normal: Vector;

  constructor(colliderA: Collider, colliderB: Collider, mtv: Vector, point: Vector, normal: Vector) {
    this.colliderA = colliderA;
    this.colliderB = colliderB;
    this.mtv = mtv;
    this.point = point;
    this.normal = normal;
  }
}
