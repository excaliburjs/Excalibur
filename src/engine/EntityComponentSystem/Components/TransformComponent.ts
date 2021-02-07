import { Vector } from '../../Algebra';
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

  public get parent(): TransformComponent | null {
    return this?.owner?.parent?.get<TransformComponent>('transform');
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
  // public get pos(): Vector {
  //   return this._pos;
  //   // TODO if x/y updated directly we don't know :(
  // }

  // public set pos(val: Vector) {
  //   this._dirty = true;
  //   this._pos = val;
  // }
  

  // Dirty flag check up the chain
  private _dirty = true;
  private get dirty(): boolean {
    if (this?.owner?.parent) {
      const parent = this?.owner?.parent?.get<TransformComponent>('transform');
      return parent.dirty || this._dirty;
    }
    return this._dirty;
  }
  // private get _parentDirty() {
  //   if (this?.owner?.parent) {
  //     const parent = this?.owner?.parent?.get<TransformComponent>('transform');
  //     return parent._dirty;
  //   }
  //   return false;
  // }
  private _worldPos = Vector.Zero;
  /**
   * The current world position calculated 
   */
  public get worldPos(): Vector {
    let parent = this?.owner?.parent;
    if (!parent) {
      return this._worldPos = this.pos;
    }

    if (!this.dirty) {
      return this._worldPos;
      // TODO if x/y updated directly we don't know :(
    }
    // return this.pos.clone();
    let currentPos = this.pos.clone();
    while (parent) {
      const parentTransform = parent.get<TransformComponent>('transform');
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
    let parent = this?.owner?.parent;
    if (!parent) {
      this.pos = val;
    } else {
      
    }
    // this.pos = this.worldPos.sub(val);
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
    return this.rotation;
  }

  /**
   * The scale of the entity.
   */
  public scale: Vector = Vector.One;

  public get worldScale(): Vector {
    return this.scale;
  }
}
