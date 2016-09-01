/// <reference path="../Util/Util.ts" />
/// <reference path="../Promises.ts" />
/// <reference path="Resource.ts" />
/// <reference path="../Interfaces/ILoadable.ts" />

module ex {
   
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
    * // define multiple sources (such as mp3/wav/ogg) as a browser fallback
    * var sndPlayerDeath = new ex.Sound("/assets/snd/player-death.mp3", "/assets/snd/player-death.wav");
    *
    * var loader = new ex.Loader(sndPlayerDeath);
    *
    * game.start(loader).then(function () {
    *
    *   sndPlayerDeath.play();
    * });
    * ```  
    */
   export class Sound implements ILoadable, Internal.IAudioResource {
      private _logger: Logger = Logger.getInstance();

      public path: string;

      public onprogress: (e: any) => void = () => { return; };

      public oncomplete: () => void = () => { return; };

      public onerror: (e: any) => void = () => { return; };

      public onload: (e: any) => void = () => { return; };

      private _isLoaded: boolean = false;

      private _engine: Engine;
      private _wasPlayingOnHidden: boolean = false;      
      
      /**
       * Populated once loading is complete
       */
      public sound: ex.Internal.IAudioResource;

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
         this.path = '';
         for(var i = 0; i < paths.length; i++) {
            if(Sound.canPlayFile(paths[i])) {
               this.path = paths[i];
               break;
            }               
         }

         if(!this.path) {
            this._logger.warn('This browser does not support any of the audio files specified:', paths.join(', '));
            this._logger.warn('Attempting to use', paths[0]);
            this.path = paths[0]; // select the first specified
         }

         this.sound = Internal.FallbackAudioFactory.getAudioImplementation(this.path, 1.0);
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
      public load(): Promise<Internal.IAudioResource> {
         var complete = new Promise<Internal.IAudioResource>();
         
         if (this.sound.getData() !== null) {
            this._logger.debug('Already have data for resource', this.path);
            complete.resolve(this.sound);
            return complete;
         }
         
         this._logger.debug('Started loading sound', this.path);
         this.sound.onprogress = this.onprogress;
         this.sound.onload = () => {
            this.oncomplete();
            this._isLoaded = true;
            this._logger.debug('Completed loading sound', this.path);
            complete.resolve(this.sound);
         };
         this.sound.onerror = (e) => {
            this.onerror(e);
            complete.resolve(e);
         };
         this.sound.load();
         return complete;
      }
      
      public getData(): any {
         return this.sound.getData();
      }
      
      public setData(data: any) {
         this.sound.setData(data);
      }
      
      public processData(data: any): any {
         return this.sound.processData(data);
      }
   }
}