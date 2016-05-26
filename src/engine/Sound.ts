/// <reference path="MonkeyPatch.ts" />
/// <reference path="Util/Util.ts" />
/// <reference path="Util/Log.ts" />

module ex.Internal {
   
   export interface ISound {
      setVolume(volume: number);
      setLoop(loop: boolean);
      isPlaying(): boolean;
      play(): ex.Promise<any>;
      pause();
      stop();
      load();
      setData(data: any);
      getData(): any;
      processData(data: any): any;
      onload: (e: any) => void;
      onprogress: (e: any) => void;
      onerror: (e: any) => void;
      path: string;
   }

   export class FallbackAudio implements ISound {
      private _soundImpl: ISound;
      private _log: Logger = Logger.getInstance();
      constructor(public path: string, volume?: number) {
         if ((<any>window).AudioContext) {
            this._log.debug('Using new Web Audio Api for ' + path);
            this._soundImpl = new WebAudio(path, volume);
         } else {
            this._log.debug('Falling back to Audio Element for ' + path);
            this._soundImpl = new AudioTag(path, volume);
         }
      }

      public setVolume(volume: number) {
         this._soundImpl.setVolume(volume);
      }

      public setLoop(loop: boolean) {
         this._soundImpl.setLoop(loop);
      }

      public onload: (e: any) => void = () => { return; };
      public onprogress: (e: any) => void = () => { return; };
      public onerror: (e: any) => void = () => { return; };

      public load() {
         this._soundImpl.onload = this.onload;
         this._soundImpl.onprogress = this.onprogress;
         this._soundImpl.onerror = this.onerror;
         this._soundImpl.load();
      }
      
      public processData(data: any): any {
         return this._soundImpl.processData(data);
      }
      
      public getData(): any {
         return this._soundImpl.getData();
      }
      
      public setData(data: any) {
         this._soundImpl.setData(data);
      }

      public isPlaying(): boolean {
         return this._soundImpl.isPlaying();
      }

      public play(): ex.Promise<any> {
         return this._soundImpl.play();
      }

      public pause() {
         this._soundImpl.pause();
      }

      public stop() {
         this._soundImpl.stop();
      }
   }

   export class AudioTag implements ISound {
      private _audioElements: HTMLAudioElement[] = new Array<HTMLAudioElement>(5);
      private _loadedAudio: string = null;
      private _isLoaded = false;
      private _index = 0;
      private _log: Logger = Logger.getInstance();
      private _isPlaying = false;
      private _playingTimer: number;
      private _currentOffset: number = 0;

      constructor(public path: string, volume?: number) {
         for(var i = 0; i < this._audioElements.length; i++) {
            ((i) => {
               this._audioElements[i] = new Audio();
            })(i);
         }
         if (volume) {
            this.setVolume(Util.clamp(volume, 0, 1.0));
         } else {
            this.setVolume(1.0);
         }
      }

      public isPlaying(): boolean {
         return this._isPlaying;
      }

      private _audioLoaded() {
         this._isLoaded = true;
      }

      public setVolume(volume: number) {

         var i = 0, len = this._audioElements.length;

         for (i; i < len; i++) {
            this._audioElements[i].volume = volume;
         }
      }

      public setLoop(loop: boolean) {
         var i = 0, len = this._audioElements.length;

         for (i; i < len; i++) {
            this._audioElements[i].loop = loop;
         }      
      }

      public getLoop() {
         this._audioElements.some((a) => a.loop);
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
            if(request.status !== 200) {
               this._log.error('Failed to load audio resource ', this.path, ' server responded with error code', request.status);
               this.onerror(request.response);
               this._isLoaded = false;
               return;
            }
            
            this._isLoaded = true;
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
         
         this._audioElements.forEach((a) => {
            a.src = blobUrl;
         });
         this._audioLoaded();
         return blobUrl;
      }

      public play(): Promise<any> {
         this._audioElements[this._index].load();
         //this.audioElements[this.index].currentTime = this._currentOffset;
         this._audioElements[this._index].play();
         this._currentOffset = 0;


         var done = new ex.Promise();
         this._isPlaying = true;
         if (!this.getLoop()) {
            this._audioElements[this._index].addEventListener('ended', () => {
               this._isPlaying = false;
               done.resolve(true);
            });

         }

         this._index = (this._index + 1) % this._audioElements.length;
         return done;
      }

      public pause() {
         this._index = (this._index - 1 + this._audioElements.length) % this._audioElements.length;
         this._currentOffset = this._audioElements[this._index].currentTime;
         this._audioElements.forEach((a) => {
            a.pause();
         });
         this._isPlaying = false;
      }

      public stop() {
         this._audioElements.forEach((a) => {
            a.pause();
            //a.currentTime = 0;
         });
         this._isPlaying = false;
      }

   }

   if ((<any>window).AudioContext) {
      var audioContext: any = new (<any>window).AudioContext();
   }

   export class WebAudio implements ISound {
      private _context = audioContext;
      private _volume = this._context.createGain();
      private _buffer = null;
      private _sound = null;
      private _isLoaded = false;
      private _loop = false;
      private _isPlaying = false;
      private _isPaused = false;
      private _playingTimer: number;
      private _currentOffset: number = 0;
      private _playPromise: ex.Promise<any>;

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
            if(request.status !== 200) {
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
      }

      public isPlaying(): boolean {
         return this._isPlaying;
      }

      public play(): Promise<any> {

         if (this._isLoaded) {
            this._sound = this._context.createBufferSource();
            this._sound.buffer = this._buffer;
            this._sound.loop = this._loop;
            this._sound.connect(this._volume);
            this._volume.connect(this._context.destination);
            this._sound.start(0, this._currentOffset % this._buffer.duration);
            
            this._currentOffset = 0;
            var done;
            if (!this._isPaused || !this._playPromise) {
               done = new ex.Promise();
            } else {
               done = this._playPromise;
            }
            this._isPaused = false;
            
            this._isPlaying = true;
            if (!this._loop) {

               this._sound.onended = (() => {
                  this._isPlaying = false;
                  if (!this._isPaused) {
                     done.resolve(true);
                  }
               }).bind(this);
            }

            this._playPromise = done;
            return done;
         } else {
            return Promise.wrap(true);
         }
      }

      public pause() {
         if (this._isPlaying) {
            try {
               window.clearTimeout(this._playingTimer);
               this._sound.stop(0);
               this._currentOffset = this._context.currentTime;
               this._isPlaying = false;
               this._isPaused = true;
            } catch (e) {
               this._logger.warn('The sound clip', this.path, 'has already been paused!');
            }
         }
      }

      public stop() {
         if (this._sound) {
            try {
               window.clearTimeout(this._playingTimer);
               this._currentOffset = 0;
               this._sound.stop(0);
               this._isPlaying = false;
               this._isPaused = false;
            } catch(e) {
               this._logger.warn('The sound clip', this.path, 'has already been stopped!');
            }
         }
      }
      
      private static _unlocked: boolean = false;
      
      /**
       * Play an empty sound to unlock Safari WebAudio context. Call this function
       * right after a user interaction event. Typically used by [[PauseAfterLoader]]
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
            if((source.playbackState === source.PLAYING_STATE || source.playbackState === source.FINISHED_STATE)) {
                this._unlocked = true;
            }
        }, 0);

      }
      
      static isUnlocked() {
          return this._unlocked;
      }
   }
}