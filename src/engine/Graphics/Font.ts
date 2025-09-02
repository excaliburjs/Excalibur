import type { Vector } from '../Math/vector';
import { BoundingBox } from '../Collision/Index';
import { Color } from '../Color';
import type { ExcaliburGraphicsContext } from './Context/ExcaliburGraphicsContext';
import type { FontOptions, FontRenderer } from './FontCommon';
import { BaseAlign, Direction, FontStyle, FontUnit, TextAlign } from './FontCommon';
import type { GraphicOptions } from './Graphic';
import { Graphic } from './Graphic';
import type { RasterOptions } from './Raster';
import { ImageFiltering } from './Filtering';
import { FontTextInstance } from './FontTextInstance';
import { FontCache } from './FontCache';
/**
 * Represents a system or web font in Excalibur
 *
 * If no options specified, the system sans-serif 10 pixel is used
 *
 * If loading a custom web font be sure to have the font loaded before you use it https://erikonarheim.com/posts/dont-test-fonts/
 */
export class Font extends Graphic implements FontRenderer {
  /**
   * Set the font filtering mode, by default set to {@apilink ImageFiltering.Blended} regardless of the engine default smoothing
   *
   * If you have a pixel style font that may be a reason to switch this to {@apilink ImageFiltering.Pixel}
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
    this.lineHeight = options?.lineHeight ?? this.lineHeight;
    this.quality = options?.quality ?? this.quality;
    if (options?.shadow) {
      this.shadow = {};
      this.shadow.blur = options.shadow.blur ?? this.shadow.blur;
      this.shadow.offset = options.shadow.offset ?? this.shadow.offset;
      this.shadow.color = options.shadow.color ?? this.shadow.color;
    }

    // must be created after this is finished setting values
    this._textMeasurement = new FontTextInstance(this, '', Color.Black);
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
        : undefined
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
  public strokeColor?: Color;

  public family: string = 'sans-serif';
  public style: FontStyle = FontStyle.Normal;
  public bold: boolean = false;
  public unit: FontUnit = FontUnit.Px;
  public textAlign: TextAlign = TextAlign.Left;
  public baseAlign: BaseAlign = BaseAlign.Top;
  public direction: Direction = Direction.LeftToRight;
  /**
   * Font line height in pixels, default line height if unset
   */
  public lineHeight: number | undefined = undefined;
  public size: number = 10;
  public shadow?: { blur?: number; offset?: Vector; color?: Color };

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

  private _textMeasurement: FontTextInstance;

  public measureTextWithoutCache(text: string, maxWidth?: number) {
    return this._textMeasurement.measureText(text, maxWidth);
  }

  /**
   * Returns a BoundingBox that is the total size of the text including multiple lines
   *
   * Does not include any padding or adjustment
   * @param text
   * @returns BoundingBox
   */
  public measureText(text: string, maxWidth?: number): BoundingBox {
    return FontCache.measureText(text, this, maxWidth);
  }

  protected _postDraw(ex: ExcaliburGraphicsContext): void {
    ex.restore();
  }

  public render(ex: ExcaliburGraphicsContext, text: string, colorOverride: Color, x: number, y: number, maxWidth?: number) {
    const textInstance = FontCache.getTextInstance(text, this, colorOverride);

    // Apply affine transformations
    this._textBounds = textInstance.dimensions;
    this._preDraw(ex, x, y);

    textInstance.render(ex, x, y, maxWidth);

    this._postDraw(ex);
  }
}
