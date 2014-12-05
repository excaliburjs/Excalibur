/// <reference path="Actor.ts" />

module ex {   
   export class UIActor extends Actor {
      constructor(x?: number, y?: number, width?: number, height?: number){
         super(x,y,width,height);
         this.pipeline = [];
         this.pipeline.push(new ex.MovementModule());
         this.pipeline.push(new ex.CapturePointerModule());
         this.anchor.setTo(0,0);
      }
   }
}