import { ExcaliburGraphicsContext } from './Context/ExcaliburGraphicsContext';
import { BoundingBox } from '../Collision/BoundingBox';
import { SpriteFont } from './SpriteFont';
import { Graphic, GraphicOptions } from './Graphic';
import { Color } from '../Drawing/Color';
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
    if (this.font instanceof Font) {
      this.font.updateText(value);
    }
  }

  // TODO SpriteFont doesn't support a color :O
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

  public font: Font | SpriteFont;

  public get width() {
    return this.font.width;
  }

  public get height() {
    return this.font.height;
  }

  public get localBounds(): BoundingBox {
    return this.font.localBounds;
  }

  protected _rotate(_ex: ExcaliburGraphicsContext) {
    // None this is delegated to font
    // This override erases the default behavior
  }

  protected _flip(_ex: ExcaliburGraphicsContext) {
    // None this is delegated to font
    // This override erases the default behavior
  }

  protected _drawImage(ex: ExcaliburGraphicsContext, x: number, y: number) {
    if (this.font instanceof Font) {
      this.font.color = this.color;
    }
    this.font.flipHorizontal = this.flipHorizontal;
    this.font.flipVertical = this.flipVertical;
    this.font.scale = this.scale;
    this.font.rotation = this.rotation;
    this.font.origin = this.origin;
    this.font.opacity = this.opacity;
    this.font.render(ex, this._text, x, y);
  }

  public getSource() {
    return this.font.getSource();
  }

  public getSourceId() {
    return this.font.getSourceId();
  }
}
