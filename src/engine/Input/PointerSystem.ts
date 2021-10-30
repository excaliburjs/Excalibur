import { ColliderComponent } from "../Collision/ColliderComponent";
import { Engine } from "../Engine";
import { System, TransformComponent, SystemType, Entity } from "../EntityComponentSystem";
import { GraphicsComponent } from "../Graphics/GraphicsComponent";
import { Scene } from "../Scene";
import { PointerComponent } from "./PointerComponent";
import { PointerEventReceiver } from "./PointerEventReceiver";
import { ExPointerEvent } from "./ExPointerEvent";

/**
 * The PointerSystem is responsible for dispatching pointer events to entities
 * that need them.
 * 
 * The PointerSystem can be optionally configured by the [[PointerComponent]], by default Entities use
 * the [[Collider]]'s shape for pointer events.
 */
export class PointerSystem extends System<TransformComponent> {
  public readonly types = ["ex.transform"] as const;
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
           this.currentFrameEntityToPointers.get(entity.id).includes(pointerId)
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
            this.entityWasUnderPointer(entity, pointerId)
  }

  public addPointerToEntity(entity: Entity, pointerId: number) {
    if (!this.currentFrameEntityToPointers.has(entity.id)) {
      this.currentFrameEntityToPointers.set(entity.id, [pointerId])
      return;
    }
    const pointers = this.currentFrameEntityToPointers.get(entity.id);
    this.currentFrameEntityToPointers.set(entity.id, pointers.concat(pointerId));
  }

  public update(entities: Entity[]): void {
    // Locate all the pointer/entity mappings
    this._processPointerToEntity(entities)

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
    let pointerConfig: PointerComponent;

    // TODO probably a spatial partition optimization here to quickly query bounds for pointer
    // Pre-process find entities under pointers
    for (let entity of entities) {
      // transform = entity.get(TransformComponent);
      pointerConfig = entity.get(PointerComponent) ?? new PointerComponent;
      // Check collider contains pointer
      collider = entity.get(ColliderComponent);
      if (collider && pointerConfig.useColliderShape) {
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
      if (graphics && pointerConfig.useGraphicsBounds) {
        const graphicBounds = graphics.localBounds.transform(transform.getGlobalMatrix())
        for (const [pointerId, pos] of this._receiver.currentFramePointerPositions.entries()) {
          if (graphicBounds.contains(pos)) {
            this.addPointerToEntity(entity, pointerId);
          }
        }
      }
    }
  }

  private _dispatchEvents(entities: Entity[]) {
    const lastFrameEntities = new Set(this.lastFrameEntityToPointers.keys());
    const currentFrameEntities = new Set(this.currentFrameEntityToPointers.keys());
    // Filter preserves z order 
    const entitiesWithEvents = entities.filter(e => lastFrameEntities.has(e.id) || currentFrameEntities.has(e.id));
    const lastMovePerPointer = new Map<number, ExPointerEvent>();
    const lastUpPerPointer = new Map<number, ExPointerEvent>();
    const lastDownPerPointer = new Map<number, ExPointerEvent>();
    // Dispatch events in entity z order
    for (let entity of entitiesWithEvents) {
      // Loop through down and dispatch to entities
      for (let event of this._receiver.currentFrameDown) {
        if (event.active && entity.active && this.entityCurrentlyUnderPointer(entity, event.pointerId)) {
          entity.events.emit('pointerdown', event as any);
          if (this._receiver.isDragStart(event.pointerId)) {
            entity.events.emit('pointerdragstart', event as any);
          }
        }
        lastDownPerPointer.set(event.pointerId, event);
      }
      // Loop through up and dispatch to entities
      for (let event of this._receiver.currentFrameUp) {
        if (event.active && entity.active && this.entityCurrentlyUnderPointer(entity, event.pointerId)) {
          entity.events.emit('pointerup', event as any);
          if (this._receiver.isDragEnd(event.pointerId)) {
            entity.events.emit('pointerdragend', event as any);
          }
        }
        lastUpPerPointer.set(event.pointerId, event);
      }

      // Loop through move and dispatch to entities
      for (let event of this._receiver.currentFrameMove) {
        if (event.active && entity.active && this.entityCurrentlyUnderPointer(entity, event.pointerId)) {
          // move
          entity.events.emit('pointermove', event as any);

          if (this._receiver.isDragging(event.pointerId)) {
            entity.events.emit('pointerdragmove', event as any);
          }
        }
        lastMovePerPointer.set(event.pointerId, event);
      }
      const lastEvents = [...lastMovePerPointer.values(), ...lastDownPerPointer.values(), ...lastUpPerPointer.values()];
      // up, down, and move are considered for enter and leave
      for (let event of lastEvents) {
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

      // cancel
      for (let event of this._receiver.currentFrameCancel) {
        if (event.active && entity.active && this.entityCurrentlyUnderPointer(entity, event.pointerId)){
          entity.events.emit('pointercancel', event as any);
        }
      }

      // wheel
      for (let event of this._receiver.currentFrameWheel) {
        // Currently the wheel only fires under the primary pointer '0'
        if (event.active && entity.active && this.entityCurrentlyUnderPointer(entity, 0)) {
          entity.events.emit('pointerwheel', event as any);
        }
      }
    }
  }
}