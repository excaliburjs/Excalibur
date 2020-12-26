import { Actor } from '../Actor';
import { Vector, GlobalCoordinates } from '../Algebra';
import { Pointer, PointerType } from './Pointer';
import { GameEvent } from '../Events';

/**
 * Native browser button enumeration
 */
export enum NativePointerButton {
  NoButton = -1,
  Left = 0,
  Middle = 1,
  Right = 2,
  Unknown = 3
}

/**
 * The mouse button being pressed.
 */
export enum PointerButton {
  Left = 'Left',
  Middle = 'Middle',
  Right = 'Right',
  Unknown = 'Unknown',
  NoButton = 'NoButton'
}

export enum WheelDeltaMode {
  Pixel = 'Pixel',
  Line = 'Line',
  Page = 'Page'
}

/**
 * Type that indicates Excalibur's valid synthetic pointer events
 */
export type PointerEventName =
  | 'pointerdragstart'
  | 'pointerdragend'
  | 'pointerdragmove'
  | 'pointerdragenter'
  | 'pointerdragleave'
  | 'pointermove'
  | 'pointerenter'
  | 'pointerleave'
  | 'pointerup'
  | 'pointerdown';

/**
 * Pointer events
 *
 * Represents a mouse, touch, or stylus event. See [[Pointers]] for more information on
 * handling pointer input.
 *
 * For mouse-based events, you can inspect [[PointerEvent.button]] to see what button was pressed.
 */
export class PointerEvent extends GameEvent<Actor> {
  protected _name: string;

  public get name() {
    return this._name;
  }

  /** The world coordinates of the event. */
  public get worldPos(): Vector {
    return this.coordinates.worldPos.clone();
  }

  /** The page coordinates of the event. */
  public get pagePos(): Vector {
    return this.coordinates.pagePos.clone();
  }

  /** The screen coordinates of the event. */
  public get screenPos(): Vector {
    return this.coordinates.screenPos.clone();
  }

  /**
   * @param coordinates         The [[GlobalCoordinates]] of the event
   * @param pointer             The [[Pointer]] of the event
   * @param index               The index of the pointer (zero-based)
   * @param pointerType         The type of pointer
   * @param button              The button pressed (if [[PointerType.Mouse]])
   * @param ev                  The raw DOM event being handled
   */
  constructor(
    protected coordinates: GlobalCoordinates,
    public pointer: Pointer,
    public index: number,
    public pointerType: PointerType,
    public button: PointerButton,
    public ev: any
  ) {
    super();
  }

  public get pos(): Vector {
    return this.coordinates.worldPos.clone();
  }

  public propagate(actor: Actor): void {
    this.doAction(actor);

    if (this.bubbles && actor.parent) {
      this.propagate(actor.parent);
    }
  }

  /**
   * Action, that calls when event happens
   */
  public doAction(actor: Actor): void {
    if (actor) {
      this._onActionStart(actor);
      actor.emit(this._name, this);
      this._onActionEnd(actor);
    }
  }

  protected _onActionStart(_actor?: Actor) {
    // to be rewritten
  }

  protected _onActionEnd(_actor?: Actor) {
    // to be rewritten
  }
}

export class PointerEventFactory<T extends PointerEvent> {
  constructor(
    protected _pointerEventType: new (
      coordinates: GlobalCoordinates,
      pointer: Pointer,
      index: number,
      pointerType: PointerType,
      button: PointerButton,
      ev: any
    ) => T
  ) {}

  /**
   * Create specific PointerEvent
   */
  public create(
    coordinates: GlobalCoordinates,
    pointer: Pointer,
    index: number,
    pointerType: PointerType,
    button: PointerButton,
    ev: any
  ): T {
    return new this._pointerEventType(coordinates, pointer, index, pointerType, button, ev);
  }
}

export class PointerDragEvent extends PointerEvent {}

export class PointerUpEvent extends PointerEvent {
  protected _name = 'pointerup';

  protected _onActionEnd(actor: Actor) {
    const pointer = this.pointer;

    if (pointer.isDragEnd && actor.capturePointer.captureDragEvents) {
      actor.eventDispatcher.emit('pointerdragend', this);
    }
  }
}

export class PointerDownEvent extends PointerEvent {
  protected _name = 'pointerdown';

  protected _onActionEnd(actor: Actor) {
    if (this.pointer.isDragStart && actor.capturePointer.captureDragEvents) {
      actor.eventDispatcher.emit('pointerdragstart', this);
    }
  }
}

export class PointerMoveEvent extends PointerEvent {
  protected _name = 'pointermove';

  public propagate(actor: Actor): void {
    // If the actor was under the pointer last frame, but not this one it left
    // if (this.pointer.wasActorUnderPointer(actor) && !this.pointer.isActorUnderPointer(actor)) {
    //   this._onActorLeave(actor);
    //   return;
    // }

    if (this.pointer.isActorAliveUnderPointer(actor)) {
      this.doAction(actor);

      if (this.bubbles && actor.parent) {
        this.propagate(actor.parent);
      }
    }
  }

  protected _onActionStart(actor: Actor) {
    if (!actor.capturePointer.captureMoveEvents) {
      return;
    }

    // In the case this is new
    // if (this.pointer.checkActorUnderPointer(actor) && !this.pointer.wasActorUnderPointer(actor)) {
    //   this._onActorEnter(actor);
    // }

    if (this.pointer.isDragging && actor.capturePointer.captureDragEvents) {
      actor.eventDispatcher.emit('pointerdragmove', this);
    }
  }

  // private _onActorEnter(actor: Actor) {
  //   const pe = createPointerEventByName('enter', this.coordinates, this.pointer, this.index, this.pointerType, this.button, this.ev);
  //   pe.propagate(actor);
  //   this.pointer.addActorUnderPointer(actor);

  //   if (this.pointer.isDragging) {
  //     this.pointer.dragTarget = actor;
  //   }
  // }

  // private _onActorLeave(actor: Actor) {
  //   const pe = createPointerEventByName('leave', this.coordinates, this.pointer, this.index, this.pointerType, this.button, this.ev);
  //   pe.propagate(actor);
  //   this.pointer.removeActorUnderPointer(actor);
  // }
}

export class PointerEnterEvent extends PointerEvent {
  protected _name = 'pointerenter';

  protected _onActionStart(actor: Actor) {
    if (!actor.capturePointer.captureMoveEvents) {
      return;
    }
  }

  protected _onActionEnd(actor: Actor) {
    const pointer = this.pointer;

    if (pointer.isDragging && actor.capturePointer.captureDragEvents) {
      actor.eventDispatcher.emit('pointerdragenter', this);
    }
  }
}

export class PointerLeaveEvent extends PointerEvent {
  protected _name = 'pointerleave';

  protected _onActionStart(actor: Actor) {
    if (!actor.capturePointer.captureMoveEvents) {
      return;
    }
  }

  protected _onActionEnd(actor: Actor) {
    const pointer = this.pointer;

    if (pointer.isDragging && actor.capturePointer.captureDragEvents) {
      actor.eventDispatcher.emit('pointerdragleave', this);
    }
  }
}

export class PointerCancelEvent extends PointerEvent {
  protected _name = 'pointercancel';
}
/**
 * Wheel Events
 *
 * Represents a mouse wheel event. See [[Pointers]] for more information on
 * handling point input.
 */
export class WheelEvent extends GameEvent<Actor> {
  /**
   * @param x            The `x` coordinate of the event (in world coordinates)
   * @param y            The `y` coordinate of the event (in world coordinates)
   * @param pageX        The `x` coordinate of the event (in document coordinates)
   * @param pageY        The `y` coordinate of the event (in document coordinates)
   * @param screenX      The `x` coordinate of the event (in screen coordinates)
   * @param screenY      The `y` coordinate of the event (in screen coordinates)
   * @param index        The index of the pointer (zero-based)
   * @param deltaX       The type of pointer
   * @param deltaY       The type of pointer
   * @param deltaZ       The type of pointer
   * @param deltaMode    The type of movement [[WheelDeltaMode]]
   * @param ev           The raw DOM event being handled
   */
  constructor(
    public x: number,
    public y: number,
    public pageX: number,
    public pageY: number,
    public screenX: number,
    public screenY: number,
    public index: number,
    public deltaX: number,
    public deltaY: number,
    public deltaZ: number,
    public deltaMode: WheelDeltaMode,
    public ev: any
  ) {
    super();
  }
}

/**
 *
 */
export function createPointerEventByName(
  eventName: string,
  coordinates: GlobalCoordinates,
  pointer: Pointer,
  index: number,
  pointerType: PointerType,
  button: PointerButton,
  ev: any
) {
  let factory: PointerEventFactory<PointerEvent>;

  switch (eventName) {
    case 'up':
      factory = new PointerEventFactory(<any>PointerUpEvent);
      break;
    case 'down':
      factory = new PointerEventFactory(<any>PointerDownEvent);
      break;
    case 'move':
      factory = new PointerEventFactory(<any>PointerMoveEvent);
      break;
    case 'cancel':
      factory = new PointerEventFactory(<any>PointerCancelEvent);
      break;
    case 'enter':
      factory = new PointerEventFactory(<any>PointerEnterEvent);
      break;
    case 'leave':
      factory = new PointerEventFactory(<any>PointerLeaveEvent);
      break;
  }

  return factory.create(coordinates, pointer, index, pointerType, button, ev);
}
