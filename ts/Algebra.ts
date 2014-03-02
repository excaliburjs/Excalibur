module ex {
   /**
    * A simple 2D point on a plane
    * @class Point
    * @constructor
    * @param x {number} X coordinate of the point
    * @param y {number} Y coordinate of the point
    *
    */
   export class Point {
      constructor(public x: number, public y: number) {
      }
      /**
       * X Coordinate of the point
       * @property x {number}
       */
       /**
       * Y Coordinate of the point
       * @property y {number}
       */
   }

   /**
    * A 2D vector on a plane. 
    * @class Vector
    * @extends Point
    * @constructor
    * @param x {number} X component of the Vector
    * @param y {number} Y component of the Vector
    */
   export class Vector extends Point {
      constructor(public x: number, public y: number) {
         super(x, y);
      }

      /**
       * The distance to another vector
       * @method distance
       * @param v {Vector} The other vector
       * @returns number
       */
      public distance(v?: Vector): number {
         if (!v) {
            v = new Vector(0.0, 0.0);
         }
         return Math.sqrt(Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2));
      }

      /**
       * Normalizes a vector to have a magnitude of 1.
       * @method normalize
       * @return Vector
       */
      public normalize(): Vector {
         var d = this.distance();
         if (d > 0) {
            return new Vector(this.x / d, this.y / d);
         } else {
            return new Vector(0, 1);
         }
      }

      /**
       * Scales a vector's by a factor of size
       * @method scale
       * @param size {number} The factor to scale the magnitude by
       * @returns Vector
       */
      public scale(size): Vector {
         return new Vector(this.x * size, this.y * size);
      }

      /**
       * Adds one vector to another
       * @method add
       * @param v {Vector} The vector to add
       * @returns Vector
       */
      public add(v: Vector): Vector {
         return new Vector(this.x + v.x, this.y + v.y);
      }

      /**
       * Subtracts a vector from the current vector
       * @method minus
       * @param v {Vector} The vector to subtract
       * @returns Vector
       */
      public minus(v: Vector): Vector {
         return new Vector(this.x - v.x, this.y - v.y);
      }

      /**
       * Performs a dot product with another vector
       * @method dot
       * @param v {Vector} The vector to dot
       * @returns number
       */
      public dot(v: Vector): number {
         return this.x * v.x + this.y * v.y;
      }

      /**
       * Performs a 2D cross product with another vector. 2D cross products return a scalar value not a vector.
       * @method cross
       * @param v {Vector} The vector to cross
       * @returns number
       */
      public cross(v: Vector): number {
         return this.x * v.y - this.y * v.x;
      }

   }
}