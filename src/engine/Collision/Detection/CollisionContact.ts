import { Vector } from '../../Algebra';
import { Physics } from '../Physics';
import { Collider } from '../Shapes/Collider';
import { CollisionType } from '../CollisionType';
import { Pair } from './Pair';
import { SeparationInfo } from '../Shapes/SeparatingAxis';
import { createId } from '../../Id';

/**
 * Collision contacts are used internally by Excalibur to resolve collision between colliders. This
 * Pair prevents collisions from being evaluated more than one time
 */
export class CollisionContact {
  private _canceled = false;

  /**
   * Currently the ids between colliders
   */
  readonly id: string;

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
    // TODO should we use body? or is collider id better
    this.id = Pair.calculatePairHash(colliderA.owningId ?? createId("body", 0), colliderB.owningId ?? createId("body", 0));
  }

  /**
   * Match contact awake state, except if body's are Fixed
   */
  public matchAwake(): void {
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

  public isCanceled() {
    return this._canceled;
  }

  public cancel(): void {
    this._canceled = true;
  }
}
