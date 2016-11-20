/// <reference path="Body.ts" />
/// <reference path="CollisionContact.ts" />


module ex {

   /**
    * Models a potential collision between 2 bodies
    */
   export class Pair {
      public id: string = null;
      public collision: CollisionContact = null;

      constructor(public bodyA: Body, public bodyB: Body) {
         this.id = Pair.calculatePairHash(bodyA, bodyB);
      }

      /**
       * Runs the collison intersection logic on the members of this pair
       */
      public collide() {
         this.collision = this.bodyA.collisionArea.collide(this.bodyB.collisionArea);
      }

      /**
       * Resovles the collision body position and velocity if a collision occured
       */
      public resolve(delta: number, strategy: CollisionResolutionStrategy) {
         if (this.collision) {
            this.collision.resolve(delta, strategy);
         }
      }

      /**
       * Calculates the unique pair hash id for this collision pair
       */
      public static calculatePairHash(bodyA: Body, bodyB: Body): string {
         if (bodyA.actor.id < bodyB.actor.id) {
            return `#${bodyA.actor.id}+${bodyB.actor.id}`;
         } else {
            return `#${bodyB.actor.id}+${bodyA.actor.id}`;
         }
      }

      /* istanbul ignore next */
      public debugDraw(ctx: CanvasRenderingContext2D) {
         if (this.collision) {
            if (ex.Physics.showContacts) {
               ex.Util.DrawUtil.point(ctx, Color.Red, this.collision.point);
            }
            if (ex.Physics.showCollisionNormals) {
               ex.Util.DrawUtil.vector(ctx, Color.Cyan, this.collision.point, this.collision.normal, 30);
            }
         }
      }
   }
}