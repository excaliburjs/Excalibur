import { Engine } from '../Engine';
import { System, TransformComponent, SystemType, Entity, World, Query, SystemPriority } from '../EntityComponentSystem';
import { GraphicsComponent } from '../Graphics/GraphicsComponent';
import { Scene } from '../Scene';
import { PointerComponent } from './PointerComponent';
import { PointerEventReceiver } from './PointerEventReceiver';
import { CoordPlane } from '../Math/coord-plane';
import { SparseHashGrid } from '../Collision/Detection/SparseHashGrid';
import { PointerEventsToObjectDispatcher } from './PointerEventsToObjectDispatcher';

/**
 * The PointerSystem is responsible for dispatching pointer events to entities
 * that need them.
 *
 * The PointerSystem can be optionally configured by the {@apilink PointerComponent}, by default Entities use
 * the {@apilink Collider}'s shape for pointer events.
 */
export class PointerSystem extends System {
  static priority = SystemPriority.Higher;

  public readonly systemType = SystemType.Update;

  private _engine: Engine;
  private _receivers: PointerEventReceiver[];
  private _engineReceiver: PointerEventReceiver;
  private _graphicsHashGrid = new SparseHashGrid<GraphicsComponent>({ size: 100 });
  private _graphics: GraphicsComponent[] = [];
  private _entityToPointer = new Map<Entity, PointerComponent>();
  private _pointerEventDispatcher = new PointerEventsToObjectDispatcher();

  query: Query<typeof TransformComponent | typeof PointerComponent>;

  constructor(public world: World) {
    super();
    this.query = this.world.query([TransformComponent, PointerComponent]);

    this.query.entityAdded$.subscribe((e) => {
      const tx = e.get(TransformComponent);
      const pointer = e.get(PointerComponent);
      this._pointerEventDispatcher.addObject(
        e,
        (pos) => {
          // If pointer bounds defined
          if (pointer && pointer.localBounds) {
            const pointerBounds = pointer.localBounds.transform(tx.get().matrix);
            return pointerBounds.contains(tx.coordPlane === CoordPlane.World ? pos.worldPos : pos.screenPos);
          }
          return false;
        },
        () => e.isActive
      );
      this._entityToPointer.set(e, pointer);
      const maybeGfx = e.get(GraphicsComponent);
      if (maybeGfx) {
        this._graphics.push(maybeGfx);
        this._graphicsHashGrid.track(maybeGfx);
      }
      this._sortedTransforms.push(tx);
      this._sortedEntities.push(tx.owner);
      tx.zIndexChanged$.subscribe(this._zIndexUpdate);
      this._zHasChanged = true;
    });

    this.query.entityRemoved$.subscribe((e) => {
      this._pointerEventDispatcher.removeObject(e);
      const tx = e.get(TransformComponent);
      this._entityToPointer.delete(e);
      const maybeGfx = e.get(GraphicsComponent);
      if (maybeGfx) {
        const index = this._graphics.indexOf(maybeGfx);
        if (index > -1) {
          this._graphics.splice(index, 1);
        }
        this._graphicsHashGrid.untrack(maybeGfx);
      }
      tx.zIndexChanged$.unsubscribe(this._zIndexUpdate);
      const index = this._sortedTransforms.indexOf(tx);
      if (index > -1) {
        this._sortedTransforms.splice(index, 1);
        this._sortedEntities.splice(index, 1);
      }
    });
  }

  /**
   * Optionally override component configuration for all entities
   */
  public overrideUseColliderShape = false;
  /**
   * Optionally override component configuration for all entities
   */
  public overrideUseGraphicsBounds = false;

  private _scene: Scene<unknown>;

  public initialize(world: World, scene: Scene): void {
    this._engine = scene.engine;
    this._scene = scene;
  }

  private _sortedTransforms: TransformComponent[] = [];
  private _sortedEntities: Entity[] = [];

  private _zHasChanged = false;
  private _zIndexUpdate = () => {
    this._zHasChanged = true;
  };

  public preupdate(): void {
    if (this._scene.camera.hasChanged()) {
      // if the camera has changed we want to force a transform update so pointers can be correctly calc'd
      this._scene.camera.updateTransform(this._scene.camera.pos);
    }

    // event receiver might change per frame
    this._receivers = [this._engine.input.pointers, this._scene.input.pointers];
    this._engineReceiver = this._engine.input.pointers;
    if (this._zHasChanged) {
      this._sortedTransforms.sort((a, b) => {
        return b.z - a.z;
      });
      this._sortedEntities = this._sortedTransforms.map((t) => t.owner);
      this._zHasChanged = false;
    }
  }

  public update(): void {
    // Update graphics
    this._graphicsHashGrid.update(this._graphics);

    // Locate all the pointer/entity mappings
    for (const [pointerId, pos] of this._engineReceiver.currentFramePointerCoords.entries()) {
      const colliders = this._scene.physics.query(pos.worldPos);
      for (let i = 0; i < colliders.length; i++) {
        const collider = colliders[i];
        const maybePointer = this._entityToPointer.get(collider.owner);
        if (maybePointer && (maybePointer.useColliderShape || this.overrideUseColliderShape)) {
          this._pointerEventDispatcher.addPointerToObject(collider.owner, pointerId);
        }
      }

      const graphics = this._graphicsHashGrid.query(pos.worldPos);
      for (let i = 0; i < graphics.length; i++) {
        const graphic = graphics[i];
        const maybePointer = this._entityToPointer.get(graphic.owner);
        if (maybePointer && (maybePointer.useGraphicsBounds || this.overrideUseGraphicsBounds)) {
          this._pointerEventDispatcher.addPointerToObject(graphic.owner, pointerId);
        }
      }
    }

    this._pointerEventDispatcher.processPointerToObject(this._engineReceiver, this._sortedEntities);

    // Dispatch pointer events on entities
    this._pointerEventDispatcher.dispatchEvents(this._engineReceiver, this._sortedEntities);

    // Dispatch pointer events on top level pointers
    this._receivers.forEach((r) => r.update());

    // Clear last frame's events
    this._pointerEventDispatcher.clear();

    this._receivers.forEach((r) => r.clear());
  }
}
