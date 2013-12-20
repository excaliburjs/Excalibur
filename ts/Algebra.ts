module ex {
   export class Point {
      constructor(public x: number, public y: number) {
      }
   }

   export class Vector extends Point {
      constructor(public x: number, public y: number) {
         super(x, y);
      }

      public distance(v?: Vector): number {
         if (!v) {
            v = new Vector(0.0, 0.0);
         }
         return Math.sqrt(Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2));
      }

      public normalize(): Vector {
         var d = this.distance();
         if (d > 0) {
            return new Vector(this.x / d, this.y / d);
         } else {
            return new Vector(0, 1);
         }
      }

      public scale(size): Vector {
         return new Vector(this.x * size, this.y * size);
      }

      public add(v: Vector): Vector {
         return new Vector(this.x + v.x, this.y + v.y);
      }

      public minus(v: Vector): Vector {
         return new Vector(this.x - v.x, this.y - v.y);
      }

      public dot(v: Vector): number {
         return this.x * v.x + this.y * v.y;
      }

      // 2d cross product returns a scalar
      public cross(v: Vector): number {
         return this.x * v.y - this.y * v.x;
      }

   }
}