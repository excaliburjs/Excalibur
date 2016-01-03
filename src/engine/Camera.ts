/// <reference path="Engine.ts" />
/// <reference path="Algebra.ts" />

module ex {

   /**
    * Cameras
    *
    * [[BaseCamera]] is the base class for all Excalibur cameras. Cameras are used
    * to move around your game and set focus. They are used to determine
    * what is "off screen" and can be used to scale the game.
    *
    * Excalibur comes with a [[LockedCamera]] and a [[SideCamera]], depending on
    * your game needs.
    *
    * Cameras are attached to [[Scene|Scenes]] and can be changed by 
    * setting [[Scene.camera]]. By default, a [[Scene]] is initialized with a
    * [[BaseCamera]] that doesn't move and is centered on the screen.
    *
    * ## Focus
    *
    * Cameras have a [[BaseCamera.focus|focus]] which means they center around a specific
    * [[Point]]. This can be an [[Actor]] ([[BaseCamera.setActorToFollow]]) or a specific
    * [[Point]] ([[BaseCamera.setFocus]]).
    *
    * If a camera is following an [[Actor]], it will ensure the [[Actor]] is always at the
    * center of the screen. You can use [[BaseCamera.setFocus]] instead if you wish to
    * offset the focal point.
    *
    * ## Camera Shake
    *
    * To add some fun effects to your game, the [[BaseCamera.shake]] method
    * will do a random shake. This is great for explosions, damage, and other
    * in-game effects.
    *
    * ## Camera Lerp
    *
    * "Lerp" is short for [Linear Interpolation](http://en.wikipedia.org/wiki/Linear_interpolation) 
    * and it enables the camera focus to move smoothly between two points using timing functions. 
    * Set [[BaseCamera.lerp]] to `true` to enable "lerping".
    *
    * ## Camera Zooming
    *
    * To adjust the zoom for your game, use [[BaseCamera.zoom]] which will scale the
    * game accordingly. You can pass a duration to transition between zoom levels.
    *
    * ## Known Issues
    *
    * **Cameras do not support [[EasingFunctions]]**
    * [Issue #320](https://github.com/excaliburjs/Excalibur/issues/320)
    *
    * Currently [[BaseCamera.lerp]] only supports `easeInOutCubic` but will support
    * [[EasingFunctions|easing functions]] soon.
    *
    * **Actors following a path will wobble when camera is moving**
    * [Issue #276](https://github.com/excaliburjs/Excalibur/issues/276)
    *
    */
   export class BaseCamera {
      protected _follow: Actor;
      public focus: Point = new Point(0, 0);
      public lerp: boolean = false;

      // camera physical quantities
      public x: number = 0;
      public y: number = 0;
      public z: number = 1;

      public dx: number = 0;
      public dy: number = 0;
      public dz: number = 0;

      public ax: number = 0;
      public ay: number = 0;
      public az: number = 0;

      public rotation: number = 0;
      public rx: number = 0;


      private _cameraMoving: boolean = false;
      private _currentLerpTime: number = 0;
      private _lerpDuration: number = 1 * 1000; // 5 seconds
      private _totalLerpTime: number = 0;
      private _lerpStart: Point = null;
      private _lerpEnd: Point = null;

      //camera effects
      protected _isShaking: boolean = false;
      private _shakeMagnitudeX: number = 0;
      private _shakeMagnitudeY: number = 0;
      private _shakeDuration: number = 0;
      private _elapsedShakeTime: number = 0;

      protected _isZooming: boolean = false;
      private _currentZoomScale: number = 1;
      private _maxZoomScale: number = 1;
      private _zoomDuration: number = 0;
      private _elapsedZoomTime: number = 0;
      private _zoomIncrement: number = 0.01;



      private _easeInOutCubic(currentTime: number, startValue: number, endValue: number, duration: number) {

         endValue = (endValue - startValue);
         currentTime /= duration / 2;
         if (currentTime < 1) { return endValue / 2 * currentTime * currentTime * currentTime + startValue; }
         currentTime -= 2;
         return endValue / 2 * (currentTime * currentTime * currentTime + 2) + startValue;
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
         return new ex.Point(this.x, this.y);
      }

      /**
       * Sets the focal point of the camera. This value can only be set if there is no actor to be followed.
       * @param x The x coordinate of the focal point
       * @param y The y coordinate of the focal point
       * @deprecated
       */
      public setFocus(x: number, y: number) {
         if (!this._follow && !this.lerp) {
            this.x = x;
            this.y = y;
         }

         if (this.lerp) {
            this._lerpStart = this.getFocus().clone();
            this._lerpEnd = new Point(x, y);
            this._currentLerpTime = 0;
            this._cameraMoving = true;
         }
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
      public zoom(scale: number, duration: number = 0) {
         this._isZooming = true;
         this._maxZoomScale = scale;
         this._zoomDuration = duration;
         if (duration) {
            this._zoomIncrement = Math.abs(this._maxZoomScale - this._currentZoomScale) / duration * 1000;
         }

         if (this._maxZoomScale < 1) {
            if (duration) {
               this._zoomIncrement = -1 * this._zoomIncrement;
            } else {
               this._isZooming = false;
               this._setCurrentZoomScale(this._maxZoomScale);
            }
         } else {
            if (!duration) {
               this._isZooming = false;
               this._setCurrentZoomScale(this._maxZoomScale);
            }
         }
      }

      /**
       * Gets the current zoom scale
       */
      public getZoom() {
         return this.z;
      }

      private _setCurrentZoomScale(zoomScale: number) {
         this.z = zoomScale;
      }

      /**
       * Applies the relevant transformations to the game canvas to "move" or apply effects to the Camera
       * @param delta  The number of milliseconds since the last update
       */
      public update(ctx: CanvasRenderingContext2D, delta: number) {
         // Update placements based on linear algebra
         this.x += this.dx * delta / 1000;
         this.y += this.dy * delta / 1000;
         this.z += this.dz * delta / 1000;

         this.dx += this.ax * delta / 1000;
         this.dy += this.ay * delta / 1000;
         this.dz += this.az * delta / 1000;

         this.rotation += this.rx * delta / 1000;
         

         var focus = this.getFocus();

         var xShake = 0;
         var yShake = 0;

         var canvasWidth = ctx.canvas.width;
         var canvasHeight = ctx.canvas.height;

         // if zoom is 2x then canvas is 1/2 as high
         // if zoom is .5x then canvas is 2x as high
         var newCanvasWidth = canvasWidth / this.getZoom();
         var newCanvasHeight = canvasHeight / this.getZoom();

         if (this.lerp) {
            if (this._currentLerpTime < this._lerpDuration && this._cameraMoving) {

               if (this._lerpEnd.x < this._lerpStart.x) {
                  this.x = this._lerpStart.x - (this._easeInOutCubic(this._currentLerpTime,
                     this._lerpEnd.x, this._lerpStart.x, this._lerpDuration) - this._lerpEnd.x);
               } else {
                  this.x = this._easeInOutCubic(this._currentLerpTime,
                     this._lerpStart.x, this._lerpEnd.x, this._lerpDuration);
               }

               if (this._lerpEnd.y < this._lerpStart.y) {
                  this.y = this._lerpStart.y - (this._easeInOutCubic(this._currentLerpTime,
                     this._lerpEnd.y, this._lerpStart.y, this._lerpDuration) - this._lerpEnd.y);
               } else {
                  this.y = this._easeInOutCubic(this._currentLerpTime,
                     this._lerpStart.y, this._lerpEnd.y, this._lerpDuration);
               }
               this._currentLerpTime += delta;
            } else {
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
         } else {
            this._elapsedShakeTime += delta;
            xShake = (Math.random() * this._shakeMagnitudeX | 0) + 1;
            yShake = (Math.random() * this._shakeMagnitudeY | 0) + 1;
         }

         /*if (this._isDoneZooming()) {
            this._isZooming = false;
            this._elapsedZoomTime = 0;
            this._zoomDuration = 0;
            this._setCurrentZoomScale(this._maxZoomScale);

         } else {
            this._elapsedZoomTime += delta;

            this._setCurrentZoomScale(this.getZoom() + this._zoomIncrement * delta / 1000);
         }*/

         ctx.scale(this.getZoom(), this.getZoom());
         ctx.translate(-focus.x + newCanvasWidth / 2 + xShake, -focus.y + newCanvasHeight / 2 + yShake);

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

      private _isDoneZooming(): boolean {
         if (this._zoomDuration !== 0) {
            return (this._elapsedZoomTime >= this._zoomDuration);
         } else {
            if (this._maxZoomScale < 1) {
               return (this._currentZoomScale <= this._maxZoomScale);
            } else {
               return (this._currentZoomScale >= this._maxZoomScale);
            }
         }
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
            return new Point(this._follow.x + this._follow.getWidth() / 2, this.focus.y);
         } else {
            return this.focus;
         }
      }
   }

   /**
    * An extension of [[BaseCamera]] that is locked to an [[Actor]] or 
    * [[LockedCamera.focus|focal point]]; the actor will appear in the 
    * center of the screen.
    *
    * Common usages: RPGs, adventure games, top-down games.
    */
   export class LockedCamera extends BaseCamera {

      public getFocus() {
         if (this._follow) {
            return new Point(this._follow.x + this._follow.getWidth() / 2, this._follow.y + this._follow.getHeight() / 2);
         } else {
            return this.focus;
         }
      }
   }
}
