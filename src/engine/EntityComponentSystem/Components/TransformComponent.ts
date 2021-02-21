import { vec, Vector } from '../../Algebra';
import { Matrix } from '../../Math/matrix';
import { Component } from '../Component';

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
  private _globalDirty =  false;
  private _position = Vector.Zero;
  private _scale = Vector.One;
  private _rotation = 0;
  private _mat = Matrix.identity()
    .translate(0, 0)
    .rotate(0)
    .scale(1, 1)

  public get matrix(): Matrix {
    return this._mat;
  }

  private _recalculate() {
    this._position = this._mat.getPosition();
    this._rotation = this._mat.getRotation();
    this._scale = this._mat.getScale();
    this._dirty = false;
  }

  private _globalMat: Matrix;
  private _globalPos = Vector.Zero;
  private _globalRotation = 0;
  private _globalScale = Vector.One;
  private _recalculateGlobal() {
    this._globalMat = this.getMatrix();
    this._globalPos = this._globalMat.getPosition();
    this._globalRotation = this._globalMat.getRotation();
    this._globalScale = this._globalMat.getScale();
    this._globalDirty = false;
  }

  public getMatrix(): Matrix {
    if (!this.parent) {
      return this.matrix;
    } else {
      return this.parent.getMatrix().multm(this.matrix);
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
    this._mat.setPosition(val.x, val.y);
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
    if (this._globalDirty || this.dirty) {
      this._recalculateGlobal();
    }
    return this._globalPos;
  }

  public set globalPos(val: Vector) {
    const parentTransform = this.parent;
    if (!parentTransform) {
      this.pos = val;
    } else {
      this.pos = parentTransform.getMatrix().getAffineInverse().multv(val);
    }
    this._globalDirty = true;
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
    this._mat.setRotation(val);
    this._dirty = true;
  }


  public get globalRotation(): number {
    if (this._globalDirty || this.dirty) {
      this._recalculateGlobal();
    }
    return this._globalRotation;
  }

  public set globalRotation(val: number) {
    const parentTransform = this.parent;
    if (!parentTransform) {
      this.rotation = val;
    } else {
      this.rotation = val - parentTransform.globalRotation;
    }
    this._globalDirty = true;
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
    this._mat.setScale(val);
    this._dirty = true;
  }

  public get globalScale(): Vector {
    if (this._globalDirty || this.dirty) {
      this._recalculateGlobal();
    }
    return this._globalScale;
  }

  public set globalScale(val: Vector) {
    const parentTransform = this.parent;
    if (!parentTransform) {
      this.scale = val;
    } else {
      this.scale = vec(val.x / parentTransform.globalScale.x, val.y / parentTransform.globalScale.y);
    }
    this._globalDirty = true;
  }
}
