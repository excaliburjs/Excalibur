import { Vector } from '../Algebra';
import { SpriteFont as LegacySpriteFont } from '../Drawing/Index';
import { Logger } from '../Util/Log';
import { ExcaliburGraphicsContext, HTMLImageSource } from './Context/ExcaliburGraphicsContext';
import { FontRenderer } from './FontCommon';
import { Graphic, GraphicOptions } from './Graphic';
import { ImageSource } from './ImageSource';
import { Sprite } from './Sprite';
import { SpriteSheet } from './SpriteSheet';

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
  private _text = '';
  private _dirty = true;
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
      spacing: spriteFont.spacing,
      caseInsensitive: spriteFont.caseInsensitive,
      spriteSheet: new SpriteSheet({
        image: ImageSource.fromLegacyTexture(spriteFont.image),
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

    this.spriteSheet.image.whenLoaded.then(() => {
      this._updateDimensions();
    });
  }

  private _sprites: Sprite[] = [];
  private _getCharacterSprites(text: string): Sprite[] {
    if (!this._dirty) {
      return this._sprites;
    }

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
    this._dirty = false;
    return (this._sprites = results);
  }

  private _updateDimensions() {
    const sprites = this._getCharacterSprites(this._text);
    let width = 0;
    let height = 0;
    for (const sprite of sprites) {
      width += sprite.width + this.spacing;
      height = Math.max(height, sprite.height);
    }
    this.width = width;
    this.height = height;
  }

  protected _preDraw(ex: ExcaliburGraphicsContext, x: number, y: number): void {
    this._updateDimensions();
    super._preDraw(ex, x, y);
  }

  protected _drawImage(ex: ExcaliburGraphicsContext, x: number, y: number): void {
    let cursor = 0;
    for (const sprite of this._getCharacterSprites(this._text)) {
      // draw it in the right spot and incresase the cursor by sprite width
      sprite.draw(ex, x + cursor, y);
      cursor += sprite.width + this.spacing;
    }
  }

  render(ex: ExcaliburGraphicsContext, text: string, x: number, y: number) {
    if (this._text !== text) {
      this._dirty = true;
      this._text = text;
    }

    if (this.shadow) {
      ex.save();
      ex.translate(this.shadow.offset.x, this.shadow.offset.y);
      this.draw(ex, x, y);
      ex.restore();
    }

    this.draw(ex, x, y);
  }

  getSourceId(): number {
    return this.spriteSheet.image.id;
  }

  getSource(): HTMLImageSource {
    return this.spriteSheet.image.image;
  }

  clone(): SpriteFont {
    return new SpriteFont({
      alphabet: this.alphabet,
      spriteSheet: this.spriteSheet,
      spacing: this.spacing
    });
  }
}
