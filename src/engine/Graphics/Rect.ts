import { Raster, RasterOptions } from './Raster';

export interface RectOptions {
  width: number;
  height: number;
}

/**
 * A Rectangle [[Graphic]] for drawing rectangles to the [[ExcaliburGraphicsContext]]
 */
export class Rect extends Raster {
  constructor(options: RasterOptions & RectOptions) {
    super(options);
    this.width = options.width;
    this.height = options.height;
    this.rasterize();
  }

  execute(ctx: CanvasRenderingContext2D): void {
    ctx.fillRect(0, 0, this.width, this.height);
  }
}
