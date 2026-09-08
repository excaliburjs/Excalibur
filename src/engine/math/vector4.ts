// vector4.ts
import type { Clonable } from '../interfaces/clonable';
import type { Matrix } from './matrix';
import { Vector3 } from './vector3';
import { clamp } from './util';

/**
 * A 4D vector, often used for homogeneous coordinates in WebGL shaders and transforms.
 */
export class Vector4 implements Clonable<Vector4> {
  /**
   * Get or set the vector equals epsilon, by default 0.001 meaning vectors within that tolerance will be considered equal.
   */
  public static EQUALS_EPSILON = 0.001;

  /**
   * A (0, 0, 0, 0) vector
   */
  public static get Zero() {
    return new Vector4(0, 0, 0, 0);
  }

  /**
   * A (1, 1, 1, 1) vector
   */
  public static get One() {
    return new Vector4(1, 1, 1, 1);
  }

  /**
   * Creates a homogeneous point vector (w = 1) from a Vector3
   */
  public static fromPoint(v: Vector3): Vector4 {
    return new Vector4(v.x, v.y, v.z, 1);
  }

  /**
   * Creates a homogeneous direction vector (w = 0) from a Vector3
   */
  public static fromDirection(v: Vector3): Vector4 {
    return new Vector4(v.x, v.y, v.z, 0);
  }

  /**
   * Checks if vector is not null, undefined, or if any of its components are NaN or Infinity.
   */
  public static isValid(vec: Vector4) {
    if (vec === null || vec === undefined) {
      return false;
    }
    if (isNaN(vec.x) || isNaN(vec.y) || isNaN(vec.z) || isNaN(vec.w)) {
      return false;
    }

    if (
      vec.x === Infinity ||
      vec.y === Infinity ||
      vec.z === Infinity ||
      vec.w === Infinity ||
      vec.x === -Infinity ||
      vec.y === -Infinity ||
      vec.z === -Infinity ||
      vec.w === -Infinity
    ) {
      return false;
    }

    return true;
  }

  /**
   * Calculates distance between two Vectors
   */
  public static distance(vec1: Vector4, vec2: Vector4) {
    return Math.sqrt(
      Math.pow(vec1.x - vec2.x, 2) + Math.pow(vec1.y - vec2.y, 2) + Math.pow(vec1.z - vec2.z, 2) + Math.pow(vec1.w - vec2.w, 2)
    );
  }

  public static min(vec1: Vector4, vec2: Vector4) {
    return new Vector4(Math.min(vec1.x, vec2.x), Math.min(vec1.y, vec2.y), Math.min(vec1.z, vec2.z), Math.min(vec1.w, vec2.w));
  }

  public static max(vec1: Vector4, vec2: Vector4) {
    return new Vector4(Math.max(vec1.x, vec2.x), Math.max(vec1.y, vec2.y), Math.max(vec1.z, vec2.z), Math.max(vec1.w, vec2.w));
  }

  /**
   * Creates a Vector4 from an array [x, y, z, w]
   */
  public static fromArray(array: number[] | Float32Array, offset = 0): Vector4 {
    return new Vector4(array[offset], array[offset + 1], array[offset + 2], array[offset + 3]);
  }

  /**
   * @param x X component
   * @param y Y component
   * @param z Z component
   * @param w W component
   */
  constructor(x: number, y: number, z: number, w: number) {
    this._x = x;
    this._y = y;
    this._z = z;
    this._w = w;
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

  protected _w = 0;
  public get w(): number {
    return this._w;
  }
  public set w(val: number) {
    this._w = val;
  }

  /**
   * Sets all 4 components at once, THIS MUTATES the current vector.
   */
  public setTo(x: number, y: number, z: number, w: number): void {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  /**
   * Compares this vector against another and tests for equality
   */
  public equals(vector: Vector4, tolerance: number = Vector4.EQUALS_EPSILON): boolean {
    return (
      Math.abs(this.x - vector.x) <= tolerance &&
      Math.abs(this.y - vector.y) <= tolerance &&
      Math.abs(this.z - vector.z) <= tolerance &&
      Math.abs(this.w - vector.w) <= tolerance
    );
  }

  /**
   * Distance to another vector or magnitude if omitted
   */
  public distance(v?: Vector4): number {
    if (!v) {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }
    const deltaX = this.x - v.x;
    const deltaY = this.y - v.y;
    const deltaZ = this.z - v.z;
    const deltaW = this.w - v.w;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ + deltaW * deltaW);
  }

  public squareDistance(v?: Vector4): number {
    if (!v) {
      v = Vector4.Zero;
    }
    const deltaX = this.x - v.x;
    const deltaY = this.y - v.y;
    const deltaZ = this.z - v.z;
    const deltaW = this.w - v.w;
    return deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ + deltaW * deltaW;
  }

  /**
   * Clamps the current vector's magnitude mutating it
   */
  public clampMagnitude(magnitude: number): Vector4 {
    const size = this.magnitude;
    const newSize = clamp(size, 0, magnitude);
    this.magnitude = newSize;
    return this;
  }

  /**
   * Magnitude (length) of the Vector
   */
  public get magnitude(): number {
    return this.distance();
  }

  public set magnitude(newMagnitude: number) {
    this.normalize().scale(newMagnitude, this);
  }

  /**
   * Normalizes a non-zero vector. Zero vectors return a new zero vector.
   */
  public normalize(): Vector4 {
    const distance = this.distance();
    if (distance === 0) {
      return Vector4.Zero;
    }
    return new Vector4(this.x / distance, this.y / distance, this.z / distance, this.w / distance);
  }

  /**
   * Returns midpoint between this and target point
   */
  public average(vec: Vector4): Vector4 {
    return this.add(vec).scale(0.5);
  }

  /**
   * Scales vector component-wise or by scalar
   */
  public scale(scale: Vector4, dest?: Vector4): Vector4;
  public scale(size: number, dest?: Vector4): Vector4;
  public scale(sizeOrScale: number | Vector4, dest?: Vector4): Vector4 {
    const result = dest || new Vector4(0, 0, 0, 0);
    if (sizeOrScale instanceof Vector4) {
      result.x = this.x * sizeOrScale.x;
      result.y = this.y * sizeOrScale.y;
      result.z = this.z * sizeOrScale.z;
      result.w = this.w * sizeOrScale.w;
    } else {
      result.x = this.x * sizeOrScale;
      result.y = this.y * sizeOrScale;
      result.z = this.z * sizeOrScale;
      result.w = this.w * sizeOrScale;
    }
    return result;
  }

  /**
   * Adds one vector to another
   */
  public add(v: Vector4, dest?: Vector4): Vector4 {
    const result = dest || new Vector4(0, 0, 0, 0);
    result.x = this.x + v.x;
    result.y = this.y + v.y;
    result.z = this.z + v.z;
    result.w = this.w + v.w;
    return result;
  }

  /**
   * Subtracts a vector from another
   */
  public sub(v: Vector4, dest?: Vector4): Vector4 {
    const result = dest || new Vector4(0, 0, 0, 0);
    result.x = this.x - v.x;
    result.y = this.y - v.y;
    result.z = this.z - v.z;
    result.w = this.w - v.w;
    return result;
  }

  /**
   * Adds one vector to this one modifying the original
   */
  public addEqual(v: Vector4): Vector4 {
    this.setTo(this.x + v.x, this.y + v.y, this.z + v.z, this.w + v.w);
    return this;
  }

  /**
   * Subtracts a vector from this one modifying the original
   */
  public subEqual(v: Vector4): Vector4 {
    this.setTo(this.x - v.x, this.y - v.y, this.z - v.z, this.w - v.w);
    return this;
  }

  /**
   * Scales this vector by a factor and modifies the original
   */
  public scaleEqual(size: number): Vector4 {
    this.setTo(this.x * size, this.y * size, this.z * size, this.w * size);
    return this;
  }

  /**
   * Performs a dot product with another vector
   */
  public dot(v: Vector4): number {
    return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
  }

  /**
   * Negates current vector
   */
  public negate(): Vector4 {
    return this.scale(-1);
  }

  /**
   * Transforms this vector using a 4x4 Matrix
   */
  public transform(matrix: Matrix, dest?: Vector4): Vector4 {
    const result = dest ?? new Vector4(0, 0, 0, 0);
    const d = matrix.data;
    const x = this.x,
      y = this.y,
      z = this.z,
      w = this.w;
    result.x = d[0] * x + d[4] * y + d[8] * z + d[12] * w;
    result.y = d[1] * x + d[5] * y + d[9] * z + d[13] * w;
    result.z = d[2] * x + d[6] * y + d[10] * z + d[14] * w;
    result.w = d[3] * x + d[7] * y + d[11] * z + d[15] * w;
    return result;
  }

  /**
   * Projects back down to 3D via perspective divide (x/w, y/w, z/w)
   */
  public toVector3(): Vector3 {
    if (this.w === 0 || this.w === 1) {
      return new Vector3(this.x, this.y, this.z);
    }
    return new Vector3(this.x / this.w, this.y / this.w, this.z / this.w);
  }

  /**
   * Creates new vector that has the same values as the previous.
   */
  public clone(dest?: Vector4): Vector4 {
    const v = dest ?? new Vector4(0, 0, 0, 0);
    v.x = this.x;
    v.y = this.y;
    v.z = this.z;
    v.w = this.w;
    return v;
  }

  /**
   * Returns a string representation of the vector.
   */
  public toString(fixed?: number): string {
    if (fixed !== undefined) {
      return `(${this.x.toFixed(fixed)}, ${this.y.toFixed(fixed)}, ${this.z.toFixed(fixed)}, ${this.w.toFixed(fixed)})`;
    }
    return `(${this.x}, ${this.y}, ${this.z}, ${this.w})`;
  }

  /**
   * Linearly interpolates between current vector and target vector.
   */
  public lerp(target: Vector4, t: number): Vector4 {
    t = clamp(t, 0, 1);
    return new Vector4(
      this.x + (target.x - this.x) * t,
      this.y + (target.y - this.y) * t,
      this.z + (target.z - this.z) * t,
      this.w + (target.w - this.w) * t
    );
  }

  /**
   * Copies components out into an array or Float32Array
   */
  public toArray(dest?: number[], offset?: number): number[];
  public toArray(dest: Float32Array, offset?: number): Float32Array;
  public toArray(dest: number[] | Float32Array = [], offset = 0): number[] | Float32Array {
    dest[offset] = this.x;
    dest[offset + 1] = this.y;
    dest[offset + 2] = this.z;
    dest[offset + 3] = this.w;
    return dest;
  }

  /**
   * Converts to a Float32Array suitable for WebGL uniforms
   */
  public toFloat32Array(): Float32Array {
    return new Float32Array([this.x, this.y, this.z, this.w]);
  }
}

/**
 * Shorthand for creating new 4D Vectors
 */
export function vec4(x: number, y: number, z: number, w: number): Vector4 {
  return new Vector4(x, y, z, w);
}
