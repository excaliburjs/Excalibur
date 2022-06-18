import { sign } from './util';
import { Vector, vec } from './vector';
import { canonicalizeAngle } from './util';

export enum MatrixLocations {
  X = 12,
  Y = 13
}

/**
 * Excalibur Matrix helper for 4x4 matrices
 *
 * Useful for webgl 4x4 matrices
 */
export class Matrix {
  /**
   *  4x4 matrix in column major order
   *
   * |         |         |          |          |
   * | ------- | ------- | -------- | -------- |
   * | data[0] | data[4] | data[8]  | data[12] |
   * | data[1] | data[5] | data[9]  | data[13] |
   * | data[2] | data[6] | data[10] | data[14] |
   * | data[3] | data[7] | data[11] | data[15] |
   *
   */
  public data: Float32Array = new Float32Array(16);

  /**
   * Creates an orthographic (flat non-perspective) projection
   * https://en.wikipedia.org/wiki/Orthographic_projection
   * @param left
   * @param right
   * @param bottom
   * @param top
   * @param near
   * @param far
   */
  public static ortho(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix {
    const mat = new Matrix();
    mat.data[0] = 2 / (right - left);
    mat.data[1] = 0;
    mat.data[2] = 0;
    mat.data[3] = 0;

    mat.data[4] = 0;
    mat.data[5] = 2 / (top - bottom);
    mat.data[6] = 0;
    mat.data[7] = 0;

    mat.data[8] = 0;
    mat.data[9] = 0;
    mat.data[10] = -2 / (far - near);
    mat.data[11] = 0;

    mat.data[12] = -(right + left) / (right - left);
    mat.data[13] = -(top + bottom) / (top - bottom);
    mat.data[14] = -(far + near) / (far - near);
    mat.data[15] = 1;
    return mat;
  }

  /**
   * Creates a new Matrix with the same data as the current 4x4
   */
  public clone(dest?: Matrix): Matrix {
    const mat = dest || new Matrix();
    mat.data[0] = this.data[0];
    mat.data[1] = this.data[1];
    mat.data[2] = this.data[2];
    mat.data[3] = this.data[3];

    mat.data[4] = this.data[4];
    mat.data[5] = this.data[5];
    mat.data[6] = this.data[6];
    mat.data[7] = this.data[7];

    mat.data[8] = this.data[8];
    mat.data[9] = this.data[9];
    mat.data[10] = this.data[10];
    mat.data[11] = this.data[11];

    mat.data[12] = this.data[12];
    mat.data[13] = this.data[13];
    mat.data[14] = this.data[14];
    mat.data[15] = this.data[15];
    return mat;
  }

  /**
   * Converts the current matrix into a DOMMatrix
   *
   * This is useful when working with the browser Canvas context
   * @returns {DOMMatrix} DOMMatrix
   */
  public toDOMMatrix(): DOMMatrix {
    return new DOMMatrix([...this.data]);
  }

  public static fromFloat32Array(data: Float32Array) {
    const matrix =  new Matrix();
    matrix.data = data;
    return matrix;
  }

  /**
   * Creates a new identity matrix (a matrix that when applied does nothing)
   */
  public static identity(): Matrix {
    const mat = new Matrix();
    mat.data[0] = 1;
    mat.data[1] = 0;
    mat.data[2] = 0;
    mat.data[3] = 0;

    mat.data[4] = 0;
    mat.data[5] = 1;
    mat.data[6] = 0;
    mat.data[7] = 0;

    mat.data[8] = 0;
    mat.data[9] = 0;
    mat.data[10] = 1;
    mat.data[11] = 0;

    mat.data[12] = 0;
    mat.data[13] = 0;
    mat.data[14] = 0;
    mat.data[15] = 1;
    return mat;
  }

  /**
   * Resets the current matrix to the identity matrix, mutating it
   * @returns {Matrix} Current matrix as identity
   */
  public reset(): Matrix {
    const mat = this;
    mat.data[0] = 1;
    mat.data[1] = 0;
    mat.data[2] = 0;
    mat.data[3] = 0;

    mat.data[4] = 0;
    mat.data[5] = 1;
    mat.data[6] = 0;
    mat.data[7] = 0;

    mat.data[8] = 0;
    mat.data[9] = 0;
    mat.data[10] = 1;
    mat.data[11] = 0;

    mat.data[12] = 0;
    mat.data[13] = 0;
    mat.data[14] = 0;
    mat.data[15] = 1;
    return mat;
  }

  /**
   * Creates a brand new translation matrix at the specified 3d point
   * @param x
   * @param y
   */
  public static translation(x: number, y: number): Matrix {
    const mat = Matrix.identity();
    mat.data[12] = x;
    mat.data[13] = y;
    return mat;
  }

  /**
   * Creates a brand new scaling matrix with the specified scaling factor
   * @param sx
   * @param sy
   */
  public static scale(sx: number, sy: number): Matrix {
    const mat = Matrix.identity();
    mat.data[0] = sx;
    mat.data[5] = sy;
    mat.data[10] = 1;
    mat.data[15] = 1;
    return mat;
  }

  /**
   * Creates a brand new rotation matrix with the specified angle
   * @param angleRadians
   */
  public static rotation(angleRadians: number): Matrix {
    const mat = Matrix.identity();
    mat.data[0] = Math.cos(angleRadians);
    mat.data[4] = -Math.sin(angleRadians);
    mat.data[1] = Math.sin(angleRadians);
    mat.data[5] = Math.cos(angleRadians);
    return mat;
  }

  /**
   * Multiply the current matrix by a vector producing a new vector
   * @param vector
   * @param dest
   */
  multiply(vector: Vector, dest?: Vector): Vector;
  /**
   * Multiply the current matrix by another matrix producing a new matrix
   * @param matrix
   * @param dest
   */
  multiply(matrix: Matrix, dest?: Matrix): Matrix;
  multiply(vectorOrMatrix: Vector | Matrix, dest?: Vector | Matrix): Vector | Matrix {
    if (vectorOrMatrix instanceof Vector) {
      const result = (dest as Vector) || new Vector(0, 0);
      const vector = vectorOrMatrix;
      // these shenanigans are to allow dest and vector to be the same instance
      const resultX = vector.x * this.data[0] + vector.y * this.data[4] + this.data[12];
      const resultY = vector.x * this.data[1] + vector.y * this.data[5] + this.data[13];

      result.x = resultX;
      result.y = resultY;
      return result;
    } else {
      const result = (dest as Matrix) || new Matrix();
      const other = vectorOrMatrix;
      const a11 = this.data[0];
      const a21 = this.data[1];
      const a31 = this.data[2];
      const a41 = this.data[3];

      const a12 = this.data[4];
      const a22 = this.data[5];
      const a32 = this.data[6];
      const a42 = this.data[7];

      const a13 = this.data[8];
      const a23 = this.data[9];
      const a33 = this.data[10];
      const a43 = this.data[11];

      const a14 = this.data[12];
      const a24 = this.data[13];
      const a34 = this.data[14];
      const a44 = this.data[15];

      const b11 = other.data[0];
      const b21 = other.data[1];
      const b31 = other.data[2];
      const b41 = other.data[3];

      const b12 = other.data[4];
      const b22 = other.data[5];
      const b32 = other.data[6];
      const b42 = other.data[7];

      const b13 = other.data[8];
      const b23 = other.data[9];
      const b33 = other.data[10];
      const b43 = other.data[11];

      const b14 = other.data[12];
      const b24 = other.data[13];
      const b34 = other.data[14];
      const b44 = other.data[15];

      result.data[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
      result.data[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
      result.data[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
      result.data[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;

      result.data[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
      result.data[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
      result.data[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
      result.data[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;

      result.data[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
      result.data[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
      result.data[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
      result.data[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;

      result.data[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
      result.data[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
      result.data[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
      result.data[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

      const s = this.getScale();
      result._scaleSignX = sign(s.x) * sign(result._scaleSignX);
      result._scaleSignY = sign(s.y) * sign(result._scaleSignY);

      return result;
    }
  }


  /**
   * Applies translation to the current matrix mutating it
   * @param x
   * @param y
   */
  translate(x: number, y: number) {
    const a11 = this.data[0];
    const a21 = this.data[1];
    const a31 = this.data[2];
    const a41 = this.data[3];

    const a12 = this.data[4];
    const a22 = this.data[5];
    const a32 = this.data[6];
    const a42 = this.data[7];

    const a13 = this.data[8];
    const a23 = this.data[9];
    const a33 = this.data[10];
    const a43 = this.data[11];

    const a14 = this.data[12];
    const a24 = this.data[13];
    const a34 = this.data[14];
    const a44 = this.data[15];

    // Doesn't change z
    const z = 0;
    const w = 1;
    this.data[12] = a11 * x + a12 * y + a13 * z + a14 * w;
    this.data[13] = a21 * x + a22 * y + a23 * z + a24 * w;
    this.data[14] = a31 * x + a32 * y + a33 * z + a34 * w;
    this.data[15] = a41 * x + a42 * y + a43 * z + a44 * w;

    return this;
  }

  public setPosition(x: number, y: number) {
    this.data[12] = x;
    this.data[13] = y;
  }

  public getPosition(): Vector {
    return vec(this.data[12], this.data[13]);
  }

  /**
   * Applies rotation to the current matrix mutating it
   * @param angle in Radians
   */
  rotate(angle: number) {
    const a11 = this.data[0];
    const a21 = this.data[1];
    const a31 = this.data[2];
    const a41 = this.data[3];

    const a12 = this.data[4];
    const a22 = this.data[5];
    const a32 = this.data[6];
    const a42 = this.data[7];

    const sine = Math.sin(angle);
    const cosine = Math.cos(angle);

    this.data[0] = cosine * a11 + sine * a12;
    this.data[1] = cosine * a21 + sine * a22;
    this.data[2] = cosine * a31 + sine * a32;
    this.data[3] = cosine * a41 + sine * a42;

    this.data[4] = cosine * a12 - sine * a11;
    this.data[5] = cosine * a22 - sine * a21;
    this.data[6] = cosine * a32 - sine * a31;
    this.data[7] = cosine * a42 - sine * a41;

    return this;
  }

  /**
   * Applies scaling to the current matrix mutating it
   * @param x
   * @param y
   */
  scale(x: number, y: number) {
    const a11 = this.data[0];
    const a21 = this.data[1];
    const a31 = this.data[2];
    const a41 = this.data[3];

    const a12 = this.data[4];
    const a22 = this.data[5];
    const a32 = this.data[6];
    const a42 = this.data[7];

    this.data[0] = a11 * x;
    this.data[1] = a21 * x;
    this.data[2] = a31 * x;
    this.data[3] = a41 * x;

    this.data[4] = a12 * y;
    this.data[5] = a22 * y;
    this.data[6] = a32 * y;
    this.data[7] = a42 * y;

    return this;
  }

  public setRotation(angle: number) {
    const currentScale = this.getScale();
    const sine = Math.sin(angle);
    const cosine = Math.cos(angle);

    this.data[0] = cosine * currentScale.x;
    this.data[1] = sine * currentScale.y;
    this.data[4] = -sine * currentScale.x;
    this.data[5] = cosine * currentScale.y;
  }

  public getRotation(): number {
    const angle = Math.atan2(this.data[1] / this.getScaleY(), this.data[0] / this.getScaleX());
    return canonicalizeAngle(angle);
  }

  public getScaleX(): number {
    // absolute scale of the matrix (we lose sign so need to add it back)
    const xscale = vec(this.data[0], this.data[4]).size;
    return this._scaleSignX * xscale;
  }

  public getScaleY(): number {
    // absolute scale of the matrix (we lose sign so need to add it back)
    const yscale = vec(this.data[1], this.data[5]).size;
    return this._scaleSignY * yscale;
  }

  /**
   * Get the scale of the matrix
   */
  public getScale(): Vector {
    return vec(this.getScaleX(), this.getScaleY());
  }

  private _scaleX = 1;
  private _scaleSignX = 1;
  public setScaleX(val: number) {
    if (this._scaleX === val) {
      return;
    }

    this._scaleSignX = sign(val);
    // negative scale acts like a 180 rotation, so flip
    const xscale = vec(this.data[0] * this._scaleSignX, this.data[4] * this._scaleSignX).normalize();
    this.data[0] = xscale.x * val;
    this.data[4] = xscale.y * val;
    this._scaleX = val;
  }

  private _scaleY = 1;
  private _scaleSignY = 1;
  public setScaleY(val: number) {
    if (this._scaleY === val) {
      return;
    }
    this._scaleSignY = sign(val);
    // negative scale acts like a 180 rotation, so flip
    const yscale = vec(this.data[1] * this._scaleSignY, this.data[5] * this._scaleSignY).normalize();
    this.data[1] = yscale.x * val;
    this.data[5] = yscale.y * val;
    this._scaleY = val;
  }

  public setScale(scale: Vector) {
    this.setScaleX(scale.x);
    this.setScaleY(scale.y);
  }

  /**
   * Determinant of the upper left 2x2 matrix
   */
  public getBasisDeterminant() {
    return this.data[0] * this.data[5] - this.data[1] * this.data[4];
  }

  /**
   * Return the affine inverse, optionally store it in a target matrix.
   *
   * It's recommended you call .reset() the target unless you know what you're doing
   * @param target
   */
  public getAffineInverse(target?: Matrix): Matrix {
    // See http://negativeprobability.blogspot.com/2011/11/affine-transformations-and-their.html
    // See https://www.mathsisfun.com/algebra/matrix-inverse.html
    // Since we are actually only doing 2D transformations we can use this hack
    // We don't actually use the 3rd or 4th dimension

    const det = this.getBasisDeterminant();
    const inverseDet = 1 / det; // todo zero check
    const a = this.data[0];
    const b = this.data[4];
    const c = this.data[1];
    const d = this.data[5];

    const m = target || Matrix.identity();
    // inverts rotation and scale
    m.data[0] = d * inverseDet;
    m.data[1] = -c * inverseDet;
    m.data[4] = -b * inverseDet;
    m.data[5] = a * inverseDet;

    const tx = this.data[12];
    const ty = this.data[13];
    // invert translation
    // transform translation into the matrix basis created by rot/scale
    m.data[12] = -(tx * m.data[0] + ty * m.data[4]);
    m.data[13] = -(tx * m.data[1] + ty * m.data[5]);

    return m;
  }

  public isIdentity(): boolean {
    return (
      this.data[0] === 1 &&
      this.data[1] === 0 &&
      this.data[2] === 0 &&
      this.data[3] === 0 &&
      this.data[4] === 0 &&
      this.data[5] === 1 &&
      this.data[6] === 0 &&
      this.data[7] === 0 &&
      this.data[8] === 0 &&
      this.data[9] === 0 &&
      this.data[10] === 1 &&
      this.data[11] === 0 &&
      this.data[12] === 0 &&
      this.data[13] === 0 &&
      this.data[14] === 0 &&
      this.data[15] === 1
    );
  }

  public toString() {
    return `
[${this.data[0]} ${this.data[4]} ${this.data[8]} ${this.data[12]}]
[${this.data[1]} ${this.data[5]} ${this.data[9]} ${this.data[13]}]
[${this.data[2]} ${this.data[6]} ${this.data[10]} ${this.data[14]}]
[${this.data[3]} ${this.data[7]} ${this.data[11]} ${this.data[15]}]
`;
  }
}
