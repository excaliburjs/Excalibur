import { Engine } from './Engine';
import { EasingFunction, EasingFunctions } from './Util/EasingFunctions';
import { IPromise, Promise, PromiseState } from './Promises';
import { Vector } from './Algebra';
import { Actor } from './Actor';


/**
 * Cameras
 *
 * [[BaseCamera]] is the base class for all Excalibur cameras. Cameras are used
 * to move around your game and set focus. They are used to determine
 * what is "off screen" and can be used to scale the game.
 *
 * [[include:Cameras.md]]
 */
export class BaseCamera {
   protected _follow: Actor;

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
   private _maxZoomScale: number = 1;
   private _zoomDuration: number = 0;
   private _zoomPromise: Promise<boolean>;
   private _zoomIncrement: number = 0.01;
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
    * Sets the [[Actor]] to follow with the camera
    * @param actor  The actor to follow
    */
   public setActorToFollow(actor: Actor) {
      this._follow = actor;
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
   public zoom(scale: number, duration: number = 0): Promise<boolean> {
      this._zoomPromise = new Promise<boolean>();
      
      if (duration) {
         this._isZooming = true;
         this._maxZoomScale = scale;
         this._zoomDuration = duration;
         this._zoomIncrement = (scale - this.z) / duration;
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

   public update(_engine: Engine, delta: number) {
      // Update placements based on linear algebra
      this._x += this.dx * delta / 1000;
      this._y += this.dy * delta / 1000;
      this.z += this.dz * delta / 1000;

      this.dx += this.ax * delta / 1000;
      this.dy += this.ay * delta / 1000;
      this.dz += this.az * delta / 1000;

      this.rotation += this.rx * delta / 1000;

      if (this._isZooming) {
         var newZoom = this.z + this._zoomIncrement * delta;      
         this.z = newZoom;
         if (this._zoomIncrement > 0) {
               
            if (newZoom >= this._maxZoomScale) {
               this._isZooming = false;
               this.z = this._maxZoomScale;
               this._zoomPromise.resolve(true);
            }
         } else {
            if (newZoom <= this._maxZoomScale) {
               this._isZooming = false;
               this.z = this._maxZoomScale;
               this._zoomPromise.resolve(true);
            }
         }         
      }

      if (this._cameraMoving) {
         if (this._currentLerpTime < this._lerpDuration) {

            if (this._lerpEnd.x < this._lerpStart.x) {
               this._x = this._lerpStart.x - (this._easing(this._currentLerpTime,
                  this._lerpEnd.x, this._lerpStart.x, this._lerpDuration) - this._lerpEnd.x);
            } else {
               this._x = this._easing(this._currentLerpTime,
                  this._lerpStart.x, this._lerpEnd.x, this._lerpDuration);
            }

            if (this._lerpEnd.y < this._lerpStart.y) {
               this._y = this._lerpStart.y - (this._easing(this._currentLerpTime,
                  this._lerpEnd.y, this._lerpStart.y, this._lerpDuration) - this._lerpEnd.y);
            } else {
               this._y = this._easing(this._currentLerpTime,
                  this._lerpStart.y, this._lerpEnd.y, this._lerpDuration);
            }
            this._currentLerpTime += delta;
         } else {
            this._x = this._lerpEnd.x;
            this._y = this._lerpEnd.y;
            this._lerpPromise.resolve(this._lerpEnd);
            this._lerpStart = null;
            this._lerpEnd = null;
            this._currentLerpTime = 0;
            this._cameraMoving = false;
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
         this._xShake = (Math.random() * this._shakeMagnitudeX | 0) + 1;
         this._yShake = (Math.random() * this._shakeMagnitudeY | 0) + 1;
      }
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

      var newCanvasWidth = (canvasWidth / zoom) / pixelRatio;
      var newCanvasHeight = (canvasHeight / zoom) / pixelRatio;

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
      return !(this._isShaking) || (this._elapsedShakeTime >= this._shakeDuration);
   }
}

/**
 * An extension of [[BaseCamera]] that is locked vertically; it will only move side to side.
 * 
 * Common usages: platformers.
 */
export class SideCamera extends BaseCamera {

   public getFocus() {
      if (this._follow) {
         return new Vector(this._follow.pos.x + this._follow.getWidth() / 2, super.getFocus().y);
      } else {
         return super.getFocus();
      }
   }
}

/**
 * An extension of [[BaseCamera]] that is locked to an [[Actor]] or 
 * [[LockedCamera.getFocus|focal point]]; the actor will appear in the 
 * center of the screen.
 *
 * Common usages: RPGs, adventure games, top-down games.
 */
export class LockedCamera extends BaseCamera {

   public getFocus() {
      if (this._follow) {
         return new Vector(this._follow.pos.x + this._follow.getWidth() / 2, this._follow.pos.y + this._follow.getHeight() / 2);
      } else {
         return super.getFocus();
      }
   }
}