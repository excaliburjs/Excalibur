import { Vector } from '../Algebra';


export interface VectorViewOptions<T> {
  data: T;
  getX: (source: T) => number;
  getY: (source: T) => number;
  setX: (source: T, x: number) => void;
  setY: (source: T, y: number) => void;
}
export class VectorView<T> extends Vector {
  private _data: T;
  private _getX: (source: T) => number;
  private _getY: (source: T) => number;
  private _setX: (source: T, x: number) => void;
  private _setY: (source: T, y: number) => void;
  constructor(options: VectorViewOptions<T>) {
    super(options.getX(options.data), options.getY(options.data));
    this._data = options.data;
    this._getX = options.getX;
    this._getY = options.getY;
    this._setX = options.setX;
    this._setY = options.setY;
  }
  public get x() {
    return this._getX(this._data);
  }

  public set x(val) {
    this._setX(this._data, val);
  }

  public get y() {
    return this._getY(this._data);
  }
  public set y(val) {
    this._setY(this._data, val);
  }
}
