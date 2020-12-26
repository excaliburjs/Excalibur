import { Scene } from './Scene';
import { Vector } from './Algebra';
import { Actor } from './Actor';
import { Trigger } from './Trigger';
import { FrameStats } from './Debug';
import { Engine } from './Engine';
import { TileMap } from './TileMap';
import { Side } from './Collision/Side';
import * as Input from './Input/Index';
import { Pair } from './index';
import { Collider } from './Collision/Collider';
import { Entity } from './EntityComponentSystem/Entity';
import { OnInitialize, OnPreUpdate, OnPostUpdate } from './Interfaces/LifecycleEvents';

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

  Subscribe = 'subscribe',
  Unsubscribe = 'unsubscribe',

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
  PointerDragMove = 'pointerdragmove'
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
  public other: U | null;

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
export class KillEvent extends GameEvent<Actor> {
  constructor(public target: Actor) {
    super();
  }
}

/**
 * The 'prekill' event is emitted directly before an actor is killed.
 */
export class PreKillEvent extends GameEvent<Actor> {
  constructor(public target: Actor) {
    super();
  }
}

/**
 * The 'postkill' event is emitted directly after the actor is killed.
 */
export class PostKillEvent extends GameEvent<Actor> {
  constructor(public target: Actor) {
    super();
  }
}

/**
 * The 'start' event is emitted on engine when has started and is ready for interaction.
 */
export class GameStartEvent extends GameEvent<Engine> {
  constructor(public target: Engine) {
    super();
  }
}

/**
 * The 'stop' event is emitted on engine when has been stopped and will no longer take input, update or draw.
 */
export class GameStopEvent extends GameEvent<Engine> {
  constructor(public target: Engine) {
    super();
  }
}

/**
 * The 'predraw' event is emitted on actors, scenes, and engine before drawing starts. Actors' predraw happens inside their graphics
 * transform so that all drawing takes place with the actor as the origin.
 *
 */
export class PreDrawEvent extends GameEvent<Entity | Scene | Engine | TileMap> {
  constructor(public ctx: CanvasRenderingContext2D, public delta: number, public target: Entity | Scene | Engine | TileMap) {
    super();
  }
}

/**
 * The 'postdraw' event is emitted on actors, scenes, and engine after drawing finishes. Actors' postdraw happens inside their graphics
 * transform so that all drawing takes place with the actor as the origin.
 *
 */
export class PostDrawEvent extends GameEvent<Entity | Scene | Engine | TileMap> {
  constructor(public ctx: CanvasRenderingContext2D, public delta: number, public target: Entity | Scene | Engine | TileMap) {
    super();
  }
}

/**
 * The 'predebugdraw' event is emitted on actors, scenes, and engine before debug drawing starts.
 */
export class PreDebugDrawEvent extends GameEvent<Entity | Actor | Scene | Engine> {
  constructor(public ctx: CanvasRenderingContext2D, public target: Entity | Actor | Scene | Engine) {
    super();
  }
}

/**
 * The 'postdebugdraw' event is emitted on actors, scenes, and engine after debug drawing starts.
 */
export class PostDebugDrawEvent extends GameEvent<Entity | Actor | Scene | Engine> {
  constructor(public ctx: CanvasRenderingContext2D, public target: Entity | Actor | Scene | Engine) {
    super();
  }
}

/**
 * The 'preupdate' event is emitted on actors, scenes, camera, and engine before the update starts.
 */
export class PreUpdateEvent<T extends OnPreUpdate = Entity> extends GameEvent<T> {
  constructor(public engine: Engine, public delta: number, public target: T) {
    super();
  }
}

/**
 * The 'postupdate' event is emitted on actors, scenes, camera, and engine after the update ends.
 */
export class PostUpdateEvent<T extends OnPostUpdate = Entity> extends GameEvent<T> {
  constructor(public engine: Engine, public delta: number, public target: T) {
    super();
  }
}

/**
 * The 'preframe' event is emitted on the engine, before the frame begins.
 */
export class PreFrameEvent extends GameEvent<Engine> {
  constructor(public engine: Engine, public prevStats: FrameStats) {
    super();
    this.target = engine;
  }
}

/**
 * The 'postframe' event is emitted on the engine, after a frame ends.
 */
export class PostFrameEvent extends GameEvent<Engine> {
  constructor(public engine: Engine, public stats: FrameStats) {
    super();
    this.target = engine;
  }
}

/**
 * Event received when a gamepad is connected to Excalibur. [[Gamepads]] receives this event.
 */
export class GamepadConnectEvent extends GameEvent<Input.Gamepad> {
  constructor(public index: number, public gamepad: Input.Gamepad) {
    super();
    this.target = gamepad;
  }
}

/**
 * Event received when a gamepad is disconnected from Excalibur. [[Gamepads]] receives this event.
 */
export class GamepadDisconnectEvent extends GameEvent<Input.Gamepad> {
  constructor(public index: number, public gamepad: Input.Gamepad) {
    super();
    this.target = gamepad;
  }
}

/**
 * Gamepad button event. See [[Gamepads]] for information on responding to controller input. [[Gamepad]] instances receive this event;
 */
export class GamepadButtonEvent extends GameEvent<Input.Gamepad> {
  /**
   * @param button  The Gamepad button
   * @param value   A numeric value between 0 and 1
   */
  constructor(public button: Input.Buttons, public value: number, public target: Input.Gamepad) {
    super();
  }
}

/**
 * Gamepad axis event. See [[Gamepads]] for information on responding to controller input. [[Gamepad]] instances receive this event;
 */
export class GamepadAxisEvent extends GameEvent<Input.Gamepad> {
  /**
   * @param axis  The Gamepad axis
   * @param value A numeric value between -1 and 1
   */
  constructor(public axis: Input.Axes, public value: number, public target: Input.Gamepad) {
    super();
  }
}

/**
 * Subscribe event thrown when handlers for events other than subscribe are added. Meta event that is received by
 * [[EventDispatcher|event dispatchers]].
 */
export class SubscribeEvent<T> extends GameEvent<T> {
  constructor(public topic: string, public handler: (event: GameEvent<T>) => void) {
    super();
  }
}

/**
 * Unsubscribe event thrown when handlers for events other than unsubscribe are removed. Meta event that is received by
 * [[EventDispatcher|event dispatchers]].
 */
export class UnsubscribeEvent<T> extends GameEvent<T> {
  constructor(public topic: string, public handler: (event: GameEvent<T>) => void) {
    super();
  }
}

/**
 * Event received by the [[Engine]] when the browser window is visible on a screen.
 */
export class VisibleEvent extends GameEvent<Engine> {
  constructor(public target: Engine) {
    super();
  }
}

/**
 * Event received by the [[Engine]] when the browser window is hidden from all screens.
 */
export class HiddenEvent extends GameEvent<Engine> {
  constructor(public target: Engine) {
    super();
  }
}

/**
 * Event thrown on an [[Actor|actor]] when a collision will occur this frame if it resolves
 */
export class PreCollisionEvent<T extends Collider | Entity = Actor> extends GameEvent<T> {
  /**
   * @param actor         The actor the event was thrown on
   * @param other         The actor that will collided with the current actor
   * @param side          The side that will be collided with the current actor
   * @param intersection  Intersection vector
   */
  constructor(actor: T, public other: T, public side: Side, public intersection: Vector) {
    super();
    this.target = actor;
  }

  public get actor() {
    return this.target;
  }

  public set actor(actor: T) {
    this.target = actor;
  }
}

/**
 * Event thrown on an [[Actor|actor]] when a collision has been resolved (body reacted) this frame
 */
export class PostCollisionEvent<T extends Collider | Entity = Actor> extends GameEvent<T> {
  /**
   * @param actor         The actor the event was thrown on
   * @param other         The actor that did collide with the current actor
   * @param side          The side that did collide with the current actor
   * @param intersection  Intersection vector
   */
  constructor(actor: T, public other: T, public side: Side, public intersection: Vector) {
    super();
    this.target = actor;
  }

  public get actor() {
    return this.target;
  }

  public set actor(actor: T) {
    this.target = actor;
  }
}

/**
 * Event thrown the first time an [[Actor|actor]] collides with another, after an actor is in contact normal collision events are fired.
 */
export class CollisionStartEvent<T extends Collider | Entity = Actor> extends GameEvent<T> {
  /**
   *
   * @param actor
   * @param other
   * @param pair
   */
  constructor(actor: T, public other: T, public pair: Pair) {
    super();
    this.target = actor;
  }

  public get actor() {
    return this.target;
  }

  public set actor(actor: T) {
    this.target = actor;
  }
}

/**
 * Event thrown when the [[Actor|actor]] is no longer colliding with another
 */
export class CollisionEndEvent<T extends Collider | Entity = Actor> extends GameEvent<T> {
  /**
   *
   */
  constructor(actor: T, public other: T) {
    super();
    this.target = actor;
  }

  public get actor() {
    return this.target;
  }

  public set actor(actor: T) {
    this.target = actor;
  }
}

/**
 * Event thrown on an [[Actor]] and a [[Scene]] only once before the first update call
 */
export class InitializeEvent<T extends OnInitialize = Entity> extends GameEvent<T> {
  /**
   * @param engine  The reference to the current engine
   */
  constructor(public engine: Engine, public target: T) {
    super();
  }
}

/**
 * Event thrown on a [[Scene]] on activation
 */
export class ActivateEvent extends GameEvent<Scene> {
  /**
   * @param oldScene  The reference to the old scene
   */
  constructor(public oldScene: Scene, public target: Scene) {
    super();
  }
}

/**
 * Event thrown on a [[Scene]] on deactivation
 */
export class DeactivateEvent extends GameEvent<Scene> {
  /**
   * @param newScene  The reference to the new scene
   */
  constructor(public newScene: Scene, public target: Scene) {
    super();
  }
}

/**
 * Event thrown on an [[Actor]] when it completely leaves the screen.
 */
export class ExitViewPortEvent extends GameEvent<Entity> {
  constructor(public target: Entity) {
    super();
  }
}

/**
 * Event thrown on an [[Actor]] when it completely leaves the screen.
 */
export class EnterViewPortEvent extends GameEvent<Entity> {
  constructor(public target: Entity) {
    super();
  }
}

export class EnterTriggerEvent extends GameEvent<Actor> {
  constructor(public target: Trigger, public actor: Actor) {
    super();
  }
}

export class ExitTriggerEvent extends GameEvent<Actor> {
  constructor(public target: Trigger, public actor: Actor) {
    super();
  }
}
