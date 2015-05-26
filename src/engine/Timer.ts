module ex {

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
    public complete: boolean = false;
    public scene: Scene = null;

    /**
     * @param callback   The callback to be fired after the interval is complete.
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
       this._totalTimeAlive += delta;
       this._elapsedTime += delta;
       if (this._elapsedTime > this.interval) {
          this.fcn.call(this);
          if (this.repeats) {
             this._elapsedTime = 0;
          } else {
             this.complete = true;
          }
       }
    }

    public getTimeRunning(): number {
       return this._totalTimeAlive;
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
}