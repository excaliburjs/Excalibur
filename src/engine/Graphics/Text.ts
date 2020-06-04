import { Raster, RasterOptions } from './Raster';
import { Font } from './Font';
import { ExcaliburGraphicsContext } from './Context/ExcaliburGraphicsContext';
import { line } from '../Util/DrawUtil';
import { Color } from '../Drawing/Color';
import { Vector } from '../Algebra';
import { BoundingBox } from '../Collision/Index';

export interface TextOptions {
  text: string;
  font?: Font;
}

export class Text extends Raster {
  constructor(options: TextOptions & RasterOptions) {
    super(options);
    this.text = options.text;
    this.font = options.font ?? new Font();
    this.flagDirty();
  }

  public clone(): Text {
    return new Text({
      text: this.text.slice(),
      font: this.font.clone(),
      ...this.cloneGraphicOptions(),
      ...this.cloneRasterOptions()
    });
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

  private _textBounds: BoundingBox = new BoundingBox();
  private _textWidth: number = 0;
  private _textHeight: number = 0;

  public get width() {
    return this._textWidth;
  }

  public set width(value: number) {
    this._textWidth = value;
  }

  public get height() {
    return this._textHeight;
  }

  public set height(value: number) {
    this._textHeight = value;
  }

  private get _rasterWidth() {
    return this._bitmap.width;
  }

  private get _rasterHeight() {
    return this._bitmap.height;
  }

  private get _halfRasterWidth() {
    return Math.floor(this._bitmap.width / 2);
  }

  private get _halfRasterHeight() {
    return Math.floor(this._bitmap.height / 2);
  }

  public get localBounds(): BoundingBox {
    return BoundingBox.fromDimension(this._textWidth, this._textHeight, Vector.Zero, Vector.Zero);
  }

  protected _drawImage(ex: ExcaliburGraphicsContext, x: number, y: number) {
    if (this.dirty) {
      this.rasterize();
    }

    ex.drawImage(
      this,
      0,
      0,
      this._rasterWidth,
      this._rasterHeight,
      x - this._halfRasterWidth,
      y - this._halfRasterHeight,
      this._rasterWidth,
      this._rasterHeight
    );
  }

  _rotate(ex: ExcaliburGraphicsContext) {
    // TODO this needs to change depending on the bounding box...
    const origin = this.origin ?? this._textBounds.center;
    ex.translate(origin.x, origin.y);
    ex.rotate(this.rotation);
    ex.translate(-origin.x, -origin.y);
  }

  _flip(ex: ExcaliburGraphicsContext) {
    if (this.flipHorizontal) {
      ex.translate(this._textBounds.width / this.scale.x, 0);
      ex.scale(-1, 1);
    }

    if (this.flipVertical) {
      ex.translate(0, -this._textBounds.height / 2 / this.scale.y);
      ex.scale(1, -1);
    }
  }

  _postDraw(ex: ExcaliburGraphicsContext): void {
    if (this.showDebug) {
      ex.drawRect(-this._halfRasterWidth, -this._halfRasterHeight, this._rasterWidth, this._rasterHeight);
    }
    ex.restore();
  }

  execute(ctx: CanvasRenderingContext2D): void {
    if (this.text) {
      this.font?.apply(ctx);
      const metrics = ctx.measureText(this.text);
      this._textWidth = metrics.width;
      this._textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

      // Changing the width and height clears the context properties
      // We double the bitmap width to account for alignment
      this._bitmap.width = (metrics.width + this.padding * 2) * 2;
      this._bitmap.height = (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent + this.padding * 2 || 16) * 2;

      // These bounds exist in raster bitmap space where the top left corner is the corder of the bitmap
      // TODO need to account for padding
      const x = 0; // this._halfRasterWidth;
      const y = 0; //this._halfRasterHeight;
      this._textBounds = new BoundingBox({
        left: x - metrics.actualBoundingBoxLeft - this.padding,
        top: y - metrics.actualBoundingBoxAscent - this.padding,
        bottom: y + metrics.actualBoundingBoxDescent + this.padding,
        right: x + metrics.actualBoundingBoxRight + this.padding
      });

      this._applyRasterProperites(ctx);
      this.font?.apply(ctx);
      if (this.color) {
        ctx.fillText(this.text, this.padding + this._halfRasterWidth, this.padding + this._halfRasterHeight);
      }

      if (this.strokeColor) {
        ctx.strokeText(this.text, this.padding + this._halfRasterWidth, this.padding + this._halfRasterHeight);
      }

      if (this.showDebug) {
        line(ctx, Color.Red, 0, this._halfRasterHeight, this._rasterWidth, this._halfRasterHeight, 2);
        line(ctx, Color.Red, this._halfRasterWidth, 0, this._halfRasterWidth, this._rasterHeight, 2);
      }
    }
  }
}
