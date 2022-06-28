import { Clonable } from '../Interfaces/Clonable';
import { clamp } from './util';

/**
 * A 2D vector on a plane.
 */

export class Vector implements Clonable<Vector> {
  /**
   * A (0, 0) vector
   */
  public static get Zero() {
    return new Vector(0, 0);
  }

  /**
   * A (1, 1) vector
   */
  public static get One() {
    return new Vector(1, 1);
  }

  /**
   * A (0.5, 0.5) vector
   */
  public static get Half() {
    return new Vector(0.5, 0.5);
  }

  /**
   * A unit vector pointing up (0, -1)
   */
  public static get Up() {
    return new Vector(0, -1);
  }

  /**
   * A unit vector pointing down (0, 1)
   */
  public static get Down() {
    return new Vector(0, 1);
  }

  /**
   * A unit vector pointing left (-1, 0)
   */
  public static get Left() {
    return new Vector(-1, 0);
  }
  /**
   * A unit vector pointing right (1, 0)
   */
  public static get Right() {
    return new Vector(1, 0);
  }

  /**
   * Returns a vector of unit length in the direction of the specified angle in Radians.
   * @param angle The angle to generate the vector
   */
  public static fromAngle(angle: number) {
    return new Vector(Math.cos(angle), Math.sin(angle));
  }

  /**
   * Checks if vector is not null, undefined, or if any of its components are NaN or Infinity.
   */
  public static isValid(vec: Vector) {
    if (vec === null || vec === undefined) {
      return false;
    }
    if (isNaN(vec.x) || isNaN(vec.y)) {
      return false;
    }

    if (vec.x === Infinity || vec.y === Infinity || vec.x === -Infinity || vec.y === -Infinity) {
      return false;
    }

    return true;
  }

  /**
   * Calculates distance between two Vectors
   * @param vec1
   * @param vec2
   */
  public static distance(vec1: Vector, vec2: Vector) {
    return Math.sqrt(Math.pow(vec1.x - vec2.x, 2) + Math.pow(vec1.y - vec2.y, 2));
  }

  public static min(vec1: Vector, vec2: Vector) {
    return new Vector(Math.min(vec1.x, vec2.x), Math.min(vec1.y, vec2.y));
  }

  public static max(vec1: Vector, vec2: Vector) {
    return new Vector(Math.max(vec1.x, vec2.x), Math.max(vec1.y, vec2.y));
  }

  /**
   * @param x  X component of the Vector
   * @param y  Y component of the Vector
   */
  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  protected _x = 0;
  /**
   * Get the x component of the vector
   */
  public get x(): number {
    return this._x;
  }

  /**
   * Set the x component, THIS MUTATES the current vector. It is usually better to create a new vector.
   * @warning **Be very careful setting components on shared vectors, mutating shared vectors can cause hard to find bugs**
   */
  public set x(val: number) {
    this._x = val;
  }

  protected _y = 0;
  /**
   * Get the y component of the vector
   */
  public get y(): number {
    return this._y;
  }

  /**
   * Set the y component, THIS MUTATES the current vector. It is usually better to create a new vector.
   * @warning **Be very careful setting components on shared vectors, mutating shared vectors can cause hard to find bugs**
   */
  public set y(val: number) {
    this._y = val;
  }

  /**
   * Sets the x and y components at once, THIS MUTATES the current vector. It is usually better to create a new vector.
   *
   * @warning **Be very careful using this, mutating vectors can cause hard to find bugs**
   */
  setTo(x: number, y: number) {
    (this.x as number) = x;
    (this.y as number) = y;
  }

  /**
   * Compares this point against another and tests for equality
   * @param vector The other point to compare to
   * @param tolerance Amount of euclidean distance off we are willing to tolerate
   */
  public equals(vector: Vector, tolerance: number = 0.001): boolean {
    return Math.abs(this.x - vector.x) <= tolerance && Math.abs(this.y - vector.y) <= tolerance;
  }

  /**
   * The distance to another vector. If no other Vector is specified, this will return the [[magnitude]].
   * @param v  The other vector. Leave blank to use origin vector.
   */
  public distance(v?: Vector): number {
    if (!v) {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    const deltaX = this.x - v.x;
    const deltaY = this.y - v.y;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }

  public squareDistance(v?: Vector): number {
    if (!v) {
      v = Vector.Zero;
    }
    const deltaX = this.x - v.x;
    const deltaY = this.y - v.y;
    return deltaX * deltaX + deltaY * deltaY;
  }

  /**
   * Clamps the current vector's magnitude mutating it
   * @param magnitude
   */
  public clampMagnitude(magnitude: number): Vector {
    const size = this.size;
    const newSize = clamp(size, 0, magnitude);
    this.size = newSize;
    return this;
  }

  /**
   * The size (magnitude) of the Vector
   */
  public get size(): number {
    return this.distance();
  }

  /**
   * Setting the size mutates the current vector
   *
   * @warning Can be used to set the size of the vector, **be very careful using this, mutating vectors can cause hard to find bugs**
   */
  public set size(newLength: number) {
    const v = this.normalize().scale(newLength);
    this.setTo(v.x, v.y);
  }

  /**
   * Normalizes a vector to have a magnitude of 1.
   */
  public normalize(): Vector {
    const d = this.distance();
    if (d > 0) {
      return new Vector(this.x / d, this.y / d);
    } else {
      return new Vector(0, 1);
    }
  }

  /**
   * Returns the average (midpoint) between the current point and the specified
   */
  public average(vec: Vector): Vector {
    return this.add(vec).scale(0.5);
  }

  /**
   * Scales a vector's by a factor of size
   * @param size  The factor to scale the magnitude by
   * @param dest  Optionally provide a destination vector for the result
   */
  public scale(scale: Vector, dest?: Vector): Vector;
  public scale(size: number, dest?: Vector): Vector;
  public scale(sizeOrScale: number | Vector, dest?: Vector): Vector {
    const result = dest || new Vector(0, 0);
    if (sizeOrScale instanceof Vector) {
      result.x = this.x * sizeOrScale.x;
      result.y = this.y * sizeOrScale.y;
    } else {
      result.x = this.x * sizeOrScale;
      result.y = this.y * sizeOrScale;
    }
    return result;
  }

  /**
   * Adds one vector to another
   * @param v The vector to add
   * @param dest Optionally copy the result into a provided vector
   */
  public add(v: Vector, dest?: Vector): Vector {
    if (dest) {
      dest.x = this.x + v.x;
      dest.y = this.y + v.y;
      return dest;
    }
    return new Vector(this.x + v.x, this.y + v.y);
  }

  /**
   * Subtracts a vector from another, if you subtract vector `B.sub(A)` the resulting vector points from A -> B
   * @param v The vector to subtract
   */
  public sub(v: Vector): Vector {
    return new Vector(this.x - v.x, this.y - v.y);
  }

  /**
   * Adds one vector to this one modifying the original
   * @param v The vector to add
   * @warning Be very careful using this, mutating vectors can cause hard to find bugs
   */
  public addEqual(v: Vector): Vector {
    this.setTo(this.x + v.x, this.y + v.y);
    return this;
  }

  /**
   * Subtracts a vector from this one modifying the original
   * @param v The vector to subtract
   * @warning Be very careful using this, mutating vectors can cause hard to find bugs
   */
  public subEqual(v: Vector): Vector {
    this.setTo(this.x - v.x, this.y - v.y);
    return this;
  }

  /**
   * Scales this vector by a factor of size and modifies the original
   * @warning Be very careful using this, mutating vectors can cause hard to find bugs
   */
  public scaleEqual(size: number): Vector {
    this.setTo(this.x * size, this.y * size);
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
   * @param v  The scalar to cross
   */
  public cross(v: number): Vector;
  /**
   * Performs a 2D cross product with another vector. 2D cross products return a scalar value not a vector.
   * @param v  The vector to cross
   */
  public cross(v: Vector): number;
  public cross(v: any): any {
    if (v instanceof Vector) {
      return this.x * v.y - this.y * v.x;
    } else if (typeof v === 'number') {
      return new Vector(v * this.y, -v * this.x);
    }
  }

  static cross(num: number, vec: Vector): Vector {
    return new Vector(-num * vec.y, num * vec.x);
  }

  /**
   * Returns the perpendicular vector to this one
   */
  public perpendicular(): Vector {
    return new Vector(this.y, -this.x);
  }

  /**
   * Returns the normal vector to this one, same as the perpendicular of length 1
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
      anchor = new Vector(0, 0);
    }
    const sinAngle = Math.sin(angle);
    const cosAngle = Math.cos(angle);
    const x = cosAngle * (this.x - anchor.x) - sinAngle * (this.y - anchor.y) + anchor.x;
    const y = sinAngle * (this.x - anchor.x) + cosAngle * (this.y - anchor.y) + anchor.y;
    return new Vector(x, y);
  }

  /**
   * Creates new vector that has the same values as the previous.
   */
  public clone(dest?: Vector): Vector {
    const v = dest ?? new Vector(0, 0);
    v.x = this.x;
    v.y = this.y;
    return v;
  }

  /**
   * Returns a string representation of the vector.
   */
  public toString(fixed?: number): string {
    if (fixed) {
      return `(${this.x.toFixed(fixed)}, ${this.y.toFixed(fixed)})`;
    }
    return `(${this.x}, ${this.y})`;
  }
}

/**
 * Shorthand for creating new Vectors - returns a new Vector instance with the
 * provided X and Y components.
 *
 * @param x  X component of the Vector
 * @param y  Y component of the Vector
 */
export function vec(x: number, y: number): Vector {
  return new Vector(x, y);
}
