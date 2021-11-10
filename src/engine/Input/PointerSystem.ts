import { ColliderComponent } from '../Collision/ColliderComponent';
import { Engine } from '../Engine';
import { System, TransformComponent, SystemType, Entity } from '../EntityComponentSystem';
import { GraphicsComponent } from '../Graphics/GraphicsComponent';
import { Scene } from '../Scene';
import { PointerComponent } from './PointerComponent';
import { PointerEventReceiver } from './PointerEventReceiver';
import { PointerEvent } from './PointerEvent';

/**
 * The PointerSystem is responsible for dispatching pointer events to entities
 * that need them.
 *
 * The PointerSystem can be optionally configured by the [[PointerComponent]], by default Entities use
 * the [[Collider]]'s shape for pointer events.
 */
export class PointerSystem extends System<TransformComponent | PointerComponent> {
  public readonly types = ['ex.transform', 'ex.pointer'] as const;
  public readonly systemType = SystemType.Update;
  public priority = -1;

  private _engine: Engine;
  private _receiver: PointerEventReceiver;

  public lastFrameEntityToPointers = new Map<number, number[]>();
  public currentFrameEntityToPointers = new Map<number, number[]>();

  public initialize(scene: Scene): void {
    this._engine = scene.engine;
    this._receiver = this._engine.input.pointers;
  }

  public sort(a: Entity, b: Entity) {
    // Sort from high to low, because things on 'top' receive the pointer events first
    return b.get(TransformComponent).z - a.get(TransformComponent).z;
  }

  public entityCurrentlyUnderPointer(entity: Entity, pointerId: number) {
    return this.currentFrameEntityToPointers.has(entity.id) &&
           this.currentFrameEntityToPointers.get(entity.id).includes(pointerId);
  }

  public entityWasUnderPointer(entity: Entity, pointerId: number) {
    return this.lastFrameEntityToPointers.has(entity.id) &&
           this.lastFrameEntityToPointers.get(entity.id).includes(pointerId);
  }

  public entered(entity: Entity, pointerId: number) {
    return this.entityCurrentlyUnderPointer(entity, pointerId) &&
           !this.lastFrameEntityToPointers.has(entity.id);
  }

  public left(entity: Entity, pointerId: number) {
    return !this.currentFrameEntityToPointers.has(entity.id) &&
            this.entityWasUnderPointer(entity, pointerId);
  }

  public addPointerToEntity(entity: Entity, pointerId: number) {
    if (!this.currentFrameEntityToPointers.has(entity.id)) {
      this.currentFrameEntityToPointers.set(entity.id, [pointerId]);
      return;
    }
    const pointers = this.currentFrameEntityToPointers.get(entity.id);
    this.currentFrameEntityToPointers.set(entity.id, pointers.concat(pointerId));
  }

  public update(entities: Entity[]): void {
    // Locate all the pointer/entity mappings
    this._processPointerToEntity(entities);

    // Dispatch pointer events on entities
    this._dispatchEvents(entities);

    // Clear last frame's events
    this._receiver.update();
    this.lastFrameEntityToPointers.clear();
    this.lastFrameEntityToPointers = new Map<number, number[]>(this.currentFrameEntityToPointers);
    this.currentFrameEntityToPointers.clear();
    this._receiver.clear();
  }

  private _processPointerToEntity(entities: Entity[]) {
    let transform: TransformComponent;
    let collider: ColliderComponent;
    let graphics: GraphicsComponent;
    let pointer: PointerComponent;

    // TODO probably a spatial partition optimization here to quickly query bounds for pointer
    // Pre-process find entities under pointers
    for (const entity of entities) {
      transform = entity.get(TransformComponent);
      pointer = entity.get(PointerComponent) ?? new PointerComponent;
      // Check collider contains pointer
      collider = entity.get(ColliderComponent);
      if (collider && pointer.useColliderShape) {
        const geom = collider.get();
        if (geom) {
          for (const [pointerId, pos] of this._receiver.currentFramePointerPositions.entries()) {
            if (geom.contains(pos)) {
              this.addPointerToEntity(entity, pointerId);
            }
          }
        }
      }

      // Check graphics contains pointer
      graphics = entity.get(GraphicsComponent);
      if (graphics && pointer.useGraphicsBounds) {
        const graphicBounds = graphics.localBounds.transform(transform.getGlobalMatrix());
        for (const [pointerId, pos] of this._receiver.currentFramePointerPositions.entries()) {
          if (graphicBounds.contains(pos)) {
            this.addPointerToEntity(entity, pointerId);
          }
        }
      }
    }
  }

  private _processDownAndEmit(entity: Entity): Map<number, PointerEvent> {
    const lastDownPerPointer = new Map<number, PointerEvent>();
    // Loop through down and dispatch to entities
    for (const event of this._receiver.currentFrameDown) {
      if (event.active && entity.active && this.entityCurrentlyUnderPointer(entity, event.pointerId)) {
        entity.events.emit('pointerdown', event as any);
        if (this._receiver.isDragStart(event.pointerId)) {
          entity.events.emit('pointerdragstart', event as any);
        }
      }
      lastDownPerPointer.set(event.pointerId, event);
    }
    return lastDownPerPointer;
  }

  private _processUpAndEmit(entity: Entity): Map<number, PointerEvent> {
    const lastUpPerPointer = new Map<number, PointerEvent>();
    // Loop through up and dispatch to entities
    for (const event of this._receiver.currentFrameUp) {
      if (event.active && entity.active && this.entityCurrentlyUnderPointer(entity, event.pointerId)) {
        entity.events.emit('pointerup', event as any);
        if (this._receiver.isDragEnd(event.pointerId)) {
          entity.events.emit('pointerdragend', event as any);
        }
      }
      lastUpPerPointer.set(event.pointerId, event);
    }
    return lastUpPerPointer;
  }

  private _processMoveAndEmit(entity: Entity): Map<number, PointerEvent> {
    const lastMovePerPointer = new Map<number, PointerEvent>();
    // Loop through move and dispatch to entities
    for (const event of this._receiver.currentFrameMove) {
      if (event.active && entity.active && this.entityCurrentlyUnderPointer(entity, event.pointerId)) {
        // move
        entity.events.emit('pointermove', event as any);

        if (this._receiver.isDragging(event.pointerId)) {
          entity.events.emit('pointerdragmove', event as any);
        }
      }
      lastMovePerPointer.set(event.pointerId, event);
    }
    return lastMovePerPointer;
  }

  private _processEnterLeaveAndEmit(entity: Entity, lastUpDownMoveEvents: PointerEvent[]) {
    // up, down, and move are considered for enter and leave
    for (const event of lastUpDownMoveEvents) {
      // enter
      if (event.active && entity.active && this.entered(entity, event.pointerId)) {
        entity.events.emit('pointerenter', event as any);
        if (this._receiver.isDragging(event.pointerId)) {
          entity.events.emit('pointerdragenter', event as any);
        }
        break;
      }
      if (event.active && entity.active &&
          // leave can happen on move
          (this.left(entity, event.pointerId) ||
          // or leave can happen on pointer up
          (this.entityCurrentlyUnderPointer(entity, event.pointerId) && event.type === 'up'))) {
        entity.events.emit('pointerleave', event as any);
        if (this._receiver.isDragging(event.pointerId)) {
          entity.events.emit('pointerdragleave', event as any);
        }
        break;
      }
    }
  }

  private _processCancelAndEmit(entity: Entity) {
    // cancel
    for (const event of this._receiver.currentFrameCancel) {
      if (event.active && entity.active && this.entityCurrentlyUnderPointer(entity, event.pointerId)){
        entity.events.emit('pointercancel', event as any);
      }
    }
  }

  private _processWheelAndEmit(entity: Entity) {
    // wheel
    for (const event of this._receiver.currentFrameWheel) {
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
    const entitiesWithEvents = entities.filter(e => lastFrameEntities.has(e.id) || currentFrameEntities.has(e.id));
    let lastMovePerPointer: Map<number, PointerEvent>;
    let lastUpPerPointer: Map<number, PointerEvent>;
    let lastDownPerPointer: Map<number, PointerEvent>;
    // Dispatch events in entity z order
    for (const entity of entitiesWithEvents) {
      lastDownPerPointer = this._processDownAndEmit(entity);

      lastUpPerPointer = this._processUpAndEmit(entity);

      lastMovePerPointer = this._processMoveAndEmit(entity);

      const lastUpDownMoveEvents = [
        ...lastMovePerPointer.values(),
        ...lastDownPerPointer.values(),
        ...lastUpPerPointer.values()
      ];
      this._processEnterLeaveAndEmit(entity, lastUpDownMoveEvents);

      this._processCancelAndEmit(entity);

      this._processWheelAndEmit(entity);
    }
  }
}