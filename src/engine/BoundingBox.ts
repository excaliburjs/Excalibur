/// <reference path="Algebra.ts" />

module ex {

   /**
    * Interface all collidable objects must implement
    * @class ICollidable
    */
   export interface ICollidable {
      /** 
       * Test wether this collidable with another returning,
       * the intersection vector that can be used to resovle the collision. If there
       * is no collision null is returned.
       * @method collides
       * @param collidable {ICollidable} Other collidable to test
       * @returns Vector
       */
      collides(collidable: ICollidable): Vector;
      /**
       * Tests wether a point is contained within the collidable
       * @method contains
       * @param p {Point} The point to test
       * @returns boolean
       */
      contains(point: Point): boolean;
   }

   /**
    * Axis Aligned collision primitive for Excalibur. 
    * @class BoundingBox
    * @constructor
    * @param left {number} x coordinate of the left edge
    * @param top {number} y coordinate of the top edge
    * @param right {number} x coordinate of the right edge
    * @param bottom {number} y coordinate of the bottom edge
    */
   export class BoundingBox implements ICollidable {
      constructor(public left: number, public top: number, public right: number, public bottom: number){}
      /**
       * Returns the calculated width of the bounding box
       * @method getWidth
       * @returns number
       */
      public getWidth(){
         return this.right - this.left;
      }

      /**
       * Returns the calculated height of the bounding box
       * @method getHeight
       * @returns number
       */
      public getHeight(){
         return this.bottom - this.top;
      }

      /**
       * Tests wether a point is contained within the bounding box
       * @method contains
       * @param p {Point} The point to test
       * @returns boolean
       */
      public contains(p: Point): boolean{
         return (this.left <= p.x && this.top <= p.y && this.bottom >= p.y && this.right >= p.x);
      }

      /** 
       * Test wether this bounding box collides with another returning,
       * the intersection vector that can be used to resovle the collision. If there
       * is no collision null is returned.
       * @method collides
       * @param collidable {ICollidable} Other collidable to test
       * @returns Vector
       */
      public collides(collidable: ICollidable): Vector{
         if(collidable instanceof BoundingBox){
            var other: BoundingBox = <BoundingBox>collidable;
            var totalBoundingBox = new BoundingBox(
               Math.min(this.left, other.left), 
               Math.min(this.top, other.top), 
               Math.max(this.right, other.right), 
               Math.max(this.bottom, other.bottom));            
            
            // If the total bounding box is less than the sum of the 2 bounds then there is collision
            if(totalBoundingBox.getWidth() < other.getWidth() + this.getWidth() &&
               totalBoundingBox.getHeight() < other.getHeight() + this.getHeight()){
               // collision
               var overlapX = 0;
               if(this.right > other.left && this.right < other.right){
                  overlapX = other.left - this.right;
               }else{
                  overlapX = other.right - this.left;
               }

               var overlapY = 0;
               if(this.top < other.bottom && this.top > other.top){
                  overlapY = other.bottom - this.top;
               }else{
                  overlapY = other.top - this.bottom;
               }
               return new Vector(overlapX, overlapY);
            }else{
               return null;
            }

         }

         return null;
      }
   }
}