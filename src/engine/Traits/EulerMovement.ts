/// <reference path="../Interfaces/IActorTrait.ts" />

module ex.Traits {
   export class EulerMovement implements IActorTrait { 
      public update(actor: Actor, engine: Engine, delta: number) {
         
         // Update placements based on linear algebra
         var seconds = delta / 1000;
         
         var totalAcc = actor.acc.clone();
         // Only active vanilla actors are affected by global acceleration
         if (actor.collisionType === ex.CollisionType.Active &&
            !(actor instanceof UIActor) &&
            !(actor instanceof Trigger) &&
            !(actor instanceof Label)) {
            totalAcc.addEqual(ex.Physics.acc);
         }
         
         actor.oldVel = actor.vel;
         actor.vel.addEqual(totalAcc.scale(seconds));
         
         actor.pos.addEqual(actor.vel.scale(seconds)).addEqual(totalAcc.scale(0.5 * seconds * seconds));
         
         actor.rx += actor.torque * (1.0 / actor.moi) * seconds;
         actor.rotation += actor.rx * seconds;
         
         actor.scale.x += actor.sx * delta / 1000;
         actor.scale.y += actor.sy * delta / 1000;
         
      }
   }
}