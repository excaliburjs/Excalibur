module ex {
   
   /**
    * A 2D vector on a plane. 
    */
   export class Vector {

      /**
       * A (0, 0) vector
       */
      public static Zero = new Vector(0, 0);

      /**
       * Returns a vector of unit length in the direction of the specified angle in Radians.
       * @param angle The angle to generate the vector
       */
      public static fromAngle(angle: number) {
         return new Vector(Math.cos(angle), Math.sin(angle));
      }

      /**
       * @param x  X component of the Vector
       * @param y  Y component of the Vector
       */
      constructor(public x: number, public y: number) { }
      
      /**
       * Sets the x and y components at once
       */
      public setTo(x: number, y: number) {
         this.x = x;
         this.y = y;
      }
      
      /**
       * Compares this point against another and tests for equality
       * @param point  The other point to compare to
       */
      public equals(vector: Vector, tolerance: number = .001): boolean {
         return Math.abs(this.x - vector.x) <= tolerance && Math.abs(this.y - vector.y) <= tolerance;
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
      public sub(v: Vector): Vector {
         return new Vector(this.x - v.x, this.y - v.y);
      }
      
      /**
       * Adds one vector to this one modifying the original
       * @param v The vector to add
       */
      public addEquals(v: Vector): Vector {
         this.x += v.x;
         this.y += v.y;
         return this;
      }
      
      /**
       * Subtracts a vector from this one modifying the original
       * @parallel v The vector to subtract
       */
      public subEquals(v: Vector): Vector {
         this.x -= v.x;
         this.y -= v.y;
         return this;
      }
      
      /**
       * Scales this vector by a factor of size and modifies the original
       */
      public scaleEquals(size: number): Vector {
         this.x *= size;
         this.y *= size;
         return this;
      }

      /**
       * Performs a dot product with another vector
       * @param v  The vector to dot
       */
      public dot(v: Vector): number {
         return this.x * v.x + this.y * v.y;
      }

      /**
       * Performs a 2D cross product with scalar. 2D cross products with a scalar return a vector.
       * @param v  The vector to cross
       */
      public cross(v: number): Vector;
      /**
       * Performs a 2D cross product with another vector. 2D cross products return a scalar value not a vector.
       * @param v  The vector to cross
       */
      public cross(v: Vector): number;
      public cross(v: any): any {
         if(v instanceof Vector) {
            return this.x * v.y - this.y * v.x;
         } else if (typeof v === 'number') {
            return new Vector(v * this.y, -v * this.x);
         }
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
       * Negate the current vector
       */
      public negate(): Vector {
         return this.scale(-1);
      }

      /**
       * Returns the angle of this vector.
       */
      public toAngle(): number {
         return Math.atan2(this.y, this.x);
      }

      /**
       * Rotates the current vector around a point by a certain number of
       * degrees in radians
       */
      public rotate(angle: number, anchor?: Vector): Vector {
          if (!anchor) {
            anchor = new ex.Vector(0, 0);
         }
         var sinAngle = Math.sin(angle);
         var cosAngle = Math.cos(angle);
         var x = cosAngle * (this.x - anchor.x) - sinAngle * (this.y - anchor.y) + anchor.x;
         var y = sinAngle * (this.x - anchor.x) + cosAngle * (this.y - anchor.y) + anchor.y;
         return new Vector(x, y);
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
      public pos: Vector;
      public dir: Vector;

      /**
       * @param pos The starting position for the ray
       * @param dir The vector indicating the direction of the ray
       */
      constructor(pos: Vector, dir: Vector) {
         this.pos = pos;
         this.dir = dir.normalize();
      }

      /**
       * Tests a whether this ray intersects with a line segment. Returns a number greater than or equal to 0 on success. 
       * This number indicates the mathematical intersection time.
       * @param line  The line to test
       */
       public intersect(line: Line): number {
         var numerator = line.begin.sub(this.pos);

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
      public getPoint(time: number): Vector {
         return this.pos.add(this.dir.scale(time));
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
      constructor(public begin: Vector, public end: Vector) {
      }

      /** 
       * Returns the slope of the line in the form of a vector
       */
      public getSlope(): Vector {
         var begin = this.begin;
         var end = this.end;
         var distance = begin.distance(end);
         return end.sub(begin).scale(1 / distance);
      }

      /**
       * Returns the length of the line segment in pixels
       */
      public getLength(): number {
         var begin = this.begin;
         var end = this.end;
         var distance = begin.distance(end);
         return distance;
      }

   }

   /**
    * A 1 dimensional projection on an axis, used to test overlaps
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