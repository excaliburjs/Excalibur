import { Scene } from './Scene';
import { obsolete } from './Util/Decorators';
import { Logger } from './Util/Log';

export interface TimerOptions {
  repeats?: boolean;
  numberOfRepeats?: number;
  fcn?: () => void;
  interval: number;
}

/**
 * The Excalibur timer hooks into the internal timer and fires callbacks,
 * after a certain interval, optionally repeating.
 */
export class Timer {
  private _logger = Logger.getInstance();
  private static _MAX_ID: number = 0;
  public id: number = 0;

  private _elapsedTime: number = 0;
  private _totalTimeAlive: number = 0;

  private _running = false;

  private _numberOfTicks: number = 0;
  private _callbacks: Array<() => void>;

  public interval: number = 10;
  public repeats: boolean = false;
  public maxNumberOfRepeats: number = -1;

  private _complete = false;
  public get complete() {
    return this._complete;
  }
  public scene: Scene = null;

  /**
   * @param options    Options - repeats, numberOfRepeats, fcn, interval
   * @param repeats    Indicates whether this call back should be fired only once, or repeat after every interval as completed.
   * @param numberOfRepeats Specifies a maximum number of times that this timer will execute.
   * @param fcn        The callback to be fired after the interval is complete.
   */
  constructor(options: TimerOptions);
  constructor(fcn: TimerOptions | (() => void), interval?: number, repeats?: boolean, numberOfRepeats?: number) {
    if (typeof fcn !== 'function') {
      const options = fcn;
      fcn = options.fcn;
      interval = options.interval;
      repeats = options.repeats;
      numberOfRepeats = options.numberOfRepeats;
    }

    if (!!numberOfRepeats && numberOfRepeats >= 0) {
      this.maxNumberOfRepeats = numberOfRepeats;
      if (!repeats) {
        throw new Error('repeats must be set to true if numberOfRepeats is set');
      }
    }

    this.id = Timer._MAX_ID++;
    this.interval = interval || this.interval;
    this.repeats = repeats || this.repeats;

    this._callbacks = [];

    if (fcn) {
      this.on(fcn);
    }
  }

  /**
   * Adds a new callback to be fired after the interval is complete
   * @param fcn The callback to be added to the callback list, to be fired after the interval is complete.
   */
  public on(fcn: () => void) {
    this._callbacks.push(fcn);
  }

  /**
   * Removes a callback from the callback list to be fired after the interval is complete.
   * @param fcn The callback to be removed from the callback list, to be fired after the interval is complete.
   */
  public off(fcn: () => void) {
    const index = this._callbacks.indexOf(fcn);
    this._callbacks.splice(index, 1);
  }

  /**
   * Updates the timer after a certain number of milliseconds have elapsed. This is used internally by the engine.
   * @param delta  Number of elapsed milliseconds since the last update.
   */
  public update(delta: number) {
    if (this._running) {
      this._totalTimeAlive += delta;
      this._elapsedTime += delta;

      if (this.maxNumberOfRepeats > -1 && this._numberOfTicks >= this.maxNumberOfRepeats) {
        this._complete = true;
        this._running = false;
        this._elapsedTime = 0;
      }

      if (!this.complete && this._elapsedTime >= this.interval) {
        this._callbacks.forEach((c) => {
          c.call(this);
        });

        this._numberOfTicks++;
        if (this.repeats) {
          this._elapsedTime = 0;
        } else {
          this._complete = true;
          this._running = false;
          this._elapsedTime = 0;
        }
      }
    }
  }

  /**
   * Resets the timer so that it can be reused, and optionally reconfigure the timers interval.
   *
   * Warning** you may need to call `timer.start()` again if the timer had completed
   * @param newInterval If specified, sets a new non-negative interval in milliseconds to refire the callback
   * @param newNumberOfRepeats If specified, sets a new non-negative upper limit to the number of time this timer executes
   */
  public reset(newInterval?: number, newNumberOfRepeats?: number) {
    if (!!newInterval && newInterval >= 0) {
      this.interval = newInterval;
    }

    if (!!this.maxNumberOfRepeats && this.maxNumberOfRepeats >= 0) {
      this.maxNumberOfRepeats = newNumberOfRepeats;
      if (!this.repeats) {
        throw new Error('repeats must be set to true if numberOfRepeats is set');
      }
    }

    this._complete = false;
    this._elapsedTime = 0;
    this._numberOfTicks = 0;
  }

  public get timesRepeated(): number {
    return this._numberOfTicks;
  }

  public getTimeRunning(): number {
    return this._totalTimeAlive;
  }

  /**
   * @returns milliseconds until the next action callback, if complete will return 0
   */
  public get timeToNextAction() {
    if (this.complete) {
      return 0;
    }
    return this.interval - this._elapsedTime;
  }

  /**
   * @returns milliseconds elapsed toward the next action
   */
  public get timeElapsedTowardNextAction() {
    return this._elapsedTime;
  }

  public get isRunning() {
    return this._running;
  }

  /**
   * Pauses the timer, time will no longer increment towards the next call
   */
  public pause(): Timer {
    this._running = false;
    return this;
  }

  /**
   * Unpauses the timer. Time will now increment towards the next call
   * @deprecated Will be removed in v0.26.0
   */
  @obsolete({ message: 'Will be removed in v0.26.0', alternateMethod: 'Use Timer.resume()' })
  public unpause() {
    this._running = true;
  }

  /**
   * Resumes the timer, time will now increment towards the next call.
   */
  public resume(): Timer {
    this._running = true;
    return this;
  }

  /**
   * Starts the timer, if the timer was complete it will restart the timer and reset the elapsed time counter
   */
  public start(): Timer {
    if (!this.scene) {
      this._logger.warn('Cannot start a timer not part of a scene, timer wont start until added');
    }

    this._running = true;
    if (this.complete) {
      this._complete = false;
      this._elapsedTime = 0;
      this._numberOfTicks = 0;
    }

    return this;
  }

  /**
   * Stops the timer and resets the elapsed time counter towards the next action invocation
   */
  public stop(): Timer {
    this._running = false;
    this._elapsedTime = 0;
    this._numberOfTicks = 0;
    return this;
  }

  /**
   * Cancels the timer, preventing any further executions.
   */
  public cancel() {
    this.pause();
    if (this.scene) {
      this.scene.cancelTimer(this);
    }
  }
}
