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