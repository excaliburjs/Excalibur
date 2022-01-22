import { Engine } from './Engine';
import { Color } from './Color';
import { vec, Vector } from './Math/vector';
import { Text } from './Graphics/Text';
import { BaseAlign, FontStyle, FontUnit, TextAlign } from './Graphics/FontCommon';
import { obsolete } from './Util/Decorators';
import { SpriteFont as LegacySpriteFont } from './Drawing/SpriteSheet';
import { ExcaliburGraphicsContext, GraphicsComponent, SpriteFont } from './Graphics';
import { Font } from './Graphics/Font';
import { Actor } from './Actor';
import { ActorArgs } from '.';

/**
 * Option for creating a label
 */
export interface LabelOptions {
  /**
   * Specify the label text
   */
  text?: string;
  /**
   * Specify the color of the text (does not apply to SpriteFonts)
   */
  color?: Color;
  x?: number;
  y?: number;
  pos?: Vector;
  /**
   * Optionally specify a sprite font, will take precedence over any other [[Font]]
   */
  spriteFont?: SpriteFont | LegacySpriteFont;
  /**
   * Specify a custom font
   */
  font?: Font
}

/**
 * Labels are the way to draw small amounts of text to the screen. They are
 * actors and inherit all of the benefits and capabilities.
 */
export class Label extends Actor {
  private _font: Font = new Font();
  private _text: Text = new Text({ text: '', font: this._font });

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
    return this._text.opacity;
  }

  public set opacity(opacity: number) {
    this._text.opacity = opacity;
  }

  /**
   * Sets or gets the bold property of the label's text, by default it's false
   * @deprecated Use [[Font.bold|Label.font.bold]]
   */
  @obsolete({
    message: 'Label.bold will be removed in v0.26.0',
    alternateMethod: 'Use Label.font.bold'
  })
  public get bold(): boolean {
    return this.font.bold;
  }

  public set bold(isBold: boolean) {
    this.font.bold = isBold;
  }

  /**
   * The CSS font family string (e.g. `sans-serif`, `Droid Sans Pro`). Web fonts
   * are supported, same as in CSS.
   * @deprecated Use [[Font.family|Label.font.family]]
   */
  @obsolete({
    message: 'Label.fontFamily will be removed in v0.26.0',
    alternateMethod: 'Use Label.font.family'
  })
  public get fontFamily(): string {
    return this.font.family;
  }

  public set fontFamily(family: string) {
    this.font.family = family;
  }

  /**
   * The font size in the selected units, default is 10 (default units is pixel)
   * @deprecated Use [[Font.size|Label.font.size]]
   */
  @obsolete({
    message: 'Label.fontSize will be removed in v0.26.0',
    alternateMethod: 'Use Label.font.size'
  })
  public get fontSize(): number {
    return this.font.size;
  }

  public set fontSize(sizeInUnit: number) {
    this.font.size = sizeInUnit;
  }

  /**
   * The font style for this label, the default is [[FontStyle.Normal]]
   * @deprecated Use [[Font.style|Label.font.style]]
   */
  @obsolete({
    message: 'Label.fontStyle will be removed in v0.26.0',
    alternateMethod: 'Use Label.font.style'
  })
  public get fontStyle(): FontStyle {
    return this.font.style;
  }

  public set fontStyle(style: FontStyle) {
    this.font.style = style;
  }

  /**
   * The css units for a font size such as px, pt, em (SpriteFont only support px), by default is 'px';
   * @deprecated Use [[Font.unit|Label.font.unit]]
   */
  @obsolete({
    message: 'Label.fontUnit will be removed in v0.26.0',
    alternateMethod: 'Use Label.font.unit'
  })
  public get fontUnit(): FontUnit {
    return this.font.unit;
  }

  public set fontUnit(unit: FontUnit) {
    this.font.unit = unit;
  }

  /**
   * Gets or sets the horizontal text alignment property for the label.
   * @deprecated Use [[Font.textAlign|Label.font.textAlign]]
   */
  @obsolete({
    message: 'Label.textAlign will be removed in v0.26.0',
    alternateMethod: 'Use Label.font.textAlign'
  })
  public get textAlign(): TextAlign {
    return this.font.textAlign;
  }

  public set textAlign(align: TextAlign) {
    this.font.textAlign = align;
  }

  /**
   * Gets or sets the baseline alignment property for the label.
   * @deprecated Use [[Font.baseAlign|Label.font.baseAlign]]
   */
  @obsolete({
    message: 'Label.baseAlign will be removed in v0.26.0',
    alternateMethod: 'Use Label.font.baseAlign'
  })
  public get baseAlign(): BaseAlign {
    return this.font.baseAlign;
  }

  public set baseAlign(align: BaseAlign) {
    this.font.baseAlign = align;
  }

  /**
   * Gets or sets the maximum width (in pixels) that the label should occupy
   * @deprecated The maxWidth constraint is gone
   */
  public maxWidth: number;

  private _legacySpriteFont: LegacySpriteFont;
  private _spriteFont: SpriteFont;
  /**
   * The [[LegacyDrawing.SpriteFont]] to use, if any. Overrides [[fontFamily]] if present.
   * @deprecated Use [[SpriteFont]]
   */
  public get spriteFont(): LegacySpriteFont {
    return this._legacySpriteFont;
  }

  public set spriteFont(sf: LegacySpriteFont | SpriteFont) {
    if (sf) {
      if (sf instanceof LegacySpriteFont) {
        this._legacySpriteFont = sf;
        this._spriteFont = SpriteFont.fromLegacySpriteFont(sf);
        this._text.font = this._spriteFont;
        return;
      }
      this._spriteFont = sf;
      this._text.font = this._spriteFont;
    }
  }

  /**
   * Gets or sets the letter spacing on a Label. Only supported with Sprite Fonts.
   * @deprecated Use [[SpriteFont.spacing]]
   */
  public letterSpacing: number = 0; //px

  /**
   * Whether or not the [[SpriteFont]] will be case-sensitive when matching characters.
   * @deprecated Use Graphics.SpriteFont.caseInsensitive
   */
  public caseInsensitive: boolean = true;

  private _graphicsContext: ExcaliburGraphicsContext;

  /**
   * Build a new label
   * @param options
   */
  constructor(options?: LabelOptions & ActorArgs) {
    super(options);
    const {text, pos, x, y, spriteFont, font, color} = options;

    this.pos = pos ?? (x && y ? vec(x, y) : this.pos);
    this.text = text ?? this.text;
    this.font = font ?? this.font;
    this.spriteFont = spriteFont ?? this.spriteFont;
    this._text.color = color ?? this.color;
    const gfx = this.get(GraphicsComponent);
    gfx.anchor = Vector.Zero;
    gfx.use(this._text);
  }

  public _initialize(engine: Engine) {
    super._initialize(engine);
    this._graphicsContext = engine.graphicsContext;
  }

  /**
   * Returns the width of the text in the label (in pixels);
   */
  public getTextWidth(): number {
    return this._text.width;
  }

  /**
   * Sets the text shadow for sprite fonts
   * @param offsetX      The x offset in pixels to place the shadow
   * @param offsetY      The y offset in pixels to place the shadow
   * @param shadowColor  The color of the text shadow
   * @deprecated Use [[Font.shadow|Label.font.shadow]]
   */
  @obsolete({
    message: 'Label.setTextShadow will be removed in v0.26.0',
    alternateMethod: 'Use Label.font.shadow'
  })
  public setTextShadow(offsetX: number, offsetY: number, shadowColor: Color) {
    this.font.shadow = { offset: vec(offsetX, offsetY), blur: 2, color: shadowColor };
  }

  /**
   * Toggles text shadows on or off, only applies when using sprite fonts
   * @deprecated Use [[Font.shadow|Label.font.shadow]]
   */
  @obsolete({
    message: 'Label.useTextShadow will be removed in v0.26.0',
    alternateMethod: 'Use Label.font.shadow'
  })
  public useTextShadow(on: boolean) {
    if (this.spriteFont) {
      this.spriteFont.useTextShadow(on);
    }
  }

  /**
   * Clears the current text shadow
   * @deprecated Use [[Font.shadow|Label.font.shadow]]
   */
  @obsolete({
    message: 'Label.clearTextShadow will be removed in v0.26.0',
    alternateMethod: 'Use Label.font.shadow'
  })
  public clearTextShadow() {
    this.font.shadow = null;
  }

  /**
   * @deprecated signature will change in v0.26.0
   * @param _ctx
   * @param _delta
   */
  public draw(_ctx: CanvasRenderingContext2D, _delta: number) {
    const exctx = this._graphicsContext;
    this._text.draw(exctx, 0, 0);
  }
}
