import type { CollisionContact } from './collision-contact';
import { CollisionType } from '../collision-type';
import { BodyComponent } from '../body-component';
import type { Id } from '../../id';
import type { Collider } from '../colliders/collider';

/**
 * Models a potential collision between 2 colliders
 */
export class Pair {
  public id: string;
  constructor(
    public colliderA: Collider,
    public colliderB: Collider
  ) {
    this.id = Pair.calculatePairHash(colliderA.id, colliderB.id);
  }

  /**
   * Returns whether a it is allowed for 2 colliders in a Pair to collide
   * @param colliderA
   * @param colliderB
   */
  public static canCollide(colliderA: Collider, colliderB: Collider) {
    // Prevent self collision
    if (colliderA.id === colliderB.id) {
      return false;
    }

    // Colliders with the same owner do not collide (composite colliders)
    if (colliderA.owner && colliderB.owner && colliderA.owner.id === colliderB.owner.id) {
      return false;
    }

    // if the pair has a member with zero dimension don't collide
    if (colliderA.localBounds.hasZeroDimensions() || colliderB.localBounds.hasZeroDimensions()) {
      return false;
    }

    const bodyA = colliderA?.owner?.get(BodyComponent);
    const bodyB = colliderB?.owner?.get(BodyComponent);

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
    if (!bodyA.isActive || !bodyB.isActive) {
      return false;
    }

    // dormant pairs keep their last contact instead of being detected again
    if (Pair.isDormant(bodyA, bodyB)) {
      return false;
    }

    return true;
  }

  /**
   * A pair is dormant when neither body can move: both are asleep, or one is asleep against a
   * {@apilink CollisionType.Fixed} body. Dormant pairs need no collision detection, the collision system
   * carries their last contact over unchanged until one of them wakes.
   * @param bodyA
   * @param bodyB
   */
  public static isDormant(bodyA: BodyComponent | null | undefined, bodyB: BodyComponent | null | undefined): boolean {
    if (!bodyA || !bodyB) {
      return false;
    }
    const aSleeping = bodyA.isSleeping;
    const bSleeping = bodyB.isSleeping;
    if (aSleeping && bSleeping) {
      return true;
    }
    if (aSleeping && bodyB.collisionType === CollisionType.Fixed) {
      return true;
    }
    if (bSleeping && bodyA.collisionType === CollisionType.Fixed) {
      return true;
    }
    return false;
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
