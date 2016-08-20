module ex {
   /**
    * Collision pairs are used internally by Excalibur to resolve collision between actors. The
    * Pair prevents collisions from being evaluated more than one time
    */
   export class CollisionPair {

      /**
       * @param left       The first actor in the collision pair
       * @param right      The second actor in the collision pair
       * @param intersect  The minimum translation vector to separate the actors from the perspective of the left actor
       * @param side       The side on which the collision occured from the perspective of the left actor
       */
      constructor(public left: Actor, public right: Actor, public intersect: Vector, public side: Side) {}

      /**
       * Determines if this collision pair and another are equivalent.
       */
      public equals(collisionPair: CollisionPair): boolean {
         return (collisionPair.left === this.left && collisionPair.right === this.right) || 
                (collisionPair.right === this.left && collisionPair.left === this.right);
      }

      /**
       * Evaluates the collision pair, performing collision resolution and event publishing appropriate to each collision type.
       */
      public evaluate() {
         // todo fire collision events on left and right actor
         // todo resolve collisions                  
                  
         // Publish collision events on both participants
         this.left.eventDispatcher.emit('collision', new CollisionEvent(this.left, this.right, this.side, this.intersect));
         this.right.eventDispatcher.emit('collision', 
            new CollisionEvent(this.right, this.left, ex.Util.getOppositeSide(this.side), this.intersect.scale(-1.0)));

         // If the actor is active push the actor out if its not passive
         var leftSide = this.side;
         if ((this.left.collisionType === CollisionType.Active || 
            this.left.collisionType === CollisionType.Elastic) && 
            this.right.collisionType !== CollisionType.Passive) {
            this.left.pos.y += this.intersect.y;
            this.left.pos.x += this.intersect.x;
            
            // Naive elastic bounce
            if (this.left.collisionType === CollisionType.Elastic) {
               if (leftSide === Side.Left) {
                  this.left.vel.x = Math.abs(this.left.vel.x);
               } else if (leftSide === Side.Right) {
                  this.left.vel.x = -Math.abs(this.left.vel.x);
               } else if (leftSide === Side.Top) {
                  this.left.vel.y = Math.abs(this.left.vel.y);
               } else if (leftSide === Side.Bottom) {
                  this.left.vel.y = -Math.abs(this.left.vel.y);
               }
            } else {
               // Cancel velocities along intersection
               if (this.intersect.x !== 0) {
                  
                  if (this.left.vel.x <= 0 && this.right.vel.x <= 0) {
                     this.left.vel.x = Math.max(this.left.vel.x, this.right.vel.x);
                  } else if (this.left.vel.x >= 0 && this.right.vel.x >= 0) {
                     this.left.vel.x = Math.min(this.left.vel.x, this.right.vel.x);
                  }else {
                     this.left.vel.x = 0;
                  }
                  
               }
               
               if (this.intersect.y !== 0) {
                  
                  if (this.left.vel.y <= 0 && this.right.vel.y <= 0) {
                     this.left.vel.y = Math.max(this.left.vel.y, this.right.vel.y);
                  } else if (this.left.vel.y >= 0 && this.right.vel.y >= 0) {
                     this.left.vel.y = Math.min(this.left.vel.y, this.right.vel.y);
                  } else {
                     this.left.vel.y = 0;
                  }
                  
               }
            }                 
         }

         var rightSide = ex.Util.getOppositeSide(this.side);
         var rightIntersect = this.intersect.scale(-1.0);
         if ((this.right.collisionType === CollisionType.Active || 
            this.right.collisionType === CollisionType.Elastic) && 
            this.left.collisionType !== CollisionType.Passive) {
            this.right.pos.y += rightIntersect.y;
            this.right.pos.x += rightIntersect.x;
           
            // Naive elastic bounce
            if (this.right.collisionType === CollisionType.Elastic) {
               if (rightSide === Side.Left) {
                  this.right.vel.x = Math.abs(this.right.vel.x);
               } else if (rightSide === Side.Right) {
                  this.right.vel.x = -Math.abs(this.right.vel.x);
               } else if (rightSide === Side.Top) {
                  this.right.vel.y = Math.abs(this.right.vel.y);
               } else if (rightSide === Side.Bottom) {
                  this.right.vel.y = -Math.abs(this.right.vel.y);
               }
            } else {
                // Cancel velocities along intersection
               if (rightIntersect.x !== 0) {
                  if (this.right.vel.x <= 0 && this.left.vel.x <= 0) {
                     this.right.vel.x = Math.max(this.left.vel.x, this.right.vel.x);
                  } else if (this.left.vel.x >= 0 && this.right.vel.x >= 0) {
                     this.right.vel.x = Math.min(this.left.vel.x, this.right.vel.x);
                  } else {
                     this.right.vel.x = 0;
                  }
               }
               
               if (rightIntersect.y !== 0) {
                  if (this.right.vel.y <= 0 && this.left.vel.y <= 0) {
                     this.right.vel.y = Math.max(this.left.vel.y, this.right.vel.y);
                  } else if (this.left.vel.y >= 0 && this.right.vel.y >= 0) {
                     this.right.vel.y = Math.min(this.left.vel.y, this.right.vel.y);
                  } else {
                     this.right.vel.y = 0;
                  }
               }
            }
         }
      }
   }
}