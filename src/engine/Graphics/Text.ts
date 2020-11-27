import { ExcaliburGraphicsContext } from './Context/ExcaliburGraphicsContext';
import { BoundingBox } from '../Collision/BoundingBox';
import { SpriteFont } from './SpriteFont';
import { Graphic, GraphicOptions } from './Graphic';
import { Color } from '../Drawing/Color';
import { Font } from './Font';

export interface TextOptions {
  text: string;
  font?: Font | SpriteFont;
}

export class Text extends Graphic {
  constructor(options: TextOptions & GraphicOptions) {
    super(options);
    this.text = options.text;
    this.font = options.font ?? new Font();
  }

  public clone(): Text {
    return new Text({
      text: this.text.slice(),
      font: this.font.clone()
    });
  }

  private _text: string = '';
  public get text() {
    return this._text;
  }

  public set text(value: string) {
    this._text = value;
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

  public set width(value: number) {
    this.font.width = value;
  }

  public get height() {
    return this.font.height;
  }

  public set height(value: number) {
    this.font.height = value;
  }

  public get localBounds(): BoundingBox {
    return this.font.localBounds;
  }

  protected _rotate(_ex: ExcaliburGraphicsContext) {
    // None this is delegated to font
  }

  protected _flip(_ex: ExcaliburGraphicsContext) {
    // None this is delegated to font
  }

  protected _drawImage(ex: ExcaliburGraphicsContext, x: number, y: number) {
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
