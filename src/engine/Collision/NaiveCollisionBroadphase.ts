import { Physics } from './../Physics';
import { CollisionContact } from './CollisionContact';
import { Pair } from './Pair';
import { Actor, CollisionType } from './../Actor';
import { ICollisionBroadphase } from './ICollisionResolver';

export class NaiveCollisionBroadphase implements ICollisionBroadphase {

   public track() {
      // pass
   }

   public untrack() {
      // pass
   }

   /**
    * Detects potential collision pairs in a broadphase approach with the dynamic aabb tree strategy
    */
   public broadphase(targets: Actor[]): Pair[] {

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
         collisionPairs[k].resolve(Physics.collisionResolutionStrategy);
      }

      return collisionPairs;
   }

   /**
    * Identify actual collisions from those pairs, and calculate collision impulse
    */
   narrowphase() {
      // pass
   }

   /**
    * Resolve the position and velocity of the physics bodies
    */
   resolve() {
      // pass
   }

   public update(): number {
      return 0;
   }

   public debugDraw() {
      return;
   }
}