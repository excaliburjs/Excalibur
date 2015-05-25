module ex {
   /**
    * An interface describing actor update pipeline modules
    */
   export interface IPipelineModule {
      update(actor: Actor, engine: Engine, delta: number): void;
   }
}