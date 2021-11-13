import { PostCollisionEvent, PreCollisionEvent } from '../../Events';
import { CollisionContact } from '../Detection/CollisionContact';
import { CollisionType } from '../CollisionType';
import { Side } from '../Side';
import { CollisionSolver } from './Solver';
import { BodyComponent } from '../BodyComponent';

/**
 * ArcadeSolver is the default in Excalibur. It solves collisions so that there is no overlap between contacts,
 * and negates velocity along the collision normal.
 *
 * This is usually the type of collisions used for 2D games that don't need a more realistic collision simulation.
 *
 */
export class ArcadeSolver extends CollisionSolver {
  public preSolve(contacts: CollisionContact[]) {
    for (const contact of contacts) {
      const side = Side.fromDirection(contact.mtv);
      const mtv = contact.mtv.negate();
      // Publish collision events on both participants
      contact.colliderA.events.emit('precollision', new PreCollisionEvent(contact.colliderA, contact.colliderB, side, mtv));
      contact.colliderB.events.emit(
        'precollision',
        new PreCollisionEvent(contact.colliderB, contact.colliderA, Side.getOpposite(side), mtv.negate())
      );
    }
  }

  public postSolve(contacts: CollisionContact[]) {
    for (const contact of contacts) {
      const colliderA = contact.colliderA;
      const colliderB = contact.colliderB;
      const bodyA = colliderA.owner?.get(BodyComponent);
      const bodyB = colliderB.owner?.get(BodyComponent);
      if (bodyA && bodyB) {
        if (bodyA.collisionType === CollisionType.Passive || bodyB.collisionType === CollisionType.Passive) {
          continue;
        }
      }
      const side = Side.fromDirection(contact.mtv);
      const mtv = contact.mtv.negate();
      // Publish collision events on both participants
      contact.colliderA.events.emit('postcollision', new PostCollisionEvent(contact.colliderA, contact.colliderB, side, mtv));
      contact.colliderB.events.emit(
        'postcollision',
        new PostCollisionEvent(contact.colliderB, contact.colliderA, Side.getOpposite(side), mtv.negate())
      );
    }
  }

  public solvePosition(contacts: CollisionContact[]) {
    for (const contact of contacts) {
      // if bounds no longer interesect skip to the next
      // this removes jitter from overlapping/stacked solid tiles or a wall of solid tiles
      if (!contact.colliderA.bounds.intersect(contact.colliderB.bounds)) {
        continue;
      }
      let mtv = contact.mtv;
      const colliderA = contact.colliderA;
      const colliderB = contact.colliderB;
      const bodyA = colliderA.owner?.get(BodyComponent);
      const bodyB = colliderB.owner?.get(BodyComponent);
      if (bodyA && bodyB) {
        if (bodyA.collisionType === CollisionType.Passive || bodyB.collisionType === CollisionType.Passive) {
          continue;
        }

        if (bodyA.collisionType === CollisionType.Active && bodyB.collisionType === CollisionType.Active) {
          // split overlaps if both are Active
          mtv = mtv.scale(0.5);
        }

        // Resolve overlaps
        if (bodyA.collisionType === CollisionType.Active) {
          bodyA.pos.x -= mtv.x;
          bodyA.pos.y -= mtv.y;
        }

        if (bodyB.collisionType === CollisionType.Active) {
          bodyB.pos.x += mtv.x;
          bodyB.pos.y += mtv.y;
        }
      }
    }
  }

  public solveVelocity(contacts: CollisionContact[]) {
    for (const contact of contacts) {
      const colliderA = contact.colliderA;
      const colliderB = contact.colliderB;
      const bodyA = colliderA.owner?.get(BodyComponent);
      const bodyB = colliderB.owner?.get(BodyComponent);

      if (bodyA && bodyB) {

        if (bodyA.collisionType === CollisionType.Passive || bodyB.collisionType === CollisionType.Passive) {
          continue;
        }

        const normal = contact.normal;
        const opposite = normal.negate();

        // Cancel out velocity opposite direction of collision normal
        if (bodyA.collisionType === CollisionType.Active) {
          const velAdj = normal.scale(normal.dot(bodyA.vel.negate()));
          bodyA.vel = bodyA.vel.add(velAdj);
        }

        if (bodyB.collisionType === CollisionType.Active) {
          const velAdj = opposite.scale(opposite.dot(bodyB.vel.negate()));
          bodyB.vel = bodyB.vel.add(velAdj);
        }
      }
    }
  }
}
