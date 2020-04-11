import { Graphic, GraphicOptions } from './Graphic';
import { ExcaliburGraphicsContext, ImageSource } from './Context/ExcaliburGraphicsContext';
import { Color } from '../Drawing/Color';
import { ensurePowerOfTwo } from './Context/webgl-util';
import { Vector } from '../Algebra';
import { BoundingBox } from '../Collision/BoundingBox';

export interface RasterOptions {
  smoothing?: boolean;
  color?: Color;
  strokeColor?: Color;
}

/**
 * A Raster is a Graphic that needs to be first painted to a HTMLCanvasElement before it can be drawn to the
 * [[ExcaliburGraphicsContext]]. This is useful for generating custom images using the 2D canvas api.
 *
 * Implementors must implemenet the [[Raster.execute]] method to rasterize their drawing.
 */
export abstract class Raster extends Graphic {
  public _bitmap: HTMLCanvasElement;
  public __glTexture: WebGLTexture;
  public _flagTextureDirty: boolean;
  private _ctx: CanvasRenderingContext2D;
  private _dirty: boolean = true;

  constructor(options?: GraphicOptions & RasterOptions) {
    super(options);
    if (options) {
      this.color = options.color ?? Color.Black;
      this.strokeColor = options?.strokeColor;
      this.smoothing = options.smoothing ?? this.smoothing;
    }

    this._bitmap = document.createElement('canvas');
    let bitmapWidth = options.width ?? this._bitmap.width;
    let bitmapHeight = options.height ?? this._bitmap.height;
    // Rasters use power of two images as an optimization for webgl
    this._bitmap.width = ensurePowerOfTwo(bitmapWidth);
    this._bitmap.height = ensurePowerOfTwo(bitmapHeight);
    const maybeCtx = this._bitmap.getContext('2d');
    if (!maybeCtx) {
      throw new Error('Browser does not support 2d canvas drawing, cannot create Raster graphic');
    } else {
      this._ctx = maybeCtx;
    }
  }

  public cloneRasterOptions(): RasterOptions {
    return {
      color: this.color ? this.color.clone() : null,
      strokeColor: this.strokeColor ? this.strokeColor.clone() : null,
      smoothing: this.smoothing
    };
  }

  /**
   * Gets whether the graphic is dirty
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

  /**
   * Gets or sets the current width of the Raster graphic. Setting the width will cause the raster
   * to be flagged dirty causing a re-raster on the next draw.
   */
  public get width() {
    return this._bitmap.width;
  }
  public set width(value: number) {
    this._bitmap.width = value;
    this.flagDirty();
  }

  /**
   * Gets or sets the current height of the Raster graphic. Setting the height will cause the raster
   * to be flagged dirty causing a re-raster on the next draw.
   */
  public get height() {
    return this._bitmap.height;
  }
  public set height(value: number) {
    this._bitmap.height = value;
    this.flagDirty();
  }

  public get localBounds() {
    return BoundingBox.fromDimension(this.width * this.scale.x, this.height * this.scale.y, Vector.Zero);
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

  private _createColorProxy(color: Color) {
    return new Proxy(color, {
      set: (obj, prop, value) => {
        // The default behavior to store the value
        (obj as any)[prop] = value;
        this.flagDirty();
        // Indicate success
        return true;
      }
    });
  }

  private _color: Color;
  /**
   * Gets or sets the fillStyle of the Raster graphic. Setting the fillStyle will cause the raster to be
   * flagged dirty causing a re-raster on the next draw.
   */
  public get color() {
    return this._color;
  }
  public set color(value) {
    this._color = value ? this._createColorProxy(value) : value;
    this.flagDirty();
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
    this._strokeColor = value ? this._createColorProxy(value) : value;
    this.flagDirty();
  }

  /**
   * Rasterize the graphic to a bitmap making it usuable as in excalibur. Rasterize is called automatically if
   * the graphic is [[Graphic.dirty]] on the next [[Graphic.draw]] call
   */
  public rasterize(): void {
    this._dirty = false;
    this._ctx.clearRect(0, 0, this.width, this.height);
    this._ctx.save();
    this._applyRasterProperites(this._ctx);
    this.execute(this._ctx);
    this._ctx.restore();
    // TODO this feels kinda bad, should at least be a method or Rasters should be able to manage this
    this._flagTextureDirty = true;
  }

  protected _applyRasterProperites(ctx: CanvasRenderingContext2D) {
    ctx.imageSmoothingEnabled = this.smoothing;
    ctx.strokeStyle = this.strokeColor?.toString();
    ctx.fillStyle = this.color?.toString();
  }

  protected _drawImage(ex: ExcaliburGraphicsContext, x: number, y: number) {
    if (this._dirty) {
      this.rasterize();
    }

    ex.drawImage(this, x, y);
  }

  /**
   * Executes drawing implemenation of the graphic, this is where the specific drawing code for the graphic
   * should be implemented. Once `rasterize()` the graphic can be drawn to the [[ExcaliburGraphicsContext]] via `draw(...)`
   * @param ctx Canvas to draw the graphic to
   */
  abstract execute(ctx: CanvasRenderingContext2D): void;

  public getSource(): ImageSource {
    return this._bitmap;
  }
}
