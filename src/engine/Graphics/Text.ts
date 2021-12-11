import { ExcaliburGraphicsContext } from './Context/ExcaliburGraphicsContext';
import { BoundingBox } from '../Collision/BoundingBox';
import { SpriteFont } from './SpriteFont';
import { Graphic, GraphicOptions } from './Graphic';
import { Color } from '../Color';
import { Font } from './Font';

export interface TextOptions {
  text: string;
  color?: Color;
  font?: Font | SpriteFont;
}

export class Text extends Graphic {
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
      color: this.color.clone(),
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

  // TODO SpriteFont doesn't support a color yet :(
  public get color() {
    if (this.font instanceof Font) {
      return this.font.color;
    }
    return Color.Black;
  }

  public set color(color: Color) {
    if (this.font instanceof Font) {
      this.font.color = color;
    }
  }

  private _font: Font | SpriteFont;
  public get font(): Font | SpriteFont {
    return this._font;
  }
  public set font(font: Font | SpriteFont) {
    this._font = font;
  }

  private _textWidth: number = 0;
  /**
   * TODO not set until the first draw
   */
  public get width() {
    return this._textWidth;
  }

  private _textHeight: number = 0;
  public get height() {
    return this._textHeight;
  }

  public get localBounds(): BoundingBox {
    return this.font.measureText(this._text);
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
    if (this.font instanceof Font) {
      this.font.color = this.color;
    }
    const { width, height } = this.font.measureText(this._text);
    this._textWidth = width;
    this._textHeight = height;

    // TODO this mutates the font, we should render without mutating the font
    this.font.flipHorizontal = this.flipHorizontal;
    this.font.flipVertical = this.flipVertical;
    this.font.scale = this.scale;
    this.font.rotation = this.rotation;
    this.font.origin = this.origin;
    this.font.opacity = this.opacity;
    this.font.render(ex, this._text, x, y);
  }
}
