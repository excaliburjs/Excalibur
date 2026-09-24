import { CollisionPostSolveEvent, CollisionPreSolveEvent, PostCollisionEvent, PreCollisionEvent } from '../../events';
import { clamp } from '../../math/util';
import { vec } from '../../math/vector';
import type { Vector } from '../../math/vector';
import type { CollisionContact } from '../detection/collision-contact';
import { CollisionType } from '../collision-type';
import { ContactConstraintPoint } from './contact-constraint-point';
import { Side } from '../side';
import type { CollisionSolver } from './solver';
import type { BodyComponent } from '../body-component';
import { DegreeOfFreedom } from '../body-component';
import { CollisionJumpTable } from '../colliders/collision-jump-table';
import { Pair } from '../detection/pair';
import type { DeepRequired } from '../../util/required';
import type { PhysicsConfig } from '../physics-config';
import type { ContactBias } from './contact-bias';
import { ContactSolveBias, HorizontalFirst, None, VerticalFirst } from './contact-bias';

/**
 * Direct component access, skips accessor dispatch in the solver hot loops (same trick as the separating axis code)
 */
type UnsafeVector = { _x: number; _y: number };

export class RealisticSolver implements CollisionSolver {
  directionMap = new Map<string, 'horizontal' | 'vertical'>();
  distanceMap = new Map<string, number>();
  private _currentContactIds = new Set<string>();

  constructor(public config: DeepRequired<Pick<PhysicsConfig, 'realistic'>['realistic']>) {}
  lastFrameContacts: Map<string, CollisionContact> = new Map();

  // map contact id to contact points
  idToContactConstraint: Map<string, ContactConstraintPoint[]> = new Map();

  getContactConstraints(id: string) {
    return this.idToContactConstraint.get(id) ?? [];
  }

  /**
   * Solve the contacts for one physics (sub)step
   * @param contacts
   * @param _duration length of the step in ms, unused but kept so `substep`/`substepCount` line up positionally with
   * the {@apilink CollisionSolver} interface
   * @param substep index of the substep within the frame, collision events are emitted on the first and last substep only
   * @param substepCount total substeps in the frame
   */
  public solve(contacts: CollisionContact[], _duration?: number, substep: number = 0, substepCount: number = 1): CollisionContact[] {
    // Events and init
    this.preSolve(contacts, substep);

    // Remove any canceled contacts, dormant (sleeping) contacts are only carried for their constraints and never solved
    contacts = contacts.filter((c) => !c.isCanceled() && !Pair.isDormant(c.bodyA, c.bodyB));
    // Locate collision bias order
    let bias: ContactBias;
    switch (this.config!.contactSolveBias) {
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
      const aDir = this.directionMap.get(a.id)!;
      const bDir = this.directionMap.get(b.id)!;
      const aDist = this.distanceMap.get(a.id)!;
      const bDist = this.distanceMap.get(b.id)!;
      return bias[aDir] - bias[bDir] || aDist - bDist;
    });

    // Solve velocity first
    this.solveVelocity(contacts);

    // Solve position last because non-overlap is the most important
    this.solvePosition(contacts);

    // Events and any contact house-keeping the solver needs
    const emitEventsLastSubstep = substep === substepCount - 1;
    this.postSolve(contacts, emitEventsLastSubstep);

    return contacts;
  }

  /**
   * Prepares the contact constraints (effective masses, lever arms, restitution targets) and warm starts them
   * @param contacts
   * @param substep index of the substep within the frame, `precollision`/`beforecollisionresolve` are only emitted on the first
   */
  preSolve(contacts: CollisionContact[], substep: number = 0) {
    const epsilon = 0.0001;
    const emitEventsOnFirstSubstep = substep === 0;
    this.distanceMap.clear();
    this.directionMap.clear();
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      // Only fully dormant pairs (both asleep, or one asleep against a Fixed body) skip preSolve entirely.
      // A pair with one sleeping body against an awake, movable body still gets its constraint refreshed here
      // (just not solved, see warmStart/solvePosition/solveVelocity) so it has up to date warm-start data for
      // the frame its island wakes
      if (Pair.isDormant(contact.bodyA, contact.bodyB)) {
        continue;
      }
      if (Math.abs(contact.mtv.x) < epsilon && Math.abs(contact.mtv.y) < epsilon) {
        // Cancel near 0 mtv collisions
        contact.cancel();
        continue;
      }

      const side = Side.fromDirection(contact.mtv);
      const distance = Math.abs(contact?.info?.separation || 0);

      this.distanceMap.set(contact.id, distance);
      this.directionMap.set(contact.id, side === Side.Left || side === Side.Right ? 'horizontal' : 'vertical');

      if (emitEventsOnFirstSubstep) {
        // Publish collision events on both participants
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
      }
    }

    const currentIds = this._currentContactIds;
    currentIds.clear();
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      currentIds.add(contact.id);

      const bodyA = contact.bodyA;
      const bodyB = contact.bodyB;
      // Keep the accumulated impulses of sleeping contacts for when they wake, nothing else to do for them
      if (Pair.isDormant(bodyA, bodyB)) {
        continue;
      }
      const contactPoints = this.idToContactConstraint.get(contact.id) ?? [];
      if (bodyA && bodyB && !bodyA.isSleeping && !bodyB.isSleeping) {
        const colliderA = contact.colliderA;
        const colliderB = contact.colliderB;
        const normal = contact.normal as unknown as UnsafeVector;
        const tangent = contact.tangent as unknown as UnsafeVector;
        const nX = normal._x;
        const nY = normal._y;
        const tX = tangent._x;
        const tY = tangent._y;

        // Lever arms are measured from the collider centers, the same origin the impulses are applied about
        const centerA = colliderA.center as unknown as UnsafeVector;
        const centerB = colliderB.center as unknown as UnsafeVector;
        const cAX = centerA._x;
        const cAY = centerA._y;
        const cBX = centerB._x;
        const cBY = centerB._y;

        const invMassA = bodyA.inverseMass;
        const invMassB = bodyB.inverseMass;
        const invInertiaA = bodyA.inverseInertia;
        const invInertiaB = bodyB.inverseInertia;

        const velA = bodyA.vel as unknown as UnsafeVector;
        const velB = bodyB.vel as unknown as UnsafeVector;
        const wA = bodyA.angularVelocity;
        const wB = bodyB.angularVelocity;
        const restitution = bodyA.bounciness > bodyB.bounciness ? bodyA.bounciness : bodyB.bounciness;

        let pointIndex = 0;
        for (let j = 0; j < contact.points.length; j++) {
          const point = contact.points[j];

          // Preserve normal/tangent impulse by re-using the contact point if it's close
          let constraint = contactPoints[pointIndex];
          if (constraint && constraint.point.squareDistance(point) < 4) {
            constraint.point = point;
            constraint.local = contact.localPoints[j];
            // Rebind to the live contact so relative velocity uses the current normal/bodies
            constraint.contact = contact;
          } else {
            // new contact if it's not close or doesn't exist
            constraint = contactPoints[pointIndex] = new ContactConstraintPoint(point, contact.localPoints[j], contact);
          }

          const p = point as unknown as UnsafeVector;
          const rAX = p._x - cAX;
          const rAY = p._y - cAY;
          const rBX = p._x - cBX;
          const rBY = p._y - cBY;
          constraint.aToContact.setTo(rAX, rAY);
          constraint.bToContact.setTo(rBX, rBY);

          // 2D cross(r, axis) = r.x * axis.y - r.y * axis.x
          const rAN = rAX * nY - rAY * nX;
          const rBN = rBX * nY - rBY * nX;
          constraint.normalMass = 1.0 / (invMassA + invMassB + invInertiaA * rAN * rAN + invInertiaB * rBN * rBN);

          const rAT = rAX * tY - rAY * tX;
          const rBT = rBX * tY - rBY * tX;
          constraint.tangentMass = 1.0 / (invMassA + invMassB + invInertiaA * rAT * rAT + invInertiaB * rBT * rBT);

          // Relative velocity at the contact before solving to accurately do restitution
          // point velocity = v + w x r, where w x r = (-w * r.y, w * r.x)
          const relX = velB._x - wB * rBY - (velA._x - wA * rAY);
          const relY = velB._y + wB * rBX - (velA._y + wA * rAX);
          const relativeNormalVelocity = relX * nX + relY * nY;
          // TODO what's a good threshold here?
          constraint.originalVelocityAndRestitution = relativeNormalVelocity < -0.1 ? -restitution * relativeNormalVelocity : 0;
          pointIndex++;
        }
        // Drop constraint points left over from a previous, larger manifold (e.g. 2 point face contact -> 1 point corner contact).
        // Stale points carry an old world point/lever arm/accumulated impulse and make the velocity solver diverge.
        contactPoints.length = pointIndex;
      }
      this.idToContactConstraint.set(contact.id, contactPoints);
    }

    // Clean up constraints for contacts that ended
    for (const id of this.idToContactConstraint.keys()) {
      if (!currentIds.has(id)) {
        this.idToContactConstraint.delete(id);
      }
    }

    // Warm contacts with accumulated impulse
    // Useful for tall stacks
    if (this.config!.warmStart) {
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

  /**
   * @param contacts
   * @param emitEvents whether `postcollision`/`aftercollisionresolve` fire, only the last substep of a frame does
   */
  postSolve(contacts: CollisionContact[], emitEvents: boolean = true) {
    if (!emitEvents) {
      return;
    }
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      const bodyA = contact.bodyA;
      const bodyB = contact.bodyB;

      if (bodyA && bodyB) {
        // Skip post solve for active+passive collisions
        if (bodyA.collisionType === CollisionType.Passive || bodyB.collisionType === CollisionType.Passive) {
          continue;
        }
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
    const warm = this.config!.warmStart;
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      const bodyA = contact.bodyA;
      const bodyB = contact.bodyB;
      // We do want to warm start these contacts eventually, but we wait for the contact island to wake both
      // bodies together rather than warm starting one side of a still-sleeping pair
      if (!bodyA || !bodyB || bodyA.isSleeping || bodyB.isSleeping) {
        continue;
      }

      const contactPoints = this.idToContactConstraint.get(contact.id);
      if (!contactPoints) {
        continue;
      }
      const normal = contact.normal as unknown as UnsafeVector;
      const tangent = contact.tangent as unknown as UnsafeVector;
      for (let j = 0; j < contactPoints.length; j++) {
        const point = contactPoints[j];
        if (warm) {
          const impulseX = normal._x * point.normalImpulse + tangent._x * point.tangentImpulse;
          const impulseY = normal._y * point.normalImpulse + tangent._y * point.tangentImpulse;
          const rA = point.aToContact as unknown as UnsafeVector;
          const rB = point.bToContact as unknown as UnsafeVector;
          bodyA.applyImpulseAtOffset(rA._x, rA._y, -impulseX, -impulseY);
          bodyB.applyImpulseAtOffset(rB._x, rB._y, impulseX, impulseY);
        } else {
          point.normalImpulse = 0;
          point.tangentImpulse = 0;
        }
      }
    }
  }

  /**
   * Iteratively solve the position overlap constraint
   * @param contacts
   */
  solvePosition(contacts: CollisionContact[]) {
    const steeringConstant = this.config!.steeringFactor; //0.2 pixels;
    const slop = this.config!.slop; //1 pixel;
    for (let i = 0; i < this.config!.positionIterations; i++) {
      for (let j = 0; j < contacts.length; j++) {
        const contact = contacts[j];
        const bodyA = contact.bodyA;
        const bodyB = contact.bodyB;

        // We do want to solve these eventually, but we wait for the contact island to wake both bodies
        // together, we don't apply position solves to a still-sleeping body
        if (!bodyA || !bodyB || bodyA.isSleeping || bodyB.isSleeping) {
          continue;
        }

        // Skip solving active+passive
        if (bodyA.collisionType === CollisionType.Passive || bodyB.collisionType === CollisionType.Passive) {
          continue;
        }

        const constraints = this.idToContactConstraint.get(contact.id);
        if (!constraints) {
          continue;
        }
        const normal = contact.normal as unknown as UnsafeVector;
        for (let k = 0; k < constraints.length; k++) {
          const point = constraints[k];
          const separation = CollisionJumpTable.FindContactSeparation(contact, point.local);

          // Clamp to avoid over-correction
          // Remember that we are shooting for 0 overlap in the end
          const steeringForce = clamp(steeringConstant * (separation + slop), this.config!.maxPositionCorrection, 0);
          if (steeringForce === 0) {
            continue;
          }

          // This is a pseudo impulse, meaning we aren't doing a real impulse calculation
          // We adjust position and rotation instead of doing the velocity
          const impulse = -steeringForce * point.normalMass;
          const impulseX = normal._x * impulse;
          const impulseY = normal._y * impulse;

          if (bodyA.collisionType === CollisionType.Active) {
            this._applyPositionCorrection(bodyA, point.aToContact, -impulseX, -impulseY);
          }
          if (bodyB.collisionType === CollisionType.Active) {
            this._applyPositionCorrection(bodyB, point.bToContact, impulseX, impulseY);
          }
        }
      }
    }
  }

  /**
   * Moves and rotates a body by a pseudo impulse applied at a lever arm from its center, honoring the limited degrees of freedom
   */
  private _applyPositionCorrection(body: BodyComponent, offset: Vector, impulseX: number, impulseY: number) {
    const dof = body.limitDegreeOfFreedom;
    const inverseMass = body.inverseMass;
    let dx = impulseX * inverseMass;
    let dy = impulseY * inverseMass;
    if (dof.length > 0) {
      if (dof.includes(DegreeOfFreedom.X)) {
        dx = 0;
      }
      if (dof.includes(DegreeOfFreedom.Y)) {
        dy = 0;
      }
    }

    const transform = body.transform.get();
    if (transform.parent) {
      // parented transforms need the full global -> local conversion
      body.globalPos = body.globalPos.add(vec(dx, dy));
    } else {
      // unparented transforms are their own global space, mutate in place (flags the matrix dirty, no allocation)
      const pos = transform.pos;
      pos.x += dx;
      pos.y += dy;
    }

    if (!dof.includes(DegreeOfFreedom.Rotation)) {
      const r = offset as unknown as UnsafeVector;
      const deltaRotation = body.inverseInertia * (r._x * impulseY - r._y * impulseX);
      if (transform.parent) {
        body.rotation += deltaRotation;
      } else {
        transform.rotation += deltaRotation;
      }
    }
  }

  solveVelocity(contacts: CollisionContact[]) {
    // velocityIterations:
    for (let i = 0; i < this.config!.velocityIterations; i++) {
      for (let j = 0; j < contacts.length; j++) {
        const contact = contacts[j];
        const bodyA = contact.bodyA;
        const bodyB = contact.bodyB;

        if (!bodyA || !bodyB || bodyA.isSleeping || bodyB.isSleeping) {
          continue;
        }

        // Skip solving active+passive
        if (bodyA.collisionType === CollisionType.Passive || bodyB.collisionType === CollisionType.Passive) {
          continue;
        }

        const constraints = this.idToContactConstraint.get(contact.id);
        if (!constraints || constraints.length === 0) {
          continue;
        }

        const friction = Math.min(bodyA.friction, bodyB.friction);
        const normal = contact.normal as unknown as UnsafeVector;
        const tangent = contact.tangent as unknown as UnsafeVector;
        const nX = normal._x;
        const nY = normal._y;
        const tX = tangent._x;
        const tY = tangent._y;
        // velocity vectors are mutated in place by applyImpulseAtOffset so these stay valid for the contact
        const velA = bodyA.vel as unknown as UnsafeVector;
        const velB = bodyB.vel as unknown as UnsafeVector;

        // Friction constraint
        for (let k = 0; k < constraints.length; k++) {
          const point = constraints[k];
          const rA = point.aToContact as unknown as UnsafeVector;
          const rB = point.bToContact as unknown as UnsafeVector;
          const wA = bodyA.angularVelocity;
          const wB = bodyB.angularVelocity;
          // relative velocity at the contact point, w x r = (-w * r.y, w * r.x)
          const relX = velB._x - wB * rB._y - (velA._x - wA * rA._y);
          const relY = velB._y + wB * rB._x - (velA._y + wA * rA._x);

          // Negate velocity in tangent direction to simulate friction
          const tangentVelocity = -(relX * tX + relY * tY);
          let impulseDelta = tangentVelocity * point.tangentMass;

          // Clamping based in Erin Catto's GDC 2006 talk
          // Correct clamping https://github.com/erincatto/box2d-lite/blob/master/docs/GDC2006_Catto_Erin_PhysicsTutorial.pdf
          // Accumulated fiction impulse is always between -uMaxFriction < dT < uMaxFriction
          // But deltas can vary
          const maxFriction = friction * point.normalImpulse;
          const newImpulse = clamp(point.tangentImpulse + impulseDelta, -maxFriction, maxFriction);
          impulseDelta = newImpulse - point.tangentImpulse;
          point.tangentImpulse = newImpulse;

          const impulseX = tX * impulseDelta;
          const impulseY = tY * impulseDelta;
          bodyA.applyImpulseAtOffset(rA._x, rA._y, -impulseX, -impulseY);
          bodyB.applyImpulseAtOffset(rB._x, rB._y, impulseX, impulseY);
        }

        // Bounce constraint
        for (let k = 0; k < constraints.length; k++) {
          const point = constraints[k];
          const rA = point.aToContact as unknown as UnsafeVector;
          const rB = point.bToContact as unknown as UnsafeVector;
          // Need to recalc relative velocity because the previous step could have changed vel
          const wA = bodyA.angularVelocity;
          const wB = bodyB.angularVelocity;
          const relX = velB._x - wB * rB._y - (velA._x - wA * rA._y);
          const relY = velB._y + wB * rB._x - (velA._y + wA * rA._x);

          // Compute impulse in normal direction
          const normalVelocity = relX * nX + relY * nY;

          // Per Erin it is a mistake to apply the restitution inside the iteration
          // From Erin Catto's Box2D we keep original contact velocity and adjust by small impulses
          let impulseDelta = -point.normalMass * (normalVelocity - point.originalVelocityAndRestitution);

          // Clamping based in Erin Catto's GDC 2014 talk
          // Accumulated impulse stored in the contact is always positive (dV >= 0)
          // But deltas can be negative
          const newImpulse = Math.max(point.normalImpulse + impulseDelta, 0);
          impulseDelta = newImpulse - point.normalImpulse;
          point.normalImpulse = newImpulse;

          const impulseX = nX * impulseDelta;
          const impulseY = nY * impulseDelta;
          bodyA.applyImpulseAtOffset(rA._x, rA._y, -impulseX, -impulseY);
          bodyB.applyImpulseAtOffset(rB._x, rB._y, impulseX, impulseY);
        }
      }
    }
  }
}
