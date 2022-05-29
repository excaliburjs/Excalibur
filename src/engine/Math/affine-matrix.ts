import { canonicalizeAngle, sign } from "./util";
import { vec, Vector } from "./vector";


export class AffineMatrix {
  /**
   * |         |         |          |
   * | ------- | ------- | -------- |
   * | data[0] | data[2] | data[4]  |
   * | data[1] | data[3] | data[5]  |
   */
  public data = new Float32Array(6);

  public static identity(): AffineMatrix {
    const mat = new AffineMatrix();
    mat.data[0] = 1;
    mat.data[1] = 0;

    mat.data[2] = 0;
    mat.data[3] = 1;

    mat.data[4] = 1;
    mat.data[5] = 1;
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
    const b = this.data[4];
    const c = this.data[1];
    const d = this.data[5];

    const m = target || AffineMatrix.identity();
    // inverts rotation and scale
    m.data[0] = d * inverseDet;
    m.data[1] = -c * inverseDet;
    m.data[2] = -b * inverseDet;
    m.data[3] = a * inverseDet;

    const tx = this.data[12];
    const ty = this.data[13];
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

       const a12 = this.data[2];
       const a22 = this.data[3];

       const a13 = this.data[4];
       const a23 = this.data[5];

       const b11 = other.data[0];
       const b21 = other.data[1];

       const b12 = other.data[2];
       const b22 = other.data[3];

       const b13 = other.data[4];
       const b23 = other.data[5];

       result.data[0] = a11 * b11 + a12 * b21 + a13;
       result.data[1] = a21 * b11 + a22 * b21 + a23;
 
       result.data[2] = a11 * b12 + a12 * b22 + a13;
       result.data[3] = a21 * b12 + a22 * b22 + a23;
 
       result.data[4] = a11 * b13 + a12 * b23 + a13;
       result.data[5] = a21 * b13 + a22 * b23 + a23;
 
       const s = this.getScale();
       result._scaleSignX = sign(s.x) * sign(result._scaleSignX);
       result._scaleSignY = sign(s.y) * sign(result._scaleSignY);
 
       return result;
     }
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
    const xscale = vec(this.data[0], this.data[2]).size;
    return this._scaleSignX * xscale;
  }

  public getScaleY(): number {
    // absolute scale of the matrix (we lose sign so need to add it back)
    const yscale = vec(this.data[1], this.data[3]).size;
    return this._scaleSignY * yscale;
  }

  /**
   * Get the scale of the matrix
   */
  public getScale(): Vector {
    return vec(this.getScaleX(), this.getScaleY());
  }

  private _scaleSignX = 1;
  public setScaleX(val: number) {
    this._scaleSignX = sign(val);
    // negative scale acts like a 180 rotation, so flip
    const xscale = vec(this.data[0] * this._scaleSignX, this.data[2] * this._scaleSignX).normalize();
    this.data[0] = xscale.x * val;
    this.data[2] = xscale.y * val;
  }

  private _scaleSignY = 1;
  public setScaleY(val: number) {
    this._scaleSignY = sign(val);
    // negative scale acts like a 180 rotation, so flip
    const yscale = vec(this.data[1] * this._scaleSignY, this.data[3] * this._scaleSignY).normalize();
    this.data[1] = yscale.x * val;
    this.data[3] = yscale.y * val;
  }

  public setScale(scale: Vector) {
    this.setScaleX(scale.x);
    this.setScaleY(scale.y);
  }

}