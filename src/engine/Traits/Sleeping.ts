/// <reference path="../Interfaces/IActorTrait.ts" />

module ex.Traits {
   export class Sleeping implements IActorTrait { 
      public update(actor: Actor, engine: Engine, delta: number) {
         var vel = actor.vel;
         var rx = actor.rx ;
         var motion = (vel.dot(vel) + rx * rx) * (delta/1000);
         
         actor.motion = Engine.physics.motionBias * actor.motion + (1 - Engine.physics.motionBias) * motion;
         if(actor.motion < (Engine.physics.sleepEpsilon * delta)){
            actor.setSleep(true);
         }else{
            // do nothing
            // todo toss event maybe?
            actor.setSleep(false);
         }
         
      }
   }
}