import { Matrix } from './matrix';
import { canonicalizeAngle, sign } from './util';
import { vec, Vector } from './vector';


export class AffineMatrix {
  /**
   * |         |         |          |
   * | ------- | ------- | -------- |
   * | data[0] | data[2] | data[4]  |
   * | data[1] | data[3] | data[5]  |
   * |   0     |    0    |    1     |
   */
  public data = new Float64Array(6);

  /**
   * Converts the current matrix into a DOMMatrix
   *
   * This is useful when working with the browser Canvas context
   * @returns {DOMMatrix} DOMMatrix
   */
  public toDOMMatrix(): DOMMatrix {
    return new DOMMatrix([...this.data]);
  }

  public static identity(): AffineMatrix {
    const mat = new AffineMatrix();
    mat.data[0] = 1;
    mat.data[1] = 0;

    mat.data[2] = 0;
    mat.data[3] = 1;

    mat.data[4] = 0;
    mat.data[5] = 0;
    return mat;
  }

  /**
   * Creates a brand new translation matrix at the specified 3d point
   * @param x
   * @param y
   */
  public static translation(x: number, y: number): AffineMatrix {
    const mat = AffineMatrix.identity();
    mat.data[4] = x;
    mat.data[5] = y;
    return mat;
  }

  /**
   * Creates a brand new scaling matrix with the specified scaling factor
   * @param sx
   * @param sy
   */
  public static scale(sx: number, sy: number): AffineMatrix {
    const mat = AffineMatrix.identity();
    mat.data[0] = sx;
    mat.data[3] = sy;
    mat._scale[0] = sx;
    mat._scale[1] = sy;
    return mat;
  }

  /**
   * Creates a brand new rotation matrix with the specified angle
   * @param angleRadians
   */
  public static rotation(angleRadians: number): AffineMatrix {
    const mat = AffineMatrix.identity();
    mat.data[0] = Math.cos(angleRadians);
    mat.data[1] = Math.sin(angleRadians);
    mat.data[2] = -Math.sin(angleRadians);
    mat.data[3] = Math.cos(angleRadians);
    return mat;
  }

  public setPosition(x: number, y: number) {
    this.data[4] = x;
    this.data[5] = y;
  }

  public getPosition(): Vector {
    return vec(this.data[4], this.data[5]);
  }

  /**
   * Applies rotation to the current matrix mutating it
   * @param angle in Radians
   */
  rotate(angle: number) {
    const a11 = this.data[0];
    const a21 = this.data[1];

    const a12 = this.data[2];
    const a22 = this.data[3];

    const sine = Math.sin(angle);
    const cosine = Math.cos(angle);

    this.data[0] = cosine * a11 + sine * a12;
    this.data[1] = cosine * a21 + sine * a22;

    this.data[2] = cosine * a12 - sine * a11;
    this.data[3] = cosine * a22 - sine * a21;

    return this;
  }

  /**
   * Applies translation to the current matrix mutating it
   * @param x
   * @param y
   */
  translate(x: number, y: number) {
    const a11 = this.data[0];
    const a21 = this.data[1];
    // const a31 = 0;

    const a12 = this.data[2];
    const a22 = this.data[3];
    // const a32 = 0;

    const a13 = this.data[4];
    const a23 = this.data[5];
    // const a33 = 1;

    // Doesn't change z
    this.data[4] = a11 * x + a12 * y + a13;
    this.data[5] = a21 * x + a22 * y + a23;

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

    const a12 = this.data[2];
    const a22 = this.data[3];

    this.data[0] = a11 * x;
    this.data[1] = a21 * x;

    this.data[2] = a12 * y;
    this.data[3] = a22 * y;

    this._scale[0] = x;
    this._scale[1] = y;
    return this;
  }

  public determinant() {
    return this.data[0] * this.data[3] - this.data[1] * this.data[2];
  }

  /**
   * Return the affine inverse, optionally store it in a target matrix.
   *
   * It's recommended you call .reset() the target unless you know what you're doing
   * @param target
   */
  public inverse(target?: AffineMatrix): AffineMatrix {
    // See http://negativeprobability.blogspot.com/2011/11/affine-transformations-and-their.html
    // See https://www.mathsisfun.com/algebra/matrix-inverse.html
    // Since we are actually only doing 2D transformations we can use this hack
    // We don't actually use the 3rd or 4th dimension

    const det = this.determinant();
    const inverseDet = 1 / det; // TODO zero check
    const a = this.data[0];
    const b = this.data[2];
    const c = this.data[1];
    const d = this.data[3];

    const m = target || AffineMatrix.identity();
    // inverts rotation and scale
    m.data[0] = d * inverseDet;
    m.data[1] = -c * inverseDet;
    m.data[2] = -b * inverseDet;
    m.data[3] = a * inverseDet;

    const tx = this.data[4];
    const ty = this.data[5];
    // invert translation
    // transform translation into the matrix basis created by rot/scale
    m.data[4] = -(tx * m.data[0] + ty * m.data[2]);
    m.data[5] = -(tx * m.data[1] + ty * m.data[3]);

    return m;
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
  multiply(matrix: AffineMatrix, dest?: AffineMatrix): AffineMatrix;
  multiply(vectorOrMatrix: Vector | AffineMatrix, dest?: Vector | AffineMatrix): Vector | AffineMatrix {
    if (vectorOrMatrix instanceof Vector) {
      const result = (dest as Vector) || new Vector(0, 0);
      const vector = vectorOrMatrix;
      // these shenanigans are to allow dest and vector to be the same instance
      const resultX = vector.x * this.data[0] + vector.y * this.data[2] + this.data[4];
      const resultY = vector.x * this.data[1] + vector.y * this.data[3] + this.data[5];

      result.x = resultX;
      result.y = resultY;
      return result;
    } else {
      const result = (dest as AffineMatrix) || new AffineMatrix();
      const other = vectorOrMatrix;
      const a11 = this.data[0];
      const a21 = this.data[1];
      //  const a31 = 0;

      const a12 = this.data[2];
      const a22 = this.data[3];
      //  const a32 = 0;

      const a13 = this.data[4];
      const a23 = this.data[5];
      //  const a33 = 1;

      const b11 = other.data[0];
      const b21 = other.data[1];
      //  const b31 = 0;

      const b12 = other.data[2];
      const b22 = other.data[3];
      //  const b32 = 0;

      const b13 = other.data[4];
      const b23 = other.data[5];
      //  const b33 = 1;


      result.data[0] = a11 * b11 + a12 * b21;// + a13 * b31; // zero
      result.data[1] = a21 * b11 + a22 * b21;// + a23 * b31; // zero

      result.data[2] = a11 * b12 + a12 * b22;// + a13 * b32; // zero
      result.data[3] = a21 * b12 + a22 * b22;// + a23 * b32; // zero

      result.data[4] = a11 * b13 + a12 * b23 + a13;// * b33; // one
      result.data[5] = a21 * b13 + a22 * b23 + a23;// * b33; // one

      const s = this.getScale();
      result._scaleSignX = sign(s.x) * sign(result._scaleSignX);
      result._scaleSignY = sign(s.y) * sign(result._scaleSignY);

      return result;
    }
  }

  to4x4() {
    const mat = new Matrix();
    mat.data[0] = this.data[0];
    mat.data[1] = this.data[1];
    mat.data[2] = 0;
    mat.data[3] = 0;

    mat.data[4] = this.data[2];
    mat.data[5] = this.data[3];
    mat.data[6] = 0;
    mat.data[7] = 0;

    mat.data[8] = 0;
    mat.data[9] = 0;
    mat.data[10] = 1;
    mat.data[11] = 0;

    mat.data[12] = this.data[4];
    mat.data[13] = this.data[5];
    mat.data[14] = 0;
    mat.data[15] = 1;
    return mat;
  }

  public setRotation(angle: number) {
    const currentScale = this.getScale();
    const sine = Math.sin(angle);
    const cosine = Math.cos(angle);

    this.data[0] = cosine * currentScale.x;
    this.data[1] = sine * currentScale.y;
    this.data[2] = -sine * currentScale.x;
    this.data[3] = cosine * currentScale.y;
  }

  public getRotation(): number {
    const angle = Math.atan2(this.data[1] / this.getScaleY(), this.data[0] / this.getScaleX());
    return canonicalizeAngle(angle);
  }

  public getScaleX(): number {
    // absolute scale of the matrix (we lose sign so need to add it back)
    const xscale = vec(this.data[0], this.data[2]).distance();
    return this._scaleSignX * xscale;
  }

  public getScaleY(): number {
    // absolute scale of the matrix (we lose sign so need to add it back)
    const yscale = vec(this.data[1], this.data[3]).distance();
    return this._scaleSignY * yscale;
  }

  /**
   * Get the scale of the matrix
   */
  public getScale(): Vector {
    return vec(this.getScaleX(), this.getScaleY());
  }

  private _scale = new Float64Array([1, 1]);
  private _scaleSignX = 1;
  public setScaleX(val: number) {
    if (val === this._scale[0]) {
      return;
    }
    this._scaleSignX = sign(val);
    // negative scale acts like a 180 rotation, so flip
    const xscale = vec(this.data[0] * this._scaleSignX, this.data[2] * this._scaleSignX).normalize();
    this.data[0] = xscale.x * val;
    this.data[2] = xscale.y * val;
    this._scale[0] = val;
  }

  private _scaleSignY = 1;
  public setScaleY(val: number) {
    if (val === this._scale[1]) {
      return;
    }
    this._scaleSignY = sign(val);
    // negative scale acts like a 180 rotation, so flip
    const yscale = vec(this.data[1] * this._scaleSignY, this.data[3] * this._scaleSignY).normalize();
    this.data[1] = yscale.x * val;
    this.data[3] = yscale.y * val;
    this._scale[1] = val;
  }

  public setScale(scale: Vector) {
    this.setScaleX(scale.x);
    this.setScaleY(scale.y);
  }

  public isIdentity(): boolean {
    return (
      this.data[0] === 1 &&
      this.data[1] === 0 &&
      this.data[2] === 0 &&
      this.data[3] === 1 &&
      this.data[4] === 0 &&
      this.data[5] === 0
    );
  }

  /**
   * Resets the current matrix to the identity matrix, mutating it
   * @returns {AffineMatrix} Current matrix as identity
   */
  public reset(): AffineMatrix {
    const mat = this;
    mat.data[0] = 1;
    mat.data[1] = 0;

    mat.data[2] = 0;
    mat.data[3] = 1;

    mat.data[4] = 0;
    mat.data[5] = 0;
    return mat;
  }

  /**
   * Creates a new Matrix with the same data as the current 4x4
   */
  public clone(dest?: AffineMatrix): AffineMatrix {
    const mat = dest || new AffineMatrix();
    mat.data[0] = this.data[0];
    mat.data[1] = this.data[1];

    mat.data[2] = this.data[2];
    mat.data[3] = this.data[3];

    mat.data[4] = this.data[4];
    mat.data[5] = this.data[5];
    return mat;
  }

  public toString() {
    return `
[${this.data[0]} ${this.data[2]} ${this.data[4]}]
[${this.data[1]} ${this.data[3]} ${this.data[5]}]
[0 0 1]
`;
  }

}