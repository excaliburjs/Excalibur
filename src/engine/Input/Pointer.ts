module ex.Input {

   export class PointerEvent extends ex.GameEvent {
      constructor(public x: number, public y: number, public index: number, public ev) {
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

      constructor(engine: ex.Engine) {
         super();

         this._engine = engine;
         this._pointers.push(new Pointer());
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
         // Current: IE11
         if ((<any>window).MSPointerEvent) {

            this._engine.canvas.addEventListener('pointerdown', this._handlePointerEvent("down", this._pointerDown));
            this._engine.canvas.addEventListener('pointerup', this._handlePointerEvent("up", this._pointerUp));
            this._engine.canvas.addEventListener('pointermove', this._handlePointerEvent("move", this._pointerMove));
            this._engine.canvas.addEventListener('pointercancel', this._handlePointerEvent("cancel", this._pointerMove));

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
            }
         }

         return this._pointers[index];
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
            var pe = new PointerEvent(transformedPoint.x, transformedPoint.y, 0, e);
            eventArr.push(pe);
            this.at(0).eventDispatcher.publish(eventName, pe);
         };
      }

      private _handleTouchEvent(eventName: string, eventArr: PointerEvent[]) {
         return (e: TouchEvent) => {
            e.preventDefault();

            for (var i = 0, len = e.changedTouches.length; i < len; i++) {
               var x: number = e.changedTouches[i].pageX - Util.getPosition(this._engine.canvas).x;
               var y: number = e.changedTouches[i].pageY - Util.getPosition(this._engine.canvas).y;
               var transformedPoint = this._engine.screenToWorldCoordinates(new Point(x, y));
               var pe = new PointerEvent(transformedPoint.x, transformedPoint.y, i, e);
               eventArr.push(pe);
               this.at(i).eventDispatcher.publish(eventName, pe);
            }
         };
      }

      private _handlePointerEvent(eventName: string, eventArr: PointerEvent[]) {
         return (e: MSPointerEvent) => {
            e.preventDefault();

            // TODO test multi-touch input
            var index = e.isPrimary ? 0 : e.pointerId;
            var x: number = e.pageX - Util.getPosition(this._engine.canvas).x;
            var y: number = e.pageY - Util.getPosition(this._engine.canvas).y;
            var transformedPoint = this._engine.screenToWorldCoordinates(new Point(x, y));
            var pe = new PointerEvent(transformedPoint.x, transformedPoint.y, index, e);
            eventArr.push(pe);
            this.at(index).eventDispatcher.publish(eventName, pe);
         };
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
      identifier: string;
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