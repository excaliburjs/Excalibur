/// <reference path="MonkeyPatch.ts" />
/// <reference path="Util/Util.ts" />
/// <reference path="Util/Log.ts" />

module ex.Internal {
   
   export interface ITrack {
      setLoop(loop: boolean);
      isPlaying(): boolean;
      play(): ex.Promise<any>;
      pause();
      stop();
   }

   export interface ISound extends ITrack {
      setVolume(volume: number);
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

      public static getAudioImplementation(path: string, volume?: number): ISound {
         if ((<any>window).AudioContext) {
            Logger.getInstance().debug('Using new Web Audio Api for ' + path);
            return new WebAudio(path, volume);
         } else {
            Logger.getInstance().debug('Falling back to Audio Element for ' + path);
            return new AudioTag(path, volume);
         }
      }
   }

   export class AudioTag implements ISound {
      private _tracks: AudioTagTrack[] = [];
      private _loadedAudio: string = null;
      private _isLoaded = false;
      private _log: Logger = Logger.getInstance();
      private _isPaused = false;
      private _loop = false;
      private _volume: number;

      constructor(public path: string, volume: number = 1.0) {
         
         this.setVolume(Util.clamp(volume, 0, 1.0));
         this._volume = volume;
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

      public load() {
         
         if (!!this._loadedAudio) {
            return;
         }
         
         var request = new XMLHttpRequest();
         request.open('GET', this.path, true);
         request.responseType = 'blob';
         request.onprogress = this.onprogress;
         request.onerror = this.onerror;
         request.onload = (e) => { 
            if (request.status !== 200) {
               this._log.error('Failed to load audio resource ', this.path, ' server responded with error code', request.status);
               this.onerror(request.response);
               this._isLoaded = false;
               return;
            }
            
            this.setData(request.response);            
            this.onload(e);
         };
         request.send();
      }
      
      public getData(): any {
         return this._loadedAudio;
      }
      
      public setData(data: any) {
         this._isLoaded = true;
         this._loadedAudio = this.processData(data);
      }
      
      public processData(data: any): any {
         var blobUrl = URL.createObjectURL(data);         
         return blobUrl;
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
            var newTrack = new AudioTagTrack(this._loadedAudio, this._loop, this._volume);
            
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
    * Internal class representing a playing audio track
    * @internal
    */
   class AudioTagTrack implements ITrack {
      private _audioElement: HTMLAudioElement;
      private _playingPromise: ex.Promise<any>;
      private _isPlaying = false;
      private _isPaused = false;      

      constructor(
         private _src: string,
         private _loop: boolean,
         private _volume: number) {

         this._audioElement = new Audio(_src);
         this.setVolume(_volume);
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
         this._audioElement.volume = value;
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
      var audioContext: any = new (<any>window).AudioContext();
   }

   export class WebAudio implements ISound {
      private _context = audioContext;
      private _volume = this._context.createGain();
      private _buffer = null;
      private _tracks: WebAudioTrack[] = [];
      private _isLoaded = false;
      private _isPaused = false;
      private _loop = false;


      private _logger: Logger = Logger.getInstance();
      private _data: any = null;

      constructor(public path: string, volume?: number) {

         if (volume) {
            this._volume.gain.value = Util.clamp(volume, 0, 1.0);
         } else {
            this._volume.gain.value = 1.0; // max volume
         }

      }

      public setVolume(volume: number) {
         this._volume.gain.value = volume;
      }

      public onload: (e: any) => void = () => { return; };
      public onprogress: (e: any) => void = () => { return; };
      public onerror: (e: any) => void = () => { return; };

      public load() {
         // Exit early if we already have data
         if (this._data !== null) {
             return;
         }
         
         var request = new XMLHttpRequest();
         request.open('GET', this.path);
         request.responseType = 'arraybuffer';
         request.onprogress = this.onprogress;
         request.onerror = this.onerror;
         request.onload = () => {
            if (request.status !== 200) {
               this._logger.error('Failed to load audio resource ', this.path, ' server responded with error code', request.status);
               this.onerror(request.response);
               this._isLoaded = false;
               return;
            }

            this.setData(request.response);
         };
         try {
            request.send();
         } catch (e) {
            console.error('Error loading sound! If this is a cross origin error, you must host your sound with your html and javascript.');
         }
      }
      
      public getData() {
         return this._data;
      }
      
      public setData(data: any) {
         this._data = this.processData(data);
      }
      
      public processData(data: any): any {
         this._context.decodeAudioData(data,
            (buffer) => {
               this._buffer = buffer;
               this._isLoaded = true;
               this.onload(this);
            },
            (e) => {
               this._logger.error('Unable to decode ' + this.path +
                  ' this browser may not fully support this format, or the file may be corrupt, ' +
                  'if this is an mp3 try removing id3 tags and album art from the file.');
               this._isLoaded = false;
               this.onload(this);
            });
         return data;
      }

      public setLoop(loop: boolean) {
         this._loop = loop;

         // update existing tracks
         for (var track of this._tracks) {
            track.setLoop(loop);
         }
      }

      public isPlaying(): boolean {
         return this._tracks.filter(t => t.isPlaying()).length > 0;
      }

      public play(): Promise<any> {

         if (this._isLoaded) {
            this._volume.connect(this._context.destination);
            
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
            var newTrack = new WebAudioTrack(this._context, this._buffer, this._loop, this._volume);
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
         this._isPaused = true;

         for (var track of this._tracks) {
            track.pause();
         }
      }

      public stop() {
         this._isPaused = false;

         var tracks = this._tracks.concat([]);
         for (var track of tracks) {
            track.stop();
         }
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
        source.buffer = buffer;
        source.connect(audioContext.destination);
        
        if (source.noteOn) {
            source.noteOn(0);
        } else {
            source.start(0);
        }

        // by checking the play state after some time, we know if we're really unlocked
        setTimeout(function() {
            if (source.playbackState === source.PLAYING_STATE || 
                source.playbackState === source.FINISHED_STATE) {
                this._unlocked = true;
            }
        }, 0);

      }
      
      static isUnlocked() {
          return this._unlocked;
      }
   }

   /**
    * Internal class representing a playing audio track
    * @internal
    */
   class WebAudioTrack implements ITrack {
      private _bufferSource;
      private _playingPromise: ex.Promise<any>;
      private _currentOffset = 0;
      private _isPlaying = false;
      private _isPaused = false;
      private _startTime: number;

      public isPlaying() {
         return this._isPlaying;
      }

      constructor(
         private _context, 
         private _buffer, 
         private _loop: boolean,
         private _volume) {

      }

      public setLoop(value: boolean) {
         this._loop = value;
         this._bufferSource.loop = value;
         this._wireUpOnEnded();
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
         this._bufferSource = this._context.createBufferSource();
         this._bufferSource.buffer = this._buffer;
         this._bufferSource.loop = this._loop;
         this._bufferSource.playbackRate.value = 1.0;
         this._bufferSource.connect(this._volume);
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