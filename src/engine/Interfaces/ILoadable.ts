module ex {
   /**
    * An interface describing loadable resources in Excalibur
    */
   export interface ILoadable {
      /**
       * Begins loading the resource and returns a promise to be resolved on completion
       */
      load(): Promise<any>;

      /**
       * Wires engine into loadable to receive game level events
       */
      wireEngine(engine: Engine): void;
      

      /**
       * onprogress handler
       */
      onprogress: (e: any) => void;
      /**
       * oncomplete handler
       */
      oncomplete: () => void;
      /**
       * onerror handler
       */
      onerror: (e: any) => void;

      /**
       * Returns true if the loadable is loaded
       */
       isLoaded(): boolean;
   }
}