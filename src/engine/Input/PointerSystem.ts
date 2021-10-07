import { ColliderComponent, Engine, GraphicsComponent } from "..";
import { System, TransformComponent, SystemType, Entity } from "../EntityComponentSystem";
import { Scene } from "../Scene";
import { PointerComponent } from "./PointerComponent";
import { ExPointerEvent, PointerEventReceiver } from "./PointerEventReceiver";

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
    // TODO maybe move the processor to engine?
    this._receiver = new PointerEventReceiver(this._engine.canvas, this._engine);
    this._receiver.attach();
    // TODO detach?
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

  update(entities: Entity[]): void {

    // Locate all the pointer/entity mappings
    this._processPointerToEntity(entities)

    // Dispatch pointer events on entities
    this._dispatchEvents(entities);

    // Clear last frame's events
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
          for (const [pointerId, pos] of this._receiver.pointerPositions) {
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
        for (const [pointerId, pos] of this._receiver.pointerPositions) {
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
    // Dispatch events in entity z order
    for (let entity of entitiesWithEvents) {
      // down
      for (let event of this._receiver.down) {
        if (event.active && entity.active && this.entityCurrentlyUnderPointer(entity, event.pointerId)) {
          entity.events.emit('pointerdown', event as any);
        }
      }
      // up
      for (let event of this._receiver.up) {
        if (event.active && entity.active && this.entityCurrentlyUnderPointer(entity, event.pointerId)) {
          entity.events.emit('pointerup', event as any);
        }
      }

      for (let event of this._receiver.move) {
        if (event.active && entity.active && this.entityCurrentlyUnderPointer(entity, event.pointerId)) {
          // move
          entity.events.emit('pointermove', event as any);
        }
        lastMovePerPointer.set(event.pointerId, event);
      }

      for (let event of lastMovePerPointer.values()) {
        // enter
        if (event.active && entity.active && this.entered(entity, event.pointerId)) {
          entity.events.emit('pointerenter', event as any);
        }
        // leave
        if (event.active && entity.active && this.left(entity, event.pointerId)) {
          entity.events.emit('pointerleave', event as any);
        }
      }

      // cancel
      for (let event of this._receiver.cancel) {
        if (event.active && entity.active && this.entityCurrentlyUnderPointer(entity, event.pointerId)){
          entity.events.emit('pointercancel', event as any);
        }
      }

      // wheel
      for (let event of this._receiver.wheel) {
        // Currently the wheel only fires under the primary pointer '1'
        if (event.active && entity.active && this.entityCurrentlyUnderPointer(entity, 1)) {
          entity.events.emit('pointerwheel', event as any);
        }
      }
    }
  }
}