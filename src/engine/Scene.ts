/// <reference path="Class.ts" />
/// <reference path="Timer.ts" />
/// <reference path="Collision/NaiveCollisionResolver.ts"/>
/// <reference path="Collision/DynamicTreeCollisionResolver.ts"/>
/// <reference path="CollisionPair.ts" />
/// <reference path="Camera.ts" />
/// <reference path="Group.ts"/>
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
       * Gets or sets the current camera for the scene
       * @property camera {Camera}
       */
      public camera: BaseCamera;

      /**
       * The actors in the current scene
       * @property children {Actor[]}
       */
      public children: Actor[] = [];
      public tileMaps: TileMap[] = [];
      public groups: { [key: string]: Group } = {};
      public engine: Engine;

      public uiActors: Actor[] = [];

      private _collisionResolver: ICollisionResolver = new DynamicTreeCollisionResolver();

      private _killQueue: Actor[] = [];
      private _timers: Timer[] = [];
      private _cancelQueue: Timer[] = [];
      private _isInitialized: boolean = false;
      private _logger: Logger = Logger.getInstance();
      

      constructor(engine?: Engine) {
         super();
         this.camera = new BaseCamera()
         if(engine){
            this.camera.setFocus(engine.width/2, engine.height/2);
         }
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
         if (!this._isInitialized) {
            this.onInitialize(engine);
            this.eventDispatcher.publish('initialize', new InitializeEvent(engine));
            this._isInitialized = true;
         }

         this.uiActors.forEach(function(ui){
            ui.update(engine, delta);
         });

         this.tileMaps.forEach(function (cm) {
            cm.update(engine, delta);
         });


         var len = 0;
         // Cycle through actors updating actors
         for (var i = 0, len = this.children.length; i < len; i++) {
            this.children[i].update(engine, delta);
         }

         // Run collision resolution strategy
         if (this._collisionResolver) {
            this._collisionResolver.update(this.children);
            this._collisionResolver.evaluate(this.children);
         }


         // Remove actors from scene graph after being killed
         var actorIndex = 0;
         for (var i = 0, len = this._killQueue.length; i < len; i++) {
            actorIndex = this.children.indexOf(this._killQueue[i]);
            if (actorIndex > -1) {
               this.children.splice(actorIndex, 1);
            }
         }
         this._killQueue.length = 0;


         // Remove timers in the cancel queue before updating them
         var timerIndex = 0;
         for (var i = 0, len = this._cancelQueue.length; i < len; i++) {
            this.removeTimer(this._cancelQueue[i]);
         }
         this._cancelQueue.length = 0;

         // Cycle through timers updating timers
         var that = this;
         this._timers = this._timers.filter(function (timer) {
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
         ctx.save();

         if (this.camera) {
            this.camera.update(ctx, delta);
         }

         this.tileMaps.forEach(function (cm) {
            cm.draw(ctx, delta);
         });

         var len = 0;
         var start = 0;
         var end = 0;
         var actor;
         for (var i = 0, len = this.children.length; i < len; i++) {
            actor = this.children[i];
            // only draw actors that are visible
            if (actor.visible) {
               this.children[i].draw(ctx, delta);
            }
         }

         if (this.engine && this.engine.isDebug) {
            ctx.strokeStyle = 'yellow';
            this.debugDraw(ctx);            
         }

         ctx.restore();
         
         this.uiActors.forEach(function (ui) {
            if (ui.visible) {
               ui.draw(ctx, delta);
            }
         });

         if (this.engine && this.engine.isDebug) {
            this.uiActors.forEach(function(ui){
               ui.debugDraw(ctx);
            });
         }

      }

      /**
       * Draws all the actors' debug information in the Scene. Called by the Engine.
       * @method draw
       * @param ctx {CanvasRenderingContext2D} The current rendering context
       */
      public debugDraw(ctx: CanvasRenderingContext2D) {


         this.tileMaps.forEach(map => {
            map.debugDraw(ctx);
         });

         this.children.forEach((actor) => {
            actor.debugDraw(ctx);
         });

         // todo possibly enable this with excalibur flags features?
         //this._collisionResolver.debugDraw(ctx, 20);

         //this.camera.debugDraw(ctx);
      }

      /**
       * Checks whether an actor is contained in this scene or not
       */
      public contains(actor: Actor): boolean {
         return this.children.indexOf(actor) > -1;
      }

      /**
       * Adds an excalibur Timer to the current scene.
       * @param timer {Timer} The timer to add to the current scene.
       * @method add
       */
      public add(timer: Timer): void;

      /**
       * Adds a TileMap to the Scene, once this is done the TileMap will be drawn and updated.
       * @method add
       * @param tileMap {TileMap} 
       */
      public add(tileMap: TileMap): void;

      /**
       * Adds an actor to the Scene, once this is done the Actor will be drawn and updated.
       * @method add
       * @param actor {Actor} The actor to add to the current scene
       */
      public add(actor: Actor): void;

      /**
       * Adds a UIActor to the scene, UIActors do not participate in collisions, instead the remain in the same place on the screen.
       * @method add
       * @param uiActor {UIActor} The UIActor to add to the current scene
       */
      public add(uiActor: UIActor): void;
      public add(entity: any): void {
         if (entity instanceof UIActor) {
            this.addUIActor(entity);
            return;
         }
         if (entity instanceof Actor) {
            this.addChild(entity);
         }
         
         if (entity instanceof Timer) {
            this.addTimer(entity);
         }

         if (entity instanceof TileMap) {
            this.addTileMap(entity);
         }
      }
      
     /**
       * Removes an excalibur Timer from the current scene.
       * @method remove
       * @param timer {Timer} The timer to remove to the current scene.       
       */
      public remove(timer: Timer): void;

      /**
       * Removes a TileMap from the Scene, it will no longer be drawn or updated.
       * @method remove
       * @param tileMap {TileMap}
       */
      public remove(tileMap: TileMap): void;

      /**
       * Removes an actor from the Scene, it will no longer be drawn or updated.
       * @method remove       
       * @param actor {Actor} The actor to remove from the current scene.      
       */
      public remove(actor: Actor): void;

      /**
       * Removes a UIActor to the scene, it will no longer be drawn or updated
       * @method remove
       * @param uiActor {UIActor} The UIActor to remove from the current scene
       */
      public remove(uiActor: UIActor): void;
      public remove(entity: any): void {
         if (entity instanceof UIActor) {
            this.removeUIActor(entity);
            return;
         }
         if (entity instanceof Actor) {
            this._collisionResolver.remove(entity);
            this.removeChild(entity);
         }
         if (entity instanceof Timer) {
            this.removeTimer(entity);
         }

         if (entity instanceof TileMap) {
            this.removeTileMap(entity);
         }

      }

      /**
       * Adds an actor to act as a piece of UI, meaning it is always positioned
       * in screen coordinates. UI actors do not participate in collisions
       * @method addUIActor
       * @param actor {Actor}
       */
      public addUIActor(actor: Actor){
         this.uiActors.push(actor);
      }

      /**
       * Removes an actor as a piec of UI
       * @method removeUIActor
       * @param actor {Actor}
       */
      public removeUIActor(actor: Actor){
         var index = this.uiActors.indexOf(actor);
         if(index > -1){
            this.uiActors.splice(index, 1);
         }
      }


      /**
       * Adds an actor to the Scene, once this is done the actor will be drawn and updated.
       * @method addChild
       * @param actor {Actor} 
       */
      public addChild(actor: Actor) {
         this._collisionResolver.register(actor);
         actor.scene = this;
         this.children.push(actor);
         actor.parent = this.actor;
      }


      /**
       * Adds a TileMap to the Scene, once this is done the TileMap will be drawn and updated.
       * @method addTileMap
       * @param tileMap {TileMap} 
       */
      public addTileMap(tileMap: TileMap) {
         this.tileMaps.push(tileMap);
      }

      /**
       * Removes a TileMap from the Scene, it willno longer be drawn or updated.
       * @method removeTileMap
       * @param tileMap {TileMap}
       */
      public removeTileMap(tileMap: TileMap) {
         var index = this.tileMaps.indexOf(tileMap);
         if (index > -1) {
            this.tileMaps.splice(index, 1);
         }
      }


      /**
       * Removes an actor from the Scene, it will no longer be drawn or updated.
       * @method removeChild
       * @param actor {Actor} The actor to remove
       */
      public removeChild(actor: Actor) {
         this._collisionResolver.remove(actor);
         this._killQueue.push(actor);
         actor.parent = null;
      }

      /**
       * Adds a timer to the Scene
       * @method addTimer
       * @param timer {Timer} The timer to add
       * @returns Timer
       */
      public addTimer(timer: Timer): Timer {
         this._timers.push(timer);
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
      public removeTimer(timer: Timer): Timer {
         var i = this._timers.indexOf(timer);
         if (i !== -1) {
            this._timers.splice(i, 1);
         }
         return timer;
      }

      /**
       * Cancels a timer, removing it from the scene nicely
       * @method cancelTimer
       * @param timer {Timer} The timer to cancel
       * @returns Timer
       */
      public cancelTimer(timer: Timer): Timer {
         this._cancelQueue.push(timer);
         return timer;
      }

      /**
       * Tests whether a timer is active in the scene
       * @method isTimerActive
       * @param timer {Timer}
       * @returns boolean
       */
      public isTimerActive(timer: Timer): boolean {
         return (this._timers.indexOf(timer) > -1);
      }

      /**
       * Creates and adds a group to the scene with a name
       * @method createGroup
       * @param name {String}
       * @returns Group
       */
      public createGroup(name: string): Group {
         return new Group(name, this);
      }

      /**
       * Returns a group by name
       * @method getGroup
       * @param name {string}
       * @returns Group
       */
      public getGroup(name: string): Group {
         return this.groups[name];
      }

      /**
       * Removes a group by name
       * @method removeGroup
       * @param name {string}
       */
      public removeGroup(name: string): void;

      /**
       * Removes a group by reference
       * @method removeGroup
       * @param group {Group}
       */
      public removeGroup(group: Group): void;
      public removeGroup(group: any): void {
         if (typeof group === 'string') {
            delete this.groups[group];
         } else if (group instanceof Group) {
            delete this.groups[group.name];
         } else {
            this._logger.error("Invalid arguments to removeGroup", group);
         }
      }

   }
}