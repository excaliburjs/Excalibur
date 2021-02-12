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

  public matrix: Matrix;
  public get parent(): TransformComponent | null {
    return this?.owner?.parent?.get(TransformComponent);
  }

  /**
   * The [[coordinate plane|CoordPlane]] for this transform for the entity.
   */
  public coordPlane = CoordPlane.World;

  
  /**
   * The current position of the entity in world space or in screen space depending on the the [[coordinate plan|CoordPlane]].
   * 
   * If a parent entity exists coordinates are local to the parent.
   */
  public pos: Vector = Vector.Zero

  // Dirty flag check up the chain
  private _dirty = true;
  private get dirty(): boolean {
    if (this?.owner?.parent) {
      const parent = this.parent;
      return parent.dirty || this._dirty;
    }
    return this._dirty;
  }

  private _worldPos = Vector.Zero;
  /**
   * The current world position calculated 
   */
  public get worldPos(): Vector {
    // No parent return early
    let parent = this?.owner?.parent;
    if (!parent) {
      return this._worldPos = this.pos;
    }

    if (!this.dirty) {
      return this._worldPos;
      // TODO if x/y updated directly we don't know :(
    }

    let currentPos = this.pos.clone();
    while (parent) {
      const parentTransform = parent.get(TransformComponent);
      if (parentTransform) {
        currentPos = currentPos.add(parentTransform.pos);
        parent = parent.parent;
      } else {
        break;
      }
    }
    this._dirty = false;
    return this._worldPos = currentPos;
  }

  public set worldPos(val: Vector) {
    this._dirty = true;
    const parentTransform = this.parent
    if (!parentTransform) {
      this.pos = val;
    } else {
      this.pos = val.sub(parentTransform.worldPos);
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
  public rotation: number = 0;

  public get worldRotation(): number {
    // No parent return early
    let parent = this?.owner?.parent;
    if (!parent) {
      return this.rotation;
    }

    let currentRotation = this.rotation;
    while (parent) {
      const parentTransform = parent.get(TransformComponent);
      if (parentTransform) {
        currentRotation += parentTransform.rotation;
        parent = parent.parent;
      } else {
        break;
      }
    }
    return currentRotation;
  }

  public set worldRotation(val: number) {
    let parentTransform = this.parent;
    if (!parentTransform) {
      this.rotation = val;
    } else {
      this.rotation = val - parentTransform.worldRotation;
    }
  }

  /**
   * The scale of the entity.
   */
  public scale: Vector = Vector.One;

  public get worldScale(): Vector {
    // No parent return early
    let parent = this?.owner?.parent;
    if (!parent) {
      return this.scale;
    }

    let currentScale = this.scale;
    while (parent) {
      const parentTransform = parent.get(TransformComponent);
      if (parentTransform) {
        currentScale = currentScale.add(parentTransform.scale);
        parent = parent.parent;
      } else {
        break;
      }
    }
    return currentScale;
  }

  public set worldScale(val: Vector) {
    const parentTransform = this.parent;
    if (!parentTransform) {
      this.scale = val;
    } else {
      this.scale = vec(val.x / parentTransform.worldScale.x, val.y / parentTransform.worldScale.y);
    }
  }
}
