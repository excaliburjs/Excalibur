import { Engine, ScrollPreventionMode } from './../Engine';
import { GameEvent } from '../Events';
import { Actor } from '../Actor';
import { Vector, GlobalCoordinates } from '../Algebra';
import { Class } from '../Class';
import * as Actors from '../Util/Actors';
import * as Util from '../Util/Util';
import * as Events from '../Events';

export interface IActorsUnderPointer {
  [ActorId: number]: Actor;
  length: number;
}

/**
 * The type of pointer for a [[PointerEvent]].
 */
export enum PointerType {
  Touch,
  Mouse,
  Pen,
  Unknown
}

/**
 * The mouse button being pressed.
 */
export enum PointerButton {
  Left,
  Middle,
  Right,
  Unknown
}

export enum WheelDeltaMode {
  Pixel,
  Line,
  Page
}

/**
 * Determines the scope of handling mouse/touch events. See [[Pointers]] for more information.
 */
export enum PointerScope {
  /**
   * Handle events on the `canvas` element only. Events originating outside the
   * `canvas` will not be handled.
   */
  Canvas,

  /**
   * Handles events on the entire document. All events will be handled by Excalibur.
   */
  Document
}

/**
 * A constant used to normalize wheel events across different browsers
 *
 * This normalization factor is pulled from https://developer.mozilla.org/en-US/docs/Web/Events/wheel#Listening_to_this_event_across_browser
 */
const ScrollWheelNormalizationFactor = -1 / 40;

/**
 * Pointer events
 *
 * Represents a mouse, touch, or stylus event. See [[Pointers]] for more information on
 * handling pointer input.
 *
 * For mouse-based events, you can inspect [[PointerEvent.button]] to see what button was pressed.
 */
export class PointerEvent extends GameEvent<Actor> {
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
   * @param pos                 (Will be added to signature in 0.14.0 release) The position of the event (in world coordinates)
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
  /**
   * Sets event path to actor, depending on actor provided.
   * If actor is lower in hierarchy tree, previous path'll be kept.
   * @param actor Actor, to lay path form.
   */
  public layPath(actor: Actor): void {
    if (!this.pointer.isActorUnderPointer(actor)) {
      return;
    }

    const actorPath = actor.getAncestors();
    this._path = actorPath.length > this._path.length ? actorPath : this._path;
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

  public propagate(): void {
    if (!this.eventPath.length) {
      if (this.pointer.hasActorsUnderPointer) {
        const actors = this.pointer.getActorsUnderPointer();
        actors.forEach((actor) => {
          if (!this.pointer.isActorUnderPointer(actor)) {
            this._onActorLeave(actor);
          }
        });
      }

      return;
    }

    this.action();

    if (this.bubbles) {
      this.propagate();
    }
  }

  /**
   * Sets event path to actor, depending on actor provided.
   * If actor is in a dragging state, current dragging target would be used.
   * @param actor Actor, to lay path form.
   */
  public layPath(actor: Actor): void {
    /**
     *  double-check is preformed, because user could move pointer too fast and
     *  in that case, pointer can appear out of boundings of the dragging element
     */
    if (this.pointer.isDragging) {
      actor = this.pointer.dragTarget || actor;
    } else if (!this.pointer.isActorUnderPointer(actor)) {
      return;
    }

    const actorPath = actor.getAncestors();
    this._path = actorPath.length > this._path.length ? actorPath : this._path;
  }

  protected _onActionStart(actor: Actor) {
    if (!actor.capturePointer.captureMoveEvents) {
      return;
    }

    if (this.pointer.isActorUnderPointer(actor) && !this.pointer.hasActorUnderPointerInList(actor)) {
      this._onActorEnter(actor);
    }

    if (this.pointer.isDragging && actor.capturePointer.captureDragEvents) {
      actor.eventDispatcher.emit('pointerdragmove', this);
    }
  }

  private _onActorEnter(actor: Actor) {
    const pe = createPointerEventByName('enter', this.coordinates, this.pointer, this.index, this.pointerType, this.button, this.ev);
    pe.layPath(actor);
    pe.propagate();
    this.pointer.addActorUnderPointer(actor);

    if (this.pointer.isDragging) {
      this.pointer.dragTarget = actor;
    }
  }

  private _onActorLeave(actor: Actor) {
    const pe = createPointerEventByName('leave', this.coordinates, this.pointer, this.index, this.pointerType, this.button, this.ev);
    pe.layPath(actor);
    pe.propagate();
    this.pointer.removeActorUnderPointer(actor);
  }
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

  public layPath(actor: Actor): void {
    const actorPath = actor.getAncestors();
    this._path = actorPath.length > this._path.length ? actorPath : this._path;
  }

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

function createPointerEventByName(
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

/**
 * Handles pointer events (mouse, touch, stylus, etc.) and normalizes to
 * [W3C Pointer Events](http://www.w3.org/TR/pointerevents/).
 *
 * [[include:Pointers.md]]
 */
export class Pointers extends Class {
  private _engine: Engine;

  private _pointerDown: PointerEvent[] = [];
  private _pointerUp: PointerEvent[] = [];
  private _pointerMove: PointerEvent[] = [];
  private _pointerCancel: PointerEvent[] = [];
  private _wheel: WheelEvent[] = [];
  private _pointers: Pointer[] = [];
  private _activePointers: number[] = [];

  constructor(engine: Engine) {
    super();

    this._engine = engine;
    this._pointers.push(new Pointer());
    this._activePointers = [-1];
    this.primary = this._pointers[0];
  }

  public on(eventName: Events.up, handler: (event?: PointerEvent) => void): void;
  public on(eventName: Events.down, handler: (event?: PointerEvent) => void): void;
  public on(eventName: Events.move, handler: (event?: PointerEvent) => void): void;
  public on(eventName: Events.enter, handler: (event?: PointerEvent) => void): void;
  public on(eventName: Events.leave, handler: (event?: PointerEvent) => void): void;
  public on(eventName: Events.cancel, handler: (event?: PointerEvent) => void): void;
  public on(eventName: Events.wheel, handler: (event?: WheelEvent) => void): void;
  public on(eventName: string, handler: (event?: GameEvent<any>) => void): void;
  public on(eventName: string, handler: (event?: any) => void): void {
    super.on(eventName, handler);
  }

  /**
   * Primary pointer (mouse, 1 finger, stylus, etc.)
   */
  public primary: Pointer;

  /**
   * Initializes pointer event listeners
   */
  public init(target?: GlobalEventHandlers): void {
    target = target || this._engine.canvas;

    // Touch Events
    target.addEventListener('touchstart', this._handleTouchEvent('down', this._pointerDown));
    target.addEventListener('touchend', this._handleTouchEvent('up', this._pointerUp));
    target.addEventListener('touchmove', this._handleTouchEvent('move', this._pointerMove));
    target.addEventListener('touchcancel', this._handleTouchEvent('cancel', this._pointerCancel));

    // W3C Pointer Events
    // Current: IE11, IE10
    if ((<any>window).PointerEvent) {
      // IE11
      this._engine.canvas.style.touchAction = 'none';
      target.addEventListener('pointerdown', this._handlePointerEvent('down', this._pointerDown));
      target.addEventListener('pointerup', this._handlePointerEvent('up', this._pointerUp));
      target.addEventListener('pointermove', this._handlePointerEvent('move', this._pointerMove));
      target.addEventListener('pointercancel', this._handlePointerEvent('cancel', this._pointerCancel));
    } else if ((<any>window).MSPointerEvent) {
      // IE10
      this._engine.canvas.style.msTouchAction = 'none';
      target.addEventListener('MSPointerDown', this._handlePointerEvent('down', this._pointerDown));
      target.addEventListener('MSPointerUp', this._handlePointerEvent('up', this._pointerUp));
      target.addEventListener('MSPointerMove', this._handlePointerEvent('move', this._pointerMove));
      target.addEventListener('MSPointerCancel', this._handlePointerEvent('cancel', this._pointerCancel));
    } else {
      // Mouse Events
      target.addEventListener('mousedown', this._handleMouseEvent('down', this._pointerDown));
      target.addEventListener('mouseup', this._handleMouseEvent('up', this._pointerUp));
      target.addEventListener('mousemove', this._handleMouseEvent('move', this._pointerMove));
    }

    // MDN MouseWheelEvent
    if ('onwheel' in document.createElement('div')) {
      // Modern Browsers
      target.addEventListener('wheel', this._handleWheelEvent('wheel', this._wheel));
    } else if (document.onmousewheel !== undefined) {
      // Webkit and IE
      target.addEventListener('mousewheel', this._handleWheelEvent('wheel', this._wheel));
    } else {
      // Remaining browser and older Firefox
      target.addEventListener('MozMousePixelScroll', this._handleWheelEvent('wheel', this._wheel));
    }
  }

  public update(): void {
    this._pointerUp.length = 0;
    this._pointerDown.length = 0;
    this._pointerMove.length = 0;
    this._pointerCancel.length = 0;
    this._wheel.length = 0;

    for (let i = 0; i < this._pointers.length; i++) {
      this._pointers[i].update();
    }
  }

  /**
   * Safely gets a Pointer at a specific index and initializes one if it doesn't yet exist
   * @param index  The pointer index to retrieve
   */
  public at(index: number): Pointer {
    if (index >= this._pointers.length) {
      // Ensure there is a pointer to retrieve
      for (var i = this._pointers.length - 1, max = index; i < max; i++) {
        this._pointers.push(new Pointer());
        this._activePointers.push(-1);
      }
    }

    return this._pointers[index];
  }

  /**
   * Get number of pointers being watched
   */
  public count(): number {
    return this._pointers.length;
  }

  /**
   * Propogates events through ancestors chain if necessary
   */
  public propagate() {
    this._propagatePointerEvent(this._pointerDown);
    this._propagatePointerEvent(this._pointerUp);
    this._propagatePointerEvent(this._pointerMove);
    this._propagatePointerEvent(this._pointerCancel);
    this._propagateWheelEvent('pointerwheel', this._wheel);
  }

  /**
   * Revises pointer events paths accordingly to actor provided
   * @param actor  Actor to be revised
   */
  public revisePointerEventsPaths(actor: Actor) {
    this._revisePointerEventPath(actor, this._pointerDown);
    this._revisePointerEventPath(actor, this._pointerUp);
    this._revisePointerEventPath(actor, this._pointerMove);
    this._revisePointerEventPath(actor, this._pointerCancel);
    this._validateWheelEventPath(this._wheel, actor);
  }

  private _propagatePointerEvent(pointers: PointerEvent[]) {
    const len = pointers.length;

    for (let i = 0; i < len; i++) {
      pointers[i].propagate();
    }
  }

  private _revisePointerEventPath(actor: Actor, pointers: PointerEvent[]) {
    const len = pointers.length;

    for (let i = 0; i < len; i++) {
      const pointerEvent = pointers[i];

      pointerEvent.layPath(actor);
    }
  }

  private _validateWheelEventPath(pointers: WheelEvent[], actor: Actor): void {
    for (let i = 0; i < pointers.length; i++) {
      const wheelEvent = pointers[i];
      const isNotUIActor = !Actors.isUIActor(actor);

      if (actor.contains(wheelEvent.x, wheelEvent.y, isNotUIActor)) {
        wheelEvent.layPath(actor);
      }
    }
  }

  private _propagateWheelEvent(eventName: string, pointers: WheelEvent[]) {
    const len = pointers.length;
    let wheelEvent: WheelEvent;

    for (let i = 0; i < len; i++) {
      wheelEvent = pointers[i];

      switch (eventName) {
        case 'pointerwheel':
          this._propagateWheelPointerEvent(wheelEvent);
          break;
      }
    }
  }

  private _propagateWheelPointerEvent(wheelEvent: WheelEvent) {
    if (!wheelEvent.eventPath.length) {
      return;
    }

    const actor = wheelEvent.eventPath.pop();
    actor.eventDispatcher.emit('pointerwheel', wheelEvent);

    if (wheelEvent.bubbles) {
      this._propagateWheelPointerEvent(wheelEvent);
    }
  }

  private _handleMouseEvent(eventName: string, eventArr: PointerEvent[]) {
    return (e: MouseEvent) => {
      e.preventDefault();

      const pointer = this.at(0);
      const coordinates = GlobalCoordinates.fromPagePosition(e.pageX, e.pageY, this._engine);
      const pe = createPointerEventByName(eventName, coordinates, pointer, 0, PointerType.Mouse, e.button, e);

      eventArr.push(pe);
      pointer.eventDispatcher.emit(eventName, pe);
    };
  }

  private _handleTouchEvent(eventName: string, eventArr: PointerEvent[]) {
    return (e: ITouchEvent) => {
      e.preventDefault();
      for (var i = 0, len = e.changedTouches.length; i < len; i++) {
        const index = this._pointers.length > 1 ? this._getPointerIndex(e.changedTouches[i].identifier) : 0;
        if (index === -1) {
          continue;
        }

        const pointer = this.at(index);
        const coordinates = GlobalCoordinates.fromPagePosition(e.changedTouches[i].pageX, e.changedTouches[i].pageY, this._engine);
        const pe = createPointerEventByName(eventName, coordinates, pointer, index, PointerType.Touch, PointerButton.Unknown, e);

        eventArr.push(pe);
        pointer.eventDispatcher.emit(eventName, pe);
        // only with multi-pointer
        if (this._pointers.length > 1) {
          if (eventName === 'up') {
            // remove pointer ID from pool when pointer is lifted
            this._activePointers[index] = -1;
          } else if (eventName === 'down') {
            // set pointer ID to given index
            this._activePointers[index] = e.changedTouches[i].identifier;
          }
        }
      }
    };
  }

  private _handlePointerEvent(eventName: string, eventArr: PointerEvent[]) {
    return (e: MSPointerEvent) => {
      e.preventDefault();

      // get the index for this pointer ID if multi-pointer is asked for
      const index = this._pointers.length > 1 ? this._getPointerIndex(e.pointerId) : 0;
      if (index === -1) {
        return;
      }

      const pointer = this.at(index);
      const coordinates = GlobalCoordinates.fromPagePosition(e.pageX, e.pageY, this._engine);
      const pe = createPointerEventByName(eventName, coordinates, pointer, index, this._stringToPointerType(e.pointerType), e.button, e);

      eventArr.push(pe);
      pointer.eventDispatcher.emit(eventName, pe);

      // only with multi-pointer
      if (this._pointers.length > 1) {
        if (eventName === 'up') {
          // remove pointer ID from pool when pointer is lifted
          this._activePointers[index] = -1;
        } else if (eventName === 'down') {
          // set pointer ID to given index
          this._activePointers[index] = e.pointerId;
        }
      }
    };
  }

  private _handleWheelEvent(eventName: string, eventArr: WheelEvent[]) {
    return (e: MouseWheelEvent) => {
      // Should we prevent page scroll because of this event
      if (
        this._engine.pageScrollPreventionMode === ScrollPreventionMode.All ||
        (this._engine.pageScrollPreventionMode === ScrollPreventionMode.Canvas && e.target === this._engine.canvas)
      ) {
        e.preventDefault();
      }

      var x: number = e.pageX - Util.getPosition(this._engine.canvas).x;
      var y: number = e.pageY - Util.getPosition(this._engine.canvas).y;
      var transformedPoint = this._engine.screenToWorldCoordinates(new Vector(x, y));

      // deltaX, deltaY, and deltaZ are the standard modern properties
      // wheelDeltaX, wheelDeltaY, are legacy properties in webkit browsers and older IE
      // e.detail is only used in opera

      var deltaX = e.deltaX || e.wheelDeltaX * ScrollWheelNormalizationFactor || 0;
      var deltaY =
        e.deltaY || e.wheelDeltaY * ScrollWheelNormalizationFactor || e.wheelDelta * ScrollWheelNormalizationFactor || e.detail || 0;
      var deltaZ = e.deltaZ || 0;
      var deltaMode = WheelDeltaMode.Pixel;

      if (e.deltaMode) {
        if (e.deltaMode === 1) {
          deltaMode = WheelDeltaMode.Line;
        } else if (e.deltaMode === 2) {
          deltaMode = WheelDeltaMode.Page;
        }
      }

      var we = new WheelEvent(transformedPoint.x, transformedPoint.y, e.pageX, e.pageY, x, y, 0, deltaX, deltaY, deltaZ, deltaMode, e);

      eventArr.push(we);
      this.at(0).eventDispatcher.emit(eventName, we);
    };
  }

  /**
   * Gets the index of the pointer specified for the given pointer ID or finds the next empty pointer slot available.
   * This is required because IE10/11 uses incrementing pointer IDs so we need to store a mapping of ID => idx
   */
  private _getPointerIndex(pointerId: number) {
    var idx;
    if ((idx = this._activePointers.indexOf(pointerId)) > -1) {
      return idx;
    }

    for (var i = 0; i < this._activePointers.length; i++) {
      if (this._activePointers[i] === -1) {
        return i;
      }
    }

    // ignore pointer because game isn't watching
    return -1;
  }

  private _stringToPointerType(s: string) {
    switch (s) {
      case 'touch':
        return PointerType.Touch;
      case 'mouse':
        return PointerType.Mouse;
      case 'pen':
        return PointerType.Pen;
      default:
        return PointerType.Unknown;
    }
  }
}

/**
 * Captures and dispatches PointerEvents
 */
export class Pointer extends Class {
  private _isDown: boolean = false;
  private _wasDown: boolean = false;
  private _actorsUnderPointer: IActorsUnderPointer = { length: 0 };

  /**
   * Whether the Pointer is currently dragging.
   */
  public get isDragging(): boolean {
    return this._isDown;
  }

  /**
   * Whether the Pointer just started dragging.
   */
  public get isDragStart(): boolean {
    return !this._wasDown && this._isDown;
  }

  /**
   * Whether the Pointer just ended dragging.
   */
  public get isDragEnd(): boolean {
    return this._wasDown && !this._isDown;
  }

  /**
   * Returns true if pointer has any actors under
   */
  public get hasActorsUnderPointer(): boolean {
    return !!this._actorsUnderPointer.length;
  }

  /**
   * The last position on the document this pointer was at. Can be `null` if pointer was never active.
   */
  public lastPagePos: Vector = null;

  /**
   * The last position on the screen this pointer was at. Can be `null` if pointer was never active.
   */
  public lastScreenPos: Vector = null;

  /**
   * The last position in the game world coordinates this pointer was at. Can be `null` if pointer was never active.
   */
  public lastWorldPos: Vector = null;

  /**
   * Returns the currently dragging target or null if it isn't exist
   */
  public dragTarget: Actor = null;

  constructor() {
    super();

    this.on('move', this._onPointerMove);
    this.on('down', this._onPointerDown);
    this.on('up', this._onPointerUp);
  }

  public update(): void {
    if (this._wasDown && !this._isDown) {
      this._wasDown = false;
    } else if (!this._wasDown && this._isDown) {
      this._wasDown = true;
    }
  }

  /**
   * Adds an Actor to actorsUnderPointer object.
   * @param actor An Actor to be added;
   */
  public addActorUnderPointer(actor: Actor): void {
    if (!this.hasActorUnderPointerInList(actor)) {
      this._actorsUnderPointer[actor.id] = actor;
      this._actorsUnderPointer.length += 1;
    }
  }

  /**
   * Removes an Actor from actorsUnderPointer object.
   * @param actor An Actor to be removed;
   */
  public removeActorUnderPointer(actor: Actor): void {
    if (this.hasActorUnderPointerInList(actor)) {
      delete this._actorsUnderPointer[actor.id];
      this._actorsUnderPointer.length -= 1;
    }
  }

  /**
   * Returns an Actor from actorsUnderPointer object.
   * @param actor An Actor to be ;
   */
  public getActorsUnderPointer(): Actor[] {
    const actors: Actor[] = [];

    for (const id in this._actorsUnderPointer) {
      if (id === 'length') {
        continue;
      }
      const actor = this._actorsUnderPointer[id];
      actors.push(actor);
    }

    return actors;
  }

  /**
   * Checks if Pointer has a specific Actor under.
   * @param actor An Actor for check;
   */
  public isActorUnderPointer(actor: Actor): boolean {
    return actor.contains(this.lastWorldPos.x, this.lastWorldPos.y, !Actors.isUIActor(actor));
  }

  /**
   * Checks if Pointer has a specific Actor in ActrorsUnderPointer list.
   * @param actor An Actor for check;
   */
  public hasActorUnderPointerInList(actor: Actor): boolean {
    return this._actorsUnderPointer.hasOwnProperty(actor.id.toString());
  }

  private _onPointerMove(ev: PointerEvent): void {
    this.lastPagePos = new Vector(ev.pagePos.x, ev.pagePos.y);
    this.lastScreenPos = new Vector(ev.screenPos.x, ev.screenPos.y);
    this.lastWorldPos = new Vector(ev.worldPos.x, ev.worldPos.y);
  }

  private _onPointerDown(): void {
    this._isDown = true;
  }

  private _onPointerUp(): void {
    this._isDown = false;
    this.dragTarget = null;
  }
}

interface ITouchEvent extends Event {
  altKey: boolean;
  changedTouches: ITouch[];
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  targetTouches: ITouch[];
  touches: ITouch[];
  type: string;
  target: Element;
}

interface ITouch {
  identifier: number;
  screenX: number;
  screenY: number;
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
  radiusX: number;
  radiusY: number;
  rotationAngle: number;
  force: number;
  target: Element;
}
