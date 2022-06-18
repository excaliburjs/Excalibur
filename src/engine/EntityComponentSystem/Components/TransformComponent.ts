import { Vector } from '../../Math/vector';
import { CoordPlane } from '../../Math/coord-plane';
import { Transform } from '../../Math/transform';
import { Component } from '../Component';
import { Entity } from '../Entity';
import { Observable } from '../../Util/Observable';


export class TransformComponent extends Component<'ex.transform'> {
  public readonly type = 'ex.transform';

  private _transform = new Transform();
  public get() {
    return this._transform;
  }

  private _addChildTransform = (child: Entity) => {
    const childTxComponent = child.get(TransformComponent);
    if (childTxComponent) {
      childTxComponent._transform.parent = this._transform;
    }
  };
  onAdd(owner: Entity): void {
    for (const child of owner.children) {
      this._addChildTransform(child);
    }
    owner.childrenAdded$.subscribe(child => this._addChildTransform(child));
    owner.childrenRemoved$.subscribe(child => {
      const childTxComponent = child.get(TransformComponent);
      if (childTxComponent) {
        childTxComponent._transform.parent = null;
      }
    });
  }
  onRemove(_previousOwner: Entity): void {
    this._transform.parent = null;
  }

  /**
   * Observable that emits when the z index changes on this component
   */
  public zIndexChanged$ = new Observable<number>();
  private _z = 0;

  /**
   * The z-index ordering of the entity, a higher values are drawn on top of lower values.
   * For example z=99 would be drawn on top of z=0.
   */
  public get z(): number {
    return this._z;
  }

  public set z(val: number) {
    const oldz = this._z;
    this._z = val;
    if (oldz !== val) {
      this.zIndexChanged$.notifyAll(val);
    }
  }

  /**
   * The [[CoordPlane|coordinate plane|]] for this transform for the entity.
   */
  public coordPlane = CoordPlane.World;

  get pos() {
    return this._transform.pos;
  }
  set pos(v: Vector) {
    this._transform.pos = v;
  }

  get globalPos() {
    return this._transform.globalPos;
  }
  set globalPos(v: Vector) {
    this._transform.globalPos = v;
  }

  get rotation() {
    return this._transform.rotation;
  }
  set rotation(rotation) {
    this._transform.rotation = rotation;
  }

  get globalRotation() {
    return this._transform.globalRotation;
  }
  set globalRotation(rotation) {
    this._transform.globalRotation = rotation;
  }

  get scale() {
    return this._transform.scale;
  }
  set scale(v: Vector) {
    this._transform.scale = v;
  }

  get globalScale() {
    return this._transform.globalScale;
  }
  set globalScale(v: Vector) {
    this._transform.globalScale = v;
  }

  applyInverse(v: Vector) {
    return this._transform.applyInverse(v);
  }

  apply(v: Vector) {
    return this._transform.apply(v);
  }
}