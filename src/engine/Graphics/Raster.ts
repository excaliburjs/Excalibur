import { Graphic, GraphicOptions } from './Graphic';
import { ExcaliburGraphicsContext } from './Context/ExcaliburGraphicsContext';
import { Color } from '../Drawing/Color';
import { ensurePowerOfTwo } from './Context/webgl-util';
import { Vector } from '../Algebra';
import { BoundingBox } from '../Collision/BoundingBox';
import { watch } from '../Util/Watch';
import { TextureLoader } from './Context/texture-loader';

export interface RasterOptions {
  smoothing?: boolean;
  color?: Color;
  strokeColor?: Color;
  lineWidth?: number;
  lineDash?: number[];
  padding?: number;
}

/**
 * A Raster is a Graphic that needs to be first painted to a HTMLCanvasElement before it can be drawn to the
 * [[ExcaliburGraphicsContext]]. This is useful for generating custom images using the 2D canvas api.
 *
 * Implementors must implemenet the [[Raster.execute]] method to rasterize their drawing.
 */
export abstract class Raster extends Graphic {
  public _bitmap: HTMLCanvasElement;
  protected _ctx: CanvasRenderingContext2D;
  private _dirty: boolean = true;

  constructor(options?: GraphicOptions & RasterOptions) {
    super(options);
    if (options) {
      this.color = options.color ?? Color.Black;
      this.strokeColor = options?.strokeColor;
      this.smoothing = options.smoothing ?? this.smoothing;
      this.lineWidth = options.lineWidth ?? this.lineWidth;
      this.lineDash = options.lineDash ?? this.lineDash;
      this.padding = options.padding ?? this.padding;
    }

    this._bitmap = document.createElement('canvas');
    // get the default canvas width/height as a fallback
    const bitmapWidth = options?.width ?? this._bitmap.width;
    const bitmapHeight = options?.height ?? this._bitmap.height;
    // Rasters use power of two images as an optimization for webgl
    this.width = ensurePowerOfTwo(bitmapWidth);
    this.height = ensurePowerOfTwo(bitmapHeight);
    const maybeCtx = this._bitmap.getContext('2d');
    if (!maybeCtx) {
      /* istanbul ignore next */
      throw new Error('Browser does not support 2d canvas drawing, cannot create Raster graphic');
    } else {
      this._ctx = maybeCtx;
    }
  }

  public cloneRasterOptions(): RasterOptions {
    return {
      color: this.color ? this.color.clone() : null,
      strokeColor: this.strokeColor ? this.strokeColor.clone() : null,
      smoothing: this.smoothing,
      lineWidth: this.lineWidth,
      lineDash: this.lineDash,
      padding: this.padding
    };
  }

  /**
   * Gets whether the graphic is dirty, this means there are changes that haven't been re-rasterized
   */
  public get dirty() {
    return this._dirty;
  }

  /**
   * Flags the graphic as dirty, meaning it must be re-rasterized before draw.
   * This should be called any time the graphics state changes such that it affects the outputed drawing
   */
  public flagDirty() {
    this._dirty = true;
  }

  private _originalWidth: number;
  /**
   * Gets or sets the current width of the Raster graphic. Setting the width will cause the raster
   * to be flagged dirty causing a re-raster on the next draw.
   *
   * Any `padding`s set will be factored into the width
   */
  public get width() {
    return this._getTotalWidth();
  }
  public set width(value: number) {
    this._bitmap.width = value;
    this._originalWidth = value;
    this.flagDirty();
  }

  private _originalHeight: number;
  /**
   * Gets or sets the current height of the Raster graphic. Setting the height will cause the raster
   * to be flagged dirty causing a re-raster on the next draw.
   *
   * Any `padding` set will be factored into the height
   */
  public get height() {
    return this._getTotalHeight();
  }

  public set height(value: number) {
    this._bitmap.height = value;
    this._originalHeight = value;
    this.flagDirty();
  }

  private _getTotalWidth() {
    return (this._originalWidth ?? this._bitmap.width) + this.padding * 2;
  }

  private _getTotalHeight() {
    return (this._originalHeight ?? this._bitmap.height) + this.padding * 2;
  }

  /**
   * Returns the local bounds of the Raster including the padding
   */
  public get localBounds() {
    return BoundingBox.fromDimension(this._getTotalWidth() * this.scale.x, this._getTotalHeight() * this.scale.y, Vector.Zero);
  }

  private _smoothing: boolean = false;
  /**
   * Gets or sets the smoothing (anti-aliasing of the graphic). Setting the height will cause the raster
   * to be flagged dirty causing a re-raster on the next draw.
   */
  public get smoothing() {
    return this._smoothing;
  }
  public set smoothing(value: boolean) {
    this._smoothing = value;
    this.flagDirty();
  }

  private _color: Color = watch(Color.Black, () => this.flagDirty());
  /**
   * Gets or sets the fillStyle of the Raster graphic. Setting the fillStyle will cause the raster to be
   * flagged dirty causing a re-raster on the next draw.
   */
  public get color() {
    return this._color;
  }
  public set color(value) {
    if (!this._color?.equal(value)) {
      this.flagDirty();
    }
    this._color = watch(value, () => this.flagDirty());
  }

  private _strokeColor: Color;
  /**
   * Gets or sets the strokeStyle of the Raster graphic. Setting the strokeStyle will cause the raster to be
   * flagged dirty causing a re-raster on the next draw.
   */
  public get strokeColor() {
    return this._strokeColor;
  }
  public set strokeColor(value) {
    if (!this._strokeColor?.equal(value)) {
      this.flagDirty();
    }
    this._strokeColor = watch(value, () => this.flagDirty());
  }

  private _lineWidth: number = 1;
  /**
   * Gets or sets the line width of the Raster graphic. Setting the lineWidth will cause the raster to be
   * flagged dirty causing a re-raster on the next draw.
   */
  public get lineWidth() {
    return this._lineWidth;
  }
  public set lineWidth(value) {
    this._lineWidth = value;
    this.flagDirty();
  }

  private _lineDash: number[] = [];
  public get lineDash() {
    return this._lineDash;
  }

  public set lineDash(value) {
    this._lineDash = value;
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

  /**
   * Rasterize the graphic to a bitmap making it usuable as in excalibur. Rasterize is called automatically if
   * the graphic is [[Raster.dirty]] on the next [[Graphic.draw]] call
   */
  public rasterize(): void {
    this._dirty = false;
    this._ctx.clearRect(0, 0, this._getTotalWidth(), this._getTotalHeight());
    this._ctx.save();
    this._applyRasterProperites(this._ctx);
    this.execute(this._ctx);
    this._ctx.restore();
    // The webgl texture needs to be updated if it exists after a raster cycle
    TextureLoader.load(this._bitmap, true);
  }

  protected _applyRasterProperites(ctx: CanvasRenderingContext2D) {
    this._bitmap.width = this._getTotalWidth();
    this._bitmap.height = this._getTotalHeight();
    ctx.translate(this.padding, this.padding);
    ctx.imageSmoothingEnabled = this.smoothing;
    ctx.lineWidth = this.lineWidth;
    ctx.setLineDash(this.lineDash ?? ctx.getLineDash());
    ctx.strokeStyle = this.strokeColor?.toString();
    ctx.fillStyle = this.color?.toString();
  }

  protected _drawImage(ex: ExcaliburGraphicsContext, x: number, y: number) {
    if (this._dirty) {
      this.rasterize();
    }

    ex.drawImage(this._bitmap, x, y);
  }

  /**
   * Executes drawing implemenation of the graphic, this is where the specific drawing code for the graphic
   * should be implemented. Once `rasterize()` the graphic can be drawn to the [[ExcaliburGraphicsContext]] via `draw(...)`
   * @param ctx Canvas to draw the graphic to
   */
  abstract execute(ctx: CanvasRenderingContext2D): void;
}
