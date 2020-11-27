import { SpriteFont } from '../Drawing/Index';
import { Logger } from '../Util/Log';
import { ExcaliburGraphicsContext, ImageSource } from './Context/ExcaliburGraphicsContext';
import { Graphic, GraphicOptions } from './Graphic';
import { RawImage } from './RawImage';
import { Sprite } from './Sprite';
import { SpriteSheet } from './SpriteSheet';

export interface SpriteTextOptions {
  /**
   * Text to draw
   */
  text: string;
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
}

export class SpriteText extends Graphic {
  private _text = '';
  private _dirty = true;
  public get text(): string {
    return this._text;
  }
  public set text(text: string) {
    this._text = text;
    this._dirty = true;
  }

  public alphabet: string = '';
  public spriteSheet: SpriteSheet;

  public caseInsensitive = false;
  public spacing: number = 0;

  private _logger = Logger.getInstance();

  static fromLegacySpriteFont(text: string, spriteFont: SpriteFont): SpriteText {
    const sprites = spriteFont.sprites.map(Sprite.fromLegacySprite);
    return new SpriteText({
      text,
      alphabet: spriteFont.alphabet,
      spacing: spriteFont.spacing,
      caseInsensitive: spriteFont.caseInsensitive,
      spriteSheet: new SpriteSheet({
        image: RawImage.fromLegacyTexture(spriteFont.image),
        sprites
      })
    });
  }

  constructor(options: SpriteTextOptions & GraphicOptions) {
    super(options);
    const { text, alphabet, spriteSheet, caseInsensitive, spacing } = options;
    this.text = text ?? this.text;
    this.alphabet = alphabet;
    this.spriteSheet = spriteSheet;
    this.caseInsensitive = caseInsensitive ?? this.caseInsensitive;
    this.spacing = spacing ?? this.spacing;

    this.spriteSheet.image.whenLoaded.then(() => {
      this._updateDimensions();
    });
  }

  private _sprites: Sprite[] = [];
  private _getCharacterSprites(): Sprite[] {
    if (!this._dirty) {
      return this._sprites;
    }

    const results: Sprite[] = [];
    // handle case insenstive
    const text = this.caseInsensitive ? this.text.toLocaleLowerCase() : this.text;
    const alphabet = this.caseInsensitive ? this.alphabet.toLocaleLowerCase() : this.text;

    // for each letter in text
    for (let letterIndex = 0; letterIndex < text.length; letterIndex++) {
      // find the sprite index in alphabet , if there is an error pick the first
      const letter = text[letterIndex];
      let spriteIndex = alphabet.indexOf(letter);
      if (spriteIndex === -1) {
        spriteIndex = 0;
        this._logger.warn(`SpriteText - Cannot find letter '${letter}' in configured alphabet '${alphabet}'`);
      }

      const letterSprite = this.spriteSheet.sprites[spriteIndex];
      if (letterSprite) {
        results.push(letterSprite);
      } else {
        this._logger.warn(`SpriteText - Cannot find sprite for '${letter}' at index '${spriteIndex}' in configured SpriteSheet`);
      }
    }
    this._dirty = false;
    return this._sprites = results;
  }

  private _updateDimensions() {
    const sprites = this._getCharacterSprites();
    let width = 0;
    let height = 0;
    for (const sprite of sprites) {
      width += sprite.width + this.spacing;
      height = Math.max(height, sprite.height);
    }
    this.width = width;
    this.height = height;
  }

  protected  _preDraw(ex: ExcaliburGraphicsContext, x: number, y: number): void {
    this._updateDimensions();
    super._preDraw(ex, x, y);
  }

  protected _drawImage(ex: ExcaliburGraphicsContext, x: number, y: number): void {
    let cursor = 0;
    for (const sprite of this._getCharacterSprites()) {
      // draw it in the right spot and incresase the cursor by sprite width
      sprite.draw(ex, x + cursor, y);
      cursor += sprite.width + this.spacing;
    }
  }

  getSourceId(): number {
    return this.spriteSheet.image.id;
  }

  getSource(): ImageSource {
    return this.spriteSheet.image.image;
  }

  clone(): SpriteText {
    return new SpriteText({
      text: this.text,
      alphabet: this.alphabet,
      spriteSheet: this.spriteSheet,
      spacing: this.spacing
    });
  }
}