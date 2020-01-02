import { Graphic, GraphicOptions, DrawOptions } from './Graphic';
import { Vector } from '../Algebra';
import { clamp } from '../Util/Util';

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
  tags?: { [name: string]: Vector };
}

export interface AnimationOptions {
  frames: Frame[];
  frameDuration?: number;
  strategy?: AnimationStrategy;
}

export class Animation extends Graphic {
  public frames: Frame[] = [];
  public strategy: AnimationStrategy = AnimationStrategy.Loop;
  public frameDuration: number = 100;

  private _currentFrame = 0;
  private _timeLeftInFrame = 0;
  private _direction = 1;
  private _done = false;

  private _finishedResolve: (value?: any) => void;

  constructor(options: GraphicOptions & AnimationOptions) {
    super(options);
    this.frames = options.frames;
    this.strategy = options.strategy ?? this.strategy;
    this.frameDuration = options.frameDuration ?? this.frameDuration;

    this.goToFrame(0);
    Promise.all(this.frames.map((f) => f.graphic.readyToPaint)).then(() => {
      this.paint();
    });
  }

  public get tags() {
    return this.currentFrame.tags;
  }

  public get currentFrame(): Frame | null {
    if (this._currentFrame >= 0 && this._currentFrame < this.frames.length) {
      return this.frames[this._currentFrame];
    }
    return null;
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

  public get finished(): Promise<any> {
    if (this._done) {
      return Promise.resolve();
    } else {
      return new Promise((resolve) => {
        if (!this._finishedResolve) {
          this._finishedResolve = resolve;
        }
      });
    }
  }

  public get done(): boolean {
    return this._done;
  }

  public goToFrame(frameNumber: number) {
    this._currentFrame = frameNumber % this.frames.length;
    this._timeLeftInFrame = this.frameDuration;
    const maybeFrame = this.frames[this._currentFrame];
    if (maybeFrame) {
      this._timeLeftInFrame = maybeFrame?.duration || this.frameDuration;
      this.width = maybeFrame.graphic?.width;
      this.height = maybeFrame.graphic?.height;
    }
    this.paint();
  }

  private _nextFrame(): number {
    const currentFrame = this._currentFrame;
    let next = -1;

    switch (this.strategy) {
      case AnimationStrategy.Loop: {
        next = (currentFrame + 1) % this.frames.length;
        break;
      }
      case AnimationStrategy.End: {
        next = currentFrame + 1;
        if (next >= this.frames.length) {
          this._done = true;
          this._finishedResolve();
        }
        break;
      }
      case AnimationStrategy.Freeze: {
        next = clamp(currentFrame + 1, 0, this.frames.length - 1);
        if (next >= this.frames.length - 1) {
          this._done = true;
          this._finishedResolve();
        }
        break;
      }
      case AnimationStrategy.PingPong: {
        if (currentFrame + this._direction >= this.frames.length) {
          this._direction = -1;
        }

        if (currentFrame + this._direction < 0) {
          this._direction = 1;
        }

        next = currentFrame + (this._direction % this.frames.length);
        break;
      }
    }
    return next;
  }

  public tick(elapsedMilliseconds: number) {
    this._timeLeftInFrame -= elapsedMilliseconds;
    if (this._timeLeftInFrame <= 0) {
      this.goToFrame(this._nextFrame());
    }
  }

  public draw(ctx: CanvasRenderingContext2D, _options?: DrawOptions): void {
    if (this.currentFrame) {
      ctx.drawImage(this.currentFrame.graphic.image, 0, 0);
    }
  }
}
