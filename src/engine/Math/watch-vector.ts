import { Vector } from './vector';

/**
 * Wraps a vector and watches for changes in the x/y, modifies the original vector.
 */
export class WatchVector extends Vector {
  constructor(
    public original: Vector,
    public change: (x: number, y: number) => any
  ) {
    super(original.x, original.y);
  }
  public get x() {
    return (this._x = this.original.x);
  }

  public set x(newX: number) {
    if (newX !== this._x) {
      this.change(newX, this._y);
      this._x = this.original.x = newX;
    }
  }

  public get y() {
    return (this._y = this.original.y);
  }

  public set y(newY: number) {
    if (newY !== this._y) {
      this.change(this._x, newY);
      this._y = this.original.y = newY;
    }
  }

  override setTo(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }
}
