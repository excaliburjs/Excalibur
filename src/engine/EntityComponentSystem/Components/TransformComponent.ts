import { vec, Vector } from '../../Algebra';
import { Matrix, MatrixLocations } from '../../Math/matrix';
import { VectorView } from '../../Math/vector-view';
import { Component } from '../Component';

const createPosView = (matrix: Matrix) => {
  const source = matrix;
  return new VectorView({
    setX: (x) => {
      source.data[MatrixLocations.X] = x;
    },
    setY: (y) => {
      source.data[MatrixLocations.Y] = y;
    },
    getX: () => {
      return source.data[MatrixLocations.X];
    },
    getY: () => {
      return source.data[MatrixLocations.Y];
    }
  });
};

const createScaleView = (matrix: Matrix) => {
  const source = matrix;
  return new VectorView({
    setX: (x) => {
      source.setScaleX(x);
    },
    setY: (y) => {
      source.setScaleY(y);
    },
    getX: () => {
      return source.getScaleX();
    },
    getY: () => {
      return source.getScaleY();
    }
  });
};

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

export class TransformComponent extends Component<'ex.transform'> {
  public readonly type = 'ex.transform';

  private _dirty = false;

  public readonly matrix = Matrix.identity().translate(0, 0).rotate(0).scale(1, 1);
  private _position = createPosView(this.matrix);
  private _rotation = 0;
  private _scale = createScaleView(this.matrix);

  private _recalculate() {
    this._rotation = this.matrix.getRotation();
    this._dirty = false;
  }

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
    const source = this.getGlobalMatrix();
    return new VectorView({
      getX: () => source.data[MatrixLocations.X],
      getY: () => source.data[MatrixLocations.Y],
      setX: (x) => {
        if (this.parent) {
          const [newX] = this.parent?.getGlobalMatrix().getAffineInverse().multv([x, source.data[MatrixLocations.Y]]);
          this.matrix.data[MatrixLocations.X] = newX;
        } else {
          this.matrix.data[MatrixLocations.X] = x;
        }
      },
      setY: (y) => {
        if (this.parent) {
          const [, newY] = this.parent?.getGlobalMatrix().getAffineInverse().multv([source.data[MatrixLocations.X], y]);
          this.matrix.data[MatrixLocations.Y] = newY;
        } else {
          this.matrix.data[MatrixLocations.Y] = y;
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
  }

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
  }

  public set scale(val: Vector) {
    this.matrix.setScale(val);
    this._dirty = true;
  }

  public get globalScale(): Vector {
    const source = this.getGlobalMatrix();
    return new VectorView({
      getX: () => source.getScaleX(),
      getY: () => source.getScaleY(),
      setX: (x) => {
        if (this.parent) {
          const globalScaleX = this.parent.globalScale.x;
          this.matrix.setScaleX(x / globalScaleX);
        } else {
          this.matrix.setScaleX(x);
        }
      },
      setY: (y) => {
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
