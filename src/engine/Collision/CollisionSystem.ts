import { Camera } from '../Camera';
import { Color } from '../Drawing/Color';
import { Entity } from '../EntityComponentSystem';
import { MotionComponent } from '../EntityComponentSystem/Components/MotionComponent';
import { TransformComponent } from '../EntityComponentSystem/Components/TransformComponent';
import { AddedEntity, isAddedSystemEntity, RemovedEntity, System, SystemType } from '../EntityComponentSystem/System';
import { CollisionEndEvent, CollisionStartEvent, ContactEndEvent, ContactStartEvent } from '../Events';
import { CollisionResolutionStrategy, Physics } from './Physics';
import { Scene } from '../Scene';
import { DrawUtil } from '../Util/Index';
import { BodyComponent } from './Body';
import { ArcadeSolver } from './Solver/ArcadeSolver';
import { Collider } from './Shapes/Collider';
import { CollisionContact } from './Detection/CollisionContact';
import { DynamicTreeCollisionProcessor } from './Detection/DynamicTreeCollisionProcessor';
import { RealisticSolver } from './Solver/RealisticSolver';
import { CollisionSolver } from './Solver/Solver';

export class CollisionSystem extends System<TransformComponent | MotionComponent | BodyComponent> {
  public readonly types = ['ex.transform', 'ex.motion', 'ex.body'] as const;
  public systemType = SystemType.Update;
  public priority = -1;

  private _realisticSolver = new RealisticSolver();
  private _arcadeSolver = new ArcadeSolver();
  private _processor = new DynamicTreeCollisionProcessor();
  private _lastFrameContacts = new Map<string, CollisionContact>();
  private _currentFrameContacts = new Map<string, CollisionContact>();

  private _trackCollider = (c: Collider) => this._processor.track(c);
  private _untrackCollider = (c: Collider) => this._processor.untrack(c);

  // Ctx and camera are used for the debug draw
  private _camera: Camera;

  notify(message: AddedEntity | RemovedEntity) {
    if (isAddedSystemEntity(message)) {
      const bodyComponent = message.data.get(BodyComponent);
      bodyComponent.$collidersAdded.subscribe(this._trackCollider);
      bodyComponent.$collidersRemoved.subscribe(this._untrackCollider);
      for (const collider of bodyComponent.getColliders()) {
        this._processor.track(collider);
      }
    } else {
      const maybeBody = message.data.get(BodyComponent);
      if (maybeBody) {
        for (const collider of maybeBody.getColliders()) {
          this._processor.untrack(collider);
        }
      }
    }
  }

  initialize(scene: Scene) {
    this._camera = scene.camera;
  }

  update(_entities: Entity[], elapsedMs: number): void {
    if (!Physics.enabled) {
      // TODO remove system entirely if not enabled
      return;
    }

    // TODO refactor, collecting colliders like this feels rough and inefficient
    let colliders: Collider[] = [];
    for (const entity of _entities) {
      // Update body collider geometry, recomputes worldspace geometry
      entity.get(BodyComponent)?.update();
      // Bodies can have multiple colliders
      colliders = colliders.concat(entity.get(BodyComponent).getColliders());
    }

    // Update the spatial partitioning data structures
    // TODO if collider invalid it will break the processor
    // TODO rename "update" to something more specific
    this._processor.update(colliders);

    // Run broadphase on all colliders and locates potential collisions
    const pairs = this._processor.broadphase(colliders, elapsedMs);

    this._currentFrameContacts.clear();

    // Given possible pairs find actual contacts
    let contacts = this._processor.narrowphase(pairs);

    const solver: CollisionSolver = this.getSolver();

    // Solve
    contacts = solver.solve(contacts);

    // Record contacts
    contacts.forEach((c) => this._currentFrameContacts.set(c.id, c));

    // Emit contact start/end events
    this.runContactStartEnd();

    // reset the last frame cache
    this._lastFrameContacts.clear();

    // Keep track of collisions contacts that have started or ended
    this._lastFrameContacts = new Map(this._currentFrameContacts);
  }

  getSolver(): CollisionSolver {
    return Physics.collisionResolutionStrategy === CollisionResolutionStrategy.Realistic ? this._realisticSolver : this._arcadeSolver;
  }

  debugDraw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    this._camera.draw(ctx);
    this._processor.debugDraw(ctx);

    if (Physics.debug.showContacts || Physics.debug.showCollisionNormals) {
      for (const [_, contact] of this._currentFrameContacts) {
        if (Physics.debug.showContacts) {
          contact.points.forEach((p) => {
            DrawUtil.point(ctx, Color.Red, p);
          });
        }
        if (Physics.debug.showCollisionNormals) {
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
