/// <reference path="Engine.ts" />

module ex {

   /**
    * Represents a frame's individual statistics
    */
   export interface IFrameStats {

      /**
       * The number of the frame
       */
      id: number;

      /**
       * Gets the frame's delta (time since last frame scaled by [[Engine.timescale]]) (in ms)
       */
      delta: number;

      /**
       * Gets the frame's frames-per-second (FPS)
       */
      fps: number;

      /**
       * Duration statistics (in ms)
       */
      duration: IFrameDurationStats;     

      /**
       * Actor statistics
       */
      actors: IFrameActorStats;
   }

   /**
    * Represents actor stats for a frame
    */
   export interface IFrameActorStats {

      /**
       * Gets the frame's number of actors (alive)
       */
      alive: number;

      /**
       * Gets the frame's number of actors (killed)
       */
      killed: number;

      /**
       * Gets the frame's number of remaining actors (alive - killed)
       */
      remaining: number;

      /**
       * Gets the frame's number of UI actors
       */
      ui: number;

      /**
       * Gets the frame's number of total actors (remaining + UI)
       */
      total: number;
   }

   /**
    * Represents duration stats for a frame
    */
   export interface IFrameDurationStats {

      /**
       * Gets the frame's total time to run the update function (in ms)
       */
      update: number;

      /**
       * Gets the frame's total time to run the draw function (in ms)
       */
      draw: number;

      /**
       * Gets the frame's total render duration (update + draw duration) (in ms)
       */
      total: number;
   }

   /**
    * Debug statistics and flags for Excalibur. If polling these values, it would be
    * best to do so on the `postupdate` event for [[Engine]], after all values have been
    * updated during a frame.
    */
   export class Debug implements IDebugFlags, IFrameStats {

      constructor(private _engine: ex.Engine) { }

      /**
       * Gets the current frame's id
       */
      public get id() {
         return this._engine.currentFrameStats.id;
      }

      /**
       * Gets the current frame delta (time since last frame)
       */
      public get delta() {
         return this._engine.currentFrameStats.delta;
      }

      /**
       * Gets the current frames-per-second (FPS)
       */
      public get fps() {
         return this._engine.currentFrameStats.fps;
      }

      /**
       * Gets the current actor statistics
       */
      public get actors() {
         return this._engine.currentFrameStats.actors;
      }

      /**
       * Gets the current duration statistics
       */
      public get duration() {
         return this._engine.currentFrameStats.duration;
      }
   }

   /**
    * Implementation of a frame's stats. Meant to have values copied via [[FrameStats.reset]], avoid
    * creating instances of this every frame.
    */
   export class FrameStats implements IFrameStats {
      private _id: number = 0;
      private _delta: number = 0;
      private _fps: number = 0;
      private _actorStats: IFrameActorStats = {
         alive: 0,
         killed: 0,
         ui: 0,
         get remaining() {
            return this.alive - this.killed;
         },
         get total() {
            return this.remaining + this.ui;
         }        
      };
      private _durationStats: IFrameDurationStats = {
         update: 0,
         draw: 0,
         get total() {
            return this.update + this.draw;
         }
      };

      /**
       * Zero out values or clone other IFrameStat stats. Allows instance reuse.
       *  
       * @param [otherStats] Optional stats to clone
       */
      public reset(otherStats?: IFrameStats) {
         if (otherStats) {
            this.delta = otherStats.delta;
            this.fps = otherStats.fps;
            this.actors = otherStats.actors;
            this.duration = otherStats.duration;            
         } else {
            this.id = this.delta = this.fps = 0;
            this.actors.alive = this.actors.killed = this.actors.ui = 0;
            this.duration.update = this.duration.draw = 0;
         }
      }

      /**
       * Gets the frame's id
       */
      public get id() {
         return this._id;
      }

      /**
       * Sets the frame's id
       */
      public set id(value: number) {
         this._id = value;
      }

      /**
       * Gets the frame's delta (time since last frame)
       */
      public get delta() {
         return this._delta;
      }

      /**
       * Sets the frame's delta (time since last frame). Internal use only.
       * @internal
       */
      public set delta(value: number) {
         this._delta = value;
      }

      /**
       * Gets the frame's frames-per-second (FPS)
       */
      public get fps() {
         return this._fps;
      }

      /**
       * Sets the frame's frames-per-second (FPS). Internal use only.
       * @internal
       */
      public set fps(value: number) {
         this._fps = value;
      }

      /**
       * Gets the frame's actor statistics
       */
      public get actors() {
         return this._actorStats;
      }

      /**
       * Gets the frame's duration statistics
       */
      public get duration() {
         return this._durationStats;
      }
   }
}