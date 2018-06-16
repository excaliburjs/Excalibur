import { Engine } from './Engine';
import { EasingFunction, EasingFunctions } from './Util/EasingFunctions';
import { IPromise, Promise, PromiseState } from './Promises';
import { Vector } from './Algebra';
import { Actor } from './Actor';
import { removeItemFromArray } from './Util/Util';
import { ICanUpdate, ICanInitialize } from './Interfaces/LifecycleEvents';
import { PreUpdateEvent, PostUpdateEvent, GameEvent, InitializeEvent } from './Events';
import { Class } from './Class';

/**
 * Interface that describes a custom camera strategy for tracking targets
 */
export interface ICameraStrategy<T> {
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
  action: (target: T, camera: BaseCamera, engine: Engine, delta: number) => Vector;
}

/**
 * Container to house convenience strategy methods
 * @internal
 */
export class StrategyContainer {
  constructor(public camera: BaseCamera) {}

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
   * If cameraFriction < cameraElasticity < 1.0, the behavior will be an oscillationg spring that will over
   * correct and bounce around the target
   *
   * @param target Target actor to elastically follow
   * @param cameraElasticity [0 - 1.0] The higher the elasticity the more force that will drive the camera towards the target
   * @param cameraFriction [0 - 1.0] The higher the friction the more that the camera will resist motion towards the target
   */
  public elasticToActor(actor: Actor, cameraElasticity: number, cameraFriction: number) {
    this.camera.addStrategy(new ElasticToActorStrategy(actor, cameraElasticity, cameraFriction));
  }

  /**
   * Creates and adds the [[RadiusAroundActorStrategy]] on the current camera
   * @param target Target actor to follow when it is "radius" pixels away
   * @param radius Number of pixels away before the camera will follow
   */
  public radiusAroundActor(actor: Actor, radius: number) {
    this.camera.addStrategy(new RadiusAroundActorStrategy(actor, radius));
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
 * Lock a camera to the exact x/y postition of an actor.
 */
export class LockCameraToActorStrategy implements ICameraStrategy<Actor> {
  constructor(public target: Actor) {}
  public action = (target: Actor, _cam: BaseCamera, _eng: Engine, _delta: number) => {
    let center = target.getCenter();
    return center;
  };
}

/**
 * Lock a camera to a specific axis around an actor.
 */
export class LockCameraToActorAxisStrategy implements ICameraStrategy<Actor> {
  constructor(public target: Actor, public axis: Axis) {}
  public action = (target: Actor, cam: BaseCamera, _eng: Engine, _delta: number) => {
    let center = target.getCenter();
    let currentFocus = cam.getFocus();
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
export class ElasticToActorStrategy implements ICameraStrategy<Actor> {
  /**
   * If cameraElasticity < cameraFriction < 1.0, the behavior will be a dampened spring that will slowly end at the target without bouncing
   * If cameraFriction < cameraElasticity < 1.0, the behavior will be an oscillationg spring that will over
   * correct and bounce around the target
   *
   * @param target Target actor to elastically follow
   * @param cameraElasticity [0 - 1.0] The higher the elasticity the more force that will drive the camera towards the target
   * @param cameraFriction [0 - 1.0] The higher the friction the more that the camera will resist motion towards the target
   */
  constructor(public target: Actor, public cameraElasticity: number, public cameraFriction: number) {}
  public action = (target: Actor, cam: BaseCamera, _eng: Engine, _delta: number) => {
    let position = target.getCenter();
    let focus = cam.getFocus();
    let cameraVel = new Vector(cam.dx, cam.dy);

    // Calculate the strech vector, using the spring equation
    // F = kX
    // https://en.wikipedia.org/wiki/Hooke's_law
    // Apply to the current camera velocity
    var stretch = position.sub(focus).scale(this.cameraElasticity); // stretch is X
    cameraVel = cameraVel.add(stretch);

    // Calculate the friction (-1 to apply a force in the opposition of motion)
    // Apply to the current camera velocity
    var friction = cameraVel.scale(-1).scale(this.cameraFriction);
    cameraVel = cameraVel.add(friction);

    // Update position by velocity deltas
    focus = focus.add(cameraVel);

    return focus;
  };
}

export class RadiusAroundActorStrategy implements ICameraStrategy<Actor> {
  /**
   *
   * @param target Target actor to follow when it is "radius" pixels away
   * @param radius Number of pixels away before the camera will follow
   */
  constructor(public target: Actor, public radius: number) {}
  public action = (target: Actor, cam: BaseCamera, _eng: Engine, _delta: number) => {
    let position = target.getCenter();
    let focus = cam.getFocus();

    let direction = position.sub(focus);
    let distance = direction.magnitude();
    if (distance >= this.radius) {
      let offset = distance - this.radius;
      return focus.add(direction.normalize().scale(offset));
    }
    return focus;
  };
}

/**
 * Cameras
 *
 * [[BaseCamera]] is the base class for all Excalibur cameras. Cameras are used
 * to move around your game and set focus. They are used to determine
 * what is "off screen" and can be used to scale the game.
 *
 * [[include:Cameras.md]]
 */
export class BaseCamera extends Class implements ICanUpdate, ICanInitialize {
  protected _follow: Actor;

  private _cameraStrategies: ICameraStrategy<any>[] = [];

  public strategy: StrategyContainer = new StrategyContainer(this);

  // camera physical quantities
  public z: number = 1;

  public dx: number = 0;
  public dy: number = 0;
  public dz: number = 0;

  public ax: number = 0;
  public ay: number = 0;
  public az: number = 0;

  public rotation: number = 0;
  public rx: number = 0;

  private _x: number = 0;
  private _y: number = 0;
  private _cameraMoving: boolean = false;
  private _currentLerpTime: number = 0;
  private _lerpDuration: number = 1000; // 1 second
  private _lerpStart: Vector = null;
  private _lerpEnd: Vector = null;
  private _lerpPromise: IPromise<Vector>;

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

  private _zoomPromise: Promise<boolean>;
  private _zoomEasing: EasingFunction = EasingFunctions.EaseInOutCubic;
  private _easing: EasingFunction = EasingFunctions.EaseInOutCubic;

  /**
   * Get the camera's x position
   */
  public get x() {
    return this._x;
  }

  /**
   * Set the camera's x position (cannot be set when following an [[Actor]] or when moving)
   */
  public set x(value: number) {
    if (!this._follow && !this._cameraMoving) {
      this._x = value;
    }
  }

  /**
   * Get the camera's y position
   */
  public get y() {
    return this._y;
  }

  /**
   * Set the camera's y position (cannot be set when following an [[Actor]] or when moving)
   */
  public set y(value: number) {
    if (!this._follow && !this._cameraMoving) {
      this._y = value;
    }
  }

  /**
   * Get the camera's position as a vector
   */
  public get pos(): Vector {
    return new Vector(this.x, this.y);
  }

  /**
   * Set the cameras position
   */
  public set pos(value: Vector) {
    this.x = value.x;
    this.y = value.y;
  }

  /**
   * Get the camera's velocity as a vector
   */
  public get vel() {
    return new Vector(this.dx, this.dy);
  }

  /**
   * Set the camera's velocity
   */
  public set vel(value: Vector) {
    this.dx = value.x;
    this.dy = value.y;
  }

  /**
   * Returns the focal point of the camera, a new point giving the x and y position of the camera
   */
  public getFocus() {
    return new Vector(this.x, this.y);
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
  public move(pos: Vector, duration: number, easingFn: EasingFunction = EasingFunctions.EaseInOutCubic): IPromise<Vector> {
    if (typeof easingFn !== 'function') {
      throw 'Please specify an EasingFunction';
    }

    // cannot move when following an actor
    if (this._follow) {
      return new Promise<Vector>().reject(pos);
    }

    // resolve existing promise, if any
    if (this._lerpPromise && this._lerpPromise.state() === PromiseState.Pending) {
      this._lerpPromise.resolve(pos);
    }

    this._lerpPromise = new Promise<Vector>();
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
  public zoom(scale: number, duration: number = 0, easingFn: EasingFunction = EasingFunctions.EaseInOutCubic): Promise<boolean> {
    this._zoomPromise = new Promise<boolean>();

    if (duration) {
      this._isZooming = true;
      this._zoomEasing = easingFn;
      this._currentZoomTime = 0;
      this._zoomDuration = duration;
      this._zoomStart = this.z;
      this._zoomEnd = scale;
    } else {
      this._isZooming = false;
      this.z = scale;
      this._zoomPromise.resolve(true);
    }

    return this._zoomPromise;
  }

  /**
   * Gets the current zoom scale
   */
  public getZoom() {
    return this.z;
  }

  /**
   * Adds a new camera strategy to this camera
   * @param cameraStrategy Instance of an [[ICameraStrategy]]
   */
  public addStrategy<T>(cameraStrategy: ICameraStrategy<T>) {
    this._cameraStrategies.push(cameraStrategy);
  }

  /**
   * Removes a camera strategy by reference
   * @param cameraStrategy Instance of an [[ICameraStrategy]]
   */
  public removeStrategy<T>(cameraStrategy: ICameraStrategy<T>) {
    removeItemFromArray(cameraStrategy, this._cameraStrategies);
  }

  /**
   * Clears all camera strategies from the camera
   */
  public clearAllStrategies() {
    this._cameraStrategies.length = 0;
  }

  /**
   * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
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
   *  It is not recommended that internal excalibur methods be overriden, do so at your own risk.
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

  private _isInitialized = false;
  public get isInitialized() {
    return this._isInitialized;
  }

  public _initialize(_engine: Engine) {
    if (!this.isInitialized) {
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

  public on(eventName: 'initialize', handler: (event?: InitializeEvent) => void): void;
  public on(eventName: 'preupdate', handler: (event?: PreUpdateEvent) => void): void;
  public on(eventName: 'postupdate', handler: (event?: PostUpdateEvent) => void): void;
  public on(eventName: any, handler: any) {
    super.on(eventName, handler);
  }

  public off(eventName: 'initialize', handler?: (event?: InitializeEvent) => void): void;
  public off(eventName: 'preupdate', handler?: (event?: PreUpdateEvent) => void): void;
  public off(eventName: 'postupdate', handler?: (event?: PostUpdateEvent) => void): void;
  public off(eventName: string, handler: (event?: GameEvent<any>) => void): void;
  public off(eventName: string, handler: (event?: any) => void): void {
    super.off(eventName, handler);
  }

  public once(eventName: 'initialize', handler: (event?: InitializeEvent) => void): void;
  public once(eventName: 'preupdate', handler: (event?: PreUpdateEvent) => void): void;
  public once(eventName: 'postupdate', handler: (event?: PostUpdateEvent) => void): void;
  public once(eventName: string, handler: (event?: GameEvent<any>) => void): void;
  public once(eventName: string, handler: (event?: any) => void): void {
    super.once(eventName, handler);
  }

  public update(_engine: Engine, delta: number) {
    this._initialize(_engine);
    this._preupdate(_engine, delta);

    // Update placements based on linear algebra
    this._x += (this.dx * delta) / 1000;
    this._y += (this.dy * delta) / 1000;
    this.z += (this.dz * delta) / 1000;

    this.dx += (this.ax * delta) / 1000;
    this.dy += (this.ay * delta) / 1000;
    this.dz += (this.az * delta) / 1000;

    this.rotation += (this.rx * delta) / 1000;

    if (this._isZooming) {
      if (this._currentZoomTime < this._zoomDuration) {
        let zoomEasing = this._zoomEasing;
        let newZoom = zoomEasing(this._currentZoomTime, this._zoomStart, this._zoomEnd, this._zoomDuration);

        this.z = newZoom;
        this._currentZoomTime += delta;
      } else {
        this._isZooming = false;
        this.z = this._zoomEnd;
        this._currentZoomTime = 0;
        this._zoomPromise.resolve(true);
      }
    }

    if (this._cameraMoving) {
      if (this._currentLerpTime < this._lerpDuration) {
        let moveEasing = EasingFunctions.CreateVectorEasingFunction(this._easing);

        let lerpPoint = moveEasing(this._currentLerpTime, this._lerpStart, this._lerpEnd, this._lerpDuration);

        this._x = lerpPoint.x;
        this._y = lerpPoint.y;

        this._currentLerpTime += delta;
      } else {
        this._x = this._lerpEnd.x;
        this._y = this._lerpEnd.y;
        let end = this._lerpEnd.clone();

        this._lerpStart = null;
        this._lerpEnd = null;
        this._currentLerpTime = 0;
        this._cameraMoving = false;
        // Order matters here, resolve should be last so any chain promises have a clean slate
        this._lerpPromise.resolve(end);
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

    for (let s of this._cameraStrategies) {
      this.pos = s.action.call(s, s.target, this, _engine, delta);
    }

    this._postupdate(_engine, delta);
  }

  /**
   * Applies the relevant transformations to the game canvas to "move" or apply effects to the Camera
   * @param ctx    Canvas context to apply transformations
   * @param delta  The number of milliseconds since the last update
   */
  public draw(ctx: CanvasRenderingContext2D) {
    let focus = this.getFocus();
    let canvasWidth = ctx.canvas.width;
    let canvasHeight = ctx.canvas.height;
    let pixelRatio = window.devicePixelRatio;
    let zoom = this.getZoom();

    var newCanvasWidth = canvasWidth / zoom / pixelRatio;
    var newCanvasHeight = canvasHeight / zoom / pixelRatio;

    ctx.scale(zoom, zoom);
    ctx.translate(-focus.x + newCanvasWidth / 2 + this._xShake, -focus.y + newCanvasHeight / 2 + this._yShake);
  }

  public debugDraw(ctx: CanvasRenderingContext2D) {
    var focus = this.getFocus();
    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(focus.x, focus.y, 15, 0, Math.PI * 2);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(focus.x, focus.y, 5, 0, Math.PI * 2);
    ctx.closePath();
    ctx.stroke();
  }

  private _isDoneShaking(): boolean {
    return !this._isShaking || this._elapsedShakeTime >= this._shakeDuration;
  }
}
