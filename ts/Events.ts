/// <reference path="Core.ts" />
/// <reference path="Entities.ts" />
/// <reference path="Log.ts" />

module ex {
   export enum EventType {
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

   export class EventDispatcher {
      private _handlers: { [key: string]: { (event?: GameEvent): void }[]; } = {};
      private queue: { (any: void): void }[] = [];
      private target: any;
      private log: Logger = Logger.getInstance();
      constructor(target) {
         this.target = target;
      }

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

      public subscribe(eventName: string, handler: (event?: GameEvent) => void) {
         eventName = eventName.toLowerCase();
         if (!this._handlers[eventName]) {
            this._handlers[eventName] = [];
         }
         this._handlers[eventName].push(handler);
      }

      public update() {
         var callback;
         while (callback = this.queue.shift()) {
            callback();
         }
      }

   }
}