import { Vector } from '../Algebra';
import { Collider } from './Collider';
import { Pair } from './Pair';

/**
 * Collision contacts are used internally by Excalibur to resolve collision between colliders. This
 * Pair prevents collisions from being evaluated more than one time
 */
export class CollisionContact {
  /**
   * Currently the ids between bodies
   */
  id: string;
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
   * The points of collision shared between colliderA and colliderB
   */
  points: Vector[];
  
  /**
   * The collision normal, pointing away from colliderA
   */
  normal: Vector;

  constructor(colliderA: Collider, colliderB: Collider, mtv: Vector, points: Vector[], normal: Vector) {
    this.colliderA = colliderA;
    this.colliderB = colliderB;
    this.mtv = mtv;
    this.points = points;
    this.normal = normal;
    this.id = Pair.calculatePairHash(colliderA.owningId, colliderB.owningId);
  }
}
