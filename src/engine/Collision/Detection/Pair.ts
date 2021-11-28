import { CollisionContact } from './CollisionContact';
import { CollisionType } from '../CollisionType';
import { BodyComponent } from '../BodyComponent';
import { Id } from '../../Id';
import { Collider } from '../Colliders/Collider';

/**
 * Models a potential collision between 2 colliders
 */
export class Pair {
  public id: string = null;
  constructor(public colliderA: Collider, public colliderB: Collider) {
    this.id = Pair.calculatePairHash(colliderA.id, colliderB.id);
  }

  /**
   * Returns whether a it is allowed for 2 colliders in a Pair to collide
   * @param colliderA
   * @param colliderB
   */
  public static canCollide(colliderA: Collider, colliderB: Collider) {
    const bodyA = colliderA?.owner?.get(BodyComponent);
    const bodyB = colliderB?.owner?.get(BodyComponent);

    // Prevent self collision
    if (colliderA.id === colliderB.id) {
      return false;
    }

    // Colliders with the same owner do not collide (composite colliders)
    if (colliderA.owner &&
        colliderB.owner &&
        colliderA.owner.id === colliderB.owner.id) {
      return false;
    }

    // if the pair has a member with zero dimension don't collide
    if (colliderA.localBounds.hasZeroDimensions() || colliderB.localBounds.hasZeroDimensions()) {
      return false;
    }

    // Body's needed for collision in the current state
    // TODO can we collide without a body?
    if (!bodyA || !bodyB) {
      return false;
    }

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
    const colliderA = this.colliderA;
    const colliderB = this.colliderB;
    return Pair.canCollide(colliderA, colliderB);
  }

  /**
   * Runs the collision intersection logic on the members of this pair
   */
  public collide(): CollisionContact[] {
    return this.colliderA.collide(this.colliderB);
  }

  /**
   * Check if the collider is part of the pair
   * @param collider
   */
  public hasCollider(collider: Collider) {
    return collider === this.colliderA || collider === this.colliderB;
  }

  /**
   * Calculates the unique pair hash id for this collision pair (owning id)
   */
  public static calculatePairHash(idA: Id<'collider'>, idB: Id<'collider'>): string {
    if (idA.value < idB.value) {
      return `#${idA.value}+${idB.value}`;
    } else {
      return `#${idB.value}+${idA.value}`;
    }
  }
}
