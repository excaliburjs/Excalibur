import { Vector } from '../Algebra';
import { Raster, RasterOptions } from './Raster';

export interface PolygonOptions {
  points: Vector[];
}

/**
 * A polygon [[Graphic]] for drawing arbitrary polygons to the [[ExcaliburGraphicsContext]]
 */
export class Polygon extends Raster {
  private _points: Vector[];
  public get points(): Vector[] {
    return this._points;
  }
  public set points(points: Vector[]) {
    this._points = points;
    this.flagDirty();
  }

  constructor(options: RasterOptions & PolygonOptions) {
    super(options);
    this.points = options.points;
    this.width = this.points.reduce((max, p) => Math.max(p.x, max), 0);
    this.height = this.points.reduce((max, p) => Math.max(p.y, max), 0);
    this.rasterize();
  }

  execute(ctx: CanvasRenderingContext2D): void {
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
