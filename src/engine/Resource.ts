/// <reference path="Interfaces/ILoadable.ts" />

module ex {
   /**
    * The Resource type allows games built in Excalibur to load generic resources.
    * For any type of remote resource it is recome
    * @class Resource
    * @extend ILoadable
    * @constructor
    * @param path {string} Path to the remote resource
    */
   export class Resource<T> implements ILoadable {
      public data: T = null;
      public logger: Logger = Logger.getInstance();
      private _engine: Engine;

      constructor(public path: string, public responseType: string, public bustCache: boolean = true) {}

      /**
       * Returns true if the Resource is completely loaded and is ready
       * to be drawn.
       * @method isLoaded 
       * @returns boolean
       */
      public isLoaded(): boolean {
         return !!this.data;
      }

      public wireEngine(engine: Engine) {
         this._engine = engine;
      }

      private cacheBust(uri: string): string{
         var query: RegExp = /\?\w*=\w*/;
         if(query.test(uri)){
            uri += ("&__=" + Date.now());
         }else{
            uri += ("?__=" + Date.now());
         }
         return uri;
      }

      private _start(e: any) {
         this.logger.debug("Started loading resource " + this.path);
      }

      /**
       * Begin loading the resource and returns a promise to be resolved on completion
       * @method load
       * @returns Promise&lt;any&gt;
       */
      public load(): Promise<T> {
         var complete = new Promise<T>();

         var request = new XMLHttpRequest();
         request.open("GET", this.bustCache? this.cacheBust(this.path):this.path, true);
         request.responseType = this.responseType;
         request.onloadstart = (e) => { this._start(e); };
         request.onprogress = this.onprogress;
         request.onerror = this.onerror;
         request.onload = (e) => {
            if(request.status !== 200){
               this.logger.error("Failed to load resource ", this.path, " server responded with error code", request.status);
               this.onerror(request.response);
               complete.resolve(request.response);
               return;
            }

            this.data = this.processDownload(request.response);

            this.oncomplete();
            this.logger.debug("Completed loading resource", this.path);
            complete.resolve(this.data);
         };
         request.send();

         return complete;
      }


      /**
       * Returns the loaded data once the resource is loaded
       * @method GetData
       * @returns any
       */
      public getData(): any {
         return this.data;
      }

      /**
       * This method is meant to be overriden to handle any additional
       * processing. Such as decoding downloaded audio bits.
       * @method ProcessDownload
       */
      public processDownload(data: T): any{
         // Handle any additional loading after the xhr has completed.
         return URL.createObjectURL(data);
      }

      public onprogress: (e: any) => void = () => { };

      public oncomplete: () => void = () => { };

      public onerror: (e: any) => void = () => { };
   }
}