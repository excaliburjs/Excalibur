// vector3.ts
import type { Clonable } from '../interfaces/clonable';
import { clamp } from './util';

/**
 * A 3D vector.
 */
export class Vector3 implements Clonable<Vector3> {
  /**
   * Get or set the vector equals epsilon, by default 0.001 meaning vectors within that tolerance on x, y, or z will be considered equal.
   */
  public static EQUALS_EPSILON = 0.001;

  /**
   * A (0, 0, 0) vector
   */
  public static get Zero() {
    return new Vector3(0, 0, 0);
  }

  /**
   * A (1, 1, 1) vector
   */
  public static get One() {
    return new Vector3(1, 1, 1);
  }

  /**
   * A unit vector pointing right (1, 0, 0)
   */
  public static get Right() {
    return new Vector3(1, 0, 0);
  }

  /**
   * A unit vector pointing left (-1, 0, 0)
   */
  public static get Left() {
    return new Vector3(-1, 0, 0);
  }

  /**
   * A unit vector pointing up (0, -1, 0)
   */
  public static get Up() {
    return new Vector3(0, -1, 0);
  }

  /**
   * A unit vector pointing down (0, 1, 0)
   */
  public static get Down() {
    return new Vector3(0, 1, 0);
  }

  /**
   * A unit vector pointing forward/out (0, 0, 1)
   */
  public static get Forward() {
    return new Vector3(0, 0, 1);
  }

  /**
   * A unit vector pointing backward/in (0, 0, -1)
   */
  public static get Back() {
    return new Vector3(0, 0, -1);
  }

  /**
   * Checks if vector is not null, undefined, or if any of its components are NaN or Infinity.
   */
  public static isValid(vec: Vector3) {
    if (vec === null || vec === undefined) {
      return false;
    }
    if (isNaN(vec.x) || isNaN(vec.y) || isNaN(vec.z)) {
      return false;
    }

    if (
      vec.x === Infinity ||
      vec.y === Infinity ||
      vec.z === Infinity ||
      vec.x === -Infinity ||
      vec.y === -Infinity ||
      vec.z === -Infinity
    ) {
      return false;
    }

    return true;
  }

  /**
   * Calculates distance between two Vectors
   */
  public static distance(vec1: Vector3, vec2: Vector3) {
    return Math.sqrt(Math.pow(vec1.x - vec2.x, 2) + Math.pow(vec1.y - vec2.y, 2) + Math.pow(vec1.z - vec2.z, 2));
  }

  public static min(vec1: Vector3, vec2: Vector3) {
    return new Vector3(Math.min(vec1.x, vec2.x), Math.min(vec1.y, vec2.y), Math.min(vec1.z, vec2.z));
  }

  public static max(vec1: Vector3, vec2: Vector3) {
    return new Vector3(Math.max(vec1.x, vec2.x), Math.max(vec1.y, vec2.y), Math.max(vec1.z, vec2.z));
  }

  /**
   * Creates a Vector3 from an array [x, y, z]
   */
  public static fromArray(array: number[] | Float32Array, offset = 0): Vector3 {
    return new Vector3(array[offset], array[offset + 1], array[offset + 2]);
  }

  /**
   * @param x X component of the Vector
   * @param y Y component of the Vector
   * @param z Z component of the Vector
   */
  constructor(x: number, y: number, z: number) {
    this._x = x;
    this._y = y;
    this._z = z;
  }

  protected _x = 0;
  public get x(): number {
    return this._x;
  }
  public set x(val: number) {
    this._x = val;
  }

  protected _y = 0;
  public get y(): number {
    return this._y;
  }
  public set y(val: number) {
    this._y = val;
  }

  protected _z = 0;
  public get z(): number {
    return this._z;
  }
  public set z(val: number) {
    this._z = val;
  }

  /**
   * Sets the x, y, and z components at once, THIS MUTATES the current vector.
   */
  public setTo(x: number, y: number, z: number): void {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   * Compares this vector against another and tests for equality
   */
  public equals(vector: Vector3, tolerance: number = Vector3.EQUALS_EPSILON): boolean {
    return Math.abs(this.x - vector.x) <= tolerance && Math.abs(this.y - vector.y) <= tolerance && Math.abs(this.z - vector.z) <= tolerance;
  }

  /**
   * The distance to another vector. If no other Vector is specified, this will return magnitude.
   */
  public distance(v?: Vector3): number {
    if (!v) {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    const deltaX = this.x - v.x;
    const deltaY = this.y - v.y;
    const deltaZ = this.z - v.z;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
  }

  public squareDistance(v?: Vector3): number {
    if (!v) {
      v = Vector3.Zero;
    }
    const deltaX = this.x - v.x;
    const deltaY = this.y - v.y;
    const deltaZ = this.z - v.z;
    return deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ;
  }

  /**
   * Clamps the current vector's magnitude mutating it
   */
  public clampMagnitude(magnitude: number): Vector3 {
    const size = this.magnitude;
    const newSize = clamp(size, 0, magnitude);
    this.magnitude = newSize;
    return this;
  }

  /**
   * The magnitude (length) of the Vector
   */
  public get magnitude(): number {
    return this.distance();
  }

  public set magnitude(newMagnitude: number) {
    this.normalize().scale(newMagnitude, this);
  }

  /**
   * Normalizes a non-zero vector to have a magnitude of 1. Zero vectors return a new zero vector.
   */
  public normalize(): Vector3 {
    const distance = this.distance();
    if (distance === 0) {
      return Vector3.Zero;
    }
    return new Vector3(this.x / distance, this.y / distance, this.z / distance);
  }

  /**
   * Returns the average (midpoint) between the current point and the specified point
   */
  public average(vec: Vector3): Vector3 {
    return this.add(vec).scale(0.5);
  }

  /**
   * Scales a vector by a factor or component-wise vector
   */
  public scale(scale: Vector3, dest?: Vector3): Vector3;
  public scale(size: number, dest?: Vector3): Vector3;
  public scale(sizeOrScale: number | Vector3, dest?: Vector3): Vector3 {
    const result = dest || new Vector3(0, 0, 0);
    if (sizeOrScale instanceof Vector3) {
      result.x = this.x * sizeOrScale.x;
      result.y = this.y * sizeOrScale.y;
      result.z = this.z * sizeOrScale.z;
    } else {
      result.x = this.x * sizeOrScale;
      result.y = this.y * sizeOrScale;
      result.z = this.z * sizeOrScale;
    }
    return result;
  }

  /**
   * Adds one vector to another
   */
  public add(v: Vector3, dest?: Vector3): Vector3 {
    const result = dest || new Vector3(0, 0, 0);
    result.x = this.x + v.x;
    result.y = this.y + v.y;
    result.z = this.z + v.z;
    return result;
  }

  /**
   * Subtracts a vector from another
   */
  public sub(v: Vector3, dest?: Vector3): Vector3 {
    const result = dest || new Vector3(0, 0, 0);
    result.x = this.x - v.x;
    result.y = this.y - v.y;
    result.z = this.z - v.z;
    return result;
  }

  /**
   * Adds one vector to this one modifying the original
   */
  public addEqual(v: Vector3): Vector3 {
    this.setTo(this.x + v.x, this.y + v.y, this.z + v.z);
    return this;
  }

  /**
   * Subtracts a vector from this one modifying the original
   */
  public subEqual(v: Vector3): Vector3 {
    this.setTo(this.x - v.x, this.y - v.y, this.z - v.z);
    return this;
  }

  /**
   * Scales this vector by a factor and modifies the original
   */
  public scaleEqual(size: number): Vector3 {
    this.setTo(this.x * size, this.y * size, this.z * size);
    return this;
  }

  /**
   * Performs a dot product with another vector
   */
  public dot(v: Vector3): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  /**
   * Performs a 3D cross product with another vector
   */
  public cross(v: Vector3, dest?: Vector3): Vector3 {
    const result = dest || new Vector3(0, 0, 0);
    const x = this.y * v.z - this.z * v.y;
    const y = this.z * v.x - this.x * v.z;
    const z = this.x * v.y - this.y * v.x;
    result.x = x;
    result.y = y;
    result.z = z;
    return result;
  }

  /**
   * Negate the current vector
   */
  public negate(): Vector3 {
    return this.scale(-1);
  }

  /**
   * Creates new vector that has the same values as the previous.
   */
  public clone(dest?: Vector3): Vector3 {
    const v = dest ?? new Vector3(0, 0, 0);
    v.x = this.x;
    v.y = this.y;
    v.z = this.z;
    return v;
  }

  /**
   * Returns a string representation of the vector.
   */
  public toString(fixed?: number): string {
    if (fixed !== undefined) {
      return `(${this.x.toFixed(fixed)}, ${this.y.toFixed(fixed)}, ${this.z.toFixed(fixed)})`;
    }
    return `(${this.x}, ${this.y}, ${this.z})`;
  }

  /**
   * Linearly interpolates between current vector and target vector.
   */
  public lerp(target: Vector3, t: number): Vector3 {
    t = clamp(t, 0, 1);
    return new Vector3(this.x + (target.x - this.x) * t, this.y + (target.y - this.y) * t, this.z + (target.z - this.z) * t);
  }

  /**
   * Copies components out into an array or Float32Array
   */
  public toArray(dest: number[] | Float32Array = [], offset = 0): number[] | Float32Array {
    dest[offset] = this.x;
    dest[offset + 1] = this.y;
    dest[offset + 2] = this.z;
    return dest;
  }

  /**
   * Converts to a Float32Array suitable for WebGL uniforms
   */
  public toFloat32Array(): Float32Array {
    return new Float32Array([this.x, this.y, this.z]);
  }
}

/**
 * Shorthand for creating new 3D Vectors
 */
export function vec3(x: number, y: number, z: number): Vector3 {
  return new Vector3(x, y, z);
}
