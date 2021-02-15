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


  private _mat = Matrix.identity()
    .translate(0, 0)
    .rotate(0)
    .scale(1, 1)

  public get matrix(): Matrix {
    return this._mat;
  }

  public getGlobalMatrix(): Matrix {
    // todo if parent is not dirty or matrix is not dirty we can cache
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
    return this._mat.getPosition();
  }

  public set pos(val: Vector) {
    this._mat.setPosition(val.x, val.y);
  }

  // Dirty flag check up the chain
  private _dirty = true;
  private get dirty(): boolean {
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
    return this.getGlobalMatrix().getPosition();
  }

  public set globalPos(val: Vector) {
    this._dirty = true;
    const parentTransform = this.parent
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
    return this._mat.getRotation();
  };

  public set rotation(val: number) {
    this._mat.setRotation(val);
  }
  

  public get globalRotation(): number {
    return this.getGlobalMatrix().getRotation();
  }

  public set globalRotation(val: number) {
    let parentTransform = this.parent;
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
    return this._mat.getScale();
  };

  public set scale(val: Vector) {
    this._mat.setScale(val);
  }

  public get globalScale(): Vector {
    return this.getGlobalMatrix().getScale();
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
