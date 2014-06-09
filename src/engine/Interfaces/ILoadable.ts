module ex {
   /**
    * An interface describing loadable resources in Excalibur
    * @class ILoadable
    */
   export interface ILoadable {
      /**
       * Begins loading the resource and returns a promise to be resolved on completion
       * @method load
       * @returns Promise&lt;any&gt;
       */
      load(): Promise<any>;
      /**
       * onprogress handler
       * @property onprogress {any=>void}
       */
      onprogress: (e: any) => void;
      /**
       * oncomplete handler
       * @property oncomplete {any=>void}
       */
      oncomplete: () => void;
      /**
       * onerror handler
       * @property onerror {any=>void}
       */
      onerror: (e: any) => void;

      /**
       * Returns true if the loadable is loaded
       * @method isLoaded
       * @returns boolean
       */
       isLoaded(): boolean;
   }
}