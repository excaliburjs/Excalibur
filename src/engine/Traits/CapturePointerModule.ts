/// <reference path="../Interfaces/IPipelineModule.ts" />

module ex.Traits {

   export interface ICapturePointerConfig {
      
      /**
       * Capture PointerMove events (may be expensive!)
       */
      captureMoveEvents: boolean;

   }

   /**
    * Propogates pointer events to the actor
    */
   export class CapturePointerModule implements IPipelineModule {

      public update(actor: Actor, engine: Engine, delta: number) {
         if (!actor.enableCapturePointer) { return; }
         if (actor.isKilled()) { return; }
         
         engine.input.pointers.propogate(actor);         
      }
   }
}