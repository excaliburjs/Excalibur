/// <reference path="Core.ts" />
/// <reference path="Entities.ts" />
/// <reference path="Log.ts" />

module ex {
   /**
    * An enum representing all of the built in event types for Excalibur
    * @class EventType
    */
   export enum EventType {
      /**
       @property KeyDown {EventType}
       @static
       @final
       */
       /**
       @property KeyUp {EventType}
       @static
       @final
       */
       /**
       @property KeyPress {EventType}
       @static
       @final
       */
       /**
       @property MouseDown {EventType}
       @static
       @final
       */
       /**
       @property MouseMove {EventType}
       @static
       @final
       */
       /**
       @property MouseUp {EventType}
       @static
       @final
       */
       /**
       @property TouchStart {EventType}
       @static
       @final
       */
       /**
       @property TouchMove {EventType}
       @static
       @final
       */
       /**
       @property TouchEnd {EventType}
       @static
       @final
       */
       /**
       @property TouchCancel {EventType}
       @static
       @final
       */
       /**
       @property Click {EventType}
       @static
       @final
       */
       /**
       @property UserEvent {EventType}
       @static
       @final
       */
       /**
       @property Blur {EventType}
       @static
       @final
       */
       /**
       @property Focus {EventType}
       @static
       @final
       */
       /**
       @property Update {EventType}
       @static
       @final
       */
      KeyDown,
      KeyUp,
      KeyPress,
      MouseDown,
      MouseMove,
      MouseUp,
      TouchStart,
      TouchMove,
      TouchEnd,
      TouchCancel,
      Click,
      UserEvent,
      Collision,
      Blur,
      Focus,
      Update
   }

   export class GameEvent {
      constructor() { }
   }

   export class CollisionEvent extends GameEvent {
      constructor(public actor: Actor, public other: Actor, public side: Side) {
         super();
      }
   }

   export class UpdateEvent extends GameEvent {
      constructor(public delta: number) {
         super();
      }
   }

   export class KeyEvent extends GameEvent {
      constructor(public actor: Actor, public key: InputKey) {
         super();
      }
   }

   export class KeyDown extends GameEvent {
      constructor(public key: InputKey) {
         super();
      }
   }

   export class KeyUp extends GameEvent {
      constructor(public key: InputKey) {
         super();
      }
   }

   export class KeyPress extends GameEvent {
      constructor(public key: InputKey) {
         super();
      }
   }

   export class MouseDown extends GameEvent {
      constructor(public x: number, public y: number) {
         super();
      }
   }

   export class MouseMove extends GameEvent {
      constructor(public x: number, public y: number) {
         super();
      }
   }

   export class MouseUp extends GameEvent {
      constructor(public x: number, public y: number) {
         super();
      }
   }

   export interface Touch {
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

   // TODO: Uncomment when declaration compiler is fixed
   //export interface TouchList extends Array<Touch> {
   //   identifiedTouch(): Touch;
   //   item(i: number): Touch;
   //}

   export interface TouchEvent extends Event {
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

   export class TouchStart extends GameEvent {
      constructor(public x: number, public y: number) {
         super();
      }
   }

   export class TouchMove extends GameEvent {
      constructor(public x: number, public y: number) {
         super();
      }
   }

   export class TouchEnd extends GameEvent {
      constructor(public x: number, public y: number) {
         super();
      }
   }

   export class TouchCancel extends GameEvent {
      constructor(public x: number, public y: number) {
         super();
      }
   }

   export class Click extends GameEvent {
      constructor(public x: number, public y: number) {
         super();
      }
   }

   /**
    * Excalibur's internal queueing event dispatcher. Callbacks are queued up and not fired until the update is called.
    * @class EventDispatcher
    * @constructor
    * @param target {any} The object that will be the recipient of events from this event dispatcher
    */
   export class EventDispatcher {
      private _handlers: { [key: string]: { (event?: GameEvent): void }[]; } = {};
      private queue: { (any: void): void }[] = [];
      private target: any;
      private log: Logger = Logger.getInstance();
      constructor(target) {
         this.target = target;
      }

      /**
       * Publish an event for target
       * @method publish
       * @param eventName {string} The name of the event to publish
       * @param [event=undefined] {GameEvent} Optionally pass an event data object to the handler
       */
      public publish(eventName: string, event?: GameEvent) {
         if (!eventName) {
            // key not mapped
            return;
         }
         eventName = eventName.toLowerCase();
         var queue = this.queue;
         var target = this.target;
         if (this._handlers[eventName]) {
            this._handlers[eventName].forEach(function (callback) {
               queue.push(function () {
                  callback.call(target, event);
               });
            });
         }
      }

      /**
       * Subscribe an event handler to a particular event name, multiple handlers per event name are allowed.
       * @method subscribe
       * @param eventName {string} The name of the event to subscribe to
       * @param handler {GameEvent=>void} The handler callback to fire on this event
       */
      public subscribe(eventName: string, handler: (event?: GameEvent) => void) {
         eventName = eventName.toLowerCase();
         if (!this._handlers[eventName]) {
            this._handlers[eventName] = [];
         }
         this._handlers[eventName].push(handler);
      }

      /**
       * Unsubscribe a event handler(s) from an event. If a specific handler
       * is specified for an event, only that handler will be unsubscribed. 
       * Otherwise all handlers will be unsubscribed for that event.
       * @method unsubscribe
       * @param eventName {string} The name of the event to unsubscribe
       * @param [handler=undefined] Optionally the specific handler to unsubscribe
       *
       */
      public unsubscribe(eventName: string, handler?: (event?: GameEvent) => void){
         eventName = eventName.toLowerCase();
         var eventHandlers = this._handlers[eventName];
         
         if(eventHandlers){
            // if no explicit handler is give with the event name clear all handlers
            if(!handler){
               this._handlers[eventName].length = 0;
            }else {               
               var index = eventHandlers.indexOf(handler);
               this._handlers[eventName].splice(index, 1);               
            }
         }
      }

      /**
       * Dispatches all queued events to their handlers for execution.
       * @method update
       */
      public update() {
         var callback;
         while (callback = this.queue.shift()) {
            callback();
         }
      }

   }
}