/// <reference path="Engine.ts" />
/// <reference path="Algebra.ts" />

module ex {

   /**
   * A base implementation of a camera. This class is meant to be extended.
   * @class Camera
   * @constructor
   * @param engine {Engine} Reference to the current engine
   */
   export class BaseCamera {
      follow: Actor;
      focus: Point = new Point(0, 0);
      engine: Engine;

      //camera effects
      isShaking: boolean = false;
      private _shakeMagnitudeX: number = 0;
      private _shakeMagnitudeY: number = 0;
      private _shakeDuration: number = 0;
      private _elapsedShakeTime: number = 0;

      isZooming: boolean = false;
      private _currentZoomScale: number = 1;
      private _maxZoomScale: number = 1;
      private _zoomDuration: number = 0;
      private _elapsedZoomTime: number = 0;
      private _zoomIncrement: number = 0.01;

      constructor(engine: Engine) {
         this.engine = engine;
      }

      /**
      * Sets the {{#crossLink Actor}}{{/crossLink}} to follow with the camera
      * @method setActorToFollow
      * @param actor {Actor} The actor to follow
      */
      public setActorToFollow(actor: Actor) {
         this.follow = actor;
      }

      /**
      * Returns the focal point of the camera
      * @method getFocus
      * @returns Point
      */
      public getFocus() {
         // this should always be overridden
         if (this.follow) {
            return new Point(0, 0);
            } else {
               return this.focus;
            }
      }

      /**
      * Sets the focal point of the camera. This value can only be set if there is no actor to be followed.
      * @method setFocus
      * @param x {number} The x coordinate of the focal point
      * @param y {number} The y coordinate of the focal point
      */
      public setFocus(x: number, y: number) {
         if (!this.follow) {
            this.focus.x = x;
            this.focus.y = y;
         }
      }

      /**
      * Sets the camera to shake at the specified magnitudes for the specified duration
      * @method shake
      * @param magnitudeX {number} the x magnitude of the shake
      * @param magnitudeY {number} the y magnitude of the shake
      * @param duration {number} the duration of the shake
      */
      public shake(magnitudeX: number, magnitudeY: number, duration: number) {
         this.isShaking = true;
         this._shakeMagnitudeX = magnitudeX;
         this._shakeMagnitudeY = magnitudeY;
         this._shakeDuration = duration;
      }

      /**
      * Zooms the camera in or out by the specified scale over the specified duration. 
      * If no duration is specified, it will zoom by a set amount until the scale is reached.
      * @method zoom
      * @param scale {number} the scale of the zoom
      * @param [duration] {number} the duration of the zoom
      */
      public zoom(scale: number, duration?: number) {
         this.isZooming = true;
         this._maxZoomScale = scale;
         this._zoomDuration = duration | 0;
         if (duration) {
            this._zoomIncrement = Math.abs(this._maxZoomScale - this._currentZoomScale) / duration * 1000;
         }

         if (this._maxZoomScale < 1) {
            if (duration) {
               this._zoomIncrement = -1 * this._zoomIncrement;
            } else {
               this.isZooming = false;
               this._setCurrentZoomScale(this._maxZoomScale);
            }
         }else{
            if(!duration){
               this.isZooming = false;
               this._setCurrentZoomScale(this._maxZoomScale);
            }
         }

         // console.log("zoom increment: " + this.zoomIncrement);
      }

      /**
      * gets the current zoom scale
      * @method getZoom
      * @returns {Number} the current zoom scale
      */
      public getZoom() {
         return this._currentZoomScale;
      }

      private _setCurrentZoomScale(zoomScale: number) {
         this._currentZoomScale = zoomScale;
      }

      /**
      * Applies the relevant transformations to the game canvas to "move" or apply effects to the Camera
      * @method update
      * @param delta {number} The number of milliseconds since the last update
      */
      update(delta: number) {
         var focus = this.getFocus();

         var xShake = 0;
         var yShake = 0;

         var canvasWidth = this.engine.ctx.canvas.width;
         var canvasHeight = this.engine.ctx.canvas.height;
         var newCanvasWidth = canvasWidth * this.getZoom();
         var newCanvasHeight =  canvasHeight * this.getZoom();

         if (this._isDoneShaking()) {
               this.isShaking = false;
               this._elapsedShakeTime = 0;
               this._shakeMagnitudeX = 0;
               this._shakeMagnitudeY = 0;
               this._shakeDuration = 0;
            } else {
               this._elapsedShakeTime += delta;
               xShake = (Math.random() * this._shakeMagnitudeX | 0) + 1;
               yShake = (Math.random() * this._shakeMagnitudeY | 0) + 1;
            }

         this.engine.ctx.translate(focus.x + xShake, focus.y + yShake);

         if (this._isDoneZooming()) {
            this.isZooming = false;
            this._elapsedZoomTime = 0;
            this._zoomDuration = 0;
            this._setCurrentZoomScale(this._maxZoomScale);

         } else {
            this._elapsedZoomTime += delta;

            this._setCurrentZoomScale(this.getZoom() + this._zoomIncrement * delta / 1000);
         }

         //this.engine.ctx.translate(-((newCanvasWidth - canvasWidth)/2), -((newCanvasHeight - canvasHeight)/2));
         this.engine.ctx.scale(this.getZoom(), this.getZoom());
      }

      public debugDraw(ctx: CanvasRenderingContext2D){
         var focus = this.getFocus();
         ctx.fillStyle = 'yellow';
         ctx.beginPath();
         ctx.arc(this.follow.x + this.follow.getWidth()/2, 0, 15, 0, Math.PI*2);
         ctx.closePath();
         ctx.fill();
      }

      private _isDoneShaking(): boolean {
         return !(this.isShaking) || (this._elapsedShakeTime >= this._shakeDuration);
      }

      private _isDoneZooming(): boolean {
         if (this._zoomDuration != 0) {
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
   * An extension of BaseCamera that is locked vertically; it will only move side to side.
   * @class SideCamera
   * @extends BaseCamera
   * @constructor
   * @param engine {Engine} Reference to the current engine
   */
   export class SideCamera extends BaseCamera {
      
      /**
       * Returns the focal point of the camera in world space
       * @method getFocus
       * @returns point
       */
      getFocus() {
         if (this.follow) {
            // return new Point(-this.follow.x + this.engine.width / 2.0, 0);
            return new Point(((-this.follow.x - this.follow.getWidth()/2) * this.getZoom()) + (this.engine.getWidth() * this.getZoom()) / 2.0, 0);
         } else {
            return this.focus;
         }
      }

   }

   /**
   * An extension of BaseCamera that is locked to an actor or focal point; the actor will appear in the center of the screen.
   * @class LockedCamera
   * @extends BaseCamera
   * @constructor
   * @param engine {Engine} Reference to the current engine
   */
   export class LockedCamera extends BaseCamera {

      /**
       * Returns the focal point of the camera in world space
       * @method getFocus
       * @returns Point
       */
      getFocus() {
         if (this.follow) {
            return new Point(((-this.follow.x - this.follow.getWidth() / 2) * this.getZoom()) + (this.engine.getWidth() * this.getZoom()) / 2.0, 
                             ((-this.follow.y - this.follow.getHeight() / 2) * this.getZoom()) + (this.engine.getHeight() * this.getZoom()) / 2.0);
            } else {
               return this.focus;
            }
      }

   }

}
