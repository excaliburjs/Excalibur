/// <reference path="Class.ts" />
/// <reference path="Timer.ts" />
module ex {
   /**
    * Actors are composed together into groupings called Scenes in 
    * Excalibur. The metaphor models the same idea behind real world 
    * actors in a scene. Only actors in scenes will be updated and drawn.
    * @class Scene
    * @constructor
    */
   export class Scene extends ex.Class {

      //The actor this scene is attached to , if any
      public actor: Actor;
      
      /**
       * The actors in the current scene
       * @property children {Actor[]}
       */
      public children: Actor[] = [];
      public tileMaps: TileMap[] = [];
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

         this.tileMaps.forEach(function(cm){
            cm.update(engine, delta);
         });

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
         this.tileMaps.forEach(function(cm){
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
         this.tileMaps.forEach(map =>{
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

      public addTileMap(tileMap: TileMap){
         this.tileMaps.push(tileMap);
      }

      public removeTileMap(tileMap: TileMap){
         var index = this.tileMaps.indexOf(tileMap);
         if(index > -1){
            this.tileMaps.splice(index, 1);
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
}