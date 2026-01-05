import { BoundingBox } from '../collision/bounding-box';
import { Color } from '../color';
import type { Vector } from '../math/vector';
import type { ExcaliburGraphicsContext } from './context/excalibur-graphics-context';
import { Graphic } from './graphic';

export interface LineOptions {
  start: Vector;
  end: Vector;
  color?: Color;
  thickness?: number;
}
export class Line extends Graphic {
  readonly start: Vector;
  readonly end: Vector;
  color: Color = Color.Black;
  thickness: number = 1;
  private _localBounds: BoundingBox;
  constructor(options: LineOptions) {
    super();
    const { start, end, color, thickness } = options;
    this.start = start;
    this.end = end;
    this.color = color ?? this.color;
    this.thickness = thickness ?? this.thickness;
    this._localBounds = this._calculateBounds();
    const { width, height } = this._localBounds;

    this.width = width;
    this.height = height;
  }

  public get localBounds() {
    return this._localBounds;
  }

  private _calculateBounds(): BoundingBox {
    const lineNormal = this.end.sub(this.start).normal();

    const halfThickness = this.thickness / 2;

    const points = [
      this.start.add(lineNormal.scale(halfThickness)),
      this.end.add(lineNormal.scale(halfThickness)),
      this.end.add(lineNormal.scale(-halfThickness)),
      this.start.add(lineNormal.scale(-halfThickness))
    ];

    return BoundingBox.fromPoints(points);
  }

  protected _drawImage(ctx: ExcaliburGraphicsContext, _x: number, _y: number): void {
    ctx.drawLine(this.start, this.end, this.color, this.thickness);
  }

  clone(): Line {
    return new Line({
      start: this.start,
      end: this.end,
      color: this.color,
      thickness: this.thickness
    });
  }
}
