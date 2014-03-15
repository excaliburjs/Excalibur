/// <reference path="Sound.ts" />
/// <reference path="Util.ts" />
/// <reference path="Promises.ts" />

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

   /**
    * The Texture object allows games built in Excalibur to load image resources.
    * It is generally recommended to preload images using the "Texture" object.
    * @class Texture
    * @extend ILoadable
    * @constructor
    * @param path {string} Path to the image resource
    */
   export class Texture implements ILoadable {
      public width: number;
      public height: number;
      /**
       * Populated once loading is complete
       * @property image {HTMLImageElement}
       */
      public image: HTMLImageElement;
      private logger: Logger = Logger.getInstance();

      private progressCallback: (progress: number, total: number) => void
      private doneCallback: () => void;
      private errorCallback: (e: string) => void;

      constructor(public path: string) {
      }

      private _start(e: any) {
         this.logger.debug("Started loading image " + this.path);
      }

      /**
       * Returns true if the Texture is completely loaded and is ready
       * to be drawn.
       * @method isLoaded 
       * @returns boolean
       */
      public isLoaded(): boolean {
         return (!!this.image && !!this.image.src);
      }

      /**
       * Begins loading the texture and returns a promise to be resolved on completion
       * @method load
       * @returns Promise&lt;HTMLImageElement&gt;
       */
      public load(): Promise<HTMLImageElement> {
         var complete = new Promise<HTMLImageElement>();

         this.image = new Image();
         var request = new XMLHttpRequest();
         request.open("GET", this.path, true);
         request.responseType = "blob";
         request.onloadstart = (e) => { this._start(e) };
         request.onprogress = this.onprogress;
         request.onload = (e) => {
            this.image.src = URL.createObjectURL(request.response);
            this.oncomplete()
            this.logger.debug("Completed loading image", this.path);
            complete.resolve(this.image);
         };
         request.onerror = (e) => {
            this.onerror(e);
            complete.reject(e);
         };
         if (request.overrideMimeType) {
            request.overrideMimeType('text/plain; charset=x-user-defined');
         }
         request.send();

         return complete;
      }

      public onprogress: (e: any) => void = () => { };

      public oncomplete: () => void = () => { };

      public onerror: (e: any) => void = () => { };
   }

   /**
    * The Sound object allows games built in Excalibur to load audio 
    * components, from soundtracks to sound effects. It is generally 
    * recommended to load sound resources when using Excalibur
    * @class Sound
    * @extend ILoadable
    * @constructor
    * @param ...paths {string[]} A list of audio sources (clip.wav, clip.mp3, clip.ogg) for this audio clip. This is done for browser compatibility.
    */
   export class Sound implements ILoadable, ex.Internal.ISound {
      private logger: Logger = Logger.getInstance();

      public onprogress: (e: any) => void = () => { };

      public oncomplete: () => void = () => { };

      public onerror: (e: any) => void = () => { };

      public onload: (e: any) => void = () => { };

      private _isLoaded: boolean = false;

      private _selectedFile: string = "";

      /**
       * Populated once loading is complete
       * @property sound {Sound}
       */
      public sound: ex.Internal.FallbackAudio;


      public static canPlayFile(file: string): boolean {
         var a = new Audio();
         var filetype = /.*\.([A-Za-z0-9]+)$/;
         var type = file.match(filetype)[1];
         if(a.canPlayType('audio/'+type)){
            return true;
         }{
            return false;
         }
      }

      constructor(...paths: string[]) {
         /* Chrome : MP3, WAV, Ogg
          * Firefox : WAV, Ogg, 
          * IE : MP3, 
          * Safari MP3, WAV, Ogg           
          */
         this._selectedFile = "";
         for(var i = 0; i < paths.length; i++){
            if(Sound.canPlayFile(paths[i])){
               this._selectedFile = paths[i];
               break;
            }               
         }

         if(!this._selectedFile){
            this.logger.warn("This browser does not support any of the files specified");
            this._selectedFile = paths[0]; // select the first specified
         }

         this.sound = new ex.Internal.FallbackAudio(this._selectedFile, 1.0);
      }

      /**
       * Sets the volume of the sound clip
       * @method setVolume
       * @param volume {number} A volume value between 0-1.0
       */
      public setVolume(volume: number) {
         if (this.sound) this.sound.setVolume(volume);
      }

      /**
       * Indicates whether the clip should loop when complete
       * @method setLoop 
       * @param loop {boolean} Set the looping flag
       */
      public setLoop(loop: boolean) {
         if (this.sound) this.sound.setLoop(loop);
      }

      /**
       * Play the sound
       * @method play
       */
      public play() {
         if (this.sound) this.sound.play();
      }

      /**
       * Stop the sound and rewind
       * @method stop
       */
      public stop() {
         if (this.sound) this.sound.stop();
      }

      /**
       * Returns true if the sound is loaded
       * @method isLoaded
       */
      public isLoaded(){
         return this._isLoaded;
      }

      /**
       * Begins loading the sound and returns a promise to be resolved on completion
       * @method load
       * @returns Promise&lt;Sound&gt;
       */
      public load(): Promise<ex.Internal.FallbackAudio> {
         var complete = new Promise<ex.Internal.FallbackAudio>();
         this.logger.debug("Started loading sound", this._selectedFile);
         this.sound.onprogress = this.onprogress;
         this.sound.onload = () => {
            this.oncomplete();
            this._isLoaded = true;
            this.logger.debug("Completed loading sound", this._selectedFile);
            complete.resolve(this.sound);
         }
         this.sound.onerror = (e) => {
               this.onerror(e);
               complete.reject(e);
            }
         this.sound.load();
         return complete;
      }
   }

   /**
    * The loader provides a mechanism to preload multiple resources at 
    * one time. The loader must be passed to the engine in order to 
    * trigger the loading progress bar
    * @class Loader
    * @extend ILoadable
    * @constructor
    * @param [loadables=undefined] {ILoadable[]} Optionally provide the list of resources you want to load at constructor time
    */
   export class Loader implements ILoadable {
      private resourceList: ILoadable[] = [];
      private index = 0;

      private resourceCount: number = 0;
      private numLoaded: number = 0;
      private progressCounts: { [key: string]: number; } = {};
      private totalCounts: { [key: string]: number; } = {};

      constructor(loadables?: ILoadable[]) {
         if (loadables) {
            this.addResources(loadables);
         }
      }

      /**
       * Add a resource to the loader to load
       * @method addResource
       * @param loadable {ILoadable} Resource to add
       */
      public addResource(loadable: ILoadable) {
         var key = this.index++;
         this.resourceList.push(loadable);
         this.progressCounts[key] = 0;
         this.totalCounts[key] = 1;
         this.resourceCount++;
      }

      /**
       * Add a list of resources to the loader to load
       * @method addResources
       * @param loadables {ILoadable[]} The list of resources to load
       */
      public addResources(loadables: ILoadable[]) {
         loadables.forEach((l) => {
            this.addResource(l);
         });
      }

      private sumCounts(obj): number {
         var sum = 0;
         var prev = 0;
         for (var i in obj) {
            sum += obj[i] | 0;
         }
         return sum;
      }

      /**
       * Returns true if the loader has completely loaded all resources
       * @method isLoaded
       */
      public isLoaded(){
         return this.numLoaded === this.resourceCount;
      }


      /**
       * Begin loading all of the supplied resources, returning a promise that resolves when loading of all is complete
       * @method load
       * @returns Promsie&lt;any&gt;
       */
      public load(): Promise<any> {
         var complete = new Promise<any>();
         var me = this;
         if (this.resourceList.length === 0) {
            me.oncomplete.call(me);
            return complete;
         }

         var progressArray = new Array<any>(this.resourceList.length);
         var progressChunks = this.resourceList.length;

         this.resourceList.forEach((r, i) => {
            r.onprogress = function (e) {
               var total = <number>e.total;
               var loaded = <number>e.loaded;
               progressArray[i] = {loaded: ((loaded/total)*(100/progressChunks)), total: 100};

               var progressResult: any = progressArray.reduce(function(accum, next){
                  return {loaded: (accum.loaded + next.loaded), total: 100};
               }, {loaded: 0, total: 100});

               me.onprogress.call(me, progressResult);
            };
            r.oncomplete = function () {
               me.numLoaded++;
               if (me.numLoaded === me.resourceCount) {
                  
                  me.oncomplete.call(me);
                  complete.resolve();
               }
            };
         });

         function loadNext(list, index){
            if(!list[index]) return;
            list[index].load().then(function(){
               loadNext(list, index+1);
            });
         }
         loadNext(this.resourceList, 0);         

         return complete;
      }

      public onprogress: (e: any) => void = () => { };

      public oncomplete: () => void = () => { };

      public onerror: () => void = () => { };

   }
}