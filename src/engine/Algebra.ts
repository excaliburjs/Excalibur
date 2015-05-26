module ex {
   /**
    * A simple 2D point on a plane
    */
   export class Point {

      /**
       * @param x  X coordinate of the point
       * @param y  Y coordinate of the point
       */
      constructor(public x: number, public y: number) {
      }

      /**
       * Convert this point to a vector
       */
      public toVector(): Vector {
         return new Vector(this.x, this.y);
      }

      /**
       * Rotates the current point around another by a certain number of
       * degrees in radians
       * @param angle  The angle in radians
       * @param anchor The point to rotate around
       */
      public rotate(angle: number, anchor?: Point): Point {
         if (!anchor) {
            anchor = new ex.Point(0, 0);
         }
         var sinAngle = Math.sin(angle);
         var cosAngle = Math.cos(angle);
         var x = cosAngle * (this.x - anchor.x) - sinAngle * (this.y - anchor.y) + anchor.x;
         var y = sinAngle * (this.x - anchor.x) + cosAngle * (this.y - anchor.y) + anchor.y;
         return new Point(x, y);
      }

      /**
       * Translates the current point by a vector
       * @param vector  The other vector to add to
       */
      public add(vector: Vector): Point {
         return new Point(this.x + vector.x, this.y + vector.y);
      }

      /**
       * Sets the x and y components at once
       */
      public setTo(x: number, y: number) {
         this.x = x;
         this.y = y;
      }

      /**
       * Clones a new point that is a copy of this one.
       */
      public clone() {
         return new Point(this.x, this.y);
      }

      /**
       * Compares this point against another and tests for equality
       * @param point  The other point to compare to
       */
      public equals(point: Point): boolean {
         return this.x === point.x && this.y === point.y;
      }
   }

   /**
    * A 2D vector on a plane. 
    */
   export class Vector extends Point {

      /**
       * A (0, 0) vector
       */
      public static Zero = new Vector(0, 0);

      /**
       * Returns a vector of unit length in the direction of the specified angle.
       * @param angle The angle to generate the vector
       */
      public static fromAngle(angle: number) {
         return new Vector(Math.cos(angle), Math.sin(angle));
      }

      /**
       * @param x  X component of the Vector
       * @param y  Y component of the Vector
       */
      constructor(public x: number, public y: number) {
         super(x, y);
      }

      /**
       * The distance to another vector
       * @param v  The other vector
       */
      public distance(v?: Vector): number {
         if (!v) {
            v = new Vector(0.0, 0.0);
         }
         return Math.sqrt(Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2));
      }

      /**
       * Normalizes a vector to have a magnitude of 1.
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
       * @param size  The factor to scale the magnitude by
       */
      public scale(size): Vector {
         return new Vector(this.x * size, this.y * size);
      }

      /**
       * Adds one vector to another, alias for add
       * @param v  The vector to add
       */
      public plus(v: Vector): Vector {
         return this.add(v);
      }

      /**
       * Adds one vector to another
       * @param v The vector to add
       */
      public add(v: Vector): Vector {
         return new Vector(this.x + v.x, this.y + v.y);
      }

      /**
       * Subtracts a vector from another, alias for minus
       * @param v The vector to subtract
       */
      public subtract(v: Vector): Vector {
         return this.minus(v);
      }

      /**
       * Subtracts a vector from the current vector
       * @param v The vector to subtract
       */
      public minus(v: Vector): Vector {
         return new Vector(this.x - v.x, this.y - v.y);
      }

      /**
       * Performs a dot product with another vector
       * @param v  The vector to dot
       */
      public dot(v: Vector): number {
         return this.x * v.x + this.y * v.y;
      }

      /**
       * Performs a 2D cross product with another vector. 2D cross products return a scalar value not a vector.
       * @param v  The vector to cross
       */
      public cross(v: Vector): number {
         return this.x * v.y - this.y * v.x;
      }

      /**
       * Returns the perpendicular vector to this one
       */
      public perpendicular(): Vector {
         return new Vector(this.y, -this.x);
      }

      /**
       * Returns the normal vector to this one 
       */
      public normal(): Vector {
         return this.perpendicular().normalize();
      }

      /**
       * Returns the angle of this vector.
       */
      public toAngle(): number {
         return Math.atan2(this.y, this.x);
      }

      /**
       * Returns the point represention of this vector
       */
      public toPoint(): Point {
         return new Point(this.x, this.y);
      }

      /**
       * Rotates the current vector around a point by a certain number of
       * degrees in radians
       */
      public rotate(angle: number, anchor: Point): Vector {
         return super.rotate(angle, anchor).toVector();
      }

      /**
       * Creates new vector that has the same values as the previous.
       */
      public clone(): Vector {
         return new Vector(this.x, this.y);
      }

   }


   /**
    * A 2D ray that can be cast into the scene to do collision detection
    */
   export class Ray {
      public pos: Point;
      public dir: Vector;

      /**
       * @param pos The starting position for the ray
       * @param dir The vector indicating the direction of the ray
       */
      constructor(pos: Point, dir: Vector) {
         this.pos = pos;
         this.dir = dir.normalize();
      }

      /**
       * Tests a whether this ray intersects with a line segment. Returns a number greater than or equal to 0 on success. 
       * This number indicates the mathematical intersection time.
       * @param line  The line to test
       */
       public intersect(line: Line): number {
         var numerator = line.begin.toVector().minus(this.pos.toVector());

         // Test is line and ray are parallel and non intersecting
         if(this.dir.cross(line.getSlope()) === 0 && numerator.cross(this.dir) !== 0) { 
            return -1;
         }
          
         // Lines are parallel
         var divisor = (this.dir.cross(line.getSlope()));
         if (divisor === 0 ) {
             return -1;
         }

         var t = numerator.cross(line.getSlope()) / divisor;

         if (t >= 0) {
            var u = (numerator.cross(this.dir) / divisor) / line.getLength();
            if (u >= 0 && u <= 1) {
               return t;
            }
         }         
         return -1;
      }

      /**
       * Returns the point of intersection given the intersection time
       */
      public getPoint(time: number): Point {
         return this.pos.toVector().add(this.dir.scale(time)).toPoint();
      }
   }

   /**
    * A 2D line segment 
    */
   export class Line {

      /**
       * @param begin  The starting point of the line segment
       * @param end  The ending point of the line segment
       */
      constructor(public begin: Point, public end: Point) {
      }

      /** 
       * Returns the slope of the line in the form of a vector
       */
      public getSlope(): Vector {
         var begin = this.begin.toVector();
         var end = this.end.toVector();
         var distance = begin.distance(end);
         return end.minus(begin).scale(1 / distance);
      }

      /**
       * Returns the length of the line segment in pixels
       */
      public getLength(): number {
         var begin = this.begin.toVector();
         var end = this.end.toVector();
         var distance = begin.distance(end);
         return distance;
      }

   }

   /**
    * A projection
    * @todo
    */
   export class Projection {
      constructor(public min: number, public max: number) {}
      public overlaps(projection: Projection): boolean {
         return this.max > projection.min && projection.max > this.min;      
      }

      public getOverlap(projection: Projection): number {
         if(this.overlaps(projection)) {
            if (this.max > projection.max) {
               return projection.max - this.min;
            } else {
               return this.max - projection.min;
            }
         }
         return 0;
      }
   }

}