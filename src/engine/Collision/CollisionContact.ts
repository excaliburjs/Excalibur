import { Body } from './Body';
import { Vector } from '../Algebra';
import { Physics, CollisionResolutionStrategy } from '../Physics';
import { PostCollisionEvent, PreCollisionEvent } from '../Events';
import * as Util from '../Util/Util';
import { CollisionType } from './CollisionType';
import { Collider } from './Collider';

/**
 * Collision contacts are used internally by Excalibur to resolve collision between colliders. This
 * Pair prevents collisions from being evaluated more than one time
 */
export class CollisionContact {
  /**
   * The id of this collision contact
   */
  id: string;
  /**
   * The first collider in the collision
   */
  colliderA: Collider;
  /**
   * The second collider in the collision
   */
  colliderB: Collider;
  /**
   * The minimum translation vector to resolve penetration, pointing away from colliderA
   */
  mtv: Vector;
  /**
   * The point of collision shared between colliderA and colliderB
   */
  point: Vector;
  /**
   * The collision normal, pointing away from colliderA
   */
  normal: Vector;

  constructor(colliderA: Collider, colliderB: Collider, mtv: Vector, point: Vector, normal: Vector) {
    this.colliderA = colliderA;
    this.colliderB = colliderB;
    this.mtv = mtv;
    this.point = point;
    this.normal = normal;
  }

  resolve(strategy: CollisionResolutionStrategy) {
    if (strategy === CollisionResolutionStrategy.RigidBody) {
      this._resolveRigidBodyCollision();
    } else if (strategy === CollisionResolutionStrategy.Box) {
      this._resolveBoxCollision();
    } else {
      throw new Error('Unknown collision resolution strategy');
    }
  }

  private _applyBoxImpulse(colliderA: Collider, colliderB: Collider, mtv: Vector) {
    if (colliderA.type === CollisionType.Active && colliderB.type !== CollisionType.Passive) {
      // Resolve overlaps
      if (colliderA.type === CollisionType.Active && colliderB.type === CollisionType.Active) {
        // split overlaps if both are Active
        mtv = mtv.scale(0.5);
      }
      // Apply mtv
      colliderA.body.pos.y += mtv.y;
      colliderA.body.pos.x += mtv.x;

      const mtvDir = mtv.normalize();

      // only adjust if velocity is opposite
      if (mtvDir.dot(colliderA.body.vel) < 0) {
        // Cancel out velocity in direction of mtv
        const velAdj = mtvDir.scale(mtvDir.dot(colliderA.body.vel.negate()));

        colliderA.body.vel = colliderA.body.vel.add(velAdj);
      }

      colliderA.emit('postcollision', new PostCollisionEvent(colliderA, colliderB, Util.getSideFromVector(mtv), mtv));
    }
  }

  private _resolveBoxCollision() {
    const side = Util.getSideFromVector(this.mtv);
    const mtv = this.mtv.negate();
    // Publish collision events on both participants
    this.colliderA.emit('precollision', new PreCollisionEvent(this.colliderA, this.colliderB, side, mtv));
    this.colliderB.emit('precollision', new PreCollisionEvent(this.colliderB, this.colliderA, Util.getOppositeSide(side), mtv.negate()));

    this._applyBoxImpulse(this.colliderA, this.colliderB, mtv);
    this._applyBoxImpulse(this.colliderB, this.colliderA, mtv.negate());
  }

  private _resolveRigidBodyCollision() {
    // perform collison on bounding areas
    const bodyA: Body = this.colliderA.body;
    const bodyB: Body = this.colliderB.body;
    const mtv = this.mtv; // normal pointing away from colliderA
    let normal = this.normal; // normal pointing away from colliderA
    if (bodyA === bodyB) {
      // sanity check for existing pairs
      return;
    }

    // Publish collision events on both participants
    const side = Util.getSideFromVector(this.mtv);
    this.colliderA.emit('precollision', new PreCollisionEvent(this.colliderA, this.colliderB, side, this.mtv));
    this.colliderB.emit(
      'precollision',
      new PreCollisionEvent(this.colliderB, this.colliderA, Util.getOppositeSide(side), this.mtv.negate())
    );

    // If any of the participants are passive then short circuit
    if (this.colliderA.type === CollisionType.Passive || this.colliderB.type === CollisionType.Passive) {
      return;
    }

    const invMassA = this.colliderA.type === CollisionType.Fixed ? 0 : 1 / this.colliderA.mass;
    const invMassB = this.colliderB.type === CollisionType.Fixed ? 0 : 1 / this.colliderB.mass;

    const invMoiA = this.colliderA.type === CollisionType.Fixed ? 0 : 1 / this.colliderA.inertia;
    const invMoiB = this.colliderB.type === CollisionType.Fixed ? 0 : 1 / this.colliderB.inertia;

    // average restitution more relistic
    const coefRestitution = Math.min(this.colliderA.restitution, this.colliderB.restitution);

    const coefFriction = Math.min(this.colliderA.friction, this.colliderB.friction);

    normal = normal.normalize();
    const tangent = normal.normal().normalize();

    const ra = this.point.sub(this.colliderA.center); // point relative to colliderA position
    const rb = this.point.sub(this.colliderB.center); /// point relative to colliderB

    // Relative velocity in linear terms
    // Angular to linear velocity formula -> omega = v/r
    const rv = bodyB.vel.add(rb.cross(-bodyB.rx)).sub(bodyA.vel.sub(ra.cross(bodyA.rx)));
    const rvNormal = rv.dot(normal);
    const rvTangent = rv.dot(tangent);

    const raTangent = ra.dot(tangent);
    const raNormal = ra.dot(normal);

    const rbTangent = rb.dot(tangent);
    const rbNormal = rb.dot(normal);

    // If objects are moving away ignore
    if (rvNormal > 0) {
      return;
    }

    // Collision impulse formula from Chris Hecker
    // https://en.wikipedia.org/wiki/Collision_response
    const impulse =
      -((1 + coefRestitution) * rvNormal) / (invMassA + invMassB + invMoiA * raTangent * raTangent + invMoiB * rbTangent * rbTangent);

    if (this.colliderA.type === CollisionType.Fixed) {
      bodyB.vel = bodyB.vel.add(normal.scale(impulse * invMassB));
      if (Physics.allowRigidBodyRotation) {
        bodyB.rx -= impulse * invMoiB * -rb.cross(normal);
      }
      bodyB.addMtv(mtv);
    } else if (this.colliderB.type === CollisionType.Fixed) {
      bodyA.vel = bodyA.vel.sub(normal.scale(impulse * invMassA));
      if (Physics.allowRigidBodyRotation) {
        bodyA.rx += impulse * invMoiA * -ra.cross(normal);
      }
      bodyA.addMtv(mtv.negate());
    } else {
      bodyB.vel = bodyB.vel.add(normal.scale(impulse * invMassB));
      bodyA.vel = bodyA.vel.sub(normal.scale(impulse * invMassA));

      if (Physics.allowRigidBodyRotation) {
        bodyB.rx -= impulse * invMoiB * -rb.cross(normal);
        bodyA.rx += impulse * invMoiA * -ra.cross(normal);
      }

      // Split the mtv in half for the two bodies, potentially we could do something smarter here
      bodyB.addMtv(mtv.scale(0.5));
      bodyA.addMtv(mtv.scale(-0.5));
    }

    // Friction portion of impulse
    if (coefFriction && rvTangent) {
      // Columb model of friction, formula for impulse due to friction from
      // https://en.wikipedia.org/wiki/Collision_response

      // tangent force exerted by body on another in contact
      const t = rv.sub(normal.scale(rv.dot(normal))).normalize();

      // impulse in the direction of tangent force
      const jt = rv.dot(t) / (invMassA + invMassB + raNormal * raNormal * invMoiA + rbNormal * rbNormal * invMoiB);

      let frictionImpulse = new Vector(0, 0);
      if (Math.abs(jt) <= impulse * coefFriction) {
        frictionImpulse = t.scale(jt).negate();
      } else {
        frictionImpulse = t.scale(-impulse * coefFriction);
      }

      if (this.colliderA.type === CollisionType.Fixed) {
        // apply frictional impulse
        bodyB.vel = bodyB.vel.add(frictionImpulse.scale(invMassB));
        if (Physics.allowRigidBodyRotation) {
          bodyB.rx += frictionImpulse.dot(t) * invMoiB * rb.cross(t);
        }
      } else if (this.colliderB.type === CollisionType.Fixed) {
        // apply frictional impulse
        bodyA.vel = bodyA.vel.sub(frictionImpulse.scale(invMassA));
        if (Physics.allowRigidBodyRotation) {
          bodyA.rx -= frictionImpulse.dot(t) * invMoiA * ra.cross(t);
        }
      } else {
        // apply frictional impulse
        bodyB.vel = bodyB.vel.add(frictionImpulse.scale(invMassB));
        bodyA.vel = bodyA.vel.sub(frictionImpulse.scale(invMassA));

        // apply frictional impulse
        if (Physics.allowRigidBodyRotation) {
          bodyB.rx += frictionImpulse.dot(t) * invMoiB * rb.cross(t);
          bodyA.rx -= frictionImpulse.dot(t) * invMoiA * ra.cross(t);
        }
      }
    }

    this.colliderA.emit('postcollision', new PostCollisionEvent(this.colliderA, this.colliderB, side, this.mtv));
    this.colliderB.emit(
      'postcollision',
      new PostCollisionEvent(this.colliderB, this.colliderA, Util.getOppositeSide(side), this.mtv.negate())
    );
  }
}
