import {
  InitializeEvent,
  KillEvent,
  PreUpdateEvent,
  PostUpdateEvent,
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
import { Engine } from './Engine';
import { Color } from './Color';
import { CanInitialize, CanUpdate, CanBeKilled } from './Interfaces/LifecycleEvents';
import { Scene } from './Scene';
import { Logger } from './Util/Log';
import { Vector, vec } from './Math/vector';
import { BodyComponent } from './Collision/BodyComponent';
import { Eventable } from './Interfaces/Evented';
import * as Events from './Events';
import { PointerEvents } from './Interfaces/PointerEventHandlers';
import { CollisionType } from './Collision/CollisionType';

import { Entity } from './EntityComponentSystem/Entity';
import { TransformComponent } from './EntityComponentSystem/Components/TransformComponent';
import { MotionComponent } from './EntityComponentSystem/Components/MotionComponent';
import { GraphicsComponent } from './Graphics/GraphicsComponent';
import { Rectangle } from './Graphics/Rectangle';
import { ColliderComponent } from './Collision/ColliderComponent';
import { Shape } from './Collision/Colliders/Shape';
import { watch } from './Util/Watch';
import { Collider, CollisionGroup } from './Collision/Index';
import { Circle } from './Graphics/Circle';
import { PointerEvent } from './Input/PointerEvent';
import { WheelEvent } from './Input/WheelEvent';
import { PointerComponent } from './Input/PointerComponent';
import { ActionsComponent } from './Actions/ActionsComponent';
import { Raster } from './Graphics/Raster';
import { Text } from './Graphics/Text';
import { CoordPlane } from './Math/coord-plane';

/**
 * Type guard for checking if something is an Actor
 * @param x
 */
export function isActor(x: any): x is Actor {
  return x instanceof Actor;
}

/**
 * Actor contructor options
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
   * Optionally set the visibility of the actor
   */
  visible?: boolean;
  /**
   * Optionally set the anchor for graphics in the actor
   */
  anchor?: Vector;
  /**
   * Optionally set the collision type
   */
  collisionType?: CollisionType;
  /**
   * Optionally supply a collider for an actor, if supplied ignores any supplied width/height
   */
  collider?: Collider;
  /**
   * Optionally suppy a [[CollisionGroup]]
   */
  collisionGroup?: CollisionGroup;
}

/**
 * The most important primitive in Excalibur is an `Actor`. Anything that
 * can move on the screen, collide with another `Actor`, respond to events,
 * or interact with the current scene, must be an actor. An `Actor` **must**
 * be part of a [[Scene]] for it to be drawn to the screen.
 */
export class Actor extends Entity implements Eventable, PointerEvents, CanInitialize, CanUpdate, CanBeKilled {
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
  public get body(): BodyComponent {
    return this.get(BodyComponent);
  }

  /**
   * Access the Actor's built in [[TransformComponent]]
   */
  public get transform(): TransformComponent {
    return this.get(TransformComponent);
  }

  /**
   * Access the Actor's built in [[MotionComponent]]
   */
  public get motion(): MotionComponent {
    return this.get(MotionComponent);
  }

  /**
   * Access to the Actor's built in [[GraphicsComponent]]
   */
  public get graphics(): GraphicsComponent {
    return this.get(GraphicsComponent);
  }

  /**
   * Access to the Actor's built in [[ColliderComponent]]
   */
  public get collider(): ColliderComponent {
    return this.get(ColliderComponent);
  }

  /**
   * Access to the Actor's built in [[PointerComponent]] config
   */
  public get pointer(): PointerComponent {
    return this.get(PointerComponent);
  }

  /**
   * Useful for quickly scripting actor behavior, like moving to a place, patrolling back and forth, blinking, etc.
   *
   *  Access to the Actor's built in [[ActionsComponent]] which forwards to the
   * [[ActionContext|Action context]] of the actor.
   */
  public get actions(): ActionsComponent {
    return this.get(ActionsComponent);
  }

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
  private _anchor: Vector = watch(Vector.Half, (v) => this._handleAnchorChange(v));
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
   * The scene that the actor is in
   */
  public scene: Scene = null;

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
   * Sets the color of the actor's current graphic
   */
  public get color(): Color {
    return this._color;
  }
  public set color(v: Color) {
    this._color = v.clone();
    const defaultLayer = this.graphics.layers.default;
    const currentGraphic = defaultLayer.graphics[0]?.graphic;
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
      anchor,
      collisionType,
      collisionGroup
    } = {
      ...config
    };

    this._setName(name);
    this.anchor = anchor ?? Actor.defaults.anchor.clone();
    const tx = new TransformComponent();
    this.addComponent(tx);
    this.pos = pos ?? vec(x ?? 0, y ?? 0);
    this.rotation = rotation ?? 0;
    this.scale = scale ?? vec(1, 1);
    this.z = z ?? 0;
    tx.coordPlane = coordPlane ?? CoordPlane.World;

    this.addComponent(new PointerComponent);

    this.addComponent(new GraphicsComponent({
      anchor: this.anchor
    }));
    this.addComponent(new MotionComponent());
    this.vel = vel ?? Vector.Zero;
    this.acc = acc ?? Vector.Zero;
    this.angularVelocity = angularVelocity ?? 0;

    this.addComponent(new ActionsComponent());

    this.addComponent(new BodyComponent());
    this.body.collisionType = collisionType ?? CollisionType.Passive;
    if (collisionGroup) {
      this.body.group = collisionGroup;
    }

    if (collider) {
      this.addComponent(new ColliderComponent(collider));
    } else if (radius) {
      this.addComponent(new ColliderComponent(Shape.Circle(radius)));
    } else {
      if (width > 0 && height > 0) {
        this.addComponent(new ColliderComponent(Shape.Box(width, height, this.anchor)));
      } else {
        this.addComponent(new ColliderComponent()); // no collider
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

  // #region Events

  public on(eventName: Events.exittrigger, handler: (event: ExitTriggerEvent) => void): void;
  public on(eventName: Events.entertrigger, handler: (event: EnterTriggerEvent) => void): void;
  /**
   * The **collisionstart** event is fired when a [[BodyComponent|physics body]], usually attached to an actor,
   *  first starts colliding with another [[BodyComponent|body]], and will not fire again while in contact until
   *  the the pair separates and collides again.
   * Use cases for the **collisionstart** event may be detecting when an actor has touched a surface
   * (like landing) or if a item has been touched and needs to be picked up.
   */
  public on(eventName: Events.collisionstart, handler: (event: CollisionStartEvent) => void): void;
  /**
   * The **collisionend** event is fired when two [[BodyComponent|physics bodies]] are no longer in contact.
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
  public on(eventName: Events.pointerup, handler: (event: PointerEvent) => void): void;
  public on(eventName: Events.pointerdown, handler: (event: PointerEvent) => void): void;
  public on(eventName: Events.pointerenter, handler: (event: PointerEvent) => void): void;
  public on(eventName: Events.pointerleave, handler: (event: PointerEvent) => void): void;
  public on(eventName: Events.pointermove, handler: (event: PointerEvent) => void): void;
  public on(eventName: Events.pointercancel, handler: (event: PointerEvent) => void): void;
  public on(eventName: Events.pointerwheel, handler: (event: WheelEvent) => void): void;
  public on(eventName: Events.pointerdragstart, handler: (event: PointerEvent) => void): void;
  public on(eventName: Events.pointerdragend, handler: (event: PointerEvent) => void): void;
  public on(eventName: Events.pointerdragenter, handler: (event: PointerEvent) => void): void;
  public on(eventName: Events.pointerdragleave, handler: (event: PointerEvent) => void): void;
  public on(eventName: Events.pointerdragmove, handler: (event: PointerEvent) => void): void;
  public on(eventName: Events.enterviewport, handler: (event: EnterViewPortEvent) => void): void;
  public on(eventName: Events.exitviewport, handler: (event: ExitViewPortEvent) => void): void;
  public on(eventName: string, handler: (event: GameEvent<Actor>) => void): void;
  public on(eventName: string, handler: (event: any) => void): void {
    super.on(eventName, handler);
  }

  public once(eventName: Events.exittrigger, handler: (event: ExitTriggerEvent) => void): void;
  public once(eventName: Events.entertrigger, handler: (event: EnterTriggerEvent) => void): void;
  /**
   * The **collisionstart** event is fired when a [[BodyComponent|physics body]], usually attached to an actor,
   *  first starts colliding with another [[BodyComponent|body]], and will not fire again while in contact until
   *  the the pair separates and collides again.
   * Use cases for the **collisionstart** event may be detecting when an actor has touch a surface
   * (like landing) or if a item has been touched and needs to be picked up.
   */
  public once(eventName: Events.collisionstart, handler: (event: CollisionStartEvent) => void): void;
  /**
   * The **collisionend** event is fired when two [[BodyComponent|physics bodies]] are no longer in contact.
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
  public once(eventName: Events.pointerup, handler: (event: PointerEvent) => void): void;
  public once(eventName: Events.pointerdown, handler: (event: PointerEvent) => void): void;
  public once(eventName: Events.pointerenter, handler: (event: PointerEvent) => void): void;
  public once(eventName: Events.pointerleave, handler: (event: PointerEvent) => void): void;
  public once(eventName: Events.pointermove, handler: (event: PointerEvent) => void): void;
  public once(eventName: Events.pointercancel, handler: (event: PointerEvent) => void): void;
  public once(eventName: Events.pointerwheel, handler: (event: WheelEvent) => void): void;
  public once(eventName: Events.pointerdragstart, handler: (event: PointerEvent) => void): void;
  public once(eventName: Events.pointerdragend, handler: (event: PointerEvent) => void): void;
  public once(eventName: Events.pointerdragenter, handler: (event: PointerEvent) => void): void;
  public once(eventName: Events.pointerdragleave, handler: (event: PointerEvent) => void): void;
  public once(eventName: Events.pointerdragmove, handler: (event: PointerEvent) => void): void;
  public once(eventName: Events.enterviewport, handler: (event: EnterViewPortEvent) => void): void;
  public once(eventName: Events.exitviewport, handler: (event: ExitViewPortEvent) => void): void;
  public once(eventName: string, handler: (event: GameEvent<Actor>) => void): void;
  public once(eventName: string, handler: (event: any) => void): void {
    super.once(eventName, handler);
  }

  public off(eventName: Events.exittrigger, handler?: (event: ExitTriggerEvent) => void): void;
  public off(eventName: Events.entertrigger, handler?: (event: EnterTriggerEvent) => void): void;
  /**
   * The **collisionstart** event is fired when a [[BodyComponent|physics body]], usually attached to an actor,
   *  first starts colliding with another [[BodyComponent|body]], and will not fire again while in contact until
   *  the the pair separates and collides again.
   * Use cases for the **collisionstart** event may be detecting when an actor has touch a surface
   * (like landing) or if a item has been touched and needs to be picked up.
   */
  public off(eventName: Events.collisionstart, handler?: (event: CollisionStartEvent) => void): void;
  /**
   * The **collisionend** event is fired when two [[BodyComponent|physics bodies]] are no longer in contact.
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
  public off(eventName: Events.pointerdragstart, handler?: (event: PointerEvent) => void): void;
  public off(eventName: Events.pointerdragend, handler?: (event: PointerEvent) => void): void;
  public off(eventName: Events.pointerdragenter, handler?: (event: PointerEvent) => void): void;
  public off(eventName: Events.pointerdragleave, handler?: (event: PointerEvent) => void): void;
  public off(eventName: Events.pointerdragmove, handler?: (event: PointerEvent) => void): void;
  public off(eventName: Events.prekill, handler?: (event: PreKillEvent) => void): void;
  public off(eventName: Events.postkill, handler?: (event: PostKillEvent) => void): void;
  public off(eventName: Events.initialize, handler?: (event: Events.InitializeEvent<Actor>) => void): void;
  public off(eventName: Events.postupdate, handler?: (event: Events.PostUpdateEvent<Actor>) => void): void;
  public off(eventName: Events.preupdate, handler?: (event: Events.PreUpdateEvent<Actor>) => void): void;
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
      super.kill();
      this._postkill(this.scene);
    } else {
      this.logger.warn('Cannot kill actor, it was never added to the Scene');
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
   *
   * @returns Rotation angle in radians
   */
  public getGlobalRotation(): number {
    return this.get(TransformComponent).globalRotation;
  }

  /**
   * Gets an actor's world position taking into account parent relationships, scaling, rotation, and translation
   *
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
}
