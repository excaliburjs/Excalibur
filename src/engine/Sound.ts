/// <reference path="MonkeyPatch.ts" />
/// <reference path="Util.ts" />
/// <reference path="Log.ts" />

module ex.Internal {
   export interface ISound {
      setVolume(volume: number);
      setLoop(loop: boolean);
      isPlaying():boolean;
      play(): ex.Promise<any>;
      pause();
      stop();
      load();
      onload: (e: any) => void;
      onprogress: (e: any) => void;
      onerror: (e: any) => void;

   }

   export class FallbackAudio implements ISound {
      private soundImpl: ISound;
      private log: Logger = Logger.getInstance();
      constructor(path: string, volume?: number) {
         if ((<any>window).AudioContext) {
            this.log.debug("Using new Web Audio Api for " + path);
            this.soundImpl = new WebAudio(path, volume);
         } else {
            this.log.debug("Falling back to Audio Element for " + path);
            this.soundImpl = new AudioTag(path, volume);
         }
      }

      public setVolume(volume: number) {
         this.soundImpl.setVolume(volume);
      }

      setLoop(loop: boolean) {
         this.soundImpl.setLoop(loop);
      }

      public onload: (e: any) => void = () => { };
      public onprogress: (e: any) => void = () => { };
      public onerror: (e: any) => void = () => { };

      public load() {
         this.soundImpl.onload = this.onload;
         this.soundImpl.onprogress = this.onprogress;
         this.soundImpl.onerror = this.onerror;
         this.soundImpl.load();
      }

      public isPlaying(): boolean {
         return this.soundImpl.isPlaying();
      }

      public play(): ex.Promise<any> {
         return this.soundImpl.play();
      }

      public pause() {
         this.soundImpl.pause();
      }

      public stop() {
         this.soundImpl.stop();
      }
   }

   export class AudioTag implements ISound {
      private audioElements: HTMLAudioElement[] = new Array<HTMLAudioElement>(5);
      private _loadedAudio: string = null;
      private isLoaded = false;
      private index = 0;
      private log: Logger = Logger.getInstance();
      private _isPlaying = false;
      private _playingTimer: number;
      private _currentOffset: number = 0;

      constructor(public path: string, volume?: number) {
         for(var i = 0; i < this.audioElements.length; i++){
            ((i)=>{
               this.audioElements[i] = new Audio();
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

      private audioLoaded() {
         this.isLoaded = true;
      }

      public setVolume(volume: number) {
         this.audioElements.forEach((a)=>{
            a.volume = volume;
         });
      }

      public setLoop(loop: boolean) {
         this.audioElements.forEach((a)=>{
            a.loop = loop;
         });         
      }

      public getLoop() {
         this.audioElements.some((a) => a.loop);
      }

      public onload: (e: any) => void = () => { };
      public onprogress: (e: any) => void = () => { };
      public onerror: (e: any) => void = () => { };

      public load() {
         var request = new XMLHttpRequest();
         request.open("GET", this.path, true);
         request.responseType = 'blob';
         request.onprogress = this.onprogress;
         request.onerror = this.onerror;
         request.onload = (e) => { 
            if(request.status !== 200){
               this.log.error("Failed to load audio resource ", this.path, " server responded with error code", request.status);
               this.onerror(request.response);
               this.isLoaded = false;
               return;
            }

            this._loadedAudio = URL.createObjectURL(request.response);
            this.audioElements.forEach((a)=>{
               a.src = this._loadedAudio;
            });
            this.onload(e);
         };
         request.send();
      }

      public play(): Promise<any> {
         this.audioElements[this.index].load();
         this.audioElements[this.index].currentTime = this._currentOffset;
         this.audioElements[this.index].play();
         this._currentOffset = 0;


         var done = new ex.Promise();
         this._isPlaying = true;
         if (!this.getLoop()) {
            this.audioElements[this.index].addEventListener('ended', () => {
               this._isPlaying = false;
               done.resolve(true);
            });

         }


         this.index = (this.index + 1) % this.audioElements.length;
         return done;
      }

      public pause() {
         this.index = (this.index - 1 + this.audioElements.length) % this.audioElements.length;
         this._currentOffset = this.audioElements[this.index].currentTime;
         this.audioElements.forEach((a) => {
            a.pause();
         });
         this._isPlaying = false;
      }

      public stop() {
         this.audioElements.forEach((a)=>{
            a.pause();
            a.currentTime = 0;
         });
         this._isPlaying = false;
      }

   }

   if ((<any>window).AudioContext) {
      var audioContext: any = new (<any>window).AudioContext();
   }

   export class WebAudio implements ISound {
      private context = audioContext;
      private volume = this.context.createGain();
      private buffer = null;
      private sound = null;
      private path = "";
      private isLoaded = false;
      private loop = false;
      private _isPlaying = false;
      private _isPaused = false;
      private _playingTimer: number;
      private _currentOffset: number = 0;
      private _playPromise: ex.Promise<any>;

      private logger: Logger = Logger.getInstance();



      constructor(soundPath: string, volume?: number) {
         this.path = soundPath;
         if (volume) {
            this.volume.gain.value = Util.clamp(volume, 0, 1.0);
         } else {
            this.volume.gain.value = 1.0; // max volume
         }

      }

      public setVolume(volume: number) {
         this.volume.gain.value = volume;
      }

      public onload: (e: any) => void = () => { };
      public onprogress: (e: any) => void = () => { };
      public onerror: (e: any) => void = () => { };

      public load() {
         var request = new XMLHttpRequest();
         request.open('GET', this.path);
         request.responseType = 'arraybuffer';
         request.onprogress = this.onprogress;
         request.onerror = this.onerror;
         request.onload = () => {
            if(request.status !== 200){
               this.logger.error("Failed to load audio resource ", this.path, " server responded with error code", request.status);
               this.onerror(request.response);
               this.isLoaded = false;
               return;
            }

            this.context.decodeAudioData(request.response,
               (buffer) => {
                  this.buffer = buffer;
                  this.isLoaded = true;
                  this.onload(this);
               },
               (e) => {
                  this.logger.error("Unable to decode " + this.path +
                     " this browser may not fully support this format, or the file may be corrupt, " +
                     "if this is an mp3 try removing id3 tags and album art from the file.");
                  this.isLoaded = false;
                  this.onload(this);
               });
         }
         try {
            request.send();
         } catch (e) {
            console.error("Error loading sound! If this is a cross origin error, you must host your sound with your html and javascript.");
         }
      }

      public setLoop(loop: boolean) {
         this.loop = loop;
      }

      public isPlaying(): boolean {
         return this._isPlaying;
      }

      public play(): Promise<any> {

         if (this.isLoaded) {
            this.sound = this.context.createBufferSource();
            this.sound.buffer = this.buffer;
            this.sound.loop = this.loop;
            this.sound.connect(this.volume);
            this.volume.connect(this.context.destination);
            this.sound.start(0, this._currentOffset % this.buffer.duration);
            
            this._currentOffset = 0;
            var done;
            if (!this._isPaused || !this._playPromise) {
               done = new ex.Promise();
            } else {
               done = this._playPromise;
            }
            this._isPaused = false;
            
            this._isPlaying = true;
            if (!this.loop) {

               this.sound.onended = (() => {
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
               this.sound.stop(0);
               this._currentOffset = this.context.currentTime;
               this._isPlaying = false;
               this._isPaused = true;
            } catch (e) {
               this.logger.warn("The sound clip", this.path, "has already been paused!");
            }
         }
      }

      public stop() {
         if (this.sound) {
            try {
               window.clearTimeout(this._playingTimer);
               this._currentOffset = 0;
               this.sound.stop(0);
               this._isPlaying = false;
               this._isPaused = false;
            } catch(e) {
               this.logger.warn("The sound clip", this.path, "has already been stopped!");
            }
         }
      }
   }
}