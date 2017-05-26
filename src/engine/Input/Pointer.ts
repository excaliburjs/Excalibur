import { Engine } from './../Engine';
import { GameEvent } from '../Events';
import { UIActor } from '../UIActor';
import { Vector } from '../Algebra';
import { Class } from '../Class';
import * as Util from '../Util/Util';
import * as Events from '../Events';

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
 * Pointer events
 *
 * Represents a mouse, touch, or stylus event. See [[Pointers]] for more information on
 * handling pointer input.
 *
 * For mouse-based events, you can inspect [[PointerEvent.button]] to see what button was pressed.
 */
export class PointerEvent extends GameEvent<any> {

   public pos: Vector;
   /**
    * @param x            The `x` coordinate of the event (in world coordinates) to initiate pos vector
    * @param y            The `y` coordinate of the event (in world coordinates) to initiate pos vector
    * @param pageX        The `x` coordinate of the event (in document coordinates)
    * @param pageY        The `y` coordinate of the event (in document coordinates)
    * @param screenX      The `x` coordinate of the event (in screen coordinates)
    * @param screenY      The `y` coordinate of the event (in screen coordinates)
    * @param index        The index of the pointer (zero-based)
    * @param pointerType  The type of pointer
    * @param button       The button pressed (if [[PointerType.Mouse]])
    * @param ev           The raw DOM event being handled
    */
   constructor(public x: number,
               public y: number,
               public pageX: number,
               public pageY: number,
               public screenX: number,
               public screenY: number,
               public index: number,
               public pointerType: PointerType,
               public button: PointerButton,
               public ev: any) {
      super();
      this.pos = new Vector(x, y);
   }
};

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
   public on(eventName: Events.cancel, handler: (event?: PointerEvent) => void): void;
   public on(eventName: string, handler: (event?: GameEvent<any>) => void): void;
   public on(eventName: string, handler: (event?: GameEvent<any>) => void): void {
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
         target.addEventListener('pointercancel', this._handlePointerEvent('cancel', this._pointerMove));

      } else if ((<any>window).MSPointerEvent) {
         // IE10
         this._engine.canvas.style.msTouchAction = 'none';
         target.addEventListener('MSPointerDown', this._handlePointerEvent('down', this._pointerDown));
         target.addEventListener('MSPointerUp', this._handlePointerEvent('up', this._pointerUp));
         target.addEventListener('MSPointerMove', this._handlePointerEvent('move', this._pointerMove));
         target.addEventListener('MSPointerCancel', this._handlePointerEvent('cancel', this._pointerMove));

      } else {

         // Mouse Events
         target.addEventListener('mousedown', this._handleMouseEvent('down', this._pointerDown));
         target.addEventListener('mouseup', this._handleMouseEvent('up', this._pointerUp));
         target.addEventListener('mousemove', this._handleMouseEvent('move', this._pointerMove));
      }
   }

   public update(): void {
      this._pointerUp.length = 0;
      this._pointerDown.length = 0;
      this._pointerMove.length = 0;
      this._pointerCancel.length = 0;
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
    * Propogates events to actor if necessary
    */
   public propogate(actor: any) {
      var isUIActor = actor instanceof UIActor;
      var i: number = 0,
            len: number = this._pointerUp.length;

      for (i; i < len; i++) {
         if (actor.contains(this._pointerUp[i].x, this._pointerUp[i].y, !isUIActor)) {
            actor.eventDispatcher.emit('pointerup', this._pointerUp[i]);
         }
      }

      i = 0;
      len = this._pointerDown.length;

      for (i; i < len; i++) {
         if (actor.contains(this._pointerDown[i].x, this._pointerDown[i].y, !isUIActor)) {
            actor.eventDispatcher.emit('pointerdown', this._pointerDown[i]);
         }
      }

      if (actor.capturePointer.captureMoveEvents) {

         i = 0;
         len = this._pointerMove.length;

         for (i; i < len; i++) {
            if (actor.contains(this._pointerMove[i].x, this._pointerMove[i].y, !isUIActor)) {
               actor.eventDispatcher.emit('pointermove', this._pointerMove[i]);
            }
         }
      }

      i = 0;
      len = this._pointerCancel.length;

      for (i; i < len; i++) {
         if (actor.contains(this._pointerCancel[i].x, this._pointerCancel[i].y, !isUIActor)) {
            actor.eventDispatcher.emit('pointercancel', this._pointerCancel[i]);
         }
      }
   }

   private _handleMouseEvent(eventName: string, eventArr: PointerEvent[]) {
      return (e: MouseEvent) => {
         e.preventDefault();
         var x: number = e.pageX - Util.getPosition(this._engine.canvas).x;
         var y: number = e.pageY - Util.getPosition(this._engine.canvas).y;
         var transformedPoint = this._engine.screenToWorldCoordinates(new Vector(x, y));
         var pe = new PointerEvent(transformedPoint.x, transformedPoint.y, e.pageX, e.pageY, x, y, 0, PointerType.Mouse, e.button, e);
         eventArr.push(pe);
         this.at(0).eventDispatcher.emit(eventName, pe);
      };
   }

   private _handleTouchEvent(eventName: string, eventArr: PointerEvent[]) {
      return (e: ITouchEvent) => {
         e.preventDefault();
         for (var i = 0, len = e.changedTouches.length; i < len; i++) {
            var index = this._pointers.length > 1 ? this._getPointerIndex(e.changedTouches[i].identifier) : 0;
            if (index === -1) { continue; }
            var x: number = e.changedTouches[i].pageX - Util.getPosition(this._engine.canvas).x;
            var y: number = e.changedTouches[i].pageY - Util.getPosition(this._engine.canvas).y;
            var transformedPoint = this._engine.screenToWorldCoordinates(new Vector(x, y));
            var pe = new PointerEvent(transformedPoint.x, transformedPoint.y,
               e.changedTouches[i].pageX, e.changedTouches[i].pageY, x, y, index, PointerType.Touch, PointerButton.Unknown, e);
            eventArr.push(pe);
            this.at(index).eventDispatcher.emit(eventName, pe);
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
         var index = this._pointers.length > 1 ? this._getPointerIndex(e.pointerId) : 0;
         if (index === -1) { return; }
         var x: number = e.pageX - Util.getPosition(this._engine.canvas).x;
         var y: number = e.pageY - Util.getPosition(this._engine.canvas).y;
         var transformedPoint = this._engine.screenToWorldCoordinates(new Vector(x, y));
         var pe = new PointerEvent(transformedPoint.x, transformedPoint.y,
            e.pageX, e.pageY, x, y, index, this._stringToPointerType(e.pointerType), e.button, e);
         eventArr.push(pe);
         this.at(index).eventDispatcher.emit(eventName, pe);

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
         if (this._activePointers[i] === -1) { return i; }
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

   constructor() {
      super();

      this.on('move', this._onPointerMove);
   }

   /**
    * The last position on the document this pointer was at. Can be `null` if pointer was never active.
    */
   lastPagePos: Vector = null;

   /**
    * The last position on the screen this pointer was at. Can be `null` if pointer was never active.
    */
   lastScreenPos: Vector = null;

   /**
    * The last position in the game world coordinates this pointer was at. Can be `null` if pointer was never active.
    */
   lastWorldPos: Vector = null;

   private _onPointerMove(ev: PointerEvent) {
      this.lastWorldPos = new Vector(ev.x, ev.y);
      this.lastPagePos = new Vector(ev.pageX, ev.pageY);
      this.lastScreenPos = new Vector(ev.screenX, ev.screenY);
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
