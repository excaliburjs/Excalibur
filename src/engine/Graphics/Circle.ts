import { Raster, RasterOptions } from './Raster';

export interface CircleOptions {
  radius: number;
}

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

  execute(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.arc(this.radius, this.radius, this.radius, 0, Math.PI * 2);

    if (this.fillStyle) {
      ctx.fill();
    }

    if (this.strokeStyle) {
      ctx.stroke();
    }
  }
}
