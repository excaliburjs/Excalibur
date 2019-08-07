import { Scene } from './Scene';
import { Random } from './Math/Index';

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
  public isRandom: boolean = false;
  public static random: Random = new Random();
  public min: number = 0;
  public max: number = 1;

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
 * Returns a timer that has a variable duration. The duration is random and is of an inclusive range (min,max).
 * The timer fires callbacks after the random interval, optionally repeating.
 * @param fn        The callback to be fired after the interval is complete.
 * @param min        The minimum duration of the timer   
 * @param min        The maximum duration of the timer
 * @param repeats    Indicates whether this call back should be fired only once, or repeat after every interval as completed.
 * @param numberOfRepeats Specifies a maximum number of times that this timer will execute.
 */
public static RandomTimer(fn: () => void, min: number, max: number, repeats?: boolean, numberOfRepeats?: number): Timer {
    let randTimer: Timer;
    if (repeats) {
        randTimer = new Timer(fn, Timer.random.integer(min, max), repeats, numberOfRepeats);
    } else {
        randTimer = new Timer(fn, Timer.random.integer(min, max));
    }
    randTimer.min = min;
    randTimer.max = max;
    randTimer.isRandom = true;
    return randTimer;
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
          if (this.isRandom) {
              this.interval = Timer.random.integer(this.min, this.max);
          }
        } else {
          this.complete = true;
        }
      }
    }
  }

  /**
   * Resets the timer so that it can be reused, and optionally reconfigure the timer's interval.
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

    if (this.isRandom) {
        this.interval = Timer.random.integer(this.min, this.max);
    }

    this.complete = false;
    this._elapsedTime = 0;
    this._numberOfTicks = 0;
  }

  /**
   * Resets the RandomTimer so that it can be reused, and optionally reconfigure the random's range and repeats.
   * @param newMin If specified, sets a new non-negative min interval in milliseconds 
   * @param newMax If specified, sets a new non-negative max interval in milliseconds
   * @param newNumberOfRepeats If specified, sets a new non-negative upper limit to the number of time this timer executes
   */
  public resetRandom(newMin?: number, newMax?: number, newNumberOfRepeats?: number) {
    if (!this.isRandom) {
        this.isRandom = true;
    } 
  
    if (!!newMin && newMin >= 0) {
        this.min = newMin;
    }
    
    if (!!newMax && newMax >= 0) {
        this.max = newMax;
    }

    this.interval = Timer.random.integer(this.min, this.max);

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


