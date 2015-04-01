/// <reference path="Actor.ts" />

module ex {   

   /**
    * Helper [[Actor]] primitive for drawing UI's, optimized for UI drawing. Does
    * not participate in collisions. Drawn on top of all other actors.
    */     
   export class UIActor extends Actor {
      protected _engine: Engine;

      /**
       * @param x       The starting x coordinate of the actor
       * @param y       The starting y coordinate of the actor
       * @param width   The starting width of the actor
       * @param height  The starting height of the actor
       */
      constructor(x?: number, y?: number, width?: number, height?: number){
         super(x,y,width,height);
         this.pipeline = [];
         this.pipeline.push(new ex.MovementModule());
         this.pipeline.push(new ex.CapturePointerModule());
         this.anchor.setTo(0, 0);
         this.collisionType = ex.CollisionType.PreventCollision;
         this.enableCapturePointer = true;
      }

      public onInitialize(engine: Engine) {
         this._engine = engine;
      }

      public contains(x: number, y: number, useWorld: boolean = true) {
         if (useWorld) return super.contains(x, y);

         var coords = this._engine.worldToScreenCoordinates(new ex.Point(x, y));
         return super.contains(coords.x, coords.y);
      }
   }
}