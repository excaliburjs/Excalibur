/// <reference path="Class.ts" />
/// <reference path="Timer.ts" />
/// <reference path="Collision/NaiveCollisionBroadphase.ts"/>
/// <reference path="Collision/DynamicTreeCollisionBroadphase.ts"/>
/// <reference path="Camera.ts" />
/// <reference path="Group.ts"/>
/// <reference path="Util/SortedList.ts"/>

module ex {

   /**
    * [[Actor|Actors]] are composed together into groupings called Scenes in 
    * Excalibur. The metaphor models the same idea behind real world 
    * actors in a scene. Only actors in scenes will be updated and drawn.
    *
    * Typical usages of a scene include: levels, menus, loading screens, etc.
    *
    * [[include:Scenes.md]]
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

      private _broadphase: ICollisionBroadphase = new DynamicTreeCollisionBroadphase();

      private _killQueue: Actor[] = [];
      private _timers: Timer[] = [];
      private _cancelQueue: Timer[] = [];
      private _logger: Logger = Logger.getInstance();
      
      constructor(engine?: Engine) {
         super();
         this.camera = new BaseCamera();
         if (engine) {
            this.camera.x = engine.width / 2;
            this.camera.y = engine.height / 2;
         }
      }

      public on(eventName: ex.Events.initialize, handler: (event?: InitializeEvent) => void);
      public on(eventName: ex.Events.activate, handler: (event?: ActivateEvent) => void);
      public on(eventName: ex.Events.deactivate, handler: (event?: DeactivateEvent) => void);
      public on(eventName: ex.Events.preupdate, handler: (event?: PreUpdateEvent) => void);
      public on(eventName: ex.Events.postupdate, handler: (event?: PostUpdateEvent) => void);
      public on(eventName: ex.Events.predraw, handler: (event?: PreDrawEvent) => void);
      public on(eventName: ex.Events.postdraw, handler: (event?: PostDrawEvent) => void);
      public on(eventName: ex.Events.predebugdraw, handler: (event?: PreDebugDrawEvent) => void);
      public on(eventName: ex.Events.postdebugdraw, handler: (event?: PostDebugDrawEvent) => void);
      public on(eventName: string, handler: (event?: GameEvent) => void);
      public on(eventName: string, handler: (event?: GameEvent) => void) {
         super.on(eventName, handler);
      }


      /**
       * This is called before the first update of the [[Scene]]. Initializes scene members like the camera. This method is meant to be
       * overridden. This is where initialization of child actors should take place.
       */
      public onInitialize(engine: Engine): void {
         // will be overridden
         if (this.camera) {
            this.camera.x = engine.width / 2;
            this.camera.y = engine.height / 2;
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
       * Updates all the actors and timers in the scene. Called by the [[Engine]].
       * @param engine  Reference to the current Engine
       * @param delta   The number of milliseconds since the last update
       */
      public update(engine: Engine, delta: number) {
         this.emit('preupdate', new PreUpdateEvent(engine, delta, this));
         var i: number, len: number;

         if (this.camera) {
            this.camera.update(engine, delta);
         }

         // Cycle through actors updating UI actors
         for (i = 0, len = this.uiActors.length; i < len; i++) {
            engine.stats.currFrame.actors.ui++;
            this.uiActors[i].update(engine, delta);
         }

         // Cycle through actors updating tile maps
         for (i = 0, len = this.tileMaps.length; i < len; i++) {
            this.tileMaps[i].update(engine, delta);
         }

         // Cycle through actors updating actors
         for (i = 0, len = this.children.length; i < len; i++) {
            engine.stats.currFrame.actors.alive++;
            this.children[i].update(engine, delta);
         }
         
         // Run the broadphase and narrowphase
         if (this._broadphase && Physics.enabled) {
            var beforeBroadphase = Date.now();            
            this._broadphase.update(this.children, delta);
            var pairs = this._broadphase.broadphase(this.children, delta, engine.stats.currFrame);
            var afterBroadphase = Date.now();

            var beforeNarrowphase = Date.now();
            var iter: number = Physics.collisionPasses;
            var collisionDelta = delta / iter;
            while (iter > 0) {
               // Run the narrowphase
               this._broadphase.narrowphase(pairs, engine.stats.currFrame); 
               // Run collision resolution strategy
               this._broadphase.resolve(collisionDelta, Physics.collisionResolutionStrategy);
               iter--;
            }
            var afterNarrowphase = Date.now();
            engine.stats.currFrame.physics.broadphase = afterBroadphase - beforeBroadphase;
            engine.stats.currFrame.physics.narrowphase = afterNarrowphase - beforeNarrowphase;
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
         engine.stats.currFrame.actors.killed = this._killQueue.length;
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
         
         this.emit('postupdate', new PostUpdateEvent(engine, delta, this));
      }

      /**
       * Draws all the actors in the Scene. Called by the [[Engine]].
       * @param ctx    The current rendering context
       * @param delta  The number of milliseconds since the last draw
       */
      public draw(ctx: CanvasRenderingContext2D, delta: number) {
         this.emit('predraw', new PreDrawEvent(ctx, delta, this));
         ctx.save();         
         
         if (this.camera) {
            this.camera.draw(ctx, delta);
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
         this.emit('postdraw', new PostDrawEvent(ctx, delta, this));
      }

      /**
       * Draws all the actors' debug information in the Scene. Called by the [[Engine]].
       * @param ctx  The current rendering context
       */
      /* istanbul ignore next */
      public debugDraw(ctx: CanvasRenderingContext2D) {
         this.emit('predebugdraw', new PreDebugDrawEvent(ctx, this));

         var i: number, len: number;

         for (i = 0, len = this.tileMaps.length; i < len; i++) {
            this.tileMaps[i].debugDraw(ctx);
         }

         for (i = 0, len = this.children.length; i < len; i++) {
            this.children[i].debugDraw(ctx);
         }
                  
         this._broadphase.debugDraw(ctx, 20);         

         this.camera.debugDraw(ctx);
         this.emit('postdebugdraw', new PostDebugDrawEvent(ctx, this));
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
         if (entity instanceof Actor) {
            (<Actor>entity).unkill();
         }
         if (entity instanceof UIActor) {
            if (!Util.contains(this.uiActors, entity)) {
               this.addUIActor(entity);
            }
            return;
         }
         if (entity instanceof Actor) {
            if (!Util.contains(this.children, entity)) {
               this._addChild(entity);
               this._sortedDrawingTree.add(entity);
            }
            return;
         }
         if (entity instanceof Timer) {
            if (!Util.contains(this._timers, entity)) {
               this.addTimer(entity);
            }
            return;
         }
         if (entity instanceof TileMap) {
            if (!Util.contains(this.tileMaps, entity)) {
               this.addTileMap(entity);
            }
         }
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
            this._broadphase.untrack(entity.body);
            this._removeChild(entity);
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
         if (index > -1) {
            this.uiActors.splice(index, 1);
         }
      }

      /**
       * Adds an actor to the scene, once this is done the actor will be drawn and updated.       
       */
      protected _addChild(actor: Actor) {
         this._broadphase.track(actor.body);
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
      protected _removeChild(actor: Actor) {
         this._broadphase.untrack(actor.body);
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