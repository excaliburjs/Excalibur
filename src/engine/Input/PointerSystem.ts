import { Engine } from '../Engine';
import { System, TransformComponent, SystemType, Entity, World, Query, SystemPriority } from '../EntityComponentSystem';
import { GraphicsComponent } from '../Graphics/GraphicsComponent';
import { Scene } from '../Scene';
import { PointerComponent } from './PointerComponent';
import { PointerEventReceiver } from './PointerEventReceiver';
import { PointerEvent } from './PointerEvent';
import { CoordPlane } from '../Math/coord-plane';
import { SparseHashGrid } from '../Collision/Detection/SparseHashGrid';

/**
 * The PointerSystem is responsible for dispatching pointer events to entities
 * that need them.
 *
 * The PointerSystem can be optionally configured by the [[PointerComponent]], by default Entities use
 * the [[Collider]]'s shape for pointer events.
 */
export class PointerSystem extends System {
  public readonly systemType = SystemType.Update;
  public priority = SystemPriority.Higher;

  private _engine: Engine;
  private _receivers: PointerEventReceiver[];
  private _engineReceiver: PointerEventReceiver;
  private _graphicsHashGrid = new SparseHashGrid<GraphicsComponent>({ size: 100 });
  private _graphics: GraphicsComponent[] = [];
  private _entityToPointer = new Map<Entity, PointerComponent>();

  query: Query<typeof TransformComponent | typeof PointerComponent>;

  constructor(public world: World) {
    super();
    this.query = this.world.query([TransformComponent, PointerComponent]);

    this.query.entityAdded$.subscribe((e) => {
      const tx = e.get(TransformComponent);
      const pointer = e.get(PointerComponent);
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

  public lastFrameEntityToPointers = new Map<number, number[]>();
  public currentFrameEntityToPointers = new Map<number, number[]>();
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

  public entityCurrentlyUnderPointer(entity: Entity, pointerId: number) {
    return this.currentFrameEntityToPointers.has(entity.id) && this.currentFrameEntityToPointers.get(entity.id).includes(pointerId);
  }

  public entityWasUnderPointer(entity: Entity, pointerId: number) {
    return this.lastFrameEntityToPointers.has(entity.id) && this.lastFrameEntityToPointers.get(entity.id).includes(pointerId);
  }

  public entered(entity: Entity, pointerId: number) {
    return this.entityCurrentlyUnderPointer(entity, pointerId) && !this.lastFrameEntityToPointers.has(entity.id);
  }

  public left(entity: Entity, pointerId: number) {
    return !this.currentFrameEntityToPointers.has(entity.id) && this.entityWasUnderPointer(entity, pointerId);
  }

  public addPointerToEntity(entity: Entity, pointerId: number) {
    if (!this.currentFrameEntityToPointers.has(entity.id)) {
      this.currentFrameEntityToPointers.set(entity.id, [pointerId]);
      return;
    }
    const pointers = this.currentFrameEntityToPointers.get(entity.id);
    this.currentFrameEntityToPointers.set(entity.id, pointers.concat(pointerId));
  }

  public update(): void {
    // Update graphics
    this._graphicsHashGrid.update(this._graphics);

    // Locate all the pointer/entity mappings
    this._processPointerToEntity(this._sortedEntities);

    // Dispatch pointer events on entities
    this._dispatchEvents(this._sortedEntities);

    // Clear last frame's events
    this._receivers.forEach((r) => r.update());
    this.lastFrameEntityToPointers.clear();
    this.lastFrameEntityToPointers = new Map<number, number[]>(this.currentFrameEntityToPointers);
    this.currentFrameEntityToPointers.clear();
    this._receivers.forEach((r) => r.clear());
  }

  private _processPointerToEntity(entities: Entity[]) {
    let transform: TransformComponent;
    let pointer: PointerComponent;
    const receiver = this._engineReceiver;

    // Pre-process find entities under pointers
    for (let entityIndex = 0; entityIndex < entities.length; entityIndex++) {
      const entity = entities[entityIndex];
      transform = entity.get(TransformComponent);
      pointer = entity.get(PointerComponent);
      // If pointer bounds defined
      if (pointer && pointer.localBounds) {
        const pointerBounds = pointer.localBounds.transform(transform.get().matrix);
        for (const [pointerId, pos] of receiver.currentFramePointerCoords.entries()) {
          if (pointerBounds.contains(transform.coordPlane === CoordPlane.World ? pos.worldPos : pos.screenPos)) {
            this.addPointerToEntity(entity, pointerId);
          }
        }
      }
    }
    for (const [pointerId, pos] of receiver.currentFramePointerCoords.entries()) {
      const colliders = this._scene.physics.query(pos.worldPos);
      for (let i = 0; i < colliders.length; i++) {
        const collider = colliders[i];
        const maybePointer = this._entityToPointer.get(collider.owner);
        if (maybePointer && (pointer.useColliderShape || this.overrideUseColliderShape)) {
          this.addPointerToEntity(collider.owner, pointerId);
        }
      }

      const graphics = this._graphicsHashGrid.query(pos.worldPos);
      for (let i = 0; i < graphics.length; i++) {
        const graphic = graphics[i];
        const maybePointer = this._entityToPointer.get(graphic.owner);
        if ((maybePointer && pointer.useGraphicsBounds) || this.overrideUseGraphicsBounds) {
          this.addPointerToEntity(graphic.owner, pointerId);
        }
      }
    }
  }

  private _processDownAndEmit(entity: Entity): Map<number, PointerEvent> {
    const receiver = this._engineReceiver;
    const lastDownPerPointer = new Map<number, PointerEvent>(); // TODO will this get confused between receivers?
    // Loop through down and dispatch to entities
    for (const event of receiver.currentFrameDown) {
      if (event.active && entity.active && this.entityCurrentlyUnderPointer(entity, event.pointerId)) {
        entity.events.emit('pointerdown', event as any);
        if (receiver.isDragStart(event.pointerId)) {
          entity.events.emit('pointerdragstart', event as any);
        }
      }
      lastDownPerPointer.set(event.pointerId, event);
    }
    return lastDownPerPointer;
  }

  private _processUpAndEmit(entity: Entity): Map<number, PointerEvent> {
    const receiver = this._engineReceiver;
    const lastUpPerPointer = new Map<number, PointerEvent>();
    // Loop through up and dispatch to entities
    for (const event of receiver.currentFrameUp) {
      if (event.active && entity.active && this.entityCurrentlyUnderPointer(entity, event.pointerId)) {
        entity.events.emit('pointerup', event as any);
        if (receiver.isDragEnd(event.pointerId)) {
          entity.events.emit('pointerdragend', event as any);
        }
      }
      lastUpPerPointer.set(event.pointerId, event);
    }
    return lastUpPerPointer;
  }

  private _processMoveAndEmit(entity: Entity): Map<number, PointerEvent> {
    const receiver = this._engineReceiver;
    const lastMovePerPointer = new Map<number, PointerEvent>();
    // Loop through move and dispatch to entities
    for (const event of receiver.currentFrameMove) {
      if (event.active && entity.active && this.entityCurrentlyUnderPointer(entity, event.pointerId)) {
        // move
        entity.events.emit('pointermove', event as any);

        if (receiver.isDragging(event.pointerId)) {
          entity.events.emit('pointerdragmove', event as any);
        }
      }
      lastMovePerPointer.set(event.pointerId, event);
    }
    return lastMovePerPointer;
  }

  private _processEnterLeaveAndEmit(entity: Entity, lastUpDownMoveEvents: PointerEvent[]) {
    const receiver = this._engineReceiver;
    // up, down, and move are considered for enter and leave
    for (const event of lastUpDownMoveEvents) {
      // enter
      if (event.active && entity.active && this.entered(entity, event.pointerId)) {
        entity.events.emit('pointerenter', event as any);
        if (receiver.isDragging(event.pointerId)) {
          entity.events.emit('pointerdragenter', event as any);
        }
        break;
      }
      if (
        event.active &&
        entity.active &&
        // leave can happen on move
        (this.left(entity, event.pointerId) ||
          // or leave can happen on pointer up
          (this.entityCurrentlyUnderPointer(entity, event.pointerId) && event.type === 'up'))
      ) {
        entity.events.emit('pointerleave', event as any);
        if (receiver.isDragging(event.pointerId)) {
          entity.events.emit('pointerdragleave', event as any);
        }
        break;
      }
    }
  }

  private _processCancelAndEmit(entity: Entity) {
    const receiver = this._engineReceiver;
    // cancel
    for (const event of receiver.currentFrameCancel) {
      if (event.active && entity.active && this.entityCurrentlyUnderPointer(entity, event.pointerId)) {
        entity.events.emit('pointercancel', event as any);
      }
    }
  }

  private _processWheelAndEmit(entity: Entity) {
    const receiver = this._engineReceiver;
    // wheel
    for (const event of receiver.currentFrameWheel) {
      // Currently the wheel only fires under the primary pointer '0'
      if (event.active && entity.active && this.entityCurrentlyUnderPointer(entity, 0)) {
        entity.events.emit('pointerwheel', event as any);
      }
    }
  }

  private _dispatchEvents(entities: Entity[]) {
    const lastFrameEntities = new Set(this.lastFrameEntityToPointers.keys());
    const currentFrameEntities = new Set(this.currentFrameEntityToPointers.keys());
    // Filter preserves z order
    const entitiesWithEvents = entities.filter((e) => lastFrameEntities.has(e.id) || currentFrameEntities.has(e.id));
    let lastMovePerPointer: Map<number, PointerEvent>;
    let lastUpPerPointer: Map<number, PointerEvent>;
    let lastDownPerPointer: Map<number, PointerEvent>;
    // Dispatch events in entity z order
    for (const entity of entitiesWithEvents) {
      lastDownPerPointer = this._processDownAndEmit(entity);

      lastUpPerPointer = this._processUpAndEmit(entity);

      lastMovePerPointer = this._processMoveAndEmit(entity);

      const lastUpDownMoveEvents = [...lastMovePerPointer.values(), ...lastDownPerPointer.values(), ...lastUpPerPointer.values()];
      this._processEnterLeaveAndEmit(entity, lastUpDownMoveEvents);

      this._processCancelAndEmit(entity);

      this._processWheelAndEmit(entity);
    }
  }
}
