import { BoundingBox } from '../Collision/BoundingBox';
import { Color } from '../Color';
import { Vector } from '../Math/vector';
import { ExcaliburGraphicsContext } from './Context/ExcaliburGraphicsContext';
import { Graphic } from './Graphic';

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
  constructor(options: LineOptions) {
    super();
    const { start, end, color, thickness } = options;
    this.start = start;
    this.end = end;
    this.color = color ?? this.color;
    this.thickness = thickness ?? this.thickness;
    const { width, height } = BoundingBox.fromPoints([start, end]);
    this.width = width;
    this.height = height;
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