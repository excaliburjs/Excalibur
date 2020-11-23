import { Color } from '../Drawing/Color';
import { Vector } from '../Algebra';

/**
 * Enum representing the different font size units
 * https://developer.mozilla.org/en-US/docs/Web/CSS/font-size
 */
export enum FontUnit {
  /**
   * Em is a scalable unit, 1 em is equal to the current font size of the current element, parent elements can effect em values
   */
  Em = 'em',
  /**
   * Rem is similar to the Em, it is a scalable unit. 1 rem is equal to the font size of the root element
   */
  Rem = 'rem',
  /**
   * Pixel is a unit of length in screen pixels
   */
  Px = 'px',
  /**
   * Point is a physical unit length (1/72 of an inch)
   */
  Pt = 'pt',
  /**
   * Percent is a scalable unit similar to Em, the only difference is the Em units scale faster when Text-Size stuff
   */
  Percent = '%'
}

/**
 * Enum representing the different horizontal text alignments
 */
export enum TextAlign {
  /**
   * The text is left-aligned.
   */
  Left = 'left',
  /**
   * The text is right-aligned.
   */
  Right = 'right',
  /**
   * The text is centered.
   */
  Center = 'center',
  /**
   * The text is aligned at the normal start of the line (left-aligned for left-to-right locales,
   * right-aligned for right-to-left locales).
   */
  Start = 'start',
  /**
   * The text is aligned at the normal end of the line (right-aligned for left-to-right locales,
   * left-aligned for right-to-left locales).
   */
  End = 'end'
}

/**
 * Enum representing the different baseline text alignments
 */
export enum BaseAlign {
  /**
   * The text baseline is the top of the em square.
   */
  Top = 'top',
  /**
   * The text baseline is the hanging baseline.  Currently unsupported; this will act like
   * alphabetic.
   */
  Hanging = 'hanging',
  /**
   * The text baseline is the middle of the em square.
   */
  Middle = 'middle',
  /**
   * The text baseline is the normal alphabetic baseline.
   */
  Alphabetic = 'alphabetic',
  /**
   * The text baseline is the ideographic baseline; this is the bottom of
   * the body of the characters, if the main body of characters protrudes
   * beneath the alphabetic baseline.  Currently unsupported; this will
   * act like alphabetic.
   */
  Ideographic = 'ideographic',
  /**
   * The text baseline is the bottom of the bounding box.  This differs
   * from the ideographic baseline in that the ideographic baseline
   * doesn't consider descenders.
   */
  Bottom = 'bottom'
}

/**
 * Enum representing the different possible font styles
 */
export enum FontStyle {
  Normal = 'normal',
  Italic = 'italic',
  Oblique = 'oblique'
}

export enum Direction {
  LeftToRight = 'ltr',
  RightToLeft = 'rtl'
}

export interface FontOptions {
  size?: number;
  unit?: FontUnit;
  family?: string;
  style?: FontStyle;
  bold?: boolean;
  textAlign?: TextAlign;
  baseAlign?: BaseAlign;
  direction?: Direction;
  shadow?: {
    blur?: number;
    offset?: Vector;
    color?: Color;
  };
}

export class Font {
  public family: string = 'sans-serif';
  public style: FontStyle = FontStyle.Normal;
  public bold: boolean = false;
  public unit: FontUnit = FontUnit.Px;
  public textAlign: TextAlign = TextAlign.Left;
  public baseAlign: BaseAlign = BaseAlign.Alphabetic;
  public direction: Direction = Direction.LeftToRight;
  public size: number = 10;
  public shadow: { blur: number; offset: Vector; color: Color } = null;

  constructor(options?: FontOptions) {
    if (options) {
      this.family = options.family ?? this.family;
      this.style = options.style ?? this.style;
      this.bold = options.bold ?? this.bold;
      this.size = options.size ?? this.size;
      this.unit = options.unit ?? this.unit;
      this.textAlign = options.textAlign ?? this.textAlign;
      this.baseAlign = options.baseAlign ?? this.baseAlign;
      this.direction = options.direction ?? this.direction;
      if (options.shadow) {
        this.shadow.blur = options.shadow.blur ?? this.shadow.blur;
        this.shadow.offset = options.shadow.offset ?? this.shadow.offset;
        this.shadow.color = options.shadow.color ?? this.shadow.color;
      }
    }
  }

  public get fontString() {
    return `${this.style} ${this.bold ? 'bold' : ''} ${this.size}${this.unit} ${this.family}`;
  }

  public apply(ctx: CanvasRenderingContext2D) {
    ctx.textAlign = this.textAlign;
    ctx.textBaseline = this.baseAlign;
    ctx.font = this.fontString;
    ctx.direction = this.direction;

    if (this.shadow) {
      ctx.shadowColor = this.shadow.color.toString();
      ctx.shadowBlur = this.shadow.blur;
      ctx.shadowOffsetX = this.shadow.offset.x;
      ctx.shadowOffsetY = this.shadow.offset.y;
    }
  }
  public clone(): Font {
    return new Font({
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
}
