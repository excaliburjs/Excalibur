import { ImageFiltering } from './filtering';
import type { RasterOptions } from './raster';
import { Raster } from './raster';

export interface CircleOptions {
  radius: number;
}

/**
 * A circle {@apilink Graphic} for drawing circles to the {@apilink ExcaliburGraphicsContext}
 *
 * Circles default to {@apilink ImageFiltering.Blended}
 */
export class Circle extends Raster {
  private _radius: number = 0;
  public get radius() {
    return this._radius;
  }
  public set radius(value: number) {
    this._radius = value;
    this.width = this._radius * 2;
    this.height = this._radius * 2;
    this.flagDirty();
  }
  constructor(options: RasterOptions & CircleOptions) {
    super(options);
    const lineWidth = options.lineWidth ?? (options.strokeColor ? 1 : 0); // default lineWidth in canvas is 1px
    this.padding = options.padding ?? 2 + lineWidth / 2; // default 2 padding for circles looks nice
    this.radius = options.radius;
    this.filtering = options.filtering ?? ImageFiltering.Blended;
    this.rasterize();
  }

  public clone(): Circle {
    return new Circle({
      radius: this.radius,
      ...this.cloneGraphicOptions(),
      ...this.cloneRasterOptions()
    });
  }

  execute(ctx: CanvasRenderingContext2D): void {
    if (this.radius > 0) {
      ctx.beginPath();
      ctx.arc(this.radius, this.radius, this.radius, 0, Math.PI * 2);

      if (this.color) {
        ctx.fill();
      }

      if (this.strokeColor) {
        ctx.stroke();
      }
    }
  }
}
