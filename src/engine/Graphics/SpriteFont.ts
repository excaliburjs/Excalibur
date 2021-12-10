import { Vector } from '../Math/vector';
import { SpriteFont as LegacySpriteFont } from '../Drawing/Index';
import { Logger } from '../Util/Log';
import { ExcaliburGraphicsContext } from './Context/ExcaliburGraphicsContext';
import { FontRenderer } from './FontCommon';
import { Graphic, GraphicOptions } from './Graphic';
import { Sprite } from './Sprite';
import { SpriteSheet } from './SpriteSheet';
import { BoundingBox } from '..';

export interface SpriteFontOptions {
  /**
   * Alphabet string in spritsheet order (default is row column order)
   * example: 'abcdefghijklmnopqrstuvwxyz'
   */
  alphabet: string;
  /**
   * [[SpriteSheet]] to source character sprites from
   */
  spriteSheet: SpriteSheet;
  /**
   * Optionally ignore case in the supplied text;
   */
  caseInsensitive?: boolean;
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

  public shadow: { offset: Vector } = null;
  public caseInsensitive = false;
  public spacing: number = 0;

  private _logger = Logger.getInstance();

  static fromLegacySpriteFont(spriteFont: LegacySpriteFont): SpriteFont {
    const sprites = spriteFont.sprites.map(Sprite.fromLegacySprite);
    return new SpriteFont({
      alphabet: spriteFont.alphabet,
      spacing: 0,
      caseInsensitive: spriteFont.caseInsensitive,
      spriteSheet: new SpriteSheet({
        sprites
      })
    });
  }

  constructor(options: SpriteFontOptions & GraphicOptions) {
    super(options);
    const { alphabet, spriteSheet, caseInsensitive, spacing, shadow } = options;
    this.alphabet = alphabet;
    this.spriteSheet = spriteSheet;
    this.caseInsensitive = caseInsensitive ?? this.caseInsensitive;
    this.spacing = spacing ?? this.spacing;
    this.shadow = shadow ?? this.shadow;
  }

  private _getCharacterSprites(text: string): Sprite[] {
    const results: Sprite[] = [];
    // handle case insenstive
    const textToRender = this.caseInsensitive ? text.toLocaleLowerCase() : text;
    const alphabet = this.caseInsensitive ? this.alphabet.toLocaleLowerCase() : this.alphabet;

    // for each letter in text
    for (let letterIndex = 0; letterIndex < textToRender.length; letterIndex++) {
      // find the sprite index in alphabet , if there is an error pick the first
      const letter = textToRender[letterIndex];
      let spriteIndex = alphabet.indexOf(letter);
      if (spriteIndex === -1) {
        spriteIndex = 0;
        this._logger.warn(`SpriteFont - Cannot find letter '${letter}' in configured alphabet '${alphabet}'`);
      }

      const letterSprite = this.spriteSheet.sprites[spriteIndex];
      if (letterSprite) {
        results.push(letterSprite);
      } else {
        this._logger.warn(`SpriteFont - Cannot find sprite for '${letter}' at index '${spriteIndex}' in configured SpriteSheet`);
      }
    }
    return results;
  }

  public measureText(text: string): BoundingBox {
    const lines = text.split('\n');
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
    return BoundingBox.fromDimension(width, height * lines.length, Vector.Zero);
  }

  protected _drawImage(ex: ExcaliburGraphicsContext, x: number, y: number): void {
    let xCursor = 0;
    let yCursor = 0;
    let height = 0;
    const lines = this._text.split('\n');
    for (let line of lines) {
      for (const sprite of this._getCharacterSprites(line)) {
        // draw it in the right spot and increase the cursor by sprite width
        sprite.draw(ex, x + xCursor, y + yCursor);
        xCursor += sprite.width + this.spacing;
        height = Math.max(height, sprite.height);
      }
      xCursor = 0;
      yCursor += height;
    }
  }

  render(ex: ExcaliburGraphicsContext, text: string, x: number, y: number) {
    this._text = text;
    const bounds = this.measureText(text);
    this.width = bounds.width;
    this.height = bounds.height;
    if (this.shadow) {
      ex.save();
      ex.translate(this.shadow.offset.x, this.shadow.offset.y);
      this.draw(ex, x, y);
      ex.restore();
    }

    this.draw(ex, x, y);
  }

  clone(): SpriteFont {
    return new SpriteFont({
      alphabet: this.alphabet,
      spriteSheet: this.spriteSheet,
      spacing: this.spacing
    });
  }
}
