import {
  KillEvent,
  PreUpdateEvent,
  PostUpdateEvent,
  PostCollisionEvent,
  PreCollisionEvent,
  CollisionStartEvent,
  CollisionEndEvent,
  PostKillEvent,
  PreKillEvent,
  EnterViewPortEvent,
  ExitViewPortEvent,
  PreDrawEvent,
  PostDrawEvent,
  PreDebugDrawEvent,
  PostDebugDrawEvent,
  ActionStartEvent,
  ActionCompleteEvent
} from './Events';
import { Engine } from './Engine';
import { Color } from './Color';
import { CanInitialize, CanUpdate, CanBeKilled } from './Interfaces/LifecycleEvents';
import { Scene } from './Scene';
import { Logger } from './Util/Log';
import { Vector, vec } from './Math/vector';
import { BodyComponent } from './Collision/BodyComponent';
import { Eventable } from './Interfaces/Evented';
import { PointerEvents } from './Interfaces/PointerEventHandlers';
import { CollisionType } from './Collision/CollisionType';

import { Entity, EntityEvents } from './EntityComponentSystem/Entity';
import { TransformComponent } from './EntityComponentSystem/Components/TransformComponent';
import { MotionComponent } from './EntityComponentSystem/Components/MotionComponent';
import { GraphicsComponent } from './Graphics/GraphicsComponent';
import { Rectangle } from './Graphics/Rectangle';
import { ColliderComponent } from './Collision/ColliderComponent';
import { Shape } from './Collision/Colliders/Shape';
import { watch } from './Util/Watch';
import { Collider, CollisionContact, CollisionGroup, Side } from './Collision/Index';
import { Circle } from './Graphics/Circle';
import { PointerEvent } from './Input/PointerEvent';
import { WheelEvent } from './Input/WheelEvent';
import { PointerComponent } from './Input/PointerComponent';
import { ActionsComponent } from './Actions/ActionsComponent';
import { Raster } from './Graphics/Raster';
import { Text } from './Graphics/Text';
import { CoordPlane } from './Math/coord-plane';
import { EventEmitter, EventKey, Handler, Subscription } from './EventEmitter';
import { Component } from './EntityComponentSystem';

/**
 * Type guard for checking if something is an Actor
 * @param x
 */
export function isActor(x: any): x is Actor {
  return x instanceof Actor;
}

/**
 * Actor constructor options
 */
export interface ActorArgs {
  /**
   * Optionally set the name of the actor, default is 'anonymous'
   */
  name?: string;
  /**
   * Optionally set the x position of the actor, default is 0
   */
  x?: number;
  /**
   * Optionally set the y position of the actor, default is 0
   */
  y?: number;
  /**
   * Optionally set the (x, y) position of the actor as a vector, default is (0, 0)
   */
  pos?: Vector;
  /**
   * Optionally set the coordinate plane of the actor, default is [[CoordPlane.World]] meaning actor is subject to camera positioning
   */
  coordPlane?: CoordPlane;
  /**
   * Optionally set the width of a box collider for the actor
   */
  width?: number;
  /**
   * Optionally set the height of a box collider for the actor
   */
  height?: number;
  /**
   * Optionally set the radius of the circle collider for the actor
   */
  radius?: number;
  /**
   * Optionally set the velocity of the actor in pixels/sec
   */
  vel?: Vector;
  /**
   * Optionally set the acceleration of the actor in pixels/sec^2
   */
  acc?: Vector;
  /**
   * Optionally se the rotation in radians (180 degrees = Math.PI radians)
   */
  rotation?: number;
  /**
   * Optionally set the angular velocity of the actor in radians/sec (180 degrees = Math.PI radians)
   */
  angularVelocity?: number;
  /**
   * Optionally set the scale of the actor's transform
   */
  scale?: Vector;
  /**
   * Optionally set the z index of the actor, default is 0
   */
  z?: number;
  /**
   * Optionally set the color of an actor, only used if no graphics are present
   * If a width/height or a radius was set a default graphic will be added
   */
  color?: Color;
  /**
   * Optionally set the color of an actor, only used if no graphics are present
   * If a width/height or a radius was set a default graphic will be added
   */
  opacity?: number;
  /**
   * Optionally set the visibility of the actor
   */
  visible?: boolean;
  /**
   * Optionally set the anchor for graphics in the actor
   */
  anchor?: Vector;
  /**
   * Optionally set the anchor for graphics in the actor
   */
  offset?: Vector;
  /**
   * Optionally set the collision type
   */
  collisionType?: CollisionType;
  /**
   * Optionally supply a collider for an actor, if supplied ignores any supplied width/height
   */
  collider?: Collider;
  /**
   * Optionally supply a [[CollisionGroup]]
   */
  collisionGroup?: CollisionGroup;
}

export type ActorEvents = EntityEvents & {
  collisionstart: CollisionStartEvent;
  collisionend: CollisionEndEvent;
  precollision: PreCollisionEvent;
  postcollision: PostCollisionEvent;
  kill: KillEvent;
  prekill: PreKillEvent;
  postkill: PostKillEvent;
  predraw: PreDrawEvent;
  postdraw: PostDrawEvent;
  pretransformdraw: PreDrawEvent;
  posttransformdraw: PostDrawEvent;
  predebugdraw: PreDebugDrawEvent;
  postdebugdraw: PostDebugDrawEvent;
  pointerup: PointerEvent;
  pointerdown: PointerEvent;
  pointerenter: PointerEvent;
  pointerleave: PointerEvent;
  pointermove: PointerEvent;
  pointercancel: PointerEvent;
  pointerwheel: WheelEvent;
  pointerdragstart: PointerEvent;
  pointerdragend: PointerEvent;
  pointerdragenter: PointerEvent;
  pointerdragleave: PointerEvent;
  pointerdragmove: PointerEvent;
  enterviewport: EnterViewPortEvent;
  exitviewport: ExitViewPortEvent;
  actionstart: ActionStartEvent;
  actioncomplete: ActionCompleteEvent;
}

export const ActorEvents = {
  CollisionStart: 'collisionstart',
  CollisionEnd: 'collisionend',
  PreCollision: 'precollision',
  PostCollision: 'postcollision',
  Kill: 'kill',
  PreKill: 'prekill',
  PostKill: 'postkill',
  PreDraw: 'predraw',
  PostDraw: 'postdraw',
  PreTransformDraw: 'pretransformdraw',
  PostTransformDraw: 'posttransformdraw',
  PreDebugDraw: 'predebugdraw',
  PostDebugDraw: 'postdebugdraw',
  PointerUp: 'pointerup',
  PointerDown: 'pointerdown',
  PointerEnter: 'pointerenter',
  PointerLeave: 'pointerleave',
  PointerMove: 'pointermove',
  PointerCancel: 'pointercancel',
  Wheel: 'pointerwheel',
  PointerDrag: 'pointerdragstart',
  PointerDragEnd: 'pointerdragend',
  PointerDragEnter: 'pointerdragenter',
  PointerDragLeave: 'pointerdragleave',
  PointerDragMove: 'pointerdragmove',
  EnterViewPort: 'enterviewport',
  ExitViewPort: 'exitviewport',
  ActionStart: 'actionstart',
  ActionComplete: 'actioncomplete'
};

/**
 * The most important primitive in Excalibur is an `Actor`. Anything that
 * can move on the screen, collide with another `Actor`, respond to events,
 * or interact with the current scene, must be an actor. An `Actor` **must**
 * be part of a [[Scene]] for it to be drawn to the screen.
 */
export class Actor extends Entity implements Eventable, PointerEvents, CanInitialize, CanUpdate, CanBeKilled {
  public events = new EventEmitter<ActorEvents>();
  // #region Properties

  /**
   * Set defaults for all Actors
   */
  public static defaults = {
    anchor: Vector.Half
  };

  /**
   * The physics body the is associated with this actor. The body is the container for all physical properties, like position, velocity,
   * acceleration, mass, inertia, etc.
   */
  public body: BodyComponent;

  /**
   * Access the Actor's built in [[TransformComponent]]
   */
  public transform: TransformComponent;

  /**
   * Access the Actor's built in [[MotionComponent]]
   */
  public motion: MotionComponent;

  /**
   * Access to the Actor's built in [[GraphicsComponent]]
   */
  public graphics: GraphicsComponent;

  /**
   * Access to the Actor's built in [[ColliderComponent]]
   */
  public collider: ColliderComponent;

  /**
   * Access to the Actor's built in [[PointerComponent]] config
   */
  public pointer: PointerComponent;

  /**
   * Useful for quickly scripting actor behavior, like moving to a place, patrolling back and forth, blinking, etc.
   *
   *  Access to the Actor's built in [[ActionsComponent]] which forwards to the
   * [[ActionContext|Action context]] of the actor.
   */
  public actions: ActionsComponent;

  /**
   * Gets the position vector of the actor in pixels
   */
  public get pos(): Vector {
    return this.transform.pos;
  }

  /**
   * Sets the position vector of the actor in pixels
   */
  public set pos(thePos: Vector) {
    this.transform.pos = thePos.clone();
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
    return this.motion.vel;
  }

  /**
   * Sets the velocity vector of the actor in pixels/sec
   */
  public set vel(theVel: Vector) {
    this.motion.vel = theVel.clone();
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
    return this.motion.acc;
  }

  /**
   * Sets the acceleration vector of teh actor in pixels/second/second
   */
  public set acc(theAcc: Vector) {
    this.motion.acc = theAcc.clone();
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
    return this.transform.rotation;
  }

  /**
   * Sets the rotation of the actor in radians. 1 radian = 180/PI Degrees.
   */
  public set rotation(theAngle: number) {
    this.transform.rotation = theAngle;
  }

  /**
   * Gets the rotational velocity of the actor in radians/second
   */
  public get angularVelocity(): number {
    return this.motion.angularVelocity;
  }

  /**
   * Sets the rotational velocity of the actor in radians/sec
   */
  public set angularVelocity(angularVelocity: number) {
    this.motion.angularVelocity = angularVelocity;
  }

  public get scale(): Vector {
    return this.get(TransformComponent).scale;
  }

  public set scale(scale: Vector) {
    this.get(TransformComponent).scale = scale;
  }

  private _anchor: Vector = watch(Vector.Half, (v) => this._handleAnchorChange(v));
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
  public get anchor(): Vector {
    return this._anchor;
  }

  public set anchor(vec: Vector) {
    this._anchor = watch(vec, (v) => this._handleAnchorChange(v));
    this._handleAnchorChange(vec);
  }

  private _handleAnchorChange(v: Vector) {
    if (this.graphics) {
      this.graphics.anchor = v;
    }
  }

  private _offset: Vector = watch(Vector.Zero, (v) => this._handleOffsetChange(v));
  /**
   * The offset in pixels to apply to all actor graphics
   *
   * Default offset of (0, 0)
   */
  public get offset(): Vector {
    return this._offset;
  }

  public set offset(vec: Vector) {
    this._offset = watch(vec, (v) => this._handleOffsetChange(v));
    this._handleOffsetChange(vec);
  }

  private _handleOffsetChange(v: Vector) {
    if (this.graphics) {
      this.graphics.offset = v;
    }
  }

  /**
   * Indicates whether the actor is physically in the viewport
   */
  public get isOffScreen(): boolean {
    return this.hasTag('ex.offscreen');
  }

  /**
   * Convenience reference to the global logger
   */
  public logger: Logger = Logger.getInstance();

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
      this.pos = pe.worldPos;
    }
  };

  private _pointerDragLeaveHandler = (pe: PointerEvent) => {
    if (this._dragging) {
      this.pos = pe.worldPos;
    }
  };

  public get draggable(): boolean {
    return this._draggable;
  }

  public set draggable(isDraggable: boolean) {
    if (isDraggable) {
      if (isDraggable && !this._draggable) {
        this.events.on('pointerdragstart', this._pointerDragStartHandler);
        this.events.on('pointerdragend', this._pointerDragEndHandler);
        this.events.on('pointerdragmove', this._pointerDragMoveHandler);
        this.events.on('pointerdragleave', this._pointerDragLeaveHandler);
      } else if (!isDraggable && this._draggable) {
        this.events.off('pointerdragstart', this._pointerDragStartHandler);
        this.events.off('pointerdragend', this._pointerDragEndHandler);
        this.events.off('pointerdragmove', this._pointerDragMoveHandler);
        this.events.off('pointerdragleave', this._pointerDragLeaveHandler);
      }

      this._draggable = isDraggable;
    }
  }

  /**
   * Sets the color of the actor's current graphic
   */
  public get color(): Color {
    return this._color;
  }
  public set color(v: Color) {
    this._color = v.clone();
    const currentGraphic = this.graphics.current;
    if (currentGraphic instanceof Raster || currentGraphic instanceof Text) {
      currentGraphic.color = this._color;
    }
  }
  private _color: Color;

  // #endregion

  /**
   *
   * @param config
   */
  constructor(config?: ActorArgs) {
    super();

    const {
      name,
      x,
      y,
      pos,
      coordPlane,
      scale,
      width,
      height,
      radius,
      collider,
      vel,
      acc,
      rotation,
      angularVelocity,
      z,
      color,
      visible,
      opacity,
      anchor,
      offset,
      collisionType,
      collisionGroup
    } = {
      ...config
    };

    this.name = name ?? this.name;
    this.anchor = anchor ?? Actor.defaults.anchor.clone();
    this.offset = offset ?? Vector.Zero;
    this.transform = new TransformComponent();
    this.addComponent(this.transform);
    this.pos = pos ?? vec(x ?? 0, y ?? 0);
    this.rotation = rotation ?? 0;
    this.scale = scale ?? vec(1, 1);
    this.z = z ?? 0;
    this.transform.coordPlane = coordPlane ?? CoordPlane.World;

    this.pointer = new PointerComponent;
    this.addComponent(this.pointer);

    this.graphics = new GraphicsComponent({
      anchor: this.anchor,
      offset: this.offset,
      opacity: opacity
    });
    this.addComponent(this.graphics);

    this.motion = new MotionComponent;
    this.addComponent(this.motion);
    this.vel = vel ?? Vector.Zero;
    this.acc = acc ?? Vector.Zero;
    this.angularVelocity = angularVelocity ?? 0;

    this.actions = new ActionsComponent;
    this.addComponent(this.actions);

    this.body = new BodyComponent;
    this.addComponent(this.body);
    this.body.collisionType = collisionType ?? CollisionType.Passive;
    if (collisionGroup) {
      this.body.group = collisionGroup;
    }

    if (collider) {
      this.collider = new ColliderComponent(collider);
      this.addComponent(this.collider);
    } else if (radius) {
      this.collider = new ColliderComponent(Shape.Circle(radius));
      this.addComponent(this.collider);
    } else {
      if (width > 0 && height > 0) {
        this.collider = new ColliderComponent(Shape.Box(width, height, this.anchor));
        this.addComponent(this.collider);
      } else {
        this.collider = new ColliderComponent();
        this.addComponent(this.collider); // no collider
      }
    }

    this.graphics.visible = visible ?? true;

    if (color) {
      this.color = color;
      if (width && height) {
        this.graphics.add(
          new Rectangle({
            color: color,
            width,
            height
          })
        );
      } else if (radius) {
        this.graphics.add(
          new Circle({
            color: color,
            radius
          })
        );
      }
    }
  }

  public clone(): Actor {
    const clone = new Actor({
      color: this.color.clone(),
      anchor: this.anchor.clone(),
      offset: this.offset.clone()
    });
    clone.clearComponents();
    clone.processComponentRemoval();

    // Clone builtins, order is important, same as ctor
    clone.addComponent(clone.transform = this.transform.clone() as TransformComponent, true);
    clone.addComponent(clone.pointer = this.pointer.clone() as PointerComponent, true);
    clone.addComponent(clone.graphics = this.graphics.clone() as GraphicsComponent, true);
    clone.addComponent(clone.motion = this.motion.clone() as MotionComponent, true);
    clone.addComponent(clone.actions = this.actions.clone() as ActionsComponent, true);
    clone.addComponent(clone.body = this.body.clone() as BodyComponent, true);
    clone.addComponent(clone.collider = this.collider.clone() as ColliderComponent, true);

    const builtInComponents: Component[] = [
      this.transform,
      this.pointer,
      this.graphics,
      this.motion,
      this.actions,
      this.body,
      this.collider
    ];

    // Clone non-builtin the current actors components
    const components = this.getComponents();
    for (const c of components) {
      if (!builtInComponents.includes(c)) {
        clone.addComponent(c.clone(), true);
      }
    }
    return clone;
  }

  /**
   * `onInitialize` is called before the first update of the actor. This method is meant to be
   * overridden. This is where initialization of child actors should take place.
   *
   * Synonymous with the event handler `.on('initialize', (evt) => {...})`
   */
  public onInitialize(engine: Engine): void {
    // Override me
  }

  /**
   * Initializes this actor and all it's child actors, meant to be called by the Scene before first update not by users of Excalibur.
   *
   * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
   * @internal
   */
  public _initialize(engine: Engine) {
    super._initialize(engine);
    for (const child of this.children) {
      child._initialize(engine);
    }
  }

  // #region Events
  public emit<TEventName extends EventKey<ActorEvents>>(eventName: TEventName, event: ActorEvents[TEventName]): void;
  public emit(eventName: string, event?: any): void;
  public emit<TEventName extends EventKey<ActorEvents> | string>(eventName: TEventName, event?: any): void {
    this.events.emit(eventName, event);
  }

  public on<TEventName extends EventKey<ActorEvents>>(eventName: TEventName, handler: Handler<ActorEvents[TEventName]>): Subscription;
  public on(eventName: string, handler: Handler<unknown>): Subscription;
  public on<TEventName extends EventKey<ActorEvents> | string>(eventName: TEventName, handler: Handler<any>): Subscription {
    return this.events.on(eventName, handler);
  }

  public once<TEventName extends EventKey<ActorEvents>>(eventName: TEventName, handler: Handler<ActorEvents[TEventName]>): Subscription;
  public once(eventName: string, handler: Handler<unknown>): Subscription;
  public once<TEventName extends EventKey<ActorEvents> | string>(eventName: TEventName, handler: Handler<any>): Subscription {
    return this.events.once(eventName, handler);
  }

  public off<TEventName extends EventKey<ActorEvents>>(eventName: TEventName, handler: Handler<ActorEvents[TEventName]>): void;
  public off(eventName: string, handler: Handler<unknown>): void;
  public off(eventName: string): void;
  public off<TEventName extends EventKey<ActorEvents> | string>(eventName: TEventName, handler?: Handler<any>): void {
    this.events.off(eventName, handler);
  }

  // #endregion

  /**
   * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
   *
   * Internal _prekill handler for [[onPreKill]] lifecycle event
   * @internal
   */
  public _prekill(scene: Scene) {
    this.events.emit('prekill', new PreKillEvent(this));
    this.onPreKill(scene);
  }

  /**
   * Safe to override onPreKill lifecycle event handler. Synonymous with `.on('prekill', (evt) =>{...})`
   *
   * `onPreKill` is called directly before an actor is killed and removed from its current [[Scene]].
   */
  public onPreKill(scene: Scene) {
    // Override me
  }

  /**
   * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
   *
   * Internal _prekill handler for [[onPostKill]] lifecycle event
   * @internal
   */
  public _postkill(scene: Scene) {
    this.events.emit('postkill', new PostKillEvent(this));
    this.onPostKill(scene);
  }

  /**
   * Safe to override onPostKill lifecycle event handler. Synonymous with `.on('postkill', (evt) => {...})`
   *
   * `onPostKill` is called directly after an actor is killed and remove from its current [[Scene]].
   */
  public onPostKill(scene: Scene) {
    // Override me
  }

  /**
   * If the current actor is a member of the scene, this will remove
   * it from the scene graph. It will no longer be drawn or updated.
   */
  public kill() {
    if (this.scene) {
      this._prekill(this.scene);
      this.events.emit('kill', new KillEvent(this));
      super.kill();
      this._postkill(this.scene);
    } else {
      this.logger.warn(`Cannot kill actor named "${this.name}", it was never added to the Scene`);
    }
  }

  /**
   * If the current actor is killed, it will now not be killed.
   */
  public unkill() {
    this.active = true;
  }

  /**
   * Indicates wether the actor has been killed.
   */
  public isKilled(): boolean {
    return !this.active;
  }

  /**
   * Gets the z-index of an actor. The z-index determines the relative order an actor is drawn in.
   * Actors with a higher z-index are drawn on top of actors with a lower z-index
   */
  public get z(): number {
    return this.get(TransformComponent).z;
  }


  /**
   * Sets the z-index of an actor and updates it in the drawing list for the scene.
   * The z-index determines the relative order an actor is drawn in.
   * Actors with a higher z-index are drawn on top of actors with a lower z-index
   * @param newZ new z-index to assign
   */
  public set z(newZ: number) {
    this.get(TransformComponent).z = newZ;
  }

  /**
   * Get the center point of an actor (global position)
   */
  public get center(): Vector {
    const globalPos = this.getGlobalPos();
    return new Vector(
      globalPos.x + this.width / 2 - this.anchor.x * this.width,
      globalPos.y + this.height / 2 - this.anchor.y * this.height);
  }

  /**
   * Get the local center point of an actor
   */
  public get localCenter(): Vector {
    return new Vector(
      this.pos.x + this.width / 2 - this.anchor.x * this.width,
      this.pos.y + this.height / 2 - this.anchor.y * this.height);
  }

  public get width() {
    return this.collider.localBounds.width * this.getGlobalScale().x;
  }

  public get height() {
    return this.collider.localBounds.height * this.getGlobalScale().y;
  }

  /**
   * Gets this actor's rotation taking into account any parent relationships
   * @returns Rotation angle in radians
   */
  public getGlobalRotation(): number {
    return this.get(TransformComponent).globalRotation;
  }

  /**
   * Gets an actor's world position taking into account parent relationships, scaling, rotation, and translation
   * @returns Position in world coordinates
   */
  public getGlobalPos(): Vector {
    return this.get(TransformComponent).globalPos;
  }

  /**
   * Gets the global scale of the Actor
   */
  public getGlobalScale(): Vector {
    return this.get(TransformComponent).globalScale;
  }

  // #region Collision

  /**
   * Tests whether the x/y specified are contained in the actor
   * @param x  X coordinate to test (in world coordinates)
   * @param y  Y coordinate to test (in world coordinates)
   * @param recurse checks whether the x/y are contained in any child actors (if they exist).
   */
  public contains(x: number, y: number, recurse: boolean = false): boolean {
    const point = vec(x, y);
    const collider = this.get(ColliderComponent);
    collider.update();
    const geom = collider.get();
    if (!geom) {
      return false;
    }
    const containment = geom.contains(point);

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
   * Returns true if the two actor.collider's surfaces are less than or equal to the distance specified from each other
   * @param actor     Actor to test
   * @param distance  Distance in pixels to test
   */
  public within(actor: Actor, distance: number): boolean {
    const collider = this.get(ColliderComponent);
    const otherCollider = actor.get(ColliderComponent);
    const me = collider.get();
    const other = otherCollider.get();
    if (me && other) {
      return me.getClosestLineBetween(other).getLength() <= distance;
    }
    return false;
  }

  // #endregion

  // #region Update

  /**
   * Called by the Engine, updates the state of the actor
   * @internal
   * @param engine The reference to the current game engine
   * @param delta  The time elapsed since the last update in milliseconds
   */
  public update(engine: Engine, delta: number) {
    this._initialize(engine);
    this._preupdate(engine, delta);
    this._postupdate(engine, delta);
  }

  /**
   * Safe to override onPreUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
   *
   * `onPreUpdate` is called directly before an actor is updated.
   */
  public onPreUpdate(engine: Engine, delta: number): void {
    // Override me
  }

  /**
   * Safe to override onPostUpdate lifecycle event handler. Synonymous with `.on('postupdate', (evt) =>{...})`
   *
   * `onPostUpdate` is called directly after an actor is updated.
   */
  public onPostUpdate(engine: Engine, delta: number): void {
    // Override me
  }

  /**
   * Fires before every collision resolution for a confirmed contact
   * @param self
   * @param other
   * @param side
   * @param contact
   */
  public onPreCollisionResolve(self: Collider, other: Collider, side: Side, contact: CollisionContact) {
    // Override me
  }

  /**
   * Fires after every resolution for a confirmed contact.
   * @param self
   * @param other
   * @param side
   * @param contact
   */
  public onPostCollisionResolve(self: Collider, other: Collider, side: Side, contact: CollisionContact) {
    // Override me
  }

  /**
   * Fires once when 2 entities with a ColliderComponent first start colliding or touching, if the Colliders stay in contact this
   * does not continue firing until they separate and re-collide.
   * @param self
   * @param other
   * @param side
   * @param contact
   */
  public onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact) {
    // Override me
  }

  /**
   * Fires once when 2 entities with a ColliderComponent separate after having been in contact.
   * @param self
   * @param other
   * @param side
   * @param lastContact
   */
  public onCollisionEnd(self: Collider, other: Collider, side: Side, lastContact: CollisionContact) {
    // Override me
  }

  /**
   * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
   *
   * Internal _preupdate handler for [[onPreUpdate]] lifecycle event
   * @internal
   */
  public _preupdate(engine: Engine, delta: number): void {
    this.events.emit('preupdate', new PreUpdateEvent(engine, delta, this));
    this.onPreUpdate(engine, delta);
  }

  /**
   * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
   *
   * Internal _preupdate handler for [[onPostUpdate]] lifecycle event
   * @internal
   */
  public _postupdate(engine: Engine, delta: number): void {
    this.events.emit('postupdate', new PostUpdateEvent(engine, delta, this));
    this.onPostUpdate(engine, delta);
  }

  // endregion
}
