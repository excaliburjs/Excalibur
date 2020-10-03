import { Sprite } from './Sprite';
import * as Effects from './SpriteEffects';
import { Color } from './Color';

import { Drawable, DrawOptions } from '../Interfaces/Drawable';
import { Vector } from '../Algebra';
import { Engine } from '../Engine';
import * as Util from '../Util/Util';
import { Configurable } from '../Configurable';

export interface HasTick {
  /**
   *
   * @param elapsedMilliseconds The amount of real world time in milliseconds that has elapsed that must be updated in the animation
   */
  tick(elapsedMilliseconds: number, idempotencyToken?: number): void;
}

/**
 * @hidden
 */
export class AnimationImpl implements Drawable, HasTick {
  /**
   * The sprite frames to play, in order. See [[SpriteSheet.getAnimationForAll]] to quickly
   * generate an [[Animation]].
   */
  public sprites: Sprite[] = [];

  /**
   * Duration to show each frame (in milliseconds)
   */
  public speed: number;

  /**
   * Current frame index being shown
   */
  public currentFrame: number = 0;

  private _timeLeftInFrame: number = 0;
  private _idempotencyToken: number = -1;

  public anchor: Vector = Vector.Zero;
  public rotation: number = 0.0;
  public scale: Vector = Vector.One;

  /**
   * Indicates whether the animation should loop after it is completed
   */
  public loop: boolean = true;

  /**
   * Indicates the frame index the animation should freeze on for a non-looping
   * animation. By default it is the last frame.
   */
  public freezeFrame: number = -1;

  private _engine: Engine;

  /**
   * Flip each frame vertically. Sets [[Sprite.flipVertical]].
   */
  public flipVertical: boolean = false;

  /**
   * Flip each frame horizontally. Sets [[Sprite.flipHorizontal]].
   */
  public flipHorizontal: boolean = false;

  public drawWidth: number = 0;
  public drawHeight: number = 0;
  public width: number = 0;
  public height: number = 0;

  private _opacity = 1;

  /**
   * Typically you will use a [[SpriteSheet]] to generate an [[Animation]].
   *
   * @param engineOrConfig  Reference to the current game engine
   * @param sprites  An array of sprites to create the frames for the animation
   * @param speed   The number in milliseconds to display each frame in the animation
   * @param loop    Indicates whether the animation should loop after it is completed
   */
  constructor(engineOrConfig: Engine | AnimationArgs, sprites: Sprite[], speed: number, loop?: boolean) {
    let engine = engineOrConfig;
    if (engineOrConfig && !(engineOrConfig instanceof Engine)) {
      const config = engineOrConfig;
      engine = config.engine;
      sprites = config.sprites;
      speed = config.speed;
      loop = config.loop;
    }

    this.sprites = sprites;
    this.speed = speed;
    this._engine = <Engine>engine;
    this._timeLeftInFrame = this.speed;

    if (loop != null) {
      this.loop = loop;
    }

    if (sprites && sprites[0]) {
      this.drawHeight = sprites[0] ? sprites[0].drawHeight : 0;
      this.drawWidth = sprites[0] ? sprites[0].drawWidth : 0;

      this.width = sprites[0] ? sprites[0].width : 0;
      this.height = sprites[0] ? sprites[0].height : 0;

      this.freezeFrame = sprites.length - 1;
    }
  }

  /**
   * Applies the opacity effect to a sprite, setting the alpha of all pixels to a given value
   */
  public opacity(value: number) {
    this._opacity = value;
  }

  /**
   * Applies the grayscale effect to a sprite, removing color information.
   */
  public grayscale() {
    this.addEffect(new Effects.Grayscale());
  }

  /**
   * Applies the invert effect to a sprite, inverting the pixel colors.
   */
  public invert() {
    this.addEffect(new Effects.Invert());
  }

  /**
   * Applies the fill effect to a sprite, changing the color channels of all non-transparent pixels to match a given color
   */
  public fill(color: Color) {
    this.addEffect(new Effects.Fill(color));
  }

  /**
   * Applies the colorize effect to a sprite, changing the color channels of all pixels to be the average of the original color and the
   * provided color.
   */
  public colorize(color: Color) {
    this.addEffect(new Effects.Colorize(color));
  }

  /**
   * Applies the lighten effect to a sprite, changes the lightness of the color according to hsl
   */
  public lighten(factor: number = 0.1) {
    this.addEffect(new Effects.Lighten(factor));
  }

  /**
   * Applies the darken effect to a sprite, changes the darkness of the color according to hsl
   */
  public darken(factor: number = 0.1) {
    this.addEffect(new Effects.Darken(factor));
  }

  /**
   * Applies the saturate effect to a sprite, saturates the color according to hsl
   */
  public saturate(factor: number = 0.1) {
    this.addEffect(new Effects.Saturate(factor));
  }

  /**
   * Applies the desaturate effect to a sprite, desaturates the color according to hsl
   */
  public desaturate(factor: number = 0.1) {
    this.addEffect(new Effects.Desaturate(factor));
  }

  /**
   * Add a [[SpriteEffect]] manually
   */
  public addEffect(effect: Effects.SpriteEffect) {
    for (const i in this.sprites) {
      this.sprites[i].addEffect(effect);
    }
  }

  /**
   * Removes an [[SpriteEffect]] from this animation.
   * @param effect Effect to remove from this animation
   */
  public removeEffect(effect: Effects.SpriteEffect): void;

  /**
   * Removes an effect given the index from this animation.
   * @param index  Index of the effect to remove from this animation
   */
  public removeEffect(index: number): void;
  public removeEffect(param: any) {
    for (const i in this.sprites) {
      this.sprites[i].removeEffect(param);
    }
  }

  /**
   * Clear all sprite effects
   */
  public clearEffects() {
    for (const i in this.sprites) {
      this.sprites[i].clearEffects();
    }
  }

  private _setAnchor(point: Vector) {
    //if (!this.anchor.equals(point)) {
    for (const i in this.sprites) {
      this.sprites[i].anchor.setTo(point.x, point.y);
    }
    //}
  }

  private _setRotation(radians: number) {
    //if (this.rotation !== radians) {
    for (const i in this.sprites) {
      this.sprites[i].rotation = radians;
    }
    //}
  }

  private _setScale(scale: Vector) {
    //if (!this.scale.equals(scale)) {
    for (const i in this.sprites) {
      this.sprites[i].scale = scale;
    }
    //}
  }

  /**
   * Resets the animation to first frame.
   */
  public reset() {
    this.currentFrame = 0;
  }

  /**
   * Indicates whether the animation is complete, animations that loop are never complete.
   */
  public isDone() {
    return !this.loop && this.currentFrame >= this.sprites.length;
  }

  /**
   * Not meant to be called by game developers. Ticks the animation forward internally and
   * calculates whether to change to the frame.
   * @internal
   */
  public tick(elapsed: number, idempotencyToken?: number) {
    if (this._idempotencyToken === idempotencyToken) {
      return;
    }
    this._idempotencyToken = idempotencyToken;
    this._timeLeftInFrame -= elapsed;
    if (this._timeLeftInFrame <= 0) {
      this.currentFrame = this.loop ? (this.currentFrame + 1) % this.sprites.length : this.currentFrame + 1;
      this._timeLeftInFrame = this.speed;
    }

    this._updateValues();
    const current = this.sprites[this.currentFrame];
    if (current) {
      this.width = current.width;
      this.height = current.height;
      this.drawWidth = current.drawWidth;
      this.drawHeight = current.drawHeight;
    }
  }

  private _updateValues(): void {
    this._setAnchor(this.anchor);
    this._setRotation(this.rotation);
    this._setScale(this.scale);
  }

  /**
   * Skips ahead a specified number of frames in the animation
   * @param frames  Frames to skip ahead
   */
  public skip(frames: number) {
    this.currentFrame = (this.currentFrame + frames) % this.sprites.length;
  }

  /**
   * Draws the animation appropriately to the 2D rendering context, at an x and y coordinate.
   * @param ctx  The 2D rendering context
   * @param x    The x coordinate of where to draw
   * @param y    The y coordinate of where to draw
   */
  public draw(ctx: CanvasRenderingContext2D, x: number, y: number): void;
  /**
   * Draws the animation with custom options to override internals without mutating them.
   * @param options
   */
  public draw(options: DrawOptions): void;
  public draw(ctxOrOptions: CanvasRenderingContext2D | DrawOptions, x?: number, y?: number) {
    if (ctxOrOptions instanceof CanvasRenderingContext2D) {
      this._drawWithOptions({ ctx: ctxOrOptions, x, y });
    } else {
      this._drawWithOptions(ctxOrOptions);
    }
  }

  private _drawWithOptions(options: DrawOptions) {
    const animOptions = {
      ...options,
      rotation: options.rotation ?? this.rotation,
      drawWidth: options.drawWidth ?? this.drawWidth,
      drawHeight: options.drawHeight ?? this.drawHeight,
      flipHorizontal: options.flipHorizontal ?? this.flipHorizontal,
      flipVertical: options.flipVertical ?? this.flipVertical,
      anchor: options.anchor ?? this.anchor,
      opacity: options.opacity ?? this._opacity
    };

    this._updateValues();
    let currSprite: Sprite;
    if (this.currentFrame < this.sprites.length) {
      currSprite = this.sprites[this.currentFrame];
      currSprite.draw(animOptions);
    }

    if (this.freezeFrame !== -1 && this.currentFrame >= this.sprites.length) {
      currSprite = this.sprites[Util.clamp(this.freezeFrame, 0, this.sprites.length - 1)];
      currSprite.draw(animOptions);
    }

    // add the calculated width
    if (currSprite) {
      this.drawWidth = currSprite.drawWidth;
      this.drawHeight = currSprite.drawHeight;
    }
  }

  /**
   * Plays an animation at an arbitrary location in the game.
   * @param x  The x position in the game to play
   * @param y  The y position in the game to play
   */
  public play(x: number, y: number) {
    this.reset();
    this._engine.playAnimation(this, x, y);
  }
}

export interface AnimationArgs extends Partial<AnimationImpl> {
  engine: Engine;
  sprites: Sprite[];
  speed: number;
  loop?: boolean;
  anchor?: Vector;
  rotation?: number;
  scale?: Vector;
  flipVertical?: boolean;
  flipHorizontal?: boolean;
  width?: number;
  height?: number;
}

/**
 * Animations allow you to display a series of images one after another,
 * creating the illusion of change. Generally these images will come from a [[SpriteSheet]] source.
 */
export class Animation extends Configurable(AnimationImpl) {
  constructor(config: AnimationArgs);
  constructor(engine: Engine, images: Sprite[], speed: number, loop?: boolean);
  constructor(engineOrConfig: Engine | AnimationArgs, images?: Sprite[], speed?: number, loop?: boolean) {
    super(engineOrConfig, images, speed, loop);
  }
}
