/// <reference path="../Interfaces/IPipelineModule.ts" />

module ex {
   export class EventPropagationModule implements IPipelineModule { 
      public update(actor: Actor, engine: Engine, delta: number){
         var eventDispatcher = actor.eventDispatcher;
         // Publish other events
         engine.keys.forEach(function (key) {
            eventDispatcher.publish(InputKey[key], new KeyEvent(key));
         });

         // Publish click events
         engine.clicks.forEach((e) => {
            if (actor.contains(e.x, e.y)) {
               eventDispatcher.publish(EventType[EventType.Click], new ClickEvent(e.x, e.y, e.mouseEvent));
               eventDispatcher.publish(EventType[EventType.MouseDown], new MouseDownEvent(e.x, e.y, e.mouseEvent));
            }
         });

         engine.mouseMove.forEach((e) => {
            if (actor.contains(e.x, e.y)) {
               eventDispatcher.publish(EventType[EventType.MouseMove], new MouseMoveEvent(e.x, e.y, e.mouseEvent));
            }
         });

         engine.mouseUp.forEach((e)=> {
            if (actor.contains(e.x, e.y)) {
               eventDispatcher.publish(EventType[EventType.MouseUp], new MouseUpEvent(e.x, e.y, e.mouseEvent));
            }
         });

         engine.touchStart.forEach((e) => {
            if (actor.contains(e.x, e.y)) {
               eventDispatcher.publish(EventType[EventType.TouchStart], new TouchStartEvent(e.x, e.y));
            }
         });

         engine.touchMove.forEach((e) => {
            if (actor.contains(e.x, e.y)) {
               eventDispatcher.publish(EventType[EventType.TouchMove], new TouchMoveEvent(e.x, e.y));
            }
         });

         engine.touchEnd.forEach((e) => {
            if (actor.contains(e.x, e.y)) {
               eventDispatcher.publish(EventType[EventType.TouchEnd], new TouchEndEvent(e.x, e.y));
            }
         });

         engine.touchCancel.forEach((e) => {
            if (actor.contains(e.x, e.y)) {
               eventDispatcher.publish(EventType[EventType.TouchCancel], new TouchCancelEvent(e.x, e.y));
            }
         });
      }
   }
}