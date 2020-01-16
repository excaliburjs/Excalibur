import { Raster } from './Raster';
import { DrawOptions } from './Graphic';

export interface TextOptions {
  text: string;
  font?: string;
}

export class Text extends Raster {
  private _text: string;
  public get text() {
    return this._text;
  }

  public set text(value: string) {
    this._text = value;
    this.flagDirty();
  }

  private _font: string;
  public get font() {
    return this._font;
  }

  public set font(value: string) {
    this._font = value;
    this.flagDirty();
  }

  private _padding: number = 0;
  public get padding() {
    return this._padding;
  }

  public set padding(value: number) {
    this._padding = value;
    this.flagDirty();
  }

  execute(ctx: CanvasRenderingContext2D, _options?: DrawOptions): void {
    if (this.text) {
      ctx.font = this.font;
      const metrics = ctx.measureText(this.text);
      // Changing the width and height clears the context properties
      this._bitmap.width = metrics.width + this.padding * 2;
      this._bitmap.height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent + this.padding * 2 || 16;

      this._applyRasterProperites(ctx);
      ctx.font = this.font;
      if (this.fillStyle) {
        ctx.fillText(this.text, this.padding, metrics.actualBoundingBoxAscent + this.padding);
      }
      if (this.strokeStyle) {
        ctx.strokeText(this.text, this.padding, metrics.actualBoundingBoxAscent + this.padding);
      }
    }
  }
}
