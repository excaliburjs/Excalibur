import { Scene } from './Scene';

/**
 * The Excalibur timer hooks into the internal timer and fires callbacks, 
 * after a certain interval, optionally repeating.
 */
export class Timer {
   public static id: number = 0;
   public id: number = 0;
   public interval: number = 10;
   public fcn: () => void = () => { return; };
   public repeats: boolean = false;
   private _elapsedTime: number = 0;
   private _totalTimeAlive: number = 0;
   private _paused: boolean = false;
   public complete: boolean = false;
   public scene: Scene = null;

   /**
    * @param fcn        The callback to be fired after the interval is complete.
    * @param interval   Interval length
    * @param repeats    Indicates whether this call back should be fired only once, or repeat after every interval as completed.    
    */
   constructor(fcn: () => void, interval: number, repeats?: boolean) {
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
         if (!this.complete && this._elapsedTime >= this.interval) {
            this.fcn.call(this);
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
    */
   public reset(newInterval?: number) {
      if (!!newInterval && newInterval >= 0) {
         this.interval = newInterval;
      }
      this.complete = false;
      this._elapsedTime = 0;
      
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