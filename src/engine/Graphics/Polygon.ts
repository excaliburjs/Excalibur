import { Graphic, GraphicOptions } from './Graphic';
import { Vector } from '../Algebra';

export interface PolygonOptions {
  points: Vector[];
}

export class Polygon extends Graphic {
  public points: Vector[];
  constructor(options: GraphicOptions & PolygonOptions) {
    super(options);
    this.points = options.points;
    this.width = this.points.reduce((max, p) => Math.max(p.x, max), 0);
    this.height = this.points.reduce((max, p) => Math.max(p.y, max), 0);
    this.paint();
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    // Iterate through the supplied points and construct a 'polygon'
    const firstPoint = this.points[0];
    ctx.moveTo(firstPoint.x, firstPoint.y);
    this.points.forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.lineTo(firstPoint.x, firstPoint.y);
    ctx.closePath();
    if (this.fillStyle) {
      ctx.fill();
    }
    if (this.strokeStyle) {
      ctx.stroke();
    }
  }
}
