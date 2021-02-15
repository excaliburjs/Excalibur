import { Raster, RasterOptions } from './Raster';

export interface CircleOptions {
  radius: number;
}

/**
 * A circle [[Graphic]] for drawing circles to the [[ExcaliburGraphicsContext]]
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
    this.radius = options.radius;
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
