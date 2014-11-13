/// <reference path="../Interfaces/IPipelineModule.ts" />

module ex {

   /**
    * Propogates input events to the actor (i.e. PointerEvents)
    */
   export class InputPropagationModule implements IPipelineModule {

      public update(actor: Actor, engine: Engine, delta: number) {
         if (!actor.inputEnabled) return;
         if (actor.isKilled()) return;
         
         engine.input.pointers.propogate(actor);         
      }
   }
}