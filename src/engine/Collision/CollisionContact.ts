import { Body } from './Body';
import { Vector } from '../Algebra';
import { Physics, CollisionResolutionStrategy } from '../Physics';
import { PostCollisionEvent, PreCollisionEvent } from '../Events';
import * as Util from '../Util/Util';
import { CollisionType } from './CollisionType';
import { Collider } from './Collider';

/**
 * Collision contacts are used internally by Excalibur to resolve collision between actors. This
 * Pair prevents collisions from being evaluated more than one time
 */
export class CollisionContact {
  /**
   * The id of this collision contact
   */
  id: string;
  /**
   * The first rigid body in the collision
   */
  colliderA: Collider;
  /**
   * The second rigid body in the collision
   */
  colliderB: Collider;
  /**
   * The minimum translation vector to resolve penetration, pointing away from bodyA
   */
  mtv: Vector;
  /**
   * The point of collision shared between bodyA and bodyB
   */
  point: Vector;
  /**
   * The collision normal, pointing away from bodyA
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
    if (colliderA.collisionType === CollisionType.Active && colliderB.collisionType !== CollisionType.Passive) {
      // Resolve overlaps
      if (colliderA.collisionType === CollisionType.Active && colliderB.collisionType === CollisionType.Active) {
        // split overlaps if both are Active
        mtv = mtv.scale(0.5);
      }
      // Apply mtv
      colliderA.body.pos.y += mtv.y;
      colliderA.body.pos.x += mtv.x;

      let mtvDir = mtv.normalize();

      // only adjust if velocity is opposite
      if (mtvDir.dot(colliderA.body.vel) < 0) {
        // Cancel out velocity in direction of mtv
        let velAdj = mtvDir.scale(mtvDir.dot(colliderA.body.vel.negate()));

        colliderA.body.vel = colliderA.body.vel.add(velAdj);
      }

      colliderA.emit('postcollision', new PostCollisionEvent(colliderA, colliderB, Util.getSideFromVector(mtv), mtv));
    }
  }

  private _resolveBoxCollision() {
    let side = Util.getSideFromVector(this.mtv);
    let mtv = this.mtv.negate();
    // Publish collision events on both participants
    this.colliderA.emit('precollision', new PreCollisionEvent(this.colliderA, this.colliderB, side, mtv));
    this.colliderB.emit('precollision', new PreCollisionEvent(this.colliderB, this.colliderA, Util.getOppositeSide(side), mtv.negate()));

    this._applyBoxImpulse(this.colliderA, this.colliderB, mtv);
    this._applyBoxImpulse(this.colliderB, this.colliderA, mtv.negate());
  }

  private _resolveRigidBodyCollision() {
    // perform collison on bounding areas
    var bodyA: Body = this.colliderA.body;
    var bodyB: Body = this.colliderB.body;
    var mtv = this.mtv; // normal pointing away from bodyA
    var normal = this.normal; // normal pointing away from bodyA
    if (bodyA === bodyB) {
      // sanity check for existing pairs
      return;
    }

    // Publish collision events on both participants
    var side = Util.getSideFromVector(this.mtv);
    this.colliderA.emit('precollision', new PreCollisionEvent(this.colliderA, this.colliderB, side, this.mtv));
    this.colliderB.emit(
      'precollision',
      new PreCollisionEvent(this.colliderB, this.colliderA, Util.getOppositeSide(side), this.mtv.negate())
    );

    // If any of the participants are passive then short circuit
    if (this.colliderA.collisionType === CollisionType.Passive || this.colliderB.collisionType === CollisionType.Passive) {
      return;
    }

    var invMassA = this.colliderA.collisionType === CollisionType.Fixed ? 0 : 1 / this.colliderA.mass;
    var invMassB = this.colliderB.collisionType === CollisionType.Fixed ? 0 : 1 / this.colliderB.mass;

    var invMoiA = this.colliderA.collisionType === CollisionType.Fixed ? 0 : 1 / this.colliderA.moi;
    var invMoiB = this.colliderB.collisionType === CollisionType.Fixed ? 0 : 1 / this.colliderB.moi;

    // average restitution more relistic
    var coefRestitution = Math.min(this.colliderA.restitution, this.colliderB.restitution);

    var coefFriction = Math.min(this.colliderA.friction, this.colliderB.friction);

    normal = normal.normalize();
    var tangent = normal.normal().normalize();

    var ra = this.point.sub(this.colliderA.center); // point relative to bodyA position
    var rb = this.point.sub(this.colliderB.center); /// point relative to bodyB

    // Relative velocity in linear terms
    // Angular to linear velocity formula -> omega = v/r
    var rv = bodyB.vel.add(rb.cross(-bodyB.rx)).sub(bodyA.vel.sub(ra.cross(bodyA.rx)));
    var rvNormal = rv.dot(normal);
    var rvTangent = rv.dot(tangent);

    var raTangent = ra.dot(tangent);
    var raNormal = ra.dot(normal);

    var rbTangent = rb.dot(tangent);
    var rbNormal = rb.dot(normal);

    // If objects are moving away ignore
    if (rvNormal > 0) {
      return;
    }

    // Collision impulse formula from Chris Hecker
    // https://en.wikipedia.org/wiki/Collision_response
    var impulse =
      -((1 + coefRestitution) * rvNormal) / (invMassA + invMassB + invMoiA * raTangent * raTangent + invMoiB * rbTangent * rbTangent);

    if (this.colliderA.collisionType === CollisionType.Fixed) {
      bodyB.vel = bodyB.vel.add(normal.scale(impulse * invMassB));
      if (Physics.allowRigidBodyRotation) {
        bodyB.rx -= impulse * invMoiB * -rb.cross(normal);
      }
      bodyB.addMtv(mtv);
    } else if (this.colliderB.collisionType === CollisionType.Fixed) {
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
      var t = rv.sub(normal.scale(rv.dot(normal))).normalize();

      // impulse in the direction of tangent force
      var jt = rv.dot(t) / (invMassA + invMassB + raNormal * raNormal * invMoiA + rbNormal * rbNormal * invMoiB);

      var frictionImpulse = new Vector(0, 0);
      if (Math.abs(jt) <= impulse * coefFriction) {
        frictionImpulse = t.scale(jt).negate();
      } else {
        frictionImpulse = t.scale(-impulse * coefFriction);
      }

      if (this.colliderA.collisionType === CollisionType.Fixed) {
        // apply frictional impulse
        bodyB.vel = bodyB.vel.add(frictionImpulse.scale(invMassB));
        if (Physics.allowRigidBodyRotation) {
          bodyB.rx += frictionImpulse.dot(t) * invMoiB * rb.cross(t);
        }
      } else if (this.colliderB.collisionType === CollisionType.Fixed) {
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
