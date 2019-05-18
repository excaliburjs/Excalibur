import { Physics } from './../Physics';
import { Color } from './../Drawing/Color';
import { CollisionContact } from './CollisionContact';
import { CollisionResolutionStrategy } from '../Physics';
import * as DrawUtil from '../Util/DrawUtil';
import { CollisionType } from './CollisionType';
import { Collider } from './Collider';

/**
 * Models a potential collision between 2 bodies
 */
export class Pair {
  public id: string = null;
  public collision: CollisionContact = null;

  constructor(public colliderA: Collider, public colliderB: Collider) {
    this.id = Pair.calculatePairHash(colliderA, colliderB);
  }

  public static canCollide(colliderA: Collider, colliderB: Collider) {
    // If both are in the same collision group short circuit
    if (!colliderA.collisionGroup.canCollide(colliderB.collisionGroup)) {
      return false;
    }

    // if both are fixed short circuit
    if (colliderA.type === CollisionType.Fixed && colliderB.type === CollisionType.Fixed) {
      return false;
    }

    // if the either is prevent collision short circuit
    if (colliderB.type === CollisionType.PreventCollision || colliderA.type === CollisionType.PreventCollision) {
      return false;
    }

    // if either is dead short circuit
    if (!colliderA.active || !colliderB.active) {
      return false;
    }

    return true;
  }

  /**
   * Returns whether or not it is possible for the pairs to collide
   */
  public get canCollide(): boolean {
    const actorA = this.colliderA;
    const actorB = this.colliderB;
    return Pair.canCollide(actorA, actorB);
  }

  /**
   * Runs the collison intersection logic on the members of this pair
   */
  public collide() {
    this.collision = this.colliderA.collide(this.colliderB);
  }

  /**
   * Resovles the collision body position and velocity if a collision occured
   */
  public resolve(strategy: CollisionResolutionStrategy) {
    if (this.collision) {
      this.collision.resolve(strategy);
    }
  }

  /**
   * Calculates the unique pair hash id for this collision pair
   */
  public static calculatePairHash(colliderA: Collider, colliderB: Collider): string {
    if (colliderA.id < colliderB.id) {
      return `#${colliderA.id}+${colliderB.id}`;
    } else {
      return `#${colliderB.id}+${colliderA.id}`;
    }
  }

  /* istanbul ignore next */
  public debugDraw(ctx: CanvasRenderingContext2D) {
    if (this.collision) {
      if (Physics.showContacts) {
        DrawUtil.point(ctx, Color.Red, this.collision.point);
      }
      if (Physics.showCollisionNormals) {
        DrawUtil.vector(ctx, Color.Cyan, this.collision.point, this.collision.normal, 30);
      }
    }
  }
}
