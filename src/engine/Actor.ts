/// <reference path="Interfaces/IDrawable.ts" />
/// <reference path="Traits/Movement.ts" />
/// <reference path="Traits/OffscreenCulling.ts" />
/// <reference path="Traits/CapturePointer.ts" />
/// <reference path="Traits/CollisionDetection.ts" />
/// <reference path="Collision/Side.ts" />
/// <reference path="Algebra.ts" />
/// <reference path="Util/Util.ts" />
/// <reference path="TileMap.ts" />
/// <reference path="Collision/BoundingBox.ts" />
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
   * ```
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
   * passed `delta` which is the time since the last frame, which can be used
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
   *       this.triggerEvent("death");
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
   *       this.triggerEvent("death");
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
   * to manipulate the textures/animations that the actor is using.
   *
   * ### Working with Textures & Sprites
   *
   * A common usage is to use a [[Texture]] or [[Sprite]] for an actor. If you are using the [[Loader]] to
   * pre-load assets, you can simply assign an actor a [[Texture]] to draw. You can
   * also create a [[Texture.asSprite|sprite from a Texture]] to quickly create a [[Sprite]] instance.
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
   * for example, to draw complex shapes or to use the raw Canvas API.
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
   * an actor participate, you need to enable the [[CollisionDetectionModule]]
   *
   * ```ts
   * public Player extends ex.Actor {
   *   constructor() {
   *     super();
   *
   *     // enable the pipeline
   *     this.pipelines.push(new ex.CollisionDetectionModule());
   *
   *     // set preferred CollisionType
   *     this.collisionType = ex.CollisionType.Active;
   *   }
   * }
   * ```
   *
   * ### Collision Groups
   *
   * TODO, needs more information.
   *
   * ## Known Issues
   *
   * **Actor bounding boxes do not rotate**
   * [Issue #68](https://github.com/excaliburjs/Excalibur/issues/68)
   *
   * **Setting opacity when using a color doesn't do anything**
   * [Issue #364](https://github.com/excaliburjs/Excalibur/issues/364)
   *
   * **Spawning an Actor next to another sometimes causes unexpected placement**
   * [Issue #319](https://github.com/excaliburjs/Excalibur/issues/319)
   *
   * **[[Actor.contains]] doesn't work with child actors and relative coordinates**
   * [Issue #147](https://github.com/excaliburjs/Excalibur/issues/147)
   */     
  export class Actor extends ex.Class implements IActionable {
    /**
     * Indicates the next id to be set
     */
    public static maxId = 0;
    /**
     * The unique identifier for the actor
     */
    public id: number = Actor.maxId++;
    /** 
     * The x coordinate of the actor (left edge)
     */ 
    public x: number = 0;
    /** 
     * The y coordinate of the actor (top edge)
     */
    public y: number = 0;
    /**
     * The anchor to apply all actor related transformations like rotation,
     * translation, and rotation. By default the anchor is in the center of
     * the actor.
     *
     * Use `anchor.setTo` to set the anchor to a different point using
     * values between 0 and 1. For example, anchoring to the top-left would be
     * `Actor.anchor.setTo(0, 0)` and top-right would be `Actor.anchor.setTo(0, 1)`.
     */
    public anchor: Point;
    
    private _height: number = 0;
    private _width: number = 0;
    /** 
     * The rotation of the actor in radians
     */
    public rotation: number = 0; // radians
    /** 
     * The rotational velocity of the actor in radians/second
     */
    public rx: number = 0; //radions/sec
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
     * The x velocity of the actor in pixels/second
     */
    public dx: number = 0; // pixels/sec
    /** 
     * The x velocity of the actor in pixels/second
     */
    public dy: number = 0;
    /**
     * The x acceleration of the actor in pixels/second^2
     */
    public ax: number = 0; // pixels/sec/sec
    /**
     * The y acceleration of the actor in pixels/second^2
     */
    public ay: number = 0;
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
    public actions: ActionContext = new ActionContext(this);
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
    
    /**
     * Access to the current drawing for the actor, this can be 
     * an [[Animation]], [[Sprite]], or [[Polygon]]. 
     * Set drawings with [[setDrawing]].
     */
    public currentDrawing: IDrawable = null;
    public centerDrawingX = true;
    public centerDrawingY = true;

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
     * Whether or not to enable the [[CapturePointer]] trait that propogates 
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
       this.x = x || 0;
       this.y = y || 0;
       this._width = width || 0;
       this._height = height || 0;         
       if (color) {
          this.color = color.clone();
          // set default opacity of an actor to the color
          this.opacity = color.a;  
       }         
       // Build default pipeline
       this.traits.push(new ex.Traits.Movement());
       //this.pipeline.push(new ex.CollisionDetectionModule());
       this.traits.push(new ex.Traits.OffscreenCulling());         
       this.traits.push(new ex.Traits.CapturePointer());
       this.actionQueue = new ex.Internal.Actions.ActionQueue(this);
       
       this.anchor = new Point(.5, .5);
    }
    /**
     * This is called before the first update of the actor. This method is meant to be
     * overridden. This is where initialization of child actors should take place.
     */
    public onInitialize(engine: Engine): void {
       // Override me
    }

    private _checkForPointerOptIn(eventName: string) {
       if (eventName && (eventName.toLowerCase() === 'pointerdown' ||
          eventName.toLowerCase() === 'pointerdown' ||
          eventName.toLowerCase() === 'pointermove')) {
          this.enableCapturePointer = true;
          if (eventName.toLowerCase() === 'pointermove') {
             this.capturePointer.captureMoveEvents = true;
          }
       }
    }
    /**
     * Add an event listener. You can listen for a variety of
     * events off of the engine; see [[GameEvent]]
     * @param eventName  Name of the event to listen for
     * @param handler    Event handler for the thrown event
     * @obsolete Use [[on]] instead.
     */
    public addEventListener(eventName: string, handler: (event?: GameEvent) => void) {
       this._checkForPointerOptIn(eventName);
       super.addEventListener(eventName, handler);
    }
   
    /**
     * Alias for `addEventListener`. You can listen for a variety of
     * events off of the engine; see [[GameEvent]]
     * @param eventName   Name of the event to listen for
     * @param handler     Event handler for the thrown event
     */
    public on(eventName: string, handler: (event?: GameEvent) => void) {
       this._checkForPointerOptIn(eventName);
       this.eventDispatcher.subscribe(eventName, handler);
    }
   
    /**
     * If the current actor is a member of the scene, this will remove
     * it from the scene graph. It will no longer be drawn or updated.
     */
    public kill() {
       if (this.scene) {
          this.scene.remove(this);
          this._isKilled = true;
       } else {
          this.logger.warn('Cannot kill actor, it was never added to the Scene');
       }
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
    public addChild(actor: Actor) {
       actor.collisionType = CollisionType.PreventCollision;
       if (ex.Util.addItemToArray(actor, this.children)) {
          actor.parent = this;
       }
    }
    /**
     * Removes a child actor from this actor. 
     * @param actor The child actor to remove
     */
    public removeChild(actor: Actor) {
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
         this.frames[key].reset();
      }
      this.currentDrawing = this.frames[key];
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
       } else {
          if (arguments[0] instanceof Sprite) {
             this.addDrawing('default', arguments[0]);   
          }
          if (arguments[0] instanceof Texture) {
             this.addDrawing('default', arguments[0].asSprite());
          }
       }
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
     * @param actor The child actor to remove
     */
     public setZIndex(newIndex: number) {
       this.scene.cleanupDrawTree(this);
       this._zIndex = newIndex;
       this.scene.updateDrawTree(this);
    }

    /**
     * Artificially trigger an event on an actor, useful when creating custom events.
     * @param eventName   The name of the event to trigger
     * @param event       The event object to pass to the callback
     *
     * @obsolete  Will be replaced with `emit`
     */
    public triggerEvent(eventName: string, event?: GameEvent) {
       this.eventDispatcher.publish(eventName, event);
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
       return new Vector(this.x + this.getWidth() / 2 - this.anchor.x * this.getWidth(), 
                         this.y + this.getHeight() / 2 - this.anchor.y * this.getHeight());
    }
    /**
     * Gets the calculated width of an actor, factoring in scale
     */
    public getWidth() {
       return this._width * this.scale.x;
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
       return this._height * this.scale.y;
    }
    /**
     * Sets the height of an actor, factoring in the current scale
     */
    public setHeight(height) {
       this._height = height / this.scale.y;
    }
    /**
     * Centers the actor's drawing around the center of the actor's bounding box
     * @param center Indicates to center the drawing around the actor
     */       
    public setCenterDrawing(center: boolean) {
       this.centerDrawingY = center;
       this.centerDrawingX = center;
    }
    /**
     * Gets the left edge of the actor
     */
    public getLeft() {
       return this.x;
    }
    /**
     * Gets the right edge of the actor
     */
    public getRight() {
       return this.x + this.getWidth();
    }
    /**
     * Gets the top edge of the actor
     */
    public getTop() {
       return this.y;
    }
    /**
     * Gets the bottom edge of the actor
     */
    public getBottom() {
       return this.y + this.getHeight();
    }
    /**
     * Gets the x value of the Actor in global coordinates
     */
    public getWorldX() {
       if (!this.parent) {
           return this.x;
       }
       return this.x * this.parent.scale.x + this.parent.getWorldX();
    }
    /**
     * Gets the y value of the Actor in global coordinates
     */
    public getWorldY() {
      if (!this.parent) {
          return this.y;
      }
      return this.y * this.parent.scale.y + this.parent.getWorldY();
    }
    /**
     * Gets the global scale of the Actor
     */
     public getGlobalScale() {
       if (!this.parent) {
          return new Point(this.scale.x, this.scale.y);
       }

       var parentScale = this.parent.getGlobalScale();
       return new Point(this.scale.x * parentScale.x, this.scale.y * parentScale.y);
     }
    /**
     * Returns the actor's [[BoundingBox]] calculated for this instant.
     */
    public getBounds() {
       var anchor = this._getCalculatedAnchor();
       return new BoundingBox(this.getWorldX() - anchor.x,
          this.getWorldY() - anchor.y,
          this.getWorldX() + this.getWidth() - anchor.x,
          this.getWorldY() + this.getHeight() - anchor.y);
    }
    /**
     * Tests whether the x/y specified are contained in the actor
     * @param x  X coordinate to test (in world coordinates)
     * @param y  Y coordinate to test (in world coordinates)
     * @param recurse checks whether the x/y are contained in any child actors (if they exist).
     */
    public contains(x: number, y: number, recurse: boolean = false): boolean {
       var containment = this.getBounds().contains(new Point(x, y));
       
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
          if (this.x < actor.x) {
             return ex.Side.Right;
          } else {
             return ex.Side.Left;
          }
       } else {
          if (this.y < actor.y) {
             return ex.Side.Bottom;
          } else {
             return ex.Side.Top;
          }
       }
       return ex.Side.None;
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
       return Math.sqrt(Math.pow(this.x - actor.x, 2) + Math.pow(this.y - actor.y, 2)) <= distance;
    }      
    /**
     * Clears all queued actions from the Actor
     */
    public clearActions(): void {
       this.actionQueue.clearActions();
    }
    /**
     * This method will move an actor to the specified `x` and `y` position over the 
     * specified duration using a given [[EasingFunctions]] and return back the actor. This 
     * method is part of the actor 'Action' fluent API allowing action chaining.
     * @param x         The x location to move the actor to
     * @param y         The y location to move the actor to
     * @param duration  The time it should take the actor to move to the new location in milliseconds
     * @param easingFcn Use [[EasingFunctions]] or a custom function to use to calculate position
     */
    public easeTo(x: number,
       y: number,
       duration: number,
       easingFcn: (currentTime: number, startValue: number, endValue: number, duration: number) => number = ex.EasingFunctions.Linear) {
       this.actionQueue.add(new ex.Internal.Actions.EaseTo(this, x, y, duration, easingFcn));
       return this;
    }
    /**
     * This method will move an actor to the specified `x` and `y` position at the 
     * `speed` specified (in pixels per second) and return back the actor. This 
     * method is part of the actor 'Action' fluent API allowing action chaining.
     * @param x       The x location to move the actor to
     * @param y       The y location to move the actor to
     * @param speed   The speed in pixels per second to move
     */
    public moveTo(x: number, y: number, speed: number): Actor {
       this.actionQueue.add(new ex.Internal.Actions.MoveTo(this, x, y, speed));
       return this;
    }
    /**
     * This method will move an actor to the specified `x` and `y` position by a 
     * certain `duration` (in milliseconds). This method is part of the actor 
     * 'Action' fluent API allowing action chaining.
     * @param x         The x location to move the actor to
     * @param y         The y location to move the actor to
     * @param duration  The time it should take the actor to move to the new location in milliseconds
     */
    public moveBy(x: number, y: number, duration: number): Actor {
       this.actionQueue.add(new ex.Internal.Actions.MoveBy(this, x, y, duration));
       return this;
    }
    /**
     * This method will rotate an actor to the specified angle (in radians) at the `speed`
     * specified (in radians per second) and return back the actor. This 
     * method is part of the actor 'Action' fluent API allowing action chaining.
     * @param angleRadians  The angle to rotate to in radians
     * @param speed         The angular velocity of the rotation specified in radians per second
     */
    public rotateTo(angleRadians: number, speed: number, rotationType?): Actor {
       this.actionQueue.add(new ex.Internal.Actions.RotateTo(this, angleRadians, speed, rotationType));
       return this;
    }
    /**
     * This method will rotate an actor to the specified angle by a certain
     * `duration` (in milliseconds) and return back the actor. This method is part
     * of the actor 'Action' fluent API allowing action chaining.
     * @param angleRadians  The angle to rotate to in radians
     * @param duration          The time it should take the actor to complete the rotation in milliseconds
     */
    public rotateBy(angleRadians: number, duration: number): Actor {
       this.actionQueue.add(new ex.Internal.Actions.RotateBy(this, angleRadians, duration));
       return this;
    }
    /**
     * This method will scale an actor to the specified size at the speed
     * specified (in magnitude increase per second) and return back the 
     * actor. This method is part of the actor 'Action' fluent API allowing 
     * action chaining.
     * @param sizeX  The scaling factor in the x direction to apply
     * @param sizeY  The scaling factor in the y direction to apply
     * @param speedX The speed of scaling in the x direction specified in magnitude increase per second
     * @param speedY The speed of scaling in the y direction specified in magnitude increase per second
     */
    public scaleTo(sizeX: number, sizeY: number, speedX: number, speedY: number): Actor {
       this.actionQueue.add(new ex.Internal.Actions.ScaleTo(this, sizeX, sizeY, speedX, speedY));
       return this;
    }
    /**
     * This method will scale an actor to the specified size by a certain duration
     * (in milliseconds) and return back the actor. This method is part of the
     * actor 'Action' fluent API allowing action chaining.
     * @param sizeX     The scaling factor in the x direction to apply
     * @param sizeY     The scaling factor in the y direction to apply
     * @param duration  The time it should take to complete the scaling in milliseconds
     */
    public scaleBy(sizeX: number, sizeY: number, duration: number): Actor {
       this.actionQueue.add(new ex.Internal.Actions.ScaleBy(this, sizeX, sizeY, duration));
       return this;
    }
    /**
     * This method will cause an actor to blink (become visible and not 
     * visible). Optionally, you may specify the number of blinks. Specify the amount of time 
     * the actor should be visible per blink, and the amount of time not visible.
     * This method is part of the actor 'Action' fluent API allowing action chaining.
     * @param timeVisible     The amount of time to stay visible per blink in milliseconds
     * @param timeNotVisible  The amount of time to stay not visible per blink in milliseconds
     * @param numBlinks       The number of times to blink
     */
    public blink(timeVisible: number, timeNotVisible: number, numBlinks: number = 1): Actor {
       this.actionQueue.add(new ex.Internal.Actions.Blink(this, timeVisible, timeNotVisible, numBlinks));
       return this;
    }
    /**
     * This method will cause an actor's opacity to change from its current value
     * to the provided value by a specified `duration` (in milliseconds). This method is
     * part of the actor 'Action' fluent API allowing action chaining.
     * @param opacity   The ending opacity
     * @param duration  The time it should take to fade the actor (in milliseconds)
     */
    public fade(opacity: number, duration: number): Actor {
       this.actionQueue.add(new ex.Internal.Actions.Fade(this, opacity, duration));
       return this;
    }
    /**
     * This method will delay the next action from executing for the specified
     * `duration` (in milliseconds). This method is part of the actor 
     * 'Action' fluent API allowing action chaining.
     * @param duration The amount of time to delay the next action in the queue from executing in milliseconds
     */
    public delay(duration: number): Actor {
       this.actionQueue.add(new ex.Internal.Actions.Delay(this, duration));
       return this;
    }
    /**
     * This method will add an action to the queue that will remove the actor from the 
     * scene once it has completed its previous actions. Any actions on the
     * action queue after this action will not be executed.
     */
    public die(): Actor {
       this.actionQueue.add(new ex.Internal.Actions.Die(this));
       return this;
    }
    /**
     * This method allows you to call an arbitrary method as the next action in the
     * action queue. This is useful if you want to execute code in after a specific
     * action, i.e An actor arrives at a destination after traversing a path
     */
    public callMethod(method: () => any): Actor {
       this.actionQueue.add(new ex.Internal.Actions.CallMethod(this, method));
       return this;
    }
    /**
     * This method will cause the actor to repeat all of the previously 
     * called actions a certain number of times. If the number of repeats 
     * is not specified it will repeat forever. This method is part of 
     * the actor 'Action' fluent API allowing action chaining
     * @param times The number of times to repeat all the previous actions in the action queue. If nothing is specified the actions will 
     * repeat forever
     */
    public repeat(times?: number): Actor {
       if (!times) {
          this.repeatForever();
          return this;
       }
       this.actionQueue.add(new ex.Internal.Actions.Repeat(this, times, this.actionQueue.getActions()));
       return this;
    }
    /**
     * This method will cause the actor to repeat all of the previously 
     * called actions forever. This method is part of the actor 'Action'
     * fluent API allowing action chaining.
     */
    public repeatForever(): Actor {
       this.actionQueue.add(new ex.Internal.Actions.RepeatForever(this, this.actionQueue.getActions()));
       return this;
    }
    /**
     * This method will cause the actor to follow another at a specified distance
     * @param actor           The actor to follow
     * @param followDistance  The distance to maintain when following, if not specified the actor will follow at the current distance.
     */
    public follow(actor : Actor, followDistance? : number) : Actor {
      if (typeof followDistance === 'undefined') {
            this.actionQueue.add(new ex.Internal.Actions.Follow(this, actor));
         } else {
            this.actionQueue.add(new ex.Internal.Actions.Follow(this, actor, followDistance));
         }
      return this;
    }
    /**
     * This method will cause the actor to move towards another Actor until they 
     * collide ("meet") at a specified speed.
     * @param actor  The actor to meet
     * @param speed  The speed in pixels per second to move, if not specified it will match the speed of the other actor
     */
    public meet(actor: Actor, speed? : number) : Actor {
       if (typeof speed === 'undefined') {
             this.actionQueue.add(new ex.Internal.Actions.Meet(this, actor));
          } else {
             this.actionQueue.add(new ex.Internal.Actions.Meet(this, actor, speed));
          }
       return this;
    }
    /**
     * Returns a promise that resolves when the current action queue up to now
     * is finished.
     */
    public asPromise<T>() : Promise<T> {
       var complete = new Promise<T>();
       this.callMethod(() => {
          complete.resolve();
       });
       return complete;
    }
    private _getCalculatedAnchor(): Point {
       return new ex.Point(this.getWidth() * this.anchor.x, this.getHeight() * this.anchor.y);
    }
    /**
     * Called by the Engine, updates the state of the actor
     * @param engine The reference to the current game engine
     * @param delta  The time elapsed since the last update in milliseconds
     */
    public update(engine: Engine, delta: number) {
       if (!this._isInitialized) {
          this.onInitialize(engine);
          this.eventDispatcher.publish('initialize', new InitializeEvent(engine));
          this._isInitialized = true;
       }
       
       var eventDispatcher = this.eventDispatcher;
       // Update action queue
       this.actionQueue.update(delta);
       // Update actor pipeline (movement, collision detection, event propagation, offscreen culling)
       for (var i = 0; i < this.traits.length; i++) {
          this.traits[i].update(this, engine, delta);
       }
       eventDispatcher.publish(EventType[EventType.Update], new UpdateEvent(delta));
    }
    /**
     * Called by the Engine, draws the actor to the screen
     * @param ctx   The rendering context
     * @param delta The time since the last draw in milliseconds
     */
    public draw(ctx: CanvasRenderingContext2D, delta: number) {
       var anchorPoint = this._getCalculatedAnchor();
       ctx.save();
       ctx.scale(this.scale.x, this.scale.y);
       ctx.translate(this.x, this.y);
       ctx.rotate(this.rotation);     
       
       
       // calculate changing opacity
       if (this.previousOpacity !== this.opacity) {
          for (var drawing in this.frames) {
             this.frames[drawing].addEffect(new ex.Effects.Opacity(this.opacity));
          }
          this.previousOpacity = this.opacity;
       }
       if (this.currentDrawing) {
          var xDiff = 0;
          var yDiff = 0;
          
          if (this.centerDrawingX) {
             xDiff = (this.currentDrawing.width * this.currentDrawing.scale.x - this.getWidth()) / 2 -
             this.currentDrawing.width * this.currentDrawing.scale.x * this.currentDrawing.anchor.x;
          }
          if (this.centerDrawingY) {
             yDiff = (this.currentDrawing.height * this.currentDrawing.scale.y - this.getHeight()) / 2 -
             this.currentDrawing.height * this.currentDrawing.scale.y * this.currentDrawing.anchor.y;
          }
          this.currentDrawing.draw(ctx, -anchorPoint.x - xDiff, -anchorPoint.y - yDiff);
       } else {
          if (this.color) {
             ctx.fillStyle = this.color.toString();
             ctx.fillRect(-anchorPoint.x, -anchorPoint.y, this._width, this._height);
          } 
       }
       // Draw child actors
       for (var i = 0; i < this.children.length; i++) {
          this.children[i].draw(ctx, delta);
       }
       ctx.restore();
    }
    /**
     * Called by the Engine, draws the actors debugging to the screen
     * @param ctx The rendering context
     */
    public debugDraw(ctx: CanvasRenderingContext2D) {
      
       var bb = this.getBounds();
       bb.debugDraw(ctx);
       ctx.fillText('id: ' + this.id, bb.left + 3, bb.top + 10);
       
       ctx.fillStyle = Color.Yellow.toString();
       ctx.beginPath();
       ctx.arc(this.getWorldX(), this.getWorldY(), 3, 0, Math.PI * 2);
       ctx.closePath();
       ctx.fill();

       // Culling Box debug draw
       for (var j = 0; j < this.traits.length; j++) {
          if (this.traits[j] instanceof Traits.OffscreenCulling) {
             (<Traits.OffscreenCulling>this.traits[j]).cullingBox.debugDraw(ctx);
          }
       }

       ctx.save();
       ctx.translate(this.x, this.y);
       ctx.rotate(this.rotation);
       // Draw child actors
       for (var i = 0; i < this.children.length; i++) {
          this.children[i].debugDraw(ctx);
       }
       ctx.restore();
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