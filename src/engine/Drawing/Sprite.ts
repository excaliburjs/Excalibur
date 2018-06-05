import * as Effects from './SpriteEffects';
import { Color } from './Color';

import { IDrawable } from '../Interfaces/IDrawable';
import { Texture } from '../Resources/Texture';
import { Vector } from '../Algebra';
import { Logger } from '../Util/Log';
import { clamp } from '../Util/Util';
import { Configurable } from '../Configurable';
import { obsolete } from '../Util/Decorators';

/**
 * @hidden
 */
export class SpriteImpl implements IDrawable {
  private _texture: Texture;

  public x: number = 0;
  public y: number = 0;

  public get drawWidth(): number {
    return this.width * this.scale.x;
  }

  public get drawHeight(): number {
    return this.height * this.scale.y;
  }

  /** @obsolete ex.[[Sprite.sx]] will be deprecated in 0.17.0 use ex.[[Sprite.x]] */
  public get sx() {
    return this.x;
  }

  @obsolete({ message: 'ex.Sprite.sx will be deprecated in 0.17.0', alternateMethod: 'x' })
  /** @obsolete ex.[[Sprite.sx]] will be deprecated in 0.17.0 use ex.[[Sprite.x]] */
  public set sx(value: number) {
    this.x = value;
  }

  /** @obsolete ex.[[Sprite.sy]] will be deprecated in 0.17.0 use ex.[[Sprite.y]] */
  public get sy() {
    return this.y;
  }

  @obsolete({ message: 'ex.Sprite.sy will be deprecated in 0.17.0', alternateMethod: 'y' })
  /** @obsolete ex.[[Sprite.sy]] will be deprecated in 0.17.0 use ex.[[Sprite.y]] */
  public set sy(value: number) {
    this.y = value;
  }

  /** @obsolete ex.[[Sprite.swidth]] will be deprecated in 0.17.0 use ex.[[Sprite.width]] */
  public get swidth() {
    return this.width;
  }

  @obsolete({ message: 'ex.Sprite.swidth will be deprecated in 0.17.0', alternateMethod: 'width' })
  /** @obsolete ex.[[Sprite.swidth]] will be deprecated in 0.17.0 use ex.[[Sprite.width]] */
  public set swidth(value: number) {
    this.width = value;
  }

  /** @obsolete ex.[[Sprite.sheight]] will be deprecated in 0.17.0 use [[Sprite.height]] */
  public get sheight() {
    return this.height;
  }

  @obsolete({ message: 'ex.Sprite.sheight will be deprecated in 0.17.0', alternateMethod: 'height' })
  /** @obsolete ex.[[Sprite.sheight]] will be deprecated in 0.17.0 use [[Sprite.height]] */
  public set sheight(value: number) {
    this.height = value;
  }

  public rotation: number = 0.0;
  public anchor: Vector = new Vector(0.0, 0.0);
  public scale: Vector = new Vector(1, 1);

  public logger: Logger = Logger.getInstance();

  /**
   * Draws the sprite flipped vertically
   */
  public flipVertical: boolean = false;

  /**
   * Draws the sprite flipped horizontally
   */
  public flipHorizontal: boolean = false;

  public effects: Effects.ISpriteEffect[] = [];

  public width: number = 0;
  public height: number = 0;

  private _spriteCanvas: HTMLCanvasElement = null;
  private _spriteCtx: CanvasRenderingContext2D = null;
  private _pixelData: ImageData = null;
  private _pixelsLoaded: boolean = false;
  private _dirtyEffect: boolean = false;

  /**
   * @param image   The backing image texture to build the Sprite
   * @param x      The x position of the sprite
   * @param y      The y position of the sprite
   * @param width  The width of the sprite in pixels
   * @param height The height of the sprite in pixels
   */
  constructor(imageOrConfig: Texture | ISpriteArgs, x: number, y: number, width: number, height: number) {
    var image = imageOrConfig;
    if (imageOrConfig && !(imageOrConfig instanceof Texture)) {
      x = imageOrConfig.x || imageOrConfig.sx;
      y = imageOrConfig.y || imageOrConfig.sy;
      width = imageOrConfig.drawWidth || imageOrConfig.swidth;
      height = imageOrConfig.drawHeight || imageOrConfig.sheight;
      image = imageOrConfig.image;
      if (!image) {
        const message = 'An image texture is required to contsruct a sprite';
        throw new Error(message);
      }
    }

    this.x = x || 0;
    this.y = y || 0;

    this._texture = <Texture>image;
    this._spriteCanvas = document.createElement('canvas');
    this._spriteCanvas.width = width;
    this._spriteCanvas.height = height;
    this._spriteCtx = <CanvasRenderingContext2D>this._spriteCanvas.getContext('2d');
    this._texture.loaded
      .then(() => {
        this._spriteCanvas.width = this._spriteCanvas.width || this._texture.image.naturalWidth;
        this._spriteCanvas.height = this._spriteCanvas.height || this._texture.image.naturalHeight;
        this._loadPixels();
        this._dirtyEffect = true;
      })
      .error((e) => {
        this.logger.error('Error loading texture ', this._texture.path, e);
      });

    this.width = width;
    this.height = height;
  }

  private _loadPixels() {
    if (this._texture.isLoaded() && !this._pixelsLoaded) {
      var naturalWidth = this._texture.image.naturalWidth || 0;
      var naturalHeight = this._texture.image.naturalHeight || 0;

      if (this.width > naturalWidth) {
        this.logger.warn(`The sprite width ${this.width} exceeds the width 
                              ${naturalWidth} of the backing texture ${this._texture.path}`);
      }
      if (this.height > naturalHeight) {
        this.logger.warn(`The sprite height ${this.height} exceeds the height 
                              ${naturalHeight} of the backing texture ${this._texture.path}`);
      }
      this._spriteCtx.drawImage(
        this._texture.image,
        clamp(this.x, 0, naturalWidth),
        clamp(this.y, 0, naturalHeight),
        clamp(this.width, 0, naturalWidth),
        clamp(this.height, 0, naturalHeight),
        0,
        0,
        this.width,
        this.height
      );

      this._pixelsLoaded = true;
    }
  }

  /**
   * Applies the [[Opacity]] effect to a sprite, setting the alpha of all pixels to a given value
   */
  public opacity(value: number) {
    this.addEffect(new Effects.Opacity(value));
  }

  /**
   * Applies the [[Grayscale]] effect to a sprite, removing color information.
   */
  public grayscale() {
    this.addEffect(new Effects.Grayscale());
  }

  /**
   * Applies the [[Invert]] effect to a sprite, inverting the pixel colors.
   */
  public invert() {
    this.addEffect(new Effects.Invert());
  }

  /**
   * Applies the [[Fill]] effect to a sprite, changing the color channels of all non-transparent pixels to match a given color
   */
  public fill(color: Color) {
    this.addEffect(new Effects.Fill(color));
  }

  /**
   * Applies the [[Colorize]] effect to a sprite, changing the color channels of all pixels to be the average of the original color
   * and the provided color.
   */
  public colorize(color: Color) {
    this.addEffect(new Effects.Colorize(color));
  }

  /**
   * Applies the [[Lighten]] effect to a sprite, changes the lightness of the color according to HSL
   */
  public lighten(factor: number = 0.1) {
    this.addEffect(new Effects.Lighten(factor));
  }

  /**
   * Applies the [[Darken]] effect to a sprite, changes the darkness of the color according to HSL
   */
  public darken(factor: number = 0.1) {
    this.addEffect(new Effects.Darken(factor));
  }

  /**
   * Applies the [[Saturate]] effect to a sprite, saturates the color according to HSL
   */
  public saturate(factor: number = 0.1) {
    this.addEffect(new Effects.Saturate(factor));
  }

  /**
   * Applies the [[Desaturate]] effect to a sprite, desaturates the color according to HSL
   */
  public desaturate(factor: number = 0.1) {
    this.addEffect(new Effects.Desaturate(factor));
  }

  /**
   * Adds a new [[ISpriteEffect]] to this drawing.
   * @param effect  Effect to add to the this drawing
   */
  public addEffect(effect: Effects.ISpriteEffect) {
    this.effects.push(effect);
    // We must check if the texture and the backing sprite pixels are loaded as well before
    // an effect can be applied
    if (!this._texture.isLoaded() || !this._pixelsLoaded) {
      this._dirtyEffect = true;
    } else {
      this._applyEffects();
    }
  }

  /**
   * Removes a [[ISpriteEffect]] from this sprite.
   * @param effect  Effect to remove from this sprite
   */
  public removeEffect(effect: Effects.ISpriteEffect): void;

  /**
   * Removes an effect given the index from this sprite.
   * @param index  Index of the effect to remove from this sprite
   */
  public removeEffect(index: number): void;
  public removeEffect(param: any) {
    var indexToRemove = -1;
    if (typeof param === 'number') {
      indexToRemove = param;
    } else {
      indexToRemove = this.effects.indexOf(param);
    }

    // bounds check
    if (indexToRemove < 0 || indexToRemove >= this.effects.length) {
      return;
    }

    this.effects.splice(indexToRemove, 1);

    // We must check if the texture and the backing sprite pixels are loaded as well before
    // an effect can be applied
    if (!this._texture.isLoaded() || !this._pixelsLoaded) {
      this._dirtyEffect = true;
    } else {
      this._applyEffects();
    }
  }

  private _applyEffects() {
    var naturalWidth = this._texture.image.naturalWidth || 0;
    var naturalHeight = this._texture.image.naturalHeight || 0;

    this._spriteCtx.clearRect(0, 0, this.width, this.height);
    this._spriteCtx.drawImage(
      this._texture.image,
      clamp(this.x, 0, naturalWidth),
      clamp(this.y, 0, naturalHeight),
      clamp(this.width, 0, naturalWidth),
      clamp(this.height, 0, naturalHeight),
      0,
      0,
      this.width,
      this.height
    );
    this._pixelData = this._spriteCtx.getImageData(0, 0, this.width, this.height);

    var i = 0,
      x = 0,
      y = 0,
      len = this.effects.length;
    for (i; i < len; i++) {
      y = 0;
      for (y; y < this.height; y++) {
        x = 0;
        for (x; x < this.width; x++) {
          this.effects[i].updatePixel(x, y, this._pixelData);
        }
      }
    }
    this._spriteCtx.clearRect(0, 0, this.width, this.height);
    this._spriteCtx.putImageData(this._pixelData, 0, 0);

    this._dirtyEffect = false;
  }

  /**
   * Clears all effects from the drawing and return it to its original state.
   */
  public clearEffects() {
    this.effects.length = 0;
    this._applyEffects();
  }

  /**
   * Resets the internal state of the drawing (if any)
   */
  public reset() {
    // do nothing
  }

  public debugDraw(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(this.rotation);
    var xpoint = this.drawWidth * this.anchor.x;
    var ypoint = this.drawHeight * this.anchor.y;

    ctx.strokeStyle = Color.Black.toString();
    ctx.strokeRect(-xpoint, -ypoint, this.drawWidth, this.drawHeight);
    ctx.restore();
  }

  /**
   * Draws the sprite appropriately to the 2D rendering context, at an x and y coordinate.
   * @param ctx  The 2D rendering context
   * @param x    The x coordinate of where to draw
   * @param y    The y coordinate of where to draw
   */
  public draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
    if (this._dirtyEffect) {
      this._applyEffects();
    }

    // calculating current dimensions
    ctx.save();
    var xpoint = this.drawWidth * this.anchor.x;
    var ypoint = this.drawHeight * this.anchor.y;
    ctx.translate(x, y);
    ctx.rotate(this.rotation);

    // todo cache flipped sprites
    if (this.flipHorizontal) {
      ctx.translate(this.drawWidth, 0);
      ctx.scale(-1, 1);
    }

    if (this.flipVertical) {
      ctx.translate(0, this.drawHeight);
      ctx.scale(1, -1);
    }

    ctx.drawImage(this._spriteCanvas, 0, 0, this.width, this.height, -xpoint, -ypoint, this.drawWidth, this.drawHeight);

    ctx.restore();
  }

  /**
   * Produces a copy of the current sprite
   */
  public clone(): SpriteImpl {
    var result = new Sprite(this._texture, this.x, this.y, this.width, this.height);
    result.scale = this.scale.clone();
    result.rotation = this.rotation;
    result.flipHorizontal = this.flipHorizontal;
    result.flipVertical = this.flipVertical;

    var i = 0,
      len = this.effects.length;
    for (i; i < len; i++) {
      result.addEffect(this.effects[i]);
    }
    return result;
  }
}

/**
 * [[include:Constructors.md]]
 */
export interface ISpriteArgs extends Partial<SpriteImpl> {
  image?: Texture;
  x?: number;
  /** @obsolete ex.[[Sprite.sx]] will be deprecated in 0.17.0 use ex.[[Sprite.x]] */
  sx?: number;
  y?: number;
  /** @obsolete ex.[[Sprite.sy]] will be deprecated in 0.17.0 use ex.[[Sprite.y]] */
  sy?: number;
  width?: number;
  /** @obsolete ex.[[Sprite.swidth]] will be deprecated in 0.17.0 use ex.[[Sprite.width]] */
  swidth?: number;
  height?: number;
  /** @obsolete ex.[[Sprite.sheight]] will be deprecated in 0.17.0 use ex.[[Sprite.height]] */
  sheight?: number;
  rotation?: number;
  anchor?: Vector;
  scale?: Vector;
  flipVertical?: boolean;
  flipHorizontal?: boolean;
}

/**
 * A [[Sprite]] is one of the main drawing primitives. It is responsible for drawing
 * images or parts of images from a [[Texture]] resource to the screen.
 *
 * [[include:Sprites.md]]
 */
export class Sprite extends Configurable(SpriteImpl) {
  constructor(config: ISpriteArgs);
  constructor(image: Texture, x: number, y: number, width: number, height: number);
  constructor(imageOrConfig: Texture | ISpriteArgs, x?: number, y?: number, width?: number, height?: number) {
    super(imageOrConfig, x, y, width, height);
  }
}
