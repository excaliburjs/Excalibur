import { CollisionPostSolveEvent, CollisionPreSolveEvent, PostCollisionEvent, PreCollisionEvent } from '../../Events';
import { clamp } from '../../Math/util';
import { CollisionContact } from '../Detection/CollisionContact';
import { CollisionType } from '../CollisionType';
import { ContactConstraintPoint } from './ContactConstraintPoint';
import { Side } from '../Side';
import { CollisionSolver } from './Solver';
import { DegreeOfFreedom } from '../BodyComponent';
import { CollisionJumpTable } from '../Colliders/CollisionJumpTable';
import { DeepRequired } from '../../Util/Required';
import { PhysicsConfig } from '../PhysicsConfig';
import { ContactBias, ContactSolveBias, HorizontalFirst, None, VerticalFirst } from './ContactBias';

export class RealisticSolver implements CollisionSolver {
  directionMap = new Map<string, 'horizontal' | 'vertical'>();
  distanceMap = new Map<string, number>();

  constructor(public config: DeepRequired<Pick<PhysicsConfig, 'realistic'>['realistic']>) {}
  lastFrameContacts: Map<string, CollisionContact> = new Map();

  // map contact id to contact points
  idToContactConstraint: Map<string, ContactConstraintPoint[]> = new Map();

  getContactConstraints(id: string) {
    return this.idToContactConstraint.get(id) ?? [];
  }

  public solve(contacts: CollisionContact[]): CollisionContact[] {
    // Events and init
    this.preSolve(contacts);

    // Remove any canceled contacts
    contacts = contacts.filter((c) => !c.isCanceled());
    // Locate collision bias order
    let bias: ContactBias;
    switch (this.config.contactSolveBias) {
      case ContactSolveBias.HorizontalFirst: {
        bias = HorizontalFirst;
        break;
      }
      case ContactSolveBias.VerticalFirst: {
        bias = VerticalFirst;
        break;
      }
      default: {
        bias = None;
      }
    }

    // Sort by bias (None, VerticalFirst, HorizontalFirst) to avoid artifacts with seams
    // Sort contacts by distance to avoid artifacts with seams
    // It's important to solve in a specific order
    contacts.sort((a, b) => {
      const aDir = this.directionMap.get(a.id);
      const bDir = this.directionMap.get(b.id);
      const aDist = this.distanceMap.get(a.id);
      const bDist = this.distanceMap.get(b.id);
      return bias[aDir] - bias[bDir] || aDist - bDist;
    });

    // Solve velocity first
    this.solveVelocity(contacts);

    // Solve position last because non-overlap is the most important
    this.solvePosition(contacts);

    // Events and any contact house-keeping the solver needs
    this.postSolve(contacts);

    return contacts;
  }

  preSolve(contacts: CollisionContact[]) {
    const epsilon = 0.0001;
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      if (Math.abs(contact.mtv.x) < epsilon && Math.abs(contact.mtv.y) < epsilon) {
        // Cancel near 0 mtv collisions
        contact.cancel();
        continue;
      }
      // Publish collision events on both participants
      const side = Side.fromDirection(contact.mtv);
      const distance = Math.abs(contact?.info?.separation || 0);

      this.distanceMap.set(contact.id, distance);
      this.directionMap.set(contact.id, side === Side.Left || side === Side.Right ? 'horizontal' : 'vertical');

      contact.colliderA.events.emit(
        'precollision',
        new PreCollisionEvent(contact.colliderA, contact.colliderB, side, contact.mtv, contact)
      );
      contact.colliderA.events.emit(
        'beforecollisionresolve',
        new CollisionPreSolveEvent(contact.colliderA, contact.colliderB, side, contact.mtv, contact) as any
      );
      contact.colliderB.events.emit(
        'precollision',
        new PreCollisionEvent(contact.colliderB, contact.colliderA, Side.getOpposite(side), contact.mtv.negate(), contact)
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
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      // Remove all current contacts that are not done
      const index = finishedContactIds.indexOf(contact.id);
      if (index > -1) {
        finishedContactIds.splice(index, 1);
      }
      const contactPoints = this.idToContactConstraint.get(contact.id) ?? [];

      let pointIndex = 0;
      const bodyA = contact.bodyA;
      const colliderA = contact.colliderA;
      const bodyB = contact.bodyB;
      const colliderB = contact.colliderB;
      if (bodyA && bodyB) {
        for (let j = 0; j < contact.points.length; j++) {
          const point = contact.points[j];
          const normal = contact.normal;
          const tangent = contact.tangent;

          const aToContact = point.sub(colliderA.center);
          const bToContact = point.sub(colliderB.center);

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
          contactPoints[pointIndex].normalMass = 1.0 / normalMass;
          contactPoints[pointIndex].tangentMass = 1.0 / tangentMass;

          // Calculate relative velocity before solving to accurately do restitution
          const restitution = bodyA.bounciness > bodyB.bounciness ? bodyA.bounciness : bodyB.bounciness;
          const relativeVelocity = contact.normal.dot(contactPoints[pointIndex].getRelativeVelocity());
          contactPoints[pointIndex].originalVelocityAndRestitution = 0;
          if (relativeVelocity < -0.1) {
            // TODO what's a good threshold here?
            contactPoints[pointIndex].originalVelocityAndRestitution = -restitution * relativeVelocity;
          }
          pointIndex++;
        }
      }
      this.idToContactConstraint.set(contact.id, contactPoints);
    }

    // Clean up any contacts that did not occur last frame
    for (const id of finishedContactIds) {
      this.idToContactConstraint.delete(id);
    }

    // Warm contacts with accumulated impulse
    // Useful for tall stacks
    if (this.config.warmStart) {
      this.warmStart(contacts);
    } else {
      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        const contactPoints = this.getContactConstraints(contact.id);
        for (const point of contactPoints) {
          point.normalImpulse = 0;
          point.tangentImpulse = 0;
        }
      }
    }
  }

  postSolve(contacts: CollisionContact[]) {
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      const bodyA = contact.bodyA;
      const bodyB = contact.bodyB;

      if (bodyA && bodyB) {
        // Skip post solve for active+passive collisions
        if (bodyA.collisionType === CollisionType.Passive || bodyB.collisionType === CollisionType.Passive) {
          continue;
        }

        // Update motion values for sleeping
        bodyA.updateMotion();
        bodyB.updateMotion();
      }

      // Publish collision events on both participants
      const side = Side.fromDirection(contact.mtv);
      contact.colliderA.events.emit(
        'postcollision',
        new PostCollisionEvent(contact.colliderA, contact.colliderB, side, contact.mtv, contact)
      );
      contact.colliderA.events.emit(
        'aftercollisionresolve',
        new CollisionPostSolveEvent(contact.colliderA, contact.colliderB, side, contact.mtv, contact) as any
      );
      contact.colliderB.events.emit(
        'postcollision',
        new PostCollisionEvent(contact.colliderB, contact.colliderA, Side.getOpposite(side), contact.mtv.negate(), contact)
      );
      contact.colliderB.events.emit(
        'aftercollisionresolve',
        new CollisionPostSolveEvent(contact.colliderB, contact.colliderA, Side.getOpposite(side), contact.mtv.negate(), contact) as any
      );
    }

    // Store contacts
    this.lastFrameContacts.clear();
    for (let i = 0; i < contacts.length; i++) {
      const c = contacts[i];
      this.lastFrameContacts.set(c.id, c);
    }
  }

  /**
   * Warm up body's based on previous frame contact points
   * @param contacts
   */
  warmStart(contacts: CollisionContact[]) {
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      const bodyA = contact.bodyA;
      const bodyB = contact.bodyB;
      if (bodyA && bodyB) {
        const contactPoints = this.idToContactConstraint.get(contact.id) ?? [];
        for (const point of contactPoints) {
          if (this.config.warmStart) {
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
  }

  /**
   * Iteratively solve the position overlap constraint
   * @param contacts
   */
  solvePosition(contacts: CollisionContact[]) {
    for (let i = 0; i < this.config.positionIterations; i++) {
      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        const bodyA = contact.bodyA;
        const bodyB = contact.bodyB;

        if (bodyA && bodyB) {
          // Skip solving active+passive
          if (bodyA.collisionType === CollisionType.Passive || bodyB.collisionType === CollisionType.Passive) {
            continue;
          }

          const constraints = this.idToContactConstraint.get(contact.id) ?? [];
          for (const point of constraints) {
            const normal = contact.normal;
            const separation = CollisionJumpTable.FindContactSeparation(contact, point.local);

            const steeringConstant = this.config.steeringFactor; //0.2;
            const maxCorrection = -5;
            const slop = this.config.slop; //1;

            // Clamp to avoid over-correction
            // Remember that we are shooting for 0 overlap in the end
            const steeringForce = clamp(steeringConstant * (separation + slop), maxCorrection, 0);
            const impulse = normal.scale(-steeringForce * point.normalMass);

            // This is a pseudo impulse, meaning we aren't doing a real impulse calculation
            // We adjust position and rotation instead of doing the velocity
            if (bodyA.collisionType === CollisionType.Active) {
              // TODO make applyPseudoImpulse function?
              const impulseForce = impulse.negate().scale(bodyA.inverseMass);
              if (bodyA.limitDegreeOfFreedom.includes(DegreeOfFreedom.X)) {
                impulseForce.x = 0;
              }
              if (bodyA.limitDegreeOfFreedom.includes(DegreeOfFreedom.Y)) {
                impulseForce.y = 0;
              }

              bodyA.globalPos = bodyA.globalPos.add(impulseForce);
              if (!bodyA.limitDegreeOfFreedom.includes(DegreeOfFreedom.Rotation)) {
                bodyA.rotation -= point.aToContact.cross(impulse) * bodyA.inverseInertia;
              }
            }

            if (bodyB.collisionType === CollisionType.Active) {
              const impulseForce = impulse.scale(bodyB.inverseMass);
              if (bodyB.limitDegreeOfFreedom.includes(DegreeOfFreedom.X)) {
                impulseForce.x = 0;
              }
              if (bodyB.limitDegreeOfFreedom.includes(DegreeOfFreedom.Y)) {
                impulseForce.y = 0;
              }

              bodyB.globalPos = bodyB.globalPos.add(impulseForce);
              if (!bodyB.limitDegreeOfFreedom.includes(DegreeOfFreedom.Rotation)) {
                bodyB.rotation += point.bToContact.cross(impulse) * bodyB.inverseInertia;
              }
            }
          }
        }
      }
    }
  }

  solveVelocity(contacts: CollisionContact[]) {
    for (let i = 0; i < this.config.velocityIterations; i++) {
      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        const bodyA = contact.bodyA;
        const bodyB = contact.bodyB;

        if (bodyA && bodyB) {
          // Skip solving active+passive
          if (bodyA.collisionType === CollisionType.Passive || bodyB.collisionType === CollisionType.Passive) {
            continue;
          }

          const friction = Math.min(bodyA.friction, bodyB.friction);

          const constraints = this.idToContactConstraint.get(contact.id) ?? [];

          // Friction constraint
          for (const point of constraints) {
            const relativeVelocity = point.getRelativeVelocity();

            // Negate velocity in tangent direction to simulate friction
            const tangentVelocity = -relativeVelocity.dot(contact.tangent);
            let impulseDelta = tangentVelocity * point.tangentMass;

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

          // Bounce constraint
          for (const point of constraints) {
            // Need to recalc relative velocity because the previous step could have changed vel
            const relativeVelocity = point.getRelativeVelocity();

            // Compute impulse in normal direction
            const normalVelocity = relativeVelocity.dot(contact.normal);

            // Per Erin it is a mistake to apply the restitution inside the iteration
            // From Erin Catto's Box2D we keep original contact velocity and adjust by small impulses
            let impulseDelta = -point.normalMass * (normalVelocity - point.originalVelocityAndRestitution);

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
}
