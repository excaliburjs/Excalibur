/// <reference path="Engine.ts" />
/// <reference path="Actor.ts" />
/// <reference path="Util/Log.ts" />

/* istanbul ignore next */
module ex.Events {
   export type kill = 'kill';
   
   export type predraw = 'predraw';
   export type postdraw = 'postdraw';

   export type predebugdraw = 'predebugdraw';
   export type postdebugdraw = 'postdebugdraw';

   export type preupdate = 'preupdate';
   export type postupdate = 'postupdate';

   export type collision = 'collision';

   export type initialize = 'initialize';
   export type activate = 'activate';
   export type deactivate = 'deactivate';

   export type exitviewport = 'exitviewport';
   export type enterviewport = 'enterviewport'; 

   export type connect = 'connect';
   export type disconnect = 'disconnect';
   export type button = 'button';
   export type axis = 'axis';

   export type subscribe = 'subscribe';
   export type unsubscribe = 'unsubscribe';

   export type visible = 'visible';
   export type hidden = 'hidden';
   export type start = 'start';
   export type stop = 'stop';

   export type pointerup = 'pointerup';
   export type pointerdown = 'pointerdown';
   export type pointermove = 'pointermove';
   export type pointercancel = 'pointercancel';

   export type up = 'up';
   export type down = 'down';
   export type move = 'move';
   export type cancel = 'cancel';

   export type press = 'press';
   export type release = 'release';
   export type hold = 'hold';
}

module ex {
  
  
   /**
    * Base event type in Excalibur that all other event types derive from. Not all event types are thrown on all Excalibur game objects, 
    * some events are unique to a type, others are not. 
    *
    * Excalibur events follow the convention that the name of the thrown event for listening will be the same as the Event object in all 
    * lower case with the 'Event' suffix removed.    
    * 
    * For example:
    * - PreDrawEvent event object and "predraw" as the event name
    *
    * ```typescript
    * 
    * actor.on('predraw', (evtObj: PreDrawEvent) => {
    *    // do some pre drawing
    * })
    *
    * ```
    *  
    */
   export class GameEvent {
      /**
       * Target object for this event.
       */
      public target: any;
   }
   
   /**
    * The 'kill' event is emitted on actors when it is killed. The target is the actor that was killed. 
    */
   export class KillEvent extends GameEvent {
      constructor(public target) {
         super();
      }
   }

   /**
    * The 'start' event is emitted on engine when has started and is ready for interaction. 
    */
   export class GameStartEvent extends GameEvent {
      constructor(public target) {
         super();
      }
   }

   /**
    * The 'stop' event is emitted on engine when has been stopped and will no longer take input, update or draw. 
    */
   export class GameStopEvent extends GameEvent {
      constructor(public target) {
         super();
      }
   }
   
   /**
    * The 'predraw' event is emitted on actors, scenes, and engine before drawing starts. Actors' predraw happens inside their graphics 
    * transform so that all drawing takes place with the actor as the origin.
    *   
    */
   export class PreDrawEvent extends GameEvent {
      constructor(public ctx: CanvasRenderingContext2D, public delta, public target) {
         super();
      }
   }
   
   /**
    * The 'postdraw' event is emitted on actors, scenes, and engine after drawing finishes. Actors' postdraw happens inside their graphics 
    * transform so that all drawing takes place with the actor as the origin.
    *   
    */
   export class PostDrawEvent extends GameEvent {
      constructor(public ctx: CanvasRenderingContext2D, public delta, public target) {
         super();
      }  
   }
   
   /**
    * The 'predebugdraw' event is emitted on actors, scenes, and engine before debug drawing starts.
    */
   export class PreDebugDrawEvent extends GameEvent {
      constructor(public ctx: CanvasRenderingContext2D, public target) {
         super();
      }  
   }
   
   /**
    * The 'postdebugdraw' event is emitted on actors, scenes, and engine after debug drawing starts.
    */
   export class PostDebugDrawEvent extends GameEvent {
      constructor(public ctx: CanvasRenderingContext2D, public target) {
         super();
      }  
   }
   
   /**
    * The 'preupdate' event is emitted on actors, scenes, and engine before the update starts.
    */
   export class PreUpdateEvent extends GameEvent {
      constructor(public engine: Engine, public delta, public target) {
         super();
      }
   }
   
   /**
    * The 'postupdate' event is emitted on actors, scenes, and engine after the update ends. This is equivalent to the obsolete 'update'
    * event.
    */
   export class PostUpdateEvent extends GameEvent {
      constructor(public engine: Engine, public delta, public target) {
         super();
      }
   }
   
   /**
    * Event received when a gamepad is connected to Excalibur. [[Input.Gamepads|engine.input.gamepads]] receives this event.
    */
   export class GamepadConnectEvent extends GameEvent {
      constructor(public index: number, public gamepad: ex.Input.Gamepad) {
         super();
      }
   }
   
   /**
    * Event received when a gamepad is disconnected from Excalibur. [[Input.Gamepads|engine.input.gamepads]] receives this event.
    */
   export class GamepadDisconnectEvent extends GameEvent {
      constructor(public index: number) {
         super();
      }
   }

   /**
    * Gamepad button event. See [[Gamepads]] for information on responding to controller input. [[Gamepad]] instances receive this event;
    */
   export class GamepadButtonEvent extends ex.GameEvent {

      /**
       * @param button  The Gamepad button
       * @param value   A numeric value between 0 and 1
       */
      constructor(public button: ex.Input.Buttons, public value: number) {
         super();
      }
   }

   /**
    * Gamepad axis event. See [[Gamepads]] for information on responding to controller input. [[Gamepad]] instances receive this event;
    */
   export class GamepadAxisEvent extends ex.GameEvent {

      /**
       * @param axis  The Gamepad axis
       * @param value A numeric value between -1 and 1
       */
      constructor(public axis: ex.Input.Axes, public value: number) {
         super();
      }
   }
   
   /**
    * Subscribe event thrown when handlers for events other than subscribe are added. Meta event that is received by 
    * [[EventDispatcher|event dispatchers]].
    */
   export class SubscribeEvent extends GameEvent {
      constructor(public topic: string, public handler: (event?: GameEvent) => void) {
         super();
      }
   }

   /**
    * Unsubscribe event thrown when handlers for events other than unsubscribe are removed. Meta event that is received by 
    * [[EventDispatcher|event dispatchers]].
    */
   export class UnsubscribeEvent extends GameEvent {
      constructor(public topic: string, public handler: (event?: GameEvent) => void) {
         super();
      }
   }

   /**
    * Event received by the [[Engine]] when the browser window is visible on a screen.
    */
   export class VisibleEvent extends GameEvent {
      constructor() {
         super();
      }
   }

   /**
    * Event received by the [[Engine]] when the browser window is hidden from all screens.
    */
   export class HiddenEvent extends GameEvent {
      constructor() {
         super();
      }
   }

   /**
    * Event thrown on an [[Actor|actor]] when a collision has occurred
    */
   export class CollisionEvent extends GameEvent {

      /**
       * @param actor         The actor the event was thrown on
       * @param other         The actor that was collided with
       * @param side          The side that was collided with
       * @param intersection  Intersection vector
       */
      constructor(public actor: Actor, public other: Actor, public side: Side, public intersection: Vector) {
         super();
      }
   }

   /**
    * Event thrown on an [[Actor]] and a [[Scene]] only once before the first update call
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
    * Event thrown on a [[Scene]] on activation
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
    * Event thrown on a [[Scene]] on deactivation
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
    * Event thrown on an [[Actor]] when it completely leaves the screen.
    */
   export class ExitViewPortEvent extends GameEvent {
      constructor() {
         super();
      }
   }

   /**
    * Event thrown on an [[Actor]] when it completely leaves the screen.
    */
   export class EnterViewPortEvent extends GameEvent {
      constructor() {
         super();
      }
   }

}