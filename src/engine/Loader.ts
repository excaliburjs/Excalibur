/// <reference path="Sound.ts" />
/// <reference path="Util/Util.ts" />
/// <reference path="Promises.ts" />
/// <reference path="Resource.ts" />
/// <reference path="Interfaces/ILoadable.ts" />

module ex {
   

   /**
    * Textures
    *
    * The [[Texture]] object allows games built in Excalibur to load image resources.
    * [[Texture]] is an [[ILoadable]] which means it can be passed to a [[Loader]]
    * to pre-load before starting a level or game.
    *
    * Textures are the raw image so to add a drawing to a game, you must create
    * a [[Sprite]]. You can use [[Texture.asSprite]] to quickly generate a Sprite
    * instance.
    *
    * ## Pre-loading textures
    *
    * Pass the [[Texture]] to a [[Loader]] to pre-load the asset. Once a [[Texture]]
    * is loaded, you can generate a [[Sprite]] with it.
    *
    * ```js
    * var txPlayer = new ex.Texture("/assets/tx/player.png");
    *
    * var loader = new ex.Loader(txPlayer);
    *
    * game.start(loader).then(function () {
    *
    *   var player = new ex.Actor();
    *
    *   player.addDrawing(txPlayer);
    *
    *   game.add(player);
    * });
    * ```
    */
   export class Texture extends Resource<HTMLImageElement> {

      /**
       * The width of the texture in pixels
       */
      public width: number;

      /**
       * The height of the texture in pixels
       */
      public height: number;

      /**
       * A [[Promise]] that resolves when the Texture is loaded.
       */
      public loaded: Promise<any> = new Promise<any>();

      private _isLoaded: boolean = false;
      private _sprite: Sprite = null;

      /**
       * Populated once loading is complete
       */
      public image: HTMLImageElement;

      private _progressCallback: (progress: number, total: number) => void;
      private _doneCallback: () => void;
      private _errorCallback: (e: string) => void;

      /**
       * @param path       Path to the image resource
       * @param bustCache  Optionally load texture with cache busting
       */
      constructor(public path: string, public bustCache = true) {
         super(path, 'blob', bustCache);
         this._sprite = new Sprite(this, 0, 0, 0, 0);
      }
      

      /**
       * Returns true if the Texture is completely loaded and is ready
       * to be drawn.
       */
      public isLoaded(): boolean {
         return this._isLoaded;
      }

      /**
       * Begins loading the texture and returns a promise to be resolved on completion
       */
      public load(): Promise<HTMLImageElement> {
         var complete = new Promise<HTMLImageElement>();

         var loaded = super.load();
         loaded.then(() => {
            this.image = new Image();
            this.image.addEventListener('load', () => {
               this._isLoaded = true;
               this.width = this._sprite.swidth = this._sprite.naturalWidth = this._sprite.width = this.image.naturalWidth;
               this.height = this._sprite.sheight = this._sprite.naturalHeight = this._sprite.height = this.image.naturalHeight;
               this.loaded.resolve(this.image);
               complete.resolve(this.image);
            });
            this.image.src = super.getData();            
            

         }, () => {
            complete.reject('Error loading texture.');
         });
         return complete;
      }

      public asSprite(): Sprite {
         return this._sprite;
      }

   }

   /**
    * Sounds
    *
    * The [[Sound]] object allows games built in Excalibur to load audio 
    * components, from soundtracks to sound effects. [[Sound]] is an [[ILoadable]]
    * which means it can be passed to a [[Loader]] to pre-load before a game or level.
    *
    * ## Pre-loading sounds
    *
    * Pass the [[Sound]] to a [[Loader]] to pre-load the asset. Once a [[Sound]]
    * is loaded, you can [[Sound.play|play]] it.
    *
    * ```js
    * var sndPlayerDeath = new ex.Sound("/assets/snd/player-death.mp3", "/assets/snd/player-wav.mp3");
    *
    * var loader = new ex.Loader(sndPlayerDeath);
    *
    * game.start(loader).then(function () {
    *
    *   sndPlayerDeath.play();
    * });
    * ```  
    */
   export class Sound implements ILoadable, ex.Internal.ISound {
      private _logger: Logger = Logger.getInstance();

      public onprogress: (e: any) => void = () => { return; };

      public oncomplete: () => void = () => { return; };

      public onerror: (e: any) => void = () => { return; };

      public onload: (e: any) => void = () => { return; };

      private _isLoaded: boolean = false;

      private _selectedFile: string = '';

      private _engine: Engine;
      private _wasPlayingOnHidden: boolean = false;

      /**
       * Populated once loading is complete
       */
      public sound: ex.Internal.FallbackAudio;

      /**
       * Whether or not the browser can play this file as HTML5 Audio
       */
      public static canPlayFile(file: string): boolean {
         try {
            var a = new Audio();
            var filetype = /.*\.([A-Za-z0-9]+)$/;
            var type = file.match(filetype)[1];
            if (a.canPlayType('audio/' + type)) {
               return true;
            }
            {
               return false;
            }
         } catch (e) {
            ex.Logger.getInstance().warn('Cannot determine audio support, assuming no support for the Audio Tag', e);
            return false;
         }
      }

      /**
       * @param paths A list of audio sources (clip.wav, clip.mp3, clip.ogg) for this audio clip. This is done for browser compatibility.
       */
      constructor(...paths: string[]) {
         /* Chrome : MP3, WAV, Ogg
          * Firefox : WAV, Ogg, 
          * IE : MP3, WAV coming soon
          * Safari MP3, WAV, Ogg           
          */
         this._selectedFile = '';
         for(var i = 0; i < paths.length; i++) {
            if(Sound.canPlayFile(paths[i])) {
               this._selectedFile = paths[i];
               break;
            }               
         }

         if(!this._selectedFile) {
            this._logger.warn('This browser does not support any of the files specified');
            this._selectedFile = paths[0]; // select the first specified
         }

         this.sound = new ex.Internal.FallbackAudio(this._selectedFile, 1.0);
      }

      public wireEngine(engine: Engine) {
         if (engine) {
            this._engine = engine;
            this._engine.on('hidden', () => {
               if (engine.pauseAudioWhenHidden && this.isPlaying()) {
                  this._wasPlayingOnHidden = true;
                  this.pause();
               }
            });

            this._engine.on('visible', () => {
               if (engine.pauseAudioWhenHidden && this._wasPlayingOnHidden) {
                  this.play();
                  this._wasPlayingOnHidden = false;
               }
            });
         }
      }

      /**
       * Sets the volume of the sound clip
       * @param volume  A volume value between 0-1.0
       */
      public setVolume(volume: number) {
         if (this.sound) { this.sound.setVolume(volume); }
      }

      /**
       * Indicates whether the clip should loop when complete
       * @param loop  Set the looping flag
       */
      public setLoop(loop: boolean) {
         if (this.sound) { this.sound.setLoop(loop); }
      }

      /**
       * Whether or not the sound is playing right now
       */
      public isPlaying(): boolean {
         if (this.sound) { return this.sound.isPlaying(); }
      }

      /**
       * Play the sound, returns a promise that resolves when the sound is done playing
       */
      public play(): ex.Promise<any> {
         if (this.sound) { return this.sound.play(); }
      }

      /**
       * Stop the sound, and do not rewind
       */
      public pause() {
         if (this.sound) { this.sound.pause(); }
      }

      /**
       * Stop the sound and rewind
       */
      public stop() {
         if (this.sound) { this.sound.stop(); }
      }

      /**
       * Returns true if the sound is loaded
       */
      public isLoaded() {
         return this._isLoaded;
      }

      /**
       * Begins loading the sound and returns a promise to be resolved on completion
       */
      public load(): Promise<ex.Internal.FallbackAudio> {
         var complete = new Promise<ex.Internal.FallbackAudio>();
         this._logger.debug('Started loading sound', this._selectedFile);
         this.sound.onprogress = this.onprogress;
         this.sound.onload = () => {
            this.oncomplete();
            this._isLoaded = true;
            this._logger.debug('Completed loading sound', this._selectedFile);
            complete.resolve(this.sound);
         };
         this.sound.onerror = (e) => {
            this.onerror(e);
            complete.resolve(e);
         };
         this.sound.load();
         return complete;
      }
   }

   /**
    * Pre-loading assets
    *
    * The loader provides a mechanism to preload multiple resources at 
    * one time. The loader must be passed to the engine in order to 
    * trigger the loading progress bar.
    *
    * The [[Loader]] itself implements [[ILoadable]] so you can load loaders.
    *
    * ## Example: Pre-loading resources for a game
    *
    * ```js
    * // create a loader
    * var loader = new ex.Loader();
    *
    * // create a resource dictionary (best practice is to keep a separate file)
    * var resources = {
    *   TextureGround: new ex.Texture("/images/textures/ground.png"),
    *   SoundDeath: new ex.Sound("/sound/death.wav", "/sound/death.mp3")
    * };
    *
    * // loop through dictionary and add to loader
    * for (var loadable in resources) {
    *   if (resources.hasOwnProperty(loadable)) {
    *     loader.addResource(loadable);
    *   }
    * }
    *
    * // start game
    * game.start(loader).then(function () {
    *   console.log("Game started!");
    * });
    * ```
    */
   export class Loader implements ILoadable {
      private _resourceList: ILoadable[] = [];
      private _index = 0;

      private _resourceCount: number = 0;
      private _numLoaded: number = 0;
      private _progressCounts: { [key: string]: number; } = {};
      private _totalCounts: { [key: string]: number; } = {};
      private _engine: Engine;

      /**
       * @param loadables  Optionally provide the list of resources you want to load at constructor time
       */
      constructor(loadables?: ILoadable[]) {
         if (loadables) {
            this.addResources(loadables);
         }
      }

      public wireEngine(engine: Engine) {
         this._engine = engine;
      }

      /**
       * Add a resource to the loader to load
       * @param loadable  Resource to add
       */
      public addResource(loadable: ILoadable) {
         var key = this._index++;
         this._resourceList.push(loadable);
         this._progressCounts[key] = 0;
         this._totalCounts[key] = 1;
         this._resourceCount++;
      }

      /**
       * Add a list of resources to the loader to load
       * @param loadables  The list of resources to load
       */
      public addResources(loadables: ILoadable[]) {
         var i = 0, len = loadables.length;

         for (i; i < len; i++) {
            this.addResource(loadables[i]);
         }
      }

      private _sumCounts(obj): number {
         var sum = 0;
         var prev = 0;
         for (var i in obj) {
            sum += obj[i] | 0;
         }
         return sum;
      }

      /**
       * Returns true if the loader has completely loaded all resources
       */
      public isLoaded() {
         return this._numLoaded === this._resourceCount;
      }


      /**
       * Begin loading all of the supplied resources, returning a promise 
       * that resolves when loading of all is complete
       */
      public load(): Promise<any> {
         var complete = new Promise<any>();
         var me = this;
         if (this._resourceList.length === 0) {
            me.oncomplete.call(me);
            return complete;
         }

         var progressArray = new Array<any>(this._resourceList.length);
         var progressChunks = this._resourceList.length;

         this._resourceList.forEach((r, i) => {
            if (this._engine) {
               r.wireEngine(this._engine);
            }
            r.onprogress = function (e) {
               var total = <number>e.total;
               var loaded = <number>e.loaded;
               progressArray[i] = {loaded: ((loaded / total) * (100 / progressChunks)), total: 100};

               var progressResult: any = progressArray.reduce(function(accum, next){
                  return {loaded: (accum.loaded + next.loaded), total: 100};
               }, {loaded: 0, total: 100});

               me.onprogress.call(me, progressResult);
            };
            r.oncomplete = r.onerror = function () {
               me._numLoaded++;
               if (me._numLoaded === me._resourceCount) {
                  me.onprogress.call(me, {loaded: 100, total: 100});
                  me.oncomplete.call(me);
                  complete.resolve();
               }
            };
         });

         function loadNext(list, index) {
            if(!list[index]) { return; }
            list[index].load().then(function() {
               loadNext(list, index + 1);
            });
         }
         loadNext(this._resourceList, 0);         

         return complete;
      }

      public onprogress: (e: any) => void = () => { return; };

      public oncomplete: () => void = () => { return; };

      public onerror: () => void = () => { return; };

   }
}