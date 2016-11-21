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
         var hash = Pair.calculatePairHash(actorA.body, actorB.body);
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
         
         // clear old list of collision pairs
         this._collisionPairCache = [];
         this._collisionHash = {};
        
         var actor: Actor;
         for (var j = 0, l = potentialColliders.length; j < l; j++) {
            actor = potentialColliders[j];

            // Query the collision tree for potential colliders
            this._dynamicCollisionTree.query(actor.body, (other: Body) => {
               if (this._canCollide(actor, other.actor)) {
                  var pair = new Pair(actor.body, other);
                  this._collisionHash[pair.id] = true;
                  this._collisionPairCache.push(pair);
               }
               // Always return false, to query whole tree. Returning true in the query method stops searching
               return false;
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
         for (i = 0; i < len; i++) {
            this._collisionPairCache[i].resolve(delta, strategy);
         }

         // We must apply mtv after all pairs have been resolved for more accuracy
         // apply integration of collision pairs
         for (i = 0; i < len; i++) {
            if (this._collisionPairCache[i].collision) {
               this._collisionPairCache[i].bodyA.applyMtv();
               this._collisionPairCache[i].bodyB.applyMtv();
               // todo still don't like this
               this._collisionPairCache[i].bodyA.actor.integrate(delta * ex.Physics.collisionShift);
               this._collisionPairCache[i].bodyB.actor.integrate(delta * ex.Physics.collisionShift);
            }
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