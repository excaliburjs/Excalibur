import { ScreenElement } from './ScreenElement';
import { Physics } from './Physics';
import {
  InitializeEvent,
  ActivateEvent,
  DeactivateEvent,
  PreUpdateEvent,
  PostUpdateEvent,
  PreDrawEvent,
  PostDrawEvent,
  PreDebugDrawEvent,
  PostDebugDrawEvent,
  GameEvent
} from './Events';
import { Logger } from './Util/Log';
import { Timer } from './Timer';
import { DynamicTreeCollisionBroadphase } from './Collision/DynamicTreeCollisionBroadphase';
import { CollisionBroadphase } from './Collision/CollisionResolver';
import { SortedList } from './Util/SortedList';
import { Engine } from './Engine';
import { TileMap } from './TileMap';
import { Camera } from './Camera';
import { Actor } from './Actor';
import { Class } from './Class';
import { CanInitialize, CanActivate, CanDeactivate, CanUpdate, CanDraw } from './Interfaces/LifecycleEvents';
import * as Util from './Util/Util';
import * as Events from './Events';
import * as ActorUtils from './Util/Actors';
import { Trigger } from './Trigger';
import { Body } from './Collision/Body';
import { QueryManager } from './EntityComponentSystem/QueryManager';
import { EntityManager } from './EntityComponentSystem/EntityManager';
import { SystemManager } from './EntityComponentSystem/SystemManager';
import { SystemType } from './EntityComponentSystem/System';
/**
 * [[Actor|Actors]] are composed together into groupings called Scenes in
 * Excalibur. The metaphor models the same idea behind real world
 * actors in a scene. Only actors in scenes will be updated and drawn.
 *
 * Typical usages of a scene include: levels, menus, loading screens, etc.
 */
export class Scene extends Class implements CanInitialize, CanActivate, CanDeactivate, CanUpdate, CanDraw {
  /**
   * Gets or sets the current camera for the scene
   */
  public camera: Camera;

  /**
   * The actors in the current scene
   */
  public actors: Actor[] = [];

  public queryManager: QueryManager = new QueryManager(this);
  public entityManager: EntityManager = new EntityManager(this);
  public systemManager: SystemManager = new SystemManager(this);

  /**
   * Physics bodies in the current scene
   */
  private _bodies: Body[] = [];

  /**
   * The triggers in the current scene
   */
  public triggers: Trigger[] = [];

  /**
   * The [[TileMap]]s in the scene, if any
   */
  public tileMaps: TileMap[] = [];

  /**
   * Access to the Excalibur engine
   */
  private _engine: Engine;

  /**
   * The [[ScreenElement]]s in a scene, if any; these are drawn last
   */
  public screenElements: Actor[] = [];

  private _isInitialized: boolean = false;

  private _sortedDrawingTree: SortedList<Actor> = new SortedList<Actor>(a => a.z);

  private _broadphase: CollisionBroadphase = new DynamicTreeCollisionBroadphase();

  private _killQueue: Actor[] = [];
  private _triggerKillQueue: Trigger[] = [];
  private _timers: Timer[] = [];
  private _cancelQueue: Timer[] = [];
  private _logger: Logger = Logger.getInstance();

  constructor(_engine?: Engine) {
    super();
    this.camera = new Camera();
    this._engine = _engine;
    if (_engine) {
      this.camera.x = _engine.halfDrawWidth;
      this.camera.y = _engine.halfDrawHeight;
    }
  }

  public on(eventName: Events.initialize, handler: (event: InitializeEvent<Scene>) => void): void;
  public on(eventName: Events.activate, handler: (event: ActivateEvent) => void): void;
  public on(eventName: Events.deactivate, handler: (event: DeactivateEvent) => void): void;
  public on(eventName: Events.preupdate, handler: (event: PreUpdateEvent<Scene>) => void): void;
  public on(eventName: Events.postupdate, handler: (event: PostUpdateEvent<Scene>) => void): void;
  public on(eventName: Events.predraw, handler: (event: PreDrawEvent) => void): void;
  public on(eventName: Events.postdraw, handler: (event: PostDrawEvent) => void): void;
  public on(eventName: Events.predebugdraw, handler: (event: PreDebugDrawEvent) => void): void;
  public on(eventName: Events.postdebugdraw, handler: (event: PostDebugDrawEvent) => void): void;
  public on(eventName: string, handler: (event: GameEvent<any>) => void): void;
  public on(eventName: string, handler: (event: any) => void): void {
    super.on(eventName, handler);
  }

  public once(eventName: Events.initialize, handler: (event: InitializeEvent<Scene>) => void): void;
  public once(eventName: Events.activate, handler: (event: ActivateEvent) => void): void;
  public once(eventName: Events.deactivate, handler: (event: DeactivateEvent) => void): void;
  public once(eventName: Events.preupdate, handler: (event: PreUpdateEvent<Scene>) => void): void;
  public once(eventName: Events.postupdate, handler: (event: PostUpdateEvent<Scene>) => void): void;
  public once(eventName: Events.predraw, handler: (event: PreDrawEvent) => void): void;
  public once(eventName: Events.postdraw, handler: (event: PostDrawEvent) => void): void;
  public once(eventName: Events.predebugdraw, handler: (event: PreDebugDrawEvent) => void): void;
  public once(eventName: Events.postdebugdraw, handler: (event: PostDebugDrawEvent) => void): void;
  public once(eventName: string, handler: (event: GameEvent<any>) => void): void;
  public once(eventName: string, handler: (event: any) => void): void {
    super.once(eventName, handler);
  }

  public off(eventName: Events.initialize, handler?: (event: InitializeEvent<Scene>) => void): void;
  public off(eventName: Events.activate, handler?: (event: ActivateEvent) => void): void;
  public off(eventName: Events.deactivate, handler?: (event: DeactivateEvent) => void): void;
  public off(eventName: Events.preupdate, handler?: (event: PreUpdateEvent<Scene>) => void): void;
  public off(eventName: Events.postupdate, handler?: (event: PostUpdateEvent<Scene>) => void): void;
  public off(eventName: Events.predraw, handler?: (event: PreDrawEvent) => void): void;
  public off(eventName: Events.postdraw, handler?: (event: PostDrawEvent) => void): void;
  public off(eventName: Events.predebugdraw, handler?: (event: PreDebugDrawEvent) => void): void;
  public off(eventName: Events.postdebugdraw, handler?: (event: PostDebugDrawEvent) => void): void;
  public off(eventName: string, handler?: (event: GameEvent<any>) => void): void;
  public off(eventName: string, handler?: (event: any) => void): void {
    super.off(eventName, handler);
  }

  /**
   * This is called before the first update of the [[Scene]]. Initializes scene members like the camera. This method is meant to be
   * overridden. This is where initialization of child actors should take place.
   */
  public onInitialize(_engine: Engine): void {
    // will be overridden
  }

  /**
   * This is called when the scene is made active and started. It is meant to be overridden,
   * this is where you should setup any DOM UI or event handlers needed for the scene.
   */
  public onActivate(_oldScene: Scene, _newScene: Scene): void {
    // will be overridden
  }

  /**
   * This is called when the scene is made transitioned away from and stopped. It is meant to be overridden,
   * this is where you should cleanup any DOM UI or event handlers needed for the scene.
   */
  public onDeactivate(_oldScene: Scene, _newScene: Scene): void {
    // will be overridden
  }

  /**
   * Safe to override onPreUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
   *
   * `onPreUpdate` is called directly before a scene is updated.
   */
  public onPreUpdate(_engine: Engine, _delta: number): void {
    // will be overridden
  }

  /**
   * Safe to override onPostUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
   *
   * `onPostUpdate` is called directly after a scene is updated.
   */
  public onPostUpdate(_engine: Engine, _delta: number): void {
    // will be overridden
  }

  /**
   * Safe to override onPreDraw lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
   *
   * `onPreDraw` is called directly before a scene is drawn.
   */
  public onPreDraw(_ctx: CanvasRenderingContext2D, _delta: number): void {
    // will be overridden
  }

  /**
   * Safe to override onPostDraw lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
   *
   * `onPostDraw` is called directly after a scene is drawn.
   */
  public onPostDraw(_ctx: CanvasRenderingContext2D, _delta: number): void {
    // will be overridden
  }

  /**
   * Initializes actors in the scene
   */
  private _initializeChildren(): void {
    for (const child of this.actors) {
      child._initialize(this._engine);
    }
  }

  /**
   * Gets whether or not the [[Scene]] has been initialized
   */
  public get isInitialized(): boolean {
    return this._isInitialized;
  }

  /**
   * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
   *
   * Initializes the scene before the first update, meant to be called by engine not by users of
   * Excalibur
   * @internal
   */
  public _initialize(engine: Engine) {
    if (!this.isInitialized) {
      this._engine = engine;
      if (this.camera) {
        this.camera.x = engine.halfDrawWidth;
        this.camera.y = engine.halfDrawHeight;
      }

      // This order is important! we want to be sure any custom init that add actors
      // fire before the actor init
      this.onInitialize.call(this, engine);
      this._initializeChildren();

      this._logger.debug('Scene.onInitialize', this, engine);
      this.eventDispatcher.emit('initialize', new InitializeEvent(engine, this));
      this._isInitialized = true;
    }
  }

  /**
   * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
   *
   * Activates the scene with the base behavior, then calls the overridable `onActivate` implementation.
   * @internal
   */
  public _activate(oldScene: Scene, newScene: Scene): void {
    this._logger.debug('Scene.onActivate', this);
    this.onActivate(oldScene, newScene);
  }

  /**
   * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
   *
   * Deactivates the scene with the base behavior, then calls the overridable `onDeactivate` implementation.
   * @internal
   */
  public _deactivate(oldScene: Scene, newScene: Scene): void {
    this._logger.debug('Scene.onDeactivate', this);
    this.onDeactivate(oldScene, newScene);
  }

  /**
   * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
   *
   * Internal _preupdate handler for [[onPreUpdate]] lifecycle event
   * @internal
   */
  public _preupdate(_engine: Engine, delta: number): void {
    this.emit('preupdate', new PreUpdateEvent(_engine, delta, this));
    this.onPreUpdate(_engine, delta);
  }

  /**
   *  It is not recommended that internal excalibur methods be overridden, do so at your own risk.
   *
   * Internal _preupdate handler for [[onPostUpdate]] lifecycle event
   * @internal
   */
  public _postupdate(_engine: Engine, delta: number): void {
    this.emit('postupdate', new PostUpdateEvent(_engine, delta, this));
    this.onPostUpdate(_engine, delta);
  }

  /**
   * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
   *
   * Internal _predraw handler for [[onPreDraw]] lifecycle event
   *
   * @internal
   */
  public _predraw(_ctx: CanvasRenderingContext2D, _delta: number): void {
    this.emit('predraw', new PreDrawEvent(_ctx, _delta, this));
    this.onPreDraw(_ctx, _delta);
  }

  /**
   * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
   *
   * Internal _postdraw handler for [[onPostDraw]] lifecycle event
   *
   * @internal
   */
  public _postdraw(_ctx: CanvasRenderingContext2D, _delta: number): void {
    this.emit('postdraw', new PostDrawEvent(_ctx, _delta, this));
    this.onPostDraw(_ctx, _delta);
  }

  /**
   * Updates all the actors and timers in the scene. Called by the [[Engine]].
   * @param engine  Reference to the current Engine
   * @param delta   The number of milliseconds since the last update
   */
  public update(engine: Engine, delta: number) {
    this._preupdate(engine, delta);
    this.systemManager.updateSystems(SystemType.Update, engine, delta);
    this.entityManager.processRemovals();

    if (this.camera) {
      this.camera.update(engine, delta);
    }

    let i: number, len: number;
    // Remove timers in the cancel queue before updating them
    for (i = 0, len = this._cancelQueue.length; i < len; i++) {
      this.removeTimer(this._cancelQueue[i]);
    }
    this._cancelQueue.length = 0;

    // Cycle through timers updating timers
    for (const timer of this._timers) {
      timer.update(delta);
    }

    // Cycle through actors updating UI actors
    for (i = 0, len = this.screenElements.length; i < len; i++) {
      this.screenElements[i].update(engine, delta);
    }

    // Cycle through actors updating tile maps
    for (i = 0, len = this.tileMaps.length; i < len; i++) {
      this.tileMaps[i].update(engine, delta);
    }

    // Cycle through actors updating actors
    for (i = 0, len = this.actors.length; i < len; i++) {
      this.actors[i].update(engine, delta);
      this._bodies[i] = this.actors[i].body;
    }

    // Cycle through triggers updating
    for (i = 0, len = this.triggers.length; i < len; i++) {
      this.triggers[i].update(engine, delta);
    }

    this._collectActorStats(engine);

    engine.input.pointers.dispatchPointerEvents();

    // Run the broadphase and narrowphase
    if (this._broadphase && Physics.enabled) {
      const beforeBroadphase = Date.now();
      this._broadphase.update(this._bodies, delta);
      let pairs = this._broadphase.broadphase(this._bodies, delta, engine.stats.currFrame);
      const afterBroadphase = Date.now();

      const beforeNarrowphase = Date.now();
      let iter: number = Physics.collisionPasses;
      const collisionDelta = delta / iter;
      while (iter > 0) {
        // Run the narrowphase
        pairs = this._broadphase.narrowphase(pairs, engine.stats.currFrame);
        // Run collision resolution strategy
        pairs = this._broadphase.resolve(pairs, collisionDelta, Physics.collisionResolutionStrategy);

        this._broadphase.runCollisionStartEnd(pairs);

        iter--;
      }

      const afterNarrowphase = Date.now();
      engine.stats.currFrame.physics.broadphase = afterBroadphase - beforeBroadphase;
      engine.stats.currFrame.physics.narrowphase = afterNarrowphase - beforeNarrowphase;
    }

    engine.stats.currFrame.actors.killed = this._killQueue.length + this._triggerKillQueue.length;

    this._processKillQueue(this._killQueue, this.actors);
    this._processKillQueue(this._triggerKillQueue, this.triggers);

    this._postupdate(engine, delta);
  }

  private _processKillQueue(killQueue: Actor[], collection: Actor[]) {
    // Remove actors from scene graph after being killed
    let actorIndex: number;
    for (const killed of killQueue) {
      //don't remove actors that were readded during the same frame they were killed
      if (killed.isKilled()) {
        actorIndex = collection.indexOf(killed);
        if (actorIndex > -1) {
          this._sortedDrawingTree.removeByComparable(killed);
          collection.splice(actorIndex, 1);
        }
      }
    }
    killQueue.length = 0;
  }

  /**
   * Draws all the actors in the Scene. Called by the [[Engine]].
   * @param ctx    The current rendering context
   * @param delta  The number of milliseconds since the last draw
   */
  public draw(ctx: CanvasRenderingContext2D, delta: number) {
    this._predraw(ctx, delta);
    ctx.save();
    if (this.camera) {
      this.camera.draw(ctx);
    }
    this.systemManager.updateSystems(SystemType.Draw, this._engine, delta);
    this.entityManager.processRemovals();

    let i: number, len: number;

    for (i = 0, len = this.tileMaps.length; i < len; i++) {
      this.tileMaps[i].draw(ctx, delta);
    }

    const sortedChildren = this._sortedDrawingTree.list();
    for (i = 0, len = sortedChildren.length; i < len; i++) {
      // only draw actors that are visible and on screen
      if (sortedChildren[i].visible && !sortedChildren[i].isOffScreen) {
        sortedChildren[i].draw(ctx, delta);
      }
    }

    if (this._engine && this._engine.isDebug) {
      ctx.strokeStyle = 'yellow';
      this.debugDraw(ctx);
    }

    ctx.restore();

    for (i = 0, len = this.screenElements.length; i < len; i++) {
      // only draw ui actors that are visible and on screen
      if (this.screenElements[i].visible) {
        this.screenElements[i].draw(ctx, delta);
      }
    }

    if (this._engine && this._engine.isDebug) {
      for (i = 0, len = this.screenElements.length; i < len; i++) {
        this.screenElements[i].debugDraw(ctx);
      }
    }
    this._postdraw(ctx, delta);
  }

  /**
   * Draws all the actors' debug information in the Scene. Called by the [[Engine]].
   * @param ctx  The current rendering context
   */
  /* istanbul ignore next */
  public debugDraw(ctx: CanvasRenderingContext2D) {
    this.emit('predebugdraw', new PreDebugDrawEvent(ctx, this));

    let i: number, len: number;

    for (i = 0, len = this.tileMaps.length; i < len; i++) {
      this.tileMaps[i].debugDraw(ctx);
    }

    for (i = 0, len = this.actors.length; i < len; i++) {
      this.actors[i].debugDraw(ctx);
    }

    for (i = 0, len = this.triggers.length; i < len; i++) {
      this.triggers[i].debugDraw(ctx);
    }

    this._broadphase.debugDraw(ctx, 20);

    this.camera.debugDraw(ctx);
    this.emit('postdebugdraw', new PostDebugDrawEvent(ctx, this));
  }

  /**
   * Checks whether an actor is contained in this scene or not
   */
  public contains(actor: Actor): boolean {
    return this.actors.indexOf(actor) > -1;
  }

  /**
   * Adds a [[Timer]] to the current [[Scene]].
   * @param timer  The timer to add to the current [[Scene]].
   */
  public add(timer: Timer): void;

  /**
   * Adds a [[TileMap]] to the [[Scene]], once this is done the [[TileMap]] will be drawn and updated.
   */
  public add(tileMap: TileMap): void;

  /**
   * Adds a [[Trigger]] to the [[Scene]], once this is done the [[Trigger]] will listen for interactions with other actors.
   * @param trigger
   */
  public add(trigger: Trigger): void;

  /**
   * Adds an actor to the scene, once this is done the [[Actor]] will be drawn and updated.
   * @param actor  The actor to add to the current scene
   */
  public add(actor: Actor): void;

  /**
   * Adds a [[ScreenElement]] to the scene.
   * @param screenElement  The ScreenElement to add to the current scene
   */
  public add(screenElement: ScreenElement): void;
  public add(entity: any): void {
    if (entity instanceof Actor) {
      (<Actor>entity).unkill();
    }
    if (entity instanceof ScreenElement) {
      if (!Util.contains(this.screenElements, entity)) {
        this.addScreenElement(entity);
      }
      return;
    }

    if (entity instanceof Actor) {
      if (!Util.contains(this.actors, entity)) {
        this._addChild(entity);
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
   * Removes a [[ScreenElement]] to the scene, it will no longer be drawn or updated
   * @param screenElement  The ScreenElement to remove from the current scene
   */
  public remove(screenElement: ScreenElement): void;
  public remove(entity: any): void {
    if (entity instanceof ScreenElement) {
      this.removeScreenElement(entity);
      return;
    }

    if (entity instanceof Actor) {
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
   * @todo Should this be `ScreenElement` only?
   */
  public addScreenElement(actor: Actor) {
    this.screenElements.push(actor);
    actor.scene = this;
  }

  /**
   * Removes an actor as a piece of UI
   */
  public removeScreenElement(actor: Actor) {
    const index = this.screenElements.indexOf(actor);
    if (index > -1) {
      this.screenElements.splice(index, 1);
    }
  }

  /**
   * Adds an actor to the scene, once this is done the actor will be drawn and updated.
   */
  protected _addChild(actor: Actor) {
    this._broadphase.track(actor.body);
    actor.scene = this;
    if (actor instanceof Trigger) {
      this.triggers.push(actor);
    } else {
      this.actors.push(actor);
    }

    this._sortedDrawingTree.add(actor);
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
    const index = this.tileMaps.indexOf(tileMap);
    if (index > -1) {
      this.tileMaps.splice(index, 1);
    }
  }

  /**
   * Removes an actor from the scene, it will no longer be drawn or updated.
   */
  protected _removeChild(actor: Actor) {
    if (!Util.contains(this.actors, actor)) {
      return;
    }
    this._broadphase.untrack(actor.body);
    if (actor instanceof Trigger) {
      this._triggerKillQueue.push(actor);
    } else {
      if (!actor.isKilled()) {
        actor.kill();
      }
      this._killQueue.push(actor);
    }

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
    const i = this._timers.indexOf(timer);
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
    return this._timers.indexOf(timer) > -1 && !timer.complete;
  }

  /**
   * Removes the given actor from the sorted drawing tree
   */
  public cleanupDrawTree(actor: Actor) {
    this._sortedDrawingTree.removeByComparable(actor);
  }

  /**
   * Updates the given actor's position in the sorted drawing tree
   */
  public updateDrawTree(actor: Actor) {
    this._sortedDrawingTree.add(actor);
  }

  /**
   * Checks if an actor is in this scene's sorted draw tree
   */
  public isActorInDrawTree(actor: Actor): boolean {
    return this._sortedDrawingTree.find(actor);
  }

  public isCurrentScene(): boolean {
    if (this._engine) {
      return this._engine.currentScene === this;
    }
    return false;
  }

  private _collectActorStats(engine: Engine) {
    for (const _ui of this.screenElements) {
      engine.stats.currFrame.actors.ui++;
    }

    for (const actor of this.actors) {
      engine.stats.currFrame.actors.alive++;
      for (const child of actor.children) {
        if (ActorUtils.isScreenElement(child)) {
          engine.stats.currFrame.actors.ui++;
        } else {
          engine.stats.currFrame.actors.alive++;
        }
      }
    }
  }
}
