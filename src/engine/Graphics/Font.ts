import { Vector } from '../Algebra';
import { BoundingBox } from '../Collision/Index';
import { Color } from '../Drawing/Color';
import { line } from '../Util/DrawUtil';
import { ExcaliburGraphicsContext } from './Context/ExcaliburGraphicsContext';
import { BaseAlign, Direction, FontOptions, FontStyle, FontUnit, TextAlign, FontRenderer } from './FontCommon';
import { Raster, RasterOptions } from './Raster';

export class Font extends Raster implements FontRenderer {
  constructor(options: FontOptions & RasterOptions = {}) {
    super(options);
    this.family = options?.family ?? this.family;
    this.style = options?.style ?? this.style;
    this.bold = options?.bold ?? this.bold;
    this.size = options?.size ?? this.size;
    this.unit = options?.unit ?? this.unit;
    this.textAlign = options?.textAlign ?? this.textAlign;
    this.baseAlign = options?.baseAlign ?? this.baseAlign;
    this.direction = options?.direction ?? this.direction;
    if (options?.shadow) {
      this.shadow.blur = options.shadow.blur ?? this.shadow.blur;
      this.shadow.offset = options.shadow.offset ?? this.shadow.offset;
      this.shadow.color = options.shadow.color ?? this.shadow.color;
    }
    this.flagDirty();
  }

  public clone() {
    return new Font({
      ...this.cloneGraphicOptions(),
      ...this.cloneRasterOptions(),
      size: this.size,
      unit: this.unit,
      family: this.family,
      style: this.style,
      bold: this.bold,
      textAlign: this.textAlign,
      baseAlign: this.baseAlign,
      direction: this.direction,
      shadow: this.shadow
        ? {
          blur: this.shadow.blur,
          offset: this.shadow.offset,
          color: this.shadow.color
        }
        : null
    });
  }

  // TODO these props need to flag dirty
  public family: string = 'sans-serif';
  public style: FontStyle = FontStyle.Normal;
  public bold: boolean = false;
  public unit: FontUnit = FontUnit.Px;
  public textAlign: TextAlign = TextAlign.Left;
  public baseAlign: BaseAlign = BaseAlign.Alphabetic;
  public direction: Direction = Direction.LeftToRight;
  public size: number = 10;
  public shadow: { blur: number; offset: Vector; color: Color } = null;

  public get fontString() {
    return `${this.style} ${this.bold ? 'bold' : ''} ${this.size}${this.unit} ${this.family}`;
  }

  private _text: string;
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
    return this._textBounds;
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

  protected _rotate(ex: ExcaliburGraphicsContext) {
    // TODO this needs to change depending on the bounding box...
    const origin = this.origin ?? this._textBounds.center;
    ex.translate(origin.x, origin.y);
    ex.rotate(this.rotation);
    ex.translate(-origin.x, -origin.y);
  }

  protected _flip(ex: ExcaliburGraphicsContext) {
    if (this.flipHorizontal) {
      ex.translate(this._textBounds.width / this.scale.x, 0);
      ex.scale(-1, 1);
    }

    if (this.flipVertical) {
      ex.translate(0, -this._textBounds.height / 2 / this.scale.y);
      ex.scale(1, -1);
    }
  }

  public updateText(text: string) {
    if (this._text !== text) {
      this._text = text;
      this._updateDimensions();
      this.flagDirty();
    }
  }

  private _updateDimensions() {
    if (this._text) {
      this._applyFont(this._ctx);
      const metrics = this._ctx.measureText(this._text);
      this._textWidth = metrics.width;
      this._textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

      // Changing the width and height clears the context properties
      // We double the bitmap width to account for alignment
      this._bitmap.width = (metrics.width + this.padding * 2) * 2;
      this._bitmap.height = (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent + this.padding * 2 || 16) * 2;

      // These bounds exist in raster bitmap space where the top left corner is the corder of the bitmap
      // TODO need to account for padding
      const x = 0;
      const y = 0;
      this._textBounds = new BoundingBox({
        left: x - metrics.actualBoundingBoxLeft - this.padding,
        top: y - metrics.actualBoundingBoxAscent - this.padding,
        bottom: y + metrics.actualBoundingBoxDescent + this.padding,
        right: x + metrics.actualBoundingBoxRight + this.padding
      });
    }
  }

  protected _preDraw(ex: ExcaliburGraphicsContext, x: number, y: number): void {
    if (this.dirty) {
      this._updateDimensions();
    }
    super._preDraw(ex, x, y);
  }

  protected _postDraw(ex: ExcaliburGraphicsContext): void {
    if (this.showDebug) {
      ex.debug.drawRect(-this._halfRasterWidth, -this._halfRasterHeight, this._rasterWidth, this._rasterHeight);
    }
    ex.restore();
  }

  private _applyFont(ctx: CanvasRenderingContext2D) {
    ctx.textAlign = this.textAlign;
    ctx.textBaseline = this.baseAlign;
    ctx.font = this.fontString;
    ctx.direction = this.direction;

    if (this.shadow) {
      ctx.shadowColor = this.shadow.color.toString();
      ctx.shadowBlur = this.shadow.blur;
      ctx.shadowOffsetX = this.shadow.offset.x;
      ctx.shadowOffsetY = this.shadow.offset.y;
    }
  }

  execute(ctx: CanvasRenderingContext2D): void {
    if (this._text) {
      // The reason we need to re-apply the font is setting raster properties (like width/height) can reset the context props
      this._applyRasterProperites(ctx);
      this._applyFont(ctx);
      if (this.color) {
        ctx.fillText(this._text, this.padding + this._halfRasterWidth, this.padding + this._halfRasterHeight);
      }

      if (this.strokeColor) {
        ctx.strokeText(this._text, this.padding + this._halfRasterWidth, this.padding + this._halfRasterHeight);
      }

      if (this.showDebug) {
        line(ctx, Color.Red, 0, this._halfRasterHeight, this._rasterWidth, this._halfRasterHeight, 2);
        line(ctx, Color.Red, this._halfRasterWidth, 0, this._halfRasterWidth, this._rasterHeight, 2);
      }
    }
  }

  public render(ex: ExcaliburGraphicsContext, text: string, x: number, y: number) {
    this.updateText(text);
    this.draw(ex, x, y);
  }
}