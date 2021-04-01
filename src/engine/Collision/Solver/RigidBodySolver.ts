import { AfterCollisionResolveEvent, BeforeCollisionResolveEvent, PostCollisionEvent, PreCollisionEvent } from "../../Events";
import { clamp } from "../../Util/Util";
import { CollisionContact } from "../Detection/CollisionContact";
import { CollisionType } from "../CollisionType";
import { ContactPoint } from "./ContactPoint";
import { Side } from "../Side";

export class RigidBodySolver {
  lastFrameContacts: Map<string, CollisionContact> = new Map();

  // map contact id to contact points
  idToContactPoints: Map<string, ContactPoint[]> = new Map();

  getContactPoints(id: string) {
      return this.idToContactPoints.get(id) ?? [];
  }

  preSolve(contacts: CollisionContact[]) {
    for (const contact of contacts) {
      // Publish collision events on both participants
      const side = Side.fromDirection(contact.mtv);
      contact.colliderA.events.emit('precollision', new PreCollisionEvent(contact.colliderA, contact.colliderB, side, contact.mtv));
      contact.colliderA.events.emit('beforecollisionresolve', new BeforeCollisionResolveEvent(
        contact.colliderA, contact.colliderB, side, contact.mtv, contact) as any);
      contact.colliderB.events.emit(
        'precollision',
        new PreCollisionEvent(contact.colliderB, contact.colliderA, Side.getOpposite(side), contact.mtv.negate())
      );
      contact.colliderB.events.emit('beforecollisionresolve', new BeforeCollisionResolveEvent(
        contact.colliderB, contact.colliderA, Side.getOpposite(side), contact.mtv.negate(), contact) as any
      );

      // Match awake state for sleeping
      contact.matchAwake();
    }

    // Keep track of contacts that done
    let finishedContactIds = Array.from(this.idToContactPoints.keys());
    for (let contact of contacts) {
        // Remove all current contacts that are not done
        let index = finishedContactIds.indexOf(contact.id);
        if (index > -1) {
            finishedContactIds.splice(index, 1);
        }
        let contactPoints = this.idToContactPoints.get(contact.id) ?? [];
        
        let pointIndex = 0;
        for (let point of contact.points) {
            const bodyA = contact.colliderA.owner;
            const bodyB = contact.colliderB.owner;
            const normal = contact.normal;
            const tangent = contact.tangent;

            const aToContact = point.sub(bodyA.pos);
            const bToContact = point.sub(bodyB.pos);

            const aToContactNormal = aToContact.cross(normal);
            const bToContactNormal = bToContact.cross(normal);

            const normalMass = bodyA.inverseMass + bodyB.inverseMass + 
                            bodyA.inverseInertia * aToContactNormal * aToContactNormal +
                            bodyB.inverseInertia * bToContactNormal * bToContactNormal;

            const aToContactTangent = aToContact.cross(tangent);
            const bToContactTangent = bToContact.cross(tangent);

            const tangentMass = bodyA.inverseMass + bodyB.inverseMass +
                            bodyA.inverseInertia * aToContactTangent * aToContactTangent +
                            bodyB.inverseInertia * bToContactTangent * bToContactTangent;

            // Preserve normal/tangent impulse by re-using the contact point if it's close
            if (contactPoints[pointIndex] && contactPoints[pointIndex]?.point?.squareDistance(point) < 4) {
                contactPoints[pointIndex].point = point;
            } else {
                // new contact if its' not close or doesn't exist
                contactPoints[pointIndex] = new ContactPoint(point, contact);
            }

            // Update contact point calculations
            contactPoints[pointIndex].aToContact = aToContact;
            contactPoints[pointIndex].bToContact = bToContact;
            contactPoints[pointIndex].normalMass = normalMass;
            contactPoints[pointIndex].tangentMass = tangentMass;

            pointIndex++
        }
        this.idToContactPoints.set(contact.id, contactPoints);
    }

    // Clean up any contacts that did not occur last frame
    for (const id of finishedContactIds) {
        this.idToContactPoints.delete(id);
    }
  }

  postSolve(contacts: CollisionContact[]) {
    for (const contact of contacts) {
      let bodyA = contact.colliderA.owner;
      let bodyB = contact.colliderB.owner;
      
      // Update motion values for sleeping
      bodyA.updateMotion();
      bodyB.updateMotion();

      // Publish collision events on both participants
      const side = Side.fromDirection(contact.mtv);
      contact.colliderA.events.emit('postcollision', new PostCollisionEvent(contact.colliderA, contact.colliderB, side, contact.mtv));
      contact.colliderA.events.emit('aftercollisionresolve', new AfterCollisionResolveEvent(
        contact.colliderA, contact.colliderB, side, contact.mtv, contact) as any);
      contact.colliderB.events.emit(
        'postcollision',
        new PostCollisionEvent(contact.colliderB, contact.colliderA, Side.getOpposite(side), contact.mtv.negate())
      );
      contact.colliderB.events.emit('aftercollisionresolve', new AfterCollisionResolveEvent(
        contact.colliderB, contact.colliderA, Side.getOpposite(side), contact.mtv.negate(), contact
      ) as any);

    }


    // Store contacts
    this.lastFrameContacts.clear();
    for (const c of contacts) {
        this.lastFrameContacts.set(c.id, c);
    }
  }


  warmStart(contacts: CollisionContact[]) {
    for (let contact of contacts) {
      let bodyA = contact.colliderA.owner;
      let bodyB = contact.colliderB.owner;
      let contactPoints = this.idToContactPoints.get(contact.id) ?? [];
      for (let point of contactPoints) {
          const normalImpulse = contact.normal.scale(point.normalImpulse);
          // Scaling back the tangent impulse seems to increase stack stability?
          const tangentImpulse = contact.tangent.scale(point.tangentImpulse).scale(.2);

          bodyA.applyLinearImpulse(normalImpulse.negate());
          bodyA.applyAngularImpulse(point.point, tangentImpulse.negate());

          bodyB.applyLinearImpulse(normalImpulse);
          bodyB.applyAngularImpulse(point.point, tangentImpulse);
      }
    }
  }

  /**
   * Iteratively solve the position overlap constraint
   * @param contacts 
   */
  solvePosition(contacts: CollisionContact[]) {
    for (let contact of contacts) {
      let bodyA = contact.colliderA.owner;
      let bodyB = contact.colliderB.owner;
      let contactPoints = this.idToContactPoints.get(contact.id) ?? [];
      for (let point of contactPoints) {
          const normal = contact.normal;
          const separation = contact.getSeparation(); // todo shape closest line table?

          const steeringConstant = 0.2
          const maxCorrection = -5;
          const slop = 1;
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

  solveVelocity(contacts: CollisionContact[]) {
    for (let contact of contacts) {
      let bodyA = contact.colliderA.owner;
      let bodyB = contact.colliderB.owner;

      const restitution = bodyA.bounciness * bodyB.bounciness;
      const friction = Math.min(bodyA.friction, bodyB.friction);
      
      let contactPoints = this.idToContactPoints.get(contact.id) ?? [];

      for (let point of contactPoints) {
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

      for (let point of contactPoints) {
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