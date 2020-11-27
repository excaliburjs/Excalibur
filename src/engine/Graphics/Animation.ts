import { Graphic, GraphicOptions } from './Graphic';
import { clamp } from '../Util/Util';
import { ExcaliburGraphicsContext, ImageSource } from './Context/ExcaliburGraphicsContext';
import { EventDispatcher } from '../EventDispatcher';
import { SpriteSheet } from './SpriteSheet';

export interface HasTick {
  /**
   *
   * @param elapsedMilliseconds The amount of real world time in milliseconds that has elapsed that must be updated in the animation
   * @param idempotencyToken Optional idempotencyToken prevents a ticking animation from updating twice per frame
   */
  tick(elapsedMilliseconds: number, idempotencyToken?: number): void;
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

export interface Frame {
  graphic?: Graphic;
  duration?: number; // number of ms the frame should be visible, overrides the animation duration
}

export interface AnimationOptions {
  frames: Frame[];
  frameDuration?: number;
  strategy?: AnimationStrategy;
}

// TODO wire up to new Emitter
export type AnimationEvents = {
  frame: Frame;
  loop: Animation;
  ended: Animation;
};

export class Animation extends Graphic implements HasTick {
  public events = new EventDispatcher<any>(this); // TODO replace with new Emitter
  public frames: Frame[] = [];
  public strategy: AnimationStrategy = AnimationStrategy.Loop;
  public frameDuration: number = 100;
  public timeScale: number = 1;

  private _idempotencyToken = -1;

  private _currentFrame = 0;
  private _timeLeftInFrame = 0;
  private _direction = 1;
  private _done = false;
  private _playing = true;

  constructor(options: GraphicOptions & AnimationOptions) {
    super(options);
    this.frames = options.frames;
    this.strategy = options.strategy ?? this.strategy;
    this.frameDuration = options.frameDuration ?? this.frameDuration;

    this.goToFrame(0);
  }

  public clone(): Animation {
    return new Animation({
      frames: this.frames.map((f) => ({ ...f })),
      frameDuration: this.frameDuration,
      strategy: this.strategy,
      ...this.cloneGraphicOptions()
    });
  }

  public static fromSpriteSheet(
    spriteSheet: SpriteSheet,
    frameIndices: number[],
    duration: number,
    strategy: AnimationStrategy = AnimationStrategy.Loop
  ): Animation {
    return new Animation({
      frames: spriteSheet.sprites
        .filter((_, index) => frameIndices.indexOf(index) > -1)
        .map((f) => ({
          graphic: f,
          duration: duration
        })),
      strategy: strategy
    });
  }

  public get currentFrame(): Frame | null {
    if (this._currentFrame >= 0 && this._currentFrame < this.frames.length) {
      return this.frames[this._currentFrame];
    }
    return null;
  }

  public getSourceId(): number {
    return this.frames[this._currentFrame].graphic.getSourceId();
  }

  public getSource(): ImageSource {
    return this.frames[this._currentFrame].graphic.getSource();
  }

  public play(): void {
    this._playing = true;
  }

  public pause(): void {
    this._playing = false;
  }

  public reset(): void {
    this._done = false;
    this._currentFrame = 0;
  }

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

  public get done(): boolean {
    return this._done;
  }

  public goToFrame(frameNumber: number) {
    this._currentFrame = frameNumber; // % this.frames.length;
    this._timeLeftInFrame = this.frameDuration;
    const maybeFrame = this.frames[this._currentFrame];
    if (maybeFrame && !this._done) {
      this._timeLeftInFrame = maybeFrame?.duration || this.frameDuration;
      this.width = maybeFrame.graphic?.width;
      this.height = maybeFrame.graphic?.height;
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
          this.events.emit('ended', this as any);
        }
        break;
      }
      case AnimationStrategy.Freeze: {
        next = clamp(currentFrame + 1, 0, this.frames.length - 1);
        if (next >= this.frames.length - 1) {
          this._done = true;
          this.events.emit('ended', this as any);
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

  public tick(elapsedMilliseconds: number, idempotencyToken: number = 0) {
    if (this._idempotencyToken === idempotencyToken) {
      return;
    }
    this._idempotencyToken = idempotencyToken;
    if (!this._playing) {
      return;
    }
    this._timeLeftInFrame -= (elapsedMilliseconds * this.timeScale);
    if (this._timeLeftInFrame <= 0) {
      this.goToFrame(this._nextFrame());
    }
    this._updateDimensions();
  }

  private _updateDimensions() {
    if (this.currentFrame) {
      this.width = this.currentFrame.graphic?.width;
      this.height = this.currentFrame.graphic?.height;
    }
  }

  protected _drawImage(ctx: ExcaliburGraphicsContext, x: number, y: number) {
    if (this.currentFrame) {
      this.currentFrame.graphic.draw(ctx, x, y);
    }
  }
}
