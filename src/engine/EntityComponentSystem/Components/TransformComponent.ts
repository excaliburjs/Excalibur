import { vec, Vector } from '../../Algebra';
import { Matrix } from '../../Math/matrix';
import { VectorView } from '../../Math/vector-view';
import { Component } from '../Component';

const createPosView = (matrix: Matrix) => {
  return new VectorView({
    data: matrix,
    setX: (source, x) => {
      source.data[12] = x;
    },
    setY: (source, y) => {
      source.data[13] = y;
    },
    getX: (source) => {
      return source.data[12];
    },
    getY: (source) => {
      return source.data[13];
    }
  });
}

const createScaleView = (matrix: Matrix) => {
  // let _dirty = true;
  // let scaleX = 1;
  // let scaleY = 1;
  // const _recalc = () => {
  //   scaleX = matrix.getScaleX();
  //   scaleY = matrix.getScaleY();
  //   _dirty = false;
  // }
  return new VectorView({
    data: matrix,
    setX: (source, x) => {
      source.setScaleX(x);
      // _dirty = true;
    },
    setY: (source, y) => {
      source.setScaleY(y);
      // _dirty = true;
    },
    getX: (source) => {
      // if (_dirty) {
      //   _recalc();
      // }
      return source.getScaleX();
    },
    getY: (source) => {
      // if (_dirty) {
      //   _recalc()
      // }
      return source.getScaleY();
    }
  });
}

/**
 * Enum representing the coordinate plane for the position 2D vector in the [[TransformComponent]]
 */
export enum CoordPlane {
  /**
   * The world coordinate plane (default) represents world space, any entities drawn with world
   * space move when the camera moves.
   */
  World = 'world',
  /**
   * The screen coordinate plane represents screen space, entities drawn in screen space are pinned
   * to screen coordinates ignoring the camera.
   */
  Screen = 'screen'
}

export class TransformComponent extends Component<'transform'> {
  public readonly type = 'transform';

  private _dirty = false;
  // private _globalDirty =  false;

  public readonly matrix = Matrix.identity()
    .translate(0, 0)
    .rotate(0)
    .scale(1, 1)
  private _position = createPosView(this.matrix);
  private _rotation = 0;
  private _scale = createScaleView(this.matrix);


  private _recalculate() {
    // this._position = new VectorMatrixPosView(this._mat);
    this._rotation = this.matrix.getRotation();
    // this._scale = new VectorMatrixScaleView(this._mat);
    this._dirty = false;
  }

  // private _globalMat: Matrix;
  // private _recalculateGlobal() {
  //   this._globalMat = this.getGlobalMatrix();
  //   this._globalDirty = false;
  // }

  public getGlobalMatrix(): Matrix {
    if (!this.parent) {
      return this.matrix;
    } else {
      return this.parent.getGlobalMatrix().multm(this.matrix);
    }
  }

  public get parent(): TransformComponent | null {
    return this?.owner?.parent?.get(TransformComponent);
  }

  /**
   * The [[CoordPlane|coordinate plane|]] for this transform for the entity.
   */
  public coordPlane = CoordPlane.World;


  /**
   * The current position of the entity in world space or in screen space depending on the the [[coordinate plan|CoordPlane]].
   *
   * If a parent entity exists coordinates are local to the parent.
   */
  public get pos(): Vector {
    if (this._dirty) {
      this._recalculate();
    }
    return this._position;
  }

  public set pos(val: Vector) {
    this.matrix.setPosition(val.x, val.y);
    this._dirty = true;
  }

  // Dirty flag check up the chain
  public get dirty(): boolean {
    if (this?.owner?.parent) {
      const parent = this.parent;
      return parent.dirty || this._dirty;
    }
    return this._dirty;
  }

  /**
   * The current world position calculated
   */
  public get globalPos(): Vector {
    return new VectorView({
      data: this.getGlobalMatrix(),
      getX: (source) => source.data[12],
      getY: (source) => source.data[13],
      setX: (source, x) => {
        if (this.parent) {
          const [ newX ] = this.parent?.getGlobalMatrix().getAffineInverse().multv([x, source.data[13]]);
          this.matrix.data[12] = newX;
        } else {
          this.matrix.data[12] = x;
        }
      },
      setY: (source, y) => {
        if (this.parent) {
          const [, newY ] = this.parent?.getGlobalMatrix().getAffineInverse().multv([source.data[12], y]);
          this.matrix.data[13] = newY;
        } else {
          this.matrix.data[13] = y;
        }
      }
    });
  }

  public set globalPos(val: Vector) {
    const parentTransform = this.parent;
    if (!parentTransform) {
      this.pos = val;
    } else {
      this.pos = parentTransform.getGlobalMatrix().getAffineInverse().multv(val);
    }
  }

  /**
   * The z-index ordering of the entity, a higher values are drawn on top of lower values.
   * For example z=99 would be drawn on top of z=0.
   */
  public z: number = 0;

  /**
   * The rotation of the entity in radians. For example `Math.PI` radians is the same as 180 degrees.
   */
  public get rotation(): number {
    if (this._dirty) {
      this._recalculate();
    }
    return this._rotation;
  };

  public set rotation(val: number) {
    this.matrix.setRotation(val);
    this._dirty = true;
  }


  public get globalRotation(): number {
    return this.getGlobalMatrix().getRotation();
  }

  public set globalRotation(val: number) {
    const parentTransform = this.parent;
    if (!parentTransform) {
      this.rotation = val;
    } else {
      this.rotation = val - parentTransform.globalRotation;
    }
  }

  /**
   * The scale of the entity.
   */
  public get scale(): Vector {
    if (this._dirty) {
      this._recalculate();
    }
    return this._scale;
  };

  public set scale(val: Vector) {
    this.matrix.setScale(val);
    this._dirty = true;
  }

  public get globalScale(): Vector {
    return new VectorView({
      data: this.getGlobalMatrix(),
      getX: (source) => source.getScaleX(),
      getY: (source) => source.getScaleY(),
      setX: (_, x) => {
        if (this.parent) {
          const globalScaleX = this.parent.globalScale.x;
          this.matrix.setScaleX(x / globalScaleX);
        } else {
          this.matrix.setScaleX(x);
        }
      },
      setY: (_, y) => {
        if (this.parent) {
          const globalScaleY = this.parent.globalScale.y;
          this.matrix.setScaleY(y / globalScaleY);
        } else {
          this.matrix.setScaleY(y);
        }
      }
    });
  }

  public set globalScale(val: Vector) {
    const parentTransform = this.parent;
    if (!parentTransform) {
      this.scale = val;
    } else {
      this.scale = vec(val.x / parentTransform.globalScale.x, val.y / parentTransform.globalScale.y);
    }
  }
}
