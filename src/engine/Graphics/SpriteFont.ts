import { Vector } from '../Math/vector';
import { Logger } from '../Util/Log';
import type { ExcaliburGraphicsContext } from './Context/ExcaliburGraphicsContext';
import type { FontRenderer } from './FontCommon';
import type { GraphicOptions } from './Graphic';
import { Graphic } from './Graphic';
import type { Sprite } from './Sprite';
import type { SpriteSheet } from './SpriteSheet';
import { BoundingBox } from '../Collision/BoundingBox';

export interface SpriteFontOptions {
  /**
   * Alphabet string in spritesheet order (default is row column order)
   * example: 'abcdefghijklmnopqrstuvwxyz'
   */
  alphabet: string;
  /**
   * {@apilink SpriteSheet} to source character sprites from
   */
  spriteSheet: SpriteSheet;
  /**
   * Optionally ignore case in the supplied text;
   */
  caseInsensitive?: boolean;
  /**
   * Optionally override the text line height, useful for multiline text. If unset will use default.
   */
  lineHeight?: number | undefined;
  /**
   * Optionally adjust the spacing between character sprites
   */
  spacing?: number;
  /**
   * Optionally specify a "shadow"
   */
  shadow?: { offset: Vector };
}

export class SpriteFont extends Graphic implements FontRenderer {
  private _text: string = '';
  public alphabet: string = '';
  public spriteSheet: SpriteSheet;

  public shadow?: { offset: Vector } = undefined;
  public caseInsensitive = false;
  public spacing: number = 0;
  public lineHeight: number | undefined = undefined;

  private _logger = Logger.getInstance();

  constructor(options: SpriteFontOptions & GraphicOptions) {
    super(options);
    const { alphabet, spriteSheet, caseInsensitive, spacing, shadow, lineHeight } = options;
    this.alphabet = alphabet;
    this.spriteSheet = spriteSheet;
    this.caseInsensitive = caseInsensitive ?? this.caseInsensitive;
    this.spacing = spacing ?? this.spacing;
    this.shadow = shadow ?? this.shadow;
    this.lineHeight = lineHeight ?? this.lineHeight;
  }

  protected _getCharacterSprites(text: string): Sprite[] {
    const results: Sprite[] = [];
    // handle case insensitive
    const textToRender = this.caseInsensitive ? text.toLocaleLowerCase() : text;
    const alphabet = this.caseInsensitive ? this.alphabet.toLocaleLowerCase() : this.alphabet;

    // for each letter in text
    for (let letterIndex = 0; letterIndex < textToRender.length; letterIndex++) {
      // find the sprite index in alphabet , if there is an error pick the first
      const letter = textToRender[letterIndex];
      let spriteIndex = alphabet.indexOf(letter);
      if (spriteIndex === -1) {
        spriteIndex = 0;
        this._logger.warnOnce(`SpriteFont - Cannot find letter '${letter}' in configured alphabet '${alphabet}'.`);
        this._logger.warnOnce('There maybe be more issues in the SpriteFont configuration. No additional warnings will be logged.');
      }

      const letterSprite = this.spriteSheet.sprites[spriteIndex];
      if (letterSprite) {
        results.push(letterSprite);
      } else {
        this._logger.warnOnce(`SpriteFont - Cannot find sprite for '${letter}' at index '${spriteIndex}' in configured SpriteSheet`);
        this._logger.warnOnce('There maybe be more issues in the SpriteFont configuration. No additional warnings will be logged.');
      }
    }
    return results;
  }

  public measureText(text: string, maxWidth?: number): BoundingBox {
    const lines = this._getLinesFromText(text, maxWidth);
    const maxWidthLine = lines.reduce((a, b) => {
      return a.length > b.length ? a : b;
    });
    const sprites = this._getCharacterSprites(maxWidthLine);
    let width = 0;
    let height = 0;
    for (const sprite of sprites) {
      width += sprite.width + this.spacing;
      height = Math.max(height, sprite.height);
    }
    return BoundingBox.fromDimension(width * this.scale.x, height * lines.length * this.scale.y, Vector.Zero);
  }

  protected _drawImage(ex: ExcaliburGraphicsContext, x: number, y: number, maxWidth?: number): void {
    let xCursor = 0;
    let yCursor = 0;
    let height = 0;
    const lines = this._getLinesFromText(this._text, maxWidth);
    for (const line of lines) {
      for (const sprite of this._getCharacterSprites(line)) {
        // draw it in the right spot and increase the cursor by sprite width
        sprite.draw(ex, x + xCursor, y + yCursor);
        xCursor += sprite.width + this.spacing;
        height = Math.max(height, sprite.height);
      }
      xCursor = 0;
      yCursor += this.lineHeight ?? height;
    }
  }

  render(ex: ExcaliburGraphicsContext, text: string, _color: any, x: number, y: number, maxWidth?: number) {
    // SpriteFont doesn't support _color, yet...
    this._text = text;
    const bounds = this.measureText(text, maxWidth);
    this.width = bounds.width;
    this.height = bounds.height;
    if (this.shadow) {
      ex.save();
      ex.translate(this.shadow.offset.x, this.shadow.offset.y);
      this._preDraw(ex, x, y);
      this._drawImage(ex, 0, 0, maxWidth);
      this._postDraw(ex);
      ex.restore();
    }

    this._preDraw(ex, x, y);
    this._drawImage(ex, 0, 0, maxWidth);
    this._postDraw(ex);
  }

  clone(): SpriteFont {
    return new SpriteFont({
      alphabet: this.alphabet,
      spriteSheet: this.spriteSheet,
      spacing: this.spacing
    });
  }

  /**
   * Return array of lines split based on the \n character, and the maxWidth? constraint
   * @param text
   * @param maxWidth
   */
  private _cachedText?: string;
  private _cachedLines?: string[];
  private _cachedRenderWidth?: number;
  protected _getLinesFromText(text: string, maxWidth?: number) {
    if (this._cachedText === text && this._cachedRenderWidth === maxWidth && this._cachedLines?.length) {
      return this._cachedLines;
    }

    const lines = text.split('\n');

    if (maxWidth == null) {
      return lines;
    }

    // If the current line goes past the maxWidth, append a new line without modifying the underlying text.
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      let newLine = '';
      // Note: we subtract the spacing to counter the initial padding on the left side.
      if (this.measureText(line).width > maxWidth) {
        while (this.measureText(line).width > maxWidth) {
          newLine = line[line.length - 1] + newLine;
          line = line.slice(0, -1); // Remove last character from line
        }

        // Update the array with our new values
        lines[i] = line;
        lines[i + 1] = newLine;
      }
    }

    this._cachedText = text;
    this._cachedLines = lines;
    this._cachedRenderWidth = maxWidth;

    return lines;
  }
}
