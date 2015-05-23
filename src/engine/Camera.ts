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
      protected follow: Actor;
      protected focus: Point = new Point(0, 0);
      protected lerp: boolean = false;
      private _cameraMoving: boolean = false;
      private _currentLerpTime: number = 0;
      private _lerpDuration: number = 1 * 1000; // 5 seconds
      private _totalLerpTime: number = 0;
      private _lerpStart: Point = null;
      private _lerpEnd: Point = null;

      //camera effects
      protected isShaking: boolean = false;
      private shakeMagnitudeX: number = 0;
      private shakeMagnitudeY: number = 0;
      private shakeDuration: number = 0;
      private elapsedShakeTime: number = 0;

      protected isZooming: boolean = false;
      private currentZoomScale: number = 1;
      private maxZoomScale: number = 1;
      private zoomDuration: number = 0;
      private elapsedZoomTime: number = 0;
      private zoomIncrement: number = 0.01;

      

      private easeInOutCubic(currentTime: number, startValue: number, endValue: number, duration: number) {
         
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
         this.follow = actor;
      }

      /**
       * Returns the focal point of the camera
       */
      public getFocus() {
         return this.focus;
      }

      /**
       * Sets the focal point of the camera. This value can only be set if there is no actor to be followed.
       * @param x The x coordinate of the focal point
       * @param y The y coordinate of the focal point
       */
      public setFocus(x: number, y: number) {
         if (!this.follow && !this.lerp) {
            this.focus.x = x;
            this.focus.y = y;
         }

         if (this.lerp) {
            this._lerpStart = this.focus.clone();
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
         this.isShaking = true;
         this.shakeMagnitudeX = magnitudeX;
         this.shakeMagnitudeY = magnitudeY;
         this.shakeDuration = duration;
      }

      /**
       * Zooms the camera in or out by the specified scale over the specified duration. 
       * If no duration is specified, it take effect immediately.
       * @param scale    The scale of the zoom
       * @param duration The duration of the zoom in milliseconds
       */
      public zoom(scale: number, duration: number = 0) {
         this.isZooming = true;
         this.maxZoomScale = scale;
         this.zoomDuration = duration;
         if (duration) {
            this.zoomIncrement = Math.abs(this.maxZoomScale - this.currentZoomScale) / duration * 1000;
         }

         if (this.maxZoomScale < 1) {
            if (duration) {
               this.zoomIncrement = -1 * this.zoomIncrement;
            } else {
               this.isZooming = false;
               this._setCurrentZoomScale(this.maxZoomScale);
            }
         } else {
            if(!duration) {
               this.isZooming = false;
               this._setCurrentZoomScale(this.maxZoomScale);
            }
         }
      }

      /**
       * Gets the current zoom scale
       */
      public getZoom() {
         return this.currentZoomScale;
      }

      private _setCurrentZoomScale(zoomScale: number) {
         this.currentZoomScale = zoomScale;
      }

      /**
       * Applies the relevant transformations to the game canvas to "move" or apply effects to the Camera
       * @param delta  The number of milliseconds since the last update
       */
      public update(ctx: CanvasRenderingContext2D, delta: number) {
         var focus = this.getFocus();

         var xShake = 0;
         var yShake = 0;

         var canvasWidth = ctx.canvas.width;
         var canvasHeight = ctx.canvas.height;
         var newCanvasWidth = canvasWidth * this.getZoom();
         var newCanvasHeight = canvasHeight * this.getZoom();

         if (this.lerp) {
            if (this._currentLerpTime < this._lerpDuration && this._cameraMoving) {
               
               if (this._lerpEnd.x < this._lerpStart.x) {
                  this.focus.x = this._lerpStart.x - 
                  (this.easeInOutCubic(this._currentLerpTime, this._lerpEnd.x, this._lerpStart.x, this._lerpDuration) - this._lerpEnd.x); 
               } else {
                  this.focus.x = 
                  this.easeInOutCubic(this._currentLerpTime, this._lerpStart.x, this._lerpEnd.x, this._lerpDuration);
               }

               if (this._lerpEnd.y < this._lerpStart.y) {
                  this.focus.y = this._lerpStart.y - 
                  (this.easeInOutCubic(this._currentLerpTime, this._lerpEnd.y, this._lerpStart.y, this._lerpDuration) - this._lerpEnd.y);
               } else {
                  this.focus.y = 
                  this.easeInOutCubic(this._currentLerpTime, this._lerpStart.y, this._lerpEnd.y, this._lerpDuration);                  
               }
               this._currentLerpTime += delta;
            } else {               
               this._lerpStart = null;
               this._lerpEnd = null;
               this._currentLerpTime = 0;
               this._cameraMoving = false;
            }
         }

         if (this.isDoneShaking()) {
               this.isShaking = false;
               this.elapsedShakeTime = 0;
               this.shakeMagnitudeX = 0;
               this.shakeMagnitudeY = 0;
               this.shakeDuration = 0;
            } else {
               this.elapsedShakeTime += delta;
               xShake = (Math.random() * this.shakeMagnitudeX | 0) + 1;
               yShake = (Math.random() * this.shakeMagnitudeY | 0) + 1;
            }

         ctx.translate(-focus.x + xShake + (newCanvasWidth / 2), -focus.y + yShake + (newCanvasHeight / 2));

         if (this.isDoneZooming()) {
            this.isZooming = false;
            this.elapsedZoomTime = 0;
            this.zoomDuration = 0;
            this._setCurrentZoomScale(this.maxZoomScale);

         } else {
            this.elapsedZoomTime += delta;

            this._setCurrentZoomScale(this.getZoom() + this.zoomIncrement * delta / 1000);
         }

         ctx.scale(this.getZoom(), this.getZoom());
      }

      public debugDraw(ctx: CanvasRenderingContext2D) {
         var focus = this.getFocus();
         ctx.fillStyle = 'red';
         ctx.beginPath();
         ctx.arc(focus.x, focus.y, 15, 0, Math.PI * 2);
         ctx.closePath();
         ctx.fill();
      }

      private isDoneShaking(): boolean {
         return !(this.isShaking) || (this.elapsedShakeTime >= this.shakeDuration);
      }

      private isDoneZooming(): boolean {
         if (this.zoomDuration !== 0) {
            return (this.elapsedZoomTime >= this.zoomDuration);
         } else {
            if (this.maxZoomScale < 1) {
               return (this.currentZoomScale <= this.maxZoomScale);
            } else {
               return (this.currentZoomScale >= this.maxZoomScale);
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
         if (this.follow) {
            return new Point(this.follow.x + this.follow.getWidth() / 2, this.focus.y);
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
         if (this.follow) {
            return new Point(this.follow.x + this.follow.getWidth() / 2, this.follow.y + this.follow.getHeight() / 2);
         } else {
            return this.focus;
         }
      }
   }
}
