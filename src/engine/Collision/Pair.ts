import { CollisionContact } from './CollisionContact';
import { CollisionType } from './CollisionType';
import { Body } from './Body';

/**
 * Models a potential collision between 2 colliders
 */
export class Pair {
  public id: string = null;

  constructor(public bodyA: Body, public bodyB: Body) {
    this.id = Pair.calculatePairHash(bodyA, bodyB);
  }

  public static canCollide(bodyA: Body, bodyB: Body) {
    // If both are in the same collision group short circuit
    if (!bodyA.group.canCollide(bodyB.group)) {
      return false;
    }

    // if both are fixed short circuit
    if (bodyA.collisionType === CollisionType.Fixed && bodyB.collisionType === CollisionType.Fixed) {
      return false;
    }

    // if the either is prevent collision short circuit
    if (bodyB.collisionType === CollisionType.PreventCollision || bodyA.collisionType === CollisionType.PreventCollision) {
      return false;
    }

    // if either is dead short circuit
    if (!bodyA.active || !bodyB.active) {
      return false;
    }

    return true;
  }

  /**
   * Returns whether or not it is possible for the pairs to collide
   */
  public get canCollide(): boolean {
    const actorA = this.bodyA;
    const actorB = this.bodyB;
    return Pair.canCollide(actorA, actorB);
  }

  /**
   * Runs the collision intersection logic on the members of this pair
   */
  public collide(): CollisionContact[] {
    return this.bodyA.collide(this.bodyB);
  }

  /**
   * Calculates the unique pair hash id for this collision pair
   */
  public static calculatePairHash(bodyA: Body, bodyB: Body): string {
    if (bodyA.id < bodyB.id) {
      return `#${bodyA.id}+${bodyB.id}`;
    } else {
      return `#${bodyB.id}+${bodyA.id}`;
    }
  }
}
