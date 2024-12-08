import { Scene } from './Scene';
import { Logger } from './Util/Log';
import * as ex from './index';
import { Random } from './Math/Random';

export interface TimerOptions {
  /**
   * If true the timer repeats every interval infinitely
   */
  repeats?: boolean;
  /**
   * If a number is specified then it will only repeat a number of times
   */
  numberOfRepeats?: number;
  /**
   * @deprecated use action: () => void, will be removed in v1.0
   */
  fcn?: () => void;
  /**
   * Action to perform every time the timer fires
   */
  action?: () => void;
  /**
   * Interval in milliseconds for the timer to fire
   */
  interval: number;
  /**
   * Optionally specify a random range of milliseconds for the timer to fire
   */
  randomRange?: [number, number];
  /**
   * Optionally provide a random instance to use for random behavior, otherwise a new random will be created seeded from the current time.
   */
  random?: ex.Random;
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
  public randomRange: [number, number] = [0, 0];
  public random: ex.Random;
  private _baseInterval = 10;
  private _generateRandomInterval = () => {
    return this._baseInterval + this.random.integer(this.randomRange[0], this.randomRange[1]);
  };

  private _complete = false;
  public get complete() {
    return this._complete;
  }

  public scene: Scene = null;

  constructor(options: TimerOptions) {
    const fcn = options.action ?? options.fcn;
    const interval = options.interval;
    const repeats = options.repeats;
    const numberOfRepeats = options.numberOfRepeats;
    const randomRange = options.randomRange;
    const random = options.random;

    if (!!numberOfRepeats && numberOfRepeats >= 0) {
      this.maxNumberOfRepeats = numberOfRepeats;
      if (!repeats) {
        throw new Error('repeats must be set to true if numberOfRepeats is set');
      }
    }

    this.id = Timer._MAX_ID++;
    this._callbacks = [];
    this._baseInterval = this.interval = interval;
    if (!!randomRange) {
      if (randomRange[0] > randomRange[1]) {
        throw new Error('min value must be lower than max value for range');
      }
      //We use the instance of ex.Random to generate the range
      this.random = random ?? new Random();
      this.randomRange = randomRange;

      this.interval = this._generateRandomInterval();
      this.on(() => {
        this.interval = this._generateRandomInterval();
      });
    }
    this.repeats = repeats || this.repeats;
    if (fcn) {
      this.on(fcn);
    }
  }

  /**
   * Adds a new callback to be fired after the interval is complete
   * @param action The callback to be added to the callback list, to be fired after the interval is complete.
   */
  public on(action: () => void) {
    this._callbacks.push(action);
  }

  /**
   * Removes a callback from the callback list to be fired after the interval is complete.
   * @param action The callback to be removed from the callback list, to be fired after the interval is complete.
   */
  public off(action: () => void) {
    const index = this._callbacks.indexOf(action);
    this._callbacks.splice(index, 1);
  }
  /**
   * Updates the timer after a certain number of milliseconds have elapsed. This is used internally by the engine.
   * @param elapsed  Number of elapsed milliseconds since the last update.
   */
  public update(elapsed: number) {
    if (this._running) {
      this._totalTimeAlive += elapsed;
      this._elapsedTime += elapsed;

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
      this._baseInterval = this.interval = newInterval;
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
