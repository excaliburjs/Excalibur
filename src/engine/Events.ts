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
    * Event received by the Engine when the browser window receives focus
    *
    * @class FocusEvent
    * @extends GameEvent
    * @constructor 
    */
   export class FocusEvent extends GameEvent {
      constructor(){
         super();
      }
   }

   /**
    * Event received by the Engine when the browser window is blurred
    *
    * @class BlurEvent
    * @extends GameEvent
    * @constructor 
    */
   export class BlurEvent extends GameEvent {
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
    * Event thrown on a game object on KeyEvent
    *
    * @class KeyEvent
    * @extends GameEvent
    * @constructor 
    * @param key {InputKey} The key responsible for throwing the event
    */
   export class KeyEvent extends GameEvent {
      constructor(public key: InputKey) {
         super();
      }
   }
   
   /**
    * Event thrown on a game object on KeyDown
    *
    * @class KeyDown
    * @extends GameEvent
    * @constructor 
    * @param key {InputKey} The key responsible for throwing the event
    */
   export class KeyDown extends GameEvent {
      constructor(public key: InputKey) {
         super();
      }
   }

   /**
    * Event thrown on a game object on KeyUp
    *
    * @class KeyUp
    * @extends GameEvent
    * @constructor 
    * @param key {InputKey} The key responsible for throwing the event
    */
   export class KeyUp extends GameEvent {
      constructor(public key: InputKey) {
         super();
      }
   }

   /**
    * Event thrown on a game object on KeyPress
    *
    * @class KeyPress
    * @extends GameEvent
    * @constructor 
    * @param key {InputKey} The key responsible for throwing the event
    */
   export class KeyPress extends GameEvent {
      constructor(public key: InputKey) {
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


   /**
    * Event thrown on a game object on MouseDown
    *
    * @class MouseDown
    * @extends GameEvent
    * @constructor 
    * @param x {number} The x coordinate of the event
    * @param y {number} The y coordinate of the event
    * @param mouseEvent {MouseEvent} The native mouse event thrown 
    */
   export class MouseDown extends GameEvent {
      constructor(public x: number, public y: number, public mouseEvent: MouseEvent) {
         super();
      }
   }

   /**
    * Event thrown on a game object on MouseMove
    *
    * @class MouseMove
    * @extends GameEvent
    * @constructor 
    * @param x {number} The x coordinate of the event
    * @param y {number} The y coordinate of the event
    * @param mouseEvent {MouseEvent} The native mouse event thrown 
    */
   export class MouseMove extends GameEvent {
      constructor(public x: number, public y: number, public mouseEvent: MouseEvent) {
         super();
      }
   }

   /**
    * Event thrown on a game object on MouseUp
    *
    * @class MouseUp
    * @extends GameEvent
    * @constructor 
    * @param x {number} The x coordinate of the event
    * @param y {number} The y coordinate of the event
    * @param mouseEvent {MouseEvent} The native mouse event thrown 
    */
   export class MouseUp extends GameEvent {
      constructor(public x: number, public y: number, public mouseEvent: MouseEvent) {
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

   /**
    * Event thrown on a game object on TouchEvent
    *
    * @class TouchEvent
    * @extends GameEvent
    * @constructor 
    * @param x {number} The x coordinate of the event
    * @param y {number} The y coordinate of the event
    */
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

   /**
    * Event thrown on a game object on TouchStart
    *
    * @class TouchStart
    * @extends GameEvent
    * @constructor 
    * @param x {number} The x coordinate of the event
    * @param y {number} The y coordinate of the event
    */
   export class TouchStart extends GameEvent {
      constructor(public x: number, public y: number) {
         super();
      }
   }

   /**
    * Event thrown on a game object on TouchMove
    *
    * @class TouchMove
    * @extends GameEvent
    * @constructor 
    * @param x {number} The x coordinate of the event
    * @param y {number} The y coordinate of the event
    */
   export class TouchMove extends GameEvent {
      constructor(public x: number, public y: number) {
         super();
      }
   }

   /**
    * Event thrown on a game object on TouchEnd
    *
    * @class TouchEnd
    * @extends GameEvent
    * @constructor 
    * @param x {number} The x coordinate of the event
    * @param y {number} The y coordinate of the event
    */
   export class TouchEnd extends GameEvent {
      constructor(public x: number, public y: number) {
         super();
      }
   }

   /**
    * Event thrown on a game object on TouchCancel
    *
    * @class TouchCancel
    * @extends GameEvent
    * @constructor 
    * @param x {number} The x coordinate of the event
    * @param y {number} The y coordinate of the event
    */
   export class TouchCancel extends GameEvent {
      constructor(public x: number, public y: number) {
         super();
      }
   }

   /**
    * Event thrown on a game object on Click
    *
    * @class Click
    * @extends GameEvent
    * @constructor 
    * @param x {number} The x coordinate of the event
    * @param y {number} The y coordinate of the event
    */
   export class Click extends GameEvent {
      constructor(public x: number, public y: number, public mouseEvent: MouseEvent) {
         super();
      }
   }   
}