import { CollisionPostSolveEvent, CollisionPreSolveEvent, PostCollisionEvent, PreCollisionEvent } from '../../Events';
import { clamp } from '../../Util/Util';
import { CollisionContact } from '../Detection/CollisionContact';
import { CollisionType } from '../CollisionType';
import { ContactConstraintPoint } from './ContactConstraintPoint';
import { Side } from '../Side';
import { Physics } from '../Physics';
import { Line, Vector } from '../../Algebra';
import { Circle } from '../Shapes/Circle';
import { ConvexPolygon } from '../Shapes/ConvexPolygon';
import { CollisionSolver } from './Solver';

export class RealisticSolver extends CollisionSolver {
  lastFrameContacts: Map<string, CollisionContact> = new Map();

  // map contact id to contact points
  idToContactConstraint: Map<string, ContactConstraintPoint[]> = new Map();

  getContactConstraints(id: string) {
    return this.idToContactConstraint.get(id) ?? [];
  }

  preSolve(contacts: CollisionContact[]) {
    for (const contact of contacts) {
      // Publish collision events on both participants
      const side = Side.fromDirection(contact.mtv);
      contact.colliderA.events.emit('precollision', new PreCollisionEvent(contact.colliderA, contact.colliderB, side, contact.mtv));
      contact.colliderA.events.emit(
        'beforecollisionresolve',
        new CollisionPreSolveEvent(contact.colliderA, contact.colliderB, side, contact.mtv, contact) as any
      );
      contact.colliderB.events.emit(
        'precollision',
        new PreCollisionEvent(contact.colliderB, contact.colliderA, Side.getOpposite(side), contact.mtv.negate())
      );
      contact.colliderB.events.emit(
        'beforecollisionresolve',
        new CollisionPreSolveEvent(contact.colliderB, contact.colliderA, Side.getOpposite(side), contact.mtv.negate(), contact) as any
      );

      // Match awake state for sleeping
      contact.matchAwake();
    }

    // Keep track of contacts that done
    const finishedContactIds = Array.from(this.idToContactConstraint.keys());
    for (const contact of contacts) {
      // Remove all current contacts that are not done
      const index = finishedContactIds.indexOf(contact.id);
      if (index > -1) {
        finishedContactIds.splice(index, 1);
      }
      const contactPoints = this.idToContactConstraint.get(contact.id) ?? [];

      let pointIndex = 0;
      for (const point of contact.points) {
        const bodyA = contact.colliderA.owner;
        const bodyB = contact.colliderB.owner;
        const normal = contact.normal;
        const tangent = contact.tangent;

        const aToContact = point.sub(bodyA.pos);
        const bToContact = point.sub(bodyB.pos);

        const aToContactNormal = aToContact.cross(normal);
        const bToContactNormal = bToContact.cross(normal);

        const normalMass =
          bodyA.inverseMass +
          bodyB.inverseMass +
          bodyA.inverseInertia * aToContactNormal * aToContactNormal +
          bodyB.inverseInertia * bToContactNormal * bToContactNormal;

        const aToContactTangent = aToContact.cross(tangent);
        const bToContactTangent = bToContact.cross(tangent);

        const tangentMass =
          bodyA.inverseMass +
          bodyB.inverseMass +
          bodyA.inverseInertia * aToContactTangent * aToContactTangent +
          bodyB.inverseInertia * bToContactTangent * bToContactTangent;

        // Preserve normal/tangent impulse by re-using the contact point if it's close
        if (contactPoints[pointIndex] && contactPoints[pointIndex]?.point?.squareDistance(point) < 4) {
          contactPoints[pointIndex].point = point;
          contactPoints[pointIndex].local = contact.localPoints[pointIndex];
        } else {
          // new contact if it's not close or doesn't exist
          contactPoints[pointIndex] = new ContactConstraintPoint(point, contact.localPoints[pointIndex], contact);
        }

        // Update contact point calculations
        contactPoints[pointIndex].aToContact = aToContact;
        contactPoints[pointIndex].bToContact = bToContact;
        contactPoints[pointIndex].normalMass = normalMass;
        contactPoints[pointIndex].tangentMass = tangentMass;

        pointIndex++;
      }
      this.idToContactConstraint.set(contact.id, contactPoints);
    }

    // Clean up any contacts that did not occur last frame
    for (const id of finishedContactIds) {
      this.idToContactConstraint.delete(id);
    }

    // Warm contacts with accumulated impulse
    // Useful for tall stacks
    if (Physics.warmStart) {
      this.warmStart(contacts);
    } else {
      for (const contact of contacts) {
        const contactPoints = this.getContactConstraints(contact.id);
        for (const point of contactPoints) {
          point.normalImpulse = 0;
          point.tangentImpulse = 0;
        }
      }
    }
  }

  postSolve(contacts: CollisionContact[]) {
    for (const contact of contacts) {
      const bodyA = contact.colliderA.owner;
      const bodyB = contact.colliderB.owner;

      // Skip post solve for active+passive collisions
      if (bodyA.collisionType === CollisionType.Passive || bodyB.collisionType === CollisionType.Passive) {
        continue;
      }

      // Update motion values for sleeping
      bodyA.updateMotion();
      bodyB.updateMotion();

      // Publish collision events on both participants
      const side = Side.fromDirection(contact.mtv);
      contact.colliderA.events.emit('postcollision', new PostCollisionEvent(contact.colliderA, contact.colliderB, side, contact.mtv));
      contact.colliderA.events.emit(
        'aftercollisionresolve',
        new CollisionPostSolveEvent(contact.colliderA, contact.colliderB, side, contact.mtv, contact) as any
      );
      contact.colliderB.events.emit(
        'postcollision',
        new PostCollisionEvent(contact.colliderB, contact.colliderA, Side.getOpposite(side), contact.mtv.negate())
      );
      contact.colliderB.events.emit(
        'aftercollisionresolve',
        new CollisionPostSolveEvent(contact.colliderB, contact.colliderA, Side.getOpposite(side), contact.mtv.negate(), contact) as any
      );
    }

    // Store contacts
    this.lastFrameContacts.clear();
    for (const c of contacts) {
      this.lastFrameContacts.set(c.id, c);
    }
  }

  /**
   * Warm up body's based on previous frame contact points
   * @param contacts
   */
  warmStart(contacts: CollisionContact[]) {
    for (const contact of contacts) {
      const bodyA = contact.colliderA.owner;
      const bodyB = contact.colliderB.owner;
      const contactPoints = this.idToContactConstraint.get(contact.id) ?? [];
      for (const point of contactPoints) {
        if (Physics.warmStart) {
          const normalImpulse = contact.normal.scale(point.normalImpulse);
          const tangentImpulse = contact.tangent.scale(point.tangentImpulse);
          const impulse = normalImpulse.add(tangentImpulse);

          bodyA.applyImpulse(point.point, impulse.negate());
          bodyB.applyImpulse(point.point, impulse);
        } else {
          point.normalImpulse = 0;
          point.tangentImpulse = 0;
        }
      }
    }
  }

  private _getSeparation(contact: CollisionContact, point: Vector) {
    const shapeA = contact.colliderA;
    const bodyA = contact.colliderA.owner;
    const shapeB = contact.colliderB;
    const bodyB = contact.colliderB.owner;
    if (shapeA instanceof Circle && shapeB instanceof Circle) {
      const combinedRadius = shapeA.radius + shapeB.radius;
      const distance = bodyA.transform.pos.distance(bodyB.transform.pos);
      const separation = combinedRadius - distance;
      return -separation;
    }

    if (shapeA instanceof Circle && shapeB instanceof Line) {
      // TODO circle line separation
      // return bodyB.getSeparation(bodyA);
    }

    if (shapeA instanceof Line && shapeB instanceof Circle) {
      // TODO circle line separation
      // return bodyA.getSeparation(bodyB);
    }

    if (shapeA instanceof ConvexPolygon && shapeB instanceof ConvexPolygon) {
      if (contact.info.localSide) {
        let side: Line;
        let worldPoint: Vector;
        if (contact.info.collider === shapeA) {
          side = new Line(bodyA.transform.apply(contact.info.localSide.begin), bodyA.transform.apply(contact.info.localSide.end));
          worldPoint = bodyB.transform.apply(point);
        } else {
          side = new Line(bodyB.transform.apply(contact.info.localSide.begin), bodyB.transform.apply(contact.info.localSide.end));
          worldPoint = bodyA.transform.apply(point);
        }

        return side.distanceToPoint(worldPoint, true);
      }
    }

    if (shapeA instanceof ConvexPolygon && shapeB instanceof Circle ||
        shapeB instanceof ConvexPolygon && shapeA instanceof Circle) {
      if (contact.info.side) {
        return contact.info.side.distanceToPoint(bodyA.transform.apply(point), true);
      }
    }

    return 0;
  }

  /**
   * Iteratively solve the position overlap constraint
   * @param contacts
   */
  solvePosition(contacts: CollisionContact[]) {
    for (let i = 0; i < Physics.positionIterations; i++) {
      for (const contact of contacts) {
        const bodyA = contact.colliderA.owner;
        const bodyB = contact.colliderB.owner;

        // Skip solving active+passive
        if (bodyA.collisionType === CollisionType.Passive || bodyB.collisionType === CollisionType.Passive) {
          continue;
        }

        const constraints = this.idToContactConstraint.get(contact.id) ?? [];
        for (const point of constraints) {
          const normal = contact.normal;
          const separation = this._getSeparation(contact, point.local);

          const steeringConstant = Physics.steeringFactor; //0.2;
          const maxCorrection = -5;
          const slop = Physics.slop; //1;

          // Clamp to avoid over-correction
          // Remember that we are shooting for 0 overlap in the end
          const steeringForce = clamp(steeringConstant * (separation + slop), maxCorrection, 0);
          const impulse = normal.scale(-steeringForce / point.normalMass);

          // This is a pseudo impulse, meaning we aren't doing a real impulse calculation
          // We adjust position and rotation instead of doing the velocity
          if (bodyA.collisionType === CollisionType.Active) {
            bodyA.pos = bodyA.pos.add(impulse.negate().scale(bodyA.inverseMass));
            bodyA.rotation -= point.aToContact.cross(impulse) * bodyA.inverseInertia;
          }

          if (bodyB.collisionType === CollisionType.Active) {
            bodyB.pos = bodyB.pos.add(impulse.scale(bodyB.inverseMass));
            bodyB.rotation += point.bToContact.cross(impulse) * bodyB.inverseInertia;
          }
        }
      }
    }
  }

  solveVelocity(contacts: CollisionContact[]) {
    for (let i = 0; i < Physics.velocityIterations; i++) {
      for (const contact of contacts) {
        const bodyA = contact.colliderA.owner;
        const bodyB = contact.colliderB.owner;

        // Skip solving active+passive
        if (bodyA.collisionType === CollisionType.Passive || bodyB.collisionType === CollisionType.Passive) {
          continue;
        }

        const restitution = bodyA.bounciness * bodyB.bounciness;
        const friction = Math.min(bodyA.friction, bodyB.friction);

        const constraints = this.idToContactConstraint.get(contact.id) ?? [];

        for (const point of constraints) {
          const relativeVelocity = point.getRelativeVelocity();

          // Negate velocity in tangent direction to simulate friction
          const tangentVelocity = -relativeVelocity.dot(contact.tangent);
          let impulseDelta = tangentVelocity / point.tangentMass;

          // Clamping based in Erin Catto's GDC 2006 talk
          // Correct clamping https://github.com/erincatto/box2d-lite/blob/master/docs/GDC2006_Catto_Erin_PhysicsTutorial.pdf
          // Accumulated fiction impulse is always between -uMaxFriction < dT < uMaxFriction
          // But deltas can vary
          const maxFriction = friction * point.normalImpulse;
          const newImpulse = clamp(point.tangentImpulse + impulseDelta, -maxFriction, maxFriction);
          impulseDelta = newImpulse - point.tangentImpulse;
          point.tangentImpulse = newImpulse;

          const impulse = contact.tangent.scale(impulseDelta);
          bodyA.applyImpulse(point.point, impulse.negate());
          bodyB.applyImpulse(point.point, impulse);
        }

        for (const point of constraints) {
          // Need to recalc relative velocity because the previous step could have changed vel
          const relativeVelocity = point.getRelativeVelocity();

          // Compute impulse in normal direction
          const normalVelocity = relativeVelocity.dot(contact.normal);
          // See https://en.wikipedia.org/wiki/Collision_response
          let impulseDelta = (-(1 + restitution) * normalVelocity) / point.normalMass;

          // Clamping based in Erin Catto's GDC 2014 talk
          // Accumulated impulse stored in the contact is always positive (dV > 0)
          // But deltas can be negative
          const newImpulse = Math.max(point.normalImpulse + impulseDelta, 0);
          impulseDelta = newImpulse - point.normalImpulse;
          point.normalImpulse = newImpulse;

          const impulse = contact.normal.scale(impulseDelta);
          bodyA.applyImpulse(point.point, impulse.negate());
          bodyB.applyImpulse(point.point, impulse);
        }
      }
    }
  }
}
