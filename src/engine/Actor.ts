import { Physics } from './Physics';
import { Class } from './Class';
import { BoundingBox } from './Collision/BoundingBox';
import { Texture } from './Resources/Texture';
import {
   InitializeEvent, KillEvent, PreUpdateEvent, PostUpdateEvent,
   PreDrawEvent, PostDrawEvent, PreDebugDrawEvent, PostDebugDrawEvent,
   PostCollisionEvent, PreCollisionEvent, CollisionStartEvent, 
   CollisionEndEvent, PostKillEvent, PreKillEvent, GameEvent, 
   ExitTriggerEvent, EnterTriggerEvent
} from './Events';
import { PointerEvent, WheelEvent, PointerDragEvent } from './Input/Pointer';
import { Engine } from './Engine';
import { Color } from './Drawing/Color';
import { Sprite } from './Drawing/Sprite';
import { IActorTrait } from './Interfaces/IActorTrait';
import { IDrawable } from './Interfaces/IDrawable';
import { ICanInitialize, ICanUpdate, ICanDraw, ICanBeKilled } from './Interfaces/LifecycleEvents';
import { Scene } from './Scene';
import { Logger } from './Util/Log';
import { ActionContext } from './Actions/ActionContext';
import { ActionQueue } from './Actions/Action';
import { Vector } from './Algebra';
import { ICollisionArea } from './Collision/ICollisionArea';
import { Body } from './Collision/Body';
import { Side } from './Collision/Side';
import { IEvented } from './Interfaces/IEvented';
import { IActionable } from './Actions/IActionable';
import { Configurable } from './Configurable';
import * as Traits from './Traits/Index';
import * as Effects from './Drawing/SpriteEffects';
import * as Util from './Util/Util';
import * as Events from './Events';
import { IPointerEvents } from './Interfaces/IPointerEvents';

export type PointerEventName = 'pointerdragstart'
   | 'pointerdragend' | 'pointerdragmove' | 'pointerdragenter'
   | 'pointerdragleave' | 'pointermove' | 'pointerenter'
   | 'pointerleave' | 'pointerup' | 'pointerdown';


/**
 * [[include:Constructors.md]]
 */
export interface IActorArgs extends Partial<ActorImpl> {
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

/**
 * @hidden
 */

export class ActorImpl extends Class implements IActionable, IEvented, IPointerEvents, ICanInitialize, ICanUpdate, ICanDraw, ICanBeKilled {
   // #region Properties

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
   public body: Body = new Body(this);

   /**
    * Gets the collision area shape to use for collision possible options are [CircleArea|circles], [PolygonArea|polygons], and 
    * [EdgeArea|edges]. 
    */
   public get collisionArea(): ICollisionArea {
      return this.body.collisionArea;
   }

   /**
    * Gets the collision area shape to use for collision possible options are [CircleArea|circles], [PolygonArea|polygons], and 
    * [EdgeArea|edges]. 
    */
   public set collisionArea(area: ICollisionArea) {
      this.body.collisionArea = area;
   }

   /**
    * Gets the x position of the actor relative to it's parent (if any)
    */
   public get x(): number {
      return this.body.pos.x;
   }

   /**
    * Sets the x position of the actor relative to it's parent (if any)
    */
   public set x(theX: number) {
      this.body.pos.x = theX;
   }

   /**
    * Gets the y position of the actor relative to it's parent (if any)
    */
   public get y(): number {
      return this.body.pos.y;
   }

   /**
    * Sets the y position of the actor relative to it's parent (if any)
    */
   public set y(theY: number) {
      this.body.pos.y = theY;
   }

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
    * Gets/sets the acceleration of the actor from the last frame. This does not include the global acc [[Physics.acc]].
    */
   public oldAcc: Vector = Vector.Zero.clone();

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
    * Gets the current torque applied to the actor. Torque can be thought of as rotational force
    */
   public get torque() {
      return this.body.torque;
   }

   /**
    * Sets the current torque applied to the actor. Torque can be thought of as rotational force
    */
   public set torque(theTorque: number) {
      this.body.torque = theTorque;
   }

   /**
    * Get the current mass of the actor, mass can be thought of as the resistance to acceleration.
    */
   public get mass() {
      return this.body.mass;
   }

   /**
    * Sets the mass of the actor, mass can be thought of as the resistance to acceleration.
    */
   public set mass(theMass: number) {
      this.body.mass = theMass;
   }

   /**
    * Gets the current moment of inertia, moi can be thought of as the resistance to rotation.
    */
   public get moi() {
      return this.body.moi;
   }

   /**
    * Sets the current moment of inertia, moi can be thought of as the resistance to rotation.
    */
   public set moi(theMoi: number) {
      this.body.moi = theMoi;
   }

   /**
    * Gets the coefficient of friction on this actor, this can be thought of as how sticky or slippery an object is.
    */
   public get friction() {
      return this.body.friction;
   }

   /**
    * Sets the coefficient of friction of this actor, this can ve thought of as how stick or slippery an object is.
    */
   public set friction(theFriction: number) {
      this.body.friction = theFriction;
   }

   /**
    * Gets the coefficient of restitution of this actor, represents the amount of energy preserved after collision. Think of this  
    * as bounciness.
    */
   public get restitution() {
      return this.body.restitution;
   }

   /**
    * Sets the coefficient of restitution of this actor, represents the amount of energy preserved after collision. Think of this
    * as bounciness.
    */
   public set restitution(theRestitution: number) {
      this.body.restitution = theRestitution;
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
    * The scale vector of the actor
    */
   public scale: Vector = Vector.One.clone();

   /**
    * The scale of the actor last frame
    */
   public oldScale: Vector = Vector.One.clone();

   /** 
    * The x scalar velocity of the actor in scale/second
    */
   public sx: number = 0; //scale/sec
   /** 
    * The y scalar velocity of the actor in scale/second
    */
   public sy: number = 0; //scale/sec

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
   // TODO: Replace this with the new actor collection once z-indexing is built
   /**
    * The children of this actor
    */
   public children: Actor[] = [];
   /**
    * Gets or sets the current collision type of this actor. By 
    * default it is ([[CollisionType.PreventCollision]]).
    */
   public collisionType: CollisionType = CollisionType.PreventCollision;
   public collisionGroups: string[] = [];

   /**
    * Flag to be set when any property change would result in a geometry recalculation
    * @internal
    */
   private _geometryDirty: boolean = false;


   private _collisionHandlers: { [key: string]: { (actor: Actor): void }[]; } = {};
   private _isInitialized: boolean = false;
   public frames: { [key: string]: IDrawable; } = {};
   private _effectsDirty: boolean = false;

   /**
    * Access to the current drawing for the actor, this can be 
    * an [[Animation]], [[Sprite]], or [[Polygon]]. 
    * Set drawings with [[setDrawing]].
    */
   public currentDrawing: IDrawable = null;

   /**
    * Modify the current actor update pipeline. 
    */
   public traits: IActorTrait[] = [];

   /**
    * Sets the color of the actor. A rectangle of this color will be 
    * drawn if no [[IDrawable]] is specified as the actors drawing.
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
   public capturePointer: Traits.ICapturePointerConfig = {
      captureMoveEvents: false,
      captureDragEvents: false
   };

   private _zIndex: number = 0;
   private _isKilled: boolean = false;
   private _opacityFx = new Effects.Opacity(this.opacity);

   // #endregion

   /**
    * @param x       The starting x coordinate of the actor
    * @param y       The starting y coordinate of the actor
    * @param width   The starting width of the actor
    * @param height  The starting height of the actor
    * @param color   The starting color of the actor. Leave null to draw a transparent actor. The opacity of the color will be used as the
    * initial [[opacity]].
    */
   constructor(xOrConfig?: number | IActorArgs, y?: number, width?: number, height?: number, color?: Color) {
      super();

      if (xOrConfig && typeof xOrConfig === 'object') {
         var config = xOrConfig;
         xOrConfig = config.pos ? config.pos.x : config.x;
         y = config.pos ? config.pos.y : config.y;
         width = config.width;
         height = config.height;
      }

      this.pos.x = <number>xOrConfig || 0;
      this.pos.y = y || 0;
      this._width = width || 0;
      this._height = height || 0;
      if (color) {
         this.color = color;
         // set default opacity of an actor to the color
         this.opacity = color.a;
      }

      // Build default pipeline
      //this.traits.push(new ex.Traits.EulerMovement());
      // TODO: TileMaps should be converted to a collision area
      this.traits.push(new Traits.TileMapCollisionDetection());
      this.traits.push(new Traits.OffscreenCulling());
      this.traits.push(new Traits.CapturePointer());

      // Build the action queue
      this.actionQueue = new ActionQueue(this);
      this.actions = new ActionContext(this);

      // default anchor is in the middle
      this.anchor = new Vector(.5, .5);

      // Initialize default collision area to be box
      this.body.useBoxCollision();
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
    * Gets wether the actor is Initialized 
    */
   public get isInitialized(): boolean {
      return this._isInitialized;
   }

   /**
    * Initializes this actor and all it's child actors, meant to be called by the Scene before first update not by users of Excalibur.
    * 
    * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
    * 
    * @internal
    */
   public _initialize(engine: Engine) {
      if (!this.isInitialized) {
         this.onInitialize(engine);
         super.emit('initialize', new InitializeEvent(engine, this));
         this._isInitialized = true;
      }
      for (var child of this.children) {
         child._initialize(engine);
      }
   }

   // #region Events

   private _capturePointerEvents: PointerEventName[] = [
      'pointerup', 'pointerdown', 'pointermove', 'pointerenter', 'pointerleave',
      'pointerdragstart', 'pointerdragend', 'pointerdragmove', 'pointerdragenter', 'pointerdragleave'
   ];

   private _captureMoveEvents: PointerEventName[] = [
      'pointermove', 'pointerenter', 'pointerleave',
      'pointerdragmove', 'pointerdragenter', 'pointerdragleave'
   ];

   private _captureDragEvents: PointerEventName[] = [
      'pointerdragstart', 'pointerdragend', 'pointerdragmove', 'pointerdragenter', 'pointerdragleave'
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

   public on(eventName: Events.exittrigger, handler: (evt: ExitTriggerEvent) => void): void;
   public on(eventName: Events.entertrigger, handler: (evt: EnterTriggerEvent) => void): void;
   public on(eventName: Events.collisionstart, handler: (event?: CollisionStartEvent) => void): void;
   public on(eventName: Events.collisionend, handler: (event?: CollisionEndEvent) => void): void;
   public on(eventName: Events.precollision, handler: (event?: PreCollisionEvent) => void): void;
   public on(eventName: Events.postcollision, handler: (event?: PostCollisionEvent) => void): void;
   public on(eventName: Events.kill, handler: (event?: KillEvent) => void): void;
   public on(eventName: Events.prekill, handler: (event?: PreKillEvent) => void): void;
   public on(eventName: Events.postkill, handler: (event?: PostKillEvent) => void): void;
   public on(eventName: Events.initialize, handler: (event?: InitializeEvent) => void): void;
   public on(eventName: Events.preupdate, handler: (event?: PreUpdateEvent) => void): void;
   public on(eventName: Events.postupdate, handler: (event?: PostUpdateEvent) => void): void;
   public on(eventName: Events.predraw, handler: (event?: PreDrawEvent) => void): void;
   public on(eventName: Events.postdraw, handler: (event?: PostDrawEvent) => void): void;
   public on(eventName: Events.predebugdraw, handler: (event?: PreDebugDrawEvent) => void): void;
   public on(eventName: Events.postdebugdraw, handler: (event?: PostDebugDrawEvent) => void): void;
   public on(eventName: Events.pointerup, handler: (event?: PointerEvent) => void): void;
   public on(eventName: Events.pointerdown, handler: (event?: PointerEvent) => void): void;
   public on(eventName: Events.pointerenter, handler: (event?: PointerEvent) => void): void;
   public on(eventName: Events.pointerleave, handler: (event?: PointerEvent) => void): void;
   public on(eventName: Events.pointermove, handler: (event?: PointerEvent) => void): void;
   public on(eventName: Events.pointercancel, handler: (event?: PointerEvent) => void): void;
   public on(eventName: Events.pointerwheel, handler: (event?: WheelEvent) => void): void;
   public on(eventName: Events.pointerdragstart, handler: (event?: PointerDragEvent) => void): void;
   public on(eventName: Events.pointerdragend, handler: (event?: PointerDragEvent) => void): void;
   public on(eventName: Events.pointerdragenter, handler: (event?: PointerDragEvent) => void): void;
   public on(eventName: Events.pointerdragleave, handler: (event?: PointerDragEvent) => void): void;
   public on(eventName: Events.pointerdragmove, handler: (event?: PointerDragEvent) => void): void;
   public on(eventName: string, handler: (event?: GameEvent<any>) => void): void;
   public on(eventName: string, handler: (event?: any) => void): void {
      this._checkForPointerOptIn(eventName);
      super.on(eventName, handler);
   }

   public once(eventName: Events.exittrigger, handler: (evt: ExitTriggerEvent) => void): void;
   public once(eventName: Events.entertrigger, handler: (evt: EnterTriggerEvent) => void): void;
   public once(eventName: Events.collisionstart, handler: (event?: CollisionStartEvent) => void): void;
   public once(eventName: Events.collisionend, handler: (event?: CollisionEndEvent) => void): void;
   public once(eventName: Events.precollision, handler: (event?: PreCollisionEvent) => void): void;
   public once(eventName: Events.postcollision, handler: (event?: PostCollisionEvent) => void): void;
   public once(eventName: Events.kill, handler: (event?: KillEvent) => void): void;
   public once(eventName: Events.postkill, handler: (event?: PostKillEvent) => void): void;
   public once(eventName: Events.prekill, handler: (event?: PreKillEvent) => void): void;
   public once(eventName: Events.initialize, handler: (event?: InitializeEvent) => void): void;
   public once(eventName: Events.preupdate, handler: (event?: PreUpdateEvent) => void): void;
   public once(eventName: Events.postupdate, handler: (event?: PostUpdateEvent) => void): void;
   public once(eventName: Events.predraw, handler: (event?: PreDrawEvent) => void): void;
   public once(eventName: Events.postdraw, handler: (event?: PostDrawEvent) => void): void;
   public once(eventName: Events.predebugdraw, handler: (event?: PreDebugDrawEvent) => void): void;
   public once(eventName: Events.postdebugdraw, handler: (event?: PostDebugDrawEvent) => void): void;
   public once(eventName: Events.pointerup, handler: (event?: PointerEvent) => void): void;
   public once(eventName: Events.pointerdown, handler: (event?: PointerEvent) => void): void;
   public once(eventName: Events.pointerenter, handler: (event?: PointerEvent) => void): void;
   public once(eventName: Events.pointerleave, handler: (event?: PointerEvent) => void): void;
   public once(eventName: Events.pointermove, handler: (event?: PointerEvent) => void): void;
   public once(eventName: Events.pointercancel, handler: (event?: PointerEvent) => void): void;
   public once(eventName: Events.pointerwheel, handler: (event?: WheelEvent) => void): void;
   public once(eventName: Events.pointerdragstart, handler: (event?: PointerDragEvent) => void): void;
   public once(eventName: Events.pointerdragend, handler: (event?: PointerDragEvent) => void): void;
   public once(eventName: Events.pointerdragenter, handler: (event?: PointerDragEvent) => void): void;
   public once(eventName: Events.pointerdragleave, handler: (event?: PointerDragEvent) => void): void;
   public once(eventName: Events.pointerdragmove, handler: (event?: PointerDragEvent) => void): void;
   public once(eventName: string, handler: (event?: GameEvent<any>) => void): void;
   public once(eventName: string, handler: (event?: any) => void): void {
      this._checkForPointerOptIn(eventName);
      super.once(eventName, handler);
   }

   public off(eventName: Events.exittrigger, handler?: (evt: ExitTriggerEvent) => void): void;
   public off(eventName: Events.entertrigger, handler?: (evt: EnterTriggerEvent) => void): void;
   public off(eventName: Events.pointerup, handler?: (event?: PointerEvent) => void): void;
   public off(eventName: Events.pointerdown, handler?: (event?: PointerEvent) => void): void;
   public off(eventName: Events.pointerenter, handler?: (event?: PointerEvent) => void): void;
   public off(eventName: Events.pointerleave, handler?: (event?: PointerEvent) => void): void;
   public off(eventName: Events.pointermove, handler?: (event?: PointerEvent) => void): void;
   public off(eventName: Events.pointercancel, handler?: (event?: PointerEvent) => void): void;
   public off(eventName: Events.pointerwheel, handler?: (event?: WheelEvent) => void): void;
   public off(eventName: Events.pointerdragstart, handler?: (event?: PointerDragEvent) => void): void;
   public off(eventName: Events.pointerdragend, handler?: (event?: PointerDragEvent) => void): void;
   public off(eventName: Events.pointerdragenter, handler?: (event?: PointerDragEvent) => void): void;
   public off(eventName: Events.pointerdragleave, handler?: (event?: PointerDragEvent) => void): void;
   public off(eventName: Events.pointerdragmove, handler?: (event?: PointerDragEvent) => void): void;
   public off(eventName: Events.prekill, handler?: (event?: PreKillEvent) => void): void;
   public off(eventName: Events.postkill, handler?: (event?: PostKillEvent) => void): void;
   public off(eventName: Events.initialize, handler?: (event?: Events.InitializeEvent) => void): void;
   public off(eventName: Events.postupdate, handler?: (event?: Events.PostUpdateEvent) => void): void;
   public off(eventName: Events.preupdate, handler?: (event?: Events.PreUpdateEvent) => void): void;
   public off(eventName: Events.postdraw, handler?: (event?: Events.PostDrawEvent) => void): void;
   public off(eventName: Events.predraw, handler?: (event?: Events.PreDrawEvent) => void): void;
   public off(eventName: string, handler?: (event?: GameEvent<any>) => void): void;
   public off(eventName: string, handler?: (event?: any) => void): void {
      super.off(eventName, handler);
   }

   // #endregion


   /**
    * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
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
    * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
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
         this.scene.remove(this);
         this._isKilled = true;
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
      actor.collisionType = CollisionType.PreventCollision;
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
            Logger.getInstance().error('the specified drawing key \'' + key + '\' does not exist');
         }
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
   public addDrawing(key: any, drawing: IDrawable): void;
   public addDrawing(): void {
      if (arguments.length === 2) {
         this.frames[<string>arguments[0]] = arguments[1];
         if (!this.currentDrawing) {
            this.currentDrawing = arguments[1];
         }
         this._effectsDirty = true;
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
      this.scene.cleanupDrawTree(this);
      this._zIndex = newIndex;
      this.scene.updateDrawTree(this);
   }

   /** 
    * Adds an actor to a collision group. Actors with no named collision groups are
    * considered to be in every collision group.
    *
    * Once in a collision group(s) actors will only collide with other actors in 
    * that group.
    *
    * @param name The name of the collision group
    */
   public addCollisionGroup(name: string) {
      this.collisionGroups.push(name);
   }
   /**
    * Removes an actor from a collision group.
    * @param name The name of the collision group
    */
   public removeCollisionGroup(name: string) {
      var index = this.collisionGroups.indexOf(name);
      if (index !== -1) {
         this.collisionGroups.splice(index, 1);
      }
   }

   /**
    * Get the center point of an actor
    */
   public getCenter(): Vector {
      return new Vector(this.pos.x + this.getWidth() / 2 - this.anchor.x * this.getWidth(),
         this.pos.y + this.getHeight() / 2 - this.anchor.y * this.getHeight());
   }
   /**
    * Gets the calculated width of an actor, factoring in scale
    */
   public getWidth() {
      return this._width * this.getGlobalScale().x;
   }
   /**
    * Sets the width of an actor, factoring in the current scale
    */
   public setWidth(width: number) {
      this._width = width / this.scale.x;
      this._geometryDirty = true;
   }
   /**
    * Gets the calculated height of an actor, factoring in scale
    */
   public getHeight() {
      return this._height * this.getGlobalScale().y;
   }
   /**
    * Sets the height of an actor, factoring in the current scale
    */
   public setHeight(height: number) {
      this._height = height / this.scale.y;
      this._geometryDirty = true;
   }
   /**
    * Gets the left edge of the actor
    */
   public getLeft() {
      return this.getBounds().left;
   }
   /**
    * Gets the right edge of the actor
    */
   public getRight() {
      return this.getBounds().right;
   }
   /**
    * Gets the top edge of the actor
    */
   public getTop() {
      return this.getBounds().top;
   }
   /**
    * Gets the bottom edge of the actor
    */
   public getBottom() {
      return this.getBounds().bottom;
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
      var parents: Actor[] = [];
      var root: Actor = this;

      parents.push(this);

      // find parents
      while (root.parent) {
         root = root.parent;
         parents.push(root);
      }

      // calculate position       
      var x = parents.reduceRight((px, p) => {
         if (p.parent) {
            return px + (p.pos.x * p.getGlobalScale().x);
         }
         return px + p.pos.x;
      }, 0);

      var y = parents.reduceRight((py, p) => {
         if (p.parent) {
            return py + (p.pos.y * p.getGlobalScale().y);
         }
         return py + p.pos.y;
      }, 0);

      // rotate around root anchor
      var ra = root.getWorldPos(); // 10, 10
      var r = this.getWorldRotation();

      return new Vector(x, y).rotate(r, ra);
   }

   /**
    * Gets the global scale of the Actor
    */
   public getGlobalScale(): Vector {
      if (!this.parent) {
         return new Vector(this.scale.x, this.scale.y);
      }

      var parentScale = this.parent.getGlobalScale();
      return new Vector(this.scale.x * parentScale.x, this.scale.y * parentScale.y);
   }

   // #region Collision

   /**
    * Returns the actor's [[BoundingBox]] calculated for this instant in world space.
    */
   public getBounds(): BoundingBox {
      // todo cache bounding box
      var anchor = this._getCalculatedAnchor();
      var pos = this.getWorldPos();

      return new BoundingBox(pos.x - anchor.x,
         pos.y - anchor.y,
         pos.x + this.getWidth() - anchor.x,
         pos.y + this.getHeight() - anchor.y).rotate(this.rotation, pos);
   }

   /**
    * Returns the actor's [[BoundingBox]] relative to the actors position.
    */
   public getRelativeBounds() {
      // todo cache bounding box
      var anchor = this._getCalculatedAnchor();
      return new BoundingBox(-anchor.x,
         -anchor.y,
         this.getWidth() - anchor.x,
         this.getHeight() - anchor.y).rotate(this.rotation);
   }

   /**
    * Indicates that the actor's collision geometry needs to be recalculated for accurate collisions
    */
   public get isGeometryDirty() {
      return this._geometryDirty;
   }


   /**
    * Tests whether the x/y specified are contained in the actor
    * @param x  X coordinate to test (in world coordinates)
    * @param y  Y coordinate to test (in world coordinates)
    * @param recurse checks whether the x/y are contained in any child actors (if they exist).
    */
   public contains(x: number, y: number, recurse: boolean = false): boolean {
      var containment = this.getBounds().contains(new Vector(x, y));

      if (recurse) {

         return containment || this.children.some((child: Actor) => {
            return child.contains(x, y, true);
         });
      }

      return containment;
   }

   /**
    * Returns the side of the collision based on the intersection 
    * @param intersect The displacement vector returned by a collision
    */
   public getSideFromIntersect(intersect: Vector) {
      if (intersect) {
         if (Math.abs(intersect.x) > Math.abs(intersect.y)) {
            if (intersect.x < 0) {
               return Side.Right;
            }
            return Side.Left;
         } else {
            if (intersect.y < 0) {
               return Side.Bottom;
            }
            return Side.Top;
         }
      }
      return Side.None;
   }
   /**
    * Test whether the actor has collided with another actor, returns the side of the current actor that collided.
    * @param actor The other actor to test
    */
   public collidesWithSide(actor: Actor): Side {
      var separationVector = this.collides(actor);
      if (!separationVector) {
         return Side.None;
      }
      if (Math.abs(separationVector.x) > Math.abs(separationVector.y)) {
         if (this.pos.x < actor.pos.x) {
            return Side.Right;
         } else {
            return Side.Left;
         }
      } else {
         if (this.pos.y < actor.pos.y) {
            return Side.Bottom;
         } else {
            return Side.Top;
         }
      }
   }
   /**
    * Test whether the actor has collided with another actor, returns the intersection vector on collision. Returns
    * `null` when there is no collision;
    * @param actor The other actor to test
    */
   public collides(actor: Actor): Vector {
      var bounds = this.getBounds();
      var otherBounds = actor.getBounds();
      var intersect = bounds.collides(otherBounds);
      return intersect;
   }
   /**
    * Register a handler to fire when this actor collides with another in a specified group
    * @param group The group name to listen for
    * @param func The callback to fire on collision with another actor from the group. The callback is passed the other actor.
    */
   public onCollidesWith(group: string, func: (actor: Actor) => void) {
      if (!this._collisionHandlers[group]) {
         this._collisionHandlers[group] = [];
      }
      this._collisionHandlers[group].push(func);
   }
   public getCollisionHandlers(): { [key: string]: { (actor: Actor): void }[]; } {
      return this._collisionHandlers;
   }
   /**
    * Removes all collision handlers for this group on this actor
    * @param group Group to remove all handlers for on this actor.
    */
   public removeCollidesWith(group: string) {
      this._collisionHandlers[group] = [];
   }
   /**
    * Returns true if the two actors are less than or equal to the distance specified from each other
    * @param actor     Actor to test
    * @param distance  Distance in pixels to test
    */
   public within(actor: Actor, distance: number): boolean {
      return Math.sqrt(Math.pow(this.pos.x - actor.pos.x, 2) + Math.pow(this.pos.y - actor.pos.y, 2)) <= distance;
   }

   // #endregion

   private _getCalculatedAnchor(): Vector {
      return new Vector(this.getWidth() * this.anchor.x, this.getHeight() * this.anchor.y);
   }

   protected _reapplyEffects(drawing: IDrawable) {
      drawing.removeEffect(this._opacityFx);
      drawing.addEffect(this._opacityFx);
   }

   // #region Update
   /**
    * Perform euler integration at the specified time step
    */
   public integrate(delta: number) {
      // Update placements based on linear algebra
      var seconds = delta / 1000;

      var totalAcc = this.acc.clone();
      // Only active vanilla actors are affected by global acceleration
      if (this.collisionType === CollisionType.Active) {
         totalAcc.addEqual(Physics.acc);
      }

      this.vel.addEqual(totalAcc.scale(seconds));
      this.pos.addEqual(this.vel.scale(seconds)).addEqual(totalAcc.scale(0.5 * seconds * seconds));

      this.rx += this.torque * (1.0 / this.moi) * seconds;
      this.rotation += this.rx * seconds;

      this.scale.x += this.sx * delta / 1000;
      this.scale.y += this.sy * delta / 1000;

      if (!this.scale.equals(this.oldScale)) {
         // change in scale effects the geometry
         this._geometryDirty = true;
      }

      // Update physics body
      this.body.update();
      this._geometryDirty = false;
   }

   /**
    * Called by the Engine, updates the state of the actor
    * @param engine The reference to the current game engine
    * @param delta  The time elapsed since the last update in milliseconds
    */
   public update(engine: Engine, delta: number) {
      this._initialize(engine);
      this._preupdate(engine, delta);

      // Update action queue
      this.actionQueue.update(delta);

      // Update color only opacity
      if (this.color) {
         this.color.a = this.opacity;
      }

      // calculate changing opacity
      if (this.previousOpacity !== this.opacity) {
         this.previousOpacity = this.opacity;
         this._opacityFx.opacity = this.opacity;
         this._effectsDirty = true;
      }

      // Capture old values before integration step updates them
      this.oldVel.setTo(this.vel.x, this.vel.y);
      this.oldPos.setTo(this.pos.x, this.pos.y);
      this.oldAcc.setTo(this.acc.x, this.acc.y);
      this.oldScale.setTo(this.scale.x, this.scale.y);

      // Run Euler integration
      this.integrate(delta);

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
    * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
    * 
    * Internal _preupdate handler for [[onPreUpdate]] lifecycle event
    * @internal
    */
   public _preupdate(engine: Engine, delta: number): void {      
      this.emit('preupdate', new PreUpdateEvent(engine, delta, this));
      this.onPreUpdate(engine, delta);
   }

   /**
    * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
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
         var drawing = this.currentDrawing;
         // See https://github.com/excaliburjs/Excalibur/pull/619 for discussion on this formula          
         var offsetX = (this._width - drawing.width * drawing.scale.x) * this.anchor.x;
         var offsetY = (this._height - drawing.height * drawing.scale.y) * this.anchor.y;

         if (this._effectsDirty) {
            this._reapplyEffects(this.currentDrawing);
            this._effectsDirty = false;
         }

         this.currentDrawing.draw(ctx, offsetX, offsetY);
      } else {
         if (this.color) {
            ctx.fillStyle = this.color.toString();
            ctx.fillRect(0, 0, this._width, this._height);
         }
      }
      ctx.restore();

      // Draw child actors
      for (var i = 0; i < this.children.length; i++) {
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
    * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
    * 
    * Internal _predraw handler for [[onPreDraw]] lifecycle event
    * @internal
    */
   public _predraw(ctx: CanvasRenderingContext2D, delta: number): void {      
      this.emit('predraw', new PreDrawEvent(ctx, delta, this));
      this.onPreDraw(ctx, delta);
   }

   /**
    * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
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

      this.body.debugDraw(ctx);

      // Draw actor bounding box
      var bb = this.getBounds();
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
      for (var j = 0; j < this.traits.length; j++) {
         if (this.traits[j] instanceof Traits.OffscreenCulling) {
            (<Traits.OffscreenCulling>this.traits[j]).cullingBox.debugDraw(ctx);
         }
      }

      // Unit Circle debug draw
      ctx.strokeStyle = Color.Yellow.toString();
      ctx.beginPath();
      var radius = Math.min(this.getWidth(), this.getHeight());
      ctx.arc(this.getWorldPos().x, this.getWorldPos().y, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.stroke();
      var ticks: { [key: string]: number } = {
         '0 Pi': 0,
         'Pi/2': Math.PI / 2,
         'Pi': Math.PI,
         '3/2 Pi': 3 * Math.PI / 2
      };

      var oldFont = ctx.font;
      for (var tick in ticks) {
         ctx.fillStyle = Color.Yellow.toString();
         ctx.font = '14px';
         ctx.textAlign = 'center';
         ctx.fillText(tick, this.getWorldPos().x + Math.cos(ticks[tick]) * (radius + 10),
            this.getWorldPos().y + Math.sin(ticks[tick]) * (radius + 10));
      }

      ctx.font = oldFont;

      // Draw child actors
      for (var i = 0; i < this.children.length; i++) {
         this.children[i].debugDraw(ctx);
      }

      this.emit('postdebugdraw', new PostDebugDrawEvent(ctx, this));
   }

   // #endregion
}


/**
 * The most important primitive in Excalibur is an `Actor`. Anything that
 * can move on the screen, collide with another `Actor`, respond to events, 
 * or interact with the current scene, must be an actor. An `Actor` **must**
 * be part of a [[Scene]] for it to be drawn to the screen.
 *
 * [[include:Actors.md]]
 * 
 * 
 * [[include:Constructors.md]]
 *
 */
export class Actor extends Configurable(ActorImpl) {
   constructor();
   constructor(config?: IActorArgs);
   constructor(x?: number, y?: number, width?: number, height?: number, color?: Color);
   constructor(xOrConfig?: number | IActorArgs, y?: number, width?: number, height?: number, color?: Color) {
      super(xOrConfig, y, width, height, color);
   }
}


/**
 * An enum that describes the types of collisions actors can participate in
 */
export enum CollisionType {
   /**
    * Actors with the `PreventCollision` setting do not participate in any
    * collisions and do not raise collision events.
    */
   PreventCollision,
   /**
    * Actors with the `Passive` setting only raise collision events, but are not
    * influenced or moved by other actors and do not influence or move other actors.
    */
   Passive,
   /**
    * Actors with the `Active` setting raise collision events and participate
    * in collisions with other actors and will be push or moved by actors sharing
    * the `Active` or `Fixed` setting.
    */
   Active,
   /**
    * Actors with the `Fixed` setting raise collision events and participate in
    * collisions with other actors. Actors with the `Fixed` setting will not be
    * pushed or moved by other actors sharing the `Fixed`. Think of Fixed
    * actors as "immovable/onstoppable" objects. If two `Fixed` actors meet they will
    * not be pushed or moved by each other, they will not interact except to throw
    * collision events.
    */
   Fixed
}