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
      engine: Engine;

      //camera effects
      isShaking: boolean = false;
      private shakeMagnitude: number = 0;
      private shakeDuration: number = 0;
      private elapsedShakeTime: number = 0;

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
         return new Point(0, 0);
      }


      /**
      * Sets the camera to shake at the specified magnitude for the specified duration
      * @method shake
      * @param magnitude {number} the magnitude of the shake
      * @param duration {number} the duration of the shake
      */
      shake(magnitude: number, duration: number) {
         this.isShaking = true;
         this.shakeMagnitude = magnitude;
         this.shakeDuration = duration;
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

         if (this.isDoneShaking()) {
               this.isShaking = false;
               this.elapsedShakeTime = 0;
               this.shakeMagnitude = 0;
               this.shakeDuration = 0;
            } else {
               this.elapsedShakeTime += delta;
               xShake = (Math.random() * this.shakeMagnitude | 0) + 1;
               yShake = (Math.random() * this.shakeMagnitude | 0) + 1;
            }

         this.engine.ctx.translate(focus.x + xShake, focus.y + yShake);
      }

      private isDoneShaking(): boolean {
         return !(this.isShaking) || (this.elapsedShakeTime >= this.shakeDuration);
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
         return new Point(-this.follow.x + this.engine.width / 2.0, 0);
      }

   }

   /**
   * An extension of BaseCamera that is locked to an actor; the actor will appear in the center of the screen.
   * @class TopCamera
   * @extends BaseCamera
   * @constructor
   * @param engine {Engine} Reference to the current engine
   */
   export class TopCamera extends BaseCamera {

      getFocus() {
         return new Point(-this.follow.x + this.engine.width / 2.0, -this.follow.y + this.engine.height / 2.0);
      }

   }

}