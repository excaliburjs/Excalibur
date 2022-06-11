import { watch } from "../Util/Watch";
import { AffineMatrix } from "./affine-matrix";
import { canonicalizeAngle } from "./util";
import { vec, Vector } from "./vector";
import { VectorView } from "./vector-view";

export class Transform {
  constructor(matrix?: AffineMatrix) {
    if (matrix) {
      this.pos = matrix.getPosition();
      this.rotation = matrix.getRotation();
      this.scale = matrix.getScale();
    }
  }
  private _parent: Transform | null = null;
  get parent() {
    return this._parent;
  }
  set parent(transform: Transform) {
    if (this._parent) {
      const index = this._parent.children.indexOf(this);
      if (index > -1) {
        this._parent.children.splice(index, 1);
      }
    }
    this._parent = transform;
    if (this._parent) {
      this._parent.children.push(this);
    }
    this.flagDirty();
  }
  private children: Transform[] = [];

  private _pos: Vector = watch(vec(0, 0), () => this.flagDirty());
  set pos(v: Vector) {
    if (!v.equals(this._pos)) {
      this.flagDirty();
    }
    this._pos = watch(v, () => this.flagDirty());
  }
  get pos() {
    return this._pos;
  }

  set globalPos(v: Vector) {
    let localPos = v;
    if (this.parent) {
      localPos = this.parent.inverse.multiply(v);
    }
    this._pos = watch(localPos, () => this.flagDirty());
    this.flagDirty();
  }
  get globalPos() {
    // if (this.parent) {
    //   return this.matrix.getPosition();
    // }
    // return this.pos;
    return new VectorView({
      getX: () => this.matrix.data[4],
      getY: () => this.matrix.data[5],
      setX: (x) => {
        const oldX = this.pos.x;
        if (this.parent) {
          const { x: newX } = this.parent.inverse.multiply(vec(x, this.pos.y));
          this.pos.x = newX
        } else {
          this.pos.x = x;
        }
        if (oldX !== this.pos.x) {
          this.flagDirty();
        }
      },
      setY: (y) => {
        const oldY = this.pos.y;
        if (this.parent) {
          const { y: newY } = this.parent.inverse.multiply(vec(this.pos.x, y));
          this.pos.y = newY;
        } else {
          this.pos.y = y;
        }
        if (oldY !== this.pos.y) {
          this.flagDirty();
        }
      }
    });
  }

  private _rotation: number = 0;
  set rotation(rotation: number) {
    this._rotation = canonicalizeAngle(rotation);
    this.flagDirty();
  }
  get rotation() {
    return this._rotation;
  }

  set globalRotation(rotation: number) {
    let inverseRotation = 0;
    if (this.parent) {
      inverseRotation = this.parent.globalRotation;
    }
    this._rotation = rotation + inverseRotation;
  }

  get globalRotation() {
    if (this.parent) {
      return this.matrix.getRotation();
    }
    return this.rotation;
  }

  private _scale: Vector = watch(vec(1, 1), () => this.flagDirty());
  set scale(v: Vector) {
    this._scale = watch(v, () => this.flagDirty());
    this.flagDirty();
  }
  get scale() {
    return this._scale;
  }

  set globalScale(v: Vector) {
    let inverseScale = vec(1, 1);
    if (this.parent) {
      inverseScale = this.parent.globalScale;
    }
    this.scale = v.scale(vec(1 / inverseScale.x, 1 / inverseScale.y))
  }

  get globalScale() {
    // if (this.parent) {
    //   return this.matrix.getScale();
    // }
    // return this.scale;

    return new VectorView({
      getX: () => this.parent ? this.matrix.getScaleX() : this.scale.x,
      getY: () => this.parent ? this.matrix.getScaleY() : this.scale.y,
      setX: (x) => {
        if (this.parent) {
          const globalScaleX = this.parent.globalScale.x;
          this.scale.x = x / globalScaleX;
        } else {
          this.scale.x = x;
        }
      },
      setY: (y) => {
        if (this.parent) {
          const globalScaleY = this.parent.globalScale.y;
          this.scale.y = y / globalScaleY;
        } else {
          this.scale.y = y;
        }
      }
    });
  }

  private _isDirty = false;
  private _isInverseDirty = false;
  private _matrix = AffineMatrix.identity();
  private _inverse = AffineMatrix.identity();

  public get matrix() {
    if (this._isDirty) {
      if (this.parent === null) {
        this._matrix = this._calculateMatrix();
      } else {
        this._matrix = this.parent.matrix.multiply(this._calculateMatrix());
      }
      this._isDirty = false;
    }
    return this._matrix;
  }

  public get inverse() {
    if (this._isInverseDirty) {
      this._inverse = this.matrix.inverse();
      this._isInverseDirty = false;
    }
    return this._inverse;
  }

  private _calculateMatrix(): AffineMatrix {
    // const matrix = new AffineMatrix();
    // TODO not positive this is correct
    // const sine = Math.sin(this.rotation);
    // const cosine = Math.cos(this.rotation);
    // matrix.data[0] = this.scale.x * cosine;
    // matrix.data[1] = sine;

    // matrix.data[2] = -sine;
    // matrix.data[3] = this.scale.y * cosine;

    // matrix.data[4] = this.pos.x;
    // matrix.data[5] = this.pos.y;
    // return matrix;
    const matrix = AffineMatrix.identity()
      .translate(this.pos.x, this.pos.y)
      .rotate(this.rotation)
      .scale(this.scale.x, this.scale.y);
    return matrix;
  }


  public flagDirty() {
    this._isDirty = true;
    this._isInverseDirty = true;
    for (let i = 0; i < this.children.length; i ++) {
      this.children[i].flagDirty();
    }
  }

  public apply(point: Vector): Vector {
    return this.matrix.multiply(point);
  }

  public applyInverse(point: Vector): Vector {
    return this.inverse.multiply(point);
  }

  public clone(dest?: Transform) {
    const target = dest ?? new Transform();
    this._pos.clone(target.pos);
    target._rotation = this._rotation;
    this._scale.clone(target._scale);
    this._matrix.clone(target._matrix);
    this._inverse.clone(target._inverse);
  }
}