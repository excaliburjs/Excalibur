import { Vector } from './vector';

export interface VectorViewOptions {
  getX: () => number;
  getY: () => number;
  setX: (x: number) => void;
  setY: (y: number) => void;
}
export class VectorView extends Vector {
  private _getX: () => number;
  private _getY: () => number;
  private _setX: (x: number) => void;
  private _setY: (y: number) => void;
  constructor(options: VectorViewOptions) {
    super(0, 0);
    this._getX = options.getX;
    this._getY = options.getY;
    this._setX = options.setX;
    this._setY = options.setY;
  }
  public get x() {
    return (this._x = this._getX());
  }

  public set x(val) {
    this._setX(val);
    this._x = val;
  }

  public get y() {
    return (this._y = this._getY());
  }
  public set y(val) {
    this._setY(val);
    this._y = val;
  }
}
