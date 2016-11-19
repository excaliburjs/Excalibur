/// <reference path="../Actor.ts"/>
/// <reference path="Side.ts"/>
/// <reference path="ICollisionResolver.ts"/> 

module ex {
   export class NaiveCollisionBroadphase implements ICollisionBroadphase {
      
      public track(target: Body) {
         // pass
      }

      public untrack(tartet: Body) {
         // pass
      }

      public broadphase(targets: Actor[], delta: number): Pair[] {

         // Retrieve the list of potential colliders, exclude killed, prevented, and self
         var potentialColliders = targets.filter((other) => {
            return !other.isKilled() && other.collisionType !== CollisionType.PreventCollision;
         });

         var actor1: Actor;
         var actor2: Actor;
         var collisionPairs: Pair[] = [];

         for (var j = 0, l = potentialColliders.length; j < l; j++) {

            actor1 = potentialColliders[j];

            for (var i = j + 1; i < l; i++) {

               actor2 = potentialColliders[i];

               var minimumTranslationVector;
               if (minimumTranslationVector = actor1.collides(actor2)) {
                  var pair = new Pair(actor1.body, actor2.body);
                  var side = actor1.getSideFromIntersect(minimumTranslationVector);
                  pair.collision = new CollisionContact(actor1.collisionArea, 
                                                           actor2.collisionArea, 
                                                           minimumTranslationVector, 
                                                           actor1.pos, 
                                                           minimumTranslationVector);
                  if (!collisionPairs.some((cp) => {
                     return cp.id === pair.id;
                  })) {
                     collisionPairs.push(pair);
                  }
               }
            }

         }

         var k = 0, len = collisionPairs.length;
         for (k; k < len; k++) {
            collisionPairs[k].resolve(delta, ex.Physics.collisionResolutionStrategy);
         }
         
         return collisionPairs;
      }

      /**
       * Identify actual collisions from those pairs, and calculate collision impulse
       */
      narrowphase(pairs: Pair[]) {
         // pass
      }
      
      /**
       * Resolve the position and velocity of the physics bodies
       */
      resolve(delta: number, strategy: CollisionResolutionStrategy) {
         // pass
      }

      public update(targets: Actor[]): number {
         return 0;
      }

      public debugDraw(ctx: CanvasRenderingContext2D, delta: number) {
         return;
      }
   }
}