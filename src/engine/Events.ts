/// <reference path="Engine.ts" />
/// <reference path="Actor.ts" />
/// <reference path="Util/Log.ts" />

module ex {
  
   /**
    * An enum representing all of the built in event types for Excalibur
    * @obsolete Phasing this out in favor of classes
    */
   export enum EventType {       
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
    */
   export class GameEvent {
      /**
       * Target object for this event.
       */
      public target: any;
   }
   
   /**
    * Subscribe event thrown when handlers for events other than subscribe are added
    */
   export class SubscribeEvent extends GameEvent {
      constructor(public topic: string, public handler: (event?: GameEvent) => void) {
         super();
      }
   }

   /**
    * Unsubscribe event thrown when handlers for events other than unsubscribe are removed
    */
   export class UnsubscribeEvent extends GameEvent {
      constructor(public topic: string, public handler: (event?: GameEvent) => void) {
         super();
      }
   }

   /**
    * Event received by the Engine when the browser window is visible
    */
   export class VisibleEvent extends GameEvent {
      constructor() {
         super();
      }
   }

   /**
    * Event received by the Engine when the browser window is hidden
    */
   export class HiddenEvent extends GameEvent {
      constructor() {
         super();
      }
   }

   /**
    * Event thrown on an actor when a collision has occured
    */
   export class CollisionEvent extends GameEvent {

      /**
       * @param actor  The actor the event was thrown on
       * @param other  The actor that was collided with
       * @param side   The side that was collided with
       */
      constructor(public actor: Actor, public other: Actor, public side: Side, public intersection: Vector) {
         super();
      }
   }

   /**
    * Event thrown on a game object on Excalibur update
    */
   export class UpdateEvent extends GameEvent {

      /**
       * @param delta  The number of milliseconds since the last update
       */
      constructor(public delta: number) {
         super();
      }
   }

   /**
    * Event thrown on an Actor only once before the first update call
    */
   export class InitializeEvent extends GameEvent {

      /**
       * @param engine  The reference to the current engine
       */
      constructor(public engine: Engine) {
         super();
      }
   }

   /**
    * Event thrown on a Scene on activation
    */
   export class ActivateEvent extends GameEvent {

      /**
       * @param oldScene  The reference to the old scene
       */
      constructor(public oldScene: Scene) {
         super();
      }
   }

   /**
    * Event thrown on a Scene on deactivation
    */
   export class DeactivateEvent extends GameEvent {

      /**
       * @param newScene  The reference to the new scene
       */
      constructor(public newScene: Scene) {
         super();
      }
   }


   /**
    * Event thrown on an Actor when it completely leaves the screen.
    */
   export class ExitViewPortEvent extends GameEvent {
      constructor() {
         super();
      }
   }

   /**
    * Event thrown on an Actor when it completely leaves the screen.
    */
   export class EnterViewPortEvent extends GameEvent {
      constructor() {
         super();
      }
   }

}