/// <reference path="../Interfaces/IPipelineModule.ts" />

module ex.Traits {
   export class CollisionDetection implements IPipelineModule { 
      public update(actor: Actor, engine: Engine, delta: number) {
         var eventDispatcher = actor.eventDispatcher;
         if (actor.collisionType !== CollisionType.PreventCollision) {            

            for(var j = 0; j < engine.currentScene.tileMaps.length; j++) {
               var map = engine.currentScene.tileMaps[j];
               var intersectMap: Vector;
               var side = Side.None;
               var max = 2;
               var hasBounced = false;
               while(intersectMap = map.collides(actor)) {
                  if (max-- < 0) {
                     break;
                  } 
                  side = actor.getSideFromIntersect(intersectMap);
                  eventDispatcher.publish('collision', new CollisionEvent(actor, null, side, intersectMap));
                  if((actor.collisionType === CollisionType.Active || actor.collisionType === CollisionType.Elastic)) {
                     actor.y += intersectMap.y;
                     actor.x += intersectMap.x;

                     // Naive elastic bounce
                     if(actor.collisionType === CollisionType.Elastic && !hasBounced) {
                        hasBounced = true;
                        if (side === Side.Left) {
                           actor.dx = Math.abs(actor.dx);
                        } else if (side === Side.Right) {
                           actor.dx = -Math.abs(actor.dx);
                        } else if (side === Side.Top) {
                           actor.dy = Math.abs(actor.dy);
                        } else if (side === Side.Bottom) {
                           actor.dy = -Math.abs(actor.dy);
                        }
                     }                 
                  }
               }
            }
         }
      }
   }
}