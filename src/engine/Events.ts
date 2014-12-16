/// <reference path="Engine.ts" />
/// <reference path="Actor.ts" />
/// <reference path="Log.ts" />

module ex {
   /**
    * An enum representing all of the built in event types for Excalibur
    * @class EventType
    */
   export enum EventType {
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
       /**
       @property EnterViewPort {EventType}
       @static
       @final
       */
       /**
       @property ExitViewPort {EventType}
       @static
       @final
       */
       /**
       @property Activate {EventType}
       @static
       @final
       */
       /**
       @property Deactivate {EventType}
       @static
       @final
       */
       /**
       @property Initialize {EventType}
       @static
       @final
       */
      Collision,
      EnterViewPort,
      ExitViewPort,
      Blur,
      Focus,
      Update,
      Activate,
      Deactivate,
      Initialize
   }

   /**
    * Base event type in Excalibur that all other event types derive from.
    *
    * @class GameEvent
    * @constructor 
    * @param target {any} Events can have target game object, like the Engine, or an Actor.
    */
   export class GameEvent {
      /**
       * Target object for this event.
       * @property target {any}
       */
      public target: any;
      constructor() { 
      }
   }

   /**
    * Event received by the Engine when the browser window is visible
    *
    * @class VisibleEvent
    * @extends GameEvent
    * @constructor 
    */
   export class VisibleEvent extends GameEvent {
      constructor(){
         super();
      }
   }

   /**
    * Event received by the Engine when the browser window is hidden
    *
    * @class HiddenEvent
    * @extends GameEvent
    * @constructor 
    */
   export class HiddenEvent extends GameEvent {
      constructor(){
         super();
      }
   }

   /**
    * Event thrown on an actor when a collision has occured
    *
    * @class CollisionEvent
    * @extends GameEvent
    * @constructor 
    * @param actor {Actor} The actor the event was thrown on
    * @param other {Actor} The actor that was collided with
    * @param side {Side} The side that was collided with
    */
   export class CollisionEvent extends GameEvent {
      constructor(public actor: Actor, public other: Actor, public side: Side, public intersection: Vector) {
         super();
      }
   }

   /**
    * Event thrown on a game object on Excalibur update
    *
    * @class UpdateEvent
    * @extends GameEvent
    * @constructor 
    * @param delta {number} The number of milliseconds since the last update
    */
   export class UpdateEvent extends GameEvent {
      constructor(public delta: number) {
         super();
      }
   }

   /**
    * Event thrown on an Actor only once before the first update call
    *
    * @class InitializeEvent
    * @extends GameEvent
    * @constructor 
    * @param engine {Engine} The reference to the current engine
    */
   export class InitializeEvent extends GameEvent {
      constructor(public engine: Engine) {
         super();
      }
   }

   /**
    * Event thrown on a Scene on activation
    *
    * @class ActivateEvent
    * @extends GameEvent
    * @constructor 
    * @param oldScene {Scene} The reference to the old scene
    */
   export class ActivateEvent extends GameEvent {
      constructor(public oldScene: Scene) {
         super();
      }
   }

   /**
    * Event thrown on a Scene on deactivation
    *
    * @class DeactivateEvent
    * @extends GameEvent
    * @constructor 
    * @param newScene {Scene} The reference to the new scene
    */
   export class DeactivateEvent extends GameEvent {
      constructor(public newScene: Scene) {
         super();
      }
   }


   /**
    * Event thrown on an Actor when it completely leaves the screen.
    * @class ExitViewPortEvent
    * @constructor
    */
   export class ExitViewPortEvent extends GameEvent {
      constructor(){
         super();
      }
   }

   /**
    * Event thrown on an Actor when it completely leaves the screen.
    * @class EnterViewPortEvent
    * @constructor
    */
   export class EnterViewPortEvent extends GameEvent {
      constructor(){
         super();
      }
   }

   /**
    * Enum representing the different mouse buttons
    * @class MouseButton
    */
   export enum MouseButton {
      /**
       * @property Left
       * @static
       */
      Left,
      /**
       * @property Left
       * @static
       */
      Middle,
      /**
       * @property Left
       * @static
       */
      Right
   }
   
   // TODO: Uncomment when declaration compiler is fixed
   //export interface TouchList extends Array<Touch> {
   //   identifiedTouch(): Touch;
   //   item(i: number): Touch;
   //} 
}