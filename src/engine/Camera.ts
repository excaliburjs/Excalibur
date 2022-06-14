import { Engine } from './Engine';
import { Screen } from './Screen';
import { EasingFunction, EasingFunctions } from './Util/EasingFunctions';
import { Vector, vec } from './Math/vector';
import { Actor } from './Actor';
import { removeItemFromArray } from './Util/Util';
import { CanUpdate, CanInitialize } from './Interfaces/LifecycleEvents';
import { PreUpdateEvent, PostUpdateEvent, GameEvent, InitializeEvent } from './Events';
import { Class } from './Class';
import { BoundingBox } from './Collision/BoundingBox';
import { Logger } from './Util/Log';
import { ExcaliburGraphicsContext } from './Graphics/Context/ExcaliburGraphicsContext';
import { watchAny } from './Util/Watch';
import { AffineMatrix } from './Math/affine-matrix';

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
   * @param delta The elapsed time in milliseconds since the last frame
   */
  action: (target: T, camera: Camera, engine: Engine, delta: number) => Vector;
}

/**
 * Container to house convenience strategy methods
 * @internal
 */
export class StrategyContainer {
  constructor(public camera: Camera) {}

  /**
   * Creates and adds the [[LockCameraToActorStrategy]] on the current camera.
   * @param actor The actor to lock the camera to
   */
  public lockToActor(actor: Actor) {
    this.camera.addStrategy(new LockCameraToActorStrategy(actor));
  }

  /**
   * Creates and adds the [[LockCameraToActorAxisStrategy]] on the current camera
   * @param actor The actor to lock the camera to
   * @param axis The axis to follow the actor on
   */
  public lockToActorAxis(actor: Actor, axis: Axis) {
    this.camera.addStrategy(new LockCameraToActorAxisStrategy(actor, axis));
  }

  /**
   * Creates and adds the [[ElasticToActorStrategy]] on the current camera
   * If cameraElasticity < cameraFriction < 1.0, the behavior will be a dampened spring that will slowly end at the target without bouncing
   * If cameraFriction < cameraElasticity < 1.0, the behavior will be an oscillating spring that will over
   * correct and bounce around the target
   *
   * @param actor Target actor to elastically follow
   * @param cameraElasticity [0 - 1.0] The higher the elasticity the more force that will drive the camera towards the target
   * @param cameraFriction [0 - 1.0] The higher the friction the more that the camera will resist motion towards the target
   */
  public elasticToActor(actor: Actor, cameraElasticity: number, cameraFriction: number) {
    this.camera.addStrategy(new ElasticToActorStrategy(actor, cameraElasticity, cameraFriction));
  }

  /**
   * Creates and adds the [[RadiusAroundActorStrategy]] on the current camera
   * @param actor Target actor to follow when it is "radius" pixels away
   * @param radius Number of pixels away before the camera will follow
   */
  public radiusAroundActor(actor: Actor, radius: number) {
    this.camera.addStrategy(new RadiusAroundActorStrategy(actor, radius));
  }

  /**
   * Creates and adds the [[LimitCameraBoundsStrategy]] on the current camera
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
  public action = (target: Actor, _cam: Camera, _eng: Engine, _delta: number) => {
    const center = target.center;
    return center;
  };
}

/**
 * Lock a camera to a specific axis around an actor.
 */
export class LockCameraToActorAxisStrategy implements CameraStrategy<Actor> {
  constructor(public target: Actor, public axis: Axis) {}
  public action = (target: Actor, cam: Camera, _eng: Engine, _delta: number) => {
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
   *
   * @param target Target actor to elastically follow
   * @param cameraElasticity [0 - 1.0] The higher the elasticity the more force that will drive the camera towards the target
   * @param cameraFriction [0 - 1.0] The higher the friction the more that the camera will resist motion towards the target
   */
  constructor(public target: Actor, public cameraElasticity: number, public cameraFriction: number) {}
  public action = (target: Actor, cam: Camera, _eng: Engine, _delta: number) => {
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
  constructor(public target: Actor, public radius: number) {}
  public action = (target: Actor, cam: Camera, _eng: Engine, _delta: number) => {
    const position = target.center;
    const focus = cam.getFocus();

    const direction = position.sub(focus);
    const distance = direction.size;
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
   * Useful for limiting the camera to a [[TileMap]]'s dimensions, or a specific area inside the map.
   *
   * Note that this strategy does not perform any movement by itself.
   * It only sets the camera position to within the given bounds when the camera has gone beyond them.
   * Thus, it is a good idea to combine it with other camera strategies and set this strategy as the last one.
   *
   * Make sure that the camera bounds are at least as large as the viewport size.
   *
   * @param target The bounding box to limit the camera to
   */

  boundSizeChecked: boolean = false; // Check and warn only once

  constructor(public target: BoundingBox) {}

  public action = (target: BoundingBox, cam: Camera, _eng: Engine, _delta: number) => {
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

/**
 * Cameras
 *
 * [[Camera]] is the base class for all Excalibur cameras. Cameras are used
 * to move around your game and set focus. They are used to determine
 * what is "off screen" and can be used to scale the game.
 *
 */
export class Camera extends Class implements CanUpdate, CanInitialize {
  public transform: AffineMatrix = AffineMatrix.identity();
  public inverse: AffineMatrix = AffineMatrix.identity();


  protected _follow: Actor;

  private _cameraStrategies: CameraStrategy<any>[] = [];

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

  /**
   * Get or set the camera's position
   */
  private _posChanged = false;
  private _pos: Vector = watchAny(Vector.Zero, () => (this._posChanged = true));
  public get pos(): Vector {
    return this._pos;
  }
  public set pos(vec: Vector) {
    this._pos = watchAny(vec, () => (this._posChanged = true));
    this._posChanged = true;
  }

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
  private _zoomEasing: EasingFunction = EasingFunctions.EaseInOutCubic;
  private _easing: EasingFunction = EasingFunctions.EaseInOutCubic;

  private _halfWidth: number = 0;
  private _halfHeight: number = 0;

  /**
   * Get the camera's x position
   */
  public get x() {
    return this.pos.x;
  }

  /**
   * Set the camera's x position (cannot be set when following an [[Actor]] or when moving)
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
   * Set the camera's y position (cannot be set when following an [[Actor]] or when moving)
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
   *
   * @param pos The target position to move to
   * @param duration The duration in milliseconds the move should last
   * @param [easingFn] An optional easing function ([[ex.EasingFunctions.EaseInOutCubic]] by default)
   * @returns A [[Promise]] that resolves when movement is finished, including if it's interrupted.
   *          The [[Promise]] value is the [[Vector]] of the target position. It will be rejected if a move cannot be made.
   */
  public move(pos: Vector, duration: number, easingFn: EasingFunction = EasingFunctions.EaseInOutCubic): Promise<Vector> {
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
  public zoomOverTime(scale: number, duration: number = 0, easingFn: EasingFunction = EasingFunctions.EaseInOutCubic): Promise<boolean> {
    this._zoomPromise = new Promise<boolean>((resolve) => {
      this._zoomResolve = resolve;
    });

    if (duration) {
      this._isZooming = true;
      this._zoomEasing = easingFn;
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
   * Adds a new camera strategy to this camera
   * @param cameraStrategy Instance of an [[CameraStrategy]]
   */
  public addStrategy<T>(cameraStrategy: CameraStrategy<T>) {
    this._cameraStrategies.push(cameraStrategy);
  }

  /**
   * Removes a camera strategy by reference
   * @param cameraStrategy Instance of an [[CameraStrategy]]
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
   * Internal _preupdate handler for [[onPreUpdate]] lifecycle event
   * @internal
   */
  public _preupdate(engine: Engine, delta: number): void {
    this.emit('preupdate', new PreUpdateEvent(engine, delta, this));
    this.onPreUpdate(engine, delta);
  }

  /**
   * Safe to override onPreUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
   *
   * `onPreUpdate` is called directly before a scene is updated.
   */
  public onPreUpdate(_engine: Engine, _delta: number): void {
    // Overridable
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
   * Safe to override onPostUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
   *
   * `onPostUpdate` is called directly after a scene is updated.
   */
  public onPostUpdate(_engine: Engine, _delta: number): void {
    // Overridable
  }

  private _engine: Engine;
  private _screen: Screen;
  private _isInitialized = false;
  public get isInitialized() {
    return this._isInitialized;
  }

  public _initialize(_engine: Engine) {
    if (!this.isInitialized) {
      this._engine = _engine;
      this._screen = _engine.screen;

      const currentRes = this._screen.resolution;
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
      // First frame bootstrap

      // Ensure camera tx is correct
      // Run update twice to ensure properties are init'd
      this.updateTransform();

      // Run strategies for first frame
      this.runStrategies(_engine, _engine.clock.elapsed());

      // Setup the first frame viewport
      this.updateViewport();

      // It's important to update the camera after strategies
      // This prevents jitter
      this.updateTransform();

      this.onInitialize(_engine);
      super.emit('initialize', new InitializeEvent(_engine, this));
      this._isInitialized = true;
    }
  }

  /**
   * Safe to override onPostUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
   *
   * `onPostUpdate` is called directly after a scene is updated.
   */
  public onInitialize(_engine: Engine) {
    // Overridable
  }

  public on(eventName: 'initialize', handler: (event: InitializeEvent) => void): void;
  public on(eventName: 'preupdate', handler: (event: PreUpdateEvent) => void): void;
  public on(eventName: 'postupdate', handler: (event: PostUpdateEvent) => void): void;
  public on(eventName: any, handler: any) {
    super.on(eventName, handler);
  }

  public off(eventName: 'initialize', handler?: (event: InitializeEvent) => void): void;
  public off(eventName: 'preupdate', handler?: (event: PreUpdateEvent) => void): void;
  public off(eventName: 'postupdate', handler?: (event: PostUpdateEvent) => void): void;
  public off(eventName: string, handler: (event: GameEvent<Camera>) => void): void;
  public off(eventName: string, handler: (event: any) => void): void {
    super.off(eventName, handler);
  }

  public once(eventName: 'initialize', handler: (event: InitializeEvent) => void): void;
  public once(eventName: 'preupdate', handler: (event: PreUpdateEvent) => void): void;
  public once(eventName: 'postupdate', handler: (event: PostUpdateEvent) => void): void;
  public once(eventName: string, handler: (event: GameEvent<Camera>) => void): void;
  public once(eventName: string, handler: (event: any) => void): void {
    super.once(eventName, handler);
  }

  public runStrategies(engine: Engine, delta: number) {
    for (const s of this._cameraStrategies) {
      this.pos = s.action.call(s, s.target, this, engine, delta);
    }
  }

  public updateViewport() {
    // recalc viewport
    this._viewport = new BoundingBox(
      this.x - this._halfWidth,
      this.y - this._halfHeight,
      this.x + this._halfWidth,
      this.y + this._halfHeight
    );
  }

  public update(_engine: Engine, delta: number) {
    this._initialize(_engine);
    this._preupdate(_engine, delta);

    // Update placements based on linear algebra
    this.pos = this.pos.add(this.vel.scale(delta / 1000));
    this.zoom += (this.dz * delta) / 1000;

    this.vel = this.vel.add(this.acc.scale(delta / 1000));
    this.dz += (this.az * delta) / 1000;

    this.rotation += (this.angularVelocity * delta) / 1000;

    if (this._isZooming) {
      if (this._currentZoomTime < this._zoomDuration) {
        const zoomEasing = this._zoomEasing;
        const newZoom = zoomEasing(this._currentZoomTime, this._zoomStart, this._zoomEnd, this._zoomDuration);

        this.zoom = newZoom;
        this._currentZoomTime += delta;
      } else {
        this._isZooming = false;
        this.zoom = this._zoomEnd;
        this._currentZoomTime = 0;
        this._zoomResolve(true);
      }
    }

    if (this._cameraMoving) {
      if (this._currentLerpTime < this._lerpDuration) {
        const moveEasing = EasingFunctions.CreateVectorEasingFunction(this._easing);

        const lerpPoint = moveEasing(this._currentLerpTime, this._lerpStart, this._lerpEnd, this._lerpDuration);

        this.pos = lerpPoint;

        this._currentLerpTime += delta;
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
      this._elapsedShakeTime += delta;
      this._xShake = ((Math.random() * this._shakeMagnitudeX) | 0) + 1;
      this._yShake = ((Math.random() * this._shakeMagnitudeY) | 0) + 1;
    }

    this.runStrategies(_engine, delta);

    this.updateViewport();

    // It's important to update the camera after strategies
    // This prevents jitter
    this.updateTransform();

    this._postupdate(_engine, delta);
  }

  /**
   * Applies the relevant transformations to the game canvas to "move" or apply effects to the Camera
   * @param ctx Canvas context to apply transformations
   */
  public draw(ctx: ExcaliburGraphicsContext): void {
    ctx.multiply(this.transform);
  }

  public updateTransform() {
    // center the camera
    const newCanvasWidth = this._screen.resolution.width / this.zoom;
    const newCanvasHeight = this._screen.resolution.height / this.zoom;
    const cameraPos = vec(-this.x + newCanvasWidth / 2 + this._xShake, -this.y + newCanvasHeight / 2 + this._yShake);

    // Calculate camera transform
    this.transform.reset();
    this.transform.scale(this.zoom, this.zoom);
    this.transform.translate(cameraPos.x, cameraPos.y);
    this.transform.inverse(this.inverse);
  }

  private _isDoneShaking(): boolean {
    return !this._isShaking || this._elapsedShakeTime >= this._shakeDuration;
  }
}
