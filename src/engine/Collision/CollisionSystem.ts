import { Vector } from "../Algebra";
import { Entity } from "../EntityComponentSystem";
import { MotionComponent } from "../EntityComponentSystem/Components/MotionComponent";
import { TransformComponent } from "../EntityComponentSystem/Components/TransformComponent";
import { AddedEntity, isAddedSystemEntity, isRemoveSystemEntity, RemovedEntity, System, SystemType } from "../EntityComponentSystem/System";
import { PostCollisionEvent, PreCollisionEvent } from "../Events";
import { CollisionResolutionStrategy, Physics } from "../Physics";
import { BodyComponent } from "./Body";
import { Collider } from "./Collider";
import { CollisionContact } from "./CollisionContact";
import { CollisionType } from "./CollisionType";
import { DynamicTreeCollisionProcessor } from "./DynamicTreeCollisionProcessor";
import { EulerIntegrator } from "./Integrator";
import { Side } from "./Side";


export class CollisionSystem extends System<TransformComponent | MotionComponent | BodyComponent> {
  public readonly types = ['transform', 'motion', 'body'] as const;
  public systemType = SystemType.Update;
  public priority = -1;

  private _processor = new DynamicTreeCollisionProcessor();

  notify(message: AddedEntity<TransformComponent | MotionComponent | BodyComponent> | RemovedEntity) {
    if (isAddedSystemEntity(message)) {
      // TODO track something better
      // Why do we need to track at all, could I just run broadphase on these?
      for (let collider of message.data.components.body.colliders) {
        
        this._processor.track(collider);
      }
    }

    if (isRemoveSystemEntity(message)) {
      // TODO this will be a problem since the component has been removed already by notify time
      // TODO also you don't know what component dq'd this entity
      if ((message.data.components as any).body) {
        let body = (message.data.components.body as BodyComponent);
        for (let collider of body.colliders) {
          this._processor.track(collider);
        }
      }
    }
  }

  update(_entities: Entity<TransformComponent | MotionComponent | BodyComponent>[], elapsedMs: number): void {
    if (!Physics.enabled) { // TODO remove system entirely if not enabled
      return;
    }

    let colliders: Collider[] = [];
    for (let entity of _entities) {
      entity.components.body.update(); // Update body collider geometry
      colliders = colliders.concat(entity.components.body.colliders);
    }
    this._processor.update(colliders);

    // Run broadphase on all colliders and locates potential collisions
    let pairs = this._processor.broadphase(colliders, elapsedMs);

    let iter: number = Physics.collisionPasses;
    const collisionDelta = elapsedMs / iter;
    while (iter > 0) {
      // Re-run narrowphase each pass
      let contacts = this._processor.narrowphase(pairs);

      // TODO sort contacts
      // Resolve collisions adjust positions and apply velocities
      this._resolve(contacts, collisionDelta, Physics.collisionResolutionStrategy);

      // Remove any pairs that can no longer collide
      pairs = pairs.filter(p => p.canCollide);
      
      // TODO should this be in the while loop
      this._processor.runCollisionStartEnd(pairs);
      iter--;
    }
  }

  debugDraw(ctx: CanvasRenderingContext2D) {
    this._processor.debugDraw(ctx)
  }

  private _resolve(contacts: CollisionContact[], elapsedMs: number, strategy: CollisionResolutionStrategy): void {
    let bodyA: BodyComponent;
    let bodyB: BodyComponent;
    for (const contact of contacts) {
      bodyA = contact.colliderA.body;
      bodyB = contact.colliderB.body;
      if (strategy === CollisionResolutionStrategy.RigidBody) {
        this._resolveRigidBodyCollision(contact);
      } else if (strategy === CollisionResolutionStrategy.Box) {
        this._resolveBoxCollision(contact);
      } else {
        throw new Error('Unknown collision resolution strategy');
      }
  
      bodyA.applyMtv(); 
      bodyB.applyMtv();
      // TODO move to system
      // TODO still don't like this, this is a small integration step to resolve narrowphase collisions
      EulerIntegrator.integrate(bodyA.transform, bodyA.motion, bodyA.acc, elapsedMs * Physics.collisionShift);
      EulerIntegrator.integrate(bodyB.transform, bodyB.motion, bodyB.acc, elapsedMs * Physics.collisionShift);
    }
  }

  private _applyBoxImpulse(colliderA: Collider, colliderB: Collider, mtv: Vector) {
    if (colliderA.body.collisionType === CollisionType.Active && colliderB.body.collisionType !== CollisionType.Passive) {
      // Resolve overlaps
      if (colliderA.body.collisionType === CollisionType.Active && colliderB.body.collisionType === CollisionType.Active) {
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

      colliderA.events.emit('postcollision', new PostCollisionEvent(colliderA, colliderB, Side.fromDirection(mtv), mtv));
    }
  }

  private _resolveBoxCollision(contact: CollisionContact) {
    const side = Side.fromDirection(contact.mtv);
    const mtv = contact.mtv.negate();
    // Publish collision events on both participants
    contact.colliderA.events.emit('precollision', new PreCollisionEvent(contact.colliderA, contact.colliderB, side, mtv));
    contact.colliderB.events.emit('precollision', new PreCollisionEvent(contact.colliderB, contact.colliderA, Side.getOpposite(side), mtv.negate()));

    this._applyBoxImpulse(contact.colliderA, contact.colliderB, mtv);
    this._applyBoxImpulse(contact.colliderB, contact.colliderA, mtv.negate());
  }

  // TODO move to system
  private _resolveRigidBodyCollision(contact: CollisionContact) {
    // perform collision on bounding areas
    const bodyA: BodyComponent = contact.colliderA.body;
    const bodyB: BodyComponent = contact.colliderB.body;
    const mtv = contact.mtv; // normal pointing away from colliderA
    let normal = contact.normal; // normal pointing away from colliderA
    if (bodyA === bodyB) {
      // sanity check for existing pairs
      return;
    }

    // Publish collision events on both participants
    const side = Side.fromDirection(contact.mtv);
    contact.colliderA.events.emit('precollision', new PreCollisionEvent(contact.colliderA, contact.colliderB, side, contact.mtv));
    contact.colliderB.events.emit(
      'precollision',
      new PreCollisionEvent(contact.colliderB, contact.colliderA, Side.getOpposite(side), contact.mtv.negate())
    );

    // If any of the participants are passive then short circuit
    if (bodyA.collisionType === CollisionType.Passive || bodyB.collisionType === CollisionType.Passive) {
      return;
    }

    const invMassA = bodyA.collisionType === CollisionType.Fixed ? 0 : 1 / bodyA.mass;
    const invMassB = bodyB.collisionType === CollisionType.Fixed ? 0 : 1 / bodyB.mass;

    const invMoiA = bodyA.collisionType === CollisionType.Fixed ? 0 : 1 / bodyA.inertia;
    const invMoiB = bodyB.collisionType === CollisionType.Fixed ? 0 : 1 / bodyB.inertia;

    // average restitution more realistic
    const coefRestitution = Math.min(bodyA.bounciness, bodyB.bounciness);

    const coefFriction = Math.min(bodyA.friction, bodyB.friction);

    normal = normal.normalize();
    const tangent = normal.normal().normalize();

    const ra = contact.point.sub(contact.colliderA.center); // point relative to colliderA position
    const rb = contact.point.sub(contact.colliderB.center); /// point relative to colliderB

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

    if (bodyA.collisionType === CollisionType.Fixed) {
      bodyB.vel = bodyB.vel.add(normal.scale(impulse * invMassB));
      if (Physics.allowRigidBodyRotation) {
        bodyB.angularVelocity -= impulse * invMoiB * -rb.cross(normal);
      }
      bodyB.addMtv(mtv);
    } else if (bodyB.collisionType === CollisionType.Fixed) {
      bodyA.vel = bodyA.vel.sub(normal.scale(impulse * invMassA));
      if (Physics.allowRigidBodyRotation) {
        bodyA.angularVelocity += impulse * invMoiA * -ra.cross(normal);
      }
      bodyA.addMtv(mtv.negate());
    } else {
      bodyB.vel = bodyB.vel.add(normal.scale(impulse * invMassB));
      bodyA.vel = bodyA.vel.sub(normal.scale(impulse * invMassA));

      if (Physics.allowRigidBodyRotation) {
        bodyB.angularVelocity -= impulse * invMoiB * -rb.cross(normal);
        bodyA.angularVelocity += impulse * invMoiA * -ra.cross(normal);
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

      // TODO load up body constraints Rotation, X, and Y
      if (bodyA.collisionType === CollisionType.Fixed) {
        // apply frictional impulse
        bodyB.vel = bodyB.vel.add(frictionImpulse.scale(invMassB));
        if (Physics.allowRigidBodyRotation) {
          bodyB.angularVelocity += frictionImpulse.dot(t) * invMoiB * rb.cross(t);
        }
      } else if (bodyB.collisionType === CollisionType.Fixed) {
        // apply frictional impulse
        bodyA.vel = bodyA.vel.sub(frictionImpulse.scale(invMassA));
        if (Physics.allowRigidBodyRotation) {
          bodyA.angularVelocity -= frictionImpulse.dot(t) * invMoiA * ra.cross(t);
        }
      } else {
        // apply frictional impulse
        bodyB.vel = bodyB.vel.add(frictionImpulse.scale(invMassB));
        bodyA.vel = bodyA.vel.sub(frictionImpulse.scale(invMassA));

        // apply frictional impulse
        if (Physics.allowRigidBodyRotation) {
          bodyB.angularVelocity += frictionImpulse.dot(t) * invMoiB * rb.cross(t);
          bodyA.angularVelocity -= frictionImpulse.dot(t) * invMoiA * ra.cross(t);
        }
      }
    }

    contact.colliderA.events.emit('postcollision', new PostCollisionEvent(contact.colliderA, contact.colliderB, side, contact.mtv));
    contact.colliderB.events.emit(
      'postcollision',
      new PostCollisionEvent(contact.colliderB, contact.colliderA, Side.getOpposite(side), contact.mtv.negate())
    );
  }

}