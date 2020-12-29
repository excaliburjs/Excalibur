import { Vector } from "../Algebra";
import { Color } from "../Drawing/Color";
import { Entity } from "../EntityComponentSystem";
import { MotionComponent } from "../EntityComponentSystem/Components/MotionComponent";
import { TransformComponent } from "../EntityComponentSystem/Components/TransformComponent";
import { AddedEntity, isAddedSystemEntity, isRemoveSystemEntity, RemovedEntity, System, SystemType } from "../EntityComponentSystem/System";
import { AfterCollisionResolveEvent, BeforeCollisionResolveEvent, CollisionEndEvent, CollisionStartEvent, ContactEndEvent, ContactStartEvent, PostCollisionEvent, PreCollisionEvent } from "../Events";
import { CollisionResolutionStrategy, Physics } from "../Physics";
import { DrawUtil } from "../Util/Index";
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
  private _lastFrameContacts = new Map<string, CollisionContact>();
  private _currentFrameContacts = new Map<string, CollisionContact>();

  notify(message: AddedEntity<TransformComponent | MotionComponent | BodyComponent> | RemovedEntity) {
    if (isAddedSystemEntity(message)) {
      // TODO track something better
      // Why do we need to track at all, could I just run broadphase on these?
      for (let collider of message.data.components.body.getColliders()) {
        this._processor.track(collider);
      }
    }

    if (isRemoveSystemEntity(message)) {
      // TODO this will be a problem since the component has been removed already by notify time
      // TODO also you don't know what component dq'd this entity
      if ((message.data.components as any).body) {
        let body = (message.data.components.body as BodyComponent);
        for (let collider of body.getColliders()) {
          this._processor.untrack(collider);
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
      colliders = colliders.concat(entity.components.body.getColliders());
    }
    this._processor.update(colliders);

    // Run broadphase on all colliders and locates potential collisions
    let pairs = this._processor.broadphase(colliders, elapsedMs);

    let iter: number = Physics.collisionPasses;
    const collisionDelta = elapsedMs / iter;
    this._currentFrameContacts.clear();
    while (iter > 0) {
      // Re-run narrowphase each pass
      let contacts = this._processor.narrowphase(pairs);

      // TODO does sorting contacts like this do any good
      let bodyContactCount: {[key: number]: number} = {}
      for (let i = 0; i < contacts.length; i++) {
        const body1 = contacts[i].colliderA.owner;
        const body2 = contacts[i].colliderB.owner;
        if(!bodyContactCount[body1.id.value]) {
          bodyContactCount[body1.id.value] = 1
        }
        if(!bodyContactCount[body2.id.value]) {
          bodyContactCount[body2.id.value] = 1
        }
        bodyContactCount[body1.id.value]++;
        bodyContactCount[body2.id.value]++;
      }
      contacts.sort((a, b) => 
        (bodyContactCount[a.colliderA.owner.id.value] + bodyContactCount[a.colliderB.owner.id.value] - 
        (bodyContactCount[b.colliderA.owner.id.value] + bodyContactCount[b.colliderB.owner.id.value])))

      // Resolve collisions adjust positions and apply velocities
      this._resolve(contacts, collisionDelta, Physics.collisionResolutionStrategy);

      // Record contacts
      contacts.forEach(c => this._currentFrameContacts.set(c.id, c));

      // Remove any pairs that can no longer collide
      pairs = pairs.filter(p => p.canCollide);

      iter--;
    }
    
    // Keep track of collisions contacts that have started or ended
    this.runContactStartEnd();
    // reset the last frame cache
    this._lastFrameContacts.clear();
    this._lastFrameContacts = new Map(this._currentFrameContacts);
  }

  debugDraw(ctx: CanvasRenderingContext2D) {
    this._processor.debugDraw(ctx)

    if (Physics.showContacts || Physics.showCollisionNormals) {
      for (const [_, contact] of this._currentFrameContacts) {
        if (Physics.showContacts) {
          contact.points.forEach(p => {
            DrawUtil.point(ctx, Color.Red, p);
          });
        }
        if (Physics.showCollisionNormals) {
          contact.points.forEach(p => {
            DrawUtil.vector(ctx, Color.Cyan, p, contact.normal, 30);
          });
        }
      }
    }
  }

  private _resolve(contacts: CollisionContact[], elapsedMs: number, strategy: CollisionResolutionStrategy): void {
    let bodyA: BodyComponent;
    let bodyB: BodyComponent;
    for (const contact of contacts) {
      bodyA = contact.colliderA.owner;
      bodyB = contact.colliderB.owner;
      if (strategy === CollisionResolutionStrategy.RigidBody) {
        this._resolveRigidBodyCollision(contact);
      } else if (strategy === CollisionResolutionStrategy.Box) {
        this._resolveBoxCollision(contact);
      } else {
        throw new Error('Unknown collision resolution strategy');
      }
  
      bodyA.resolveOverlap();
      bodyB.resolveOverlap();
      // TODO move to system
      // TODO still don't like this, this is a small integration step to resolve narrowphase collisions
      EulerIntegrator.integrate(bodyA.transform, bodyA.motion, bodyA.acc, elapsedMs * Physics.collisionShift);
      EulerIntegrator.integrate(bodyB.transform, bodyB.motion, bodyB.acc, elapsedMs * Physics.collisionShift);
    }
  }

  private _applyBoxImpulse(colliderA: Collider, colliderB: Collider, mtv: Vector) {
    if (colliderA.owner.collisionType === CollisionType.Active && colliderB.owner.collisionType !== CollisionType.Passive) {
      // Resolve overlaps
      if (colliderA.owner.collisionType === CollisionType.Active && colliderB.owner.collisionType === CollisionType.Active) {
        // split overlaps if both are Active
        mtv = mtv.scale(0.5);
      }
      // Apply mtv
      colliderA.owner.pos.y += mtv.y;
      colliderA.owner.pos.x += mtv.x;

      const mtvDir = mtv.normalize();

      // only adjust if velocity is opposite
      if (mtvDir.dot(colliderA.owner.vel) < 0) {
        // Cancel out velocity in direction of mtv
        const velAdj = mtvDir.scale(mtvDir.dot(colliderA.owner.vel.negate()));

        colliderA.owner.vel = colliderA.owner.vel.add(velAdj);
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

  private _resolveRigidBodyCollision(contact: CollisionContact) {
    // perform collision on bounding areas
    const bodyA: BodyComponent = contact.colliderA.owner;
    const bodyB: BodyComponent = contact.colliderB.owner;
    const mtv = contact.mtv; // normal pointing away from colliderA
    let normal = contact.normal; // normal pointing away from colliderA
    if (bodyA === bodyB) {
      // sanity check for existing pairs
      return;
    }

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

    if (bodyA.collisionType === CollisionType.Fixed) {
      bodyB.addOverlap(mtv);
    } else if (bodyB.collisionType === CollisionType.Fixed) {
      bodyA.addOverlap(mtv.negate());
    } else {
      // Split the mtv in half for the two bodies, potentially we could do something smarter here
      bodyB.addOverlap(mtv.scale(0.5));
      bodyA.addOverlap(mtv.scale(-0.5));
    }

    for (let point of contact.points) {
      const ra = point.sub(contact.colliderA.center); // point relative to colliderA position
      const rb = point.sub(contact.colliderB.center); /// point relative to colliderB

      // Relative velocity in linear terms
      // Angular to linear velocity formula -> omega = v/r
      const rv = bodyB.vel.add(rb.cross(-bodyB.angularVelocity)).sub(bodyA.vel.sub(ra.cross(bodyA.angularVelocity)));
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

      bodyB.applyImpulse(point, normal.scale(impulse));
      bodyA.applyImpulse(point, normal.scale(-impulse));

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

        bodyB.applyImpulse(point, frictionImpulse);
        bodyA.applyImpulse(point, frictionImpulse.negate());
      }
    }

    // TODO mtv hasn't actually been resolved yet
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

  public runContactStartEnd() {
    for (const [id, c] of this._currentFrameContacts) {
      // find all new contacts
      if (!this._lastFrameContacts.has(id)) {
        const colliderA = c.colliderA;
        const colliderB = c.colliderB;
        colliderA.events.emit('collisionstart', new CollisionStartEvent(colliderA, colliderB, c));
        colliderA.events.emit('contactstart', new ContactStartEvent(colliderA, colliderB, c) as any);
        colliderB.events.emit('collisionstart', new CollisionStartEvent(colliderB, colliderA, c));
        colliderB.events.emit('contactstart', new ContactStartEvent(colliderB, colliderA, c) as any);
      }
    }

    // find all contacts taht have ceased
    for (const [id, c] of this._lastFrameContacts) {
      if (!this._currentFrameContacts.has(id)) {
        const colliderA = c.colliderA;
        const colliderB = c.colliderB;
        colliderA.events.emit('collisionend', new CollisionEndEvent(colliderA, colliderB));
        colliderA.events.emit('contactend', new ContactEndEvent(colliderA, colliderB) as any);
        colliderB.events.emit('collisionend', new CollisionEndEvent(colliderB, colliderA));
        colliderB.events.emit('contactend', new ContactEndEvent(colliderB, colliderA) as any);
      }
    }
  }
}