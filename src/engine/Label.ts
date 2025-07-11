import type { Engine } from './Engine';
import type { Color } from './Color';
import { vec, Vector } from './Math/vector';
import { Text } from './Graphics/Text';
import type { SpriteFont } from './Graphics';
import { GraphicsComponent } from './Graphics';
import { Font } from './Graphics/Font';
import { Actor } from './Actor';
import type { ActorArgs } from './Actor';

/**
 * Option for creating a label
 */
export interface LabelOptions {
  /**
   * Specify the label text
   */
  text?: string;

  /**
   * Specify a max width for the text in pixels, if specified the text will wrap.
   *
   * **Not supported in SpriteFont**
   */
  maxWidth?: number;
  /**
   * Specify the color of the text (does not apply to SpriteFonts)
   */
  color?: Color;
  x?: number;
  y?: number;
  pos?: Vector;
  /**
   * Optionally specify a sprite font, will take precedence over any other {@apilink Font}
   */
  spriteFont?: SpriteFont;
  /**
   * Specify a custom font
   */
  font?: Font;
}

/**
 * Labels are the way to draw small amounts of text to the screen. They are
 * actors and inherit all of the benefits and capabilities.
 */
export class Label extends Actor {
  private _font: Font = new Font();
  private _text: Text = new Text({ text: '', font: this._font });

  public set maxWidth(width: number | undefined) {
    this._text.maxWidth = width;
  }

  public get maxWidth(): number | undefined {
    return this._text.maxWidth;
  }

  public get font(): Font {
    return this._font;
  }

  public set font(newFont: Font) {
    this._font = newFont;
    this._text.font = newFont;
  }

  /**
   * The text to draw.
   */
  public get text(): string {
    return this._text.text;
  }

  public set text(text: string) {
    this._text.text = text;
  }

  public override get color(): Color {
    return this._text.color;
  }

  public override set color(color: Color) {
    if (this._text) {
      this._text.color = color;
    }
  }

  public get opacity(): number {
    return this.graphics.opacity;
  }

  public set opacity(opacity: number) {
    this.graphics.opacity = opacity;
  }

  private _spriteFont: SpriteFont;
  /**
   * The {@apilink SpriteFont} to use, if any. Overrides {@apilink Font | `font`} if present.
   */
  public get spriteFont(): SpriteFont {
    return this._spriteFont;
  }

  public set spriteFont(sf: SpriteFont) {
    if (sf) {
      this._spriteFont = sf;
      this._text.font = this._spriteFont;
    }
  }

  /**
   * Build a new label
   * @param options
   */
  constructor(options?: LabelOptions & ActorArgs) {
    super(options);
    const { text, pos, x, y, spriteFont, font, color, maxWidth } = { text: '', ...options };

    this.pos = pos ?? (x && y ? vec(x, y) : this.pos);
    this.text = text ?? this.text;
    this.font = font ?? this.font;
    this.maxWidth = maxWidth ?? this.maxWidth;
    this.spriteFont = spriteFont ?? this.spriteFont;
    this._text.color = color ?? this.color;
    const gfx = this.get(GraphicsComponent);
    gfx.anchor = Vector.Zero;
    gfx.use(this._text);
  }

  public _initialize(engine: Engine) {
    super._initialize(engine);
  }

  /**
   * Returns the width of the text in the label (in pixels);
   */
  public getTextWidth(): number {
    return this._text.width;
  }
}
