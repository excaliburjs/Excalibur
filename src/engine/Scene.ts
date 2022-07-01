import { isScreenElement, ScreenElement } from './ScreenElement';
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
import { Engine } from './Engine';
import { TileMap } from './TileMap';
import { Camera } from './Camera';
import { Actor } from './Actor';
import { Class } from './Class';
import { CanInitialize, CanActivate, CanDeactivate, CanUpdate, CanDraw, SceneActivationContext } from './Interfaces/LifecycleEvents';
import * as Util from './Util/Util';
import * as Events from './Events';
import { Trigger } from './Trigger';
import { SystemType } from './EntityComponentSystem/System';
import { World } from './EntityComponentSystem/World';
import { MotionSystem } from './Collision/MotionSystem';
import { CollisionSystem } from './Collision/CollisionSystem';
import { Entity } from './EntityComponentSystem/Entity';
import { GraphicsSystem } from './Graphics/GraphicsSystem';
import { DebugSystem } from './Debug/DebugSystem';
import { PointerSystem } from './Input/PointerSystem';
import { ActionsSystem } from './Actions/ActionsSystem';
import { IsometricEntitySystem } from './TileMap/IsometricEntitySystem';
import { OffscreenSystem } from './Graphics/OffscreenSystem';
import { ExcaliburGraphicsContext } from './Graphics';
/**
 * [[Actor|Actors]] are composed together into groupings called Scenes in
 * Excalibur. The metaphor models the same idea behind real world
 * actors in a scene. Only actors in scenes will be updated and drawn.
 *
 * Typical usages of a scene include: levels, menus, loading screens, etc.
 */
export class Scene<TActivationData = unknown>
  extends Class
  implements CanInitialize, CanActivate<TActivationData>, CanDeactivate, CanUpdate, CanDraw {
  private _logger: Logger = Logger.getInstance();
  /**
   * Gets or sets the current camera for the scene
   */
  public camera: Camera = new Camera();

  /**
   * The ECS world for the scene
   */
  public world = new World(this);

  /**
   * The actors in the current scene
   */
  public get actors(): readonly Actor[] {
    return this.world.entityManager.entities.filter((e) => {
      return e instanceof Actor;
    }) as Actor[];
  }

  /**
   * The entities in the current scene
   */
  public get entities(): readonly Entity[] {
    return this.world.entityManager.entities;
  }

  /**
   * The triggers in the current scene
   */
  public get triggers(): readonly Trigger[] {
    return this.world.entityManager.entities.filter((e) => {
      return e instanceof Trigger;
    }) as Trigger[];
  }

  /**
   * The [[TileMap]]s in the scene, if any
   */
  public get tileMaps(): readonly TileMap[] {
    return this.world.entityManager.entities.filter((e) => {
      return e instanceof TileMap;
    }) as TileMap[];
  }

  /**
   * Access to the Excalibur engine
   */
  public engine: Engine;

  private _isInitialized: boolean = false;
  private _timers: Timer[] = [];
  public get timers(): readonly Timer[] {
    return this._timers;
  }
  private _cancelQueue: Timer[] = [];

  constructor() {
    super();
    // Initialize systems

    // Update
    this.world.add(new ActionsSystem());
    this.world.add(new MotionSystem());
    this.world.add(new CollisionSystem());
    this.world.add(new PointerSystem());
    this.world.add(new IsometricEntitySystem());
    // Draw
    this.world.add(new OffscreenSystem());
    this.world.add(new GraphicsSystem());
    this.world.add(new DebugSystem());
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
  public onActivate(_context: SceneActivationContext<TActivationData>): void {
    // will be overridden
  }

  /**
   * This is called when the scene is made transitioned away from and stopped. It is meant to be overridden,
   * this is where you should cleanup any DOM UI or event handlers needed for the scene.
   */
  public onDeactivate(_context: SceneActivationContext): void {
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
   *
   */
  public onPreDraw(_ctx: ExcaliburGraphicsContext, _delta: number): void {
    // will be overridden
  }

  /**
   * Safe to override onPostDraw lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
   *
   * `onPostDraw` is called directly after a scene is drawn.
   *
   */
  public onPostDraw(_ctx: ExcaliburGraphicsContext, _delta: number): void {
    // will be overridden
  }

  /**
   * Initializes actors in the scene
   */
  private _initializeChildren(): void {
    for (const child of this.entities) {
      child._initialize(this.engine);
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
      this.engine = engine;
      // Initialize camera first
      this.camera._initialize(engine);

      this.world.systemManager.initialize();

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
  public _activate(context: SceneActivationContext<TActivationData>): void {
    this._logger.debug('Scene.onActivate', this);
    this.onActivate(context);
  }

  /**
   * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
   *
   * Deactivates the scene with the base behavior, then calls the overridable `onDeactivate` implementation.
   * @internal
   */
  public _deactivate(context: SceneActivationContext<never>): void {
    this._logger.debug('Scene.onDeactivate', this);
    this.onDeactivate(context);
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
  public _predraw(_ctx: ExcaliburGraphicsContext, _delta: number): void {
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
  public _postdraw(_ctx: ExcaliburGraphicsContext, _delta: number): void {
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

    // TODO differed entity removal for timers
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

    this.world.update(SystemType.Update, delta);

    // Camera last keeps renders smooth that are based on entity/actor
    if (this.camera) {
      this.camera.update(engine, delta);
    }

    this._collectActorStats(engine);

    this._postupdate(engine, delta);
  }

  /**
   * Draws all the actors in the Scene. Called by the [[Engine]].
   *
   * @param ctx    The current rendering context
   * @param delta  The number of milliseconds since the last draw
   */
  public draw(ctx: ExcaliburGraphicsContext, delta: number) {
    this._predraw(ctx, delta);

    this.world.update(SystemType.Draw, delta);

    if (this.engine?.isDebug) {
      this.debugDraw(ctx);
    }
    this._postdraw(ctx, delta);
  }

  /**
   * Draws all the actors' debug information in the Scene. Called by the [[Engine]].
   * @param ctx  The current rendering context
   */
  /* istanbul ignore next */
  public debugDraw(ctx: ExcaliburGraphicsContext) {
    this.emit('predebugdraw', new PreDebugDrawEvent(ctx, this));
    // pass
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

  public add(entity: Entity): void;

  /**
   * Adds a [[ScreenElement]] to the scene.
   * @param screenElement  The ScreenElement to add to the current scene
   */
  public add(screenElement: ScreenElement): void;
  public add(entity: any): void {
    this.emit('entityadded', { target: entity } as any);
    this.world.add(entity);
    entity.scene = this;
    if (entity instanceof Timer) {
      if (!Util.contains(this._timers, entity)) {
        this.addTimer(entity);
      }
      return;
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

  public remove(entity: Entity): void;

  /**
   * Removes a [[ScreenElement]] to the scene, it will no longer be drawn or updated
   * @param screenElement  The ScreenElement to remove from the current scene
   */
  public remove(screenElement: ScreenElement): void;
  public remove(entity: any): void {
    if (entity instanceof Entity) {
      this.emit('entityremoved', { target: entity } as any);
      this.world.remove(entity);
    }
    if (entity instanceof Timer) {
      this.removeTimer(entity);
    }
  }

  /**
   * Removes all entities and timers from the scene, optionally indicate whether deferred should or shouldn't be used.
   *
   * By default entities use deferred removal
   * @param deferred
   */
  public clear(deferred: boolean = true): void {
    for (const entity of this.entities) {
      this.world.remove(entity, deferred);
    }
    for (const timer of this.timers) {
      this.removeTimer(timer);
    }
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

  public isCurrentScene(): boolean {
    if (this.engine) {
      return this.engine.currentScene === this;
    }
    return false;
  }

  private _collectActorStats(engine: Engine) {
    const screenElements = this.actors.filter((a) => a instanceof ScreenElement) as ScreenElement[];
    for (const _ui of screenElements) {
      engine.stats.currFrame.actors.ui++;
    }

    for (const actor of this.actors) {
      engine.stats.currFrame.actors.alive++;
      for (const child of actor.children) {
        if (isScreenElement(child as Actor)) {
          // TODO not true
          engine.stats.currFrame.actors.ui++;
        } else {
          engine.stats.currFrame.actors.alive++;
        }
      }
    }
  }
}
