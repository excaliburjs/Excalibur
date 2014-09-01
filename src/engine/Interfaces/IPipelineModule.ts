module ex {
    /**
    * An interface describing actor update pipeline modules
    * @class ILoadable
    */
   export interface IPipelineModule {
      update(actor: Actor, engine: Engine, delta: number): void;
   }
}