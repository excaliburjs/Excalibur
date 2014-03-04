/// <reference path="Core.ts" />
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
      private shakeMagnitudeX: number = 0;
      private shakeMagnitudeY: number = 0;
      private shakeDuration: number = 0;
      private elapsedShakeTime: number = 0;

      isZooming: boolean = false;
      private currentZoomScale: number = 1;
      private maxZoomScale: number = 1;
      private zoomDuration: number = 0;
      private elapsedZoomTime: number = 0;
      private zoomIncrement: number = 0.01;

      constructor(engine: Engine) {
         this.engine = engine;
      }

      /**
      * Sets the {{#crossLink Actor}}{{//crossLink}} to follow with the camera
      * @method setActorToFollow
      * @param actor {Actor} The actor to follow
      */
      setActorToFollow(actor: Actor) {
         this.follow = actor;
      }

      /**
      * Returns the focal point of the camera
      * @method getFocus
      * @returns Point
      */
      getFocus() {
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
      setFocus(x: number, y: number) {
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
      shake(magnitudeX: number, magnitudeY: number, duration: number) {
         this.isShaking = true;
         this.shakeMagnitudeX = magnitudeX;
         this.shakeMagnitudeY = magnitudeY;
         this.shakeDuration = duration;
      }

      /**
      * Zooms the camera in or out by the specified scale over the specified duration. 
      * If no duration is specified, it will zoom by a set amount until the scale is reached.
      * @method zoom
      * @param scale {number} the scale of the zoom
      * @param [duration] {number} the duration of the zoom
      */
      zoom(scale: number, duration?: number) {
         this.isZooming = true;
         this.maxZoomScale = scale;
         this.zoomDuration = duration | 0;
         if (duration) {
            this.zoomIncrement = Math.abs(this.maxZoomScale - this.currentZoomScale) / duration * 1000;
         }

         if (this.maxZoomScale < 1) {
            if (duration) {
               this.zoomIncrement = -1 * this.zoomIncrement;
            } else {
               this.zoomIncrement = -0.01;
            }
         }

         // console.log("zoom increment: " + this.zoomIncrement);
      }

      /**
      * gets the current zoom scale
      * @method getCurrentZoomScale
      * @returns {Number} the current zoom scale
      */
      getCurrentZoomScale() {
         return this.currentZoomScale;
      }

      private setCurrentZoomScale(zoomScale: number) {
         this.currentZoomScale = zoomScale;
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
         var newCanvasWidth = canvasWidth * this.getCurrentZoomScale();
         var newCanvasHeight =  canvasHeight * this.getCurrentZoomScale();

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

         this.engine.ctx.translate(focus.x + xShake, focus.y + yShake);

         if (this.isDoneZooming()) {
            this.isZooming = false;
            this.elapsedZoomTime = 0;
            this.zoomDuration = 0;

         } else {
            this.elapsedZoomTime += delta;

            this.setCurrentZoomScale(this.getCurrentZoomScale() + this.zoomIncrement * delta / 1000);
         }

         this.engine.ctx.translate(-((newCanvasWidth - canvasWidth)/2), -((newCanvasHeight - canvasHeight)/2));
         this.engine.ctx.scale(this.getCurrentZoomScale(), this.getCurrentZoomScale());
      }

      private isDoneShaking(): boolean {
         return !(this.isShaking) || (this.elapsedShakeTime >= this.shakeDuration);
      }

      private isDoneZooming(): boolean {
         if (this.zoomDuration != 0) {
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
   * An extension of BaseCamera that is locked vertically; it will only move side to side.
   * @class SideCamera
   * @extends BaseCamera
   * @constructor
   * @param engine {Engine} Reference to the current engine
   */
   export class SideCamera extends BaseCamera {
      
      getFocus() {
         if (this.follow) {
            // return new Point(-this.follow.x + this.engine.width / 2.0, 0);
            return new Point((-this.follow.x * this.getCurrentZoomScale()) + (this.engine.width * this.getCurrentZoomScale()) / 2.0, 0);
         } else {
            return this.focus;
         }
      }

   }

   /**
   * An extension of BaseCamera that is locked to an actor or focal point; the actor will appear in the center of the screen.
   * @class TopCamera
   * @extends BaseCamera
   * @constructor
   * @param engine {Engine} Reference to the current engine
   */
   export class TopCamera extends BaseCamera {

      /**
       * Returns the focal point of the camera
       * @method getFocus
       * @returns Point
       */
      getFocus() {
         if (this.follow) {
            return new Point((-this.follow.x * this.getCurrentZoomScale()) + (this.engine.width * this.getCurrentZoomScale()) / 2.0, 
                             (-this.follow.y * this.getCurrentZoomScale()) + (this.engine.height * this.getCurrentZoomScale()) / 2.0);
            } else {
               return this.focus;
            }
      }

   }

}