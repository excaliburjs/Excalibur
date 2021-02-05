import { Sprite, SpriteArgs } from './Sprite';
import { Animation } from './Animation';
import { Color } from './Color';
import * as Effects from './SpriteEffects';

import { Texture } from '../Resources/Texture';
import { Engine } from '../Engine';
import { Logger } from '../Util/Log';
import { TextAlign, BaseAlign } from '../Label';

export interface SpriteSheetArgs {
  image: Texture;
  sprites?: Sprite[];
  spWidth: number;
  spHeight: number;
  rows: number;
  columns: number;
  spacing?: number | SpriteSheetSpacingDimensions;
}

export interface SpriteSheetSpacingDimensions {
  top?: number;
  left?: number;
  margin?: number;
}

/**
 * Sprite sheets are a useful mechanism for slicing up image resources into
 * separate sprites or for generating in game animations. [[Sprite|Sprites]] are organized
 * in row major order in the [[SpriteSheet]].
 */
export class SpriteSheet {
  private _sprites: Sprite[] = [];
  private _image: Texture | null = null;
  private _columns: number = 0;
  private _rows: number = 0;
  private _spWidth: number = 0;
  private _spHeight: number = 0;
  private _spacing: number | SpriteSheetSpacingDimensions = 0;

  /**
   * @param config    The configuration of the SpriteSheet
   */
  constructor(config: SpriteSheetArgs);

  /**
   * @param sprites   The backing sprite array to use, if already available
   */
  constructor(sprites: Sprite[]);

  /**
   * @param image     The backing image texture to build the SpriteSheet
   * @param columns   The number of columns in the image texture
   * @param rows      The number of rows in the image texture
   * @param spWidth   The width of each individual sprite in pixels
   * @param spHeight  The height of each individual sprite in pixels
   * @param spacing   The spacing between every sprite in a spritesheet
   */
  constructor(
    image: Texture,
    columns: number,
    rows: number,
    spWidth: number,
    spHeight: number,
    spacing?: number | SpriteSheetSpacingDimensions
  );

  /**
   * @param imageOrConfigOrSprites The backing image texture to build the SpriteSheet, option bag, or sprite list
   * @param columns   The number of columns in the image texture
   * @param rows      The number of rows in the image texture
   * @param spWidth   The width of each individual sprite in pixels
   * @param spHeight  The height of each individual sprite in pixels
   * @param spacing   The spacing between every sprite in a spritesheet
   */
  constructor(
    imageOrConfigOrSprites: Texture | SpriteSheetArgs | Sprite[],
    columns?: number,
    rows?: number,
    spWidth?: number,
    spHeight?: number,
    spacing?: number | SpriteSheetSpacingDimensions
  ) {
    let loadFromImage: boolean = false;
    if (imageOrConfigOrSprites instanceof Array) {
      this._sprites = imageOrConfigOrSprites;
    } else {
      if (imageOrConfigOrSprites && !(imageOrConfigOrSprites instanceof Texture)) {
        this._columns = imageOrConfigOrSprites.columns;
        this._rows = imageOrConfigOrSprites.rows;
        this._spWidth = imageOrConfigOrSprites.spWidth;
        this._spHeight = imageOrConfigOrSprites.spHeight;
        this._image = imageOrConfigOrSprites.image;
        this._spacing = imageOrConfigOrSprites.spacing || 0;
      } else {
        this._image = <Texture>imageOrConfigOrSprites;
        this._columns = columns;
        this._rows = rows;
        this._spWidth = spWidth;
        this._spHeight = spHeight;
        this._spacing = spacing || 0;
      }
      this._sprites = new Array(this._columns * this._rows);
      loadFromImage = true;
    }

    // Inspect actual image dimensions with preloading
    if (this.image instanceof Texture) {
      let isWidthError: boolean = false;
      let isHeightError: boolean = false;
      if (this.image.isLoaded()) {
        isWidthError = this.spWidth * this.columns > this.image.image.naturalWidth;
        isHeightError = this.spHeight * this.rows > this.image.image.naturalHeight;
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
    }

    if (loadFromImage) {
      const spacing = this.getSpacingDimensions();

      for (let row = 0; row < this.rows; row++) {
        for (let col = 0; col < this.columns; col++) {
          this._sprites[col + row * this.columns] = new Sprite(
            this.image,
            col * this.spWidth + spacing.margin * col + spacing.left,
            row * this.spHeight + spacing.margin * row + spacing.top,
            this.spWidth,
            this.spHeight
          );
        }
      }
    }
  }

  /**
   * Gets the raw spacing dimensions for the sprites in the sheet, which can be a fixed number or custom dimensions.
   */
  public get spacing() {
    return this._spacing;
  }

  /**
   * Get a copy of the backing sprite array
   */
  public get sprites() {
    return [...this._sprites];
  }

  /**
   * The backing texture used for the sprite sheet
   */
  public get image() {
    return this._image;
  }

  /**
   * The number of columns in the sheet
   */
  public get columns() {
    return this._columns;
  }

  /**
   * The number of rows in the sheet
   */
  public get rows() {
    return this._rows;
  }

  /**
   * The width of the individual sprites
   */
  public get spWidth() {
    return this._spWidth;
  }

  /**
   * The height of the individual sprites
   */
  public get spHeight() {
    return this._spHeight;
  }

  /**
   * Gets the calculated spacing dimensions based on whether spacing
   * is a fixed number or has different values for each dimension
   */
  public getSpacingDimensions(): SpriteSheetSpacingDimensions {
    if (typeof this.spacing === 'number') {
      return {
        left: this.spacing,
        top: this.spacing,
        margin: this.spacing
      };
    } else {
      return {
        left: this.spacing.left ?? 0,
        top: this.spacing.top ?? 0,
        margin: this.spacing.margin ?? 0
      };
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
    let images: Sprite[] = indices.map((index) => {
      return this.sprites[index];
    });

    images = images.map(function (i) {
      return i.clone();
    });
    return new Animation(engine, images, speed);
  }

  /**
   * Create an animation from the this SpriteSheet by specifying the range of
   * images with the beginning (inclusive) and ending (exclusive) index
   * For example `getAnimationBetween(engine, 0, 5, 200)` returns an animation with 5 frames.
   * @param engine      Reference to the current game Engine
   * @param beginIndex  The index to start taking frames (inclusive)
   * @param endIndex    The index to stop taking frames (exclusive)
   * @param speed       The number in milliseconds to display each frame in the animation
   */
  public getAnimationBetween(engine: Engine, beginIndex: number, endIndex: number, speed: number) {
    let images = this.sprites.slice(beginIndex, endIndex);
    images = images.map(function (i) {
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
    const sprites = this.sprites.map(function (i) {
      return i.clone();
    });
    return new Animation(engine, sprites, speed);
  }

  /**
   * Retrieve a specific sprite from the SpriteSheet by its index. Sprites are organized
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
  public getAnimationByCoords(engine: Engine, spriteCoordinates: SpriteArgs[], speed: number): Animation {
    let maxWidth: number = 0;
    let maxHeight: number = 0;
    const sprites: Sprite[] = new Array(spriteCoordinates.length);
    for (let i = 0; i < spriteCoordinates.length; i++) {
      const coord = spriteCoordinates[i];
      // no need to pass image again if using a spritesheet
      coord.image = coord.image || this.image;
      maxWidth = Math.max(maxWidth, coord.drawWidth);
      maxHeight = Math.max(maxHeight, coord.drawHeight);
      sprites[i] = new Sprite(coord);
    }

    const anim = new Animation(engine, sprites, speed);

    anim.drawWidth = maxWidth;
    anim.drawHeight = maxHeight;
    return anim;
  }
}

/**
 * Specify various font attributes for sprite fonts
 */
export interface SpriteFontOptions {
  color?: Color;
  opacity?: number;
  fontSize?: number;
  letterSpacing?: number;
  textAlign?: TextAlign;
  baseAlign?: BaseAlign;
  maxWidth?: number;
}

export interface SpriteFontArgs extends SpriteSheetArgs {
  alphabet: string;
  caseInsensitive: boolean;
}

/**
 * Sprite fonts are a used in conjunction with a [[Label]] to specify
 * a particular bitmap as a font. Note that some font features are not
 * supported by Sprite fonts.
 */

export class SpriteFont extends SpriteSheet {
  private _currentColor: Color = Color.Black;
  private _currentOpacity: Number = 1.0;
  private _spriteRecord: Record<string, Sprite> = {};

  // text shadow
  private _textShadowOn: boolean = false;
  private _textShadowDirty: boolean = true;
  private _textShadowColor: Color = Color.Black;
  private _textShadowSprites: { [key: string]: Sprite } = {};
  private _shadowOffsetX: number = 5;
  private _shadowOffsetY: number = 5;
  private _alphabet: string;
  private _caseInsensitive: boolean;

  constructor(config: SpriteFontArgs);

  constructor(
    image: Texture,
    alphabet: string,
    caseInsensitive: boolean,
    columns: number,
    rows: number,
    spWidth: number,
    spHeight: number,
    spacing?: number | SpriteSheetSpacingDimensions
  );

  /**
   * @param imageOrConfig   The backing image texture to build the SpriteFont or the sprite font option bag
   * @param alphabet        A string representing all the characters in the image, in row major order.
   * @param caseInsensitive  Indicate whether this font takes case into account
   * @param columns         The number of columns of characters in the image
   * @param rows            The number of rows of characters in the image
   * @param spWidth         The width of each character in pixels
   * @param spHeight        The height of each character in pixels
   */
  constructor(
    imageOrConfig: Texture | SpriteFontArgs,
    alphabet?: string,
    caseInsensitive?: boolean,
    columns?: number,
    rows?: number,
    spWidth?: number,
    spHeight?: number,
    spacing?: number | SpriteSheetSpacingDimensions
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
    this._spriteRecord = this.getTextSprites();
  }

  /**
   * Returns a dictionary that maps each character in the alphabet to the appropriate [[Sprite]].
   */
  public getTextSprites(): { [key: string]: Sprite } {
    const lookup: { [key: string]: Sprite } = {};
    for (let i = 0; i < this._alphabet.length; i++) {
      let char = this._alphabet[i];
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
    for (const character in this._spriteRecord) {
      this._textShadowSprites[character] = this._spriteRecord[character].clone();
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
  public draw(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, options: SpriteFontOptions) {
    options = this._parseOptions(options);

    if (this._currentColor.toString() !== options.color.toString() || this._currentOpacity !== options.opacity) {
      this._currentOpacity = options.opacity;
      this._currentColor = options.color;
      for (const char in this._spriteRecord) {
        this._spriteRecord[char].clearEffects();
        this._spriteRecord[char].fill(options.color);
        this._spriteRecord[char].opacity(options.opacity);
      }
    }

    if (this._textShadowOn && this._textShadowDirty && this._textShadowColor) {
      for (const characterShadow in this._textShadowSprites) {
        this._textShadowSprites[characterShadow].clearEffects();
        this._textShadowSprites[characterShadow].addEffect(new Effects.Fill(this._textShadowColor.clone()));
      }
      this._textShadowDirty = false;
    }

    // find the current length of text in pixels
    const sprite = this.sprites[0];

    // find the current height fo the text in pixels
    const height = sprite.height;

    // calculate appropriate scale for font size
    const scale = options.fontSize / height;

    const length = text.length * sprite.width * scale + text.length * options.letterSpacing;

    let currX = x;
    if (options.textAlign === TextAlign.Left || options.textAlign === TextAlign.Start) {
      currX = x;
    } else if (options.textAlign === TextAlign.Right || options.textAlign === TextAlign.End) {
      currX = x - length;
    } else if (options.textAlign === TextAlign.Center) {
      currX = x - length / 2;
    }

    let currY = y - height * scale;
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

    for (let i = 0; i < text.length; i++) {
      let character = text[i];
      if (this._caseInsensitive) {
        character = character.toLowerCase();
      }
      try {
        // if text shadow
        if (this._textShadowOn) {
          this._textShadowSprites[character].drawAroundAnchor = false;
          this._textShadowSprites[character].scale.x = scale;
          this._textShadowSprites[character].scale.y = scale;
          this._textShadowSprites[character].draw(ctx, currX + this._shadowOffsetX, currY + this._shadowOffsetY);
        }

        const charSprite = this._spriteRecord[character];
        charSprite.drawAroundAnchor = false;
        charSprite.scale.x = scale;
        charSprite.scale.y = scale;
        charSprite.draw(ctx, currX, currY);
        currX += charSprite.drawWidth + options.letterSpacing;
      } catch (e) {
        Logger.getInstance().error(`SpriteFont Error drawing char ${character}`);
      }
    }
  }

  private _parseOptions(options: SpriteFontOptions): SpriteFontOptions {
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
