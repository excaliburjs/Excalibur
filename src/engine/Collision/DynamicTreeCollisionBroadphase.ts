/// <reference path="ICollisionResolver.ts"/>
/// <reference path="DynamicTree.ts"/>
/// <reference path="Pair.ts" />


module ex {
    
   export class DynamicTreeCollisionBroadphase implements ICollisionBroadphase {
      private _dynamicCollisionTree = new DynamicTree();
      private _collisionHash: { [key: string]: boolean; } = {};
      private _collisionPairCache: Pair[] = [];
      

      public get collisionContacts() {
         return this._collisionPairCache;
      }

      /**
       * Tracks a physics body for collisions
       */
      public track(target: Body): void {
         if (!target) {
            ex.Logger.getInstance().warn('Cannot track null physics body');
            return;
         }
         this._dynamicCollisionTree.trackBody(target);
      }

      /**
       * Untracks a physics body
       */
      public untrack(target: Body): void {
         if (!target) {
            ex.Logger.getInstance().warn('Cannot untrack a null physics body');
            return;
         }
         this._dynamicCollisionTree.untrackBody(target);
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

      /**
       * Detects potential collision pairs in a broadphase approach with the dynamic aabb tree strategy
       */
      public broadphase(targets: Actor[], delta: number): Pair[] {
         // TODO optimization use only the actors that are moving to start 
         // Retrieve the list of potential colliders, exclude killed, prevented, and self
         var potentialColliders = targets.filter((other) => {
            return !other.isKilled() && other.collisionType !== CollisionType.PreventCollision;
         });

         var actor: Actor;
         
         // Check collision cache and re-add pairs that still are in collision
         /*
         var newPairs = [];
         this._collisionPairCache.forEach(c => {
            var contact = c.bodyA.collide(c.bodyB);
            // we always add this id back to the hash so we can quickly short circuit since we already checked collision
            this._collisionHash[c.id] = true;
            
            if (contact) {               
               contact.id = c.id;
               newPairs.push(contact);
            }
         });
         
         this._collisionPairCache = newPairs;
         */

         for (var j = 0, l = potentialColliders.length; j < l; j++) {
            actor = potentialColliders[j];

            // Query the collision tree for potential colliders
            this._dynamicCollisionTree.query(actor.body, (other: Body) => {
               if (this._canCollide(actor, other.actor)) {
                  var pair = new Pair(actor.body, other);
                  this._collisionHash[pair.id] = true;
                  this._collisionPairCache.push(pair);
                  return false;
               }
            });
         }         
         
         // return cache
         return this._collisionPairCache;
      }

      /**
       * Applies narrow phase on collision pairs to find actual area intersections
       */
      public narrowphase(pairs: Pair[]) {
         for (var i = 0; i < pairs.length; i++) {
            pairs[i].collide(); 
         }
      }

      public resolve(delta: number, strategy: CollisionResolutionStrategy) {
         // resolve collision pairs
         var i = 0, len = this._collisionPairCache.length;
         for (i; i < len; i++) {
            this._collisionPairCache[i].resolve(delta, strategy);
         }
      }

      /**
       * Update the dynamic tree positions
       */
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
            for (var i = 0; i < this._collisionPairCache.length; i++) {
               this._collisionPairCache[i].debugDraw(ctx);
            }
         }
      }
   }
 }