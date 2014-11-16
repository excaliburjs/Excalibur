/// <reference path="../Events.ts"/>

module ex.Input {

   export enum PointerType {
      Touch,
      Mouse,
      Pen,
      Unknown
   }

   export enum PointerButton {
      Left,
      Middle,
      Right,
      Unknown
   }

   export class PointerEvent extends ex.GameEvent {
      constructor(public x: number, public y: number, public index: number, public pointerType: PointerType, public button: PointerButton, public ev) {
         super();
      }
   };

   /**
    * Handles pointer events (mouse, touch, stylus, etc.) and normalizes to W3C Pointer Events. 
    * There is always at least one pointer available (primary).
    * 
    * @class Pointers
    * @extends Class
    * @constructor
    */
   export class Pointers extends ex.Class {
      private _engine: ex.Engine;

      private _pointerDown: PointerEvent[] = [];
      private _pointerUp: PointerEvent[] = [];
      private _pointerMove: PointerEvent[] = [];
      private _pointerCancel: PointerEvent[] = [];
      private _pointers: Pointer[] = [];
      private _activePointers: number[] = [];

      constructor(engine: ex.Engine) {
         super();

         this._engine = engine;
         this._pointers.push(new Pointer());
         this._activePointers = [-1];
         this.primary = this._pointers[0];
      }

      /**
       * Primary pointer (mouse, 1 finger, stylus, etc.)
       * @property primary {Pointer}
       */
      public primary: Pointer;

      /**
       * Initializes pointer event listeners
       */
      public init(): void {

         // Touch Events
         this._engine.canvas.addEventListener('touchstart', this._handleTouchEvent("down", this._pointerDown));
         this._engine.canvas.addEventListener('touchend', this._handleTouchEvent("up", this._pointerUp));
         this._engine.canvas.addEventListener('touchmove', this._handleTouchEvent("move", this._pointerMove));
         this._engine.canvas.addEventListener('touchcancel', this._handleTouchEvent("cancel", this._pointerCancel));

         // W3C Pointer Events
         // Current: IE11, IE10
         if ((<any>window).PointerEvent) {
            // IE11
            this._engine.canvas.style.touchAction = "none";
            this._engine.canvas.addEventListener('pointerdown', this._handlePointerEvent("down", this._pointerDown));
            this._engine.canvas.addEventListener('pointerup', this._handlePointerEvent("up", this._pointerUp));
            this._engine.canvas.addEventListener('pointermove', this._handlePointerEvent("move", this._pointerMove));
            this._engine.canvas.addEventListener('pointercancel', this._handlePointerEvent("cancel", this._pointerMove));

         } else if ((<any>window).MSPointerEvent) {
            // IE10
            this._engine.canvas.style.msTouchAction = "none";
            this._engine.canvas.addEventListener('MSPointerDown', this._handlePointerEvent("down", this._pointerDown));
            this._engine.canvas.addEventListener('MSPointerUp', this._handlePointerEvent("up", this._pointerUp));
            this._engine.canvas.addEventListener('MSPointerMove', this._handlePointerEvent("move", this._pointerMove));
            this._engine.canvas.addEventListener('MSPointerCancel', this._handlePointerEvent("cancel", this._pointerMove));

         } else {

            // Mouse Events
            this._engine.canvas.addEventListener('mousedown', this._handleMouseEvent("down", this._pointerDown));
            this._engine.canvas.addEventListener('mouseup', this._handleMouseEvent("up", this._pointerUp));
            this._engine.canvas.addEventListener('mousemove', this._handleMouseEvent("move", this._pointerMove));
         }
      }

      public update(delta: number): void {
         this._pointerUp.length = 0;
         this._pointerDown.length = 0;
         this._pointerMove.length = 0;
         this._pointerCancel.length = 0;
      }

      /**
       * Safely gets a Pointer at a specific index and initializes one if it doesn't yet exist
       * @param index {number} The pointer index to retrieve
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
      public propogate(actor: Actor) {
         this._pointerUp.forEach((e) => {
            if (actor.contains(e.x, e.y)) {
               actor.eventDispatcher.publish("pointerup", e);
            }
         });
         this._pointerDown.forEach((e) => {
            if (actor.contains(e.x, e.y)) {
               actor.eventDispatcher.publish("pointerdown", e);
            }
         });
         if (actor.inputEnableMoveEvents) {
            this._pointerMove.forEach((e) => {
               if (actor.contains(e.x, e.y)) {
                  actor.eventDispatcher.publish("pointermove", e);
               }
            });
         }
         this._pointerCancel.forEach((e) => {
            if (actor.contains(e.x, e.y)) {
               actor.eventDispatcher.publish("pointercancel", e);
            }
         });
      }

      private _handleMouseEvent(eventName: string, eventArr: PointerEvent[]) {
         return (e: MouseEvent) => {
            e.preventDefault();
            var x: number = e.pageX - Util.getPosition(this._engine.canvas).x;
            var y: number = e.pageY - Util.getPosition(this._engine.canvas).y;
            var transformedPoint = this._engine.screenToWorldCoordinates(new Point(x, y));
            var pe = new PointerEvent(transformedPoint.x, transformedPoint.y, 0, PointerType.Mouse, e.button, e);
            eventArr.push(pe);
            this.at(0).eventDispatcher.publish(eventName, pe);
         };
      }

      private _handleTouchEvent(eventName: string, eventArr: PointerEvent[]) {
         return (e: TouchEvent) => {
            e.preventDefault();
            for (var i = 0, len = e.changedTouches.length; i < len; i++) {
               var index = e.changedTouches[i].identifier;
               var x: number = e.changedTouches[i].pageX - Util.getPosition(this._engine.canvas).x;
               var y: number = e.changedTouches[i].pageY - Util.getPosition(this._engine.canvas).y;
               var transformedPoint = this._engine.screenToWorldCoordinates(new Point(x, y));
               var pe = new PointerEvent(transformedPoint.x, transformedPoint.y, index, PointerType.Touch, PointerButton.Unknown, e);
               eventArr.push(pe);
               this.at(index).eventDispatcher.publish(eventName, pe);
            }
         };
      }

      private _handlePointerEvent(eventName: string, eventArr: PointerEvent[]) {
         return (e: MSPointerEvent) => {
            e.preventDefault();
            
            // get the index for this pointer ID if multi-pointer is asked for
            var index = this._pointers.length > 1 ? this._getPointerIndex(e.pointerId) : 0;
            if (index === -1) return;
            var x: number = e.pageX - Util.getPosition(this._engine.canvas).x;
            var y: number = e.pageY - Util.getPosition(this._engine.canvas).y;
            var transformedPoint = this._engine.screenToWorldCoordinates(new Point(x, y));
            var pe = new PointerEvent(transformedPoint.x, transformedPoint.y, index, this._stringToPointerType(e.pointerType), e.button, e);
            eventArr.push(pe);
            this.at(index).eventDispatcher.publish(eventName, pe);

            // only with multi-pointer
            if (this._pointers.length > 1) {
               if (eventName === "up") {

                  // remove pointer ID from pool when pointer is lifted
                  this._activePointers[index] = -1;
               } else if (eventName === "down") {

                  // set pointer ID to given index
                  this._activePointers[index] = e.pointerId;
               }
            }
         };
      }

      /**
       * Gets the index of the pointer specified for the given pointer ID or finds the next empty pointer slot available.
       * This is required because IE10/11 uses incrementing pointer IDs so we need to store a mapping of ID => idx
       * @private
       */
      private _getPointerIndex(pointerId: number) {
         var idx;
         if ((idx = this._activePointers.indexOf(pointerId)) > -1) {
            return idx;
         }

         for (var i = 0; i < this._activePointers.length; i++) {
            if (this._activePointers[i] === -1) return i;
         }

         // ignore pointer because game isn't watching
         return -1;
      }

      private _stringToPointerType(s) {
         switch (s) {
            case "touch":
               return PointerType.Touch;
            case "mouse":
               return PointerType.Mouse;
            case "pen":
               return PointerType.Pen;
            default:
               return PointerType.Unknown;
         }
      }
   }

   /**
    * Captures and dispatches PointerEvents
    * @class Pointer
    * @constructor
    * @extends Class
    */
   export class Pointer extends Class {
      
   }

   interface TouchEvent extends Event {
      altKey: boolean;
      changedTouches: Touch[];
      ctrlKey: boolean;
      metaKey: boolean;
      shiftKey: boolean;
      targetTouches: Touch[];
      touches: Touch[];
      type: string;
      target: Element;
   }

   interface Touch {
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
} 