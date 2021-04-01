import { Vector } from "../Algebra";
import { Camera } from "../Camera";
import { Color } from "../Drawing/Color";
import { Entity } from "../EntityComponentSystem";
import { MotionComponent } from "../EntityComponentSystem/Components/MotionComponent";
import { TransformComponent } from "../EntityComponentSystem/Components/TransformComponent";
import { AddedEntity, isAddedSystemEntity, RemovedEntity, System, SystemType } from "../EntityComponentSystem/System";
import { AfterCollisionResolveEvent, BeforeCollisionResolveEvent, CollisionEndEvent, CollisionStartEvent, ContactEndEvent, ContactStartEvent, PostCollisionEvent, PreCollisionEvent } from "../Events";
import { CollisionResolutionStrategy, Physics } from "../Physics";
import { Scene } from "../Scene";
import { DrawUtil } from "../Util/Index";
import { BodyComponent } from "./Body";
import { BoxSolver } from "./Solver/BoxSolver";
import { Collider } from "./Collider";
import { CollisionContact } from "./Detection/CollisionContact";
import { CollisionType } from "./CollisionType";
import { DynamicTreeCollisionProcessor } from "./Detection/DynamicTreeCollisionProcessor";
import { RigidBodySolver } from "./Solver/RigidBodySolver";
import { Side } from "./Side";

export class CollisionSystem extends System<TransformComponent | MotionComponent | BodyComponent> {
  public readonly types = ['transform', 'motion', 'body'] as const;
  public systemType = SystemType.Update;
  public priority = -1;

  private _processor = new DynamicTreeCollisionProcessor();
  private _lastFrameContacts = new Map<string, CollisionContact>();
  private _currentFrameContacts = new Map<string, CollisionContact>();

  private _trackCollider = (c: Collider) => this._processor.track(c);
  private _untrackCollider = (c: Collider) => this._processor.untrack(c);

  // Ctx and camera are used for the debug draw
  private _camera: Camera;

  notify(message: AddedEntity<TransformComponent | MotionComponent | BodyComponent> | RemovedEntity) {
    if (isAddedSystemEntity(message)) {
      message.data.components.body.$collidersAdded.subscribe(this._trackCollider);
      message.data.components.body.$collidersRemoved.subscribe(this._untrackCollider);
      for (let collider of message.data.components.body.getColliders()) {
        this._processor.track(collider);
      }
    }
  }

  initialize(scene: Scene) {
    this._camera = scene.camera;
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
    this._processor.update(colliders); // TODO if collider invalid it will break the processor

    // Run broadphase on all colliders and locates potential collisions
    let pairs = this._processor.broadphase(colliders, elapsedMs);

    let iter: number = Physics.collisionPasses;
    this._currentFrameContacts.clear();
    while (iter > 0) {
      // Re-run narrowphase each pass
      let contacts = this._processor.narrowphase(pairs);

      // Sort by most severe contacts
      contacts = contacts.sort((a, b) => b.mtv.size - a.mtv.size);

      // Resolve collisions adjust positions and apply velocities
      if (Physics.collisionResolutionStrategy === CollisionResolutionStrategy.RigidBody) {
        this._resolveRigidBody(contacts);
      } else {
        this._resolveBoxCollisions(contacts)
      }

      // Record contacts
      contacts.forEach(c => this._currentFrameContacts.set(c.id, c));

      // Remove any pairs that can no longer collide
      // Or they did not have a contact
      pairs = pairs.filter(p => p.canCollide && contacts.find(c => c.id === p.id));

      iter--;
    }
    
    // Keep track of collisions contacts that have started or ended
    this.runContactStartEnd();
    // reset the last frame cache
    this._lastFrameContacts.clear();
    this._lastFrameContacts = new Map(this._currentFrameContacts);
  }

  debugDraw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    this._camera.draw(ctx);
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
    ctx.restore();
  }

  private _resolveRigidBody(contacts: CollisionContact[]): void {    
    let bodyA: BodyComponent;
    let bodyB: BodyComponent;
    let contactCounts: {[id: string]: number } = {};

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

      contact.matchAwake();
      let a = contact.colliderA.owner.id.value;
      let b = contact.colliderB.owner.id.value;

      if (!contactCounts[a]) {
        contactCounts[a] = 1;
      } else {
        contactCounts[a]++;
      }

      if (!contactCounts[b]) {
        contactCounts[b] = 1;
      } else {
        contactCounts[b]++;
      }
    }

    // Resolve position
    for (const contact of contacts) {
      bodyA = contact.colliderA.owner;
      bodyB = contact.colliderB.owner;

      for (let i = 0; i < Physics.positionIterations; i++) {
        this._solvePosition(contact, contactCounts[bodyA.id.value], contactCounts[bodyB.id.value]);
      }

      bodyA.applyOverlap();
      bodyB.applyOverlap();
    }

    // Resolve velocity
    for (const contact of contacts) {
      bodyA = contact.colliderA.owner;
      bodyB = contact.colliderB.owner;

      for (let i = 0; i < Physics.velocityIterations; i++) {
        this._solveVelocity(contact, contactCounts[bodyA.id.value], contactCounts[bodyB.id.value]);
      }
    }

    for (const contact of contacts) {
      bodyA = contact.colliderA.owner;
      bodyB = contact.colliderB.owner;
      // After solving position the "real" instantaneous velocity could actually be different

      const accA = bodyA.acc.clone();
      const accB = bodyB.acc.clone();
      if (bodyA.collisionType === CollisionType.Active && bodyA.useGravity) {
        accA.addEqual(Physics.gravity);
      }
      if (bodyB.collisionType === CollisionType.Active && bodyB.useGravity) {
        accB.addEqual(Physics.gravity);
      }

      // Find resting contact and zero velocity in contact direction
      const velA = bodyA.pos.sub(bodyA.oldPos).size;
      const rotA = Math.abs(bodyA.angularVelocity * 5);
      const velB = bodyB.pos.sub(bodyB.oldPos).size;
      const rotB = Math.abs(bodyB.angularVelocity * 5);
      if (!bodyA.sleeping && velA * velA < Physics.restingContactThreshold && rotA < .1) {
        const adjust = bodyA.vel.dot(contact.normal.negate());
        const adjustContact = contact.normal.scale(adjust);
        bodyA.vel.addEqual(adjustContact);

        // add a "resting" friction
        const friction = bodyA.vel.negate().scale(.5);
        bodyA.vel.addEqual(friction);
      }

      if (!bodyB.sleeping && velB * velB < Physics.restingContactThreshold && rotB < .1) {
        const adjust = bodyB.vel.dot(contact.normal);
        const adjustContact = contact.normal.scale(adjust);
        bodyB.vel.subEqual(adjustContact);
        // add a "resting" friction
        const friction = bodyA.vel.negate().scale(.5);
        bodyB.vel.addEqual(friction);
      }

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

  private _resolveBoxCollisions(contacts: CollisionContact[]) {
    for (let contact of contacts) {
      const side = Side.fromDirection(contact.mtv);
      const mtv = contact.mtv.negate();
      // Publish collision events on both participants
      contact.colliderA.events.emit('precollision', new PreCollisionEvent(contact.colliderA, contact.colliderB, side, mtv));
      contact.colliderB.events.emit('precollision', new PreCollisionEvent(contact.colliderB, contact.colliderA, Side.getOpposite(side), mtv.negate()));
      
      this._applyBoxImpulse(contact.colliderA, contact.colliderB, mtv);
      this._applyBoxImpulse(contact.colliderB, contact.colliderA, mtv.negate());
    }
  }

  private _solvePosition(contact: CollisionContact, numberContactsA: number, numberContactsB: number) {
    const bodyA: BodyComponent = contact.colliderA.owner;
    const bodyB: BodyComponent = contact.colliderB.owner;

    const centerA = bodyA.center.add(bodyA.totalOverlap);

    const sepScale = centerA.sub((bodyA.center.sub(contact.mtv).add(bodyB.totalOverlap))).dot(contact.normal);
    const separation = contact.normal.scale(Math.abs(sepScale));

    if (bodyA.collisionType === CollisionType.Fixed || bodyA.sleeping) {
      bodyB.addOverlap(separation.scale(Physics.overlapDampening / numberContactsB));
    } else if (bodyB.collisionType === CollisionType.Fixed || bodyB.sleeping) {
      bodyA.addOverlap(separation.negate().scale(Physics.overlapDampening / numberContactsA));
    } else {
      // Split the mtv in half for the two bodies, potentially we could do something smarter here
      bodyB.addOverlap(separation.scale(0.5).scale(Physics.overlapDampening / numberContactsB));
      bodyA.addOverlap(separation.scale(-0.5).scale(Physics.overlapDampening / numberContactsA));
    }

  }

  private _solveVelocity(contact: CollisionContact, numberContactsA: number, numberContactsB: number) {
    // perform collision on bounding areas
    const bodyA: BodyComponent = contact.colliderA.owner;
    const bodyB: BodyComponent = contact.colliderB.owner;

    const contactSplit = 1 / (numberContactsA + numberContactsB)
    let normal = contact.normal; // normal pointing away from colliderA
    if (bodyA === bodyB) {
      // sanity check for existing pairs
      return;
    }


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

    for (let point of contact.points) {
      // TODO should this be body center now?
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

      bodyB.applyImpulse(point, normal.scale(impulse * contactSplit));
      bodyA.applyImpulse(point, normal.scale(-impulse * contactSplit));

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
          frictionImpulse = t.scale(jt * contactSplit).negate();
        } else {
          frictionImpulse = t.scale(-impulse * coefFriction * contactSplit);
        }

        bodyB.applyImpulse(point, frictionImpulse);
        bodyA.applyImpulse(point, frictionImpulse.negate());
      }
    }

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