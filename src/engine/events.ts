import type { Scene } from './scene';
import type { Vector } from './math/vector';
import type { Actor } from './actor';
import type { Trigger } from './trigger';
import type { FrameStats } from './debug';
import type { Engine } from './engine';
import type { TileMap } from './tile-map';
import type { Side } from './collision/side';
import type { CollisionContact } from './collision/detection/collision-contact';
import type { Collider } from './collision/colliders/collider';
import type { Entity } from './entity-component-system/entity';
import type { OnInitialize, OnPreUpdate, OnPostUpdate, SceneActivationContext, OnAdd, OnRemove } from './interfaces/lifecycle-events';
import type { ExcaliburGraphicsContext } from './graphics';
import type { Axes, Buttons, Gamepad } from './input/gamepad';
import type { Action } from './actions/action';

export enum EventTypes {
  Kill = 'kill',
  PreKill = 'prekill',
  PostKill = 'postkill',

  PreDraw = 'predraw',
  PostDraw = 'postdraw',

  PreDebugDraw = 'predebugdraw',
  PostDebugDraw = 'postdebugdraw',

  PreUpdate = 'preupdate',
  PostUpdate = 'postupdate',

  PreFrame = 'preframe',
  PostFrame = 'postframe',

  PreCollision = 'precollision',
  CollisionStart = 'collisionstart',
  CollisionEnd = 'collisionend',
  PostCollision = 'postcollision',

  Initialize = 'initialize',
  Activate = 'activate',
  Deactivate = 'deactivate',

  ExitViewport = 'exitviewport',
  EnterViewport = 'enterviewport',

  ExitTrigger = 'exit',
  EnterTrigger = 'enter',

  Connect = 'connect',
  Disconnect = 'disconnect',
  Button = 'button',
  Axis = 'axis',

  Visible = 'visible',
  Hidden = 'hidden',
  Start = 'start',
  Stop = 'stop',

  PointerUp = 'pointerup',
  PointerDown = 'pointerdown',
  PointerMove = 'pointermove',
  PointerEnter = 'pointerenter',
  PointerLeave = 'pointerleave',
  PointerCancel = 'pointercancel',
  PointerWheel = 'pointerwheel',

  Up = 'up',
  Down = 'down',
  Move = 'move',
  Enter = 'enter',
  Leave = 'leave',
  Cancel = 'cancel',
  Wheel = 'wheel',

  Press = 'press',
  Release = 'release',
  Hold = 'hold',

  PointerDragStart = 'pointerdragstart',
  PointerDragEnd = 'pointerdragend',
  PointerDragEnter = 'pointerdragenter',
  PointerDragLeave = 'pointerdragleave',
  PointerDragMove = 'pointerdragmove',

  ActionStart = 'actionstart',
  ActionComplete = 'actioncomplete',

  Add = 'add',
  Remove = 'remove'
}

/* istanbul ignore next */
/* compiler only: these are internal to lib */
export type kill = 'kill';
export type prekill = 'prekill';
export type postkill = 'postkill';

export type predraw = 'predraw';
export type postdraw = 'postdraw';

export type predebugdraw = 'predebugdraw';
export type postdebugdraw = 'postdebugdraw';

export type preupdate = 'preupdate';
export type postupdate = 'postupdate';

export type preframe = 'preframe';
export type postframe = 'postframe';

export type precollision = 'precollision';
export type collisionstart = 'collisionstart';
export type collisionend = 'collisionend';
export type postcollision = 'postcollision';

export type initialize = 'initialize';
export type activate = 'activate';
export type deactivate = 'deactivate';

export type exitviewport = 'exitviewport';
export type enterviewport = 'enterviewport';

export type exittrigger = 'exit';
export type entertrigger = 'enter';

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
export type pointerenter = 'pointerenter';
export type pointerleave = 'pointerleave';
export type pointercancel = 'pointercancel';
export type pointerwheel = 'pointerwheel';

export type up = 'up';
export type down = 'down';
export type move = 'move';
export type enter = 'enter';
export type leave = 'leave';
export type cancel = 'cancel';
export type wheel = 'wheel';

export type press = 'press';
export type release = 'release';
export type hold = 'hold';

export type pointerdragstart = 'pointerdragstart';
export type pointerdragend = 'pointerdragend';
export type pointerdragenter = 'pointerdragenter';
export type pointerdragleave = 'pointerdragleave';
export type pointerdragmove = 'pointerdragmove';

export type add = 'add';
export type remove = 'remove';

/**
 * Base event type in Excalibur that all other event types derive from. Not all event types are thrown on all Excalibur game objects,
 * some events are unique to a type, others are not.
 *
 */
export class GameEvent<T, U = T> {
  /**
   * Target object for this event.
   */
  public target: T;

  /**
   * Other target object for this event
   */
  public other: U | null = null;

  /**
   * If set to false, prevents event from propagating to other actors. If true it will be propagated
   * to all actors that apply.
   */
  public get bubbles(): boolean {
    return this._bubbles;
  }

  public set bubbles(value: boolean) {
    this._bubbles = value;
  }

  private _bubbles: boolean = true;
  /**
   * Prevents event from bubbling
   */
  public stopPropagation() {
    this.bubbles = false;
  }
}

/**
 * The 'kill' event is emitted on actors when it is killed. The target is the actor that was killed.
 */
export class KillEvent extends GameEvent<Entity> {
  constructor(public self: Entity) {
    super();
    this.target = self;
  }
}

/**
 * The 'prekill' event is emitted directly before an actor is killed.
 */
export class PreKillEvent extends GameEvent<Actor> {
  constructor(public self: Actor) {
    super();
    this.target = self;
  }
}

/**
 * The 'postkill' event is emitted directly after the actor is killed.
 */
export class PostKillEvent extends GameEvent<Actor> {
  constructor(public self: Actor) {
    super();
    this.target = self;
  }
}

/**
 * The 'start' event is emitted on engine when has started and is ready for interaction.
 */
export class GameStartEvent extends GameEvent<Engine> {
  constructor(public self: Engine) {
    super();
    this.target = self;
  }
}

/**
 * The 'stop' event is emitted on engine when has been stopped and will no longer take input, update or draw.
 */
export class GameStopEvent extends GameEvent<Engine> {
  constructor(public self: Engine) {
    super();
    this.target = self;
  }
}

/**
 * The 'predraw' event is emitted on actors, scenes, and engine before drawing starts. Actors' predraw happens inside their graphics
 * transform so that all drawing takes place with the actor as the origin.
 *
 */
export class PreDrawEvent extends GameEvent<Entity | Scene | Engine | TileMap> {
  constructor(
    public ctx: ExcaliburGraphicsContext,
    public elapsed: number,
    public self: Entity | Scene | Engine | TileMap
  ) {
    super();
    this.target = self;
  }
}

/**
 * The 'postdraw' event is emitted on actors, scenes, and engine after drawing finishes. Actors' postdraw happens inside their graphics
 * transform so that all drawing takes place with the actor as the origin.
 *
 */
export class PostDrawEvent extends GameEvent<Entity | Scene | Engine | TileMap> {
  constructor(
    public ctx: ExcaliburGraphicsContext,
    public elapsed: number,
    public self: Entity | Scene | Engine | TileMap
  ) {
    super();
    this.target = self;
  }
}

/**
 * The 'pretransformdraw' event is emitted on actors/entities before any graphics transforms have taken place.
 * Useful if you need to completely customize the draw or modify the transform before drawing in the draw step (for example needing
 * latest camera positions)
 *
 */
export class PreTransformDrawEvent extends GameEvent<Entity> {
  constructor(
    public ctx: ExcaliburGraphicsContext,
    public elapsed: number,
    public self: Entity
  ) {
    super();
    this.target = self;
  }
}

/**
 * The 'posttransformdraw' event is emitted on actors/entities after all graphics have been draw and transforms reset.
 * Useful if you need to completely custom the draw after everything is done.
 *
 */
export class PostTransformDrawEvent extends GameEvent<Entity> {
  constructor(
    public ctx: ExcaliburGraphicsContext,
    public elapsed: number,
    public self: Entity
  ) {
    super();
    this.target = self;
  }
}

/**
 * The 'predebugdraw' event is emitted on actors, scenes, and engine before debug drawing starts.
 */
export class PreDebugDrawEvent extends GameEvent<Entity | Actor | Scene | Engine> {
  constructor(
    public ctx: ExcaliburGraphicsContext,
    public self: Entity | Actor | Scene | Engine
  ) {
    super();
    this.target = self;
  }
}

/**
 * The 'postdebugdraw' event is emitted on actors, scenes, and engine after debug drawing starts.
 */
export class PostDebugDrawEvent extends GameEvent<Entity | Actor | Scene | Engine> {
  constructor(
    public ctx: ExcaliburGraphicsContext,
    public self: Entity | Actor | Scene | Engine
  ) {
    super();
    this.target = self;
  }
}

/**
 * The 'preupdate' event is emitted on actors, scenes, camera, and engine before the update starts.
 */
export class PreUpdateEvent<T extends OnPreUpdate = Entity> extends GameEvent<T> {
  constructor(
    public engine: Engine,
    public elapsed: number,
    public self: T
  ) {
    super();
    this.target = self;
  }
}

/**
 * The 'postupdate' event is emitted on actors, scenes, camera, and engine after the update ends.
 */
export class PostUpdateEvent<T extends OnPostUpdate = Entity> extends GameEvent<T> {
  constructor(
    public engine: Engine,
    public elapsed: number,
    public self: T
  ) {
    super();
    this.target = self;
  }
}

/**
 * The 'preframe' event is emitted on the engine, before the frame begins.
 */
export class PreFrameEvent extends GameEvent<Engine> {
  constructor(
    public engine: Engine,
    public prevStats: FrameStats
  ) {
    super();
    this.target = engine;
  }
}

/**
 * The 'postframe' event is emitted on the engine, after a frame ends.
 */
export class PostFrameEvent extends GameEvent<Engine> {
  constructor(
    public engine: Engine,
    public stats: FrameStats
  ) {
    super();
    this.target = engine;
  }
}

/**
 * Event received when a gamepad is connected to Excalibur. {@apilink Gamepads} receives this event.
 */
export class GamepadConnectEvent extends GameEvent<Gamepad> {
  constructor(
    public index: number,
    public gamepad: Gamepad
  ) {
    super();
    this.target = gamepad;
  }
}

/**
 * Event received when a gamepad is disconnected from Excalibur. {@apilink Gamepads} receives this event.
 */
export class GamepadDisconnectEvent extends GameEvent<Gamepad> {
  constructor(
    public index: number,
    public gamepad: Gamepad
  ) {
    super();
    this.target = gamepad;
  }
}

/**
 * Gamepad button event. See {@apilink Gamepads} for information on responding to controller input. {@apilink Gamepad} instances receive this event;
 */
export class GamepadButtonEvent extends GameEvent<Gamepad> {
  /**
   * @param button  The Gamepad {@apilink Buttons} if not known by excalibur {@apilink Buttons.Unknown} is returned, use index to disambiguate.
   * @param index   The canonical index of the gamepad button from the system
   * @param value   A numeric value between 0 and 1
   * @param self    Reference to the gamepad
   */
  constructor(
    /**
     * The Gamepad {@apilink Buttons} if not known by excalibur {@apilink Buttons.Unknown} is returned, use index to disambiguate.
     */
    public button: Buttons,
    /**
     * The canonical index of the gamepad button from the system
     */
    public index: number,
    /**
     * A numeric value between 0 and 1
     */
    public value: number,
    /**
     * Reference to the gamepad
     */
    public self: Gamepad
  ) {
    super();
    this.target = self;
  }
}

/**
 * Gamepad axis event. See {@apilink Gamepads} for information on responding to controller input. {@apilink Gamepad} instances receive this event;
 */
export class GamepadAxisEvent extends GameEvent<Gamepad> {
  /**
   * @param axis  The Gamepad axis
   * @param value A numeric value between -1 and 1
   * @param self Reference to the gamepad
   */
  constructor(
    /**
     * The Gamepad {@apilink Axis}
     */
    public axis: Axes,
    /**
     * A numeric value between -1 and 1, 0 is the neutral axis position.
     */
    public value: number,
    /**
     * Reference to the gamepad
     */
    public self: Gamepad
  ) {
    super();
    this.target = self;
  }
}

/**
 * Event received by the {@apilink Engine} when the browser window is visible on a screen.
 */
export class VisibleEvent extends GameEvent<Engine> {
  constructor(public self: Engine) {
    super();
    this.target = self;
  }
}

/**
 * Event received by the {@apilink Engine} when the browser window is hidden from all screens.
 */
export class HiddenEvent extends GameEvent<Engine> {
  constructor(public self: Engine) {
    super();
    this.target = self;
  }
}

/**
 * Event thrown on an {@apilink Actor | `actor`} when a collision will occur this frame if it resolves
 */
export class PreCollisionEvent<T extends Collider = Collider> extends GameEvent<T> {
  /**
   * @param self          The actor the event was thrown on
   * @param other         The actor that will collided with the current actor
   * @param side          The side that will be collided with the current actor
   * @param intersection  Intersection vector
   */
  constructor(
    public self: T,
    public other: T,
    public side: Side,
    public intersection: Vector,
    public contact: CollisionContact
  ) {
    super();
    this.target = self;
  }
}

/**
 * Event thrown on an {@apilink Actor | `actor`} when a collision has been resolved (body reacted) this frame
 */
export class PostCollisionEvent<T extends Collider = Collider> extends GameEvent<T> {
  /**
   * @param self          The actor the event was thrown on
   * @param other         The actor that did collide with the current actor
   * @param side          The side that did collide with the current actor
   * @param intersection  Intersection vector
   */
  constructor(
    public self: T,
    public other: T,
    public side: Side,
    public intersection: Vector,
    public contact: CollisionContact
  ) {
    super();
    this.target = self;
  }
}

export class ContactStartEvent<T extends Collider = Collider> {
  constructor(
    public self: T,
    public other: T,
    public side: Side,
    public contact: CollisionContact
  ) {}
}

export class ContactEndEvent<T extends Collider = Collider> {
  constructor(
    public self: T,
    public other: T,
    public side: Side,
    public lastContact: CollisionContact
  ) {}
}

export class CollisionPreSolveEvent<T extends Collider = Collider> {
  constructor(
    public self: T,
    public other: T,
    public side: Side,
    public intersection: Vector,
    public contact: CollisionContact
  ) {}
}

export class CollisionPostSolveEvent<T extends Collider = Collider> {
  constructor(
    public self: T,
    public other: T,
    public side: Side,
    public intersection: Vector,
    public contact: CollisionContact
  ) {}
}

/**
 * Event thrown the first time an {@apilink Actor | `actor`} collides with another, after an actor is in contact normal collision events are fired.
 */
export class CollisionStartEvent<T extends Collider = Collider> extends GameEvent<T> {
  /**
   *
   * @param self
   * @param other
   * @param side
   * @param contact
   */
  constructor(
    public self: T,
    public other: T,
    public side: Side,
    public contact: CollisionContact
  ) {
    super();
    this.target = self;
  }
}

/**
 * Event thrown when the {@apilink Actor | `actor`} is no longer colliding with another
 */
export class CollisionEndEvent<T extends Collider = Collider> extends GameEvent<T> {
  /**
   *
   */
  constructor(
    public self: T,
    public other: T,
    public side: Side,
    public lastContact: CollisionContact
  ) {
    super();
    this.target = self;
  }
}

/**
 * Event thrown on an {@apilink Actor}, {@apilink Scene}, and {@apilink Engine} only once before the first update call
 */
export class InitializeEvent<T extends OnInitialize = Entity> extends GameEvent<T> {
  /**
   * @param engine  The reference to the current engine
   */
  constructor(
    public engine: Engine,
    public self: T
  ) {
    super();
    this.target = self;
  }
}

/**
 * Event thrown on a {@apilink Scene} on activation
 */
export class ActivateEvent<TData = undefined> extends GameEvent<Scene> {
  /**
   * @param context  The context for the scene activation
   */
  constructor(
    public context: SceneActivationContext<TData>,
    public self: Scene
  ) {
    super();
    this.target = self;
  }
}

/**
 * Event thrown on a {@apilink Scene} on deactivation
 */
export class DeactivateEvent extends GameEvent<Scene> {
  /**
   * @param context  The context for the scene deactivation
   */
  constructor(
    public context: SceneActivationContext<never>,
    public self: Scene
  ) {
    super();
    this.target = self;
  }
}

/**
 * Event thrown on an {@apilink Actor} when the graphics bounds completely leaves the screen.
 */
export class ExitViewPortEvent extends GameEvent<Entity> {
  constructor(public self: Entity) {
    super();
    this.target = self;
  }
}

/**
 * Event thrown on an {@apilink Actor} when any part of the graphics bounds are on screen.
 */
export class EnterViewPortEvent extends GameEvent<Entity> {
  constructor(public self: Entity) {
    super();
    this.target = self;
  }
}

export class EnterTriggerEvent extends GameEvent<Trigger> {
  constructor(
    public self: Trigger,
    public entity: Entity
  ) {
    super();
    this.target = self;
  }
}

export class ExitTriggerEvent extends GameEvent<Trigger> {
  constructor(
    public self: Trigger,
    public entity: Entity
  ) {
    super();
    this.target = self;
  }
}

/**
 * Event thrown on an {@apilink Actor} when an action starts.
 */
export class ActionStartEvent extends GameEvent<Entity> {
  constructor(
    public action: Action,
    public self: Entity
  ) {
    super();
    this.target = self;
  }
}

/**
 * Event thrown on an {@apilink Actor} when an action completes.
 */
export class ActionCompleteEvent extends GameEvent<Entity> {
  constructor(
    public action: Action,
    public self: Entity
  ) {
    super();
    this.target = self;
  }
}

/**
 * Event thrown on an [[Actor]] when an Actor added to scene.
 */
export class AddEvent<T extends OnAdd> extends GameEvent<T> {
  constructor(
    public engine: Engine,
    public self: T
  ) {
    super();
    this.target = self;
  }
}

/**
 * Event thrown on an [[Actor]] when an Actor removed from scene.
 */
export class RemoveEvent<T extends OnRemove> extends GameEvent<T> {
  constructor(
    public engine: Engine,
    public self: T
  ) {
    super();
    this.target = self;
  }
}

/**
 * Event thown on a pause event in scene
 */
export class PauseEvent extends GameEvent<Scene> {
  /**
   * @param context  The context for the scene deactivation
   */
  constructor(public self: Scene) {
    super();
    this.target = self;
  }
}

/**
 * Event thown on a resume event in scene
 */
export class ResumeEvent extends GameEvent<Scene> {
  /**
   * @param context  The context for the scene deactivation
   */
  constructor(public self: Scene) {
    super();
    this.target = self;
  }
}
