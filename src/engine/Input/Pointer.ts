/// <reference path="../Events.ts"/>

module ex.Input {

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
   export class PointerEvent extends ex.GameEvent {

      /**
       * @param x            The `x` coordinate of the event (in world coordinates)
       * @param y            The `y` coordinate of the event (in world coordinates)
       * @param index        The index of the pointer (zero-based)
       * @param pointerType  The type of pointer
       * @param button       The button pressed (if [[PointerType.Mouse]])
       * @param ev           The raw DOM event being handled
       */
      constructor(public x: number, 
                  public y: number, 
                  public index: number, 
                  public pointerType: PointerType, 
                  public button: PointerButton, 
                  public ev) {
         super();
      }
   };

   /**
    * Mouse and Touch (Pointers)
    *
    * Handles pointer events (mouse, touch, stylus, etc.) and normalizes to 
    * [W3C Pointer Events](http://www.w3.org/TR/pointerevents/).
    *
    * There is always at least one [[Pointer]] available ([[Pointers.primary]]) and
    * you can request multiple pointers to support multi-touch scenarios.
    *
    * Since [[Pointers.primary]] normalizes both mouse and touch events, your game
    * automatically supports touch for the primary pointer by default. When
    * you handle the events, you can customize what your game does based on the type
    * of pointer, if applicable.
    *
    * Excalibur handles mouse/touch events and normalizes them to a [[PointerEvent]]
    * that your game can subscribe to and handle (`engine.input.pointers`).
    *
    * ## Events
    *
    * You can subscribe to pointer events through `engine.input.pointers`. A [[PointerEvent]] object is
    * passed to your handler which offers information about the pointer input being received.
    *
    * - `down` - When a pointer is pressed down (any mouse button or finger press)
    * - `up` - When a pointer is lifted
    * - `move` - When a pointer moves (be wary of performance issues when subscribing to this)
    * - `cancel` - When a pointer event is canceled for some reason
    *
    * ```js
    * engine.input.pointers.primary.on("down", function (evt) { });
    * engine.input.pointers.primary.on("up", function (evt) { });
    * engine.input.pointers.primary.on("move", function (evt) { });
    * engine.input.pointers.primary.on("cancel", function (evt) { });
    * ```
    *
    * ## Pointer scope (window vs. canvas)
    *
    * You have the option to handle *all* pointer events in the browser by setting
    * [[IEngineOptions.pointerScope]] to [[PointerScope.Document]]. If this is enabled,
    * Excalibur will handle every pointer event in the browser. This is useful for handling
    * complex input and having control over every interaction.
    *
    * You can also use [[PointerScope.Canvas]] to only scope event handling to the game
    * canvas. This is useful if you don't care about events that occur outside.
    *
    * One real-world example is dragging and gestures. Sometimes a player will drag their
    * finger outside your game and then into it, expecting it to work. If [[PointerScope]]
    * is set to [[PointerScope.Canvas|Canvas]] this will not work. If it is set to
    * [[PointerScope.Document|Document]], it will.
    *
    * ## Responding to input
    * 
    * The primary pointer can be a mouse, stylus, or 1 finger touch event. You
    * can inspect what it is from the [[PointerEvent]] handled.
    *
    * ```js
    * engine.input.pointers.primary.on("down", function (pe) {
    *   if (pe.pointerType === ex.Input.PointerType.Mouse) {
    *     ex.Logger.getInstance().info("Mouse event:", pe);
    *   } else if (pe.pointerType === ex.Input.PointerType.Touch) {
    *     ex.Logger.getInstance().info("Touch event:", pe);
    *   }
    * });
    * ```
    *
    * ## Multiple Pointers (Multi-Touch)
    *
    * When there is more than one pointer detected on the screen,
    * this is considered multi-touch. For example, pressing one finger,
    * then another, will create two pointers. If you lift a finger,
    * the first one remains and the second one disappears.
    *
    * You can handle multi-touch by subscribing to however many pointers
    * you would like to support. If a pointer doesn't yet exist, it will
    * be created. You do not need to check if a pointer exists. If it does
    * exist, it will propogate events, otherwise it will remain idle.
    *
    * Excalibur does not impose a limit to the amount of pointers you can
    * subscribe to, so by all means, support all 10 fingers.
    *
    * *Note:* There is no way to identify touches after they happen; you can only
    * know that there are *n* touches on the screen at once.
    *
    * ```js
    * function paint(color) {
    *
    *   // create a handler for the event
    *   return function (pe) {
    *     if (pe.pointerType === ex.Input.PointerType.Touch) {
    *       engine.canvas.fillStyle = color;
    *       engine.canvas.fillRect(pe.x, pe.y, 5, 5);
    *     }
    *   }
    * }
    *
    * engine.input.pointers.at(0).on("move", paint("blue"));  // 1st finger
    * engine.input.pointers.at(1).on("move", paint("red"));   // 2nd finger
    * engine.input.pointers.at(2).on("move", paint("green")); // 3rd finger
    * ```
    *
    * ## Actor pointer events
    *
    * By default, [[Actor|Actors]] do not participate in pointer events. In other
    * words, when you "click" an Actor, it will not throw an event **for that Actor**,
    * only a generic pointer event for the game. This is to keep performance 
    * high and allow actors to "opt-in" to handling pointer events.
    *
    * To opt-in, set [[Actor.enableCapturePointer]] to `true` and the [[Actor]] will
    * start publishing `pointerup` and `pointerdown` events. `pointermove` events
    * will not be published by default due to performance implications. If you want
    * an actor to receive move events, set [[ICapturePointerConfig.captureMoveEvents]] to
    * `true`.
    *
    * Actor pointer events will be prefixed with `pointer`.
    *
    * ```js
    * var player = new ex.Actor();
    *
    * // enable propogating pointer events
    * player.enableCapturePointer = true;
    *
    * // enable move events, warning: performance intensive!
    * player.capturePointer.captureMoveEvents = true;
    *
    * // subscribe to input
    * player.on("pointerup", function (ev) {
    *   player.logger.info("Player selected!", ev);
    * });
    * ```
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
       */
      public primary: Pointer;
      
      /**
       * Initializes pointer event listeners
       */
      public init(scope: PointerScope = PointerScope.Document): void {
         var target = <any>document;
         if (scope === PointerScope.Document) {
            target = document;
         } else {
            target = <any>this._engine.canvas;
         }

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

      public update(delta: number): void {
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
               actor.eventDispatcher.publish('pointerup', this._pointerUp[i]);
            }
         }

         i = 0;
         len = this._pointerDown.length;

         for (i; i < len; i++) {
            if (actor.contains(this._pointerDown[i].x, this._pointerDown[i].y, !isUIActor)) {
               actor.eventDispatcher.publish('pointerdown', this._pointerDown[i]);
            }
         }

         if (actor.capturePointer.captureMoveEvents) {

            i = 0;
            len = this._pointerMove.length;

            for (i; i < len; i++) {
               if (actor.contains(this._pointerMove[i].x, this._pointerMove[i].y, !isUIActor)) {
                  actor.eventDispatcher.publish('pointermove', this._pointerMove[i]);
               }
            }
         }

         i = 0;
         len = this._pointerCancel.length;

         for (i; i < len; i++) {
            if (actor.contains(this._pointerCancel[i].x, this._pointerCancel[i].y, !isUIActor)) {
               actor.eventDispatcher.publish('pointercancel', this._pointerCancel[i]);
            }
         }
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
         return (e: ITouchEvent) => {
            e.preventDefault();
            for (var i = 0, len = e.changedTouches.length; i < len; i++) {
               var index = this._pointers.length > 1 ? this._getPointerIndex(e.changedTouches[i].identifier) : 0;
               if (index === -1) { continue; }
               var x: number = e.changedTouches[i].pageX - Util.getPosition(this._engine.canvas).x;
               var y: number = e.changedTouches[i].pageY - Util.getPosition(this._engine.canvas).y;
               var transformedPoint = this._engine.screenToWorldCoordinates(new Point(x, y));
               var pe = new PointerEvent(transformedPoint.x, transformedPoint.y, index, PointerType.Touch, PointerButton.Unknown, e);
               eventArr.push(pe);
               this.at(index).eventDispatcher.publish(eventName, pe);
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
            var transformedPoint = this._engine.screenToWorldCoordinates(new Point(x, y));
            var pe = new PointerEvent(transformedPoint.x, transformedPoint.y, index, this._stringToPointerType(e.pointerType), e.button, e);
            eventArr.push(pe);
            this.at(index).eventDispatcher.publish(eventName, pe);

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

      private _stringToPointerType(s) {
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
} 