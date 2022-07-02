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
export class ArcadeSolver implements CollisionSolver {
  directionMap = new Map<string, string>();
  distanceMap = new Map<string, number>();

  public solve(contacts: CollisionContact[]): CollisionContact[] {
    // Events and init
    this.preSolve(contacts);

    // Remove any canceled contacts
    contacts = contacts.filter(c => !c.isCanceled());

    // Sort contacts by distance to avoid artifacts with seams
    // It's important to solve in a specific order
    contacts.sort((a, b) => {
      const aDist = this.distanceMap.get(a.id);
      const bDist = this.distanceMap.get(b.id);
      return aDist - bDist;
    });

    for (const contact of contacts) {
      // Solve position first in arcade
      this.solvePosition(contact);

      // Solve velocity second in arcade
      this.solveVelocity(contact);
    }

    // Events and any contact house-keeping the solver needs
    this.postSolve(contacts);

    return contacts;
  }

  public preSolve(contacts: CollisionContact[]) {

    for (const contact of contacts) {
      const side = Side.fromDirection(contact.mtv);
      const mtv = contact.mtv.negate();

      const distance = contact.colliderA.worldPos.squareDistance(contact.colliderB.worldPos);
      this.distanceMap.set(contact.id, distance);

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
      if (contact.isCanceled()) {
        continue;
      }
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

  public solvePosition(contact: CollisionContact) {
    const epsilon = .0001;
    // if bounds no longer intersect skip to the next
    // this removes jitter from overlapping/stacked solid tiles or a wall of solid tiles
    if (!contact.colliderA.bounds.overlaps(contact.colliderB.bounds, epsilon)) {
      // Cancel the contact to prevent and solving
      contact.cancel();
      return;
    }

    if (Math.abs(contact.mtv.x) < epsilon && Math.abs(contact.mtv.y) < epsilon) {
      // Cancel near 0 mtv collisions
      contact.cancel();
      return;
    }

    let mtv = contact.mtv;
    const colliderA = contact.colliderA;
    const colliderB = contact.colliderB;
    const bodyA = colliderA.owner?.get(BodyComponent);
    const bodyB = colliderB.owner?.get(BodyComponent);
    if (bodyA && bodyB) {
      if (bodyA.collisionType === CollisionType.Passive || bodyB.collisionType === CollisionType.Passive) {
        return;
      }

      if (bodyA.collisionType === CollisionType.Active && bodyB.collisionType === CollisionType.Active) {
        // split overlaps if both are Active
        mtv = mtv.scale(0.5);
      }

      // Resolve overlaps
      if (bodyA.collisionType === CollisionType.Active) {
        bodyA.globalPos.x -= mtv.x;
        bodyA.globalPos.y -= mtv.y;
        colliderA.update(bodyA.transform.get());
      }

      if (bodyB.collisionType === CollisionType.Active) {
        bodyB.globalPos.x += mtv.x;
        bodyB.globalPos.y += mtv.y;
        colliderB.update(bodyB.transform.get());
      }
    }
  }


  public solveVelocity(contact: CollisionContact) {
    if (contact.isCanceled()) {
      return;
    }

    const colliderA = contact.colliderA;
    const colliderB = contact.colliderB;
    const bodyA = colliderA.owner?.get(BodyComponent);
    const bodyB = colliderB.owner?.get(BodyComponent);

    if (bodyA && bodyB) {

      if (bodyA.collisionType === CollisionType.Passive || bodyB.collisionType === CollisionType.Passive) {
        return;
      }

      const normal = contact.normal;
      const opposite = normal.negate();

      if (bodyA.collisionType === CollisionType.Active) {
        // only adjust velocity if the contact normal is opposite to the current velocity
        // this avoids catching edges on a platform when sliding off
        if (bodyA.vel.normalize().dot(opposite) < 0) {
          // Cancel out velocity opposite direction of collision normal
          const velAdj = normal.scale(normal.dot(bodyA.vel.negate()));
          bodyA.vel = bodyA.vel.add(velAdj);
        }
      }

      if (bodyB.collisionType === CollisionType.Active) {
        // only adjust velocity if the contact normal is opposite to the current velocity
        // this avoids catching edges on a platform
        if (bodyB.vel.normalize().dot(normal) < 0) {
          const velAdj = opposite.scale(opposite.dot(bodyB.vel.negate()));
          bodyB.vel = bodyB.vel.add(velAdj);
        }
      }
    }
  }
}
