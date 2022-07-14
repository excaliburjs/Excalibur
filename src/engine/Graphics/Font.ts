import { Vector } from '../Math/vector';
import { BoundingBox } from '../Collision/Index';
import { Color } from '../Color';
import { ExcaliburGraphicsContext } from './Context/ExcaliburGraphicsContext';
import { BaseAlign, Direction, FontOptions, FontStyle, FontUnit, TextAlign, FontRenderer } from './FontCommon';
import { Graphic, GraphicOptions } from './Graphic';
import { RasterOptions } from './Raster';
import { ImageFiltering } from './Filtering';
import { FontTextInstance } from './FontTextInstance';

/**
 * Represents a system or web font in Excalibur
 *
 * If no options specified, the system sans-serif 10 pixel is used
 *
 * If loading a custom web font be sure to have the font loaded before you use it https://erikonarheim.com/posts/dont-test-fonts/
 */
export class Font extends Graphic implements FontRenderer {
  /**
   * Set the font filtering mode, by default set to [[ImageFiltering.Blended]] regardless of the engine default smoothing
   *
   * If you have a pixel style font that may be a reason to switch this to [[ImageFiltering.Pixel]]
   */
  public filtering: ImageFiltering = ImageFiltering.Blended;
  constructor(options: FontOptions & GraphicOptions & RasterOptions = {}) {
    super(options); // <- Graphics properties

    // Raster properties
    this.smoothing = options?.smoothing ?? this.smoothing;
    this.padding = options?.padding ?? this.padding;
    this.color = options?.color ?? this.color;
    this.strokeColor = options?.strokeColor ?? this.strokeColor;
    this.lineDash = options?.lineDash ?? this.lineDash;
    this.lineWidth = options?.lineWidth ?? this.lineWidth;
    this.filtering = options?.filtering ?? this.filtering;

    // Font specific properties
    this.family = options?.family ?? this.family;
    this.style = options?.style ?? this.style;
    this.bold = options?.bold ?? this.bold;
    this.size = options?.size ?? this.size;
    this.unit = options?.unit ?? this.unit;
    this.textAlign = options?.textAlign ?? this.textAlign;
    this.baseAlign = options?.baseAlign ?? this.baseAlign;
    this.direction = options?.direction ?? this.direction;
    this.quality = options?.quality ?? this.quality;
    if (options?.shadow) {
      this.shadow = {};
      this.shadow.blur = options.shadow.blur ?? this.shadow.blur;
      this.shadow.offset = options.shadow.offset ?? this.shadow.offset;
      this.shadow.color = options.shadow.color ?? this.shadow.color;
    }
  }

  public clone() {
    return new Font({
      ...this.cloneGraphicOptions(),
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

  /**
   * Font quality determines the size of the underlying raster text, higher quality means less jagged edges.
   * If quality is set to 1, then just enough raster bitmap is generated to render the text.
   *
   * You can think of quality as how zoomed in to the text you can get before seeing jagged edges.
   *
   * (Default 2)
   */
  public quality = 2;

  // Raster properties for fonts
  public padding = 2;
  public smoothing = false;
  public lineWidth = 1;
  public lineDash: number[] = [];
  public color: Color = Color.Black;
  public strokeColor: Color;

  public family: string = 'sans-serif';
  public style: FontStyle = FontStyle.Normal;
  public bold: boolean = false;
  public unit: FontUnit = FontUnit.Px;
  public textAlign: TextAlign = TextAlign.Left;
  public baseAlign: BaseAlign = BaseAlign.Alphabetic;
  public direction: Direction = Direction.LeftToRight;
  public size: number = 10;
  public shadow: { blur?: number; offset?: Vector; color?: Color } = null;

  public get fontString() {
    return `${this.style} ${this.bold ? 'bold' : ''} ${this.size}${this.unit} ${this.family}`;
  }

  private _textBounds: BoundingBox = new BoundingBox();

  public get localBounds(): BoundingBox {
    return this._textBounds;
  }


  protected _drawImage(_ex: ExcaliburGraphicsContext, _x: number, _y: number) {
    // TODO weird vestigial drawimage
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

  private _textCache = new Map<string, FontTextInstance>();

  /**
   * Returns a BoundingBox that is the total size of the text including multiple lines
   *
   * Does not include any padding or adjustment
   * @param text
   * @returns BoundingBox
   */
  public measureText(text: string): BoundingBox {
    const hash = FontTextInstance.getHashCode(this, text, this.color);
    const maybeTextInstance = this._textCache.get(hash);
    if (maybeTextInstance) {
      this._textUsage.set(maybeTextInstance, performance.now());
      return maybeTextInstance.dimensions;
    }

    const newTextInstance = new FontTextInstance(this, text, this.color);
    this._textCache.set(hash, newTextInstance);
    this._textUsage.set(newTextInstance, performance.now());
    return newTextInstance.dimensions;
  }

  protected _postDraw(ex: ExcaliburGraphicsContext): void {
    ex.restore();
  }

  private _textUsage = new Map<FontTextInstance, number>();

  public render(ex: ExcaliburGraphicsContext, text: string, colorOverride: Color, x: number, y: number) {
    if (this.showDebug) {
      this.clearCache();
    }
    this.checkAndClearCache();

    const hash = FontTextInstance.getHashCode(this, text, colorOverride);
    let textInstance = this._textCache.get(hash);
    if (!textInstance) {
      textInstance =  new FontTextInstance(this, text, colorOverride);
      this._textCache.set(hash, textInstance);
    }

    // Apply affine transformations
    this._preDraw(ex, x, y);

    textInstance.render(ex, x, y);

    this._postDraw(ex);

    // Cache the bitmap for certain amount of time
    this._textUsage.set(textInstance, performance.now());
  }

  /**
   * Get the internal cache size of the font
   * This is useful when debugging memory usage, these numbers indicate the number of cached in memory text bitmaps
   */
  public get cacheSize() {
    return this._textUsage.size;
  }

  /**
   * Force clear all cached text bitmaps
   */
  public clearCache() {
    this._textUsage.clear();
  }

  /**
   * Remove any expired cached text bitmaps
   */
  public checkAndClearCache() {
    const deferred: FontTextInstance[] = [];
    for (const [textInstance, time] of this._textUsage.entries()) {
      // if bitmap hasn't been used in 1 second clear it
      // TODO use Clock
      if (time + 1000 < performance.now()) {
        deferred.push(textInstance);
        textInstance.dispose();
      }
    }
    deferred.forEach(t => this._textUsage.delete(t));

    this._textCache.clear();
    for (const [textInstance] of this._textUsage.entries()) {
      this._textCache.set(textInstance.getHashCode(), textInstance);
    }
  }
}
