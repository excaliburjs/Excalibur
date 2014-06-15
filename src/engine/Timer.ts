module ex {
    export class Timer {
      public static id: number = 0;
      public id: number = 0;
      public interval: number = 10;
      public fcn: ()=>void = ()=>{};
      public repeats: boolean = false;
      private _elapsedTime: number = 0;
      public complete: boolean = false;
      public scene: Scene = null;

      /**
       * The Excalibur timer hooks into the internal timer and fires callbacks, after a certain interval, optionally repeating.
       * 
       * @class Timer
       * @constructor
       * @param callback {callback} The callback to be fired after the interval is complete.
       * @param [repeats=false] {boolean} Indicates whether this call back should be fired only once, or repeat after every interval as completed.    
       */      
      constructor(fcn:()=>void, interval: number, repeats?: boolean){
         this.id = Timer.id++;
         this.interval = interval || this.interval;
         this.fcn = fcn || this.fcn;
         this.repeats = repeats || this.repeats;
      }

      /**
       * Updates the timer after a certain number of milliseconds have elapsed. This is used internally by the engine.
       * @method update
       * @param delta {number} Number of elapsed milliseconds since the last update.
       */
      public update(delta: number){
         this._elapsedTime += delta;
         if (this._elapsedTime > this.interval){
            this.fcn.call(this);
            if(this.repeats){
               this._elapsedTime = 0;
            }else{
               this.complete = true;
            }
         }
      }

      /**
       * Cancels the timer, preventing any further executions.
       * @method cancel
       */
      public cancel(){
         if(this.scene){
            this.scene.cancelTimer(this);
         }
      }
   }
}