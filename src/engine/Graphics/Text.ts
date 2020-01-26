import { Raster } from './Raster';
import { GraphicOptions } from './Graphic';
import { Font } from './Font';

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

  execute(ctx: CanvasRenderingContext2D): void {
    if (this.text) {
      this.font?.apply(ctx);
      const metrics = ctx.measureText(this.text);
      // Changing the width and height clears the context properties
      this._bitmap.width = metrics.width + this.padding * 2;
      this._bitmap.height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent + this.padding * 2 || 16;

      this._applyRasterProperites(ctx);
      this.font?.apply(ctx);
      if (this.color) {
        ctx.fillText(this.text, this.padding, metrics.actualBoundingBoxAscent + this.padding);
      }
      if (this.strokeColor) {
        ctx.strokeText(this.text, this.padding, metrics.actualBoundingBoxAscent + this.padding);
      }
    }
  }
}
