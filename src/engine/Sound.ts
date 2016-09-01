/// <reference path="MonkeyPatch.ts" />
/// <reference path="Util/Util.ts" />
/// <reference path="Util/Log.ts" />

module ex.Internal {

   export interface IAudio {
      setVolume(volume: number);
      setLoop(loop: boolean);
      isPlaying(): boolean;
      play(): ex.Promise<any>;
      pause();
      stop();
   }

   export interface IAudioResource extends IAudio {
      load();
      setData(data: any);
      getData(): any;
      processData(data: any): any;
      onload: (e: any) => void;
      onprogress: (e: any) => void;
      onerror: (e: any) => void;
      path: string;
   }

   export class FallbackAudioFactory {

      public static getAudioImplementation(path: string, volume?: number): IAudioResource {
         if ((<any>window).AudioContext) {
            Logger.getInstance().debug('Using new Web Audio Api for ' + path);
            return new WebAudio(path, volume);
         } else {
            Logger.getInstance().debug('Falling back to Audio Element for ' + path);
            return new AudioTag(path, volume);
         }
      }
   }

   /**
    * An internal abstract base implementation of an audio resource, delegating specific implementation details
    * to derived classes [[AudioTag]] and [[WebAudio]].    
    */
   export abstract class AbstractAudioResource implements IAudioResource {
      private _data: any = null;
      private _tracks: IAudio[] = [];
      private _isLoaded = false;
      private _isPaused = false;
      private _loop = false;
      private _volume: number;
      private _dataLoaded = new ex.Promise();

      protected _logger = Logger.getInstance();

      constructor(public path: string, volume: number = 1.0, private _responseType: string) {

         this.setVolume(Util.clamp(volume, 0, 1.0));
         this._volume = volume;

         // this is resolved by derived resources
         this._dataLoaded.then(() => {
            this._isLoaded = true;
            this.onload(this);
         });
      }

      public isPlaying(): boolean {
         return this._tracks.some(t => t.isPlaying());
      }

      public setVolume(volume: number) {
         this._volume = volume;

         for (var track of this._tracks) {
            track.setVolume(volume);
         }
      }

      public setLoop(loop: boolean) {
         this._loop = loop;
         for (var track of this._tracks) {
            track.setLoop(loop);
         }
      }

      public onload: (e: any) => void = () => { return; };
      public onprogress: (e: any) => void = () => { return; };
      public onerror: (e: any) => void = () => { return; };

      protected get loaded() {
         return this._isLoaded;
      }

      protected set loaded(value) {
         this._isLoaded = value;
      }

      public getData(): any {
         return this._data;
      }

      public setData(data: any) {         
         this._data = this.processData(data);
      }

      public load() {

         // Exit early if we already have data
         if (!!this.getData()) {
            return;
         }

         var request = new XMLHttpRequest();
         request.open('GET', this.path, true);
         request.responseType = this._responseType;
         request.onprogress = this.onprogress;
         request.onerror = this.onerror;
         request.onload = (e) => {
            if (request.status !== 200) {
               this._logger.error('Failed to load audio resource ', this.path, ' server responded with error code', request.status);
               this.onerror(request.response);
               this.loaded = false;
               return;
            }

            this.setData(request.response);
         };

         try {
            request.send();
         } catch (e) {
            this._logger.error('Error loading sound! If this is a cross origin error, \
               you must host your sound with your html and javascript.');
         }
      }      
      abstract processData(raw): any;
      protected abstract _createAudio(): IAudio;

      /**
       * Call to finish resolving data loaded and trigger onload event
       */
      protected _resolveData(data: any) {
         this._data = data;
         this._dataLoaded.resolve(true);
      }

      /**
       * Call to reject resolving data loaded and trigger onload event
       */
      protected _rejectData() {
         this._isLoaded = false;
         this._dataLoaded.reject(false);
      }

      public play(): Promise<any> {
         if (this._isLoaded) {
            // ensure we resume *current* tracks (if paused)
            for (var track of this._tracks) {
               track.play();
            }

            // when paused, don't start playing new track
            if (this._isPaused) {
               this._isPaused = false;
               return Promise.wrap(false);
            }

            // push a new track
            var newTrack = this._createAudio();
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

      public pause() {
         for (var track of this._tracks) {
            track.pause();
         }
         this._isPaused = true;
      }

      public stop() {
         this._isPaused = false;

         var tracks = this._tracks.concat([]);
         for (var track of tracks) {
            track.stop();
         }
      }
   }

   /**
    * An audio resource implementation for HTML5 audio.
    */
   export class AudioTag extends AbstractAudioResource {

      constructor(public path: string, volume: number = 1.0) {
         super(path, volume, 'blob');
      }

      public processData(data: Blob): string {        
         var url = URL.createObjectURL(data);
         this._resolveData(url);
         return url;
      }

      protected _createAudio(): IAudio {
         return new AudioTagTrack(this.getData());
      }

   }

   /**
    * Internal class representing a HTML5 audio track    
    */
   class AudioTagTrack implements IAudio {
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

   if ((<any>window).AudioContext) {
      var audioContext: AudioContext = new (<any>window).AudioContext();
   }

   /**
    * An audio resource implementation for Web Audio API.
    */
   export class WebAudio extends AbstractAudioResource {

      private _buffer: AudioBuffer = null;

      constructor(public path: string, public volume: number = 1.0) {
         super(path, volume, 'arraybuffer');
      }

      /**
       * Processes raw arraybuffer data and decodes into WebAudio buffer (async).
       */
      public processData(data: ArrayBuffer): any {
         audioContext.decodeAudioData(data,
            (buffer) => {
               this._buffer = buffer;
               this._resolveData(buffer);
            },
            () => {
               this._logger.error('Unable to decode ' + this.path +
                  ' this browser may not fully support this format, or the file may be corrupt, ' +
                  'if this is an mp3 try removing id3 tags and album art from the file.');
               this._rejectData();
            });
         return data;
      }

      protected _createAudio(): IAudio {
         return new WebAudioTrack(this._buffer);
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
    * Internal class representing a playing audio track
    * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
    */
   class WebAudioTrack implements IAudio {
      private _bufferSource: AudioBufferSourceNode;
      private _volumeNode = audioContext.createGain();
      private _playingPromise: ex.Promise<any>;
      private _currentOffset = 0;
      private _isPlaying = false;
      private _isPaused = false;
      private _startTime: number;
      private _loop: boolean = false;
      private _volume: number = 1.0;

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
         this._currentOffset = (new Date().getTime() - this._startTime) * pbRate;
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