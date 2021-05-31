import { PostCollisionEvent, PreCollisionEvent } from '../../Events';
import { CollisionContact } from '../Detection/CollisionContact';
import { CollisionType } from '../CollisionType';
import { Side } from '../Side';
import { CollisionSolver } from './Solver';

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
      if (colliderA.owner.collisionType === CollisionType.Passive || colliderB.owner.collisionType === CollisionType.Passive) {
        continue;
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
      let mtv = contact.mtv;
      const colliderA = contact.colliderA;
      const colliderB = contact.colliderB;

      if (colliderA.owner.collisionType === CollisionType.Passive || colliderB.owner.collisionType === CollisionType.Passive) {
        continue;
      }
      
      if (colliderA.owner.collisionType === CollisionType.Active && colliderB.owner.collisionType === CollisionType.Active) {
        // split overlaps if both are Active
        mtv = mtv.scale(0.5);
      }

      // Resolve overlaps
      if (colliderA.owner.collisionType === CollisionType.Active) {
        colliderA.owner.pos.x -= mtv.x;
        colliderA.owner.pos.y -= mtv.y;
      }

      if (colliderB.owner.collisionType === CollisionType.Active) {
        colliderB.owner.pos.x += mtv.x;
        colliderB.owner.pos.y += mtv.y;
      }
    }
  }

  public solveVelocity(contacts: CollisionContact[]) {
    for (const contact of contacts) {
      const colliderA = contact.colliderA;
      const colliderB = contact.colliderB;

      if (colliderA.owner.collisionType === CollisionType.Passive || colliderB.owner.collisionType === CollisionType.Passive) {
        continue;
      }

      const normal = contact.normal;
      const opposite = normal.negate();

      // Cancel out velocity opposite direction of collision normal
      if (colliderA.owner.collisionType === CollisionType.Active) {
        const velAdj = normal.scale(normal.dot(colliderA.owner.vel.negate()));
        colliderA.owner.vel = colliderA.owner.vel.add(velAdj);
      }

      if (colliderB.owner.collisionType === CollisionType.Active) {
        const velAdj = opposite.scale(opposite.dot(colliderB.owner.vel.negate()));
        colliderB.owner.vel = colliderB.owner.vel.add(velAdj);
      }
    }
  }
}
