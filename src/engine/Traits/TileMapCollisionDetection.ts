/// <reference path="../Interfaces/IActorTrait.ts" />

module ex.Traits {
   export class TileMapCollisionDetection implements IActorTrait { 
      public update(actor: Actor, engine: Engine, delta: number) {
         var eventDispatcher = actor.eventDispatcher;
         if (actor.collisionType !== CollisionType.PreventCollision && engine.currentScene && engine.currentScene.tileMaps) {            

            for (var j = 0; j < engine.currentScene.tileMaps.length; j++) {
               var map = engine.currentScene.tileMaps[j];
               var intersectMap: Vector;
               var side = Side.None;
               var max = 2;
               var hasBounced = false;
               while (intersectMap = map.collides(actor)) {
                  if (max-- < 0) {
                     break;
                  } 
                  side = actor.getSideFromIntersect(intersectMap);
                  eventDispatcher.emit('collision', new CollisionEvent(actor, null, side, intersectMap));
                  if ((actor.collisionType === CollisionType.Active || actor.collisionType === CollisionType.Elastic)) {
                     actor.pos.y += intersectMap.y;
                     actor.pos.x += intersectMap.x;

                     // Naive elastic bounce
                     if (actor.collisionType === CollisionType.Elastic && !hasBounced) {
                        hasBounced = true;
                        if (side === Side.Left) {
                           actor.vel.x = Math.abs(actor.vel.x);
                        } else if (side === Side.Right) {
                           actor.vel.x = -Math.abs(actor.vel.x);
                        } else if (side === Side.Top) {
                           actor.vel.y = Math.abs(actor.vel.y);
                        } else if (side === Side.Bottom) {
                           actor.vel.y = -Math.abs(actor.vel.y);
                        }
                     }                 
                  }
               }
            }
         }
      }
   }
}