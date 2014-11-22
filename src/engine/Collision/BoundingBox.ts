/// <reference path="../Algebra.ts" />

module ex {

   export enum CollisionStrategy {
      Naive,
      DynamicAABBTree,
      SeparatingAxis
   }

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

      debugDraw(ctx: CanvasRenderingContext2D): void;

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
      constructor(public left: number = 0, public top: number = 0, public right: number = 0, public bottom: number = 0) { }
      /**
       * Returns the calculated width of the bounding box
       * @method getWidth
       * @returns number
       */
      public getWidth() {
         return this.right - this.left;
      }

      /**
       * Returns the calculated height of the bounding box
       * @method getHeight
       * @returns number
       */
      public getHeight() {
         return this.bottom - this.top;
      }

      /**
       * Returns the perimeter of the bounding box
       * @method getPerimeter
       * @returns number
       */
      public getPerimeter(): number {
         var wx = this.getWidth();
         var wy = this.getHeight();
         return 2 * (wx + wy);
      }

      /**
       * Tests wether a point is contained within the bounding box
       * @method contains
       * @param p {Point} The point to test
       * @returns boolean
       */
      public contains(p: Point): boolean;

      /**
       * Tests whether another bounding box is totally contained in this one
       * @method contains
       * @param other {BoundingBox} The bounding box to test
       * @returns boolean
       */
      public contains(bb: BoundingBox):boolean;
      public contains(val: any): boolean {
         if (val instanceof Point) {
            return (this.left <= val.x && this.top <= val.y && this.bottom >= val.y && this.right >= val.x);
         }else if (val instanceof BoundingBox) {
            if (this.left < val.left &&
               this.top < val.top &&
               val.bottom < this.bottom &&
               val.right < this.right) {
               return true;
            }
            return false;
         }
         return false;
      }

      /**
       * Combines this bounding box and another together returning a new bounding box
       * @method combine
       * @param other {BoundingBox} The bounding box to combine
       * @returns BoundingBox
       */
      public combine(other: BoundingBox): BoundingBox {
         var compositeBB = new BoundingBox(Math.min(this.left, other.left),
            Math.min(this.top, other.top),
            Math.max(this.right, other.right),
            Math.max(this.bottom, other.bottom));
         return compositeBB;
      }

      /** 
       * Test wether this bounding box collides with another returning,
       * the intersection vector that can be used to resovle the collision. If there
       * is no collision null is returned.
       * @method collides
       * @param collidable {ICollidable} Other collidable to test
       * @returns Vector
       */
      public collides(collidable: ICollidable): Vector {
         if (collidable instanceof BoundingBox) {
            var other: BoundingBox = <BoundingBox>collidable;
            var totalBoundingBox = this.combine(other);

            // If the total bounding box is less than the sum of the 2 bounds then there is collision
            if (totalBoundingBox.getWidth() < other.getWidth() + this.getWidth() &&
               totalBoundingBox.getHeight() < other.getHeight() + this.getHeight()) {
               // collision
               var overlapX = 0;
               if (this.right >= other.left && this.right <= other.right) {
                  overlapX = other.left - this.right;
               } else {
                  overlapX = other.right - this.left;
               }

               var overlapY = 0;
               if (this.top <= other.bottom && this.top >= other.top) {
                  overlapY = other.bottom - this.top;
               } else {
                  overlapY = other.top - this.bottom;
               }

               if (Math.abs(overlapX) < Math.abs(overlapY)) {
                  return new Vector(overlapX, 0);
               } else {
                  return new Vector(0, overlapY);
               }
            } else {
               return null;
            }

         }

         return null;
      }

      public debugDraw(ctx: CanvasRenderingContext2D) {
         ctx.lineWidth = 2;
         ctx.strokeRect(this.left, this.top, this.getWidth(), this.getHeight());

      }
   }

   export class SATBoundingBox implements ICollidable {
      private _points: Vector[];
      constructor(points: Point[]) {
         this._points = points.map((p) => p.toVector());
      }

      public getSides(): Line[] {
         var lines = [];
         var len = this._points.length;
         for (var i = 0; i < len; i++) {
            lines.push(new Line(this._points[i], this._points[(i + 1) % len]));
         }
         return lines;
      }

      public getAxes(): Vector[] {
         var axes = [];
         var len = this._points.length;
         for (var i = 0; i < len; i++) {
            axes.push(this._points[i].minus(this._points[(i + 1) % len]).normal());
         }
         return axes;
      }

      public project(axis: Vector) {
         var scalars = [];

         var len = this._points.length;
         for (var i = 0; i < len; i++) {
            scalars.push(this._points[i].dot(axis));
         }

         return new Projection(Math.min.apply(Math, scalars), Math.max.apply(Math, scalars));
      }

      /**
       * Returns the calculated width of the bounding box, by generating an axis aligned box around the current
       * @method getWidth
       * @returns number
       */
      public getWidth() {
         var left = this._points.reduce<number>((accum: number, p: Point, i, arr) => {
            return Math.min(accum, p.x);
         }, Infinity);

         var right = this._points.reduce<number>((accum: number, p: Point, i, arr) => {
            return Math.max(accum, p.x);
         }, -Infinity);

         return right - left;
      }

      /**
       * Returns the calculated height of the bounding box, by generating an axis aligned box around the current
       * @method getHeight
       * @returns number
       */
      public getHeight() {
         var top = this._points.reduce<number>((accum: number, p: Point, i, arr) => {
            return Math.min(accum, p.y);
         }, Infinity);

         var bottom = this._points.reduce<number>((accum: number, p: Point, i, arr) => {
            return Math.max(accum, p.y);
         }, -Infinity);


         return top - bottom;
      }

      /**
       * Tests wether a point is contained within the bounding box, using the PIP algorithm
       * http://en.wikipedia.org/wiki/Point_in_polygon
       * @method contains
       * @param p {Point} The point to test
       * @returns boolean
       */
      public contains(p: Point): boolean {
         // Always cast to the right, as long as we cast in a consitent fixed direction we
         // will be fine
         var testRay = new Ray(p, new Vector(1, 0));
         var intersectCount = this.getSides().reduce<number>((accum: number, side, i, arr) => {
            if (testRay.intersect(side) >= 0) {
               return accum + 1;
            }
            return accum;
         }, 0);


         if (intersectCount % 2 === 0) {
            return false;
         }
         return true;
      }


      public collides(collidable: ICollidable): Vector {
         if (collidable instanceof SATBoundingBox) {
            var other: SATBoundingBox = <SATBoundingBox>collidable;
            var axes = this.getAxes();
            axes = other.getAxes().concat(axes);
            var minOverlap = 99999;
            var minAxis = null;
            for (var i = 0; i < axes.length; i++) {
               var proj1 = this.project(axes[i]);
               var proj2 = other.project(axes[i]);
               var overlap = proj1.getOverlap(proj2);

               if (overlap === 0) {
                  return null;
               } else {
                  if (overlap <= minOverlap) {
                     minOverlap = overlap;
                     minAxis = axes[i];
                  }
               }
            }

            if (minAxis) {
               return minAxis.normalize().scale(minOverlap);
            } else {
               return null;
            }
         }

         return null;
      }


      public debugDraw(ctx: CanvasRenderingContext2D) {
         ctx.beginPath();
         ctx.lineWidth = 2;

         // Iterate through the supplied points and contruct a 'polygon'
         var firstPoint = this._points[0];
         ctx.moveTo(firstPoint.x, firstPoint.y);
         this._points.forEach((point) => {
            ctx.lineTo(point.x, point.y);
         });
         ctx.lineTo(firstPoint.x, firstPoint.y);
         ctx.closePath();

         ctx.strokeStyle = Color.Blue.toString();
         ctx.stroke();
      }
   }
}