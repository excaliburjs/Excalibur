import type { Engine } from './engine';
import type { Screen } from './screen';
import { Vector, vec } from './math/vector';
import type { Actor } from './actor';
import { removeItemFromArray } from './util/util';
import type { CanUpdate, CanInitialize } from './interfaces/lifecycle-events';
import { PreUpdateEvent, PostUpdateEvent, InitializeEvent } from './events';
import { BoundingBox } from './collision/bounding-box';
import { Logger } from './util/log';
import type { ExcaliburGraphicsContext } from './graphics/context/excalibur-graphics-context';
import { AffineMatrix } from './math/affine-matrix';
import type { EventKey, Handler, Subscription } from './event-emitter';
import { EventEmitter } from './event-emitter';
import { pixelSnapEpsilon } from './graphics';
import { sign } from './math/util';
import { WatchVector } from './math/watch-vector';
import type { Easing } from './math';
import { easeInOutCubic, lerp } from './math';

/**
 * Interface that describes a custom camera strategy for tracking targets
 */
export interface CameraStrategy<T> {
  /**
   * Target of the camera strategy that will be passed to the action
   */
  target: T;

  /**
   * Camera strategies perform an action to calculate a new focus returned out of the strategy
   * @param target The target object to apply this camera strategy (if any)
   * @param camera The current camera implementation in excalibur running the game
   * @param engine The current engine running the game
   * @param elapsed The elapsed time in milliseconds since the last frame
   */
  action: (target: T, camera: Camera, engine: Engine, elapsed: number) => Vector;
}

/**
 * Container to house convenience strategy methods
 * @internal
 */
export class StrategyContainer {
  constructor(public camera: Camera) {}

  /**
   * Creates and adds the {@apilink LockCameraToActorStrategy} on the current camera.
   * @param actor The actor to lock the camera to
   */
  public lockToActor(actor: Actor) {
    this.camera.addStrategy(new LockCameraToActorStrategy(actor));
  }

  /**
   * Creates and adds the {@apilink LockCameraToActorAxisStrategy} on the current camera
   * @param actor The actor to lock the camera to
   * @param axis The axis to follow the actor on
   */
  public lockToActorAxis(actor: Actor, axis: Axis) {
    this.camera.addStrategy(new LockCameraToActorAxisStrategy(actor, axis));
  }

  /**
   * Creates and adds the {@apilink ElasticToActorStrategy} on the current camera
   * If cameraElasticity < cameraFriction < 1.0, the behavior will be a dampened spring that will slowly end at the target without bouncing
   * If cameraFriction < cameraElasticity < 1.0, the behavior will be an oscillating spring that will over
   * correct and bounce around the target
   * @param actor Target actor to elastically follow
   * @param cameraElasticity [0 - 1.0] The higher the elasticity the more force that will drive the camera towards the target
   * @param cameraFriction [0 - 1.0] The higher the friction the more that the camera will resist motion towards the target
   */
  public elasticToActor(actor: Actor, cameraElasticity: number, cameraFriction: number) {
    this.camera.addStrategy(new ElasticToActorStrategy(actor, cameraElasticity, cameraFriction));
  }

  /**
   * Creates and adds the {@apilink RadiusAroundActorStrategy} on the current camera
   * @param actor Target actor to follow when it is "radius" pixels away
   * @param radius Number of pixels away before the camera will follow
   */
  public radiusAroundActor(actor: Actor, radius: number) {
    this.camera.addStrategy(new RadiusAroundActorStrategy(actor, radius));
  }

  /**
   * Creates and adds the {@apilink LimitCameraBoundsStrategy} on the current camera
   * @param box The bounding box to limit the camera to.
   */
  public limitCameraBounds(box: BoundingBox) {
    this.camera.addStrategy(new LimitCameraBoundsStrategy(box));
  }
}

/**
 * Camera axis enum
 */
export enum Axis {
  X,
  Y
}

/**
 * Lock a camera to the exact x/y position of an actor.
 */
export class LockCameraToActorStrategy implements CameraStrategy<Actor> {
  constructor(public target: Actor) {}
  public action = (target: Actor, camera: Camera, engine: Engine, elapsed: number) => {
    const center = target.center;
    return center;
  };
}

/**
 * Lock a camera to a specific axis around an actor.
 */
export class LockCameraToActorAxisStrategy implements CameraStrategy<Actor> {
  constructor(
    public target: Actor,
    public axis: Axis
  ) {}
  public action = (target: Actor, cam: Camera, _eng: Engine, elapsed: number) => {
    const center = target.center;
    const currentFocus = cam.getFocus();
    if (this.axis === Axis.X) {
      return new Vector(center.x, currentFocus.y);
    } else {
      return new Vector(currentFocus.x, center.y);
    }
  };
}

/**
 * Using [Hook's law](https://en.wikipedia.org/wiki/Hooke's_law), elastically move the camera towards the target actor.
 */
export class ElasticToActorStrategy implements CameraStrategy<Actor> {
  /**
   * If cameraElasticity < cameraFriction < 1.0, the behavior will be a dampened spring that will slowly end at the target without bouncing
   * If cameraFriction < cameraElasticity < 1.0, the behavior will be an oscillating spring that will over
   * correct and bounce around the target
   * @param target Target actor to elastically follow
   * @param cameraElasticity [0 - 1.0] The higher the elasticity the more force that will drive the camera towards the target
   * @param cameraFriction [0 - 1.0] The higher the friction the more that the camera will resist motion towards the target
   */
  constructor(
    public target: Actor,
    public cameraElasticity: number,
    public cameraFriction: number
  ) {}
  public action = (target: Actor, cam: Camera, _eng: Engine, elapsed: number) => {
    const position = target.center;
    let focus = cam.getFocus();
    let cameraVel = cam.vel.clone();

    // Calculate the stretch vector, using the spring equation
    // F = kX
    // https://en.wikipedia.org/wiki/Hooke's_law
    // Apply to the current camera velocity
    const stretch = position.sub(focus).scale(this.cameraElasticity); // stretch is X
    cameraVel = cameraVel.add(stretch);

    // Calculate the friction (-1 to apply a force in the opposition of motion)
    // Apply to the current camera velocity
    const friction = cameraVel.scale(-1).scale(this.cameraFriction);
    cameraVel = cameraVel.add(friction);

    // Update position by velocity deltas
    focus = focus.add(cameraVel);

    return focus;
  };
}

export class RadiusAroundActorStrategy implements CameraStrategy<Actor> {
  /**
   *
   * @param target Target actor to follow when it is "radius" pixels away
   * @param radius Number of pixels away before the camera will follow
   */
  constructor(
    public target: Actor,
    public radius: number
  ) {}
  public action = (target: Actor, cam: Camera, _eng: Engine, elapsed: number) => {
    const position = target.center;
    const focus = cam.getFocus();

    const direction = position.sub(focus);
    const distance = direction.magnitude;
    if (distance >= this.radius) {
      const offset = distance - this.radius;
      return focus.add(direction.normalize().scale(offset));
    }
    return focus;
  };
}

/**
 * Prevent a camera from going beyond the given camera dimensions.
 */
export class LimitCameraBoundsStrategy implements CameraStrategy<BoundingBox> {
  /**
   * Useful for limiting the camera to a {@apilink TileMap}'s dimensions, or a specific area inside the map.
   *
   * Note that this strategy does not perform any movement by itself.
   * It only sets the camera position to within the given bounds when the camera has gone beyond them.
   * Thus, it is a good idea to combine it with other camera strategies and set this strategy as the last one.
   *
   * Make sure that the camera bounds are at least as large as the viewport size.
   * @param target The bounding box to limit the camera to
   */

  boundSizeChecked: boolean = false; // Check and warn only once

  constructor(public target: BoundingBox) {}

  public action = (target: BoundingBox, cam: Camera, _eng: Engine, elapsed: number) => {
    const focus = cam.getFocus();

    if (!this.boundSizeChecked) {
      if (target.bottom - target.top < _eng.drawHeight || target.right - target.left < _eng.drawWidth) {
        Logger.getInstance().warn('Camera bounds should not be smaller than the engine viewport');
      }
      this.boundSizeChecked = true;
    }

    let focusX = focus.x;
    let focusY = focus.y;
    if (focus.x < target.left + _eng.halfDrawWidth) {
      focusX = target.left + _eng.halfDrawWidth;
    } else if (focus.x > target.right - _eng.halfDrawWidth) {
      focusX = target.right - _eng.halfDrawWidth;
    }

    if (focus.y < target.top + _eng.halfDrawHeight) {
      focusY = target.top + _eng.halfDrawHeight;
    } else if (focus.y > target.bottom - _eng.halfDrawHeight) {
      focusY = target.bottom - _eng.halfDrawHeight;
    }

    return vec(focusX, focusY);
  };
}

export interface CameraEvents {
  preupdate: PreUpdateEvent<Camera>;
  postupdate: PostUpdateEvent<Camera>;
  initialize: InitializeEvent<Camera>;
}

export const CameraEvents = {
  Initialize: 'initialize',
  PreUpdate: 'preupdate',
  PostUpdate: 'postupdate'
};

/**
 * Cameras
 *
 * {@apilink Camera} is the base class for all Excalibur cameras. Cameras are used
 * to move around your game and set focus. They are used to determine
 * what is "off screen" and can be used to scale the game.
 *
 */
export class Camera implements CanUpdate, CanInitialize {
  public events = new EventEmitter<CameraEvents>();
  public transform: AffineMatrix = AffineMatrix.identity();
  public inverse: AffineMatrix = AffineMatrix.identity();

  protected _follow: Actor;

  private _cameraStrategies: CameraStrategy<any>[] = [];
  public get strategies(): CameraStrategy<any>[] {
    return this._cameraStrategies;
  }

  public strategy: StrategyContainer = new StrategyContainer(this);

  /**
   * Get or set current zoom of the camera, defaults to 1
   */
  private _z = 1;
  public get zoom(): number {
    return this._z;
  }

  public set zoom(val: number) {
    this._z = val;
    if (this._engine) {
      this._halfWidth = this._engine.halfDrawWidth;
      this._halfHeight = this._engine.halfDrawHeight;
    }
  }
  /**
   * Get or set rate of change in zoom, defaults to 0
   */
  public dz: number = 0;
  /**
   * Get or set zoom acceleration
   */
  public az: number = 0;

  /**
   * Current rotation of the camera
   */
  public rotation: number = 0;

  private _angularVelocity: number = 0;

  /**
   * Get or set the camera's angular velocity
   */
  public get angularVelocity(): number {
    return this._angularVelocity;
  }

  public set angularVelocity(value: number) {
    this._angularVelocity = value;
  }

  private _posChanged = false;
  private _pos: Vector = new WatchVector(Vector.Zero, () => {
    this._posChanged = true;
  });
  /**
   * Get or set the camera's position
   */
  public get pos(): Vector {
    return this._pos;
  }
  public set pos(vec: Vector) {
    this._posChanged = true;
    this._pos = new WatchVector(vec, () => {
      this._posChanged = true;
    });
  }

  /**
   * Has the position changed since the last update
   */
  public hasChanged(): boolean {
    return this._posChanged;
  }
  /**
   * Interpolated camera position if more draws are running than updates
   *
   * Enabled when `Engine.fixedUpdateFps` is enabled, in all other cases this will be the same as pos
   */
  public drawPos: Vector = this.pos.clone();

  private _oldPos = this.pos.clone();

  /**
   * Get or set the camera's velocity
   */
  public vel: Vector = Vector.Zero;

  /**
   * Get or set the camera's acceleration
   */
  public acc: Vector = Vector.Zero;

  private _cameraMoving: boolean = false;
  private _currentLerpTime: number = 0;
  private _lerpDuration: number = 1000; // 1 second
  private _lerpStart: Vector = null;
  private _lerpEnd: Vector = null;
  private _lerpResolve: (value: Vector) => void;
  private _lerpPromise: Promise<Vector>;

  //camera effects
  protected _isShaking: boolean = false;
  private _shakeMagnitudeX: number = 0;
  private _shakeMagnitudeY: number = 0;
  private _shakeDuration: number = 0;
  private _elapsedShakeTime: number = 0;
  private _xShake: number = 0;
  private _yShake: number = 0;

  protected _isZooming: boolean = false;
  private _zoomStart: number = 1;
  private _zoomEnd: number = 1;
  private _currentZoomTime: number = 0;
  private _zoomDuration: number = 0;

  private _zoomResolve: (val: boolean) => void;
  private _zoomPromise: Promise<boolean>;
  private _zoomEasing: Easing = easeInOutCubic;
  private _easing: Easing = easeInOutCubic;

  private _halfWidth: number = 0;
  private _halfHeight: number = 0;

  /**
   * Get the camera's x position
   */
  public get x() {
    return this.pos.x;
  }

  /**
   * Set the camera's x position (cannot be set when following an {@apilink Actor} or when moving)
   */
  public set x(value: number) {
    if (!this._follow && !this._cameraMoving) {
      this.pos = vec(value, this.pos.y);
    }
  }

  /**
   * Get the camera's y position
   */
  public get y() {
    return this.pos.y;
  }

  /**
   * Set the camera's y position (cannot be set when following an {@apilink Actor} or when moving)
   */
  public set y(value: number) {
    if (!this._follow && !this._cameraMoving) {
      this.pos = vec(this.pos.x, value);
    }
  }

  /**
   * Get or set the camera's x velocity
   */
  public get dx() {
    return this.vel.x;
  }

  public set dx(value: number) {
    this.vel = vec(value, this.vel.y);
  }

  /**
   * Get or set the camera's y velocity
   */
  public get dy() {
    return this.vel.y;
  }

  public set dy(value: number) {
    this.vel = vec(this.vel.x, value);
  }

  /**
   * Get or set the camera's x acceleration
   */
  public get ax() {
    return this.acc.x;
  }

  public set ax(value: number) {
    this.acc = vec(value, this.acc.y);
  }

  /**
   * Get or set the camera's y acceleration
   */
  public get ay() {
    return this.acc.y;
  }

  public set ay(value: number) {
    this.acc = vec(this.acc.x, value);
  }

  /**
   * Returns the focal point of the camera, a new point giving the x and y position of the camera
   */
  public getFocus() {
    return this.pos;
  }

  /**
   * This moves the camera focal point to the specified position using specified easing function. Cannot move when following an Actor.
   * @param pos The target position to move to
   * @param duration The duration in milliseconds the move should last
   * @param [easingFn] An optional easing function ({@apilink EasingFunctions.EaseInOutCubic} by default)
   * @returns A {@apilink Promise} that resolves when movement is finished, including if it's interrupted.
   *          The {@apilink Promise} value is the {@apilink Vector} of the target position. It will be rejected if a move cannot be made.
   */
  public move(pos: Vector, duration: number, easingFn: Easing = easeInOutCubic): Promise<Vector> {
    if (typeof easingFn !== 'function') {
      throw 'Please specify an EasingFunction';
    }

    // cannot move when following an actor
    if (this._follow) {
      return Promise.reject(pos);
    }

    // resolve existing promise, if any
    if (this._lerpPromise && this._lerpResolve) {
      this._lerpResolve(pos);
    }

    this._lerpPromise = new Promise<Vector>((resolve) => {
      this._lerpResolve = resolve;
    });
    this._lerpStart = this.getFocus().clone();
    this._lerpDuration = duration;
    this._lerpEnd = pos;
    this._currentLerpTime = 0;
    this._cameraMoving = true;
    this._easing = easingFn;

    return this._lerpPromise;
  }

  /**
   * Sets the camera to shake at the specified magnitudes for the specified duration
   * @param magnitudeX  The x magnitude of the shake
   * @param magnitudeY  The y magnitude of the shake
   * @param duration    The duration of the shake in milliseconds
   */
  public shake(magnitudeX: number, magnitudeY: number, duration: number) {
    this._isShaking = true;
    this._shakeMagnitudeX = magnitudeX;
    this._shakeMagnitudeY = magnitudeY;
    this._shakeDuration = duration;
  }

  /**
   * Zooms the camera in or out by the specified scale over the specified duration.
   * If no duration is specified, it take effect immediately.
   * @param scale    The scale of the zoom
   * @param duration The duration of the zoom in milliseconds
   */
  public zoomOverTime(scale: number, duration: number = 0, easingFn: Easing = easeInOutCubic): Promise<boolean> {
    this._zoomPromise = new Promise<boolean>((resolve) => {
      this._zoomResolve = resolve;
    });

    if (duration) {
      this._isZooming = true;
      this._easing = easingFn;
      this._currentZoomTime = 0;
      this._zoomDuration = duration;
      this._zoomStart = this.zoom;
      this._zoomEnd = scale;
    } else {
      this._isZooming = false;
      this.zoom = scale;
      return Promise.resolve(true);
    }

    return this._zoomPromise;
  }

  private _viewport: BoundingBox = null;
  /**
   * Gets the bounding box of the viewport of this camera in world coordinates
   */
  public get viewport(): BoundingBox {
    if (this._viewport) {
      return this._viewport;
    }

    return new BoundingBox(0, 0, 0, 0);
  }

  /**
   * Adds one or more new camera strategies to this camera
   * @param cameraStrategy Instance of an {@apilink CameraStrategy}
   */
  public addStrategy<T extends CameraStrategy<any>[]>(...cameraStrategies: T) {
    this._cameraStrategies.push(...cameraStrategies);
  }

  /**
   * Sets the strategies of this camera, replacing all existing strategies
   * @param cameraStrategies Array of {@apilink CameraStrategy}
   */
  public setStrategies<T extends CameraStrategy<any>[]>(cameraStrategies: T) {
    this._cameraStrategies = [...cameraStrategies];
  }

  /**
   * Removes a camera strategy by reference
   * @param cameraStrategy Instance of an {@apilink CameraStrategy}
   */
  public removeStrategy<T>(cameraStrategy: CameraStrategy<T>) {
    removeItemFromArray(cameraStrategy, this._cameraStrategies);
  }

  /**
   * Clears all camera strategies from the camera
   */
  public clearAllStrategies() {
    this._cameraStrategies.length = 0;
  }

  /**
   * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
   *
   * Internal _preupdate handler for {@apilink onPreUpdate} lifecycle event
   * @param engine The reference to the current game engine
   * @param elapsed  The time elapsed since the last update in milliseconds
   * @internal
   */
  public _preupdate(engine: Engine, elapsed: number): void {
    this.events.emit('preupdate', new PreUpdateEvent(engine, elapsed, this));
    this.onPreUpdate(engine, elapsed);
  }

  /**
   * Safe to override onPreUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
   *
   * `onPreUpdate` is called directly before a scene is updated.
   * @param engine The reference to the current game engine
   * @param elapsed  The time elapsed since the last update in milliseconds
   */
  public onPreUpdate(engine: Engine, elapsed: number): void {
    // Overridable
  }

  /**
   *  It is not recommended that internal excalibur methods be overridden, do so at your own risk.
   *
   * Internal _preupdate handler for {@apilink onPostUpdate} lifecycle event
   * @param engine The reference to the current game engine
   * @param elapsed  The time elapsed since the last update in milliseconds
   * @internal
   */
  public _postupdate(engine: Engine, elapsed: number): void {
    this.events.emit('postupdate', new PostUpdateEvent(engine, elapsed, this));
    this.onPostUpdate(engine, elapsed);
  }

  /**
   * Safe to override onPostUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
   *
   * `onPostUpdate` is called directly after a scene is updated.
   * @param engine The reference to the current game engine
   * @param elapsed  The time elapsed since the last update in milliseconds
   */
  public onPostUpdate(engine: Engine, elapsed: number): void {
    // Overridable
  }

  private _engine: Engine;
  private _screen: Screen;
  private _isInitialized = false;
  public get isInitialized() {
    return this._isInitialized;
  }

  public _initialize(engine: Engine) {
    if (!this.isInitialized) {
      this._engine = engine;
      this._screen = engine.screen;

      const currentRes = this._screen.contentArea;
      let center = vec(currentRes.width / 2, currentRes.height / 2);
      if (!this._engine.loadingComplete) {
        // If there was a loading screen, we peek the configured resolution
        const res = this._screen.peekResolution();
        if (res) {
          center = vec(res.width / 2, res.height / 2);
        }
      }
      this._halfWidth = center.x;
      this._halfHeight = center.y;

      // If the user has not set the camera pos, apply default center screen position
      if (!this._posChanged) {
        this.pos = center;
      }
      this.pos.clone(this.drawPos);
      // First frame bootstrap

      // Ensure camera tx is correct
      // Run update twice to ensure properties are init'd
      this.updateTransform(this.pos);

      // Run strategies for first frame
      this.runStrategies(engine, engine.clock.elapsed());

      // Setup the first frame viewport
      this.updateViewport();

      // It's important to update the camera after strategies
      // This prevents jitter
      this.updateTransform(this.pos);
      this.pos.clone(this._oldPos);

      this.onInitialize(engine);
      this.events.emit('initialize', new InitializeEvent(engine, this));
      this._isInitialized = true;
    }
  }

  /**
   * Safe to override onPostUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
   *
   * `onPostUpdate` is called directly after a scene is updated.
   */
  public onInitialize(engine: Engine) {
    // Overridable
  }

  public emit<TEventName extends EventKey<CameraEvents>>(eventName: TEventName, event: CameraEvents[TEventName]): void;
  public emit(eventName: string, event?: any): void;
  public emit<TEventName extends EventKey<CameraEvents> | string>(eventName: TEventName, event?: any): void {
    this.events.emit(eventName, event);
  }

  public on<TEventName extends EventKey<CameraEvents>>(eventName: TEventName, handler: Handler<CameraEvents[TEventName]>): Subscription;
  public on(eventName: string, handler: Handler<unknown>): Subscription;
  public on<TEventName extends EventKey<CameraEvents> | string>(eventName: TEventName, handler: Handler<any>): Subscription {
    return this.events.on(eventName, handler);
  }

  public once<TEventName extends EventKey<CameraEvents>>(eventName: TEventName, handler: Handler<CameraEvents[TEventName]>): Subscription;
  public once(eventName: string, handler: Handler<unknown>): Subscription;
  public once<TEventName extends EventKey<CameraEvents> | string>(eventName: TEventName, handler: Handler<any>): Subscription {
    return this.events.once(eventName, handler);
  }

  public off<TEventName extends EventKey<CameraEvents>>(eventName: TEventName, handler: Handler<CameraEvents[TEventName]>): void;
  public off(eventName: string, handler: Handler<unknown>): void;
  public off(eventName: string): void;
  public off<TEventName extends EventKey<CameraEvents> | string>(eventName: TEventName, handler?: Handler<any>): void {
    this.events.off(eventName, handler);
  }

  public runStrategies(engine: Engine, elapsed: number) {
    for (const s of this._cameraStrategies) {
      this.pos = s.action.call(s, s.target, this, engine, elapsed);
    }
  }

  public updateViewport() {
    // recalculate viewport
    this._viewport = new BoundingBox(
      this.x - this._halfWidth,
      this.y - this._halfHeight,
      this.x + this._halfWidth,
      this.y + this._halfHeight
    );
  }

  public update(engine: Engine, elapsed: number) {
    this._initialize(engine);
    this._preupdate(engine, elapsed);
    this.pos.clone(this._oldPos);

    // Update placements based on linear algebra
    this.pos = this.pos.add(this.vel.scale(elapsed / 1000));
    this.zoom += (this.dz * elapsed) / 1000;

    this.vel = this.vel.add(this.acc.scale(elapsed / 1000));
    this.dz += (this.az * elapsed) / 1000;

    this.rotation += (this.angularVelocity * elapsed) / 1000;

    if (this._isZooming) {
      if (this._currentZoomTime < this._zoomDuration) {
        this.zoom = lerp(this._zoomStart, this._zoomEnd, this._zoomEasing(this._currentZoomTime / this._zoomDuration));
        this._currentZoomTime += elapsed;
      } else {
        this._isZooming = false;
        this.zoom = this._zoomEnd;
        this._currentZoomTime = 0;
        this._zoomResolve(true);
      }
    }

    if (this._cameraMoving) {
      if (this._currentLerpTime < this._lerpDuration) {
        const lerpPoint = this.pos;
        lerpPoint.x = lerp(this._lerpStart.x, this._lerpEnd.x, this._easing(this._currentLerpTime / this._lerpDuration));
        lerpPoint.y = lerp(this._lerpStart.y, this._lerpEnd.y, this._easing(this._currentLerpTime / this._lerpDuration));

        this.pos = lerpPoint;

        this._currentLerpTime += elapsed;
      } else {
        this.pos = this._lerpEnd;
        const end = this._lerpEnd.clone();

        this._lerpStart = null;
        this._lerpEnd = null;
        this._currentLerpTime = 0;
        this._cameraMoving = false;
        // Order matters here, resolve should be last so any chain promises have a clean slate
        this._lerpResolve(end);
      }
    }

    if (this._isDoneShaking()) {
      this._isShaking = false;
      this._elapsedShakeTime = 0;
      this._shakeMagnitudeX = 0;
      this._shakeMagnitudeY = 0;
      this._shakeDuration = 0;
      this._xShake = 0;
      this._yShake = 0;
    } else {
      this._elapsedShakeTime += elapsed;
      this._xShake = ((Math.random() * this._shakeMagnitudeX) | 0) + 1;
      this._yShake = ((Math.random() * this._shakeMagnitudeY) | 0) + 1;
    }

    this.runStrategies(engine, elapsed);

    this.updateViewport();

    // It's important to update the camera after strategies
    // This prevents jitter
    this.updateTransform(this.pos);
    this._postupdate(engine, elapsed);
    this._posChanged = false;
  }

  private _snapPos = vec(0, 0);
  /**
   * Applies the relevant transformations to the game canvas to "move" or apply effects to the Camera
   * @param ctx Canvas context to apply transformations
   */
  public draw(ctx: ExcaliburGraphicsContext): void {
    // default to the current position
    this.pos.clone(this.drawPos);

    // interpolation if fixed update is on
    // must happen on the draw, because more draws are potentially happening than updates
    if (this._engine.fixedUpdateTimestep) {
      const blend = this._engine.currentFrameLagMs / this._engine.fixedUpdateTimestep;
      const interpolatedPos = this.pos.scale(blend).add(this._oldPos.scale(1.0 - blend));
      interpolatedPos.clone(this.drawPos);
      this.updateTransform(interpolatedPos);
    }
    // Snap camera to pixel
    if (ctx.snapToPixel) {
      const snapPos = this.drawPos.clone(this._snapPos);
      snapPos.x = ~~(snapPos.x + pixelSnapEpsilon * sign(snapPos.x));
      snapPos.y = ~~(snapPos.y + pixelSnapEpsilon * sign(snapPos.y));
      snapPos.clone(this.drawPos);
      this.updateTransform(snapPos);
    }
    ctx.multiply(this.transform);
  }

  public updateTransform(pos: Vector) {
    // center the camera
    const newCanvasWidth = this._screen.resolution.width / this.zoom;
    const newCanvasHeight = this._screen.resolution.height / this.zoom;
    const cameraPos = vec(-pos.x + newCanvasWidth / 2 + this._xShake, -pos.y + newCanvasHeight / 2 + this._yShake);

    // Calculate camera transform
    this.transform.reset();

    this.transform.scale(this.zoom, this.zoom);

    // rotate about the focus
    this.transform.translate(newCanvasWidth / 2, newCanvasHeight / 2);
    this.transform.rotate(this.rotation);
    this.transform.translate(-newCanvasWidth / 2, -newCanvasHeight / 2);

    this.transform.translate(cameraPos.x, cameraPos.y);
    this.transform.inverse(this.inverse);
  }

  private _isDoneShaking(): boolean {
    return !this._isShaking || this._elapsedShakeTime >= this._shakeDuration;
  }
}
