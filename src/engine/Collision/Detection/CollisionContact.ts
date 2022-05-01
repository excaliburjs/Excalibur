import { Vector } from '../../Math/vector';
import { Physics } from '../Physics';
import { Collider } from '../Colliders/Collider';
import { CollisionType } from '../CollisionType';
import { Pair } from './Pair';
import { SeparationInfo } from '../Colliders/SeparatingAxis';
import { BodyComponent } from '../BodyComponent';

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

  constructor(
    colliderA: Collider,
    colliderB: Collider,
    mtv: Vector,
    normal: Vector,
    tangent: Vector,
    points: Vector[],
    localPoints: Vector[],
    info: SeparationInfo
  ) {
    this.colliderA = colliderA;
    this.colliderB = colliderB;
    this.mtv = mtv;
    this.normal = normal;
    this.tangent = tangent;
    this.points = points;
    this.localPoints = localPoints;
    this.info = info;
    this.id = Pair.calculatePairHash(colliderA.id, colliderB.id);
    if (colliderA.__compositeColliderId || colliderB.__compositeColliderId) {
      // Add on the parent composite pair for start/end contact
      this.id += '|' + Pair.calculatePairHash(
        colliderA.__compositeColliderId ?? colliderA.id,
        colliderB.__compositeColliderId ?? colliderB.id);
    }
  }

  /**
   * Match contact awake state, except if body's are Fixed
   */
  public matchAwake(): void {
    const bodyA = this.colliderA.owner.get(BodyComponent);
    const bodyB = this.colliderB.owner.get(BodyComponent);
    if (bodyA && bodyB) {
      if (bodyA.sleeping !== bodyB.sleeping) {
        if (bodyA.sleeping && bodyA.collisionType !== CollisionType.Fixed && bodyB.sleepMotion >= Physics.wakeThreshold) {
          bodyA.setSleeping(false);
        }
        if (bodyB.sleeping && bodyB.collisionType !== CollisionType.Fixed && bodyA.sleepMotion >= Physics.wakeThreshold) {
          bodyB.setSleeping(false);
        }
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
