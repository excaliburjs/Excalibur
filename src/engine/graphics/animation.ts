import type { GraphicOptions } from './graphic';
import { Graphic } from './graphic';
import type { ExcaliburGraphicsContext } from './context/excalibur-graphics-context';
import type { GetSpriteOptions, SpriteSheet } from './sprite-sheet';
import { Logger } from '../util/log';
import { clamp } from '../math/util';
import { EventEmitter } from '../event-emitter';

export interface HasTick {
  /**
   *
   * @param elapsed The amount of real world time in milliseconds that has elapsed that must be updated in the animation
   * @param idempotencyToken Optional idempotencyToken prevents a ticking animation from updating twice per frame
   */
  tick(elapsed: number, idempotencyToken?: number): void;
}

export enum AnimationDirection {
  /**
   * Animation is playing forwards
   */
  Forward = 'forward',
  /**
   * Animation is playing backwards
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

export interface FrameEvent extends Frame {
  frameIndex: number;
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
   * Optionally set a positive speed multiplier on the animation.
   *
   * By default 1, meaning 1x speed. If set to 2, it will play the animation twice as fast.
   */
  speed?: number;
  /**
   * Optionally reverse the direction of play
   */
  reverse?: boolean;
  /**
   * Optionally specify a default frame duration in ms (Default is 100)
   */
  frameDuration?: number;
  /**
   * Optionally specify a total duration of the animation in ms to calculate each frame's duration
   */
  totalDuration?: number;
  /**
   * Optionally specify the {@apilink AnimationStrategy} for the Animation
   */
  strategy?: AnimationStrategy;
  /**
   * Optionally set arbitrary meta data for the animation
   */
  data?: Record<string, any>;
}

export interface AnimationEvents {
  frame: FrameEvent;
  loop: Animation;
  end: Animation;
}

export const AnimationEvents = {
  Frame: 'frame',
  Loop: 'loop',
  End: 'end'
};

export interface FromSpriteSheetOptions {
  /**
   * {@apilink SpriteSheet} to source the animation frames from
   */
  spriteSheet: SpriteSheet;
  /**
   * The list of (x, y) positions of sprites in the {@apilink SpriteSheet} of each frame, for example (0, 0)
   * is the the top left sprite, (0, 1) is the sprite directly below that, and so on.
   *
   * You may optionally specify a duration for the frame in milliseconds as well, this will override
   * the default duration.
   */
  frameCoordinates: { x: number; y: number; duration?: number; options?: GetSpriteOptions }[];

  /**
   * Optionally specify a default duration for frames in milliseconds
   */
  durationPerFrame?: number;
  /**
   * Optionally set a positive speed multiplier on the animation.
   *
   * By default 1, meaning 1x speed. If set to 2, it will play the animation twice as fast.
   */
  speed?: number;
  /**
   * Optionally specify the animation strategy for this animation, by default animations loop {@apilink AnimationStrategy.Loop}
   */
  strategy?: AnimationStrategy;
  /**
   * Optionally specify the animation should be reversed
   */
  reverse?: boolean;
  /**
   * Optionally set arbitrary meta data for the animation
   */
  data?: Record<string, any>;
}

/**
 * Create an Animation given a list of {@apilink Frame | `frames`} in {@apilink AnimationOptions}
 *
 * To create an Animation from a {@apilink SpriteSheet}, use {@apilink Animation.fromSpriteSheet}
 */
export class Animation extends Graphic implements HasTick {
  private static _LOGGER = Logger.getInstance();
  public events = new EventEmitter<AnimationEvents>();
  public frames: Frame[] = [];
  public strategy: AnimationStrategy = AnimationStrategy.Loop;
  public frameDuration: number = 100;
  public data: Map<string, any>;

  private _idempotencyToken = -1;

  private _firstTick = true;
  private _currentFrame = 0;
  private _timeLeftInFrame = 0;
  private _pingPongDirection = 1;
  private _done = false;
  private _playing = true;
  private _speed = 1;
  private _wasResetDuringFrameCalc: boolean = false;

  constructor(options: GraphicOptions & AnimationOptions) {
    super(options);
    this.frames = options.frames;
    this.speed = options.speed ?? this.speed;
    this.strategy = options.strategy ?? this.strategy;
    this.frameDuration = options.totalDuration ? options.totalDuration / this.frames.length : (options.frameDuration ?? this.frameDuration);
    this.data = options.data ? new Map(Object.entries(options.data)) : new Map<string, any>();
    if (options.reverse) {
      this.reverse();
    }
    this.goToFrame(0);
  }

  public clone<T extends typeof Animation>(): InstanceType<T> {
    const ctor = this.constructor as T;
    return new ctor({
      frames: this.frames.map((f) => ({ ...f })),
      frameDuration: this.frameDuration,
      speed: this.speed,
      reverse: this._reversed,
      strategy: this.strategy,
      ...this.cloneGraphicOptions()
    }) as InstanceType<T>;
  }

  public override get width(): number {
    const maybeFrame = this.currentFrame;
    if (maybeFrame && maybeFrame.graphic) {
      return Math.abs(maybeFrame.graphic.width * this.scale.x);
    }
    return 0;
  }

  public override get height(): number {
    const maybeFrame = this.currentFrame;
    if (maybeFrame && maybeFrame.graphic) {
      return Math.abs(maybeFrame.graphic.height * this.scale.y);
    }
    return 0;
  }

  /**
   * Create an Animation from a {@apilink SpriteSheet}, a list of indices into the sprite sheet, a duration per frame
   * and optional {@apilink AnimationStrategy}
   *
   * Example:
   * ```typescript
   * const spriteSheet = SpriteSheet.fromImageSource({...});
   *
   * const anim = Animation.fromSpriteSheet(spriteSheet, range(0, 5), 200, AnimationStrategy.Loop);
   * ```
   * @param spriteSheet ex.SpriteSheet
   * @param spriteSheetIndex 0 based index from left to right, top down (row major order) of the ex.SpriteSheet
   * @param durationPerFrame duration per frame in milliseconds
   * @param strategy Optional strategy, default AnimationStrategy.Loop
   */
  public static fromSpriteSheet<T extends typeof Animation>(
    this: T,
    spriteSheet: SpriteSheet,
    spriteSheetIndex: number[],
    durationPerFrame: number,
    strategy: AnimationStrategy = AnimationStrategy.Loop,
    data?: Record<string, any>
  ): InstanceType<T> {
    const maxIndex = spriteSheet.sprites.length - 1;
    const validIndices: number[] = [];
    const invalidIndices: number[] = [];
    spriteSheetIndex.forEach((index) => {
      if (index < 0 || index > maxIndex) {
        invalidIndices.push(index);
      } else {
        validIndices.push(index);
      }
    });

    if (invalidIndices.length) {
      Animation._LOGGER.warn(
        `Indices into SpriteSheet were provided that don\'t exist: frames ${invalidIndices.join(',')} will not be shown`
      );
    }
    return new this({
      frames: validIndices.map((validIndex) => ({
        graphic: spriteSheet.sprites[validIndex],
        duration: durationPerFrame
      })),
      strategy: strategy,
      data
    }) as InstanceType<T>;
  }

  /**
   * Create an {@apilink Animation} from a {@apilink SpriteSheet} given a list of coordinates
   *
   * Example:
   * ```typescript
   * const spriteSheet = SpriteSheet.fromImageSource({...});
   *
   * const anim = Animation.fromSpriteSheetCoordinates({
   *  spriteSheet,
   *  frameCoordinates: [
   *    {x: 0, y: 5, duration: 100, options { flipHorizontal: true }},
   *    {x: 1, y: 5, duration: 200},
   *    {x: 2, y: 5},
   *    {x: 3, y: 5}
   *  ],
   *  strategy: AnimationStrategy.PingPong
   * });
   * ```
   * @param options
   * @returns Animation
   */
  public static fromSpriteSheetCoordinates<T extends typeof Animation>(this: T, options: FromSpriteSheetOptions): InstanceType<T> {
    const { spriteSheet, frameCoordinates, durationPerFrame, speed, strategy, reverse, data } = options;
    const defaultDuration = durationPerFrame ?? 100;
    const frames: Frame[] = [];
    for (const coord of frameCoordinates) {
      const { x, y, duration, options } = coord;
      const sprite = spriteSheet.getSprite(x, y, options);
      if (sprite) {
        frames.push({
          graphic: sprite,
          duration: duration ?? defaultDuration
        });
      } else {
        Animation._LOGGER.warn(
          `Skipping frame! SpriteSheet does not have coordinate (${x}, ${y}), please check your SpriteSheet to confirm that sprite exists`
        );
      }
    }

    return new this({
      frames,
      strategy,
      speed,
      reverse,
      data
    }) as InstanceType<T>;
  }

  /**
   * Current animation speed
   *
   * 1 meaning normal 1x speed.
   * 2 meaning 2x speed and so on.
   */
  public get speed(): number {
    return this._speed;
  }

  /**
   * Current animation speed
   *
   * 1 meaning normal 1x speed.
   * 2 meaning 2x speed and so on.
   */
  public set speed(val: number) {
    this._speed = clamp(Math.abs(val), 0, Infinity);
  }

  /**
   * Returns the current Frame of the animation
   *
   * Use {@apilink Animation.currentFrameIndex} to get the frame number and
   * {@apilink Animation.goToFrame} to set the current frame index
   */
  public get currentFrame(): Frame | null {
    if (this._currentFrame >= 0 && this._currentFrame < this.frames.length) {
      return this.frames[this._currentFrame];
    }
    return null;
  }

  /**
   * Returns the current frame index of the animation
   *
   * Use {@apilink Animation.currentFrame} to grab the current {@apilink Frame} object
   */
  public get currentFrameIndex(): number {
    return this._currentFrame;
  }

  /**
   * Returns the amount of time in milliseconds left in the current frame
   */
  public get currentFrameTimeLeft(): number {
    return this._timeLeftInFrame;
  }

  /**
   * Returns `true` if the animation is playing
   */
  public get isPlaying(): boolean {
    return this._playing;
  }

  private _reversed = false;

  public get isReversed() {
    return this._reversed;
  }

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
    const reversed = this._reversed && this._pingPongDirection === 1 ? true : false;
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
    this._wasResetDuringFrameCalc = true;
    this._done = false;
    this._firstTick = true;
    this._currentFrame = 0;
    this._timeLeftInFrame = this.frameDuration;
    const maybeFrame = this.frames[this._currentFrame];
    if (maybeFrame) {
      this._timeLeftInFrame = maybeFrame?.duration || this.frameDuration;
    }
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
   *
   * Optionally specify an override for the duration of the frame, useful for
   * keeping multiple animations in sync with one another.
   * @param frameNumber
   * @param duration
   */
  public goToFrame(frameNumber: number, duration?: number) {
    this._currentFrame = frameNumber;
    this._timeLeftInFrame = duration ?? this.frameDuration;
    const maybeFrame = this.frames[this._currentFrame];
    if (maybeFrame && !this._done) {
      this._timeLeftInFrame = duration ?? (maybeFrame?.duration || this.frameDuration);
      this.events.emit('frame', { ...maybeFrame, frameIndex: this.currentFrameIndex });
    }
  }

  private _nextFrame(): number {
    this._wasResetDuringFrameCalc = false;
    const currentFrame = this._currentFrame;
    if (this._done) {
      return currentFrame;
    }
    let next = -1;

    switch (this.strategy) {
      case AnimationStrategy.Loop: {
        next = (currentFrame + 1) % this.frames.length;
        if (next === 0) {
          this.events.emit('loop', this);
        }
        break;
      }
      case AnimationStrategy.End: {
        next = currentFrame + 1;
        if (next >= this.frames.length) {
          this._done = true;
          this._currentFrame = this.frames.length;
          this.events.emit('end', this);
        }
        break;
      }
      case AnimationStrategy.Freeze: {
        next = clamp(currentFrame + 1, 0, this.frames.length - 1);
        if (currentFrame + 1 >= this.frames.length) {
          this._done = true;
          this.events.emit('end', this);
        }
        break;
      }
      case AnimationStrategy.PingPong: {
        if (currentFrame + this._pingPongDirection >= this.frames.length) {
          this._pingPongDirection = -1;
          this.events.emit('loop', this);
        }

        if (currentFrame + this._pingPongDirection < 0) {
          this._pingPongDirection = 1;
          this.events.emit('loop', this);
        }

        next = currentFrame + (this._pingPongDirection % this.frames.length);
        break;
      }
    }
    if (this._wasResetDuringFrameCalc) {
      // if reset during frame calculation discard the calc'd next and return the current frame.
      this._wasResetDuringFrameCalc = false;
      return this._currentFrame;
    }
    return next;
  }

  /**
   * Called internally by Excalibur to update the state of the animation potential update the current frame
   * @param elapsed Milliseconds elapsed
   * @param idempotencyToken Prevents double ticking in a frame by passing a unique token to the frame
   */
  public tick(elapsed: number, idempotencyToken: number = 0): void {
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
      this.events.emit('frame', { ...this.currentFrame, frameIndex: this.currentFrameIndex });
    }

    this._timeLeftInFrame -= elapsed * this._speed;
    if (this._timeLeftInFrame <= 0) {
      this.goToFrame(this._nextFrame());
    }
  }

  protected _drawImage(ctx: ExcaliburGraphicsContext, x: number, y: number) {
    if (this.currentFrame && this.currentFrame.graphic) {
      this.currentFrame.graphic.draw(ctx, x, y);
    }
  }
}
