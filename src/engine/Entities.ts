/// <reference path="Core.ts" />
/// <reference path="Algebra.ts" />
/// <reference path="Util.ts" />
/// <reference path="CollisionMap.ts" />

module ex {
   export class Overlap {
      constructor(public x: number, public y: number) { }
   }

   /**
    * Actors are composed together into groupings called Scenes in 
    * Excalibur. The metaphor models the same idea behind real world 
    * actors in a scene. Only actors in scenes will be updated and drawn.
    * @class Scene
    * @constructor
    */
   export class Scene extends ex.Util.Class {

      //The actor this scene is attached to , if any
      public actor: Actor;
      
      /**
       * The actors in the current scene
       * @property children {Actor[]}
       */
      public children: Actor[] = [];
      public collisionMaps: CollisionMap[] = [];
      public engine: Engine;
      private killQueue: Actor[] = [];

      private timers: Timer[] = [];
      private cancelQueue: Timer[] = [];

      private _isInitialized: boolean = false;

      constructor() {
         super();
      }

      /**
       * This is called when the scene is made active and started. It is meant to be overriden,
       * this is where you should setup any DOM UI or event handlers needed for the scene.
       * @method onActivate
       */
      public onActivate(): void {
         // will be overridden
      }

      /**
       * This is called when the scene is made transitioned away from and stopped. It is meant to be overriden,
       * this is where you should cleanup any DOM UI or event handlers needed for the scene.
       * @method onDeactivate
       */
      public onDeactivate(): void {
         // will be overridden
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
       * Publish an event to all actors in the scene
       * @method publish
       * @param eventType {string} The name of the event to publish
       * @param event {GameEvent} The event object to send 
       */
      public publish(eventType: string, event: GameEvent) {
         this.children.forEach((actor) => {
            actor.triggerEvent(eventType, event);
         });
      }

      /**
       * Updates all the actors and timers in the Scene. Called by the Engine.
       * @method update
       * @param engine {Engine} Reference to the current Engine
       * @param delta {number} The number of milliseconds since the last update
       */
      public update(engine: Engine, delta: number) {
         if(!this._isInitialized){
            this.onInitialize(engine);
            this.eventDispatcher.publish('initialize', new InitializeEvent(engine));
            this._isInitialized = true;
         }

         // Update event dispatcher
         this.eventDispatcher.update();

         var len = 0;
         var start = 0;
         var end = 0;
         var actor;
         // Cycle through actors updating actors
         for (var i = 0, len = this.children.length; i < len; i++) {
            this.children[i].update(engine, delta);
         }

         // Remove actors from scene graph after being killed
         var actorIndex = 0;
         for (var j = 0, len = this.killQueue.length; j < len; j++) {
            actorIndex = this.children.indexOf(this.killQueue[j]);
            if(actorIndex > -1){
               this.children.splice(actorIndex, 1);
            }
         }
         this.killQueue.length = 0;


         // Remove timers in the cancel queue before updating them
         var timerIndex = 0;
         for(var k = 0, len = this.cancelQueue.length; k < len; k++){
            this.removeTimer(this.cancelQueue[k]);
         }
         this.cancelQueue.length = 0;

         // Cycle through timers updating timers
         var that = this; 
         this.timers = this.timers.filter(function(timer){
            timer.update(delta);
            return !timer.complete;
         });
      }

      /**
       * Draws all the actors in the Scene. Called by the Engine.
       * @method draw
       * @param ctx {CanvasRenderingContext2D} The current rendering context
       * @param delta {number} The number of milliseconds since the last draw
       */
      public draw(ctx: CanvasRenderingContext2D, delta: number) {
         this.collisionMaps.forEach(function(cm){
            cm.draw(ctx, delta);
         });

         var len = 0;
         var start = 0;
         var end = 0;
         var actor;
         for (var i = 0, len = this.children.length; i < len; i++) {
            actor = this.children[i];
            this.children[i].draw(ctx, delta);
         }
      }

      /**
       * Draws all the actors' debug information in the Scene. Called by the Engine.
       * @method draw
       * @param ctx {CanvasRenderingContext2D} The current rendering context
       */
      public debugDraw(ctx: CanvasRenderingContext2D) {
         this.collisionMaps.forEach(map =>{
            map.debugDraw(ctx);
         });

         this.children.forEach((actor) => {
            actor.debugDraw(ctx);
         });         
      }

      /**
       * Adds an actor to the Scene, once this is done the actor will be drawn and updated.
       * @method addChild
       * @param actor {Actor} The actor to add
       */
      public addChild(actor: Actor) {
         actor.scene = this;
         this.children.push(actor);
         actor.parent = this.actor;
      }

      public addCollisionMap(collisionMap: CollisionMap){
         this.collisionMaps.push(collisionMap);
      }

      public removeCollisionMap(collisionMap: CollisionMap){
         var index = this.collisionMaps.indexOf(collisionMap);
         if(index > -1){
            this.collisionMaps.splice(index, 1);
         }
      }

    
      /**
       * Removes an actor from the Scene, it will no longer be drawn or updated.
       * @method removeChild
       * @param actor {Actor} The actor to remove
       */
      public removeChild(actor: Actor) {
         this.killQueue.push(actor);
         actor.parent = null;
      }

      /**
       * Adds a timer to the Scene
       * @method addTimer
       * @param timer {Timer} The timer to add
       * @returns Timer
       */
      public addTimer(timer: Timer): Timer{
         this.timers.push(timer);
         timer.scene = this;
         return timer;
      }

      /**
       * Removes a timer to the Scene, can be dangerous
       * @method removeTimer
       * @private
       * @param timer {Timer} The timer to remove
       * @returns Timer
       */
      public removeTimer(timer: Timer): Timer{
         var i = this.timers.indexOf(timer);
         if(i !== -1){
            this.timers.splice(i, 1);   
         }
         return timer;         
      }

      /**
       * Cancels a timer, removing it from the scene nicely
       * @method cancelTimer
       * @param timer {Timer} The timer to cancel
       * @returns Timer
       */
      public cancelTimer(timer: Timer): Timer{
         this.cancelQueue.push(timer);
         return timer;
      }

      /**
       * Tests whether a timer is active in the scene
       * @method isTimerActive
       * @param timer {Timer}
       * @returns boolean
       */
      public isTimerActive(timer: Timer): boolean {
         return (this.timers.indexOf(timer) > -1);
      }

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
   export class Actor extends ex.Util.Class {
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
       * The scale of the actor
       * @property scale {number} 
       */
      public scale: number = 1;
      /** 
       * The scalar velocity of the actor in scale/second
       * @property sx {number} 
       */
      public sx: number = 0; //scale/sec
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
      public ax: number = 0; // pixels/sec/sec
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
      private previousOpacity: number = 1;

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
         return this.width * this.scale;
      }

      /**
       * Sets the width of an actor, factoring in the current scale
       * @method setWidth
       */
      public setWidth(width) {
         this.width = width / this.scale;
      }

      /**
       * Gets the calculated height of an actor
       * @method getHeight
       * @returns number
       */
      public getHeight() {
         return this.height * this.scale;
      }

      /**
       * Sets the height of an actor, factoring in the current scale
       * @method setHeight
       */
      public setHeight(height) {
         this.height = height / this.scale;
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

      private getOverlap(box: Actor): Overlap {
         var xover = 0;
         var yover = 0;
         if (this.collides(box)) {
            if (this.getLeft() < box.getRight()) {
               xover = box.getRight() - this.getLeft();
            }
            if (box.getLeft() < this.getRight()) {
               var tmp = box.getLeft() - this.getRight();
               if (Math.abs(xover) > Math.abs(tmp)) {
                  xover = tmp;
               }
            }

            if (this.getBottom() > box.getTop()) {
               yover = box.getTop() - this.getBottom();
            }

            if (box.getBottom() > this.getTop()) {
               var tmp = box.getBottom() - this.getTop();
               if (Math.abs(yover) > Math.abs(tmp)) {
                  yover = tmp;
               }
            }

         }
         return new Overlap(xover, yover);
      }

      /**
       * Tests whether the x/y specified are contained in the actor
       * @method contains
       * @param x {number} X coordinate to test (in world coordinates)
       * @param y {number} Y coordinate to test (in world coordinates)
       */
      public contains(x: number, y: number): boolean {
         return (this.x <= x && this.y <= y && this.getBottom() >= y && this.getRight() >= x);
      }

      /**
       * Test whether the actor has collided with another actor, returns the side of the current actor that collided.
       * @method collides
       * @param actor {Actor} The other actor to test
       * @returns Side
       */
      public collides(actor: Actor): Side {         
        
         var w = 0.5 * (this.getWidth() + actor.getWidth());
         var h = 0.5 * (this.getHeight() + actor.getHeight());

         var dx = (this.x + this.getWidth() / 2.0) - (actor.x + actor.getWidth() / 2.0);
         var dy = (this.y + this.getHeight() / 2.0) - (actor.y + actor.getHeight() / 2.0);

         if (Math.abs(dx) < w && Math.abs(dy) < h) {
            // collision detected
            var wy = w * dy;
            var hx = h * dx;

            if (wy > hx) {
               if (wy > -hx) {
                  return Side.Top;
               } else {
               return Side.Right;
            }
            } else {
               if (wy > -hx) {
                  return Side.Left;
               } else {
                  return Side.Bottom;
               }
            }
         }

         return Side.None;
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
      public scaleTo(size: number, speed: number): Actor {
         this.actionQueue.add(new ex.Internal.Actions.ScaleTo(this, size, speed));
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
      public scaleBy(size: number, time: number): Actor {
         this.actionQueue.add(new ex.Internal.Actions.ScaleBy(this, size, time));
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
       * This method will add an action to the queu that will remove the actor from the 
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

         this.rotation += this.rx * delta / 1000;

         this.scale += this.sx * delta / 1000;

         if(this.collisionType !== CollisionType.PreventCollision){
            // Retrieve the list of potential colliders, exclude killed, prevented, and self
            var potentialColliders = engine.currentScene.children.filter((actor) => {
               return !actor._isKilled && actor.collisionType !== CollisionType.PreventCollision && this !== actor;
            });

            for(var i = 0; i < potentialColliders.length; i++){
               var side = Side.None;
               var collider = potentialColliders[i];

               if((side = this.collides(collider)) !== Side.None){
                  // Publish collision events
                  eventDispatcher.publish('collision', new CollisionEvent(this, collider, side));

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
                     var overlap = this.getOverlap(collider);
                     if (Math.abs(overlap.y) < Math.abs(overlap.x)) {
                        this.y += overlap.y;
                     } else {
                        this.x += overlap.x;
                     }

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

         }



         /* Old collision code

         var potentialColliders = engine.currentScene.children.filter(function(actor){
            return !actor._isKilled;
         });
         // Publish collision events
         for (var i = 0; i < potentialColliders.length; i++) {
            var other = potentialColliders[i];
            var side: Side = Side.NONE;
            if (other !== this && !other.preventCollisions &&
               (side = this.collides(other)) !== Side.NONE) {
               var overlap = this.getOverlap(other);
               eventDispatcher.publish(EventType[EventType.Collision], new CollisionEvent(this, other, side));

               if (!this.fixed) {
                  if (Math.abs(overlap.y) < Math.abs(overlap.x)) {
                     this.y += overlap.y;
                  } else {
                     this.x += overlap.x;
                  }
               }
               other.collisionGroups.forEach((group)=>{
                  if(this._collisionHandlers[group]){
                     this._collisionHandlers[group].forEach((handler)=>{
                        handler.call(this, other);
                     });
                  }
               });
            }
         }*/

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

         var actorScreenCoords = engine.worldToScreenCoordinates(new Point(this.x, this.y));
         var zoom = engine.camera.getZoom();
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
         ctx.scale(this.scale, this.scale);

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
                  xDiff = (this.currentDrawing.width * this.currentDrawing.getScale() - this.width) / 2;
               }

               if (this.centerDrawingY) {
                  yDiff = (this.currentDrawing.height * this.currentDrawing.getScale() - this.height) / 2;
               }

               //var xDiff = (this.currentDrawing.width*this.currentDrawing.getScale() - this.width)/2;
               //var yDiff = (this.currentDrawing.height*this.currentDrawing.getScale() - this.height)/2;
               this.currentDrawing.draw(ctx, -xDiff, -yDiff);

            } else {
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
         ctx.save();
         ctx.translate(this.x, this.y);         

         ctx.fillStyle = Color.Yellow.toString();
         ctx.strokeStyle = Color.Yellow.toString();
         ctx.beginPath();
         ctx.rect(0, 0, this.getWidth(), this.getHeight());
         ctx.stroke();

         this.sceneNode.debugDraw(ctx);
         ctx.restore();

      }
   }

   /**
    * Enum representing the different horizontal text alignments
    * @class TextAlign
    */
   export enum TextAlign {
      /**
       * The text is left-aligned.
       * @property Left
       * @static 
       */
      Left,
      /**
       * The text is right-aligned.
       * @property Right
       * @static 
       */
      Right,
      /**
       * The text is centered.
       * @property Center
       * @static 
       */
      Center,
      /**
       * The text is aligned at the normal start of the line (left-aligned for left-to-right locales, right-aligned for right-to-left locales).
       * @property Start
       * @static 
       */
      Start,
      /**
       * The text is aligned at the normal end of the line (right-aligned for left-to-right locales, left-aligned for right-to-left locales).
       * @property End
       * @static 
       */
      End
   }

   /**
    * Enum representing the different baseline text alignments
    * @class BaseAlign
    */
   export enum BaseAlign {
      /**
       * The text baseline is the top of the em square.
       * @property Top
       * @static 
       */
      Top,
      /**
       * The text baseline is the hanging baseline.  Currently unsupported; this will act like alphabetic.
       * @property Hanging
       * @static 
       */
      Hanging,
      /**
       * The text baseline is the middle of the em square.
       * @property Middle
       * @static 
       */
      Middle,
      /**
       * The text baseline is the normal alphabetic baseline.
       * @property Alphabetic
       * @static 
       */
      Alphabetic,
      /**
       * The text baseline is the ideographic baseline; this is the bottom of 
       * the body of the characters, if the main body of characters protrudes 
       * beneath the alphabetic baseline.  Currently unsupported; this will 
       * act like alphabetic.
       * @property Ideographic
       * @static 
       */
      Ideographic,
      /**
       * The text baseline is the bottom of the bounding box.  This differs
       * from the ideographic baseline in that the ideographic baseline 
       * doesn't consider descenders.
       * @property Bottom
       * @static 
       */
      Bottom
    }

   /**
    * Labels are the way to draw small amounts of text to the screen in Excalibur. They are
    * actors and inherit all of the benifits and capabilities.
    * @class Label
    * @extends Actor
    * @constructor
    * @param [text=empty] {string} The text of the label
    * @param [x=0] {number} The x position of the label
    * @param [y=0] {number} The y position of the label
    * @param [font=sans-serif] {string} Use any valid css font string for the label's font. Default is "10px sans-serif".
    * @param [spriteFont=undefined] {SpriteFont} Use an Excalibur sprite font for the label's font, if a SpriteFont is provided it will take precendence over a css font.
    *
    */
   export class Label extends Actor {

      public text: string;
      public spriteFont: SpriteFont;
      public font: string;
      /**
       * Gets or sets the horizontal text alignment property for the label. 
       * @property textAlign {TextAlign}
       */
      public textAlign: TextAlign;
      /**
       * Gets or sets the baseline alignment property for the label.
       * @property textBaseline {BaseAlign}
       */
      public baseAlign: BaseAlign;
      /**
       * Gets or sets the maximum width (in pixels) that the label should occupy
       * @property maxWidth {number}
       */
      public maxWidth: number;
      /**
       * Gets or sets the letter spacing on a Label. Only supported with Sprite Fonts.
       * @property [letterSpacing=0] {number}
       */
      public letterSpacing: number = 0;//px

      public caseInsensitive: boolean = true;

      private _textShadowOn: boolean = false;
      private _shadowOffsetX: number = 0;
      private _shadowOffsetY: number = 0;
      private _shadowColor: Color = Color.Black.clone();
      private _shadowColorDirty: boolean = false;

      private _textSprites: { [key: string]: Sprite; } = {};
      private _shadowSprites: { [key: string]: Sprite; } = {};

      private _color: Color = Color.Black.clone();
      constructor(text?: string, x?: number, y?: number, font?: string, spriteFont?: SpriteFont) {
         super(x, y);
         this.text = text || "";
         this.color = Color.Black.clone();
         this.spriteFont = spriteFont;
         this.collisionType = CollisionType.PreventCollision;
         this.font = font || "10px sans-serif"; // coallesce to default canvas font
         if(spriteFont){
            this._textSprites = spriteFont.getTextSprites();
         }
      }


      /**
       * Returns the width of the text in the label (in pixels);
       * @method getTextWidth {number}
       * @param ctx {CanvasRenderingContext2D} Rending context to measure the string with
       */
      public getTextWidth(ctx: CanvasRenderingContext2D): number {
         var oldFont = ctx.font;
         ctx.font = this.font;
         var width = ctx.measureText(this.text).width;
         ctx.font = oldFont;
         return width;
      }

      // TypeScript doesn't support string enums :(
      private _lookupTextAlign(textAlign: TextAlign): string {
         switch(textAlign){
             case TextAlign.Left:
                 return "left";
                 break;
             case TextAlign.Right:
                 return "right";
                 break;
             case TextAlign.Center:
                 return "center";
                 break;
             case TextAlign.End:
                 return "end";
                 break;
             case TextAlign.Start:
                 return "start";
                 break;
             default:
                 return "start";
                 break;
         }
      }

      private _lookupBaseAlign(baseAlign: BaseAlign): string {
          switch (baseAlign) {
              case BaseAlign.Alphabetic:
                  return "alphabetic";
                  break;
              case BaseAlign.Bottom:
                  return "bottom";
                  break;
              case BaseAlign.Hanging:
                  return "hangin";
                  break;
              case BaseAlign.Ideographic:
                  return "ideographic";
                  break;
              case BaseAlign.Middle:
                  return "middle";
                  break;
              case BaseAlign.Top:
                  return "top";
                  break;
              default:
                  return "alphabetic";
                  break;
          }
      }

      /**
       * Sets the text shadow for sprite fonts
       * @method setTextShadow
       * @param offsetX {number} The x offset in pixels to place the shadow
       * @param offsetY {number} The y offset in pixles to place the shadow
       * @param shadowColor {Color} The color of the text shadow
       */
      public setTextShadow(offsetX: number, offsetY: number, shadowColor: Color){
         this._textShadowOn = true;
         this._shadowOffsetX = offsetX;
         this._shadowOffsetY = offsetY;
         this._shadowColor = shadowColor.clone();
         this._shadowColorDirty = true;
         for(var character in this._textSprites){
            this._shadowSprites[character] = this._textSprites[character].clone();
         }
      }

      /**
       * Clears the current text shadow
       * @method clearTextShadow
       */
      public clearTextShadow(){
         this._textShadowOn = false;
         this._shadowOffsetX = 0;
         this._shadowOffsetY = 0;
         this._shadowColor = Color.Black.clone();  
      }

      public update(engine: Engine, delta: number) {
         super.update(engine, delta);

         if(this.spriteFont && this._color !== this.color){
            for(var character in this._textSprites){
               this._textSprites[character].clearEffects();
               this._textSprites[character].addEffect(new Effects.Fill(this.color.clone()));
               this._color = this.color;
            }
         }

         if(this.spriteFont && this._textShadowOn && this._shadowColorDirty && this._shadowColor){
            for(var character in this._shadowSprites){
               this._shadowSprites[character].clearEffects();
               this._shadowSprites[character].addEffect(new Effects.Fill(this._shadowColor.clone()));
            }  
            this._shadowColorDirty = false;
         }
      }

      public draw(ctx: CanvasRenderingContext2D, delta: number) {

         ctx.save();
         ctx.translate(this.x, this.y);
         ctx.scale(this.scale, this.scale);
         ctx.rotate(this.rotation);
         
         if(this._textShadowOn){
            ctx.save();
            ctx.translate(this._shadowOffsetX, this._shadowOffsetY);
            this._fontDraw(ctx, delta, this._shadowSprites);
            ctx.restore();
         }
         this._fontDraw(ctx, delta, this._textSprites);

         super.draw(ctx, delta);
         ctx.restore();
      }

      private _fontDraw(ctx: CanvasRenderingContext2D, delta: number, sprites: { [key: string]: Sprite; }){
         if (!this.invisible) {
            if (this.spriteFont) {
               var currX = 0;
               for (var i = 0; i < this.text.length; i++) {
                  var character = this.text[i];
                  if (this.caseInsensitive) {
                     character = character.toLowerCase();
                  }
                  try {
                     var charSprite = sprites[character];
                     charSprite.draw(ctx, currX, 0);
                     currX += (charSprite.swidth + this.letterSpacing);
                  } catch (e) {
                     Logger.getInstance().error("SpriteFont Error drawing char " + character);
                  }           
               }
               //this.spriteFont.draw(ctx, 0, 0, this.text, color, this.letterSpacing);
            } else {
               var oldAlign = ctx.textAlign;
               var oldTextBaseline = ctx.textBaseline;

               ctx.textAlign = this._lookupTextAlign(this.textAlign);
               ctx.textBaseline = this._lookupBaseAlign(this.baseAlign);

               ctx.fillStyle = this.color.toString();
               ctx.font = this.font;
               if(this.maxWidth){
                  ctx.fillText(this.text, 0, 0, this.maxWidth);
               }else{
                  ctx.fillText(this.text, 0, 0);
               }

               ctx.textAlign = oldAlign;
               ctx.textBaseline = oldTextBaseline;
            }
         }
      }

      public debugDraw(ctx: CanvasRenderingContext2D) {
         super.debugDraw(ctx);
      }

   }

   /**
    * Triggers a method of firing arbitrary code on collision. These are useful
    * as 'buttons', 'switches', or to trigger effects in a game. By defualt triggers
    * are invisible, and can only be seen with debug mode enabled on the Engine.
    * @class Trigger
    * @constructor
    * @param [x=0] {number} The x position of the trigger
    * @param [y=0] {number} The y position of the trigger
    * @param [width=0] {number} The width of the trigger
    * @param [height=0] {number} The height of the trigger
    * @param [action=null] {()=>void} Callback to fire when trigger is activated
    * @param [repeats=1] {number} The number of times that this trigger should fire, by default it is 1, if -1 is supplied it will fire indefinitely
    */
   export class Trigger extends Actor {
      private action : ()=>void = ()=>{};
      public repeats : number = 1;
      public target : Actor = null;
      constructor(x?: number, y?: number, width?: number, height?: number, action?: ()=>void, repeats?: number){
         super(x, y, width, height);
         this.repeats = repeats || this.repeats;
         this.action = action || this.action;
         this.collisionType = CollisionType.PreventCollision;
         this.eventDispatcher = new EventDispatcher(this);
         this.actionQueue = new Internal.Actions.ActionQueue(this);
      }

      public update(engine: Engine, delta: number){
         var eventDispatcher = this.eventDispatcher;

         // Update event dispatcher
         eventDispatcher.update();

         // Update action queue
         this.actionQueue.update(delta);

         // Update placements based on linear algebra
         this.x += this.dx * delta / 1000;
         this.y += this.dy * delta / 1000;

         this.rotation += this.rx * delta / 1000;

         this.scale += this.sx * delta / 1000;

         // check for trigger collisions
         if(this.target){
            if(this.collides(this.target) !== Side.None){
               this.dispatchAction();
            }
         }else{
            for (var i = 0; i < engine.currentScene.children.length; i++) {
               var other = engine.currentScene.children[i];
               if(other !== this && 
                  other.collisionType !== CollisionType.PreventCollision && 
                  this.collides(other) !== Side.None){
                  this.dispatchAction();
               }
            }
         }         

         // remove trigger if its done, -1 repeat forever
         if(this.repeats === 0){
            this.kill();
         }
      }

      private dispatchAction(){
         this.action.call(this);
         this.repeats--;
      }

      public draw(ctx: CanvasRenderingContext2D, delta: number){
         // does not draw
         return;
      }

      public debugDraw(ctx: CanvasRenderingContext2D){
         super.debugDraw(ctx);
          // Meant to draw debug information about actors
         ctx.save();
         ctx.translate(this.x, this.y);


         // Currently collision primitives cannot rotate 
         // ctx.rotate(this.rotation);
         ctx.fillStyle = Color.Violet.toString();
         ctx.strokeStyle = Color.Violet.toString();
         ctx.fillText('Trigger', 10, 10);
         ctx.beginPath();
         ctx.rect(0, 0, this.getWidth(), this.getHeight());
         ctx.stroke();

         ctx.restore();
      }
   }
}