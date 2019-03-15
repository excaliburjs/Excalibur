import { Sprite, ISpriteArgs } from './Sprite';
import { Animation } from './Animation';
import { Color } from './Color';
import * as Effects from './SpriteEffects';

import { Texture } from '../Resources/Texture';
import { Engine } from '../Engine';
import { Logger } from '../Util/Log';
import { TextAlign, BaseAlign } from '../Label';
import { Configurable } from '../Configurable';

/**
 * @hidden
 */
export class SpriteSheetImpl {
  public sprites: Sprite[] = [];
  public image: Texture = null;
  public columns: number = 0;
  public rows: number = 0;
  public spWidth: number = 0;
  public spHeight: number = 0;
  public spacing: number = 0;
  /**
   * @param image     The backing image texture to build the SpriteSheet
   * @param columns   The number of columns in the image texture
   * @param rows      The number of rows in the image texture
   * @param spWidth   The width of each individual sprite in pixels
   * @param spHeight  The height of each individual sprite in pixels
   * @param spacing   The spacing between every sprite in a spritesheet
   */
  constructor(
    imageOrConfigOrSprites: Texture | ISpriteSheetArgs | Sprite[],
    columns?: number,
    rows?: number,
    spWidth?: number,
    spHeight?: number,
    spacing?: number
  ) {
    var loadFromImage: boolean = false;
    if (imageOrConfigOrSprites instanceof Array) {
      this.sprites = imageOrConfigOrSprites;
    } else {
      if (imageOrConfigOrSprites && !(imageOrConfigOrSprites instanceof Texture)) {
        this.columns = imageOrConfigOrSprites.columns;
        this.rows = imageOrConfigOrSprites.rows;
        this.spWidth = imageOrConfigOrSprites.spWidth;
        this.spHeight = imageOrConfigOrSprites.spHeight;
        this.image = imageOrConfigOrSprites.image;
        this.spacing = imageOrConfigOrSprites.spacing || 0;
      } else {
        this.image = <Texture>imageOrConfigOrSprites;
        this.columns = columns;
        this.rows = rows;
        this.spWidth = spWidth;
        this.spHeight = spHeight;
        this.spacing = spacing || 0;
      }
      this.sprites = new Array(this.columns * this.rows);
      loadFromImage = true;
    }

    // Inspect actual image dimensions with preloading
    if (this.image instanceof Texture) {
      let isWidthError: boolean = false;
      let isHeightError: boolean = false;
      this.image.loaded.then((image: HTMLImageElement) => {
        isWidthError = this.spWidth * this.columns > image.naturalWidth;
        isHeightError = this.spHeight * this.rows > image.naturalHeight;
      });
      if (isWidthError) {
        throw new RangeError(
          `SpriteSheet specified is wider, ` +
            `${this.columns} cols x ${this.spWidth} pixels > ${this.image.image.naturalWidth} ` +
            `pixels than image width`
        );
      }
      if (isHeightError) {
        throw new RangeError(
          `SpriteSheet specified is taller, ` +
            `${this.rows} rows x ${this.spHeight} pixels > ${this.image.image.naturalHeight} ` +
            `pixels than image height`
        );
      }
    }

    if (loadFromImage) {
      var i = 0;
      var j = 0;
      for (i = 0; i < this.rows; i++) {
        for (j = 0; j < this.columns; j++) {
          this.sprites[j + i * this.columns] = new Sprite(
            this.image,
            j * this.spWidth + this.spacing * j + this.spacing,
            i * this.spHeight + this.spacing * i + this.spacing,
            this.spWidth,
            this.spHeight
          );
        }
      }
    }
  }

  /**
   * Create an animation from the this SpriteSheet by listing out the
   * sprite indices. Sprites are organized in row major order in the SpriteSheet.
   * @param engine   Reference to the current game [[Engine]]
   * @param indices  An array of sprite indices to use in the animation
   * @param speed    The number in milliseconds to display each frame in the animation
   */
  public getAnimationByIndices(engine: Engine, indices: number[], speed: number) {
    var images: Sprite[] = indices.map((index) => {
      return this.sprites[index];
    });

    images = images.map(function(i) {
      return i.clone();
    });
    return new Animation(engine, images, speed);
  }

  /**
   * Create an animation from the this SpriteSheet by specifing the range of
   * images with the beginning (inclusive) and ending (exclusive) index
   * For example `getAnimationBetween(engine, 0, 5, 200)` returns an animation with 5 frames.
   * @param engine      Reference to the current game Engine
   * @param beginIndex  The index to start taking frames (inclusive)
   * @param endIndex    The index to stop taking frames (exclusive)
   * @param speed       The number in milliseconds to display each frame in the animation
   */
  public getAnimationBetween(engine: Engine, beginIndex: number, endIndex: number, speed: number) {
    var images = this.sprites.slice(beginIndex, endIndex);
    images = images.map(function(i) {
      return i.clone();
    });
    return new Animation(engine, images, speed);
  }

  /**
   * Treat the entire SpriteSheet as one animation, organizing the frames in
   * row major order.
   * @param engine  Reference to the current game [[Engine]]
   * @param speed   The number in milliseconds to display each frame the animation
   */
  public getAnimationForAll(engine: Engine, speed: number) {
    var sprites = this.sprites.map(function(i) {
      return i.clone();
    });
    return new Animation(engine, sprites, speed);
  }

  /**
   * Retreive a specific sprite from the SpriteSheet by its index. Sprites are organized
   * in row major order in the SpriteSheet.
   * @param index  The index of the sprite
   */
  public getSprite(index: number): Sprite {
    if (index >= 0 && index < this.sprites.length) {
      return this.sprites[index];
    } else {
      throw new Error('Invalid index: ' + index);
    }
  }

  /**
   * Get an animation with bespoke sprite coordinates. This is useful if the SpriteSheet is
   * packed and not a uniform width or height. The resulting [[Animation]] will have the height and width of the
   * largest dimension (width, height) from among the sprite coordinates
   * @param engine
   * @param spriteCoordinates
   * @param speed
   */
  public getAnimationByCoords(engine: Engine, spriteCoordinates: ISpriteArgs[], speed: number): Animation {
    let maxWidth: number = 0;
    let maxHeight: number = 0;
    let sprites: Sprite[] = new Array(spriteCoordinates.length);
    for (let i = 0; i < spriteCoordinates.length; i++) {
      let coord = spriteCoordinates[i];
      // no need to pass image again if using a spritesheet
      coord.image = coord.image || this.image;
      maxWidth = Math.max(maxWidth, coord.drawWidth);
      maxHeight = Math.max(maxHeight, coord.drawHeight);
      sprites[i] = new Sprite(coord);
    }

    let anim = new Animation(engine, sprites, speed);

    anim.drawWidth = maxWidth;
    anim.drawHeight = maxHeight;
    return anim;
  }
}

/**
 * [[include:Constructors.md]]
 */
export interface ISpriteSheetArgs extends Partial<SpriteSheetImpl> {
  image: Texture;
  sprites?: Sprite[];
  spWidth: number;
  spHeight: number;
  rows: number;
  columns: number;
  spacing?: number;
}

/**
 * Sprite sheets are a useful mechanism for slicing up image resources into
 * separate sprites or for generating in game animations. [[Sprite|Sprites]] are organized
 * in row major order in the [[SpriteSheet]].
 *
 * [[include:SpriteSheets.md]]
 */
export class SpriteSheet extends Configurable(SpriteSheetImpl) {
  constructor(config: ISpriteSheetArgs);
  constructor(sprites: Sprite[]);
  constructor(image: Texture, columns: number, rows: number, spWidth: number, spHeight: number);
  constructor(
    imageOrConfigOrSprites: Texture | ISpriteSheetArgs | Sprite[],
    columns?: number,
    rows?: number,
    spWidth?: number,
    spHeight?: number,
    spacing?: number
  ) {
    super(imageOrConfigOrSprites, columns, rows, spWidth, spHeight, spacing);
  }
}

export class SpriteFontImpl extends SpriteSheet {
  private _currentColor: Color = Color.Black;
  private _currentOpacity: Number = 1.0;
  private _sprites: { [key: string]: Sprite } = {};

  // text shadow
  private _textShadowOn: boolean = false;
  private _textShadowDirty: boolean = true;
  private _textShadowColor: Color = Color.Black;
  private _textShadowSprites: { [key: string]: Sprite } = {};
  private _shadowOffsetX: number = 5;
  private _shadowOffsetY: number = 5;
  private _alphabet: string;
  private _caseInsensitive: boolean;

  /**
   * @param image           The backing image texture to build the SpriteFont
   * @param alphabet        A string representing all the characters in the image, in row major order.
   * @param caseInsensitive  Indicate whether this font takes case into account
   * @param columns         The number of columns of characters in the image
   * @param rows            The number of rows of characters in the image
   * @param spWidth         The width of each character in pixels
   * @param spHeight        The height of each character in pixels
   */
  constructor(
    imageOrConfig: Texture | ISpriteFontInitArgs,
    alphabet: string,
    caseInsensitive: boolean,
    columns: number,
    rows: number,
    spWidth: number,
    spHeight: number,
    spacing?: number
  ) {
    super(
      imageOrConfig instanceof Texture
        ? {
            image: imageOrConfig,
            spWidth: spWidth,
            spHeight: spHeight,
            rows: rows,
            columns: columns,
            spacing: spacing || 0
          }
        : imageOrConfig
    );

    if (imageOrConfig && !(imageOrConfig instanceof Texture)) {
      alphabet = imageOrConfig.alphabet;
      caseInsensitive = imageOrConfig.caseInsensitive;
    }

    this._alphabet = alphabet;
    this._caseInsensitive = caseInsensitive;
    this._sprites = this.getTextSprites();
  }

  /**
   * Returns a dictionary that maps each character in the alphabet to the appropriate [[Sprite]].
   */
  public getTextSprites(): { [key: string]: Sprite } {
    var lookup: { [key: string]: Sprite } = {};
    for (var i = 0; i < this._alphabet.length; i++) {
      var char = this._alphabet[i];
      if (this._caseInsensitive) {
        char = char.toLowerCase();
      }
      lookup[char] = this.sprites[i].clone();
    }
    return lookup;
  }

  /**
   * Sets the text shadow for sprite fonts
   * @param offsetX      The x offset in pixels to place the shadow
   * @param offsetY      The y offset in pixels to place the shadow
   * @param shadowColor  The color of the text shadow
   */
  public setTextShadow(offsetX: number, offsetY: number, shadowColor: Color) {
    this._textShadowOn = true;
    this._shadowOffsetX = offsetX;
    this._shadowOffsetY = offsetY;
    this._textShadowColor = shadowColor.clone();
    this._textShadowDirty = true;
    for (var character in this._sprites) {
      this._textShadowSprites[character] = this._sprites[character].clone();
    }
  }

  /**
   * Toggles text shadows on or off
   */
  public useTextShadow(on: boolean) {
    this._textShadowOn = on;
    if (on) {
      this.setTextShadow(5, 5, this._textShadowColor);
    }
  }

  /**
   * Draws the current sprite font
   */
  public draw(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, options: ISpriteFontOptions) {
    options = this._parseOptions(options);

    if (this._currentColor.toString() !== options.color.toString() || this._currentOpacity !== options.opacity) {
      this._currentOpacity = options.opacity;
      this._currentColor = options.color;
      for (var char in this._sprites) {
        this._sprites[char].clearEffects();
        this._sprites[char].fill(options.color);
        this._sprites[char].opacity(options.opacity);
      }
    }

    if (this._textShadowOn && this._textShadowDirty && this._textShadowColor) {
      for (var characterShadow in this._textShadowSprites) {
        this._textShadowSprites[characterShadow].clearEffects();
        this._textShadowSprites[characterShadow].addEffect(new Effects.Fill(this._textShadowColor.clone()));
      }
      this._textShadowDirty = false;
    }

    // find the current length of text in pixels
    var sprite = this.sprites[0];

    // find the current height fo the text in pixels
    var height = sprite.drawHeight;

    // calculate appropriate scale for font size
    var scale = options.fontSize / height;

    var length = text.length * sprite.drawWidth * scale + text.length * options.letterSpacing;

    var currX = x;
    if (options.textAlign === TextAlign.Left || options.textAlign === TextAlign.Start) {
      currX = x;
    } else if (options.textAlign === TextAlign.Right || options.textAlign === TextAlign.End) {
      currX = x - length;
    } else if (options.textAlign === TextAlign.Center) {
      currX = x - length / 2;
    }

    var currY = y - height * scale;
    if (options.baseAlign === BaseAlign.Top || options.baseAlign === BaseAlign.Hanging) {
      currY = y;
    } else if (
      options.baseAlign === BaseAlign.Ideographic ||
      options.baseAlign === BaseAlign.Bottom ||
      options.baseAlign === BaseAlign.Alphabetic
    ) {
      currY = y - height * scale;
    } else if (options.baseAlign === BaseAlign.Middle) {
      currY = y - (height * scale) / 2;
    }

    for (var i = 0; i < text.length; i++) {
      var character = text[i];
      if (this._caseInsensitive) {
        character = character.toLowerCase();
      }
      try {
        // if text shadow
        if (this._textShadowOn) {
          this._textShadowSprites[character].scale.x = scale;
          this._textShadowSprites[character].scale.y = scale;
          this._textShadowSprites[character].draw(ctx, currX + this._shadowOffsetX, currY + this._shadowOffsetY);
        }

        var charSprite = this._sprites[character];
        charSprite.scale.x = scale;
        charSprite.scale.y = scale;
        charSprite.draw(ctx, currX, currY);
        currX += charSprite.drawWidth + options.letterSpacing;
      } catch (e) {
        Logger.getInstance().error(`SpriteFont Error drawing char ${character}`);
      }
    }
  }

  private _parseOptions(options: ISpriteFontOptions): ISpriteFontOptions {
    return {
      fontSize: options.fontSize || 10,
      letterSpacing: options.letterSpacing || 0,
      color: options.color || Color.Black,
      textAlign: typeof options.textAlign === undefined ? TextAlign.Left : options.textAlign,
      baseAlign: typeof options.baseAlign === undefined ? BaseAlign.Bottom : options.baseAlign,
      maxWidth: options.maxWidth || -1,
      opacity: options.opacity || 0
    };
  }
}

/**
 * Specify various font attributes for sprite fonts
 */
export interface ISpriteFontOptions {
  color?: Color;
  opacity?: number;
  fontSize?: number;
  letterSpacing?: number;
  textAlign?: TextAlign;
  baseAlign?: BaseAlign;
  maxWidth?: number;
}

/**
 * [[include:Constructors.md]]
 */
export interface ISpriteFontInitArgs extends ISpriteSheetArgs {
  image: Texture;
  columns: number;
  rows: number;
  spWidth: number;
  spHeight: number;
  alphabet: string;
  caseInsensitive: boolean;
}

/**
 * Sprite fonts are a used in conjunction with a [[Label]] to specify
 * a particular bitmap as a font. Note that some font features are not
 * supported by Sprite fonts.
 *
 * [[include:SpriteFonts.md]]
 */
export class SpriteFont extends Configurable(SpriteFontImpl) {
  constructor(config: ISpriteFontInitArgs);
  constructor(image: Texture, alphabet: string, caseInsensitive: boolean, columns: number, rows: number, spWidth: number, spHeight: number);
  constructor(
    imageOrConfig: Texture | ISpriteFontInitArgs,
    alphabet?: string,
    caseInsensitive?: boolean,
    columns?: number,
    rows?: number,
    spWidth?: number,
    spHeight?: number,
    spacing?: number
  ) {
    super(imageOrConfig, alphabet, caseInsensitive, columns, rows, spWidth, spHeight, spacing);
  }
}
