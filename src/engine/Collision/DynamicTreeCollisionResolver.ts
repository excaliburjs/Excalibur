/// <reference path="ICollisionResolver.ts"/>
/// <reference path="DynamicTree.ts"/>

module ex {
    
   export class DynamicTreeCollisionResolver implements ICollisionResolver {
      private _dynamicCollisionTree = new DynamicTree();
      constructor() { }

      public register(target: Actor): void {
         this._dynamicCollisionTree.registerActor(target);
      }

      public remove(target: Actor): void {
         this._dynamicCollisionTree.removeActor(target);
      }

      public evaluate(targets: Actor[]): CollisionPair[] {
         // Retrieve the list of potential colliders, exclude killed, prevented, and self
         var potentialColliders = targets.filter((other) => {
            return !other.isKilled() && other.collisionType !== CollisionType.PreventCollision;
         });

         var actor: Actor;
         var collisionPairs = [];

         for (var j = 0, l = potentialColliders.length; j < l; j++) {

            actor = potentialColliders[j];

            this._dynamicCollisionTree.query(actor, (other: Actor) => {
               if (other.collisionType === CollisionType.PreventCollision) return false;

               var minimumTranslationVector;
               if (minimumTranslationVector = actor.collides(other)) {
                  var side = actor.getSideFromIntersect(minimumTranslationVector);
                  var collisionPair = new CollisionPair(actor, other, minimumTranslationVector, side);
                  if (!collisionPairs.some((cp) => {
                     return cp.equals(collisionPair);
                  })) {
                     collisionPairs.push(collisionPair);
                  }
                  return true;
               }
               return false;
            });
         }

         collisionPairs.forEach(p => p.evaluate());

         return collisionPairs;
      }

      public update(targets: Actor[]): number {
         var updated = 0;
         targets.forEach(a => { 
            if (this._dynamicCollisionTree.updateActor(a)) {
               updated++;
            }
         });
         
         return updated;
      }

      public debugDraw(ctx: CanvasRenderingContext2D, delta: number) {
         this._dynamicCollisionTree.debugDraw(ctx, delta);
      }
   }
 }