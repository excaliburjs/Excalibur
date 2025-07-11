import type { BoundingBox } from '../Collision/BoundingBox';
import type { Color } from '../Color';
import type { Vector } from '../Math/vector';
import type { ExcaliburGraphicsContext } from './Context/ExcaliburGraphicsContext';

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

/**
 * Enum representing the text direction, useful for other languages, or writing text in reverse
 */
export enum Direction {
  LeftToRight = 'ltr',
  RightToLeft = 'rtl'
}

/**
 * Font rendering option
 */
export interface FontOptions {
  /**
   * Optionally the size of the font in the specified {@apilink FontUnit} by default 10.
   */
  size?: number;
  /**
   * Optionally specify unit to measure fonts in, by default Pixels
   */
  unit?: FontUnit;
  /**
   * Optionally specify the font family, by default 'sans-serif'
   */
  family?: string;
  /**
   * Optionally specify the font style, by default Normal
   */
  style?: FontStyle;
  /**
   * Optionally set whether the font is bold, by default false
   */
  bold?: boolean;
  /**
   * Optionally specify the text align, by default Left
   */
  textAlign?: TextAlign;
  /**
   * Optionally specify the text base align, by default Alphabetic
   */
  baseAlign?: BaseAlign;
  /**
   * Optionally specify the text direction, by default LeftToRight
   */
  direction?: Direction;
  /**
   * Optionally override the text line height in pixels, useful for multiline text. If unset will use default.
   */
  lineHeight?: number | undefined;
  /**
   * Optionally specify the quality of the text bitmap, it is a multiplier on the size size, by default 2.
   * Higher quality text has a higher memory impact
   */
  quality?: number;
  /**
   * Optionally specify a text shadow, by default none is specified
   */
  shadow?: {
    blur?: number;
    offset?: Vector;
    color?: Color;
  };
}

/**
 * @internal
 */
export interface FontRenderer {
  measureText(text: string): BoundingBox;
  render(ex: ExcaliburGraphicsContext, text: string, color: Color, x: number, y: number): void;
}
