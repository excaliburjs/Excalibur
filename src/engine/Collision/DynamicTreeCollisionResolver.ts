/// <reference path="ICollisionResolver.ts"/>
/// <reference path="DynamicTree.ts"/>

module ex {
    
   export class DynamicTreeCollisionResolver implements ICollisionResolver {
      private _dynamicCollisionTree = new DynamicTree();
      private _collisionHash: { [key: string]: boolean; } = {};
      private _collisionContacts: CollisionContact[] = [];

      public register(target: Actor): void {
         this._dynamicCollisionTree.registerActor(target);
      }

      public remove(target: Actor): void {
         this._dynamicCollisionTree.removeActor(target);
      }

      public evaluate(targets: Actor[]): CollisionContact[] {
         // Retrieve the list of potential colliders, exclude killed, prevented, and self
         var potentialColliders = targets.filter((other) => {
            return !other.isKilled() && other.collisionType !== CollisionType.PreventCollision;
         });

         var actor: Actor;

         for (var j = 0, l = potentialColliders.length; j < l; j++) {
            actor = potentialColliders[j];

            this._dynamicCollisionTree.query(actor, (other: Actor) => {
               // if both are fixed short circuit
               if (actor.collisionType === CollisionType.Fixed && other.collisionType === CollisionType.Fixed) {
                   return false;
               }
               // if the other is prevent collision or is dead short circuit
               if (other.collisionType === CollisionType.PreventCollision || other.isKilled()) { return false; }

               // if the collision pair has been calculated already short circuit
               var hash = actor.calculateCollisionHash(other);
               if (this._collisionHash[hash]) {
                   return false; // pair exists easy exit
               }

               // generate all the collision contacts between the 2 sets of collision areas between both actors
               var contacts: CollisionContact[] = [];
               for (var areaA of actor.collisionAreas) {
                  for (var areaB of actor.collisionAreas) {
                     contacts.push(areaA.collide(areaB));
                  }
               }

               // if there were contacts keep track of them
               if (contacts.length) {
                  this._collisionHash[hash] = true;
                  for (var contact of contacts) {
                     this._collisionContacts.push(contact);
                  }
               }
               
               return false;
            });
         }

         var i = 0, len = this._collisionContacts.length;
         for (i; i < len; i++) {
            this._collisionContacts[i].resolve(16); // todo NO!
         }

         return this._collisionContacts;
      }

      public update(targets: Actor[]): number {
         var updated = 0, i = 0, len = targets.length;

         for (i; i < len; i++) {
            if (this._dynamicCollisionTree.updateActor(targets[i])) {
               updated++;
            }
         }
         
         return updated;
      }

      public debugDraw(ctx: CanvasRenderingContext2D, delta: number) {
         this._dynamicCollisionTree.debugDraw(ctx, delta);
      }
   }
 }