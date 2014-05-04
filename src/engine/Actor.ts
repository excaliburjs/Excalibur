/// <reference path="Interfaces/IDrawable.ts" />
/// <reference path="Algebra.ts" />
/// <reference path="Util.ts" />
/// <reference path="TileMap.ts" />
/// <reference path="BoundingBox.ts" />
/// <reference path="Scene.ts" />
/// <reference path="Action.ts" />

module ex {
   export class Overlap {
      constructor(public x: number, public y: number) { }
   }

   

   /**
    * An enum that describes the sides of an Actor for collision
    * @class Side
    */
   export enum Side {
      /**
      @property None {Side}
      @static
      @final
      */
      None,
      /**
      @property Top {Side}
      @static
      @final
      */
      Top,
      /**
      @property Bottom {Side}
      @static
      @final
      */
      Bottom,
      /**
      @property Left {Side}
      @static
      @final
      */
      Left,
      /**
      @property Right {Side}
      @static
      @final
      */
      Right
   }

   /**
    * An enum that describes the types of collisions actors can participate in
    * @class CollisionType
    */
    export enum CollisionType {
      /**
       * Actors with the PreventCollision setting do not participate in any
       * collisions and do not raise collision events.
       * @property PreventCollision {CollisionType}
       * @static
       */
      PreventCollision,
      /**
       * Actors with the Passive setting only raise collision events, but are not
       * influenced or moved by other actors and do not influence or move other actors.
       * @property Passive {CollisionType}
       * @static
       */
      Passive,
      /**
       * Actors with the Active setting raise collision events and participate
       * in collisions with other actors and will be push or moved by actors sharing
       * the Active or Fixed setting.
       * @property Active {CollisionType}
       * @static
       */
      Active,

      /**
       * Actors with the Elastic setting will behave the same as Active, except that they will
       * "bounce" in the opposite direction given their velocity dx/dy. This is a naive implementation meant for
       * prototyping, for a more robust elastic collision listen to the "collision" event and perform your custom logic.
       * @property Elastic {CollisionType}
       * @static
       */
      Elastic,
      /**
       * Actors with the Fixed setting raise collision events and participate in
       * collisions with other actors. Actors with the Fixed setting will not be
       * pushed or moved by other actors sharing the Fixed or Actors. Think of Fixed
       * actors as "immovable/onstoppable" objects. If two Fixed actors meet they will
       * not be pushed or moved by each other, they will not interact except to throw
       * collision events.
       * @property Fixed {CollisionType}
       * @static
       */
      Fixed
    }


   /**
    * The most important primitive in Excalibur is an "Actor." Anything that
    * can move on the screen, collide with another Actor, respond to events, 
    * or interact with the current scene, must be an actor. An Actor <b>must</b>
    * be part of a {{#crossLink "Scene"}}{{/crossLink}} for it to be drawn to the screen.
    * @class Actor
    * @extends Class
    * @constructor
    * @param [x=0.0] {number} The starting x coordinate of the actor
    * @param [y=0.0] {number} The starting y coordinate of the actor
    * @param [width=0.0] {number} The starting width of the actor
    * @param [height=0.0] {number} The starting height of the actor
    * @param [color=undefined] {Color} The starting color of the actor
    */     
   export class Actor extends ex.Class {
      /** 
       * The x coordinate of the actor (left edge)
       * @property x {number} 
       */ 
      public x: number = 0;
      /** 
       * The y coordinate of the actor (top edge)
       * @property y {number} 
       */
      public y: number = 0;

      private height: number = 0;
      private width: number = 0;

      /** 
       * The rotation of the actor in radians
       * @property rotation {number} 
       */
      public rotation: number = 0; // radians
      /** 
       * The rotational velocity of the actor in radians/second
       * @property rx {number} 
       */
      public rx: number = 0; //radions/sec
      /** 
       * The x scale of the actor
       * @property scaleX {number} 
       */
      public scaleX: number = 1;
      /**
       * The y scale of the actor
       * @property scaleY {number}
       */
      public scaleY: number = 1;
      /** 
       * The x scalar velocity of the actor in scale/second
       * @property sx {number} 
       */
      public sx: number = 0; //scale/sec
      /** 
       * The y scalar velocity of the actor in scale/second
       * @property sy {number} 
       */
      public sy: number = 0; //scale/sec
      /** 
       * The x velocity of the actor in pixels/second
       * @property dx {number} 
       */
      public dx: number = 0; // pixels/sec
      /** 
       * The x velocity of the actor in pixels/second
       * @property dx {number} 
       */
      public dy: number = 0;

      /**
       * The x acceleration of the actor in pixels/second^2
       * @property ax {number}
       */
      public ax: number = 0; // pixels/sec/sec
      /**
       * The y acceleration of the actor in pixels/second^2
       * @property ay {number}
       */
      public ay: number = 0;

      /**
       * Indicates wether the actor is physically in the viewport
       * @property isOffScreen {boolean}
       */
      public isOffScreen = false;

      /** 
       * The visibility of an actor
       * @property invisible {boolean} 
       */
      public invisible: boolean = false;

      /**
       * The opacity of an actor
       * @property opacity {number}
       */
      public opacity: number = 1;
      public previousOpacity: number = 1;

      /** 
       * Direct access to the actor's action queue. Useful if you are building custom actions.
       * @property actionQueue {ActionQueue} 
       */
      public actionQueue: ex.Internal.Actions.ActionQueue;

      private sceneNode: Scene; //the scene that the actor contains

      /**
       * Convenience reference to the global logger
       * @property logger {Logger}
       */
      public logger: Logger = Logger.getInstance();

      /**
      * The scene that the actor is in
      * @property scene {Scene}
      */
      public scene: Scene = null; //formerly "parent"

      /**
      * The parent of this actor
      * @property parent {Actor}
      */
      public parent: Actor = null;

      /**
       * Gets or sets the current collision type of this actor. By 
       * default all actors participate in Active collisions.
       * @property collisionType {CollisionType}
       */
      public collisionType : CollisionType = CollisionType.Active;
      public collisionGroups : string[] = [];

      private _collisionHandlers: {[key: string]: {(actor: Actor):void}[];} = {};
      private _isInitialized : boolean = false;

      public frames: { [key: string]: IDrawable; } = {}
      
      /**
       * Access to the current drawing on for the actor, this can be an {{#crossLink "Animation"}}{{/crossLink}}, 
       * {{#crossLink "Sprite"}}{{/crossLink}}, or {{#crossLink "Polygon"}}{{/crossLink}}. 
       * Set drawings with the {{#crossLink "Actor/setDrawing:method"}}{{/crossLink}}.
       * @property currentDrawing {IDrawable}
       */
      public currentDrawing: IDrawable = null;

      private centerDrawingX = false;
      private centerDrawingY = false;
      
      /**
       * Sets the color of the actor. A rectangle of this color will be drawn if now IDrawable is specified as the actors drawing.
       * @property color {Color}
       */
      public color: Color;

      private _isKilled: boolean = false;
       
      constructor(x?: number, y?: number, width?: number, height?: number, color?: Color) {
         super();
         this.x = x || 0;
         this.y = y || 0;
         this.width = width || 0;
         this.height = height || 0;
         this.color = color;
         this.actionQueue = new ex.Internal.Actions.ActionQueue(this);
         this.sceneNode = new Scene();
         this.sceneNode.actor = this;
      }

      /**
       * This is called before the first update of the actor. This method is meant to be
       * overridden. This is where initialization of child actors should take place.
       * @method onInitialize
       * @param engine {Engine}
       */
      public onInitialize(engine: Engine): void {
         // will be overridden
      }

      /**
       * If the current actors is a member of the scene. This will remove
       * it from the scene graph. It will no longer be drawn or updated.
       * @method kill
       */
      public kill() {
         if (this.scene) {
            this.scene.removeChild(this);
            this._isKilled = true;
         } else {
            this.logger.warn("Cannot kill actor, it was never added to the Scene");
         }
      }
      /**
       * Adds a child actor to this actor. All movement of the child actor will be
       * relative to the parent actor. Meaning if the parent moves the child will
       * move with
       * @method addChild
       * @param actor {Actor} The child actor to add
       */
      public addChild(actor: Actor) {
         actor.collisionType = CollisionType.PreventCollision;
         this.sceneNode.addChild(actor);
      }

      /**
       * Removes a child actor from this actor. 
       * @method removeChild
       * @param actor {Actor} The child actor to remove
       */
      public removeChild(actor: Actor) {
         this.sceneNode.removeChild(actor);
      }

      /**
       * Sets the current drawing of the actor to the drawing correspoding to
       * the key.
       * @method setDrawing 
       * @param key {string} The key of the drawing
       */
      public setDrawing(key) {

         if (this.currentDrawing != this.frames[<string>key]) {
            this.frames[<string>key].reset();
         }
         this.currentDrawing = this.frames[<string>key];
      }

      /**
       * Adds a drawing to the list of available drawings for an actor.
       * @method addDrawing
       * @param key {string} The key to associate with a drawing for this actor
       * @param drawing {IDrawable} this can be an {{#crossLink "Animation"}}{{/crossLink}}, 
       * {{#crossLink "Sprite"}}{{/crossLink}}, or {{#crossLink "Polygon"}}{{/crossLink}}. 
       */
      public addDrawing(key: any, drawing: IDrawable) {
         this.frames[<string>key] = drawing;
         if (!this.currentDrawing) {
            this.currentDrawing = drawing;
         }
      }

      /**
       * Artificially trigger an event on an actor, useful when creating custom events.
       * @method triggerEvent
       * @param eventName {string} The name of the event to trigger
       * @param [event=undefined] {GameEvent} The event object to pass to the callback
       */
      public triggerEvent(eventName: string, event?: GameEvent) {
         this.eventDispatcher.publish(eventName, event);
      }

      /** 
       * Adds an actor to a collision group. Actors with no named collision group are
       * considered to be in every collision group.
       *
       * Once in a collision group(s) actors will only collide with other actors in 
       * that group.
       *
       * @method addCollisionGroup
       * @param name {string} The name of the collision group
       */
      public addCollisionGroup(name: string){
         this.collisionGroups.push(name);
      }

      /**
       * Remove an actor from a collision group.
       * @method removeCollisionGroup
       * @param name {string} The name of the collision group
       */
      public removeCollisionGroup(name: string){
         var index = this.collisionGroups.indexOf(name);
         if(index !== -1){
            this.collisionGroups.splice(index, 1);
         }
      }
 
      /**
       * Get the center point of an actor
       * @method getCenter
       * @returns Vector
       */
      public getCenter(): Vector {
         return new Vector(this.x + this.getWidth() / 2, this.y + this.getHeight() / 2);
      }

      /**
       * Gets the calculated width of an actor
       * @method getWidth
       * @returns number
       */
      public getWidth() {
         return this.width * this.scaleX;
      }

      /**
       * Sets the width of an actor, factoring in the current scale
       * @method setWidth
       */
      public setWidth(width) {
         this.width = width / this.scaleX;
      }

      /**
       * Gets the calculated height of an actor
       * @method getHeight
       * @returns number
       */
      public getHeight() {
         return this.height * this.scaleY;
      }

      /**
       * Sets the height of an actor, factoring in the current scale
       * @method setHeight
       */
      public setHeight(height) {
         this.height = height / this.scaleY;
      }

      /**
       * Centers the actor's drawing around the center of the actor's bounding box
       * @method setCenterDrawing
       * @param center {boolean} Indicates to center the drawing around the actor
       */       
      public setCenterDrawing(center: boolean) {
         this.centerDrawingY = true;
         this.centerDrawingX = true;
      }

      /**
       * Gets the left edge of the actor
       * @method getLeft
       * @returns number
       */
      public getLeft() {
         return this.x;
      }

      /**
       * Gets the right edge of the actor
       * @method getRight
       * @returns number
       */
      public getRight() {
         return this.x + this.getWidth();
      }

      /**
       * Gets the top edge of the actor
       * @method getTop
       * @returns number
       */
      public getTop() {
         return this.y;
      }

      /**
       * Gets the bottom edge of the actor
       * @method getBottom
       * @returns number
       */
      public getBottom() {
         return this.y + this.getHeight();
      }

      /**
      * Gets the x value of the Actor in global coordinates
      * @method getGlobalX
      * @returns number
      */
      public getGlobalX() {
         var previous;
         var current = this.parent;
         while (current) {
            previous = current;
            current = current.parent;
         }
         if (previous) {
            return this.x + previous.x;
            } else {
               return this.x;
            }
      }

      /**
      * Gets the y value of the Actor in global coordinates
      * @method getGlobalY
      * @returns number
      */
      public getGlobalY() {
         var previous;
         var current = this.parent;
         while (current) {
            previous = current;
            current = current.parent;
         }
         if (previous) {
            return this.y + previous.y;
            } else {
               return this.y;
            }
      }

      /**
       * Returns the actor's bounding box calculated for this instant.
       * @method getBounds
       * @returns BoundingBox
       */
      public getBounds(){
         return new BoundingBox(this.getGlobalX(), this.getGlobalY(), this.getGlobalX() + this.getWidth(), this.getGlobalY() + this.getHeight());
      }

      /**
       * Tests whether the x/y specified are contained in the actor
       * @method contains
       * @param x {number} X coordinate to test (in world coordinates)
       * @param y {number} Y coordinate to test (in world coordinates)
       */
      public contains(x: number, y: number): boolean {
         return this.getBounds().contains(new Point(x, y));
      }

      /**
       * Returns the side of the collision based on the intersection 
       * @method getSideFromIntersect
       * @param intersect {Vector} The displacement vector returned by a collision
       * @returns Side
      */
      public getSideFromIntersect(intersect: Vector){
         if(intersect){
            if(Math.abs(intersect.x) > Math.abs(intersect.y)){
                if (intersect.x < 0) {
                    return Side.Right;
                }
                return Side.Left;
            }else{
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
       * @method collides
       * @param actor {Actor} The other actor to test
       * @returns Side
       */
     public collidesWithSide(actor: Actor): Side {
         var separationVector = this.collides(actor);
         if(!separationVector){
            return ex.Side.None;
         }

         if(Math.abs(separationVector.x) > Math.abs(separationVector.y)){
            if(this.x < actor.x){
               return ex.Side.Right;
            }else{
               return ex.Side.Left;
            }
         }else{
            if(this.y < actor.y){
               return ex.Side.Bottom;
            }else{
               return ex.Side.Top;
            }
         }

         return ex.Side.None;
      }


      /**
       * Test whether the actor has collided with another actor, returns the intersection vector on collision. Returns
       * null when there is no collision;
       * @method collides
       * @param actor {Actor} The other actor to test
       * @returns Vector
       */
      public collides(actor: Actor): Vector {   
         var bounds = this.getBounds();
         var otherBounds = actor.getBounds();

         var intersect = bounds.collides(otherBounds);
         return intersect
      }

      /**
       * Register a handler to fire when this actor collides with another in a specified group
       * @method onCollidesWith
       * @param group {string} The group name to listen for
       * @param func {callback} The callback to fire on collision with another actor from the group. The callback is passed the other actor.
       */
      public onCollidesWith(group: string, func: (actor: Actor)=>void){
         if(!this._collisionHandlers[group]){
            this._collisionHandlers[group] = [];
         }
         this._collisionHandlers[group].push(func);
      }

      /**
       * Removes all collision handlers for this group on this actor
       * @method removeCollidesWith
       * @param group {string} Group to remove all handlers for on this actor.
       */
      public removeCollidesWith(group: string){
         this._collisionHandlers[group] = [];         
      }


      /**
       * Returns true if the two actors are less than or equal to the distance specified from each other
       * @method within
       * @param actor {Actor} Actor to test
       * @param distance {number} Distance in pixels to test
       * @returns boolean
       */
      public within(actor: Actor, distance: number): boolean {
         return Math.sqrt(Math.pow(this.x - actor.x, 2) + Math.pow(this.y - actor.y, 2)) <= distance;
      }      

      /**
       * Clears all queued actions from the Actor
       * @method clearActions
       */
      public clearActions(): void {
         this.actionQueue.clearActions();
      }

      /**
       * This method will move an actor to the specified x and y position at the 
       * speed specified (in pixels per second) and return back the actor. This 
       * method is part of the actor 'Action' fluent API allowing action chaining.
       * @method moveTo
       * @param x {number} The x location to move the actor to
       * @param y {number} The y location to move the actor to
       * @param speed {number} The speed in pixels per second to move
       * @returns Actor
       */
      public moveTo(x: number, y: number, speed: number): Actor {
         this.actionQueue.add(new ex.Internal.Actions.MoveTo(this, x, y, speed));
         return this;
      }

      /**
       * This method will move an actor to the specified x and y position by a 
       * certain time (in milliseconds). This method is part of the actor 
       * 'Action' fluent API allowing action chaining.
       * @method moveBy
       * @param x {number} The x location to move the actor to
       * @param y {number} The y location to move the actor to
       * @param time {number} The time it should take the actor to move to the new location in milliseconds
       * @returns Actor
       */
      public moveBy(x: number, y: number, time: number): Actor {
         this.actionQueue.add(new ex.Internal.Actions.MoveBy(this, x, y, time));
         return this;
      }

      /**
       * This method will rotate an actor to the specified angle at the speed
       * specified (in radians per second) and return back the actor. This 
       * method is part of the actor 'Action' fluent API allowing action chaining.
       * @method rotateTo
       * @param angleRadians {number} The angle to rotate to in radians
       * @param speed {number} The angular velocity of the rotation specified in radians per second
       * @returns Actor
       */
      public rotateTo(angleRadians: number, speed: number): Actor {
         this.actionQueue.add(new ex.Internal.Actions.RotateTo(this, angleRadians, speed));
         return this;
      }

      /**
       * This method will rotate an actor to the specified angle by a certain
       * time (in milliseconds) and return back the actor. This method is part
       * of the actor 'Action' fluent API allowing action chaining.
       * @method rotateBy
       * @param angleRadians {number} The angle to rotate to in radians
       * @param time {number} The time it should take the actor to complete the rotation in milliseconds
       * @returns Actor
       */
      public rotateBy(angleRadians: number, time: number): Actor {
         this.actionQueue.add(new ex.Internal.Actions.RotateBy(this, angleRadians, time));
         return this;
      }

      /**
       * This method will scale an actor to the specified size at the speed
       * specified (in magnitude increase per second) and return back the 
       * actor. This method is part of the actor 'Action' fluent API allowing 
       * action chaining.
       * @method scaleTo
       * @param size {number} The scaling factor to apply
       * @param speed {number} The speed of scaling specified in magnitude increase per second
       * @returns Actor
       */
      public scaleTo(sizeX: number, sizeY: number, speedX: number, speedY: number): Actor {
         this.actionQueue.add(new ex.Internal.Actions.ScaleTo(this, sizeX, sizeY, speedX, speedY));
         return this;
      }

      /**
       * This method will scale an actor to the specified size by a certain time
       * (in milliseconds) and return back the actor. This method is part of the
       * actor 'Action' fluent API allowing action chaining.
       * @method scaleBy
       * @param size {number} The scaling factor to apply
       * @param time {number} The time it should take to complete the scaling in milliseconds
       * @returns Actor
       */
      public scaleBy(sizeX: number, sizeY: number, time: number): Actor {
         this.actionQueue.add(new ex.Internal.Actions.ScaleBy(this, sizeX, sizeY, time));
         return this;
      }

      /**
       * This method will cause an actor to blink (become visible and and 
       * invisible) at a frequency (blinks per second) for a duration (in
       * milliseconds). Optionally, you may specify blinkTime, which indicates
       * the amount of time the actor is invisible during each blink.<br/>
       * To have the actor blink 3 times in 1 second, call actor.blink(3, 1000).<br/>
       * This method is part of the actor 'Action' fluent API allowing action chaining.
       * @method blink
       * @param frequency {number} The blinks per second 
       * @param duration {number} The total duration of the blinking specified in milliseconds
       * @param [blinkTime=200] {number} The amount of time each blink that the actor is visible in milliseconds
       * @returns Actor
       */
      public blink(frequency: number, duration: number, blinkTime?: number): Actor {
         this.actionQueue.add(new ex.Internal.Actions.Blink(this, frequency, duration, blinkTime));
         return this;
      }

      /**
       * This method will cause an actor's opacity to change from its current value
       * to the provided value by a specified time (in milliseconds). This method is
       * part of the actor 'Action' fluent API allowing action chaining.
       * @method fade
       * @param opacity {number} The ending opacity
       * @param time {number} The time it should take to fade the actor (in milliseconds)
       * @returns Actor
       */
      public fade(opacity: number, time: number): Actor {
         this.actionQueue.add(new ex.Internal.Actions.Fade(this, opacity, time));
         return this;
      }

      /**
       * This method will delay the next action from executing for a certain 
       * amount of time (in milliseconds). This method is part of the actor 
       * 'Action' fluent API allowing action chaining.
       * @method delay
       * @param time {number} The amount of time to delay the next action in the queue from executing in milliseconds
       * @returns Actor
       */
      public delay(time: number): Actor {
         this.actionQueue.add(new ex.Internal.Actions.Delay(this, time));
         return this;
      }

      /**
       * This method will add an action to the queue that will remove the actor from the 
       * scene once it has completed its previous actions. Any actions on the
       * action queue after this action will not be executed.
       * @method die
       * @returns Actor
       */
      public die(): Actor {
         this.actionQueue.add(new ex.Internal.Actions.Die(this));
         return this;
      }

      /**
       * This method allows you to call an arbitrary method as the next action in the
       * action queue. This is useful if you want to execute code in after a specific
       * action, i.e An actor arrives at a destinatino after traversing a path
       * @method callMethod
       * @returns Actor
       */
      public callMethod(method: ()=>any): Actor {
         this.actionQueue.add(new ex.Internal.Actions.CallMethod(this, method));
         return this;
      }

      /**
       * This method will cause the actor to repeat all of the previously 
       * called actions a certain number of times. If the number of repeats 
       * is not specified it will repeat forever. This method is part of 
       * the actor 'Action' fluent API allowing action chaining
       * @method repeat
       * @param [times=undefined] {number} The number of times to repeat all the previous actions in the action queue. If nothing is specified the actions will repeat forever
       * @returns Actor
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
       * @method repeatForever
       * @returns Actor
       */
      public repeatForever(): Actor {
         this.actionQueue.add(new ex.Internal.Actions.RepeatForever(this, this.actionQueue.getActions()));
         return this;
      }

      /**
       * This method will cause the actor to follow another at a specified distance
       * @method follow
       * @param actor {Actor} The actor to follow
       * @param [followDistance=currentDistance] {number} The distance to maintain when following, if not specified the actor will follow at the current distance.
       * @returns Actor
       */
      public follow(actor : Actor, followDistance? : number) : Actor {
      if (followDistance == undefined){
            this.actionQueue.add(new ex.Internal.Actions.Follow(this, actor));
         } else {
            this.actionQueue.add(new ex.Internal.Actions.Follow(this, actor, followDistance));
         }
      return this;
      }

      /**
       * This method will cause the actor to move towards another until they 
       * collide "meet" at a specified speed.
       * @method meet
       * @param actor {Actor} The actor to meet
       * @param [speed=0] {number} The speed in pixels per second to move, if not specified it will match the speed of the other actor
       * @returns Actor
       */
      public meet(actor: Actor, speed? : number) : Actor {
         if(speed == undefined){
               this.actionQueue.add(new ex.Internal.Actions.Meet(this, actor));
            } else {
               this.actionQueue.add(new ex.Internal.Actions.Meet(this, actor, speed));
            }
         return this;
      }

      /**
       * Called by the Engine, updates the state of the actor
       * @method update 
       * @param engine {Engine} The reference to the current game engine
       * @param delta {number} The time elapsed since the last update in milliseconds
       */
      public update(engine: Engine, delta: number) {
         if(!this._isInitialized){
            this.onInitialize(engine);
            this.eventDispatcher.publish('initialize', new InitializeEvent(engine));
            this._isInitialized = true;
         }

         this.sceneNode.update(engine, delta);
         var eventDispatcher = this.eventDispatcher;

         // Update event dispatcher
         eventDispatcher.update();

         // Update action queue
         this.actionQueue.update(delta);

         // Update placements based on linear algebra
         this.x += this.dx * delta / 1000;
         this.y += this.dy * delta / 1000;

         this.dx += this.ax * delta / 1000;
         this.dy += this.ay * delta / 1000;

         this.rotation += this.rx * delta / 1000;

         this.scaleX += this.sx * delta / 1000;
         this.scaleY += this.sy * delta / 1000;

         if(this.collisionType !== CollisionType.PreventCollision){
            // Retrieve the list of potential colliders, exclude killed, prevented, and self
            var potentialColliders = engine.currentScene.children.filter((actor) => {
               return !actor._isKilled && actor.collisionType !== CollisionType.PreventCollision && this !== actor;
            });

            for(var i = 0; i < potentialColliders.length; i++){
               var intersectActor: Vector;
               var side: Side;
               var collider = potentialColliders[i];

               if(intersectActor = this.collides(collider)){
                  side = this.getSideFromIntersect(intersectActor);
                  // Publish collision events on both participants
                  eventDispatcher.publish('collision', new CollisionEvent(this, collider, side, intersectActor));
                  collider.eventDispatcher.publish('collision', new CollisionEvent(collider, this, ex.Util.getOppositeSide(side), intersectActor.scale(-1.0)));

                  // Send collision group updates
                  collider.collisionGroups.forEach((group)=>{
                     if(this._collisionHandlers[group]){
                        this._collisionHandlers[group].forEach((handler)=>{
                           handler.call(this, collider);
                        });
                     }
                  });

                  // If the actor is active push the actor out if its not passive
                  if((this.collisionType === CollisionType.Active || this.collisionType === CollisionType.Elastic) && collider.collisionType !== CollisionType.Passive){
                     this.y += intersectActor.y;
                     this.x += intersectActor.x;

                     // Naive elastic bounce
                     if(this.collisionType === CollisionType.Elastic){
                        if(side === Side.Left){
                           this.dx = Math.abs(this.dx);
                        }else if(side === Side.Right){
                           this.dx = -Math.abs(this.dx);
                        }else if(side === Side.Top){
                           this.dy = Math.abs(this.dy);
                        }else if(side === Side.Bottom){
                           this.dy = -Math.abs(this.dy);
                        }
                     }                 
                  }
               }

            }

            for(var j = 0; j < engine.currentScene.tileMaps.length; j++){
               var map = engine.currentScene.tileMaps[j];
               var intersectMap: Vector;
               var side = Side.None;
               var max = 2;
               var hasBounced = false;
               while(intersectMap = map.collides(this)){
                  if(max--<0){
                     break;
                  } 
                  side = this.getSideFromIntersect(intersectMap);
                  eventDispatcher.publish('collision', new CollisionEvent(this, null, side, intersectMap));
                  if((this.collisionType === CollisionType.Active || this.collisionType === CollisionType.Elastic) && collider.collisionType !== CollisionType.Passive){
                     this.y += intersectMap.y;
                     this.x += intersectMap.x;

                     // Naive elastic bounce
                     if(this.collisionType === CollisionType.Elastic && !hasBounced){
                        hasBounced = true;
                        if(side === Side.Left){
                           this.dx = Math.abs(this.dx);
                        }else if(side === Side.Right){
                           this.dx = -Math.abs(this.dx);
                        }else if(side === Side.Top){
                           this.dy = Math.abs(this.dy);
                        }else if(side === Side.Bottom){
                           this.dy = -Math.abs(this.dy);
                        }
                     }                 
                  }
               }
            }
         }


         // Publish other events
         engine.keys.forEach(function (key) {
            eventDispatcher.publish(InputKey[key], new KeyEvent(key));
         });

         // Publish click events
         engine.clicks.forEach((e) => {
            if (this.contains(e.x, e.y)) {
               eventDispatcher.publish(EventType[EventType.Click], new Click(e.x, e.y, e.mouseEvent));
               eventDispatcher.publish(EventType[EventType.MouseDown], new MouseDown(e.x, e.y, e.mouseEvent));
            }
         });

         engine.mouseMove.forEach((e) => {
            if (this.contains(e.x, e.y)) {
               eventDispatcher.publish(EventType[EventType.MouseMove], new MouseMove(e.x, e.y, e.mouseEvent));
            }
         });

         engine.mouseUp.forEach((e)=> {
            if (this.contains(e.x, e.y)) {
               eventDispatcher.publish(EventType[EventType.MouseUp], new MouseUp(e.x, e.y, e.mouseEvent));
            }
         });

         engine.touchStart.forEach((e) => {
            if (this.contains(e.x, e.y)) {
               eventDispatcher.publish(EventType[EventType.TouchStart], new TouchStart(e.x, e.y));
            }
         });

         engine.touchMove.forEach((e) => {
            if (this.contains(e.x, e.y)) {
               eventDispatcher.publish(EventType[EventType.TouchMove], new TouchMove(e.x, e.y));
            }
         });

         engine.touchEnd.forEach((e) => {
            if (this.contains(e.x, e.y)) {
               eventDispatcher.publish(EventType[EventType.TouchEnd], new TouchEnd(e.x, e.y));
            }
         });

         engine.touchCancel.forEach((e) => {
            if (this.contains(e.x, e.y)) {
               eventDispatcher.publish(EventType[EventType.TouchCancel], new TouchCancel(e.x, e.y));
            }
         });

         var actorScreenCoords = engine.worldToScreenCoordinates(new Point(this.getGlobalX(), this.getGlobalY()));
         var zoom = 1.0;
         if(engine.camera){
            zoom = engine.camera.getZoom();   
         }
         
         if(!this.isOffScreen){
            if(actorScreenCoords.x + this.getWidth() * zoom < 0 || 
               actorScreenCoords.y + this.getHeight() * zoom < 0 ||
               actorScreenCoords.x > engine.width ||
               actorScreenCoords.y > engine.height ){
               
               eventDispatcher.publish('exitviewport', new ExitViewPortEvent());
               this.isOffScreen = true;
            }
         }else{
            if(actorScreenCoords.x + this.getWidth() * zoom > 0 &&
               actorScreenCoords.y + this.getHeight() * zoom > 0 &&
               actorScreenCoords.x < engine.width &&
               actorScreenCoords.y < engine.height){
               
               eventDispatcher.publish('enterviewport', new EnterViewPortEvent());               
               this.isOffScreen = false;
            }
         }


         eventDispatcher.publish(EventType[EventType.Update], new UpdateEvent(delta));
      }


      /**
       * Called by the Engine, draws the actor to the screen
       * @method draw
       * @param ctx {CanvasRenderingContext2D} The rendering context
       * @param delta {number} The time since the last draw in milliseconds
       */
      public draw(ctx: CanvasRenderingContext2D, delta: number) {
         // only draw if onscreen 
         if(this.isOffScreen) return;

         ctx.save();
         ctx.translate(this.x, this.y);
         ctx.rotate(this.rotation);     
         ctx.scale(this.scaleX, this.scaleY);

         if (this.previousOpacity != this.opacity) {
            // Object.keys(this.frames).forEach(function (key) {
            //    frames[key].addEffect(new ex.Effects.Opacity(this.opacity));
            // });
            for (var drawing in this.frames) {
               this.frames[drawing].addEffect(new ex.Effects.Opacity(this.opacity));
            }

            this.previousOpacity = this.opacity;
         }

         if (!this.invisible) {
            if (this.currentDrawing) {

               var xDiff = 0;
               var yDiff = 0;
               if (this.centerDrawingX) {
                  xDiff = (this.currentDrawing.width * this.currentDrawing.getScaleX() - this.width) / 2;
               }

               if (this.centerDrawingY) {
                  yDiff = (this.currentDrawing.height * this.currentDrawing.getScaleY() - this.height) / 2;
               }

               //var xDiff = (this.currentDrawing.width*this.currentDrawing.getScale() - this.width)/2;
               //var yDiff = (this.currentDrawing.height*this.currentDrawing.getScale() - this.height)/2;
               this.currentDrawing.draw(ctx, -xDiff, -yDiff);

            } else {
               if(this.color) this.color.a = this.opacity;
               ctx.fillStyle = this.color ? this.color.toString() : (new Color(0, 0, 0)).toString();
               ctx.fillRect(0, 0, this.width, this.height);
            }
         }

         this.sceneNode.draw(ctx, delta);

         ctx.restore();
      }

      /**
       * Called by the Engine, draws the actors debugging to the screen
       * @method debugDraw
       * @param ctx {CanvasRenderingContext2D} The rendering context
       */
      public debugDraw(ctx: CanvasRenderingContext2D) {
         
         // Meant to draw debug information about actors
         this.sceneNode.debugDraw(ctx);
         this.getBounds().debugDraw(ctx);

      }
   }
}