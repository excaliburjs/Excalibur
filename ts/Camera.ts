/// <reference path="Core.ts" />
/// <reference path="Algebra.ts" />

module ex {
   export interface ICamera {
      getFocus(): Point;
      applyTransform(delta: number): void;
   }

   export class SideCamera implements ICamera {
      follow: Actor;
      engine: Engine;
      constructor(engine: Engine) {
         this.engine = engine;
      }
      setActorToFollow(actor: Actor) {
         this.follow = actor;
      }

      getFocus() {
         return new Point(-this.follow.x + this.engine.width / 2.0, 0);
      }

      applyTransform(delta: number) {
         var focus = this.getFocus();
         this.engine.ctx.translate(focus.x, focus.y);
      }
   }

   export class TopCamera implements ICamera {
      follow: Actor;
      engine: Engine;
      constructor(engine: Engine) {
         this.engine = engine;
      }
      setActorToFollow(actor: Actor) {
         this.follow = actor;
      }

      getFocus() {
         return new Point(-this.follow.x + this.engine.width / 2.0, -this.follow.y + this.engine.height / 2.0);
      }

      applyTransform(delta: number) {
         var focus = this.getFocus();
         this.engine.ctx.translate(focus.x, focus.y);
      }
   }
}