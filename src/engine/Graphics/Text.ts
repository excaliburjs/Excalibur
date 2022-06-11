import { ExcaliburGraphicsContext } from './Context/ExcaliburGraphicsContext';
import { BoundingBox } from '../Collision/BoundingBox';
import { SpriteFont } from './SpriteFont';
import { Graphic, GraphicOptions } from './Graphic';
import { Color } from '../Color';
import { Font } from './Font';

export interface TextOptions {
  /**
   * Text to draw
   */
  text: string;

  /**
   * Optionally override the font color, currently unsupported by SpriteFont
   */
  color?: Color;

  /**
   * Optionally specify a font, if none specified a default font is used (System sans-serif 10 pixel)
   */
  font?: Font | SpriteFont;
}

/**
 * Represent Text graphics in excalibur
 *
 * Useful for in game labels, ui, or overlays
 */
export class Text extends Graphic {
  public color?: Color;
  constructor(options: TextOptions & GraphicOptions) {
    super(options);
    // This order is important font, color, then text
    this.font = options.font ?? new Font();
    this.color = options.color ?? this.color;
    this.text = options.text;
  }

  public clone(): Text {
    return new Text({
      text: this.text.slice(),
      color: this.color?.clone() ?? Color.Black,
      font: this.font.clone()
    });
  }

  private _text: string = '';
  public get text() {
    return this._text;
  }

  public set text(value: string) {
    this._text = value;
    const bounds = this.font.measureText(this._text);
    this._textWidth = bounds.width;
    this._textHeight = bounds.height;
  }

  private _font: Font | SpriteFont;
  public get font(): Font | SpriteFont {
    return this._font;
  }
  public set font(font: Font | SpriteFont) {
    this._font = font;
  }

  private _textWidth: number = 0;

  public get width() {
    if (this._textWidth === 0) {
      this._calculateDimension();
    }
    return this._textWidth * this.scale.x;
  }

  private _textHeight: number = 0;
  public get height() {
    if (this._textHeight === 0) {
      this._calculateDimension();
    }
    return this._textHeight * this.scale.y;
  }

  private _calculateDimension() {
    const { width, height } = this.font.measureText(this._text);
    this._textWidth = width;
    this._textHeight = height;
  }

  public get localBounds(): BoundingBox {
    return this.font.measureText(this._text).scale(this.scale);
  }

  protected override _rotate(_ex: ExcaliburGraphicsContext) {
    // None this is delegated to font
    // This override erases the default behavior
  }

  protected override _flip(_ex: ExcaliburGraphicsContext) {
    // None this is delegated to font
    // This override erases the default behavior
  }

  protected override _drawImage(ex: ExcaliburGraphicsContext, x: number, y: number) {
    let color = Color.Black;
    if (this.font instanceof Font) {
      color = this.color ?? this.font.color;
    }

    if (this.isStale() || this.font.isStale()) {
      this.font.flipHorizontal = this.flipHorizontal;
      this.font.flipVertical = this.flipVertical;
      this.font.rotation = this.rotation;
      this.font.origin = this.origin;
      this.font.opacity = this.opacity;
    }
    this.font.tint = this.tint;

    const { width, height } = this.font.measureText(this._text);
    this._textWidth = width;
    this._textHeight = height;

    this.font.render(ex, this._text, color, x, y);
    if (this.font.showDebug) {
      ex.debug.drawRect(x - width, y - height, width * 2, height * 2);
    }
  }
}
