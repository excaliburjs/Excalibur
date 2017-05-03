import { Physics } from './../Physics';
import { ICollisionBroadphase } from './ICollisionResolver';
import { DynamicTree } from './DynamicTree';
import { Pair } from './Pair';
import { Body } from './Body';

import { Vector, Ray } from '../Algebra';
import { Actor, CollisionType } from '../Actor';
import { FrameStats } from '../Debug';
import { CollisionResolutionStrategy } from '../Physics';
import { Logger } from '../Util/Log';

export class DynamicTreeCollisionBroadphase implements ICollisionBroadphase {
   private _dynamicCollisionTree = new DynamicTree();
   private _collisionHash: { [key: string]: boolean; } = {};
   private _collisionPairCache: Pair[] = [];

   /**
    * Tracks a physics body for collisions
    */
   public track(target: Body): void {
      if (!target) {
         Logger.getInstance().warn('Cannot track null physics body');
         return;
      }
      this._dynamicCollisionTree.trackBody(target);
   }

   /**
    * Untracks a physics body
    */
   public untrack(target: Body): void {
      if (!target) {
         Logger.getInstance().warn('Cannot untrack a null physics body');
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
   public broadphase(targets: Actor[], delta: number, stats?: FrameStats): Pair[] {
      var seconds = delta / 1000;
      // TODO optimization use only the actors that are moving to start 
      // Retrieve the list of potential colliders, exclude killed, prevented, and self
      var potentialColliders = targets.filter((other) => {
         return !other.isKilled() && other.collisionType !== CollisionType.PreventCollision;
      });

      // clear old list of collision pairs
      this._collisionPairCache = [];
      this._collisionHash = {};

      // check for normal collision pairs
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
      if (stats) {
         stats.physics.pairs = this._collisionPairCache.length;
      }

      // Check dynamic tree for fast moving objects
      // Fast moving objects are those moving at least there smallest bound per frame
      if (Physics.checkForFastBodies) {
         for (var actor of potentialColliders) {
            // Skip non-active objects. Does not make sense on other collison types
            if (actor.collisionType !== CollisionType.Active) { continue; };

            // Maximum travel distance next frame
            var updateDistance = (actor.vel.magnitude() * seconds) + // velocity term 
               (actor.acc.magnitude() * .5 * seconds * seconds); // acc term

            // Find the minimum dimension
            var minDimension = Math.min(actor.body.getBounds().getHeight(), actor.body.getBounds().getWidth());
            if (Physics.disableMinimumSpeedForFastBody || updateDistance > (minDimension / 2)) {
               if (stats) {
                  stats.physics.fastBodies++;
               }

               // start with the oldPos because the integration for actors has already happened
               // objects resting on a surface may be slightly penatrating in the current position
               var updateVec = actor.pos.sub(actor.oldPos);
               var centerPoint = actor.body.collisionArea.getCenter();
               var furthestPoint = actor.body.collisionArea.getFurthestPoint(actor.vel);
               var origin: Vector = furthestPoint.sub(updateVec);

               var ray: Ray = new Ray(origin, actor.vel);

               // back the ray up by -2x surfaceEpsilon to account for fast moving objects starting on the surface 
               ray.pos = ray.pos.add(ray.dir.scale(-2 * Physics.surfaceEpsilon));
               var minBody: Body;
               var minTranslate: Vector = new Vector(Infinity, Infinity);
               this._dynamicCollisionTree.rayCastQuery(ray, updateDistance + Physics.surfaceEpsilon * 2, (other: Body) => {
                  if (actor.body !== other && other.collisionArea) {
                     var hitPoint = other.collisionArea.rayCast(ray, updateDistance + Physics.surfaceEpsilon * 10);
                     if (hitPoint) {
                        var translate = hitPoint.sub(origin);
                        if (translate.magnitude() < minTranslate.magnitude()) {
                           minTranslate = translate;
                           minBody = other;
                        }
                     }
                  }
                  return false;
               });

               if (minBody && Vector.isValid(minTranslate)) {
                  var pair = new Pair(actor.body, minBody);
                  if (!this._collisionHash[pair.id]) {
                     this._collisionHash[pair.id] = true;
                     this._collisionPairCache.push(pair);
                  }
                  // move the fast moving object to the other body
                  // need to push into the surface by ex.Physics.surfaceEpsilon
                  var shift = centerPoint.sub(furthestPoint);
                  actor.pos = origin.add(shift).add(minTranslate).add(ray.dir.scale(2 * Physics.surfaceEpsilon));
                  actor.body.collisionArea.recalc();

                  if (stats) {
                     stats.physics.fastBodyCollisions++;
                  }
               }
            }
         }
      }
      // return cache
      return this._collisionPairCache;
   }

   /**
    * Applies narrow phase on collision pairs to find actual area intersections
    */
   public narrowphase(pairs: Pair[], stats?: FrameStats) {
      for (var i = 0; i < pairs.length; i++) {
         pairs[i].collide();
         if (stats && pairs[i].collision) {
            stats.physics.collisions++;
            stats.physics.colliders.push(pairs[i]);
         }
      }
   }

   /**
    * Perform collision resolution given a strategy (rigid body or box) and move objects out of intersect. 
    */
   public resolve(delta: number, strategy: CollisionResolutionStrategy) {
      // resolve collision pairs
      var i = 0, len = this._collisionPairCache.length;
      for (i = 0; i < len; i++) {
         this._collisionPairCache[i].resolve(strategy);
      }

      // We must apply mtv after all pairs have been resolved for more accuracy
      // apply integration of collision pairs
      for (i = 0; i < len; i++) {
         if (this._collisionPairCache[i].collision) {
            this._collisionPairCache[i].bodyA.applyMtv();
            this._collisionPairCache[i].bodyB.applyMtv();
            // todo still don't like this, this is a small integration step to resolve narrowphase collisions
            this._collisionPairCache[i].bodyA.actor.integrate(delta * Physics.collisionShift);
            this._collisionPairCache[i].bodyB.actor.integrate(delta * Physics.collisionShift);
         }
      }

   }

   /**
    * Update the dynamic tree positions
    */
   public update(targets: Actor[]): number {
      var updated = 0, i = 0, len = targets.length;

      for (i; i < len; i++) {
         if (this._dynamicCollisionTree.updateBody(targets[i].body)) {
            updated++;
         }
      }
      return updated;
   }

   /* istanbul ignore next */
   public debugDraw(ctx: CanvasRenderingContext2D) {
      if (Physics.broadphaseDebug) {
         this._dynamicCollisionTree.debugDraw(ctx);
      }

      if (Physics.showContacts || Physics.showCollisionNormals) {
         for (var pair of this._collisionPairCache) {
            pair.debugDraw(ctx);
         }
      }
   }
}
