import { Vector, vec } from '../Algebra';
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
    const min = this.minPoint;
    this.width = this._points.reduce((max, p) => Math.max(p.x, max), 0) - min.x;
    this.height = this._points.reduce((max, p) => Math.max(p.y, max), 0) - min.y;
    this.flagDirty();
  }

  public get minPoint() {
    const minX = this._points.reduce((min, p) => Math.min(p.x, min), Infinity);
    const minY = this._points.reduce((min, p) => Math.min(p.y, min), Infinity);
    return vec(minX, minY);
  }

  constructor(options: RasterOptions & PolygonOptions) {
    super(options);
    this.points = options.points;
    this.rasterize();
  }

  execute(ctx: CanvasRenderingContext2D): void {
    if (this.points && this.points.length) {
      ctx.beginPath();
      // Iterate through the supplied points and construct a 'polygon'
      const min = this.minPoint.negate();
      const firstPoint = this.points[0].add(min);
      ctx.moveTo(firstPoint.x, firstPoint.y);
      this.points.forEach((point) => {
        ctx.lineTo(point.x + min.x, point.y + min.y);
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
}
