export interface FpsSamplerOptions {
  /**
   * Specify the sampling period in milliseconds (default 100)
   */
  samplePeriod?: number;
  /**
   * Specify the initial FPS
   */
  initialFps: number;

  /**
   * Specify the function used to return the current time (in milliseconds)
   */
  nowFn: () => number;
}

export class FpsSampler {
  private _fps: number;
  private _samplePeriod: number = 100;
  private _currentFrameTime: number = 0;
  private _frames: number = 0;
  private _previousSampleTime: number = 0;
  private _beginFrameTime: number = 0;
  private _nowFn: () => number;

  constructor(options: FpsSamplerOptions) {
    this._fps = options.initialFps;
    this._samplePeriod = options.samplePeriod ?? this._samplePeriod;
    this._currentFrameTime = 1000/options.initialFps;
    this._nowFn = options.nowFn;
    this._previousSampleTime = this._nowFn();
  }

  /**
   * Start of code block to sample FPS for
   */
  start() {
    this._beginFrameTime = this._nowFn();
  }

  /**
   * End of code block to sample FPS for
   */
  end() {
    this._frames++;
    const time = this._nowFn();

    this._currentFrameTime = time - this._beginFrameTime;

    if (time >= this._previousSampleTime + this._samplePeriod) {
      this._fps = (this._frames * 1000) / (time - this._previousSampleTime);
      this._previousSampleTime = time;
      this._frames = 0;
    }
  }

  /**
   * Return the currently sampled fps over the last sample period, by default every 100ms
   */
  get fps() {
    return this._fps;
  }

  /**
   * Return the instantaneous fps, this can be less useful because it will fluctuate given the current frames time
   */
  get instant() {
    return 1000 / this._currentFrameTime;
  }
}