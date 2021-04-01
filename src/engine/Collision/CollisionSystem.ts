import { Camera } from '../Camera';
import { Color } from '../Drawing/Color';
import { Entity } from '../EntityComponentSystem';
import { MotionComponent } from '../EntityComponentSystem/Components/MotionComponent';
import { TransformComponent } from '../EntityComponentSystem/Components/TransformComponent';
import { AddedEntity, isAddedSystemEntity, RemovedEntity, System, SystemType } from '../EntityComponentSystem/System';
import { CollisionEndEvent, CollisionStartEvent, ContactEndEvent, ContactStartEvent } from '../Events';
import { CollisionResolutionStrategy, Physics } from '../Physics';
import { Scene } from '../Scene';
import { DrawUtil } from '../Util/Index';
import { BodyComponent } from './Body';
import { BoxSolver } from './Solver/BoxSolver';
import { Collider } from './Collider';
import { CollisionContact } from './Detection/CollisionContact';
import { DynamicTreeCollisionProcessor } from './Detection/DynamicTreeCollisionProcessor';
import { RigidBodySolver } from './Solver/RigidBodySolver';
import { CollisionSolver } from './Solver/Solver';

export class CollisionSystem extends System<TransformComponent | MotionComponent | BodyComponent> {
  public readonly types = ['transform', 'motion', 'body'] as const;
  public systemType = SystemType.Update;
  public priority = -1;

  private _rigidBodySolver = new RigidBodySolver();
  private _boxSolver = new BoxSolver();
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
      for (const collider of message.data.components.body.getColliders()) {
        this._processor.track(collider);
      }
    }
  }

  initialize(scene: Scene) {
    this._camera = scene.camera;
  }

  update(_entities: Entity<TransformComponent | MotionComponent | BodyComponent>[], elapsedMs: number): void {
    if (!Physics.enabled) {
      // TODO remove system entirely if not enabled
      return;
    }

    // TODO refactor, collecting colliders like this feels rough and inefficient
    let colliders: Collider[] = [];
    for (const entity of _entities) {
      entity.components.body.update(); // Update body collider geometry
      colliders = colliders.concat(entity.components.body.getColliders());
    }

    // Update the spatial partitioning data structures
    // TODO if collider invalid it will break the processor
    this._processor.update(colliders);

    // Run broadphase on all colliders and locates potential collisions
    const pairs = this._processor.broadphase(colliders, elapsedMs);

    this._currentFrameContacts.clear();

    // Given possible pairs find actual contacts
    const contacts = this._processor.narrowphase(pairs);

    const solver: CollisionSolver = this._getSolver();

    // Events and init
    solver.preSolve(contacts);

    // Solve velocity first
    solver.solveVelocity(contacts);

    // Solve position last because non-penetration is the most important
    solver.solvePosition(contacts);

    // Events and contact house-keeping
    solver.postSolve(contacts);

    // Record contacts
    contacts.forEach((c) => this._currentFrameContacts.set(c.id, c));

    // Keep track of collisions contacts that have started or ended
    this.runContactStartEnd();

    // reset the last frame cache
    this._lastFrameContacts.clear();
    this._lastFrameContacts = new Map(this._currentFrameContacts);
  }

  private _getSolver(): CollisionSolver {
    return Physics.collisionResolutionStrategy === CollisionResolutionStrategy.RigidBody ? this._rigidBodySolver : this._boxSolver;
  }

  debugDraw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    this._camera.draw(ctx);
    this._processor.debugDraw(ctx);

    if (Physics.showContacts || Physics.showCollisionNormals) {
      for (const [_, contact] of this._currentFrameContacts) {
        if (Physics.showContacts) {
          contact.points.forEach((p) => {
            DrawUtil.point(ctx, Color.Red, p);
          });
        }
        if (Physics.showCollisionNormals) {
          contact.points.forEach((p) => {
            DrawUtil.vector(ctx, Color.Cyan, p, contact.normal, 30);
          });
        }
      }
    }
    ctx.restore();
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
