import * as Effects from './SpriteEffects';
import { Color } from './Color';

import { Drawable, DrawOptions } from '../Interfaces/Drawable';
import { Texture } from '../Resources/Texture';
import { Vector } from '../Algebra';
import { Logger } from '../Util/Log';
import { clamp } from '../Util/Util';
import { Configurable } from '../Configurable';
import { obsolete } from '../Util/Decorators';

/**
 * @hidden
 * @deprecated Use [[Graphics.Sprite]]
 */
export class SpriteImpl implements Drawable {
  public texture: Texture;

  public x: number = 0;
  public y: number = 0;

  public get drawWidth(): number {
    return Math.abs(this.width * this.scale.x);
  }

  public get drawHeight(): number {
    return Math.abs(this.height * this.scale.y);
  }

  public rotation: number = 0.0;
  public anchor: Vector = Vector.Half;
  public offset: Vector = Vector.Zero;
  public scale: Vector = Vector.One;
  /**
   * Default: false, should the sprite be drawn around the anchor or from the top left.
   * Sprite rotations/scaling still happen around the anchor regardless of this setting.
   */
  public drawAroundAnchor = false;

  public logger: Logger = Logger.getInstance();

  /**
   * Draws the sprite flipped vertically
   */
  public flipVertical: boolean = false;

  /**
   * Draws the sprite flipped horizontally
   */
  public flipHorizontal: boolean = false;

  public effects: Effects.SpriteEffect[] = [];

  public width: number = 0;
  public height: number = 0;

  private _spriteCanvas: HTMLCanvasElement = null;
  private _spriteCtx: CanvasRenderingContext2D = null;
  private _pixelData: ImageData = null;
  private _pixelsLoaded: boolean = false;
  private _dirtyEffect: boolean = true;

  /**
   * @param imageOrConfig  The backing image texture to build the Sprite, or Sprite option bag
   * @param x      The x position of the sprite
   * @param y      The y position of the sprite
   * @param width  The width of the sprite in pixels
   * @param height The height of the sprite in pixels
   */
  constructor(imageOrConfig: Texture | SpriteArgs, x: number, y: number, width: number, height: number) {
    let image = imageOrConfig;
    if (imageOrConfig && !(imageOrConfig instanceof Texture)) {
      x = imageOrConfig.x | 0;
      y = imageOrConfig.y | 0;
      width = imageOrConfig.width | 0;
      height = imageOrConfig.height | 0;
      image = imageOrConfig.image;
      if (!image) {
        const message = 'An image texture is required to construct a sprite';
        throw new Error(message);
      }
    }

    this.x = x || 0;
    this.y = y || 0;

    this.texture = image as Texture;
    this._spriteCanvas = document.createElement('canvas');
    this._spriteCanvas.width = width;
    this._spriteCanvas.height = height;
    this._spriteCtx = this._spriteCanvas.getContext('2d');
    this._initPixelsFromTexture();

    this.width = width;
    this.height = height;
  }

  private async _initPixelsFromTexture() {
    try {
      const image = await this.texture.loaded;
      this.width = this.width || image.naturalWidth;
      this.height = this.height || image.naturalHeight;
      this._spriteCanvas.width = this._spriteCanvas.width || image.naturalWidth;
      this._spriteCanvas.height = this._spriteCanvas.height || image.naturalHeight;
      this._loadPixels();
      this._dirtyEffect = true;
    } catch (e) {
      this.logger.error('Error loading texture ', this.texture.path, e);
    }
  }

  private _loadPixels() {
    if (this.texture.isLoaded() && !this._pixelsLoaded) {
      const naturalWidth = this.texture.image.naturalWidth || 0;
      const naturalHeight = this.texture.image.naturalHeight || 0;

      if (this.width > naturalWidth) {
        this.logger.warn(`The sprite width ${this.width} exceeds the width 
                              ${naturalWidth} of the backing texture ${this.texture.path}`);
      }

      if (this.width <= 0 || naturalWidth <= 0) {
        throw new Error(`The width of a sprite cannot be 0 or negative, sprite width: ${this.width}, original width: ${naturalWidth}`);
      }

      if (this.height > naturalHeight) {
        this.logger.warn(`The sprite height ${this.height} exceeds the height 
                              ${naturalHeight} of the backing texture ${this.texture.path}`);
      }

      if (this.height <= 0 || naturalHeight <= 0) {
        throw new Error(`The height of a sprite cannot be 0 or negative, sprite height: ${this.height}, original height: ${naturalHeight}`);
      }

      this._flushTexture();

      this._pixelsLoaded = true;
    }
  }

  private _flushTexture() {
    const naturalWidth = this.texture.image.naturalWidth || 0;
    const naturalHeight = this.texture.image.naturalHeight || 0;

    this._spriteCtx.clearRect(0, 0, this.width, this.height);
    this._spriteCtx.drawImage(
      this.texture.image,
      clamp(this.x, 0, naturalWidth),
      clamp(this.y, 0, naturalHeight),
      clamp(this.width, 0, naturalWidth),
      clamp(this.height, 0, naturalHeight),
      0,
      0,
      this.width,
      this.height
    );
  }

  private _opacity: number = 1;
  /**
   * Applies the [[Opacity]] effect to a sprite, setting the alpha of all pixels to a given value
   */
  public opacity(value: number) {
    this._opacity = value;
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
   * Adds a new [[SpriteEffect]] to this drawing.
   * @param effect  Effect to add to the this drawing
   */
  public addEffect(effect: Effects.SpriteEffect) {
    this.effects.push(effect);
    // We must check if the texture and the backing sprite pixels are loaded as well before
    // an effect can be applied
    if (!this.texture.isLoaded() || !this._pixelsLoaded) {
      this._dirtyEffect = true;
    } else {
      this._applyEffects();
    }
  }

  /**
   * Removes a [[SpriteEffect]] from this sprite.
   * @param effect  Effect to remove from this sprite
   */
  public removeEffect(effect: Effects.SpriteEffect): void;

  /**
   * Removes an effect given the index from this sprite.
   * @param index  Index of the effect to remove from this sprite
   */
  public removeEffect(index: number): void;
  public removeEffect(param: any) {
    let indexToRemove = -1;
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
    if (!this.texture.isLoaded() || !this._pixelsLoaded) {
      this._dirtyEffect = true;
    } else {
      this._applyEffects();
    }
  }

  private _applyEffects() {
    this._flushTexture();

    if (this.effects.length > 0) {
      this._pixelData = this._spriteCtx.getImageData(0, 0, this.width, this.height);

      const len = this.effects.length;
      for (let i = 0; i < len; i++) {
        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            this.effects[i].updatePixel(x, y, this._pixelData);
          }
        }
      }
      this._spriteCtx.clearRect(0, 0, this.width, this.height);
      this._spriteCtx.putImageData(this._pixelData, 0, 0);
    }

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
    const xpoint = this.drawWidth * this.anchor.x;
    const ypoint = this.drawHeight * this.anchor.y;

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
  public draw(ctx: CanvasRenderingContext2D, x: number, y: number): void;
  /**
   * Draws the sprite with custom options to override internals without mutating them.
   * @param options
   */
  public draw(options: DrawOptions): void;
  public draw(ctxOrOptions: CanvasRenderingContext2D | DrawOptions, x?: number, y?: number): void {
    if (ctxOrOptions instanceof CanvasRenderingContext2D) {
      this._drawWithOptions({ ctx: ctxOrOptions, x, y });
    } else {
      this._drawWithOptions(ctxOrOptions);
    }
  }

  private _drawWithOptions(options: DrawOptions) {
    const { ctx, x, y, rotation, drawWidth, drawHeight, anchor, offset, opacity, flipHorizontal, flipVertical } = {
      ...options,
      rotation: options.rotation ?? this.rotation,
      drawWidth: options.drawWidth ?? this.width,
      drawHeight: options.drawHeight ?? this.height,
      flipHorizontal: options.flipHorizontal ?? this.flipHorizontal,
      flipVertical: options.flipVertical ?? this.flipVertical,
      anchor: options.anchor ?? this.anchor,
      offset: options.offset ?? this.offset,
      opacity: (options.opacity ?? 1) * (this._opacity ?? 1)
    };

    if (this._dirtyEffect) {
      this._applyEffects();
    }
    // calculating current dimensions
    const anchorX = drawWidth * anchor.x + offset.x;
    const anchorY = drawHeight * anchor.y + offset.y;
    const scaleDirX = this.scale.x > 0 ? 1 : -1;
    const scaleDirY = this.scale.y > 0 ? 1 : -1;

    ctx.save();
    // Move the draw point of origin
    ctx.translate(x, y);

    // Rotate and scale around anchor point
    // This requires a bit of explaination, scale coordinates first positive flipping or rotating
    ctx.scale(Math.abs(this.scale.x), Math.abs(this.scale.y));

    if (this.drawAroundAnchor) {
      // In the case where you want the anchor to match with the point of draw
      // Otherwise sprites are always drawn from top-left
      ctx.translate(-anchorX, -anchorY);
    }

    ctx.translate(anchorX, anchorY);
    ctx.rotate(rotation);
    // This is for handling direction changes 1 or -1, that way we don't have mismatched translates()
    ctx.scale(scaleDirX, scaleDirY);
    ctx.translate(-anchorX, -anchorY);

    if (flipHorizontal) {
      ctx.translate(drawWidth, 0);
      ctx.scale(-1, 1);
    }

    if (flipVertical) {
      ctx.translate(0, drawHeight);
      ctx.scale(1, -1);
    }
    const oldAlpha = ctx.globalAlpha;
    ctx.globalAlpha = opacity;
    // Context is already rotated and scaled
    ctx.drawImage(
      this._spriteCanvas,
      0,
      0,
      this.width,
      this.height, // source
      0,
      0,
      this.width,
      this.height
    ); // dest
    ctx.globalAlpha = oldAlpha;
    ctx.restore();
  }

  /**
   * Produces a copy of the current sprite
   */
  public clone(): SpriteImpl {
    const result = new Sprite(this.texture, this.x, this.y, this.width, this.height);
    result.anchor = this.anchor.clone();
    result.scale = this.scale.clone();
    result.rotation = this.rotation;
    result.flipHorizontal = this.flipHorizontal;
    result.flipVertical = this.flipVertical;

    const len = this.effects.length;
    for (let i = 0; i < len; i++) {
      result.addEffect(this.effects[i]);
    }
    return result;
  }
}

/**
 * @deprecated Use [[Graphics.Sprite]]
 */
export interface SpriteArgs extends Partial<SpriteImpl> {
  image?: Texture;
  x?: number;
  width?: number;
  height?: number;
  rotation?: number;
  anchor?: Vector;
  scale?: Vector;
  flipVertical?: boolean;
  flipHorizontal?: boolean;
}

/**
 * A [[Sprite]] is one of the main drawing primitives. It is responsible for drawing
 * images or parts of images from a [[Texture]] resource to the screen.
 * @deprecated Use [[Graphics.Sprite]]
 */
@obsolete({
  message: 'Label.clearTextShadow will be removed in v0.26.0',
  alternateMethod: 'Use Label.font.shadow'
})
export class Sprite extends Configurable(SpriteImpl) {
  constructor(config: SpriteArgs);
  constructor(image: Texture, x: number, y: number, width: number, height: number);
  constructor(imageOrConfig: Texture | SpriteArgs, x?: number, y?: number, width?: number, height?: number) {
    super(imageOrConfig, x, y, width, height);
  }
}
