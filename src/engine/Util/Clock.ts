import { FpsSampler } from './Fps';

export interface ClockOptions {
  /**
   * Define the function you'd like the clock to tick when it is started
   */
  tick: (elapsedMs: number) => any;
  /**
   * Optionally define the fatal exception handler, used if an error is thrown in tick
   */
  onFatalException?: (e: unknown) => any;
  /**
   * Optionally limit the maximum FPS of the clock
   */
  maxFps?: number;
}


/**
 * Abstract Clock is the base type of all Clocks
 *
 * It has a few opinions
 * 1. It manages the calculation of what "elapsed" time means and thus maximum fps
 * 2. The default timing api is implemented in now()
 *
 * To implement your own clock, extend Clock and override start/stop to start and stop the clock, then call update() with whatever
 * method is unique to your clock implementation.
 */
export abstract class Clock {
  protected tick: (elapsedMs: number) => any;
  private _onFatalException: (e: unknown) => any = () => { /* default nothing */ };
  private _maxFps: number = Infinity;
  private _lastTime: number = 0;
  public fpsSampler: FpsSampler;
  private _options: ClockOptions;
  private _elapsed: number = 1;
  constructor(options: ClockOptions) {
    this._options = options;
    this.tick = options.tick;
    this._lastTime = this.now() ?? 0;
    this._maxFps = options.maxFps ?? this._maxFps;
    this._onFatalException = options.onFatalException ?? this._onFatalException;
    this.fpsSampler = new FpsSampler({
      initialFps: 60,
      nowFn: () => this.now()
    });
  }

  /**
   * Get the elapsed time for the last completed frame
   */
  public elapsed(): number {
    return this._elapsed;
  }

  /**
   * Get the current time in milliseconds
   */
  public now(): number {
    return performance.now();
  }

  public toTestClock() {
    const testClock = new TestClock({
      ...this._options,
      defaultUpdateMs: 16.6
    });
    return testClock;
  }

  public toStandardClock() {
    const clock = new StandardClock({
      ...this._options
    });
    return clock;
  }

  protected update(overrideUpdateMs?: number): void {
    try {
      this.fpsSampler.start();
      // Get the time to calculate time-elapsed
      const now = this.now();
      let elapsed = now - this._lastTime || 1; // first frame

      // Constrain fps
      const fpsInterval = this._maxFps === Infinity ? 0 : 1000 / this._maxFps;
      if (elapsed <= fpsInterval) {
        return; // too fast 😎 skip this frame
      }

      // Resolves issue #138 if the game has been paused, or blurred for
      // more than a 200 milliseconds, reset elapsed time to 1. This improves reliability
      // and provides more expected behavior when the engine comes back
      // into focus
      if (elapsed > 200) {
        elapsed = 1;
      }

      // tick the mainloop
      this._elapsed = overrideUpdateMs || elapsed;
      this.tick(overrideUpdateMs || elapsed);

      // if fps interval is not a multple
      if (fpsInterval > 0) {
        this._lastTime = now - (elapsed % fpsInterval);
      } else {
        this._lastTime = now;
      }
      this.fpsSampler.end();
    } catch (e) {
      this._onFatalException(e);
      this.stop();
    }
  }

  /**
   * Returns if the clock is currently running
   */
  public abstract isRunning(): boolean;

  /**
   * Start the clock, it will then periodically call the tick(elapsedMilliseconds) since the last tick
   */
  public abstract start(): void;

  /**
   * Stop the clock, tick() is no longer called
   */
  public abstract stop(): void;
}


/**
 * The [[StandardClock]] implements the requestAnimationFrame browser api to run the tick()
 */
export class StandardClock extends Clock {

  private _running = false;
  private _requestId: number;
  constructor(options: ClockOptions) {
    super(options);
  }

  public isRunning(): boolean {
    return this._running;
  }

  public start(): void {
    this._running = true;
    const mainloop = () => {
      // stop the loop
      if (!this._running) {
        return;
      }
      try {
        // request next loop
        this._requestId = window.requestAnimationFrame(mainloop);
        this.update();
      } catch (e) {
        window.cancelAnimationFrame(this._requestId);
        throw e;
      }
    };

    // begin the first frame
    mainloop();
  }

  public stop(): void {
    this._running = false;
  }
}

export interface TestClockOptions {
  /**
   * Specify the update milliseconds to use for each manual step()
   */
  defaultUpdateMs: number;
}

/**
 * The TestClock is meant for debugging interactions in excalibur that require precise timing to replicate or test
 */
export class TestClock extends Clock {
  private _updateMs: number;
  private _running: boolean;
  private _currentTime = 0;
  constructor(options: ClockOptions & TestClockOptions) {
    super({
      ...options
    });
    this._updateMs = options.defaultUpdateMs;
  }

  /**
   * Get the current time in milliseconds
   */
  public override now() {
    return this._currentTime;
  }

  public isRunning(): boolean {
    return this._running;
  }
  public start(): void {
    this._running = true;
  }
  public stop(): void {
    this._running = false;
  }

  /**
   * Manually step the clock forward 1 tick, optionally specify an elapsed time in milliseconds
   * @param overrideUpdateMs
   */
  step(overrideUpdateMs?: number): void {
    if (this._running) {
      this.update(overrideUpdateMs ?? this._updateMs);
      this._currentTime += overrideUpdateMs ?? this._updateMs;
    }
  }
}