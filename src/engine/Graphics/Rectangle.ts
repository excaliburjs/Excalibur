import { Raster, RasterOptions } from './Raster';

export interface RectangleOptions {
  width: number;
  height: number;
}

/**
 * A Rectangle [[Graphic]] for drawing rectangles to the [[ExcaliburGraphicsContext]]
 */
export class Rectangle extends Raster {
  constructor(options: RasterOptions & RectangleOptions) {
    super(options);
    this.width = options.width;
    this.height = options.height;
    this.rasterize();
  }

  public clone(): Rectangle {
    return new Rectangle({
      width: this.width,
      height: this.height,
      ...this.cloneGraphicOptions(),
      ...this.cloneRasterOptions()
    });
  }

  execute(ctx: CanvasRenderingContext2D): void {
    if (this.color) {
      ctx.fillRect(0, 0, this.width, this.height);
    }
    if (this.strokeColor) {
      ctx.strokeRect(0, 0, this.width, this.height);
    }
  }
}
