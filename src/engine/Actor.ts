/// <reference path="Interfaces/IDrawable.ts" />
/// <reference path="Collision/ICollisionArea.ts" />
/// <reference path="Collision/PolygonArea.ts" />
/// <reference path="Interfaces/IEvented.ts" />
/// <reference path="Traits/EulerMovement.ts" />
/// <reference path="Traits/OffscreenCulling.ts" />
/// <reference path="Traits/CapturePointer.ts" />
/// <reference path="Traits/TileMapCollisionDetection.ts" />
/// <reference path="Collision/Side.ts" />
/// <reference path="Algebra.ts" />
/// <reference path="Util/Util.ts" />
/// <reference path="TileMap.ts" />
/// <reference path="Collision/BoundingBox.ts" />
/// <reference path="Collision/Body.ts" />
/// <reference path="Scene.ts" />
/// <reference path="Actions/IActionable.ts"/>
/// <reference path="Actions/Action.ts" />
/// <reference path="Actions/ActionContext.ts"/>
/// <reference path="Util/EasingFunctions.ts"/>


module ex {
 
  /**
   * Actors
   *
   * The most important primitive in Excalibur is an `Actor`. Anything that
   * can move on the screen, collide with another `Actor`, respond to events, 
   * or interact with the current scene, must be an actor. An `Actor` **must**
   * be part of a [[Scene]] for it to be drawn to the screen.
   *
   * ## Basic actors
   *
   * For quick and dirty games, you can just create an instance of an `Actor`
   * and manipulate it directly.
   *
   * Actors (and other entities) must be added to a [[Scene]] to be drawn
   * and updated on-screen.
   *
   * ```ts
   * var player = new ex.Actor();
   *
   * // move the player
   * player.dx = 5;
   *
   * // add player to the current scene
   * game.add(player);
   *
   * ```
   * `game.add` is a convenience method for adding an `Actor` to the current scene. The equivalent verbose call is `game.currentScene.add`.
   * 
   * ## Actor Lifecycle
   * 
   * An [[Actor|actor]] has a basic lifecycle that dictates how it is initialized, updated, and drawn. Once an actor is part of a 
   * [[Scene|scene]], it will follow this lifecycle.
   * 
   * ![Actor Lifecycle](/assets/images/docs/ActorLifecycle.png)
   *
   * ## Extending actors
   *
   * For "real-world" games, you'll want to `extend` the `Actor` class.
   * This gives you much greater control and encapsulates logic for that
   * actor.
   *
   * You can override the [[onInitialize]] method to perform any startup logic
   * for an actor (such as configuring state). [[onInitialize]] gets called
   * **once** before the first frame an actor is drawn/updated. It is passed
   * an instance of [[Engine]] to access global state or perform coordinate math.
   *
   * **TypeScript**
   *
   * ```ts
   * class Player extends ex.Actor {
   *
   *   public level = 1;
   *   public endurance = 0;
   *   public fortitude = 0;
   *
   *   constructor() {
   *     super();
   *   }
   *
   *   public onInitialize(engine: ex.Engine) {
   *     this.endurance = 20;
   *     this.fortitude = 16;
   *   }
   *
   *   public getMaxHealth() {
   *     return (0.4 * this.endurance) + (0.9 * this.fortitude) + (this.level * 1.2);
   *   }
   * }
   * ```
   *
   * **Javascript**
   *
   * In Javascript you can use the [[extend]] method to override or add
   * methods to an `Actor`.
   *
   * ```js
   * var Player = ex.Actor.extend({
   *
   *   level: 1,
   *   endurance: 0,
   *   fortitude: 0,
   *   
   *   onInitialize: function (engine) {
   *     this.endurance = 20;
   *     this.fortitude = 16;
   *   },
   *   
   *   getMaxHealth: function () {
   *     return (0.4 * this.endurance) + (0.9 * this.fortitude) + (this.level * 1.2);
   *   }
   * });
   * ```
   *
   * ## Updating actors
   *
   * Override the [[update]] method to update the state of your actor each frame.
   * Typically things that need to be updated include state, drawing, or position.
   *
   * Remember to call `super.update` to ensure the base update logic is performed.
   * You can then write your own logic for what happens after that.
   *
   * The [[update]] method is passed an instance of the Excalibur engine, which
   * can be used to perform coordinate math or access global state. It is also
   * passed `delta` which is the time in milliseconds since the last frame, which can be used
   * to perform time-based movement or time-based math (such as a timer).
   *
   * **TypeScript**
   *
   * ```ts
   * class Player extends Actor {
   *   public update(engine: ex.Engine, delta: number) {
   *     super.update(engine, delta); // call base update logic
   *   
   *     // check if player died
   *     if (this.health <= 0) {
   *       this.emit("death");
   *       this.onDeath();
   *       return;
   *     }
   *   }
   * }
   * ```
   *
   * **Javascript**
   *
   * ```js
   * var Player = ex.Actor.extend({
   *   update: function (engine, delta) {
   *     ex.Actor.prototype.update.call(this, engine, delta); // call base update logic
   *
   *     // check if player died
   *     if (this.health <= 0) {
   *       this.emit("death");
   *       this.onDeath();
   *       return;
   *     }
   *   }
   * });
   * ```
   *
   * ## Drawing actors
   *
   * Override the [[draw]] method to perform any custom drawing. For simple games,
   * you don't need to override `draw`, instead you can use [[addDrawing]] and [[setDrawing]]
   * to manipulate the [[Sprite|sprites]]/[[Animation|animations]] that the actor is using.
   *
   * ### Working with Textures & Sprites
   *
   * Think of a [[Texture|texture]] as the raw image file that will be loaded into Excalibur. In order for it to be drawn
   * it must be converted to a [[Sprite.sprite]].
   * 
   * A common usage is to load a [[Texture]] and convert it to a [[Sprite]] for an actor. If you are using the [[Loader]] to
   * pre-load assets, you can simply assign an actor a [[Sprite]] to draw. You can also create a 
   * [[Texture.asSprite|sprite from a Texture]] to quickly create a [[Sprite]] instance.
   *
   * ```ts
   * // assume Resources.TxPlayer is a 80x80 png image
   *
   * public onInitialize(engine: ex.Engine) {
   *
   *   // set as the "default" drawing
   *   this.addDrawing(Resources.TxPlayer);
   *
   *   // you can also set a Sprite instance to draw
   *   this.addDrawing(Resources.TxPlayer.asSprite());
   * }
   * ```
   *
   * ### Working with Animations
   *
   * A [[SpriteSheet]] holds a collection of sprites from a single [[Texture]].
   * Use [[SpriteSheet.getAnimationForAll]] to easily generate an [[Animation]].
   *
   * ```ts
   * // assume Resources.TxPlayerIdle is a texture containing several frames of an animation
   *
   * public onInitialize(engine: ex.Engine) {
   *   
   *   // create a SpriteSheet for the animation
   *   var playerIdleSheet = new ex.SpriteSheet(Resources.TxPlayerIdle, 5, 1, 80, 80);
   *
   *   // create an animation
   *   var playerIdleAnimation = playerIdleSheet.getAnimationForAll(engine, 120);
   *
   *   // the first drawing is always the current
   *   this.addDrawing("idle", playerIdleAnimation);
   * }
   * ```
   *
   * ### Custom drawing
   *
   * You can always override the default drawing logic for an actor in the [[draw]] method, 
   * for example, to draw complex shapes or to use the raw 
   * [[https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D|Canvas API]].
   * 
   * Usually you should call `super.draw` to perform the base drawing logic, but other times
   * you may want to take over the drawing completely.
   *
   * ```ts
   * public draw(ctx: Canvas2DRenderingContext, delta: number) {
   *
   *   super.draw(ctx, delta); // perform base drawing logic
   *
   *   // custom drawing
   *   ctx.lineTo(...);
   * }
   * ```
   *
   * ## Actions
   *
   * You can use the [[ActionContext|Action API]] to create chains of
   * actions and script actors into doing your bidding for your game.
   *
   * Actions can be simple or can be chained together to create complex
   * AI routines. In the future, it will be easier to create timelines or
   * scripts to run depending on the state of your actor, such as an
   * enemy ship that is Guarding a path and then is Alerted when a Player
   * draws near.
   *
   * Learn more about the [[ActionContext|Action API]].
   *
   * ## Collision Detection
   *
   * By default Actors do not participate in collisions. If you wish to make
   * an actor participate, you need to switch from the default [[CollisionType.PreventCollision|prevent collision]]
   * to [[CollisionType.Active|active]], [[CollisionType.Fixed|fixed]], or [[CollisionType.Passive|passive]] collision type. 
   *
   * ```ts
   * public Player extends ex.Actor {
   *   constructor() {
   *     super();
   *     // set preferred CollisionType
   *     this.collisionType = ex.CollisionType.Active;
   *   }
   * }
   * 
   * // or set the collisionType 
   * 
   * var actor = new ex.Actor();
   * actor.collisionType = ex.CollisionType.Active;
   * 
   * ```
   * ### Collision Groups
   * TODO, needs more information.
   *
   * ## Traits
   *    
   * Traits describe actor behavior that occurs every update. If you wish to build a generic behavior 
   * without needing to extend every actor you can do it with a trait, a good example of this may be 
   * plugging in an external collision detection library like [[https://github.com/kripken/box2d.js/|Box2D]] or 
   * [[http://wellcaffeinated.net/PhysicsJS/|PhysicsJS]] by wrapping it in a trait. Removing traits can also make your 
   * actors more efficient.
   * 
   * Default traits provided by Excalibur are [[Traits.CapturePointer|pointer capture]], 
   * [[Traits.CollisionDetection|tile map collision]], [[Traits.Movement|Euler style movement]], 
   * and [[Traits.OffscreenCulling|offscreen culling]].
   * 
   *
   * ## Known Issues
   *
   * **Actor bounding boxes do not rotate**
   * [Issue #68](https://github.com/excaliburjs/Excalibur/issues/68)
   *
   */     
  export class Actor extends ex.Class implements IActionable, IEvented {
    /**
     * Indicates the next id to be set
     */
    public static maxId = 0;
    /**
     * The unique identifier for the actor
     */
    public id: number = Actor.maxId++;
    
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
       this.body.pos = thePos;
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
       this.body.oldPos = thePos;
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
       this.body.vel = theVel;
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
       this.body.oldVel = theVel;
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
       this.body.acc = theAcc;
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
    public set rx(angularVelocity: number){
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
    public get mass(){
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
    public set restitution(theRestitution: number){
       this.body.restitution = theRestitution;
    }
    
    /**
     * The anchor to apply all actor related transformations like rotation,
     * translation, and rotation. By default the anchor is in the center of
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
     * Collision maintenance 
     */
    private _collisionContacts: CollisionContact[] = [];
    private _totalMtv: Vector = Vector.Zero.clone();

    
    /**
     * The scale vector of the actor
     */
    public scale: ex.Vector = new ex.Vector(1, 1);
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
    public isOffScreen = false;
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
    public actionQueue: ex.Internal.Actions.ActionQueue;
    
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
    

    private _collisionHandlers: {[key: string]: {(actor: Actor): void}[]; } = {};
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
    public color: Color;

    /**
     * Whether or not to enable the [[CapturePointer]] trait that propagates 
     * pointer events to this actor
     */
    public enableCapturePointer: boolean = false;

    /**
     * Configuration for [[CapturePointer]] trait
     */
    public capturePointer: Traits.ICapturePointerConfig = {
       captureMoveEvents: false
    };

    private _zIndex: number = 0;
    private _isKilled: boolean = false;
    private _opacityFx = new Effects.Opacity(this.opacity);

    /**
     * @param x       The starting x coordinate of the actor
     * @param y       The starting y coordinate of the actor
     * @param width   The starting width of the actor
     * @param height  The starting height of the actor
     * @param color   The starting color of the actor. Leave null to draw a transparent actor. The opacity of the color will be used as the
     * initial [[opacity]].
     */
    constructor(x?: number, y?: number, width?: number, height?: number, color?: Color) {
       super();
       this.pos.x = x || 0;
       this.pos.y = y || 0;
       this._width = width || 0;
       this._height = height || 0;         
       if (color) {
          this.color = color.clone();
          // set default opacity of an actor to the color
          this.opacity = color.a;  
       }         
       // Build default pipeline
       //this.traits.push(new ex.Traits.EulerMovement());
       // TODO: TileMaps should be converted to a collision area
       this.traits.push(new ex.Traits.TileMapCollisionDetection());
       this.traits.push(new ex.Traits.OffscreenCulling());         
       this.traits.push(new ex.Traits.CapturePointer());
       
       // Build the action queue
       this.actionQueue = new ex.Internal.Actions.ActionQueue(this);
       this.actions = new ActionContext(this);
       
       // default anchor is in the middle
       this.anchor = new Vector(.5, .5);
       
       // Initialize default collision area to be box
       this.body.useBoxCollision();
    }

    /**
     * This is called before the first update of the actor. This method is meant to be
     * overridden. This is where initialization of child actors should take place.
     */
    public onInitialize(engine: Engine): void {
       // Override me
    }

    private _checkForPointerOptIn(eventName: string) {
      if (eventName) {
        const normalized = eventName.toLowerCase();
        if (normalized === 'pointerup' || normalized === 'pointerdown' || normalized === 'pointermove') {
          this.enableCapturePointer = true;
          if (normalized === 'pointermove') {
            this.capturePointer.captureMoveEvents = true;
          }
        }
      }
    }
   
    public on(eventName: ex.Events.kill, handler: (event?: KillEvent) => void);
    public on(eventName: ex.Events.initialize, handler: (event?: InitializeEvent) => void);
    public on(eventName: ex.Events.preupdate, handler: (event?: PreUpdateEvent) => void);
    public on(eventName: ex.Events.postupdate, handler: (event?: PostUpdateEvent) => void);
    public on(eventName: ex.Events.predraw, handler: (event?: PreDrawEvent) => void);
    public on(eventName: ex.Events.postdraw, handler: (event?: PostDrawEvent) => void);
    public on(eventName: ex.Events.predebugdraw, handler: (event?: PreDebugDrawEvent) => void);
    public on(eventName: ex.Events.postdebugdraw, handler: (event?: PostDebugDrawEvent) => void);
    public on(eventName: ex.Events.pointerup, handler: (event?: PointerEvent) => void);
    public on(eventName: ex.Events.pointerdown, handler: (event?: PointerEvent) => void);
    public on(eventName: ex.Events.pointermove, handler: (event?: PointerEvent) => void);
    public on(eventName: ex.Events.pointercancel, handler: (event?: PointerEvent) => void);
    public on(eventName: string, handler: (event?: GameEvent) => void);
    public on(eventName: string, handler: (event?: GameEvent) => void) {
       this._checkForPointerOptIn(eventName);
       this.eventDispatcher.on(eventName, handler);
    }
   
    /**
     * If the current actor is a member of the scene, this will remove
     * it from the scene graph. It will no longer be drawn or updated.
     */
    public kill() {
       if (this.scene) {
          this.emit('kill', new ex.KillEvent(this));
          this.scene.remove(this);
          this._isKilled = true;
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
       if (ex.Util.addItemToArray(actor, this.children)) {
          actor.parent = this;
       }
    }
    /**
     * Removes a child actor from this actor. 
     * @param actor The child actor to remove
     */
    public remove(actor: Actor) {
       if (ex.Util.removeItemToArray(actor, this.children)) {
          actor.parent = null;
       }
    }
    /**
     * Sets the current drawing of the actor to the drawing corresponding to
     * the key.
     * @param key The key of the drawing
     */
    public setDrawing(key: string);
    /**
     * Sets the current drawing of the actor to the drawing corresponding to
     * an `enum` key (e.g. `Animations.Left`)
     * @param key The `enum` key of the drawing
     */
    public setDrawing(key: number);
    public setDrawing(key: any) {
      key = key.toString();
       if (this.currentDrawing !== this.frames[<string>key]) {
          if (this.frames[key] != null) {
             this.frames[key].reset();
             this.currentDrawing = this.frames[key];
          } else {
             ex.Logger.getInstance().error('the specified drawing key \'' + key + '\' does not exist');
          }
      }
    }
     
    /**
     * Add minimum translation vectors accumulated during the current frame to resolve collisions.
     */ 
    public addMtv(mtv: Vector) {
        this._totalMtv.addEqual(mtv);
    }

    /**
     * Applies the accumulated translation vectors to the actors position
     */
    public applyMtv(): void {
       this.pos.addEqual(this._totalMtv);
       this._totalMtv.setTo(0, 0);
    }
   
    /**
     * Adds a whole texture as the "default" drawing. Set a drawing using [[setDrawing]].
     */
    public addDrawing(texture: Texture);
    /**
     * Adds a whole sprite as the "default" drawing. Set a drawing using [[setDrawing]].
     */
    public addDrawing(sprite: Sprite);
    /**
     * Adds a drawing to the list of available drawings for an actor. Set a drawing using [[setDrawing]].
     * @param key     The key to associate with a drawing for this actor
     * @param drawing This can be an [[Animation]], [[Sprite]], or [[Polygon]]. 
     */
    public addDrawing(key: any, drawing: IDrawable);
    public addDrawing(args: any) {
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
    
    public set z(newZ:  number){
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
     * Calculates the unique pair hash between two actors
     * @param other
     */
    public calculatePairHash(other: Actor): string {
        if (this.id < other.id) {
           return `#${this.id}+${other.id}`;
        } else {
           return `#${other.id}+${this.id}`;
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
    public setWidth(width) {
       this._width = width / this.scale.x;
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
    public setHeight(height) {
       this._height = height / this.scale.y;
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
       var x = parents.reduceRight((px, p, i, arr) => {
          if (p.parent) {
             return px + (p.pos.x * p.getGlobalScale().x);
          }
          return px + p.pos.x;
       }, 0);

       var y = parents.reduceRight((py, p, i, arr) => {
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
    /**
     * Returns the actor's [[BoundingBox]] calculated for this instant in world space.
     */
    public getBounds() {
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
          return ex.Side.None;
       }
       if (Math.abs(separationVector.x) > Math.abs(separationVector.y)) {
          if (this.pos.x < actor.pos.x) {
             return ex.Side.Right;
          } else {
             return ex.Side.Left;
          }
       } else {
          if (this.pos.y < actor.pos.y) {
             return ex.Side.Bottom;
          } else {
             return ex.Side.Top;
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
    public getCollisionHandlers() : {[key: string]: {(actor: Actor): void}[]; } {
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
                
    private _getCalculatedAnchor(): Vector {
       return new ex.Vector(this.getWidth() * this.anchor.x, this.getHeight() * this.anchor.y);
    }

    protected _reapplyEffects(drawing: IDrawable) {
      drawing.removeEffect(this._opacityFx);
      drawing.addEffect(this._opacityFx);
    }
    
    /**
     * Perform euler integration at the specified time step
     */
    public integrate(delta: number) {
       // Update placements based on linear algebra
       var seconds = delta / 1000;

       var totalAcc = this.acc.clone();
       // Only active vanilla actors are affected by global acceleration
       if (this.collisionType === ex.CollisionType.Active &&
          !(this instanceof UIActor) &&
          !(this instanceof Trigger) &&
          !(this instanceof Label)) {
          totalAcc.addEqual(ex.Physics.acc);
       }
       
       this.vel.addEqual(totalAcc.scale(seconds));       
       this.pos.addEqual(this.vel.scale(seconds)).addEqual(totalAcc.scale(0.5 * seconds * seconds));

       this.rx += this.torque * (1.0 / this.moi) * seconds;
       this.rotation += this.rx * seconds;

       this.scale.x += this.sx * delta / 1000;
       this.scale.y += this.sy * delta / 1000;

       // Update physics body
       this.body.update();
    }

    /**
     * Called by the Engine, updates the state of the actor
     * @param engine The reference to the current game engine
     * @param delta  The time elapsed since the last update in milliseconds
     */
    public update(engine: Engine, delta: number) {
       if (!this._isInitialized) {
          this.onInitialize(engine);
          this.eventDispatcher.emit('initialize', new InitializeEvent(engine));
          this._isInitialized = true;
       }
       this.emit('preupdate', new PreUpdateEvent(engine, delta, this));
              
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

       // Run Euler integration
       this.integrate(delta);

       // Update actor pipeline (movement, collision detection, event propagation, offscreen culling)
       for (var trait of this.traits) {
          trait.update(this, engine, delta);
       }

       // Update child actors
       for (var i = 0; i < this.children.length; i++) {          
          this.children[i].update(engine, delta);          
       }
       
       // TODO: Obsolete `update` event on Actor
       this.eventDispatcher.emit('update', new PostUpdateEvent(engine, delta, this));
       this.emit('postupdate', new PostUpdateEvent(engine, delta, this));
    }
    /**
     * Called by the Engine, draws the actor to the screen
     * @param ctx   The rendering context
     * @param delta The time since the last draw in milliseconds
     */
    public draw(ctx: CanvasRenderingContext2D, delta: number) {
       ctx.save();
       ctx.translate(this.pos.x, this.pos.y);       
       ctx.scale(this.scale.x, this.scale.y);
       ctx.rotate(this.rotation);

       // translate canvas by anchor offset
       ctx.save();
       ctx.translate(-(this._width * this.anchor.x), -(this._height * this.anchor.y));

       this.emit('predraw', new PreDrawEvent(ctx, delta, this));
                    
       if (this.currentDrawing) {
          var drawing = this.currentDrawing;
          // See https://github.com/excaliburjs/Excalibur/pull/619 for discussion on this formula          
          var offsetX = (this._width - drawing.naturalWidth * drawing.scale.x) * this.anchor.x;
          var offsetY = (this._height - drawing.naturalHeight * drawing.scale.y) * this.anchor.y;

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
       
       this.emit('postdraw', new PostDrawEvent(ctx, delta, this));
       ctx.restore();
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
       var ticks = { '0 Pi': 0,
                     'Pi/2': Math.PI / 2,
                     'Pi': Math.PI,
                     '3/2 Pi': 3 * Math.PI / 2 };
       
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
     * Actors with the `Elastic` setting will behave the same as `Active`, except that they will
     * "bounce" in the opposite direction given their velocity dx/dy. This is a naive implementation meant for
     * prototyping, for a more robust elastic collision listen to the "collision" event and perform your custom logic.
     * @obsolete This behavior will be handled by a future physics system
     */
    Elastic,
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
}