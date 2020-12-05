import { Engine } from './Engine';
import { Color } from './Drawing/Color';
import { Configurable } from './Configurable';
import { vec, Vector } from './Algebra';
import { Text } from './Graphics/Text';
import { BaseAlign, FontStyle, FontUnit, TextAlign } from './Graphics/FontCommon';
import { obsolete } from './Util/Decorators';
import { SpriteFont as LegacySpriteFont } from './Drawing/SpriteSheet';
import { ExcaliburGraphicsContext, GraphicsComponent, SpriteFont } from './Graphics';
import { Font } from './Graphics/Font';
import { CanvasDrawComponent } from './Drawing/Index';
import { TransformComponent } from './EntityComponentSystem';
import { Actor } from './Actor';

export interface LabelOptions {
  text?: string;
  x?: number;
  y?: number;
  bold?: boolean;
  pos?: Vector;
  spriteFont?: LegacySpriteFont;
  fontFamily?: string;
  fontSize?: number;
  fontStyle?: FontStyle;
  fontUnit?: FontUnit;
  textAlign?: TextAlign;
}

/**
 * @hidden
 */
export class LabelImpl extends Actor {
  public font: Font = new Font();
  private _text: Text = new Text({ text: '', font: this.font});

  /**
   * The text to draw.
   */
  public get text(): string {
    return this._text.text;
  }

  public set text(text: string) {
    this._text.text = text;
  }

  public get color(): Color {
    return this._text.color;
  }

  public set color(color: Color) {
    this._text.color = color;
  }

  /**
   * Sets or gets the bold property of the label's text, by default it's false
   * @deprecated Use Label.font.bold
   */
  @obsolete()
  public get bold(): boolean {
    return this.font.bold;
  }

  public set bold(isBold: boolean) {
    this.font.bold = isBold;
  }


  /**
   * The CSS font family string (e.g. `sans-serif`, `Droid Sans Pro`). Web fonts
   * are supported, same as in CSS.
   * @deprecated Use [[Label.font.family]]
   */
  @obsolete()
  public get fontFamily(): string {
    return this.font.family;
  }

  public set fontFamily(family: string) {
    this.font.family = family;
  }

  /**
   * The font size in the selected units, default is 10 (default units is pixel)
   * @deprecated Use [[Label.font.size]]
   */
  @obsolete()
  public get fontSize(): number {
    return this.font.size;
  }

  public set fontSize(sizeInUnit: number) {
    this.font.size = sizeInUnit;
  }

  /**
   * The font style for this label, the default is [[FontStyle.Normal]]
   * @deprecated Use [[Label.font.style]]
   */
  @obsolete()
  public get fontStyle(): FontStyle {
    return this.font.style;
  }

  public set fontStyle(style: FontStyle) {
    this.font.style = style;
  }


  /**
   * The css units for a font size such as px, pt, em (SpriteFont only support px), by default is 'px';
   * @deprecated Use [[Label.font.unit]]
   */
  @obsolete()
  public get fontUnit(): FontUnit {
    return this.font.unit;
  }

  public set fontUnit(unit: FontUnit) {
    this.font.unit = unit;
  }

  /**
   * Gets or sets the horizontal text alignment property for the label.
   * @deprecated Use [[Label.font.textAlign]]
   */
  @obsolete()
  public get textAlign(): TextAlign {
    return this.font.textAlign;
  }

  public set textAlign(align: TextAlign) {
    this.font.textAlign = align;
  }

  /**
   * Gets or sets the baseline alignment property for the label.
   * @deprecated Use [[Label.font.baseAlign]]
   */
  @obsolete()
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
   * The [[SpriteFont]] to use, if any. Overrides [[fontFamily]] if present.
   * @deprecated Use [[Graphics.SpriteFont]]
   */
  @obsolete()
  public get spriteFont(): LegacySpriteFont {
    return this._legacySpriteFont;
  }

  public set spriteFont(sf: LegacySpriteFont) {
    this._legacySpriteFont = sf;
    if (sf) {
      this._spriteFont = SpriteFont.fromLegacySpriteFont(sf);
      this._text.font = this._spriteFont;
    }
  }


  /**
   * Gets or sets the letter spacing on a Label. Only supported with Sprite Fonts.
   * @deprecated Use [[Graphics.SpriteFont.spacing]]
   */
  public letterSpacing: number = 0; //px

  /**
   * Whether or not the [[SpriteFont]] will be case-sensitive when matching characters.
   * @deprecated Use [[Graphics.SpriteFont.caseInsensitive]]
   */
  public caseInsensitive: boolean = true;

  private _graphicsContext: ExcaliburGraphicsContext;

  /**
   * @param textOrConfig    The text of the label, or label option bag
   * @param x           The x position of the label
   * @param y           The y position of the label
   * @param fontFamily  Use a value that is valid for the CSS `font-family` property. The default is `sans-serif`.
   * @param spriteFont  Use an Excalibur sprite font for the label's font, if a SpriteFont is provided it will take precedence
   * over a css font.
   */
  constructor(textOrConfig?: string | LabelOptions, x?: number, y?: number, fontFamily?: string, spriteFont?: LegacySpriteFont) {
    super();
    let text = '';
    let pos = Vector.Zero;
    if (textOrConfig && typeof textOrConfig === 'object') {
      fontFamily = textOrConfig.fontFamily;
      spriteFont = textOrConfig.spriteFont;
      text = textOrConfig.text;
      pos = textOrConfig.pos ?? vec(textOrConfig.x ?? 0, textOrConfig.y ?? 0);
    } else {
      text = <string>textOrConfig;
      pos = vec(x ?? 0, y ?? 0);
    }

    this.addComponent(new TransformComponent);
    this.components.transform.pos = pos;

    this.addComponent(new CanvasDrawComponent((ctx, delta) => this.draw(ctx, delta)));
    this.addComponent(new GraphicsComponent);
    this.components.graphics.swap(this._text);

    this.text = text || '';
    this.color = Color.Black;
    if (fontFamily) {
      this.font.family = fontFamily;
    }
    if (spriteFont) {
      this.spriteFont = spriteFont;
    }
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
   * @deprecated Use [[Label.font.shadow]]
   */
  @obsolete()
  public setTextShadow(offsetX: number, offsetY: number, shadowColor: Color) {
    this.font.shadow = { offset: vec(offsetX, offsetY), blur: 2, color: shadowColor };
  }

  /**
   * Toggles text shadows on or off, only applies when using sprite fonts
   * @deprecated Use [[Label.font.shadow]]
   */
  @obsolete()
  public useTextShadow(on: boolean) {
    if (this.spriteFont) {
      this.spriteFont.useTextShadow(on);
    }
  }

  /**
   * Clears the current text shadow
   * @deprecated Use [[Label.font.shadow]]
   */
  @obsolete()
  public clearTextShadow() {
    this.font.shadow = null;
  }

  public draw(_ctx: CanvasRenderingContext2D, _delta: number) {
    const exctx = this._graphicsContext;
    this._text.draw(exctx, 0, 0);
  }
}

/**
 * Labels are the way to draw small amounts of text to the screen. They are
 * actors and inherit all of the benefits and capabilities.
 */
export class Label extends Configurable(LabelImpl) {
  constructor();
  constructor(config?: LabelOptions);
  constructor(text?: string, x?: number, y?: number, fontFamily?: string, spriteFont?: LegacySpriteFont);
  constructor(textOrConfig?: string | LabelOptions, x?: number, y?: number, fontFamily?: string, spriteFont?: LegacySpriteFont) {
    super(textOrConfig, x, y, fontFamily, spriteFont);
  }
}
