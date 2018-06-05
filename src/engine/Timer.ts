import { Scene } from './Scene';

/**
 * The Excalibur timer hooks into the internal timer and fires callbacks,
 * after a certain interval, optionally repeating.
 */
export class Timer {
  public static id: number = 0;
  public id: number = 0;
  public interval: number = 10;
  public fcn: () => void = () => {
    return;
  };
  public repeats: boolean = false;
  public maxNumberOfRepeats: number = -1;
  private _elapsedTime: number = 0;
  private _totalTimeAlive: number = 0;
  private _paused: boolean = false;
  private _numberOfTicks: number = 0;
  public complete: boolean = false;
  public scene: Scene = null;

  /**
   * @param fcn        The callback to be fired after the interval is complete.
   * @param interval   Interval length
   * @param repeats    Indicates whether this call back should be fired only once, or repeat after every interval as completed.
   * @param numberOfRepeats Specifies a maximum number of times that this timer will execute.
   */
  constructor(fcn: () => void, interval: number, repeats?: boolean, numberOfRepeats?: number) {
    if (!!numberOfRepeats && numberOfRepeats >= 0) {
      this.maxNumberOfRepeats = numberOfRepeats;
      if (!repeats) {
        throw new Error('repeats must be set to true if numberOfRepeats is set');
      }
    }
    this.id = Timer.id++;
    this.interval = interval || this.interval;
    this.fcn = fcn || this.fcn;
    this.repeats = repeats || this.repeats;
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
        this.fcn.call(this);
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
