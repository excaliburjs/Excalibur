export class Matrix {
  // 4x4 matrix in column major order
  // | data[0], data[4], data[8],  data[12] |
  // | data[1], data[5], data[9],  data[13] |
  // | data[2], data[6], data[10], data[14] |
  // | data[3], data[7], data[11], data[15] |
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

  public static translation(x: number, y: number, z: number = 0): Matrix {
    const mat = Matrix.identity();
    mat.data[12] = x;
    mat.data[13] = y;
    mat.data[14] = z;
    return mat;
  }

  public static scale(sx: number, sy: number): Matrix {
    const mat = Matrix.identity();
    mat.data[0] = sx;
    mat.data[5] = sy;
    return mat;
  }

  public static rotation(angleRadians: number): Matrix {
    const mat = Matrix.identity();
    mat.data[0] = Math.cos(angleRadians);
    mat.data[4] = -Math.sin(angleRadians);
    mat.data[1] = Math.sin(angleRadians);
    mat.data[5] = Math.cos(angleRadians);
    return mat;
  }

  multv(other: [number, number]): [number, number] {
    let dest: [number, number];
    let z = 0;
    dest = [
      other[0] * this.data[0] + other[1] * this.data[4] + z * this.data[6] + 1 * this.data[12],

      other[0] * this.data[1] + other[1] * this.data[5] + z * this.data[9] + 1 * this.data[13]
    ];
    return dest;
  }

  multm(other: Matrix): Matrix {
    const dest = new Matrix();
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

    dest.data[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
    dest.data[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
    dest.data[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
    dest.data[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;

    dest.data[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
    dest.data[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
    dest.data[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
    dest.data[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;

    dest.data[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
    dest.data[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
    dest.data[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
    dest.data[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;

    dest.data[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
    dest.data[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
    dest.data[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
    dest.data[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

    return dest;
  }
}
