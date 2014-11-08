/// <reference path="../Interfaces/IPipelineModule.ts" />

module ex {
   export class OffscreenCullingModule implements IPipelineModule { 
      public update(actor: Actor, engine: Engine, delta: number){
         var eventDispatcher = actor.eventDispatcher;
         var anchor = actor.anchor;
         var globalScale = actor.getGlobalScale();
         var width = globalScale.x * actor.getWidth()/actor.scaleX;
         var height = globalScale.y * actor.getHeight()/actor.scaleY;
         var actorScreenCoords = engine.worldToScreenCoordinates(new Point(actor.getGlobalX()-anchor.x*width, actor.getGlobalY()-anchor.y*height));

         var zoom = 1.0;
         if(engine.camera){
            zoom = engine.camera.getZoom();   
         }
         
         if(!actor.isOffScreen){
            if(actorScreenCoords.x + width * zoom < 0 || 
               actorScreenCoords.y + height * zoom < 0 ||
               actorScreenCoords.x > engine.width ||
               actorScreenCoords.y > engine.height ){
               
               eventDispatcher.publish('exitviewport', new ExitViewPortEvent());
               actor.isOffScreen = true;
            }
         }else{
            if(actorScreenCoords.x + width * zoom > 0 &&
               actorScreenCoords.y + height * zoom > 0 &&
               actorScreenCoords.x < engine.width &&
               actorScreenCoords.y < engine.height){
               
               eventDispatcher.publish('enterviewport', new EnterViewPortEvent());               
               actor.isOffScreen = false;
            }
         }
      }
   }
}