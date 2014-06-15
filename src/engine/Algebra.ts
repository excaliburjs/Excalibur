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

      /**
       * Convert this point to a vector
       * @method toVector
       * @returns Vector
       */
      public toVector(): Vector {
         return new Vector(this.x, this.y);
      }

      /**
       * Rotates the current point around another by a certain number of
       * degrees in radians
       * @method rotate
       * @returns Point
       */
      public rotate(angle: number, anchor?: Point): Point{
         if(!anchor){
            anchor = new ex.Point(0,0);
         }
         var sinAngle = Math.sin(angle);
         var cosAngle = Math.cos(angle);
         var x = cosAngle * (this.x - anchor.x) - sinAngle * (this.y - anchor.y) + anchor.x;
         var y = sinAngle * (this.x - anchor.x) + cosAngle * (this.y - anchor.y) + anchor.y;
         return new Point(x, y);
      }

      /**
       * Translates the current point by a vector
       * @method add
       * @returns Point
       */
      public add(vector: Vector): Point {
         return new Point(this.x + vector.x, this.y + vector.y);
      }

      /**
       * Sets the x and y components at once
       * @method setTo
       * @param x {number}
       * @param y {number}
       */
      public setTo(x: number, y: number){
         this.x = x;
         this.y = y;
      }

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

      /**
       * Returns a vector of unit length in the direction of the specified angle.
       * @method fromAngle
       * @static
       * @param angle {number} The angle to generate the vector
       * @returns Vector
       */
      public static fromAngle(angle: number){
         return new Vector(Math.cos(angle), Math.sin(angle));
      }

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

      /**
       * Returns the perpendicular vector to this one
       * @method perpendicular
       * @return Vector
       */
      public perpendicular(): Vector{
         return new Vector(this.y, -this.x);
      }

      /**
       * Returns the normal vector to this one 
       * @method normal
       * @return Vector
       */
      public normal(): Vector{
         return this.perpendicular().normalize();
      }

      /**
       * Returns the angle of this vector.
       * @method toAngle
       * @returns number
       */
      public toAngle(): number {
         return Math.atan2(this.y, this.x);
      }

      /**
       * Returns the point represention of this vector
       * @method toPoint
       * @returns Point
       */
      public toPoint(): Point {
         return new Point(this.x, this.y);
      }

      /**
       * Rotates the current vector around a point by a certain number of
       * degrees in radians
       * @method rotate
       * @returns Vector
       */
      public rotate(angle: number, anchor: Point): Vector{
         return super.rotate(angle, anchor).toVector();
      }

   }


   /**
    * A 2D ray that can be cast into the scene to do collision detection
    * @class Ray
    * @constructor
    * @param pos {Point} The starting position for the ray
    * @param dir {Vector} The vector indicating the direction of the ray
    */
   export class Ray {
      public pos: Point;
      public dir: Vector;
      constructor(pos: Point, dir: Vector){
         this.pos = pos;
         this.dir = dir.normalize();
      }

      /**
       * Tests a whether this ray intersects with a line segment. Returns a number greater than or equal to 0 on success. 
       * This number indicates the mathematical intersection time.
       * @method intersect
       * @param line {Line} The line to test
       * @returns number
       */
       public intersect(line: Line): number{
         var numerator = line.begin.toVector().minus(this.pos.toVector());

         // Test is line and ray are parallel and non intersecting
         if(this.dir.cross(line.getSlope()) === 0 && numerator.cross(this.dir) !== 0){ 
            return -1;
         }
          
         // Lines are parallel
         var divisor = (this.dir.cross(line.getSlope()));
         if (divisor === 0 ) {
             return -1;
         }

         var t = numerator.cross(line.getSlope())/divisor;

         if(t >= 0){
            var u = (numerator.cross(this.dir)/divisor)/line.getLength();
            if(u >= 0 && u <= 1){
               return t;
            }
         }         
         return -1;
      }

      /**
       * Returns the point of intersection given the intersection time
       * @method getPoint
       * @returns Point
       */
      public getPoint(time: number): Point{
         return this.pos.toVector().add(this.dir.scale(time)).toPoint();
      }
   }

   /**
    * A 2D line segment 
    * @class Line
    * @constructor
    * @param begin {Point} The starting point of the line segment
    * @param end {Point} The ending point of the line segment
    */
   export class Line {
      public begin: Point;
      public end: Point;
      constructor(begin: Point, end: Point){
         this.begin = begin;
         this.end = end;
      }

      /** 
       * Returns the slope of the line in the form of a vector
       * @method getSlope
       * @returns Vector
       */
      public getSlope(): Vector{
         var begin = this.begin.toVector();
         var end = this.end.toVector();
         var distance = begin.distance(end);
         return end.minus(begin).scale(1/distance);
      }

      /**
       * Returns the length of the line segment in pixels
       * @method getLength
       * @returns number
       */
      public getLength(): number{
         var begin = this.begin.toVector();
         var end = this.end.toVector();
         var distance = begin.distance(end);
         return distance;
      }

   }

   export class Projection {
      constructor(public min: number, public max: number){}
      public overlaps(projection: Projection): boolean {
         return this.max > projection.min && projection.max > this.min;      
      }

      public getOverlap(projection: Projection): number {
         if(this.overlaps(projection)){
            if (this.max > projection.max) {
               return projection.max - this.min;
            }
            else {
               return this.max - projection.min;
            }
         }
         return 0;
      }
   }

}