import { CollisionContact } from './CollisionContact';
import { CollisionType } from './CollisionType';
import { Body } from './Body';
import { Id } from '../Id';

/**
 * Models a potential collision between 2 bodies
 */
export class Pair {
  public id: string = null;

  constructor(public bodyA: Body, public bodyB: Body) {
    this.id = Pair.calculatePairHash(bodyA.id, bodyB.id);
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
    const bodyA = this.bodyA;
    const bodyB = this.bodyB;
    return Pair.canCollide(bodyA, bodyB);
  }

  /**
   * Runs the collision intersection logic on the members of this pair
   */
  public collide(): CollisionContact[] {
    return this.bodyA.collide(this.bodyB);
  }

  /**
   * Calculates the unique pair hash id for this collision pair (owning id)
   */
  public static calculatePairHash(idA: Id<'body'>, idB: Id<'body'>): string {
    if (idA.value < idB.value) {
      return `#${idA.value}+${idB.value}`;
    } else {
      return `#${idB.value}+${idA.value}`;
    }
  }
}
