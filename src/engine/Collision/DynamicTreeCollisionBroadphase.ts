/// <reference path="ICollisionResolver.ts"/>
/// <reference path="DynamicTree.ts"/>

module ex {
    
   export class DynamicTreeCollisionBroadphase implements ICollisionBroadphase {
      private _dynamicCollisionTree = new DynamicTree();
      private _collisionHash: { [key: string]: boolean; } = {};
      private _collisionContacts: CollisionContact[] = [];

      public register(target: Actor): void {
         this._dynamicCollisionTree.registerActor(target);
      }

      public remove(target: Actor): void {
         this._dynamicCollisionTree.removeActor(target);
      }

      public resolve(targets: Actor[], delta: number): CollisionContact[] {
         // Retrieve the list of potential colliders, exclude killed, prevented, and self
         var potentialColliders = targets.filter((other) => {
            return !other.isKilled() && other.collisionType !== CollisionType.PreventCollision;
         });

         var actor: Actor;

         for (var j = 0, l = potentialColliders.length; j < l; j++) {
            actor = potentialColliders[j];

            this._dynamicCollisionTree.query(actor, (other: Actor) => {
                // if the collision pair has been calculated already short circuit
                var hash = actor.calculatePairHash(other);
                if (this._collisionHash[hash]) {
                    return false; // pair exists easy exit return false
                }

               // if both are fixed short circuit
               if (actor.collisionType === CollisionType.Fixed && other.collisionType === CollisionType.Fixed) {
                   return false;
               }
               // if the other is prevent collision or is dead short circuit
               if (other.collisionType === CollisionType.PreventCollision || other.isKilled()) { return false; }
               
               // generate all the collision contacts between the 2 sets of collision areas between both actors
               var contacts: CollisionContact[] = [];
               var areaA = actor.collisionAreas[0];
               var areaB = other.collisionAreas[0];
               var contact = areaA.collide(areaB);
               
               if (contact) {
                  contact.id = hash;
                  contacts.push(contact);
               }
               /*
               for (var areaA of actor.collisionAreas) {
                  for (var areaB of actor.collisionAreas) {
                     var contact = areaA.collide(areaB);
                     if (contact) {
                        contacts.push(contact);
                     }
                  }
               }*/

               // if there were contacts keep track of them
               if (contacts.length) {
                  this._collisionHash[hash] = true;
                  for (var contactHash of contacts) {
                     this._collisionContacts.push(contactHash);
                  }
               }

               return false;
            });
         }

         if (Engine.physics.allowRotation) {
             var i = 0, len = this._collisionContacts.length;
             for (i; i < len; i++) {
                 this._collisionContacts[i].resolve(delta);
             }
         } else {
             var k = 0, len2 = this._collisionContacts.length;
             for (k; k < len2; i++) {
                 var mtv = this._collisionContacts[k].mtv;
                 var bodyA = this._collisionContacts[k].bodyA;
                 var bodyB = this._collisionContacts[k].bodyB;
                 bodyA.pos.addEquals(mtv.negate());
                 bodyB.pos.addEquals(mtv);                 
             }
         }
         targets.forEach((a) => {
            a.applyMtv();
         });

         this._collisionContacts.length = 0;
         this._collisionHash = {};

         return this._collisionContacts;
      }

      public update(targets: Actor[], delta: number): number {
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