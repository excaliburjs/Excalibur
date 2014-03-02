/// <reference path="Core.ts" />
/// <reference path="Algebra.ts" />

module ex {
   /**
    * Interface for implementing an Excalibur camera
    * @class ICamera
    */
   export interface ICamera {
      /**
       * Should return the focal point of the camera
       * @method getFocus
       * @returns Point
       */
      getFocus(): Point;
      /**
       * Should apply the relevant transformation to the games canvas
       * @method applyTransform
       * @param delta {number} The number of milliseconds since the last apply
       */
      applyTransform(delta: number): void;
   }

   /**
    * An implementation of ICamera providing a basic "Side Scroller" type.
    * This camera will be locked on the vertical, and only move
    * side to side.
    * @class SideCamera
    * @extends ICamera
    * @constructor
    * @param engine {Engine} Reference to the current engine.
    */
   export class SideCamera implements ICamera {
      follow: Actor;
      engine: Engine;
      constructor(engine: Engine) {
         this.engine = engine;
      }

      /**
       * Sets the {{#crossLink Actor}}{{/crossLink}} to follow with the SideCamera.
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
         return new Point(-this.follow.x + this.engine.width / 2.0, 0);
      }

      /**
       * Applies the relevant transformation to the games canvas
       * @method applyTransform
       * @param delta {number} The number of milliseconds since the last apply
       */
      applyTransform(delta: number) {
         var focus = this.getFocus();
         this.engine.ctx.translate(focus.x, focus.y);
      }
   }

   /**
    * An implementation of ICamera providing a basic where the camera
    * will be locked on whatever {{#crossLink Actor}}{{/crossLink}} you provide. 
    * The {{#crossLink Actor}}{{/crossLink}} will be displayed in the center
    * of the screen.
    * @class TopCamera
    * @extends ICamera
    * @constructor
    * @param engine {Engine} Reference to the current engine.
    */
   export class TopCamera implements ICamera {
      follow: Actor;
      engine: Engine;
      constructor(engine: Engine) {
         this.engine = engine;
      }

      /**
       * Sets the {{#crossLink Actor}}{{/crossLink}} to follow with the TopCamera.
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
         return new Point(-this.follow.x + this.engine.width / 2.0, -this.follow.y + this.engine.height / 2.0);
      }
      
      /**
       * Applies the relevant transformation to the games canvas
       * @method applyTransform
       * @param delta {number} The number of milliseconds since the last apply
       */
      applyTransform(delta: number) {
         var focus = this.getFocus();
         this.engine.ctx.translate(focus.x, focus.y);
      }
   }
}