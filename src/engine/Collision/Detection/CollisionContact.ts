import { Vector } from '../../Algebra';
import { Physics } from '../../Physics';
import { Collider } from '../Collider';
import { CollisionType } from '../CollisionType';
import { Circle } from '../Shapes/Circle';
import { Pair } from './Pair';

/**
 * Collision contacts are used internally by Excalibur to resolve collision between colliders. This
 * Pair prevents collisions from being evaluated more than one time
 */
export class CollisionContact {
  /**
   * Currently the ids between colliders
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

  /**
   * The collision tangent
   */
  tangent: Vector;

  constructor(colliderA: Collider, colliderB: Collider, mtv: Vector, points: Vector[], normal: Vector) {
    this.colliderA = colliderA;
    this.colliderB = colliderB;
    this.mtv = mtv;
    this.points = points;
    this.normal = normal;
    this.id = Pair.calculatePairHash(colliderA.owningId, colliderB.owningId);
  }

  /**
   * Match contact awake state, except if body's are Fixed
   */
  public matchAwake() {
    if (this.colliderA.owner.sleeping !== this.colliderB.owner.sleeping) {
      if (
        this.colliderA.owner.sleeping &&
        this.colliderA.owner.collisionType !== CollisionType.Fixed &&
        this.colliderB.owner.sleepmotion >= Physics.wakeThreshold
      ) {
        this.colliderA.owner.setSleeping(false);
      }
      if (
        this.colliderB.owner.sleeping &&
        this.colliderB.owner.collisionType !== CollisionType.Fixed &&
        this.colliderA.owner.sleepmotion >= Physics.wakeThreshold
      ) {
        this.colliderB.owner.setSleeping(false);
      }
    }
  }

  /**
   * Returns a negative value if there is overlap
   */
  public getSeparation(): number {
    if (this.colliderA.shape instanceof Circle && this.colliderB.shape instanceof Circle) {
      const combinedRadius = this.colliderA.shape.radius + this.colliderB.shape.radius;
      const distance = this.colliderA.owner.pos.distance(this.colliderB.owner.pos);
      const separation = combinedRadius - distance;
      return -separation;
    }
    // TODO inefficient if we had more collision info it'd be better to adjust the contact features we care about
    this.colliderA.update(this.colliderA.owner.transform);
    this.colliderB.update(this.colliderB.owner.transform);
    return this.colliderA.getClosestLineBetween(this.colliderB).getLength();
  }
}
