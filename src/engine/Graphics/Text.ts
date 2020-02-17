import { Raster } from './Raster';
import { GraphicOptions } from './Graphic';
import { Font } from './Font';
import { ExcaliburGraphicsContext } from './Context/ExcaliburGraphicsContext';
import { line } from '../Util/DrawUtil';
import { Color } from '../Drawing/Color';

export interface TextOptions {
  text: string;
  font?: Font;
}

export class Text extends Raster {
  constructor(options: TextOptions & GraphicOptions) {
    super(options);
    this.text = options.text;
    this.font = options.font ?? new Font();
    this.flagDirty();
  }

  // private _metrics: TextMetrics;
  private _text: string;
  public get text() {
    return this._text;
  }

  public set text(value: string) {
    this._text = value;
    this.flagDirty();
  }

  private _font: Font;
  public get font() {
    return this._font;
  }

  private _createFontProxy(font: Font) {
    return new Proxy(font, {
      set: (obj, prop, value) => {
        // The default behavior to store the value
        (obj as any)[prop] = value;
        this.flagDirty();
        // Indicate success
        return true;
      }
    });
  }

  public set font(value: Font) {
    this._font = value ? this._createFontProxy(value) : value;
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

  private get _halfWidth() {
    return Math.floor(this.width / 2);
  }

  private get _halfHeight() {
    return Math.floor(this.height / 2);
  }

  protected _drawImage(ex: ExcaliburGraphicsContext, x: number, y: number) {
    if (this.dirty) {
      this.rasterize();
    }

    ex.drawImage(this._bitmap, x - this._halfWidth, y - this._halfHeight);
  }

  _postDraw(ex: ExcaliburGraphicsContext): void {
    if (this.showDebug) {
      ex.drawDebugRect(-this._halfWidth, -this._halfHeight, this.width, this.height);
    }
    ex.restore();
  }

  execute(ctx: CanvasRenderingContext2D): void {
    if (this.text) {
      this.font?.apply(ctx);
      const metrics = ctx.measureText(this.text);

      // Changing the width and height clears the context properties
      // We double the bitmap width to account for alignment
      this._bitmap.width = (metrics.width + this.padding * 2) * 2;
      this._bitmap.height = ((metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent + this.padding) * 2 || 16) * 2;

      this._applyRasterProperites(ctx);
      this.font?.apply(ctx);
      if (this.color) {
        ctx.fillText(this.text, this.padding + this._halfWidth, this.padding + this._halfHeight);
      }

      if (this.strokeColor) {
        ctx.strokeText(this.text, this.padding + this._halfWidth, this.padding + this._halfHeight);
      }

      if (this.showDebug) {
        line(ctx, Color.Red, 0, this._halfHeight, this.width, this._halfHeight, 2);
        line(ctx, Color.Red, this._halfWidth, 0, this._halfWidth, this.height, 2);
      }
    }
  }
}
