import { Texture } from './Resources/Texture';
import {
  InitializeEvent,
  KillEvent,
  PreUpdateEvent,
  PostUpdateEvent,
  PreDrawEvent,
  PostDrawEvent,
  PreDebugDrawEvent,
  PostDebugDrawEvent,
  PostCollisionEvent,
  PreCollisionEvent,
  CollisionStartEvent,
  CollisionEndEvent,
  PostKillEvent,
  PreKillEvent,
  GameEvent,
  ExitTriggerEvent,
  EnterTriggerEvent,
  EnterViewPortEvent,
  ExitViewPortEvent
} from './Events';
import { PointerEvent, WheelEvent, PointerDragEvent, PointerEventName } from './Input/PointerEvents';
import { Engine } from './Engine';
import { Color } from './Drawing/Color';
import { Sprite } from './Drawing/Sprite';
import { Animation } from './Drawing/Animation';
import { Trait } from './Interfaces/Trait';
import { Drawable } from './Interfaces/Drawable';
import { CanInitialize, CanUpdate, CanDraw, CanBeKilled } from './Interfaces/LifecycleEvents';
import { Scene } from './Scene';
import { Logger } from './Util/Log';
import { ActionContext } from './Actions/ActionContext';
import { ActionQueue } from './Actions/Action';
import { Vector } from './Algebra';
import { Body } from './Collision/Body';
import { Eventable } from './Interfaces/Evented';
import { Actionable } from './Actions/Actionable';
import { Configurable } from './Configurable';
import * as Traits from './Traits/Index';
import * as Util from './Util/Util';
import * as Events from './Events';
import { PointerEvents } from './Interfaces/PointerEventHandlers';
import { CollisionType } from './Collision/CollisionType';
import { obsolete } from './Util/Decorators';
import { Collider } from './Collision/Collider';
import { Shape } from './Collision/Shape';

import { Entity } from './EntityComponentSystem/Entity';

/**
 * Type guard for checking if something is an Actor
 * @param x
 */
export function isActor(x: any): x is Actor {
  return x instanceof Actor;
}

export interface ActorArgs extends Partial<ActorImpl> {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  pos?: Vector;
  vel?: Vector;
  acc?: Vector;
  rotation?: number;
  rx?: number;
  z?: number;
  color?: Color;
  visible?: boolean;
  body?: Body;
  collisionType?: CollisionType;
}

export interface ActorDefaults {
  anchor: Vector;
}

/**
 * @hidden
 */

export class ActorImpl extends Entity implements Actionable, Eventable, PointerEvents, CanInitialize, CanUpdate, CanDraw, CanBeKilled {
  // #region Properties

  /**
   * Indicates the next id to be set
   */
  public static defaults: ActorDefaults = {
    anchor: Vector.Half
  };
  /**
   * Indicates the next id to be set
   */
  public static maxId = 0;
  /**
   * The unique identifier for the actor
   */
  public id: number = ActorImpl.maxId++;

  /**
   * The physics body the is associated with this actor. The body is the container for all physical properties, like position, velocity,
   * acceleration, mass, inertia, etc.
   */
  public get body(): Body {
    return this._body;
  }

  public set body(body: Body) {
    this._body = body;
    this._body.actor = this;
  }

  private _body: Body;

  /**
   * Gets the position vector of the actor in pixels
   */
  public get pos(): Vector {
    return this.body.pos;
  }

  /**
   * Sets the position vector of the actor in pixels
   */
  public set pos(thePos: Vector) {
    this.body.pos.setTo(thePos.x, thePos.y);
  }

  /**
   * Gets the position vector of the actor from the last frame
   */
  public get oldPos(): Vector {
    return this.body.oldPos;
  }

  /**
   * Sets the position vector of the actor in the last frame
   */
  public set oldPos(thePos: Vector) {
    this.body.oldPos.setTo(thePos.x, thePos.y);
  }

  /**
   * Gets the velocity vector of the actor in pixels/sec
   */
  public get vel(): Vector {
    return this.body.vel;
  }

  /**
   * Sets the velocity vector of the actor in pixels/sec
   */
  public set vel(theVel: Vector) {
    this.body.vel.setTo(theVel.x, theVel.y);
  }

  /**
   * Gets the velocity vector of the actor from the last frame
   */
  public get oldVel(): Vector {
    return this.body.oldVel;
  }

  /**
   * Sets the velocity vector of the actor from the last frame
   */
  public set oldVel(theVel: Vector) {
    this.body.oldVel.setTo(theVel.x, theVel.y);
  }

  /**
   * Gets the acceleration vector of the actor in pixels/second/second. An acceleration pointing down such as (0, 100) may be
   * useful to simulate a gravitational effect.
   */
  public get acc(): Vector {
    return this.body.acc;
  }

  /**
   * Sets the acceleration vector of teh actor in pixels/second/second
   */
  public set acc(theAcc: Vector) {
    this.body.acc.setTo(theAcc.x, theAcc.y);
  }

  /**
   * Sets the acceleration of the actor from the last frame. This does not include the global acc [[Physics.acc]].
   */
  public set oldAcc(theAcc: Vector) {
    this.body.oldAcc.setTo(theAcc.x, theAcc.y);
  }

  /**
   * Gets the acceleration of the actor from the last frame. This does not include the global acc [[Physics.acc]].
   */
  public get oldAcc(): Vector {
    return this.body.oldAcc;
  }

  /**
   * Gets the rotation of the actor in radians. 1 radian = 180/PI Degrees.
   */
  public get rotation(): number {
    return this.body.rotation;
  }

  /**
   * Sets the rotation of the actor in radians. 1 radian = 180/PI Degrees.
   */
  public set rotation(theAngle: number) {
    this.body.rotation = theAngle;
  }

  /**
   * Gets the rotational velocity of the actor in radians/second
   */
  public get rx(): number {
    return this.body.rx;
  }

  /**
   * Sets the rotational velocity of the actor in radians/sec
   */
  public set rx(angularVelocity: number) {
    this.body.rx = angularVelocity;
  }

  /**
   * The anchor to apply all actor related transformations like rotation,
   * translation, and scaling. By default the anchor is in the center of
   * the actor. By default it is set to the center of the actor (.5, .5)
   *
   * An anchor of (.5, .5) will ensure that drawings are centered.
   *
   * Use `anchor.setTo` to set the anchor to a different point using
   * values between 0 and 1. For example, anchoring to the top-left would be
   * `Actor.anchor.setTo(0, 0)` and top-right would be `Actor.anchor.setTo(0, 1)`.
   */
  public anchor: Vector;

  private _height: number = 0;
  private _width: number = 0;

  /**
   * Gets the scale vector of the actor
   * @obsolete ex.Actor.scale will be removed in v0.25.0, set width and height directly in constructor
   */
  public get scale(): Vector {
    return this.body.scale;
  }

  /**
   * Sets the scale vector of the actor for
   * @obsolete ex.Actor.scale will be removed in v0.25.0, set width and height directly in constructor
   */
  public set scale(scale: Vector) {
    this.body.scale = scale;
  }

  /**
   * Gets the old scale of the actor last frame
   * @obsolete ex.Actor.scale will be removed in v0.25.0, set width and height directly in constructor
   */
  public get oldScale(): Vector {
    return this.body.oldScale;
  }

  /**
   * Sets the the old scale of the actor last frame
   * @obsolete ex.Actor.scale will be removed in v0.25.0, set width and height directly in constructor
   */
  public set oldScale(scale: Vector) {
    this.body.oldScale = scale;
  }

  /**
   * Gets the x scalar velocity of the actor in scale/second
   * @obsolete ex.Actor.sx will be removed in v0.25.0, set width and height directly in constructor
   */
  public get sx(): number {
    return this.body.sx;
  }

  /**
   * Sets the x scalar velocity of the actor in scale/second
   * @obsolete ex.Actor.sx will be removed in v0.25.0, set width and height directly in constructor
   */
  @obsolete({ message: 'ex.Actor.sx will be removed in v0.25.0', alternateMethod: 'Set width and height directly in constructor' })
  public set sx(scalePerSecondX: number) {
    this.body.sx = scalePerSecondX;
  }

  /**
   * Gets the y scalar velocity of the actor in scale/second
   * @obsolete ex.Actor.sy will be removed in v0.25.0, set width and height directly in constructor
   */
  public get sy(): number {
    return this.body.sy;
  }

  /**
   * Sets the y scale velocity of the actor in scale/second
   * @obsolete ex.Actor.sy will be removed in v0.25.0, set width and height directly in constructor
   */
  @obsolete({ message: 'ex.Actor.sy will be removed in v0.25.0', alternateMethod: 'Set width and height directly in constructor' })
  public set sy(scalePerSecondY: number) {
    this.body.sy = scalePerSecondY;
  }

  /**
   * Indicates whether the actor is physically in the viewport
   */
  public isOffScreen: boolean = false;
  /**
   * The visibility of an actor
   */
  public visible: boolean = true;
  /**
   * The opacity of an actor. Passing in a color in the [[constructor]] will use the
   * color's opacity.
   */
  public opacity: number = 1;
  public previousOpacity: number = 1;

  /**
   * Direct access to the actor's [[ActionQueue]]. Useful if you are building custom actions.
   */
  public actionQueue: ActionQueue;

  /**
   * [[ActionContext|Action context]] of the actor. Useful for scripting actor behavior.
   */
  public actions: ActionContext;

  /**
   * Convenience reference to the global logger
   */
  public logger: Logger = Logger.getInstance();

  /**
   * The scene that the actor is in
   */
  public scene: Scene = null;

  /**
   * The parent of this actor
   */
  public parent: Actor = null;

  /**
   * The children of this actor
   */
  public children: Actor[] = [];

  public frames: { [key: string]: Drawable } = {};

  /**
   * Access to the current drawing for the actor, this can be
   * an [[Animation]], [[Sprite]], or [[Polygon]].
   * Set drawings with [[setDrawing]].
   */
  public currentDrawing: Drawable = null;

  /**
   * Draggable helper
   */

  private _draggable: boolean = false;
  private _dragging: boolean = false;

  private _pointerDragStartHandler = () => {
    this._dragging = true;
  };

  private _pointerDragEndHandler = () => {
    this._dragging = false;
  };

  private _pointerDragMoveHandler = (pe: PointerEvent) => {
    if (this._dragging) {
      this.pos = pe.pointer.lastWorldPos;
    }
  };

  private _pointerDragLeaveHandler = (pe: PointerEvent) => {
    if (this._dragging) {
      this.pos = pe.pointer.lastWorldPos;
    }
  };

  public get draggable(): boolean {
    return this._draggable;
  }

  public set draggable(isDraggable: boolean) {
    if (isDraggable) {
      if (isDraggable && !this._draggable) {
        this.on('pointerdragstart', this._pointerDragStartHandler);
        this.on('pointerdragend', this._pointerDragEndHandler);
        this.on('pointerdragmove', this._pointerDragMoveHandler);
        this.on('pointerdragleave', this._pointerDragLeaveHandler);
      } else if (!isDraggable && this._draggable) {
        this.off('pointerdragstart', this._pointerDragStartHandler);
        this.off('pointerdragend', this._pointerDragEndHandler);
        this.off('pointerdragmove', this._pointerDragMoveHandler);
        this.off('pointerdragleave', this._pointerDragLeaveHandler);
      }

      this._draggable = isDraggable;
    }
  }

  /**
   * Modify the current actor update pipeline.
   */
  public traits: Trait[] = [];

  /**
   * Sets the color of the actor. A rectangle of this color will be
   * drawn if no [[Drawable]] is specified as the actors drawing.
   *
   * The default is `null` which prevents a rectangle from being drawn.
   */
  public get color(): Color {
    return this._color;
  }
  public set color(v: Color) {
    this._color = v.clone();
  }
  private _color: Color;

  /**
   * Whether or not to enable the [[CapturePointer]] trait that propagates
   * pointer events to this actor
   */
  public enableCapturePointer: boolean = false;

  /**
   * Configuration for [[CapturePointer]] trait
   */
  public capturePointer: Traits.CapturePointerConfig = {
    captureMoveEvents: false,
    captureDragEvents: false
  };

  private _zIndex: number = 0;
  private _isKilled: boolean = false;

  // #endregion

  /**
   * @param xOrConfig The starting x coordinate of the actor, or an option bag of [[ActorArgs]]
   * @param y         The starting y coordinate of the actor
   * @param width     The starting width of the actor
   * @param height    The starting height of the actor
   * @param color     The starting color of the actor. Leave null to draw a transparent actor. The opacity of the color will be used as the
   * initial [[opacity]].
   */
  constructor(xOrConfig?: number | ActorArgs, y?: number, width?: number, height?: number, color?: Color) {
    super();

    // initialize default options
    this._initDefaults();

    let shouldInitializeBody = true;
    let collisionType = CollisionType.Passive;
    if (xOrConfig && typeof xOrConfig === 'object') {
      const config = xOrConfig;
      if (config.pos) {
        xOrConfig = config.pos ? config.pos.x : 0;
        y = config.pos ? config.pos.y : 0;
      } else {
        xOrConfig = config.x || 0;
        y = config.y || 0;
      }
      width = config.width;
      height = config.height;

      if (config.body) {
        shouldInitializeBody = false;
        this.body = config.body;
      }

      if (config.anchor) {
        this.anchor = config.anchor;
      }

      if (config.collisionType) {
        collisionType = config.collisionType;
      }
    }

    // Body and collider bounds are still determined by actor width/height
    this._width = width || 0;
    this._height = height || 0;

    // Initialize default collider to be a box
    if (shouldInitializeBody) {
      this.body = new Body({
        collider: new Collider({
          type: collisionType,
          shape: Shape.Box(this._width, this._height, this.anchor)
        })
      });
    }

    // Position uses body to store values must be initialized after body
    this.pos.x = <number>xOrConfig || 0;
    this.pos.y = y || 0;

    if (color) {
      this.color = color;
      // set default opacity of an actor to the color
      this.opacity = color.a;
    }

    // Build default pipeline
    this.traits.push(new Traits.TileMapCollisionDetection());
    this.traits.push(new Traits.OffscreenCulling());
    this.traits.push(new Traits.CapturePointer());

    // Build the action queue
    this.actionQueue = new ActionQueue(this);
    this.actions = new ActionContext(this);
  }

  /**
   * `onInitialize` is called before the first update of the actor. This method is meant to be
   * overridden. This is where initialization of child actors should take place.
   *
   * Synonymous with the event handler `.on('initialize', (evt) => {...})`
   */
  public onInitialize(_engine: Engine): void {
    // Override me
  }

  /**
   * Initializes this actor and all it's child actors, meant to be called by the Scene before first update not by users of Excalibur.
   *
   * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
   *
   * @internal
   */
  public _initialize(engine: Engine) {
    super._initialize(engine);
    for (const child of this.children) {
      child._initialize(engine);
    }
  }

  private _initDefaults() {
    this.anchor = Actor.defaults.anchor.clone();
  }

  // #region Events

  private _capturePointerEvents: PointerEventName[] = [
    'pointerup',
    'pointerdown',
    'pointermove',
    'pointerenter',
    'pointerleave',
    'pointerdragstart',
    'pointerdragend',
    'pointerdragmove',
    'pointerdragenter',
    'pointerdragleave'
  ];

  private _captureMoveEvents: PointerEventName[] = [
    'pointermove',
    'pointerenter',
    'pointerleave',
    'pointerdragmove',
    'pointerdragenter',
    'pointerdragleave'
  ];

  private _captureDragEvents: PointerEventName[] = [
    'pointerdragstart',
    'pointerdragend',
    'pointerdragmove',
    'pointerdragenter',
    'pointerdragleave'
  ];

  private _checkForPointerOptIn(eventName: string) {
    if (eventName) {
      const normalized = <PointerEventName>eventName.toLowerCase();

      if (this._capturePointerEvents.indexOf(normalized) !== -1) {
        this.enableCapturePointer = true;

        if (this._captureMoveEvents.indexOf(normalized) !== -1) {
          this.capturePointer.captureMoveEvents = true;
        }

        if (this._captureDragEvents.indexOf(normalized) !== -1) {
          this.capturePointer.captureDragEvents = true;
        }
      }
    }
  }

  public on(eventName: Events.exittrigger, handler: (event: ExitTriggerEvent) => void): void;
  public on(eventName: Events.entertrigger, handler: (event: EnterTriggerEvent) => void): void;
  /**
   * The **collisionstart** event is fired when a [[Body|physics body]], usually attached to an actor,
   *  first starts colliding with another [[Body|body]], and will not fire again while in contact until
   *  the the pair separates and collides again.
   * Use cases for the **collisionstart** event may be detecting when an actor has touched a surface
   * (like landing) or if a item has been touched and needs to be picked up.
   */
  public on(eventName: Events.collisionstart, handler: (event: CollisionStartEvent) => void): void;
  /**
   * The **collisionend** event is fired when two [[Body|physics bodies]] are no longer in contact.
   * This event will not fire again until another collision and separation.
   *
   * Use cases for the **collisionend** event might be to detect when an actor has left a surface
   * (like jumping) or has left an area.
   */
  public on(eventName: Events.collisionend, handler: (event: CollisionEndEvent) => void): void;
  /**
   * The **precollision** event is fired **every frame** where a collision pair is found and two
   * bodies are intersecting.
   *
   * This event is useful for building in custom collision resolution logic in Passive-Passive or
   * Active-Passive scenarios. For example in a breakout game you may want to tweak the angle of
   * ricochet of the ball depending on which side of the paddle you hit.
   */
  public on(eventName: Events.precollision, handler: (event: PreCollisionEvent) => void): void;
  /**
   * The **postcollision** event is fired for **every frame** where collision resolution was performed.
   * Collision resolution is when two bodies influence each other and cause a response like bouncing
   * off one another. It is only possible to have *postcollision* event in Active-Active and Active-Fixed
   * type collision pairs.
   *
   * Post collision would be useful if you need to know that collision resolution is happening or need to
   * tweak the default resolution.
   */
  public on(eventName: Events.postcollision, handler: (event: PostCollisionEvent) => void): void;
  public on(eventName: Events.kill, handler: (event: KillEvent) => void): void;
  public on(eventName: Events.prekill, handler: (event: PreKillEvent) => void): void;
  public on(eventName: Events.postkill, handler: (event: PostKillEvent) => void): void;
  public on(eventName: Events.initialize, handler: (event: InitializeEvent<Actor>) => void): void;
  public on(eventName: Events.preupdate, handler: (event: PreUpdateEvent<Actor>) => void): void;
  public on(eventName: Events.postupdate, handler: (event: PostUpdateEvent<Actor>) => void): void;
  public on(eventName: Events.predraw, handler: (event: PreDrawEvent) => void): void;
  public on(eventName: Events.postdraw, handler: (event: PostDrawEvent) => void): void;
  public on(eventName: Events.predebugdraw, handler: (event: PreDebugDrawEvent) => void): void;
  public on(eventName: Events.postdebugdraw, handler: (event: PostDebugDrawEvent) => void): void;
  public on(eventName: Events.pointerup, handler: (event: PointerEvent) => void): void;
  public on(eventName: Events.pointerdown, handler: (event: PointerEvent) => void): void;
  public on(eventName: Events.pointerenter, handler: (event: PointerEvent) => void): void;
  public on(eventName: Events.pointerleave, handler: (event: PointerEvent) => void): void;
  public on(eventName: Events.pointermove, handler: (event: PointerEvent) => void): void;
  public on(eventName: Events.pointercancel, handler: (event: PointerEvent) => void): void;
  public on(eventName: Events.pointerwheel, handler: (event: WheelEvent) => void): void;
  public on(eventName: Events.pointerdragstart, handler: (event: PointerDragEvent) => void): void;
  public on(eventName: Events.pointerdragend, handler: (event: PointerDragEvent) => void): void;
  public on(eventName: Events.pointerdragenter, handler: (event: PointerDragEvent) => void): void;
  public on(eventName: Events.pointerdragleave, handler: (event: PointerDragEvent) => void): void;
  public on(eventName: Events.pointerdragmove, handler: (event: PointerDragEvent) => void): void;
  public on(eventName: Events.enterviewport, handler: (event: EnterViewPortEvent) => void): void;
  public on(eventName: Events.exitviewport, handler: (event: ExitViewPortEvent) => void): void;
  public on(eventName: string, handler: (event: GameEvent<Actor>) => void): void;
  public on(eventName: string, handler: (event: any) => void): void {
    this._checkForPointerOptIn(eventName);
    super.on(eventName, handler);
  }

  public once(eventName: Events.exittrigger, handler: (event: ExitTriggerEvent) => void): void;
  public once(eventName: Events.entertrigger, handler: (event: EnterTriggerEvent) => void): void;
  /**
   * The **collisionstart** event is fired when a [[Body|physics body]], usually attached to an actor,
   *  first starts colliding with another [[Body|body]], and will not fire again while in contact until
   *  the the pair separates and collides again.
   * Use cases for the **collisionstart** event may be detecting when an actor has touch a surface
   * (like landing) or if a item has been touched and needs to be picked up.
   */
  public once(eventName: Events.collisionstart, handler: (event: CollisionStartEvent) => void): void;
  /**
   * The **collisionend** event is fired when two [[Body|physics bodies]] are no longer in contact.
   * This event will not fire again until another collision and separation.
   *
   * Use cases for the **collisionend** event might be to detect when an actor has left a surface
   * (like jumping) or has left an area.
   */
  public once(eventName: Events.collisionend, handler: (event: CollisionEndEvent) => void): void;
  /**
   * The **precollision** event is fired **every frame** where a collision pair is found and two
   * bodies are intersecting.
   *
   * This event is useful for building in custom collision resolution logic in Passive-Passive or
   * Active-Passive scenarios. For example in a breakout game you may want to tweak the angle of
   * ricochet of the ball depending on which side of the paddle you hit.
   */
  public once(eventName: Events.precollision, handler: (event: PreCollisionEvent) => void): void;
  /**
   * The **postcollision** event is fired for **every frame** where collision resolution was performed.
   * Collision resolution is when two bodies influence each other and cause a response like bouncing
   * off one another. It is only possible to have *postcollision* event in Active-Active and Active-Fixed
   * type collision pairs.
   *
   * Post collision would be useful if you need to know that collision resolution is happening or need to
   * tweak the default resolution.
   */
  public once(eventName: Events.postcollision, handler: (event: PostCollisionEvent) => void): void;
  public once(eventName: Events.kill, handler: (event: KillEvent) => void): void;
  public once(eventName: Events.postkill, handler: (event: PostKillEvent) => void): void;
  public once(eventName: Events.prekill, handler: (event: PreKillEvent) => void): void;
  public once(eventName: Events.initialize, handler: (event: InitializeEvent<Actor>) => void): void;
  public once(eventName: Events.preupdate, handler: (event: PreUpdateEvent<Actor>) => void): void;
  public once(eventName: Events.postupdate, handler: (event: PostUpdateEvent<Actor>) => void): void;
  public once(eventName: Events.predraw, handler: (event: PreDrawEvent) => void): void;
  public once(eventName: Events.postdraw, handler: (event: PostDrawEvent) => void): void;
  public once(eventName: Events.predebugdraw, handler: (event: PreDebugDrawEvent) => void): void;
  public once(eventName: Events.postdebugdraw, handler: (event: PostDebugDrawEvent) => void): void;
  public once(eventName: Events.pointerup, handler: (event: PointerEvent) => void): void;
  public once(eventName: Events.pointerdown, handler: (event: PointerEvent) => void): void;
  public once(eventName: Events.pointerenter, handler: (event: PointerEvent) => void): void;
  public once(eventName: Events.pointerleave, handler: (event: PointerEvent) => void): void;
  public once(eventName: Events.pointermove, handler: (event: PointerEvent) => void): void;
  public once(eventName: Events.pointercancel, handler: (event: PointerEvent) => void): void;
  public once(eventName: Events.pointerwheel, handler: (event: WheelEvent) => void): void;
  public once(eventName: Events.pointerdragstart, handler: (event: PointerDragEvent) => void): void;
  public once(eventName: Events.pointerdragend, handler: (event: PointerDragEvent) => void): void;
  public once(eventName: Events.pointerdragenter, handler: (event: PointerDragEvent) => void): void;
  public once(eventName: Events.pointerdragleave, handler: (event: PointerDragEvent) => void): void;
  public once(eventName: Events.pointerdragmove, handler: (event: PointerDragEvent) => void): void;
  public once(eventName: Events.enterviewport, handler: (event: EnterViewPortEvent) => void): void;
  public once(eventName: Events.exitviewport, handler: (event: ExitViewPortEvent) => void): void;
  public once(eventName: string, handler: (event: GameEvent<Actor>) => void): void;
  public once(eventName: string, handler: (event: any) => void): void {
    this._checkForPointerOptIn(eventName);
    super.once(eventName, handler);
  }

  public off(eventName: Events.exittrigger, handler?: (event: ExitTriggerEvent) => void): void;
  public off(eventName: Events.entertrigger, handler?: (event: EnterTriggerEvent) => void): void;
  /**
   * The **collisionstart** event is fired when a [[Body|physics body]], usually attached to an actor,
   *  first starts colliding with another [[Body|body]], and will not fire again while in contact until
   *  the the pair separates and collides again.
   * Use cases for the **collisionstart** event may be detecting when an actor has touch a surface
   * (like landing) or if a item has been touched and needs to be picked up.
   */
  public off(eventName: Events.collisionstart, handler?: (event: CollisionStartEvent) => void): void;
  /**
   * The **collisionend** event is fired when two [[Body|physics bodies]] are no longer in contact.
   * This event will not fire again until another collision and separation.
   *
   * Use cases for the **collisionend** event might be to detect when an actor has left a surface
   * (like jumping) or has left an area.
   */
  public off(eventName: Events.collisionend, handler?: (event: CollisionEndEvent) => void): void;
  /**
   * The **precollision** event is fired **every frame** where a collision pair is found and two
   * bodies are intersecting.
   *
   * This event is useful for building in custom collision resolution logic in Passive-Passive or
   * Active-Passive scenarios. For example in a breakout game you may want to tweak the angle of
   * ricochet of the ball depending on which side of the paddle you hit.
   */
  public off(eventName: Events.precollision, handler?: (event: PreCollisionEvent) => void): void;
  /**
   * The **postcollision** event is fired for **every frame** where collision resolution was performed.
   * Collision resolution is when two bodies influence each other and cause a response like bouncing
   * off one another. It is only possible to have *postcollision* event in Active-Active and Active-Fixed
   * type collision pairs.
   *
   * Post collision would be useful if you need to know that collision resolution is happening or need to
   * tweak the default resolution.
   */
  public off(eventName: Events.postcollision, handler: (event: PostCollisionEvent) => void): void;
  public off(eventName: Events.pointerup, handler?: (event: PointerEvent) => void): void;
  public off(eventName: Events.pointerdown, handler?: (event: PointerEvent) => void): void;
  public off(eventName: Events.pointerenter, handler?: (event: PointerEvent) => void): void;
  public off(eventName: Events.pointerleave, handler?: (event: PointerEvent) => void): void;
  public off(eventName: Events.pointermove, handler?: (event: PointerEvent) => void): void;
  public off(eventName: Events.pointercancel, handler?: (event: PointerEvent) => void): void;
  public off(eventName: Events.pointerwheel, handler?: (event: WheelEvent) => void): void;
  public off(eventName: Events.pointerdragstart, handler?: (event: PointerDragEvent) => void): void;
  public off(eventName: Events.pointerdragend, handler?: (event: PointerDragEvent) => void): void;
  public off(eventName: Events.pointerdragenter, handler?: (event: PointerDragEvent) => void): void;
  public off(eventName: Events.pointerdragleave, handler?: (event: PointerDragEvent) => void): void;
  public off(eventName: Events.pointerdragmove, handler?: (event: PointerDragEvent) => void): void;
  public off(eventName: Events.prekill, handler?: (event: PreKillEvent) => void): void;
  public off(eventName: Events.postkill, handler?: (event: PostKillEvent) => void): void;
  public off(eventName: Events.initialize, handler?: (event: Events.InitializeEvent<Actor>) => void): void;
  public off(eventName: Events.postupdate, handler?: (event: Events.PostUpdateEvent<Actor>) => void): void;
  public off(eventName: Events.preupdate, handler?: (event: Events.PreUpdateEvent<Actor>) => void): void;
  public off(eventName: Events.postdraw, handler?: (event: Events.PostDrawEvent) => void): void;
  public off(eventName: Events.predraw, handler?: (event: Events.PreDrawEvent) => void): void;
  public off(eventName: Events.enterviewport, handler?: (event: EnterViewPortEvent) => void): void;
  public off(eventName: Events.exitviewport, handler?: (event: ExitViewPortEvent) => void): void;
  public off(eventName: string, handler?: (event: GameEvent<Actor>) => void): void;
  public off(eventName: string, handler?: (event: any) => void): void {
    super.off(eventName, handler);
  }

  // #endregion

  /**
   * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
   *
   * Internal _prekill handler for [[onPreKill]] lifecycle event
   * @internal
   */
  public _prekill(_scene: Scene) {
    super.emit('prekill', new PreKillEvent(this));
    this.onPreKill(_scene);
  }

  /**
   * Safe to override onPreKill lifecycle event handler. Synonymous with `.on('prekill', (evt) =>{...})`
   *
   * `onPreKill` is called directly before an actor is killed and removed from its current [[Scene]].
   */
  public onPreKill(_scene: Scene) {
    // Override me
  }

  /**
   * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
   *
   * Internal _prekill handler for [[onPostKill]] lifecycle event
   * @internal
   */
  public _postkill(_scene: Scene) {
    super.emit('postkill', new PostKillEvent(this));
    this.onPostKill(_scene);
  }

  /**
   * Safe to override onPostKill lifecycle event handler. Synonymous with `.on('postkill', (evt) => {...})`
   *
   * `onPostKill` is called directly after an actor is killed and remove from its current [[Scene]].
   */
  public onPostKill(_scene: Scene) {
    // Override me
  }

  /**
   * If the current actor is a member of the scene, this will remove
   * it from the scene graph. It will no longer be drawn or updated.
   */
  public kill() {
    if (this.scene) {
      this._prekill(this.scene);
      this.emit('kill', new KillEvent(this));
      this._isKilled = true;
      this.scene.remove(this);
      this._postkill(this.scene);
    } else {
      this.logger.warn('Cannot kill actor, it was never added to the Scene');
    }
  }

  /**
   * If the current actor is killed, it will now not be killed.
   */
  public unkill() {
    this._isKilled = false;
  }

  /**
   * Indicates wether the actor has been killed.
   */
  public isKilled(): boolean {
    return this._isKilled;
  }

  /**
   * Adds a child actor to this actor. All movement of the child actor will be
   * relative to the parent actor. Meaning if the parent moves the child will
   * move with it.
   * @param actor The child actor to add
   */
  public add(actor: Actor) {
    actor.body.collider.type = CollisionType.PreventCollision;
    if (Util.addItemToArray(actor, this.children)) {
      actor.parent = this;
    }
  }
  /**
   * Removes a child actor from this actor.
   * @param actor The child actor to remove
   */
  public remove(actor: Actor) {
    if (Util.removeItemFromArray(actor, this.children)) {
      actor.parent = null;
    }
  }
  /**
   * Sets the current drawing of the actor to the drawing corresponding to
   * the key.
   * @param key The key of the drawing
   */
  public setDrawing(key: string): void;
  /**
   * Sets the current drawing of the actor to the drawing corresponding to
   * an `enum` key (e.g. `Animations.Left`)
   * @param key The `enum` key of the drawing
   */
  public setDrawing(key: number): void;
  public setDrawing(key: any): void {
    key = key.toString();
    if (this.currentDrawing !== this.frames[<string>key]) {
      if (this.frames[key] != null) {
        this.frames[key].reset();
        this.currentDrawing = this.frames[key];
      } else {
        Logger.getInstance().error(`the specified drawing key ${key} does not exist`);
      }
    }
    if (this.currentDrawing && this.currentDrawing instanceof Animation) {
      this.currentDrawing.tick(0);
    }
  }

  /**
   * Adds a whole texture as the "default" drawing. Set a drawing using [[setDrawing]].
   */
  public addDrawing(texture: Texture): void;
  /**
   * Adds a whole sprite as the "default" drawing. Set a drawing using [[setDrawing]].
   */
  public addDrawing(sprite: Sprite): void;
  /**
   * Adds a drawing to the list of available drawings for an actor. Set a drawing using [[setDrawing]].
   * @param key     The key to associate with a drawing for this actor
   * @param drawing This can be an [[Animation]], [[Sprite]], or [[Polygon]].
   */
  public addDrawing(key: any, drawing: Drawable): void;
  public addDrawing(): void {
    if (arguments.length === 2) {
      this.frames[<string>arguments[0]] = arguments[1];
      if (!this.currentDrawing) {
        this.currentDrawing = arguments[1];
      }
    } else {
      if (arguments[0] instanceof Sprite) {
        this.addDrawing('default', arguments[0]);
      }
      if (arguments[0] instanceof Texture) {
        this.addDrawing('default', arguments[0].asSprite());
      }
    }
  }

  public get z(): number {
    return this.getZIndex();
  }

  public set z(newZ: number) {
    this.setZIndex(newZ);
  }

  /**
   * Gets the z-index of an actor. The z-index determines the relative order an actor is drawn in.
   * Actors with a higher z-index are drawn on top of actors with a lower z-index
   */
  public getZIndex(): number {
    return this._zIndex;
  }

  /**
   * Sets the z-index of an actor and updates it in the drawing list for the scene.
   * The z-index determines the relative order an actor is drawn in.
   * Actors with a higher z-index are drawn on top of actors with a lower z-index
   * @param newIndex new z-index to assign
   */
  public setZIndex(newIndex: number) {
    const newZ = newIndex;
    this.scene?.cleanupDrawTree(this);
    this._zIndex = newZ;
    this.scene?.updateDrawTree(this);
  }

  /**
   * Get the center point of an actor
   */
  public get center(): Vector {
    return new Vector(this.pos.x + this.width / 2 - this.anchor.x * this.width, this.pos.y + this.height / 2 - this.anchor.y * this.height);
  }

  public get width() {
    return this._width * this.getGlobalScale().x;
  }

  public set width(width: number) {
    this._width = width / this.scale.x;
    this.body.collider.shape = Shape.Box(this._width, this._height, this.anchor);
    this.body.markCollisionShapeDirty();
  }

  public get height() {
    return this._height * this.getGlobalScale().y;
  }

  public set height(height: number) {
    this._height = height / this.scale.y;
    this.body.collider.shape = Shape.Box(this._width, this._height, this.anchor);
    this.body.markCollisionShapeDirty();
  }

  /**
   * Gets this actor's rotation taking into account any parent relationships
   *
   * @returns Rotation angle in radians
   */
  public getWorldRotation(): number {
    if (!this.parent) {
      return this.rotation;
    }

    return this.rotation + this.parent.getWorldRotation();
  }

  /**
   * Gets an actor's world position taking into account parent relationships, scaling, rotation, and translation
   *
   * @returns Position in world coordinates
   */
  public getWorldPos(): Vector {
    if (!this.parent) {
      return this.pos.clone();
    }

    // collect parents
    const parents: Actor[] = [];
    let root: Actor = this;

    parents.push(this);

    // find parents
    while (root.parent) {
      root = root.parent;
      parents.push(root);
    }

    // calculate position
    const x = parents.reduceRight((px, p) => {
      if (p.parent) {
        return px + p.pos.x * p.getGlobalScale().x;
      }
      return px + p.pos.x;
    }, 0);

    const y = parents.reduceRight((py, p) => {
      if (p.parent) {
        return py + p.pos.y * p.getGlobalScale().y;
      }
      return py + p.pos.y;
    }, 0);

    // rotate around root anchor
    const ra = root.getWorldPos(); // 10, 10
    const r = this.getWorldRotation();

    return new Vector(x, y).rotate(r, ra);
  }

  /**
   * Gets the global scale of the Actor
   */
  public getGlobalScale(): Vector {
    if (!this.parent) {
      return new Vector(this.scale.x, this.scale.y);
    }

    const parentScale = this.parent.getGlobalScale();
    return new Vector(this.scale.x * parentScale.x, this.scale.y * parentScale.y);
  }

  // #region Collision

  /**
   * Tests whether the x/y specified are contained in the actor
   * @param x  X coordinate to test (in world coordinates)
   * @param y  Y coordinate to test (in world coordinates)
   * @param recurse checks whether the x/y are contained in any child actors (if they exist).
   */
  public contains(x: number, y: number, recurse: boolean = false): boolean {
    // These shenanigans are to handle child actor containment,
    // the only time getWorldPos and pos are different is a child actor
    const childShift = this.getWorldPos().sub(this.pos);
    const containment = this.body.collider.bounds.translate(childShift).contains(new Vector(x, y));

    if (recurse) {
      return (
        containment ||
        this.children.some((child: Actor) => {
          return child.contains(x, y, true);
        })
      );
    }

    return containment;
  }

  /**
   * Returns true if the two actor.body.collider.shape's surfaces are less than or equal to the distance specified from each other
   * @param actor     Actor to test
   * @param distance  Distance in pixels to test
   */
  public within(actor: Actor, distance: number): boolean {
    return this.body.collider.shape.getClosestLineBetween(actor.body.collider.shape).getLength() <= distance;
  }

  // #endregion

  // #region Update

  /**
   * Called by the Engine, updates the state of the actor
   * @param engine The reference to the current game engine
   * @param delta  The time elapsed since the last update in milliseconds
   */
  public update(engine: Engine, delta: number) {
    this._initialize(engine);
    this._preupdate(engine, delta);

    // Tick animations
    const drawing = this.currentDrawing;
    if (drawing && drawing instanceof Animation) {
      drawing.tick(delta, engine.stats.currFrame.id);
    }

    // Update action queue
    this.actionQueue.update(delta);

    // Update color only opacity
    if (this.color) {
      this.color.a = this.opacity;
    }

    if (this.opacity === 0) {
      this.visible = false;
    }

    // capture old transform
    this.body.captureOldTransform();

    // Run Euler integration
    this.body.integrate(delta);

    // Update actor pipeline (movement, collision detection, event propagation, offscreen culling)
    for (const trait of this.traits) {
      trait.update(this, engine, delta);
    }

    // Update child actors
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].update(engine, delta);
    }

    this._postupdate(engine, delta);
  }

  /**
   * Safe to override onPreUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
   *
   * `onPreUpdate` is called directly before an actor is updated.
   */
  public onPreUpdate(_engine: Engine, _delta: number): void {
    // Override me
  }

  /**
   * Safe to override onPostUpdate lifecycle event handler. Synonymous with `.on('postupdate', (evt) =>{...})`
   *
   * `onPostUpdate` is called directly after an actor is updated.
   */
  public onPostUpdate(_engine: Engine, _delta: number): void {
    // Override me
  }

  /**
   * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
   *
   * Internal _preupdate handler for [[onPreUpdate]] lifecycle event
   * @internal
   */
  public _preupdate(engine: Engine, delta: number): void {
    this.emit('preupdate', new PreUpdateEvent(engine, delta, this));
    this.onPreUpdate(engine, delta);
  }

  /**
   * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
   *
   * Internal _preupdate handler for [[onPostUpdate]] lifecycle event
   * @internal
   */
  public _postupdate(engine: Engine, delta: number): void {
    this.emit('postupdate', new PreUpdateEvent(engine, delta, this));
    this.onPostUpdate(engine, delta);
  }

  // endregion

  // #region Drawing
  /**
   * Called by the Engine, draws the actor to the screen
   * @param ctx   The rendering context
   * @param delta The time since the last draw in milliseconds
   */
  public draw(ctx: CanvasRenderingContext2D, delta: number) {
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.scale.x, this.scale.y);

    // translate canvas by anchor offset
    ctx.save();
    ctx.translate(-(this._width * this.anchor.x), -(this._height * this.anchor.y));

    this._predraw(ctx, delta);

    if (this.currentDrawing) {
      const drawing = this.currentDrawing;
      // See https://github.com/excaliburjs/Excalibur/pull/619 for discussion on this formula
      const offsetX = (this._width - drawing.width * drawing.scale.x) * this.anchor.x;
      const offsetY = (this._height - drawing.height * drawing.scale.y) * this.anchor.y;

      this.currentDrawing.draw({ ctx, x: offsetX, y: offsetY, opacity: this.opacity });
    } else {
      if (this.color && this.body && this.body.collider && this.body.collider.shape) {
        this.body.collider.shape.draw(ctx, this.color, new Vector(0, 0));
      }
    }
    ctx.restore();

    // Draw child actors
    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i].visible) {
        this.children[i].draw(ctx, delta);
      }
    }

    this._postdraw(ctx, delta);
    ctx.restore();
  }

  /**
   * Safe to override onPreDraw lifecycle event handler. Synonymous with `.on('predraw', (evt) =>{...})`
   *
   * `onPreDraw` is called directly before an actor is drawn, but after local transforms are made.
   */
  public onPreDraw(_ctx: CanvasRenderingContext2D, _delta: number): void {
    // Override me
  }

  /**
   * Safe to override onPostDraw lifecycle event handler. Synonymous with `.on('postdraw', (evt) =>{...})`
   *
   * `onPostDraw` is called directly after an actor is drawn, and before local transforms are removed.
   */
  public onPostDraw(_ctx: CanvasRenderingContext2D, _delta: number): void {
    // Override me
  }

  /**
   * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
   *
   * Internal _predraw handler for [[onPreDraw]] lifecycle event
   * @internal
   */
  public _predraw(ctx: CanvasRenderingContext2D, delta: number): void {
    this.emit('predraw', new PreDrawEvent(ctx, delta, this));
    this.onPreDraw(ctx, delta);
  }

  /**
   * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
   *
   * Internal _postdraw handler for [[onPostDraw]] lifecycle event
   * @internal
   */
  public _postdraw(ctx: CanvasRenderingContext2D, delta: number): void {
    this.emit('postdraw', new PreDrawEvent(ctx, delta, this));
    this.onPostDraw(ctx, delta);
  }

  /**
   * Called by the Engine, draws the actors debugging to the screen
   * @param ctx The rendering context
   */
  /* istanbul ignore next */
  public debugDraw(ctx: CanvasRenderingContext2D) {
    this.emit('predebugdraw', new PreDebugDrawEvent(ctx, this));

    this.body.collider.debugDraw(ctx);

    // Draw actor bounding box
    const bb = this.body.collider.localBounds.translate(this.getWorldPos());
    bb.debugDraw(ctx);

    // Draw actor Id
    ctx.fillText('id: ' + this.id, bb.left + 3, bb.top + 10);

    // Draw actor anchor Vector
    ctx.fillStyle = Color.Yellow.toString();
    ctx.beginPath();
    ctx.arc(this.getWorldPos().x, this.getWorldPos().y, 3, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();

    // Culling Box debug draw
    for (let j = 0; j < this.traits.length; j++) {
      if (this.traits[j] instanceof Traits.OffscreenCulling) {
        (<Traits.OffscreenCulling>this.traits[j]).cullingBox.debugDraw(ctx); // eslint-disable-line
      }
    }

    // Unit Circle debug draw
    ctx.strokeStyle = Color.Yellow.toString();
    ctx.beginPath();
    const radius = Math.min(this.width, this.height);
    ctx.arc(this.getWorldPos().x, this.getWorldPos().y, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.stroke();
    const ticks: { [key: string]: number } = {
      '0 Pi': 0,
      'Pi/2': Math.PI / 2,
      Pi: Math.PI,
      '3/2 Pi': (3 * Math.PI) / 2
    };

    const oldFont = ctx.font;
    for (const tick in ticks) {
      ctx.fillStyle = Color.Yellow.toString();
      ctx.font = '14px';
      ctx.textAlign = 'center';
      ctx.fillText(
        tick,
        this.getWorldPos().x + Math.cos(ticks[tick]) * (radius + 10),
        this.getWorldPos().y + Math.sin(ticks[tick]) * (radius + 10)
      );
    }

    ctx.font = oldFont;

    // Draw child actors
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].debugDraw(ctx);
    }

    this.emit('postdebugdraw', new PostDebugDrawEvent(ctx, this));
  }

  /**
   * Returns the full array of ancestors
   */
  public getAncestors(): Actor[] {
    const path: Actor[] = [this];
    let currentActor: Actor = this;
    let parent: Actor;

    while ((parent = currentActor.parent)) {
      currentActor = parent;
      path.push(currentActor);
    }

    return path.reverse();
  }
  // #endregion
}

/**
 * The most important primitive in Excalibur is an `Actor`. Anything that
 * can move on the screen, collide with another `Actor`, respond to events,
 * or interact with the current scene, must be an actor. An `Actor` **must**
 * be part of a [[Scene]] for it to be drawn to the screen.
 */
export class Actor extends Configurable(ActorImpl) {
  constructor();
  constructor(config?: ActorArgs);
  constructor(x?: number, y?: number, width?: number, height?: number, color?: Color);
  constructor(xOrConfig?: number | ActorArgs, y?: number, width?: number, height?: number, color?: Color) {
    super(xOrConfig, y, width, height, color);
  }
}
