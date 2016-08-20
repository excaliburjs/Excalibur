/// <reference path="ICollisionResolver.ts"/>
/// <reference path="DynamicTree.ts"/>

module ex {
    
   export class DynamicTreeCollisionBroadphase implements ICollisionBroadphase {
      private _dynamicCollisionTree = new DynamicTree();
      private _collisionHash: { [key: string]: boolean; } = {};
      private _collisionContactCache: CollisionContact[] = [];

      public register(target: Actor): void {
         this._dynamicCollisionTree.registerBody(target.body);
      }

      public remove(target: Actor): void {
         this._dynamicCollisionTree.removeBody(target.body);
      }

      private _canCollide(actorA: Actor, actorB: Actor) {
         // if the collision pair has been calculated already short circuit
         var hash = actorA.calculatePairHash(actorB);
         if (this._collisionHash[hash]) {
            return false; // pair exists easy exit return false
         }
           
         // if both are fixed short circuit
         if (actorA.collisionType === CollisionType.Fixed && actorB.collisionType === CollisionType.Fixed) {
            return false;
         }

         // if the other is prevent collision or is dead short circuit
         if (actorB.collisionType === CollisionType.PreventCollision || actorB.isKilled()) { return false; }

         // they can collide
         return true;
      }

      public findCollisionContacts(targets: Actor[], delta: number): CollisionContact[] {
         // TODO optimization use only the actors that are moving to start 
         // Retrieve the list of potential colliders, exclude killed, prevented, and self
         var potentialColliders = targets.filter((other) => {
            return !other.isKilled() && other.collisionType !== CollisionType.PreventCollision;
         });

         var actor: Actor;
         
         // Check collison cache and re-add pairs that still are in collision
         var newPairs = [];
         this._collisionContactCache.forEach(c => {
            var contact = c.bodyA.collide(c.bodyB);
            // we always add this id back to the hash so we can quickly short circuit since we already checked collision
            this._collisionHash[c.id] = true;
            
            if (contact) {               
               contact.id = c.id;
               newPairs.push(contact);
            }
         });
         
         this._collisionContactCache = newPairs;

         for (var j = 0, l = potentialColliders.length; j < l; j++) {
            actor = potentialColliders[j];

            // Query the colllision tree for potential colliders
            this._dynamicCollisionTree.query(actor.body, (other: Body) => {
               if(this._canCollide(actor, other.actor)) {
                  // generate all the collision contacts between the 2 sets of collision areas between both actors
                   var contacts: CollisionContact[] = [];
                   var areaA = actor.collisionArea;
                   var areaB = other.collisionArea;
                   var contact = areaA.collide(areaB);

                   if (contact) {
                      contact.id = actor.calculatePairHash(other.actor);
                      contacts.push(contact);
                   }

                   // if there were contacts keep track of them
                   if (contacts.length) {
                      this._collisionHash[contact.id] = true;
                      for (var contactHash of contacts) {
                        this._collisionContactCache.push(contactHash);
                      }
                   }

                   return false;
               }
            });
         }

         // evaluate collision pairs
         var i = 0, len = this._collisionContactCache.length;
         for (i; i < len; i++) {
            this._collisionContactCache[i].resolve(delta, Physics.collisionResolutionStrategy);
         }
    
         // apply total mtv
         targets.forEach((a) => {
            a.applyMtv();
         });
         
         // todo this should be cleared by checking first
         // clear lookup table 
         this._collisionHash = {};

         // return cache
         return this._collisionContactCache;
      }

      public update(targets: Actor[], delta: number): number {
         var updated = 0, i = 0, len = targets.length;

         for (i; i < len; i++) {
            if (this._dynamicCollisionTree.updateBody(targets[i].body)) {
               updated++;
            }
         }
         
         return updated;
      }

      /* istanbul ignore next */
      public debugDraw(ctx: CanvasRenderingContext2D, delta: number) {
         if (ex.Physics.broadphaseDebug) {
            this._dynamicCollisionTree.debugDraw(ctx, delta);
         }         

         if (ex.Physics.showContacts || ex.Physics.showCollisionNormals) {
            for (var i = 0; i < this._collisionContactCache.length; i++) {
               if (ex.Physics.showContacts) {
                  ex.Util.DrawUtil.point(ctx, Color.Red, this._collisionContactCache[i].point);
               }
               if (ex.Physics.showCollisionNormals) {
                  ex.Util.DrawUtil.vector(ctx, Color.Cyan, this._collisionContactCache[i].point, this._collisionContactCache[i].normal, 30);
               }
            }
         }
      }
   }
 }