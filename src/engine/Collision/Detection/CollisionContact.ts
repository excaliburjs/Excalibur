import { Vector } from '../../Algebra';
import { Physics } from '../Physics';
import { Collider } from '../Shapes/Collider';
import { CollisionType } from '../CollisionType';
import { Pair } from './Pair';
import { SeparationInfo } from '../Shapes/SeparatingAxis';

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
   * The minimum translation vector to resolve overlap, pointing away from colliderA
   */
  mtv: Vector;

  /**
   * World space contact points between colliderA and colliderB
   */
  points: Vector[];

  /**
   * Local space contact points between colliderA and colliderB
   */
  localPoints: Vector[];

  /**
   * The collision normal, pointing away from colliderA
   */
  normal: Vector;

  /**
   * The collision tangent
   */
  tangent: Vector;

  /**
   * Information about the specifics of the collision contact separation
   */
  info: SeparationInfo;

  constructor(colliderA: Collider, colliderB: Collider, mtv: Vector, normal: Vector, tangent: Vector, points: Vector[], localPoints: Vector[], info: SeparationInfo) {
    this.colliderA = colliderA;
    this.colliderB = colliderB;
    this.mtv = mtv;
    this.normal = normal;
    this.tangent = tangent;
    this.points = points;
    this.localPoints = localPoints;
    this.info = info;
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
        this.colliderB.owner.sleepMotion >= Physics.wakeThreshold
      ) {
        this.colliderA.owner.setSleeping(false);
      }
      if (
        this.colliderB.owner.sleeping &&
        this.colliderB.owner.collisionType !== CollisionType.Fixed &&
        this.colliderA.owner.sleepMotion >= Physics.wakeThreshold
      ) {
        this.colliderB.owner.setSleeping(false);
      }
    }
  }
}
