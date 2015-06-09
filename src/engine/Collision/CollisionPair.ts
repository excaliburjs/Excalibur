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
         this.left.eventDispatcher.publish('collision', new CollisionEvent(this.left, this.right, this.side, this.intersect));
         this.right.eventDispatcher.publish('collision', 
            new CollisionEvent(this.right, this.left, ex.Util.getOppositeSide(this.side), this.intersect.scale(-1.0)));

         // If the actor is active push the actor out if its not passive
         var leftSide = this.side;
         if ((this.left.collisionType === CollisionType.Active || 
            this.left.collisionType === CollisionType.Elastic) && 
            this.right.collisionType !== CollisionType.Passive) {
            this.left.y += this.intersect.y;
            this.left.x += this.intersect.x;
            
            // Naive elastic bounce
            if (this.left.collisionType === CollisionType.Elastic) {
               if (leftSide === Side.Left) {
                  this.left.dx = Math.abs(this.left.dx);
               } else if(leftSide === Side.Right) {
                  this.left.dx = -Math.abs(this.left.dx);
               } else if(leftSide === Side.Top) {
                  this.left.dy = Math.abs(this.left.dy);
               } else if(leftSide === Side.Bottom) {
                  this.left.dy = -Math.abs(this.left.dy);
               }
            } else {
               // Cancel velocities along intersection
               if (this.intersect.x !== 0) {
                  
                  if (this.left.dx <= 0 && this.right.dx <= 0) {
                     this.left.dx = Math.max(this.left.dx, this.right.dx);
                  } else if (this.left.dx >= 0 && this.right.dx >= 0) {
                     this.left.dx = Math.min(this.left.dx, this.right.dx);
                  }else {
                     this.left.dx = 0;
                  }
                  
               }
               
               if (this.intersect.y !== 0) {
                  
                  if (this.left.dy <= 0 && this.right.dy <= 0) {
                     this.left.dy = Math.max(this.left.dy, this.right.dy);
                  } else if (this.left.dy >= 0 && this.right.dy >= 0) {
                     this.left.dy = Math.min(this.left.dy, this.right.dy);
                  } else {
                     this.left.dy = 0;
                  }
                  
               }
            }                 
         }

         var rightSide = ex.Util.getOppositeSide(this.side);
         var rightIntersect = this.intersect.scale(-1.0);
         if ((this.right.collisionType === CollisionType.Active || 
            this.right.collisionType === CollisionType.Elastic) && 
            this.left.collisionType !== CollisionType.Passive) {
            this.right.y += rightIntersect.y;
            this.right.x += rightIntersect.x;
           
            // Naive elastic bounce
            if (this.right.collisionType === CollisionType.Elastic) {
               if (rightSide === Side.Left) {
                  this.right.dx = Math.abs(this.right.dx);
               } else if(rightSide === Side.Right) {
                  this.right.dx = -Math.abs(this.right.dx);
               } else if(rightSide === Side.Top) {
                  this.right.dy = Math.abs(this.right.dy);
               } else if(rightSide === Side.Bottom) {
                  this.right.dy = -Math.abs(this.right.dy);
               }
            } else {
                // Cancel velocities along intersection
               if(rightIntersect.x !== 0) {
                  if (this.right.dx <= 0 && this.left.dx <= 0) {
                     this.right.dx = Math.max(this.left.dx, this.right.dx);
                  } else if (this.left.dx >= 0 && this.right.dx >= 0) {
                     this.right.dx = Math.min(this.left.dx, this.right.dx);
                  }else {
                     this.right.dx = 0;
                  }
               }
               
               if(rightIntersect.y !== 0) {
                  if (this.right.dx <= 0 && this.left.dx <= 0) {
                     this.left.dx = Math.max(this.left.dx, this.right.dx);
                  } else if (this.left.dx >= 0 && this.right.dx >= 0) {
                     this.left.dx = Math.min(this.left.dx, this.right.dx);
                  }else {
                     this.left.dx = 0;
                  }
               }
            }
         }
      }
   }
}