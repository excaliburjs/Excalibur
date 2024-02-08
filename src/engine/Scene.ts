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
  PostDebugDrawEvent
} from './Events';
import { Logger } from './Util/Log';
import { Timer } from './Timer';
import { Engine } from './Engine';
import { TileMap } from './TileMap';
import { Camera } from './Camera';
import { Actor } from './Actor';
import { CanInitialize, CanActivate, CanDeactivate, CanUpdate, CanDraw, SceneActivationContext } from './Interfaces/LifecycleEvents';
import * as Util from './Util/Util';
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
import { PhysicsWorld } from './Collision/PhysicsWorld';
import { EventEmitter, EventKey, Handler, Subscription } from './EventEmitter';
import { Color } from './Color';
import { DefaultLoader } from './Director/DefaultLoader';
import { Transition } from './Director';
import { InputHost } from './Input/InputHost';
import { PointerScope } from './Input/PointerScope';
import { DefaultPhysicsConfig } from './Collision/PhysicsConfig';

export class PreLoadEvent {
  loader: DefaultLoader;
}

export type SceneEvents = {
  initialize: InitializeEvent<Scene>,
  activate: ActivateEvent,
  deactivate: DeactivateEvent,
  preupdate: PreUpdateEvent,
  postupdate: PostUpdateEvent,
  predraw: PreDrawEvent,
  postdraw: PostDrawEvent,
  predebugdraw: PreDebugDrawEvent,
  postdebugdraw: PostDebugDrawEvent
  preload: PreLoadEvent
}

export const SceneEvents = {
  Initialize: 'initialize',
  Activate: 'activate',
  Deactivate: 'deactivate',
  PreUpdate: 'preupdate',
  PostUpdate: 'postupdate',
  PreDraw: 'predraw',
  PostDraw: 'postdraw',
  PreDebugDraw: 'predebugdraw',
  PostDebugDraw: 'postdebugdraw',
  PreLoad: 'preload'
};

export type SceneConstructor = new (...args: any[]) => Scene;
/**
 *
 */
export function isSceneConstructor(x: any): x is SceneConstructor {
  return !!x?.prototype && !!x?.prototype?.constructor?.name;
}

/**
 * [[Actor|Actors]] are composed together into groupings called Scenes in
 * Excalibur. The metaphor models the same idea behind real world
 * actors in a scene. Only actors in scenes will be updated and drawn.
 *
 * Typical usages of a scene include: levels, menus, loading screens, etc.
 */
export class Scene<TActivationData = unknown>
implements CanInitialize, CanActivate<TActivationData>, CanDeactivate, CanUpdate, CanDraw {
  private _logger: Logger = Logger.getInstance();
  public events = new EventEmitter<SceneEvents>();

  /**
   * Gets or sets the current camera for the scene
   */
  public camera: Camera = new Camera();

  /**
   * Scene specific background color
   */
  public backgroundColor?: Color;

  /**
   * The ECS world for the scene
   */
  public world: World = new World(this);

  /**
   * The Excalibur physics world for the scene. Used to interact
   * with colliders included in the scene.
   *
   * Can be used to perform scene ray casts, track colliders, broadphase, and narrowphase.
   */
  public physics = new PhysicsWorld(DefaultPhysicsConfig);

  /**
   * The actors in the current scene
   */
  public get actors(): readonly Actor[] {
    return this.world.entityManager.entities.filter((e: Entity<any>) => {
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
    return this.world.entityManager.entities.filter((e: Entity<any>) => {
      return e instanceof Trigger;
    }) as Trigger[];
  }

  /**
   * The [[TileMap]]s in the scene, if any
   */
  public get tileMaps(): readonly TileMap[] {
    return this.world.entityManager.entities.filter((e: Entity<any>) => {
      return e instanceof TileMap;
    }) as TileMap[];
  }

  /**
   * Access to the Excalibur engine
   */
  public engine: Engine;

  /**
   * Access scene specific input, handlers on this only fire when this scene is active.
   */
  public input: InputHost;

  private _isInitialized: boolean = false;
  private _timers: Timer[] = [];
  public get timers(): readonly Timer[] {
    return this._timers;
  }
  private _cancelQueue: Timer[] = [];

  constructor() {
    // Initialize systems

    // Update
    this.world.add(ActionsSystem);
    this.world.add(new MotionSystem(this.world, this.physics));
    this.world.add(new CollisionSystem(this.world, this.physics));
    this.world.add(PointerSystem);
    this.world.add(IsometricEntitySystem);
    // Draw
    this.world.add(OffscreenSystem);
    this.world.add(GraphicsSystem);
    this.world.add(DebugSystem);
  }

  public emit<TEventName extends EventKey<SceneEvents>>(eventName: TEventName, event: SceneEvents[TEventName]): void;
  public emit(eventName: string, event?: any): void;
  public emit<TEventName extends EventKey<SceneEvents> | string>(eventName: TEventName, event?: any): void {
    this.events.emit(eventName, event);
  }

  public on<TEventName extends EventKey<SceneEvents>>(eventName: TEventName, handler: Handler<SceneEvents[TEventName]>): Subscription;
  public on(eventName: string, handler: Handler<unknown>): Subscription;
  public on<TEventName extends EventKey<SceneEvents> | string>(eventName: TEventName, handler: Handler<any>): Subscription {
    return this.events.on(eventName, handler);
  }

  public once<TEventName extends EventKey<SceneEvents>>(eventName: TEventName, handler: Handler<SceneEvents[TEventName]>): Subscription;
  public once(eventName: string, handler: Handler<unknown>): Subscription;
  public once<TEventName extends EventKey<SceneEvents> | string>(eventName: TEventName, handler: Handler<any>): Subscription {
    return this.events.once(eventName, handler);
  }

  public off<TEventName extends EventKey<SceneEvents>>(eventName: TEventName, handler: Handler<SceneEvents[TEventName]>): void;
  public off(eventName: string, handler: Handler<unknown>): void;
  public off(eventName: string): void;
  public off<TEventName extends EventKey<SceneEvents> | string>(eventName: TEventName, handler?: Handler<any>): void {
    this.events.off(eventName, handler);
  }

  /**
   * Event hook to provide Scenes a way of loading scene specific resources.
   *
   * This is called before the Scene.onInitialize during scene transition. It will only ever fire once for a scene.
   * @param loader
   */
  public onPreLoad(loader: DefaultLoader) {
    // will be overridden
  }

  /**
   * Event hook fired directly before transition, either "in" or "out" of the scene
   *
   * This overrides the Engine scene definition. However transitions specified in goto take hightest precedence
   *
   * ```typescript
   * // Overrides all
   * Engine.goto('scene', { destinationIn: ..., sourceOut: ... });
   * ```
   *
   * This can be used to configure custom transitions for a scene dynamically
   */
  public onTransition(direction: 'in' | 'out'): Transition | undefined {
    // will be overridden
    return undefined;
  }

  /**
   * This is called before the first update of the [[Scene]]. Initializes scene members like the camera. This method is meant to be
   * overridden. This is where initialization of child actors should take place.
   */
  public onInitialize(engine: Engine): void {
    // will be overridden
  }

  /**
   * This is called when the scene is made active and started. It is meant to be overridden,
   * this is where you should setup any DOM UI or event handlers needed for the scene.
   */
  public onActivate(context: SceneActivationContext<TActivationData>): void {
    // will be overridden
  }

  /**
   * This is called when the scene is made transitioned away from and stopped. It is meant to be overridden,
   * this is where you should cleanup any DOM UI or event handlers needed for the scene.
   */
  public onDeactivate(context: SceneActivationContext): void {
    // will be overridden
  }

  /**
   * Safe to override onPreUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
   *
   * `onPreUpdate` is called directly before a scene is updated.
   */
  public onPreUpdate(engine: Engine, delta: number): void {
    // will be overridden
  }

  /**
   * Safe to override onPostUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
   *
   * `onPostUpdate` is called directly after a scene is updated.
   */
  public onPostUpdate(engine: Engine, delta: number): void {
    // will be overridden
  }

  /**
   * Safe to override onPreDraw lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
   *
   * `onPreDraw` is called directly before a scene is drawn.
   *
   */
  public onPreDraw(ctx: ExcaliburGraphicsContext, delta: number): void {
    // will be overridden
  }

  /**
   * Safe to override onPostDraw lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
   *
   * `onPostDraw` is called directly after a scene is drawn.
   *
   */
  public onPostDraw(ctx: ExcaliburGraphicsContext, delta: number): void {
    // will be overridden
  }

  /**
   * Initializes actors in the scene
   */
  private _initializeChildren() {
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
  public async _initialize(engine: Engine) {
    if (!this.isInitialized) {
      this.engine = engine;
      // PhysicsWorld config is watched so things will automagically update
      this.physics.config = this.engine.physics;
      this.input = new InputHost({
        pointerTarget: engine.pointerScope === PointerScope.Canvas ? engine.canvas : document,
        grabWindowFocus: engine.grabWindowFocus,
        engine
      });
      // Initialize camera first
      this.camera._initialize(engine);

      this.world.systemManager.initialize();

      // This order is important! we want to be sure any custom init that add actors
      // fire before the actor init
      await this.onInitialize(engine);
      this._initializeChildren();

      this._logger.debug('Scene.onInitialize', this, engine);
      this.events.emit('initialize', new InitializeEvent(engine, this));
      this._isInitialized = true;
    }
  }

  /**
   * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
   *
   * Activates the scene with the base behavior, then calls the overridable `onActivate` implementation.
   * @internal
   */
  public async _activate(context: SceneActivationContext<TActivationData>) {
    this._logger.debug('Scene.onActivate', this);
    this.input.toggleEnabled(true);
    await this.onActivate(context);
  }

  /**
   * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
   *
   * Deactivates the scene with the base behavior, then calls the overridable `onDeactivate` implementation.
   * @internal
   */
  public async _deactivate(context: SceneActivationContext<never>) {
    this._logger.debug('Scene.onDeactivate', this);
    this.input.toggleEnabled(false);
    await this.onDeactivate(context);
  }

  /**
   * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
   *
   * Internal _preupdate handler for [[onPreUpdate]] lifecycle event
   * @internal
   */
  public _preupdate(engine: Engine, delta: number): void {
    this.emit('preupdate', new PreUpdateEvent(engine, delta, this));
    this.onPreUpdate(engine, delta);
  }

  /**
   *  It is not recommended that internal excalibur methods be overridden, do so at your own risk.
   *
   * Internal _preupdate handler for [[onPostUpdate]] lifecycle event
   * @internal
   */
  public _postupdate(engine: Engine, delta: number): void {
    this.emit('postupdate', new PostUpdateEvent(engine, delta, this));
    this.onPostUpdate(engine, delta);
  }

  /**
   * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
   *
   * Internal _predraw handler for [[onPreDraw]] lifecycle event
   * @internal
   */
  public _predraw(ctx: ExcaliburGraphicsContext, delta: number): void {
    this.emit('predraw', new PreDrawEvent(ctx, delta, this));
    this.onPreDraw(ctx, delta);
  }

  /**
   * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
   *
   * Internal _postdraw handler for [[onPostDraw]] lifecycle event
   * @internal
   */
  public _postdraw(ctx: ExcaliburGraphicsContext, delta: number): void {
    this.emit('postdraw', new PostDrawEvent(ctx, delta, this));
    this.onPostDraw(ctx, delta);
  }

  /**
   * Updates all the actors and timers in the scene. Called by the [[Engine]].
   * @param engine  Reference to the current Engine
   * @param delta   The number of milliseconds since the last update
   */
  public update(engine: Engine, delta: number) {
    if (!this.isInitialized) {
      throw new Error('Scene update called before it was initialized!');
    }
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

    this.input.update();
  }

  /**
   * Draws all the actors in the Scene. Called by the [[Engine]].
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

  /**
   * Adds an [[Entity]] to the scene, once this is done the [[Actor]] will be drawn and updated.
   * @param entity The entity to add to the current scene
   */
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
   * Removes a [[Timer]] from it's current scene
   * and adds it to this scene.
   *
   * Useful if you want to have an object be present in only 1 scene at a time.
   * @param timer The Timer to transfer to the current scene
   */
  public transfer(timer: Timer): void;

  /**
   * Removes a [[TileMap]] from it's current scene
   * and adds it to this scene.
   *
   * Useful if you want to have an object be present in only 1 scene at a time.
   * @param tileMap The TileMap to transfer to the current scene
   */
  public transfer(tileMap: TileMap): void;

  /**
   * Removes a [[Trigger]] from it's current scene
   * and adds it to this scene.
   *
   * Useful if you want to have an object be present in only 1 scene at a time.
   * @param trigger The Trigger to transfer to the current scene
   */
  public transfer(trigger: Trigger): void;

  /**
   * Removes an [[Actor]] from it's current scene
   * and adds it to this scene.
   *
   * Useful if you want to have an object be present in only 1 scene at a time.
   * @param actor The Actor to transfer to the current scene
   */
  public transfer(actor: Actor): void;

  /**
   * Removes an [[Entity]] from it's current scene
   * and adds it to this scene.
   *
   * Useful if you want to have an object be present in only 1 scene at a time.
   * @param entity The Entity to transfer to the current scene
   */
  public transfer(entity: Entity): void;

  /**
   * Removes a [[ScreenElement]] from it's current scene
   * and adds it to this scene.
   *
   * Useful if you want to have an object be present in only 1 scene at a time.
   * @param screenElement The ScreenElement to transfer to the current scene
   */
  public transfer(screenElement: ScreenElement): void;

  /**
   * Removes an [[Entity]] (Actor, TileMap, Trigger, etc) or [[Timer]] from it's current scene
   * and adds it to this scene.
   *
   * Useful if you want to have an object be present in only 1 scene at a time.
   * @param entity
   */
  public transfer(entity: any): void {
    let scene: Scene;
    if (entity instanceof Entity && entity.scene && entity.scene !== this) {
      scene = entity.scene;
      entity.scene.world.remove(entity, false);
    }
    if (entity instanceof Timer && entity.scene) {
      scene = entity.scene;
      entity.scene.removeTimer(entity);
    }
    scene?.emit('entityremoved', { target: entity } as any);
    this.add(entity);
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
      if (entity.active) {
        entity.kill();
      }
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
    for (let i = this.entities.length - 1; i >= 0; i--) {
      this.world.remove(this.entities[i], deferred);
    }
    for (let i = this.timers.length - 1; i >= 0; i--) {
      this.removeTimer(this.timers[i]);
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
