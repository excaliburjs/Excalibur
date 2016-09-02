/// <reference path="../Util/Util.ts" />
/// <reference path="../Promises.ts" />
/// <reference path="Resource.ts" />
/// <reference path="../Interfaces/ILoadable.ts" />
/// <reference path="../Interfaces/IAudio.ts" />
/// <reference path="../Interfaces/IAudioImplementation.ts" />

module ex {
   
   // set up audio context reference
   // when we introduce multi-tracking, we may need to move this to a factory method
   if ((<any>window).AudioContext) {
      var audioContext: AudioContext = new (<any>window).AudioContext();
   }   

   /**
    * An audio implementation for HTML5 audio.
    */
   export class AudioTag implements IAudioImplementation {

      public responseType = 'blob';

      /**
       * Transforms raw Blob data into a object URL for use in audio tag
       */
      public processData(data: Blob): ex.Promise<string> {        
         var url = URL.createObjectURL(data);         
         return ex.Promise.wrap(url);
      }

      /**
       * Creates a new instance of an audio tag referencing the provided audio URL
       */
      public createInstance(url: string): IAudio {
         return new AudioTagInstance(url);
      }

   }

   /**
    * An audio implementation for Web Audio API.
    */
   export class WebAudio implements IAudioImplementation {
      private _logger = Logger.getInstance();

      public responseType = 'arraybuffer';

      /**
       * Processes raw arraybuffer data and decodes into WebAudio buffer (async).
       */
      public processData(data: ArrayBuffer): ex.Promise<AudioBuffer> {
         var complete = new ex.Promise<AudioBuffer>();

         audioContext.decodeAudioData(data,
            (buffer) => {
               complete.resolve(buffer);
            },
            () => {
               this._logger.error('Unable to decode ' +
                  ' this browser may not fully support this format, or the file may be corrupt, ' +
                  'if this is an mp3 try removing id3 tags and album art from the file.');
               complete.resolve(undefined);
            });

         return complete;
      }

      /**
       * Creates a new WebAudio AudioBufferSourceNode to play a sound instance
       */
      public createInstance(buffer: AudioBuffer): IAudio {
         return new WebAudioInstance(buffer);
      }

      private static _unlocked: boolean = false;

      /**
       * Play an empty sound to unlock Safari WebAudio context. Call this function
       * right after a user interaction event. Typically used by [[PauseAfterLoader]]
       * @source https://paulbakaus.com/tutorials/html5/web-audio-on-ios/
       */
      static unlock() {

         if (this._unlocked || !audioContext) {
            return;
         }

         // create empty buffer and play it
         var buffer = audioContext.createBuffer(1, 1, 22050);
         var source = audioContext.createBufferSource();
         var ended = false;
         source.buffer = buffer;
         source.connect(audioContext.destination);
         source.onended = () => ended = true;

         if ((<any>source).noteOn) {
            // deprecated
            (<any>source).noteOn(0);
         } else {
            source.start(0);
         }

         // by checking the play state after some time, we know if we're really unlocked
         setTimeout(function () {
            if ((<any>source).playbackState) {
               var legacySource = (<any>source);
               if (legacySource.playbackState === legacySource.PLAYING_STATE ||
                  legacySource.playbackState === legacySource.FINISHED_STATE) {
                  this._unlocked = true;
               }
            } else {               
               if (audioContext.currentTime > 0 || ended) {
                  this._unlocked = true;
               } 
            }
         }, 0);

      }

      static isUnlocked() {
         return this._unlocked;
      }
   }

   /**
    * Factory method that gets the audio implementation to use
    */
   export function getAudioImplementation(): IAudioImplementation {
      if ((<any>window).AudioContext) {            
         return new WebAudio();
      } else {            
         return new AudioTag();
      }
   };   

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
   export class Sound implements ILoadable, IAudio {
      private _logger: Logger = Logger.getInstance();
      private _data: any = null;
      private _tracks: IAudio[] = [];
      private _isLoaded = false;
      private _isPaused = false;
      private _loop = false;
      private _volume = 1.0;

      public path: string;

      public onprogress: (e: any) => void = () => { return; };
      public oncomplete: () => void = () => { return; };
      public onerror: (e: any) => void = () => { return; };   

      private _engine: Engine;
      private _wasPlayingOnHidden: boolean = false;      
      
      /**
       * Populated once loading is complete
       */
      public sound: IAudioImplementation;

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
            } else {
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

         for (var path of paths) {
            if (Sound.canPlayFile(path)) {
               this.path = path;
               break;
            }               
         }

         if (!this.path) {
            this._logger.warn('This browser does not support any of the audio files specified:', paths.join(', '));
            this._logger.warn('Attempting to use', paths[0]);
            this.path = paths[0]; // select the first specified
         }

         this.sound = ex.getAudioImplementation(); // reference namespaced function to allow mocks
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
       * Returns how many instances of the sound are currently playing
       */
      public instanceCount(): number {
         return this._tracks.length;
      }

      /**
       * Sets the volume of the sound clip
       * @param volume  A volume value between 0-1.0
       */
      public setVolume(volume: number) {
         this._volume = volume;

         for (var track of this._tracks) {
            track.setVolume(volume);
         }
      }

      /**
       * Indicates whether the clip should loop when complete
       * @param loop  Set the looping flag
       */
      public setLoop(loop: boolean) {
         this._loop = loop;
         for (var track of this._tracks) {
            track.setLoop(loop);
         }
      }

      /**
       * Whether or not the sound is playing right now
       */
      public isPlaying(): boolean {
         return this._tracks.some(t => t.isPlaying());
      }

      /**
       * Play the sound, returns a promise that resolves when the sound is done playing
       */
      public play(): ex.Promise<boolean> {
         if (this._isLoaded) {
            var resumed = [];

            // ensure we resume *current* tracks (if paused)
            for (var track of this._tracks) {
               resumed.push(track.play());
            }

            // when paused, don't start playing new track
            if (this._isPaused) {
               this._isPaused = false;

               // resolve when resumed tracks are done
               return Promise.join(resumed);
            }

            // push a new track
            var newTrack = this.sound.createInstance(this._data);
            newTrack.setLoop(this._loop);
            newTrack.setVolume(this._volume);

            this._tracks.push(newTrack);

            return newTrack.play().then(() => {

               // when done, remove track
               this._tracks.splice(this._tracks.indexOf(newTrack), 1);

               return true;
            });
         } else {
            return Promise.wrap(true);
         }
      }

      /**
       * Stop the sound, and do not rewind
       */
      public pause() {
         for (var track of this._tracks) {
            track.pause();
         }
         this._isPaused = true;
      }

      /**
       * Stop the sound and rewind
       */
      public stop() {
         this._isPaused = false;

         var tracks = this._tracks.concat([]);
         for (var track of tracks) {
            track.stop();
         }
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
      public load(): Promise<IAudioImplementation> {
         var complete = new Promise<IAudioImplementation>();
         
         if (!!this.getData()) {
            this._logger.debug('Already have data for resource', this.path);
            complete.resolve(this.sound);
            this.oncomplete();
            return complete;
         }
         
         this._logger.debug('Started loading sound', this.path);        

         try {
            this._fetchResource(request => {

               if (request.status !== 200) {
                  this._logger.error('Failed to load audio resource ', this.path, ' server responded with error code', request.status);
                  this.onerror(request.response);
                  complete.resolve(null);
                  return;
               }

               // load sound
               this.setData(request.response).then(() => {                              
                  this.oncomplete();
                  this._logger.debug('Completed loading sound', this.path);
                  
                  complete.resolve(this.sound);
               }, (e) => complete.resolve(e));            
            });

         } catch (e) {
            this._logger.error('Error loading sound! If this is a cross origin error, \
               you must host your sound with your html and javascript.');

            this.onerror(e);
            complete.resolve(e);
         }

         return complete;
      }

      /* istanbul ignore next */
      private _fetchResource(onload: (XMLHttpRequest) => void) {
         var request = new XMLHttpRequest();

         request.open('GET', this.path, true);
         request.responseType = this.sound.responseType;
         request.onprogress = this.onprogress;
         request.onerror = this.onerror;
         request.onload = (e) => onload(request);

         request.send();
      }
      
      /**
       * Gets the raw sound data (e.g. blob URL or AudioBuffer)
       */
      public getData(): any {
         return this._data;
      }
      
      /**
       * Sets raw sound data and returns a Promise that is resolved when sound data is processed
       * 
       * @param data The XHR data for the sound implementation to process (Blob or ArrayBuffer)
       */
      public setData(data: any): ex.Promise<any> {         
         return this.sound.processData(data).then(data => {
            this._isLoaded = true;
            this._data = this.processData(data);
            return data;
         });
      }

      /**
       * Set the raw sound data (e.g. blob URL or AudioBuffer)
       */
      public processData(data: any) {
         return data;
      }
      
   }

   /**
    * Internal class representing a HTML5 audio instance    
    */
   /* istanbul ignore next */
   class AudioTagInstance implements IAudio {
      private _audioElement: HTMLAudioElement;
      private _playingPromise: ex.Promise<any>;
      private _isPlaying = false;
      private _isPaused = false;
      private _loop = false;
      private _volume = 1.0;

      constructor(
         private _src: string) {

         this._audioElement = new Audio(_src);
      }

      public isPlaying() {
         return this._isPlaying;
      }

      public get loop() {
         return this._loop;
      }

      public setLoop(value: boolean) {
         this._loop = value;
         this._audioElement.loop = value;
         this._wireUpOnEnded();
      }

      public setVolume(value: number) {
         this._volume = value;
         this._audioElement.volume = Util.clamp(value, 0, 1.0);
      }

      public play() {
         if (this._isPaused) {
            this._resume();
         } else if (!this._isPlaying) {
            this._start();
         }

         return this._playingPromise;
      }

      private _start() {
         this._audioElement.load();
         this._audioElement.loop = this._loop;
         this._audioElement.play();

         this._isPlaying = true;
         this._isPaused = false;

         this._playingPromise = new ex.Promise();
         this._wireUpOnEnded();
      }

      private _resume() {
         if (!this._isPaused) {
            return;
         }

         this._audioElement.play();

         this._isPaused = false;
         this._isPlaying = true;
         this._wireUpOnEnded();
      }

      public pause() {
         if (!this._isPlaying) {
            return;
         }

         this._audioElement.pause();
         this._isPaused = true;
         this._isPlaying = false;
      }

      public stop() {
         if (!this._isPlaying) {
            return;
         }

         this._audioElement.pause();
         this._audioElement.currentTime = 0;
         this._handleOnEnded();
      }

      private _wireUpOnEnded() {
         if (!this._loop) {
            this._audioElement.onended = () => this._handleOnEnded();
         }
      }

      private _handleOnEnded() {
         this._isPlaying = false;
         this._isPaused = false;
         this._playingPromise.resolve(true);
      }
   }  

   /**
    * Internal class representing a Web Audio AudioBufferSourceNode instance
    * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
    */
   /* istanbul ignore next */
   class WebAudioInstance implements IAudio {
      private _bufferSource: AudioBufferSourceNode;
      private _volumeNode = audioContext.createGain();
      private _playingPromise: ex.Promise<any>;      
      private _isPlaying = false;
      private _isPaused = false;
      private _startTime: number;
      private _loop: boolean = false;
      private _volume: number = 1.0;

      /**
       * Current playback offset (in seconds)
       */
      private _currentOffset = 0;

      public isPlaying() {
         return this._isPlaying;
      }

      constructor(private _buffer: AudioBuffer) {
      }

      public setVolume(value: number) {
         this._volume = value;
         this._volumeNode.gain.value = Util.clamp(value, 0, 1.0);
      }

      public setLoop(value: boolean) {
         this._loop = value;

         if (this._bufferSource) {
            this._bufferSource.loop = value;
            this._wireUpOnEnded();
         }
      }

      public play() {
         if (this._isPaused) {
            this._resume();
         } else if (!this._isPlaying) {
            this._start();
         }

         return this._playingPromise;
      }

      private _start() {
         this._volumeNode.connect(audioContext.destination);
         this._createBufferSource();
         this._bufferSource.start(0, 0);

         this._startTime = new Date().getTime();
         this._currentOffset = 0;
         this._isPlaying = true;
         this._isPaused = false;

         this._playingPromise = new ex.Promise();
         this._wireUpOnEnded();
      }

      private _resume() {
         if (!this._isPaused) {
            return;
         }

         // a buffer source can only be started once
         // so we need to dispose of the previous instance before
         // "resuming" the next one

         this._bufferSource.onended = null; // dispose of any previous event handler
         this._createBufferSource();
         var duration = (1 / this._bufferSource.playbackRate.value) * this._buffer.duration;
         this._bufferSource.start(0, this._currentOffset % duration);

         this._isPaused = false;
         this._isPlaying = true;
         this._wireUpOnEnded();
      }

      private _createBufferSource() {
         this._bufferSource = audioContext.createBufferSource();
         this._bufferSource.buffer = this._buffer;
         this._bufferSource.loop = this._loop;
         this._bufferSource.playbackRate.value = 1.0;
         this._bufferSource.connect(this._volumeNode);
      }

      public pause() {
         if (!this._isPlaying) {
            return;
         }

         this._bufferSource.stop(0);
         // Playback rate will be a scale factor of how fast/slow the audio is being played
         // default is 1.0
         // we need to invert it to get the time scale
         var pbRate = 1 / (this._bufferSource.playbackRate.value || 1.0);
         this._currentOffset = ((new Date().getTime() - this._startTime) * pbRate) / 1000; // in seconds
         this._isPaused = true;
         this._isPlaying = false;
      }

      public stop() {
         if (!this._isPlaying) {
            return;
         }

         this._bufferSource.stop(0);
         
         // handler will not be wired up if we were looping
         if (!this._bufferSource.onended) {
            this._handleOnEnded();
         }

         this._currentOffset = 0;
         this._isPlaying = false;
         this._isPaused = false;
      }

      private _wireUpOnEnded() {
         if (!this._loop) {
            this._bufferSource.onended = () => this._handleOnEnded();
         }
      }

      private _handleOnEnded() {
         // pausing calls stop(0) which triggers onended event
         // so we don't "resolve" yet (when we resume we'll try again)
         if (!this._isPaused) {
            this._isPlaying = false;
            this._playingPromise.resolve(true);
         }
      }
   }
}