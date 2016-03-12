﻿/// <reference path="ICollisionResolver.ts"/>
/// <reference path="DynamicTree.ts"/>

module ex {
    
   export class DynamicTreeCollisionBroadphase implements ICollisionBroadphase {
      private _dynamicCollisionTree = new DynamicTree();
      private _collisionHash: { [key: string]: boolean; } = {};
      private collisionContactCache: CollisionContact[] = [];

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
         
         // Check collison cache and re-add pairs that still are in collision
         var newPairs = [];
         this.collisionContactCache.forEach(c => {
            var contact = c.bodyA.collide(c.bodyB);
            if (contact) {
               this._collisionHash[c.id] = true;
               contact.id = c.id;
               newPairs.push(contact)
            }
         });
         this.collisionContactCache = newPairs;

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
                     this.collisionContactCache.push(contactHash);
                  }
               }

               return false;
            });
         }

         // evaluate collision pairs
         var i = 0, len = this.collisionContactCache.length;
         for (i; i < len; i++) {
            this.collisionContactCache[i].resolve(delta, Engine.physics.collisionResolutionStrategy);
         }
    
         // apply total mtv
         targets.forEach((a) => {
            a.applyMtv();
         });

         // todo don't clear this right away, we can use this as a contact cache
         // check these first then look for pairs
         //this.collisionContactCache.length = 0;
         this._collisionHash = {};

         return this.collisionContactCache;
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