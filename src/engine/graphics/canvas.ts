import type { GraphicOptions } from './graphic';
import type { RasterOptions } from './raster';
import { Raster } from './raster';

export interface CanvasOptions {
  draw?: (ctx: CanvasRenderingContext2D) => void;
  cache?: boolean;
}

/**
 * A canvas {@apilink Graphic} to provide an adapter between the 2D Canvas API and the {@apilink ExcaliburGraphicsContext}.
 *
 * The {@apilink Canvas} works by re-rastering a draw handler to a HTMLCanvasElement for every draw which is then passed
 * to the {@apilink ExcaliburGraphicsContext} implementation as a rendered image.
 *
 * **Low performance API**
 */
export class Canvas extends Raster {
  /**
   * Return the 2D graphics context of this canvas
   */
  public get ctx() {
    return this._ctx;
  }

  constructor(private _options: GraphicOptions & RasterOptions & CanvasOptions = {}) {
    super(_options);
  }

  public clone(): Canvas {
    return new Canvas({
      ...this._options,
      ...this.cloneGraphicOptions(),
      ...this.cloneRasterOptions()
    });
  }

  execute(ctx: CanvasRenderingContext2D): void {
    if (this._options?.draw) {
      this._options?.draw(ctx);
    }
    if (!this._options.cache) {
      this.flagDirty();
    }
  }
}
