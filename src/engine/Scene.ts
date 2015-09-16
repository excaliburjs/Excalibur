/// <reference path="Class.ts" />
/// <reference path="Timer.ts" />
/// <reference path="Collision/NaiveCollisionResolver.ts"/>
/// <reference path="Collision/DynamicTreeCollisionResolver.ts"/>
/// <reference path="Collision/CollisionPair.ts" />
/// <reference path="Camera.ts" />
/// <reference path="Group.ts"/>
/// <reference path="Util/SortedList.ts"/>

module ex {

   /**
    * Scenes
    *
    * [[Actor|Actors]] are composed together into groupings called Scenes in 
    * Excalibur. The metaphor models the same idea behind real world 
    * actors in a scene. Only actors in scenes will be updated and drawn.
    *
    * Typical usages of a scene include: levels, menus, loading screens, etc.
    *
    * ## Adding actors to the scene
    *
    * For an [[Actor]] to be drawn and updated, it needs to be part of the "scene graph".
    * The [[Engine]] provides several easy ways to quickly add/remove actors from the
    * current scene.
    *
    * ```js
    * var game   = new ex.Engine(...);
    *
    * var player = new ex.Actor();
    * var enemy  = new ex.Actor();
    *
    * // add them to the "root" scene
    *
    * game.add(player);
    * game.add(enemy);
    *
    * // start game
    * game.start();
    * ```
    *
    * You can also add actors to a [[Scene]] instance specifically.
    *
    * ```js
    * var game   = new ex.Engine();
    * var level1 = new ex.Scene();
    *
    * var player = new ex.Actor();
    * var enemy  = new ex.Actor();
    *
    * // add actors to level1
    * level1.add(player);
    * level1.add(enemy);
    *
    * // add level1 to the game
    * game.add("level1", level1);
    *
    * // start the game
    * game.start();
    *
    * // after player clicks start game, for example
    * game.goToScene("level1");
    * 
    * ```
    *
    * ## Extending scenes
    *
    * For more complex games, you might want more control over a scene in which
    * case you can extend [[Scene]]. This is useful for menus, custom loaders,
    * and levels.
    *
    * Just use [[Engine.add]] to add a new scene to the game. You can then use
    * [[Engine.goToScene]] to switch scenes which calls [[Scene.onActivate]] for the
    * new scene and [[Scene.onDeactivate]] for the old scene. Use [[Scene.onInitialize]]
    * to perform any start-up logic, which is called once.
    *
    * **TypeScript**
    *
    * ```ts
    * class MainMenu extends ex.Scene {
    *
    *   // start-up logic, called once
    *   public onInitialize(engine: ex.Engine) { }
    *
    *   // each time the scene is entered (Engine.goToScene)
    *   public onActivate() { }
    *
    *   // each time the scene is exited (Engine.goToScene)
    *   public onDeactivate() { }
    * }
    *
    * // add to game and activate it
    * game.add("mainmenu", new MainMenu());
    * game.goToScene("mainmenu");
    * ```
    *
    * **Javascript**
    *
    * ```js
    * var MainMenu = ex.Scene.extend({
    *   // start-up logic, called once
    *   onInitialize: function (engine) { },
    *
    *   // each time the scene is activated by Engine.goToScene
    *   onActivate: function () { },
    *
    *   // each time the scene is deactivated by Engine.goToScene
    *   onDeactivate: function () { }
    * });
    *
    * game.add("mainmenu", new MainMenu());
    * game.goToScene("mainmenu");
    * ```
    *
    * ## Scene camera
    *
    * By default, a [[Scene]] is initialized with a [[BaseCamera]] which
    * does not move and centers the game world.
    *
    * Learn more about [[BaseCamera|Cameras]] and how to modify them to suit
    * your game.
    */
   export class Scene extends ex.Class {

      /**
       * The actor this scene is attached to, if any
       */
      public actor: Actor;

      /**
       * Gets or sets the current camera for the scene
       */
      public camera: BaseCamera;

      /**
       * The actors in the current scene
       */
      public children: Actor[] = [];

      /**
       * The [[TileMap]]s in the scene, if any
       */
      public tileMaps: TileMap[] = [];

      /**
       * The [[Group]]s in the scene, if any
       */
      public groups: { [key: string]: Group } = {};

      /**
       * Access to the Excalibur engine
       */
      public engine: Engine;

      /**
       * The [[UIActor]]s in a scene, if any; these are drawn last
       */
      public uiActors: Actor[] = [];

      /**
       * Whether or the [[Scene]] has been initialized
       */
      public isInitialized: boolean = false;

      private _sortedDrawingTree: SortedList<Actor> = new SortedList<Actor>(Actor.prototype.getZIndex);

      private _collisionResolver: ICollisionResolver = new DynamicTreeCollisionResolver();

      private _killQueue: Actor[] = [];
      private _timers: Timer[] = [];
      private _cancelQueue: Timer[] = [];
      private _logger: Logger = Logger.getInstance();
      
      constructor(engine?: Engine) {
         super();
         this.camera = new BaseCamera();
         if(engine) {
            this.camera.setFocus(engine.width / 2, engine.height / 2);
         }
      }

      /**
       * This is called before the first update of the [[Scene]]. Initializes scene members like the camera. This method is meant to be
       * overridden. This is where initialization of child actors should take place.
       */
      public onInitialize(engine: Engine): void {
         // will be overridden
         if (this.camera) {
            this.camera.setFocus(engine.width / 2, engine.height / 2);
         }
         this._logger.debug('Scene.onInitialize', this, engine);
      }

      /**
       * This is called when the scene is made active and started. It is meant to be overriden,
       * this is where you should setup any DOM UI or event handlers needed for the scene.
       */
      public onActivate(): void {
         // will be overridden
         this._logger.debug('Scene.onActivate', this);
      }

      /**
       * This is called when the scene is made transitioned away from and stopped. It is meant to be overriden,
       * this is where you should cleanup any DOM UI or event handlers needed for the scene.
       */
      public onDeactivate(): void {
         // will be overridden
         this._logger.debug('Scene.onDeactivate', this);
      }

      /**
       * Publish an event to all actors in the scene
       * @param eventType  The name of the event to publish
       * @param event      The event object to send 
       */
      public publish(eventType: string, event: GameEvent) {
         var i = 0, len = this.children.length;

         for (i; i < len; i++) {
            this.children[i].triggerEvent(eventType, event);
         }
      }

      /**
       * Updates all the actors and timers in the scene. Called by the [[Engine]].
       * @param engine  Reference to the current Engine
       * @param delta   The number of milliseconds since the last update
       */
      public update(engine: Engine, delta: number) {

         var i: number, len: number;

         // Cycle through actors updating UI actors
         for (i = 0, len = this.uiActors.length; i < len; i++) {
            this.uiActors[i].update(engine, delta);
         }

         // Cycle through actors updating tile maps
         for (i = 0, len = this.tileMaps.length; i < len; i++) {
            this.tileMaps[i].update(engine, delta);
         }

         // Cycle through actors updating actors
         for (i = 0, len = this.children.length; i < len; i++) {
            this.children[i].update(engine, delta);
         }

         // Run collision resolution strategy
         if (this._collisionResolver) {
            this._collisionResolver.update(this.children);
            this._collisionResolver.evaluate(this.children);
         }

         // Remove actors from scene graph after being killed
         var actorIndex: number;

         for (i = 0, len = this._killQueue.length; i < len; i++) {
            actorIndex = this.children.indexOf(this._killQueue[i]);
            if (actorIndex > -1) {
               this._sortedDrawingTree.removeByComparable(this._killQueue[i]);
               this.children.splice(actorIndex, 1);
               
            }
         }
         this._killQueue.length = 0;

         // Remove timers in the cancel queue before updating them
         for (i = 0, len = this._cancelQueue.length; i < len; i++) {
            this.removeTimer(this._cancelQueue[i]);
         }
         this._cancelQueue.length = 0;

         // Cycle through timers updating timers
         this._timers = this._timers.filter(timer => {
            timer.update(delta);
            return !timer.complete;
         });
      }

      /**
       * Draws all the actors in the Scene. Called by the [[Engine]].
       * @param ctx    The current rendering context
       * @param delta  The number of milliseconds since the last draw
       */
      public draw(ctx: CanvasRenderingContext2D, delta: number) {
         ctx.save();

         if (this.camera) {
            this.camera.update(ctx, delta);
         }

         var i: number, len: number;

         for (i = 0, len = this.tileMaps.length; i < len; i++) {
            this.tileMaps[i].draw(ctx, delta);
         }

         var sortedChildren = this._sortedDrawingTree.list();
         for (i = 0, len = sortedChildren.length; i < len; i++) {

            // only draw actors that are visible and on screen
            if (sortedChildren[i].visible && !sortedChildren[i].isOffScreen) {
               sortedChildren[i].draw(ctx, delta);
            }
         }

         if (this.engine && this.engine.isDebug) {
            ctx.strokeStyle = 'yellow';
            this.debugDraw(ctx);            
         }

         ctx.restore();
         
         for (i = 0, len = this.uiActors.length; i < len; i++) {
            // only draw ui actors that are visible and on screen
            if (this.uiActors[i].visible) {
               this.uiActors[i].draw(ctx, delta);
            }
         }

         if (this.engine && this.engine.isDebug) {
            for (i = 0, len = this.uiActors.length; i < len; i++) {
               this.uiActors[i].debugDraw(ctx);
            }
         }

      }

      /**
       * Draws all the actors' debug information in the Scene. Called by the [[Engine]].
       * @param ctx  The current rendering context
       */
      public debugDraw(ctx: CanvasRenderingContext2D) {

         var i: number, len: number;

         for (i = 0, len = this.tileMaps.length; i < len; i++) {
            this.tileMaps[i].debugDraw(ctx);
         }

         for (i = 0, len = this.children.length; i < len; i++) {
            this.children[i].debugDraw(ctx);
         }

         // todo possibly enable this with excalibur flags features?
         //this._collisionResolver.debugDraw(ctx, 20);

         this.camera.debugDraw(ctx);
      }

      /**
       * Checks whether an actor is contained in this scene or not
       */
      public contains(actor: Actor): boolean {
         return this.children.indexOf(actor) > -1;
      }

      /**
       * Adds a [[Timer]] to the current scene.
       * @param timer  The timer to add to the current scene.
       */
      public add(timer: Timer): void;

      /**
       * Adds a [[TileMap]] to the Scene, once this is done the TileMap will be drawn and updated.
       */
      public add(tileMap: TileMap): void;

      /**
       * Adds an actor to the scene, once this is done the [[Actor]] will be drawn and updated.
       * @param actor  The actor to add to the current scene
       */
      public add(actor: Actor): void;

      /**
       * Adds a [[UIActor]] to the scene.
       * @param uiActor  The UIActor to add to the current scene
       */
      public add(uiActor: UIActor): void;
      public add(entity: any): void {
         if (entity instanceof UIActor) {
            this.addUIActor(entity);
            return;
         }
         if (entity instanceof Actor) {
            if (!this._isAlreadyPresent(entity, this.children)) {
               this.addChild(entity);
               this._sortedDrawingTree.add(entity);
            }
         }
         
         if (entity instanceof Timer) {
            this.addTimer(entity);
         }

         if (entity instanceof TileMap) {
            this.addTileMap(entity);
         }
      }

      private _isAlreadyPresent(entity: any, array: Array<any>): boolean {
         var alreadyInScene = false;
         for (var i = 0; i < array.length; i++) {
            if (entity === array[i]) {
               alreadyInScene = true;
            }
         }
         return alreadyInScene;
      }
      
      /**
       * Removes a [[Timer]] from the current scene, it will no longer be updated.
       * @param timer  The timer to remove to the current scene.       
       */
      public remove(timer: Timer): void;

      /**
       * Removes a [[TileMap]] from the scene, it will no longer be drawn or updated.
       * @param tileMap {TileMap}
       */
      public remove(tileMap: TileMap): void;

      /**
       * Removes an actor from the scene, it will no longer be drawn or updated.
       * @param actor  The actor to remove from the current scene.      
       */
      public remove(actor: Actor): void;

      /**
       * Removes a [[UIActor]] to the scene, it will no longer be drawn or updated
       * @param uiActor  The UIActor to remove from the current scene
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
       * Adds (any) actor to act as a piece of UI, meaning it is always positioned
       * in screen coordinates. UI actors do not participate in collisions.
       * @todo Should this be `UIActor` only?
       */
      public addUIActor(actor: Actor) {
         this.uiActors.push(actor);
         actor.scene = this;
      }

      /**
       * Removes an actor as a piece of UI
       */
      public removeUIActor(actor: Actor) {
         var index = this.uiActors.indexOf(actor);
         if(index > -1) {
            this.uiActors.splice(index, 1);
         }
      }

      /**
       * Adds an actor to the scene, once this is done the actor will be drawn and updated.
       */
      public addChild(actor: Actor) {
         this._collisionResolver.register(actor);
         actor.scene = this;
         this.children.push(actor);
         this._sortedDrawingTree.add(actor);
         actor.parent = this.actor;
      }


      /**
       * Adds a [[TileMap]] to the scene, once this is done the TileMap will be drawn and updated.
       */
      public addTileMap(tileMap: TileMap) {
         this.tileMaps.push(tileMap);
      }

      /**
       * Removes a [[TileMap]] from the scene, it will no longer be drawn or updated.
       */
      public removeTileMap(tileMap: TileMap) {
         var index = this.tileMaps.indexOf(tileMap);
         if (index > -1) {
            this.tileMaps.splice(index, 1);
         }
      }

      /**
       * Removes an actor from the scene, it will no longer be drawn or updated.
       */
      public removeChild(actor: Actor) {
         this._collisionResolver.remove(actor);
         this._killQueue.push(actor);
         actor.parent = null;
      }

      /**
       * Adds a [[Timer]] to the scene
       * @param timer  The timer to add
       */
      public addTimer(timer: Timer): Timer {
         this._timers.push(timer);
         timer.scene = this;
         return timer;
      }

      /**
       * Removes a [[Timer]] from the scene. 
       * @warning Can be dangerous, use [[cancelTimer]] instead
       * @param timer  The timer to remove
       */
      public removeTimer(timer: Timer): Timer {
         var i = this._timers.indexOf(timer);
         if (i !== -1) {
            this._timers.splice(i, 1);
         }
         return timer;
      }

      /**
       * Cancels a [[Timer]], removing it from the scene nicely
       * @param timer  The timer to cancel
       */
      public cancelTimer(timer: Timer): Timer {
         this._cancelQueue.push(timer);
         return timer;
      }

      /**
       * Tests whether a [[Timer]] is active in the scene
       */
      public isTimerActive(timer: Timer): boolean {
         return (this._timers.indexOf(timer) > -1);
      }

      /**
       * Creates and adds a [[Group]] to the scene with a name
       */
      public createGroup(name: string): Group {
         return new Group(name, this);
      }

      /**
       * Returns a [[Group]] by name
       */
      public getGroup(name: string): Group {
         return this.groups[name];
      }

      /**
       * Removes a [[Group]] by name
       */
      public removeGroup(name: string): void;

      /**
       * Removes a [[Group]] by reference
       */
      public removeGroup(group: Group): void;
      public removeGroup(group: any): void {
         if (typeof group === 'string') {
            delete this.groups[group];
         } else if (group instanceof Group) {
            delete this.groups[group.name];
         } else {
            this._logger.error('Invalid arguments to removeGroup', group);
         }
      }

      /**
       * Removes the given actor from the sorted drawing tree
       */
      public cleanupDrawTree(actor: ex.Actor) {
         this._sortedDrawingTree.removeByComparable(actor);
      }

      /**
       * Updates the given actor's position in the sorted drawing tree
       */
      public updateDrawTree(actor: ex.Actor) {
         this._sortedDrawingTree.add(actor);
      }

   }
}