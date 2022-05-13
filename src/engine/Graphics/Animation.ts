import { Graphic, GraphicOptions } from './Graphic';
import { ExcaliburGraphicsContext } from './Context/ExcaliburGraphicsContext';
import { EventDispatcher } from '../EventDispatcher';
import { SpriteSheet } from './SpriteSheet';
import { Logger } from '../Util/Log';
import { clamp } from '../Math/util';

export interface HasTick {
  /**
   *
   * @param elapsedMilliseconds The amount of real world time in milliseconds that has elapsed that must be updated in the animation
   * @param idempotencyToken Optional idempotencyToken prevents a ticking animation from updating twice per frame
   */
  tick(elapsedMilliseconds: number, idempotencyToken?: number): void;
}

export enum AnimationDirection {
  /**
   * Animation is playing forwards
   */
  Forward = 'forward',
  /**
   * Animation is play backwards
   */
  Backward = 'backward'
}

export enum AnimationStrategy {
  /**
   * Animation ends without displaying anything
   */
  End = 'end',
  /**
   * Animation loops to the first frame after the last frame
   */
  Loop = 'loop',
  /**
   * Animation plays to the last frame, then backwards to the first frame, then repeats
   */
  PingPong = 'pingpong',
  /**
   * Animation ends stopping on the last frame
   */
  Freeze = 'freeze'
}

/**
 * Frame of animation
 */
export interface Frame {
  /**
   * Optionally specify a graphic to show, no graphic shows an empty frame
   */
  graphic?: Graphic;
  /**
   * Optionally specify the number of ms the frame should be visible, overrides the animation duration (default 100 ms)
   */
  duration?: number;
}

/**
 * Animation options for building an animation via constructor.
 */
export interface AnimationOptions {
  /**
   * List of frames in the order you wish to play them
   */
  frames: Frame[];
  /**
   * Optionally reverse the direction of play
   */
  reverse?: boolean;
  /**
   * Optionally specify a default frame duration in ms (Default is 1000)
   */
  frameDuration?: number;
  /**
   * Optionally specify a total duration of the animation in ms to calculate each frame's duration
   */
  totalDuration?: number;
  /**
   * Optionally specify the [[AnimationStrategy]] for the Animation
   */
  strategy?: AnimationStrategy;
}

// TODO wire up to new Emitter
export type AnimationEvents = {
  frame: Frame;
  loop: Animation;
  ended: Animation;
};

/**
 * Create an Animation given a list of [[Frame|frames]] in [[AnimationOptions]]
 *
 * To create an Animation from a [[SpriteSheet]], use [[Animation.fromSpriteSheet]]
 */
export class Animation extends Graphic implements HasTick {
  private static _LOGGER = Logger.getInstance();
  public events = new EventDispatcher<any>(); // TODO replace with new Emitter
  public frames: Frame[] = [];
  public strategy: AnimationStrategy = AnimationStrategy.Loop;
  public frameDuration: number = 100;
  public timeScale: number = 1;

  private _idempotencyToken = -1;

  private _firstTick = true;
  private _currentFrame = 0;
  private _timeLeftInFrame = 0;
  private _direction = 1; // TODO only used in ping-pong
  private _done = false;
  private _playing = true;

  constructor(options: GraphicOptions & AnimationOptions) {
    super(options);
    this.frames = options.frames;
    this.strategy = options.strategy ?? this.strategy;
    this.frameDuration = options.totalDuration ? options.totalDuration / this.frames.length : options.frameDuration ?? this.frameDuration;
    if (options.reverse) {
      this.reverse();
    }
    this.goToFrame(0);
  }

  public clone(): Animation {
    return new Animation({
      frames: this.frames.map((f) => ({ ...f })),
      frameDuration: this.frameDuration,
      reverse: this._reversed,
      strategy: this.strategy,
      ...this.cloneGraphicOptions()
    });
  }

  public override get width(): number {
    const maybeFrame = this.currentFrame;
    if (maybeFrame) {
      return Math.abs(maybeFrame.graphic.width * this.scale.x);
    }
    return 0;
  }

  public override get height(): number {
    const maybeFrame = this.currentFrame;
    if (maybeFrame) {
      return Math.abs(maybeFrame.graphic.height * this.scale.y);
    }
    return 0;
  }


  /**
   * Create an Animation from a [[SpriteSheet]], a list of indices into the sprite sheet, a duration per frame
   * and optional [[AnimationStrategy]]
   *
   * Example:
   * ```typescript
   * const spriteSheet = SpriteSheet.fromImageSource({...});
   *
   * const anim = Animation.fromSpriteSheet(spriteSheet, range(0, 5), 200, AnimationStrategy.Loop);
   * ```
   *
   * @param spriteSheet
   * @param frameIndices
   * @param durationPerFrameMs
   * @param strategy
   */
  public static fromSpriteSheet(
    spriteSheet: SpriteSheet,
    frameIndices: number[],
    durationPerFrameMs: number,
    strategy: AnimationStrategy = AnimationStrategy.Loop
  ): Animation {
    const maxIndex = spriteSheet.sprites.length - 1;
    const invalidIndices = frameIndices.filter((index) => index < 0 || index > maxIndex);
    if (invalidIndices.length) {
      Animation._LOGGER.warn(
        `Indices into SpriteSheet were provided that don\'t exist: ${invalidIndices.join(',')} no frame will be shown`
      );
    }
    return new Animation({
      frames: spriteSheet.sprites
        .filter((_, index) => frameIndices.indexOf(index) > -1)
        .map((f) => ({
          graphic: f,
          duration: durationPerFrameMs
        })),
      strategy: strategy
    });
  }

  /**
   * Returns the current Frame of the animation
   */
  public get currentFrame(): Frame | null {
    if (this._currentFrame >= 0 && this._currentFrame < this.frames.length) {
      return this.frames[this._currentFrame];
    }
    return null;
  }

  /**
   * Returns the current frame index of the animation
   */
  public get currentFrameIndex(): number {
    return this._currentFrame;
  }

  /**
   * Returns `true` if the animation is playing
   */
  public get isPlaying(): boolean {
    return this._playing;
  }

  private _reversed = false;
  /**
   * Reverses the play direction of the Animation, this preserves the current frame
   */
  public reverse(): void {
    // Don't mutate with the original frame list, create a copy
    this.frames = this.frames.slice().reverse();
    this._reversed = !this._reversed;
  }

  /**
   * Returns the current play direction of the animation
   */
  public get direction(): AnimationDirection {
    // Keep logically consistent with ping-pong direction
    // If ping-pong is forward = 1 and reversed is true then we are logically reversed
    const reversed = (this._reversed && this._direction === 1) ? true : false;
    return reversed ? AnimationDirection.Backward : AnimationDirection.Forward;
  }

  /**
   * Plays or resumes the animation from the current frame
   */
  public play(): void {
    this._playing = true;
  }

  /**
   * Pauses the animation on the current frame
   */
  public pause(): void {
    this._playing = false;
    this._firstTick = true; // firstTick must be set to emit the proper frame event
  }

  /**
   * Reset the animation back to the beginning, including if the animation were done
   */
  public reset(): void {
    this._done = false;
    this._firstTick = true;
    this._currentFrame = 0;
  }

  /**
   * Returns `true` if the animation can end
   */
  public get canFinish(): boolean {
    switch (this.strategy) {
      case AnimationStrategy.End:
      case AnimationStrategy.Freeze: {
        return true;
      }
      default: {
        return false;
      }
    }
  }

  /**
   * Returns `true` if the animation is done, for looping type animations
   * `ex.AnimationStrategy.PingPong` and `ex.AnimationStrategy.Loop` this will always return `false`
   *
   * See the `ex.Animation.canFinish()` method to know if an animation type can end
   */
  public get done(): boolean {
    return this._done;
  }

  /**
   * Jump the animation immediately to a specific frame if it exists
   * @param frameNumber
   */
  public goToFrame(frameNumber: number) {
    this._currentFrame = frameNumber;
    this._timeLeftInFrame = this.frameDuration;
    const maybeFrame = this.frames[this._currentFrame];
    if (maybeFrame && !this._done) {
      this._timeLeftInFrame = maybeFrame?.duration || this.frameDuration;
      this.events.emit('frame', maybeFrame as any);
    }
  }

  private _nextFrame(): number {
    const currentFrame = this._currentFrame;
    if (this._done) {
      return currentFrame;
    }
    let next = -1;

    switch (this.strategy) {
      case AnimationStrategy.Loop: {
        next = (currentFrame + 1) % this.frames.length;
        if (next === 0) {
          this.events.emit('loop', this as any);
        }
        break;
      }
      case AnimationStrategy.End: {
        next = currentFrame + 1;
        if (next >= this.frames.length) {
          this._done = true;
          this._currentFrame = this.frames.length;
          this.events.emit('end', this as any);
        }
        break;
      }
      case AnimationStrategy.Freeze: {
        next = clamp(currentFrame + 1, 0, this.frames.length - 1);
        if (next >= this.frames.length - 1) {
          this._done = true;
          this.events.emit('end', this as any);
        }
        break;
      }
      case AnimationStrategy.PingPong: {
        if (currentFrame + this._direction >= this.frames.length) {
          this._direction = -1;
          this.events.emit('loop', this as any);
        }

        if (currentFrame + this._direction < 0) {
          this._direction = 1;
          this.events.emit('loop', this as any);
        }

        next = currentFrame + (this._direction % this.frames.length);
        break;
      }
    }
    return next;
  }

  /**
   * Called internally by Excalibur to update the state of the animation potential update the current frame
   * @param elapsedMilliseconds Milliseconds elapsed
   * @param idempotencyToken Prevents double ticking in a frame by passing a unique token to the frame
   */
  public tick(elapsedMilliseconds: number, idempotencyToken: number = 0): void {
    if (this._idempotencyToken === idempotencyToken) {
      return;
    }
    this._idempotencyToken = idempotencyToken;
    if (!this._playing) {
      return;
    }

    // if it's the first frame emit frame event
    if (this._firstTick) {
      this._firstTick = false;
      this.events.emit('frame', this.currentFrame as any);
    }

    this._timeLeftInFrame -= elapsedMilliseconds * this.timeScale;
    if (this._timeLeftInFrame <= 0) {
      this.goToFrame(this._nextFrame());
    }
  }

  protected _drawImage(ctx: ExcaliburGraphicsContext, x: number, y: number) {
    if (this.currentFrame) {
      this.currentFrame.graphic.draw(ctx, x, y);
    }
  }
}
