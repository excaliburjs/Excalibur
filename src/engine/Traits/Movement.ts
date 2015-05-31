/// <reference path="../Interfaces/IActorTrait.ts" />

module ex.Traits {
   export class Movement implements IActorTrait { 
      public update(actor: Actor, engine: Engine, delta: number) {
         // Update placements based on linear algebra
         actor.x += actor.dx * delta / 1000;
         actor.y += actor.dy * delta / 1000;

         actor.dx += actor.ax * delta / 1000;
         actor.dy += actor.ay * delta / 1000;

         actor.rotation += actor.rx * delta / 1000;

         actor.scale.x += actor.sx * delta / 1000;
         actor.scale.y += actor.sy * delta / 1000;

         
      }
   }
}