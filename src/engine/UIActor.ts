import { Vector } from './Algebra';
import { Engine } from './Engine';
import { Actor, CollisionType } from './Actor';
import * as Traits from './Traits/Index';
import { Configurable } from './Configurable';

/**
 * Helper [[Actor]] primitive for drawing UI's, optimized for UI drawing. Does
 * not participate in collisions. Drawn on top of all other actors.
 */
export class UIActorImpl extends Actor {
   protected _engine: Engine;

   /**
    * @param x       The starting x coordinate of the actor
    * @param y       The starting y coordinate of the actor
    * @param width   The starting width of the actor
    * @param height  The starting height of the actor
    */
   constructor(xOrConfig?: number | Partial<UIActorImpl>, y?: number, width?: number, height?: number) {
      if (typeof(xOrConfig !== 'object')) {
         super(<number>xOrConfig, y, width, height);
      } else {
         super(xOrConfig);
      }
      this.traits = [];
      this.traits.push(new Traits.CapturePointer());
      this.anchor.setTo(0, 0);
      this.collisionType = CollisionType.PreventCollision;
      this.enableCapturePointer = true;
   }

   public onInitialize(engine: Engine) {
      this._engine = engine;
   }

   public contains(x: number, y: number, useWorld: boolean = true) {
      if (useWorld) { return super.contains(x, y); }

      var coords = this._engine.worldToScreenCoordinates(new Vector(x, y));
      return super.contains(coords.x, coords.y);
   }
}


export class UIActor extends Configurable(UIActorImpl) {
   constructor();
   constructor(config?: Partial<UIActorImpl>);
   constructor(x?: number, y?: number, width?: number, height?: number);
   constructor(xOrConfig?: number | Partial<UIActorImpl>, y?: number, width?: number, height?: number) {
      super(xOrConfig, y, width, height);
   }
}