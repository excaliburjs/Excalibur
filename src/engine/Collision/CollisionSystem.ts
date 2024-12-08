import { ComponentCtor, Query, SystemPriority, World } from '../EntityComponentSystem';
import { MotionComponent } from '../EntityComponentSystem/Components/MotionComponent';
import { TransformComponent } from '../EntityComponentSystem/Components/TransformComponent';
import { System, SystemType } from '../EntityComponentSystem/System';
import { CollisionEndEvent, CollisionStartEvent, ContactEndEvent, ContactStartEvent } from '../Events';
import { SolverStrategy } from './SolverStrategy';
import { ArcadeSolver } from './Solver/ArcadeSolver';
import { Collider } from './Colliders/Collider';
import { CollisionContact } from './Detection/CollisionContact';
import { RealisticSolver } from './Solver/RealisticSolver';
import { CollisionSolver } from './Solver/Solver';
import { ColliderComponent } from './ColliderComponent';
import { CompositeCollider } from './Colliders/CompositeCollider';
import { Engine } from '../Engine';
import { ExcaliburGraphicsContext } from '../Graphics/Context/ExcaliburGraphicsContext';
import { Scene } from '../Scene';
import { Side } from '../Collision/Side';
import { PhysicsWorld } from './PhysicsWorld';
import { CollisionProcessor } from './Detection/CollisionProcessor';
import { SeparatingAxis } from './Colliders/SeparatingAxis';
import { MotionSystem } from './MotionSystem';
import { Pair } from './Detection/Pair';
export class CollisionSystem extends System {
  static priority = SystemPriority.Higher;

  public systemType = SystemType.Update;
  public query: Query<ComponentCtor<TransformComponent> | ComponentCtor<MotionComponent> | ComponentCtor<ColliderComponent>>;

  private _engine: Engine;
  private _configDirty = false;
  private _realisticSolver: RealisticSolver;
  private _arcadeSolver: ArcadeSolver;
  private _lastFrameContacts = new Map<string, CollisionContact>();
  private _currentFrameContacts = new Map<string, CollisionContact>();
  private _motionSystem: MotionSystem;
  private get _processor(): CollisionProcessor {
    return this._physics.collisionProcessor;
  }

  private _trackCollider: (c: Collider) => void;
  private _untrackCollider: (c: Collider) => void;

  constructor(
    world: World,
    private _physics: PhysicsWorld
  ) {
    super();
    this._arcadeSolver = new ArcadeSolver(_physics.config.arcade);
    this._realisticSolver = new RealisticSolver(_physics.config.realistic);
    this._physics.$configUpdate.subscribe(() => (this._configDirty = true));
    this._trackCollider = (c: Collider) => this._processor.track(c);
    this._untrackCollider = (c: Collider) => this._processor.untrack(c);
    this.query = world.query([TransformComponent, MotionComponent, ColliderComponent]);
    this.query.entityAdded$.subscribe((e) => {
      const colliderComponent = e.get(ColliderComponent);
      colliderComponent.$colliderAdded.subscribe(this._trackCollider);
      colliderComponent.$colliderRemoved.subscribe(this._untrackCollider);
      const collider = colliderComponent.get();
      if (collider) {
        this._processor.track(collider);
      }
    });
    this.query.entityRemoved$.subscribe((e) => {
      const colliderComponent = e.get(ColliderComponent);
      const collider = colliderComponent.get();
      if (colliderComponent && collider) {
        this._processor.untrack(collider);
      }
    });
    this._motionSystem = world.get(MotionSystem) as MotionSystem;
  }

  initialize(world: World, scene: Scene) {
    this._engine = scene.engine;
  }

  update(elapsed: number): void {
    if (!this._physics.config.enabled) {
      return;
    }

    // TODO do we need to do this every frame?
    // Collect up all the colliders and update them
    let colliders: Collider[] = [];
    for (let entityIndex = 0; entityIndex < this.query.entities.length; entityIndex++) {
      const entity = this.query.entities[entityIndex];
      const colliderComp = entity.get(ColliderComponent);
      const collider = colliderComp?.get();
      if (colliderComp && colliderComp.owner?.isActive && collider) {
        colliderComp.update();

        // Flatten composite colliders
        if (collider instanceof CompositeCollider) {
          const compositeColliders = collider.getColliders();
          if (!collider.compositeStrategy) {
            collider.compositeStrategy = this._physics.config.colliders.compositeStrategy;
          }
          colliders = colliders.concat(compositeColliders);
        } else {
          colliders.push(collider);
        }
      }
    }

    // Update the spatial partitioning data structures
    // TODO if collider invalid it will break the processor
    // TODO rename "update" to something more specific
    this._processor.update(colliders, elapsed);

    // Run broadphase on all colliders and locates potential collisions
    let pairs = this._processor.broadphase(colliders, elapsed);

    this._currentFrameContacts.clear();

    // Given possible pairs find actual contacts
    let contacts: CollisionContact[] = []; // = this._processor.narrowphase(pairs, this._engine?.debug?.stats?.currFrame);

    const solver: CollisionSolver = this.getSolver();

    // Solve, this resolves the position/velocity so entities aren't overlapping
    const substep = this._physics.config.substep;
    for (let step = 0; step < substep; step++) {
      if (step > 0) {
        // first step is run by the MotionSystem when configured, so skip
        this._motionSystem.update(elapsed);
      }
      // Re-use pairs from previous collision
      if (contacts.length) {
        pairs = contacts.map((c) => new Pair(c.colliderA, c.colliderB));
      }

      if (pairs.length) {
        contacts = this._processor.narrowphase(pairs, this._engine?.debug?.stats?.currFrame);
        contacts = solver.solve(contacts);

        // Record contacts for start/end
        for (const contact of contacts) {
          if (contact.isCanceled()) {
            continue;
          }
          // Process composite ids, things with the same composite id are treated as the same collider for start/end
          const index = contact.id.indexOf('|');
          if (index > 0) {
            const compositeId = contact.id.substring(index + 1);
            this._currentFrameContacts.set(compositeId, contact);
          } else {
            this._currentFrameContacts.set(contact.id, contact);
          }
        }
      }
    }

    // Emit contact start/end events
    this.runContactStartEnd();

    // reset the last frame cache
    this._lastFrameContacts.clear();

    // Keep track of collisions contacts that have started or ended
    this._lastFrameContacts = new Map(this._currentFrameContacts);

    // Process deferred collider removals
    for (const entity of this.query.entities) {
      const collider = entity.get(ColliderComponent);
      if (collider) {
        collider.processColliderRemoval();
      }
    }
  }

  postupdate(): void {
    SeparatingAxis.SeparationPool.done();
  }

  getSolver(): CollisionSolver {
    if (this._configDirty) {
      this._configDirty = false;
      this._arcadeSolver = new ArcadeSolver(this._physics.config.arcade);
      this._realisticSolver = new RealisticSolver(this._physics.config.realistic);
    }
    return this._physics.config.solver === SolverStrategy.Realistic ? this._realisticSolver : this._arcadeSolver;
  }

  debug(ex: ExcaliburGraphicsContext) {
    this._processor.debug(ex, 0);
  }

  public runContactStartEnd() {
    // If composite colliders are 'together' collisions may have a duplicate id because we want to treat those as a singular start/end
    for (const [id, c] of this._currentFrameContacts) {
      // find all new contacts
      if (!this._lastFrameContacts.has(id)) {
        const colliderA = c.colliderA;
        const colliderB = c.colliderB;
        const side = Side.fromDirection(c.mtv);
        const opposite = Side.getOpposite(side);
        colliderA.events.emit('collisionstart', new CollisionStartEvent(colliderA, colliderB, side, c));
        colliderA.events.emit('contactstart', new ContactStartEvent(colliderA, colliderB, side, c) as any);
        colliderB.events.emit('collisionstart', new CollisionStartEvent(colliderB, colliderA, opposite, c));
        colliderB.events.emit('contactstart', new ContactStartEvent(colliderB, colliderA, opposite, c) as any);
      }
    }

    // find all contacts that have ceased
    for (const [id, c] of this._lastFrameContacts) {
      if (!this._currentFrameContacts.has(id)) {
        const colliderA = c.colliderA;
        const colliderB = c.colliderB;
        const side = Side.fromDirection(c.mtv);
        const opposite = Side.getOpposite(side);
        colliderA.events.emit('collisionend', new CollisionEndEvent(colliderA, colliderB, side, c));
        colliderA.events.emit('contactend', new ContactEndEvent(colliderA, colliderB, side, c) as any);
        colliderB.events.emit('collisionend', new CollisionEndEvent(colliderB, colliderA, opposite, c));
        colliderB.events.emit('contactend', new ContactEndEvent(colliderB, colliderA, opposite, c) as any);
      }
    }
  }
}
