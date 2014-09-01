/// <reference path="../Interfaces/IPipelineModule.ts" />

module ex {
   export class OffscreenCullingModule implements IPipelineModule { 
      public update(actor: Actor, engine: Engine, delta: number){
         var eventDispatcher = actor.eventDispatcher;
         var anchor = actor.calculatedAnchor;
         var actorScreenCoords = engine.worldToScreenCoordinates(new Point(actor.getGlobalX()-anchor.x, actor.getGlobalY()-anchor.y));
         var zoom = 1.0;
         if(engine.camera){
            zoom = engine.camera.getZoom();   
         }
         
         if(!actor.isOffScreen){
            if(actorScreenCoords.x + actor.getWidth() * zoom < 0 || 
               actorScreenCoords.y + actor.getHeight() * zoom < 0 ||
               actorScreenCoords.x > engine.width ||
               actorScreenCoords.y > engine.height ){
               
               eventDispatcher.publish('exitviewport', new ExitViewPortEvent());
               actor.isOffScreen = true;
            }
         }else{
            if(actorScreenCoords.x + actor.getWidth() * zoom > 0 &&
               actorScreenCoords.y + actor.getHeight() * zoom > 0 &&
               actorScreenCoords.x < engine.width &&
               actorScreenCoords.y < engine.height){
               
               eventDispatcher.publish('enterviewport', new EnterViewPortEvent());               
               actor.isOffScreen = false;
            }
         }
      }
   }
}