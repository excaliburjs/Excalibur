import { Engine } from './Engine';
import { Color } from './Drawing/Color';
import { SpriteFont } from './Drawing/SpriteSheet';
import { Actor } from './Actor';
import { Configurable } from './Configurable';
import { Vector } from './Algebra';
import { CollisionType } from './Collision/CollisionType';
/**
 * Enum representing the different font size units
 * https://developer.mozilla.org/en-US/docs/Web/CSS/font-size
 */
export enum FontUnit {
  /**
   * Em is a scalable unit, 1 em is equal to the current font size of the current element, parent elements can effect em values
   */
  Em,
  /**
   * Rem is similar to the Em, it is a scalable unit. 1 rem is equal to the font size of the root element
   */
  Rem,
  /**
   * Pixel is a unit of length in screen pixels
   */
  Px,
  /**
   * Point is a physical unit length (1/72 of an inch)
   */
  Pt,
  /**
   * Percent is a scalable unit similar to Em, the only difference is the Em units scale faster when Text-Size stuff
   */
  Percent
}

/**
 * Enum representing the different horizontal text alignments
 */
export enum TextAlign {
  /**
   * The text is left-aligned.
   */
  Left,
  /**
   * The text is right-aligned.
   */
  Right,
  /**
   * The text is centered.
   */
  Center,
  /**
   * The text is aligned at the normal start of the line (left-aligned for left-to-right locales,
   * right-aligned for right-to-left locales).
   */
  Start,
  /**
   * The text is aligned at the normal end of the line (right-aligned for left-to-right locales,
   * left-aligned for right-to-left locales).
   */
  End
}

/**
 * Enum representing the different baseline text alignments
 */
export enum BaseAlign {
  /**
   * The text baseline is the top of the em square.
   */
  Top,
  /**
   * The text baseline is the hanging baseline.  Currently unsupported; this will act like
   * alphabetic.
   */
  Hanging,
  /**
   * The text baseline is the middle of the em square.
   */
  Middle,
  /**
   * The text baseline is the normal alphabetic baseline.
   */
  Alphabetic,
  /**
   * The text baseline is the ideographic baseline; this is the bottom of
   * the body of the characters, if the main body of characters protrudes
   * beneath the alphabetic baseline.  Currently unsupported; this will
   * act like alphabetic.
   */
  Ideographic,
  /**
   * The text baseline is the bottom of the bounding box.  This differs
   * from the ideographic baseline in that the ideographic baseline
   * doesn't consider descenders.
   */
  Bottom
}

/**
 * Enum representing the different possible font styles
 */
export enum FontStyle {
  Normal,
  Italic,
  Oblique
}

export interface LabelArgs extends Partial<LabelImpl> {
  x?: number;
  y?: number;
  text?: string;
  bold?: boolean;
  pos?: Vector;
  spriteFont?: SpriteFont;
  fontFamily?: string;
  fontSize?: number;
  fontStyle?: FontStyle;
  fontUnit?: FontUnit;
  textAlign?: TextAlign;
  maxWidth?: number;
}

/**
 * @hidden
 */
export class LabelImpl extends Actor {
  /**
   * The text to draw.
   */
  public text: string;

  /**
   * Sets or gets the bold property of the label's text, by default it's false
   */
  public bold: boolean = false;

  /**
   * The [[SpriteFont]] to use, if any. Overrides [[fontFamily]] if present.
   */
  public spriteFont: SpriteFont;

  /**
   * The CSS font family string (e.g. `sans-serif`, `Droid Sans Pro`). Web fonts
   * are supported, same as in CSS.
   */
  public fontFamily: string;

  /**
   * The font size in the selected units, default is 10 (default units is pixel)
   */
  public fontSize: number = 10;

  /**
   * The font style for this label, the default is [[FontStyle.Normal]]
   */
  public fontStyle: FontStyle = FontStyle.Normal;

  /**
   * The css units for a font size such as px, pt, em (SpriteFont only support px), by default is 'px';
   */
  public fontUnit: FontUnit = FontUnit.Px;

  /**
   * Gets or sets the horizontal text alignment property for the label.
   */
  public textAlign: TextAlign = TextAlign.Left;

  /**
   * Gets or sets the baseline alignment property for the label.
   */
  public baseAlign: BaseAlign = BaseAlign.Bottom;

  /**
   * Gets or sets the maximum width (in pixels) that the label should occupy
   */
  public maxWidth: number;

  /**
   * Gets or sets the letter spacing on a Label. Only supported with Sprite Fonts.
   */
  public letterSpacing: number = 0; //px

  /**
   * Whether or not the [[SpriteFont]] will be case-sensitive when matching characters.
   */
  public caseInsensitive: boolean = true;

  private _textShadowOn: boolean;
  private _shadowOffsetX: number;
  private _shadowOffsetY: number;

  /**
   * @param textOrConfig    The text of the label, or label option bag
   * @param x           The x position of the label
   * @param y           The y position of the label
   * @param fontFamily  Use a value that is valid for the CSS `font-family` property. The default is `sans-serif`.
   * @param spriteFont  Use an Excalibur sprite font for the label's font, if a SpriteFont is provided it will take precedence
   * over a css font.
   */
  constructor(textOrConfig?: string | Partial<LabelImpl>, x?: number, y?: number, fontFamily?: string, spriteFont?: SpriteFont) {
    super(textOrConfig && typeof textOrConfig === 'object' ? textOrConfig : { pos: new Vector(x, y) });

    let text = '';
    if (textOrConfig && typeof textOrConfig === 'object') {
      fontFamily = textOrConfig.fontFamily;
      spriteFont = textOrConfig.spriteFont;
      text = textOrConfig.text;
    } else {
      text = <string>textOrConfig;
    }

    this.text = text || '';
    this.color = Color.Black;
    this.spriteFont = spriteFont;
    this.body.collider.type = CollisionType.PreventCollision;
    this.fontFamily = fontFamily || 'sans-serif'; // coalesce to default canvas font

    this._textShadowOn = false;
    this._shadowOffsetX = 0;
    this._shadowOffsetY = 0;
    if (spriteFont) {
      //this._textSprites = spriteFont.getTextSprites();
    }
  }

  /**
   * Returns the width of the text in the label (in pixels);
   * @param ctx  Rendering context to measure the string with
   */
  public getTextWidth(ctx: CanvasRenderingContext2D): number {
    const oldFont = ctx.font;
    ctx.font = this._fontString;
    const width = ctx.measureText(this.text).width;
    ctx.font = oldFont;
    return width;
  }

  // TypeScript doesn't support string enums :(
  private _lookupFontUnit(fontUnit: FontUnit): string {
    switch (fontUnit) {
      case FontUnit.Em:
        return 'em';
      case FontUnit.Rem:
        return 'rem';
      case FontUnit.Pt:
        return 'pt';
      case FontUnit.Px:
        return 'px';
      case FontUnit.Percent:
        return '%';
      default:
        return 'px';
    }
  }

  private _lookupTextAlign(textAlign: TextAlign): CanvasTextAlign {
    switch (textAlign) {
      case TextAlign.Left:
        return 'left';
      case TextAlign.Right:
        return 'right';
      case TextAlign.Center:
        return 'center';
      case TextAlign.End:
        return 'end';
      case TextAlign.Start:
        return 'start';
      default:
        return 'start';
    }
  }

  private _lookupBaseAlign(baseAlign: BaseAlign): CanvasTextBaseline {
    switch (baseAlign) {
      case BaseAlign.Alphabetic:
        return 'alphabetic';
      case BaseAlign.Bottom:
        return 'bottom';
      case BaseAlign.Hanging:
        return 'hanging';
      case BaseAlign.Ideographic:
        return 'ideographic';
      case BaseAlign.Middle:
        return 'middle';
      case BaseAlign.Top:
        return 'top';
      default:
        return 'alphabetic';
    }
  }

  private _lookupFontStyle(fontStyle: FontStyle): string {
    const boldstring = this.bold ? ' bold' : '';
    switch (fontStyle) {
      case FontStyle.Italic:
        return 'italic' + boldstring;
      case FontStyle.Normal:
        return 'normal' + boldstring;
      case FontStyle.Oblique:
        return 'oblique' + boldstring;
      default:
        return 'normal' + boldstring;
    }
  }

  /**
   * Sets the text shadow for sprite fonts
   * @param offsetX      The x offset in pixels to place the shadow
   * @param offsetY      The y offset in pixels to place the shadow
   * @param shadowColor  The color of the text shadow
   */
  public setTextShadow(offsetX: number, offsetY: number, shadowColor: Color) {
    this.spriteFont.setTextShadow(offsetX, offsetY, shadowColor);
  }

  /**
   * Toggles text shadows on or off, only applies when using sprite fonts
   */
  public useTextShadow(on: boolean) {
    this.spriteFont.useTextShadow(on);
  }

  /**
   * Clears the current text shadow
   */
  public clearTextShadow() {
    this._textShadowOn = false;
    this._shadowOffsetX = 0;
    this._shadowOffsetY = 0;
  }

  public update(engine: Engine, delta: number) {
    super.update(engine, delta);
  }

  public draw(ctx: CanvasRenderingContext2D, delta: number) {
    ctx.save();
    if (this._textShadowOn) {
      ctx.save();
      ctx.translate(this._shadowOffsetX, this._shadowOffsetY);
      this._fontDraw(ctx);
      ctx.restore();
    }
    this._fontDraw(ctx);

    super.draw(ctx, delta);
    ctx.restore();
  }

  private _fontDraw(ctx: CanvasRenderingContext2D) {
    if (this.spriteFont) {
      this.spriteFont.draw(ctx, this.text, 0, 0, {
        color: this.color.clone(),
        baseAlign: this.baseAlign,
        textAlign: this.textAlign,
        fontSize: this.fontSize,
        letterSpacing: this.letterSpacing,
        opacity: this.opacity
      });
    } else {
      const oldAlign = ctx.textAlign;
      const oldTextBaseline = ctx.textBaseline;

      ctx.textAlign = this._lookupTextAlign(this.textAlign);
      ctx.textBaseline = this._lookupBaseAlign(this.baseAlign);
      if (this.color) {
        this.color.a = this.opacity;
      }
      ctx.fillStyle = this.color.toString();
      ctx.font = this._fontString;
      if (this.maxWidth) {
        ctx.fillText(this.text, 0, 0, this.maxWidth);
      } else {
        ctx.fillText(this.text, 0, 0);
      }

      ctx.textAlign = oldAlign;
      ctx.textBaseline = oldTextBaseline;
    }
  }

  protected get _fontString() {
    return `${this._lookupFontStyle(this.fontStyle)} ${this.fontSize}${this._lookupFontUnit(this.fontUnit)} ${this.fontFamily}`;
  }

  public debugDraw(ctx: CanvasRenderingContext2D) {
    super.debugDraw(ctx);
  }
}

/**
 * Labels are the way to draw small amounts of text to the screen. They are
 * actors and inherit all of the benefits and capabilities.
 */
export class Label extends Configurable(LabelImpl) {
  constructor();
  constructor(config?: LabelArgs);
  constructor(text?: string, x?: number, y?: number, fontFamily?: string, spriteFont?: SpriteFont);
  constructor(textOrConfig?: string | LabelArgs, x?: number, y?: number, fontFamily?: string, spriteFont?: SpriteFont) {
    super(textOrConfig, x, y, fontFamily, spriteFont);
  }
}
