module ex {

   /**
    * Loadables
    *
    * An interface describing loadable resources in Excalibur. Built-in loadable
    * resources include [[Texture]], [[Sound]], and a generic [[Resource]].
    *
    * ## Advanced: Custom loadables
    *
    * You can implement the [[ILoadable]] interface to create your own custom loadables.
    * This is an advanced feature, as the [[Resource]] class already wraps logic around
    * blob/plain data for usages like JSON, configuration, levels, etc through XHR (Ajax).
    *
    * However, as long as you implement the facets of a loadable, you can create your
    * own.
    */
   export interface ILoadable {
      /**
       * Begins loading the resource and returns a promise to be resolved on completion
       */
      load(): Promise<any>;
      
      /**
       * Processes the downloaded data. Meant to be overridden.
       */
      processData(data: any): any;

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