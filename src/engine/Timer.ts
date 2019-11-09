import { Scene } from './Scene';

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
  public static id: number = 0;
  public id: number = 0;
  public interval: number = 10;
  public repeats: boolean = false;
  public maxNumberOfRepeats: number = -1;
  private _elapsedTime: number = 0;
  private _totalTimeAlive: number = 0;
  private _paused: boolean = false;
  private _numberOfTicks: number = 0;
  private _callbacks: Array<() => void>;
  public complete: boolean = false;
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

    this.id = Timer.id++;
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
    if (!this._paused) {
      this._totalTimeAlive += delta;
      this._elapsedTime += delta;

      if (this.maxNumberOfRepeats > -1 && this._numberOfTicks >= this.maxNumberOfRepeats) {
        this.complete = true;
      }

      if (!this.complete && this._elapsedTime >= this.interval) {
        this._callbacks.forEach((c) => {
          c.call(this);
        });

        this._numberOfTicks++;
        if (this.repeats) {
          this._elapsedTime = 0;
        } else {
          this.complete = true;
        }
      }
    }
  }

  /**
   * Resets the timer so that it can be reused, and optionally reconfigure the timers interval.
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

    this.complete = false;
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
   * Pauses the timer so that no more time will be incremented towards the next call
   */
  public pause() {
    this._paused = true;
  }

  /**
   * Unpauses the timer. Time will now increment towards the next call
   */
  public unpause() {
    this._paused = false;
  }

  /**
   * Cancels the timer, preventing any further executions.
   */
  public cancel() {
    if (this.scene) {
      this.scene.cancelTimer(this);
    }
  }
}
