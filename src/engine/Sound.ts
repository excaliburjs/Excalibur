/// <reference path="MonkeyPatch.ts" />
/// <reference path="Util.ts" />
/// <reference path="Log.ts" />

module ex.Internal {
   export interface ISound {
      setVolume(volume: number);
      setLoop(loop: boolean);
      play();
      stop();
      load();
      onload: (e: any) => void;
      onprogress: (e: any) => void;
      onerror: (e: any) => void;

   }

   export class FallbackAudio implements ISound {
      private _soundImpl: ISound;
      private _log: Logger = Logger.getInstance();
      constructor(path: string, volume?: number) {
         if ((<any>window).AudioContext) {
            this._log.debug("Using new Web Audio Api for " + path);
            this._soundImpl = new WebAudio(path, volume);
         } else {
            this._log.debug("Falling back to Audio Element for " + path);
            this._soundImpl = new AudioTag(path, volume);
         }
      }

      public setVolume(volume: number) {
         this._soundImpl.setVolume(volume);
      }

      setLoop(loop: boolean) {
         this._soundImpl.setLoop(loop);
      }

      public onload: (e: any) => void = () => { };
      public onprogress: (e: any) => void = () => { };
      public onerror: (e: any) => void = () => { };

      public load() {
         this._soundImpl.onload = this.onload;
         this._soundImpl.onprogress = this.onprogress;
         this._soundImpl.onerror = this.onerror;
         this._soundImpl.load();
      }

      public play() {
         this._soundImpl.play();
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
      constructor(public path: string, volume?: number) {
         for (var i = 0; i < this._audioElements.length; i++){
            ((i)=>{
               this._audioElements[i] = new Audio();
            })(i);
         }
         
         this.setVolume(volume || 1.0);
      }

      private _audioLoaded() {
         this._isLoaded = true;
      }

      public setVolume(volume: number) {
         this._audioElements.forEach((a)=>{
            a.volume = volume;
         });
      }

      public setLoop(loop: boolean) {
         this._audioElements.forEach((a)=>{
            a.loop = loop;
         });         
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
               this._log.error("Failed to load audio resource ", this.path, " server responded with error code", request.status);
               this.onerror(request.response);
               this._isLoaded = false;
               return;
            }

            this._loadedAudio = URL.createObjectURL(request.response);
            this._audioElements.forEach((a)=>{
               a.src = this._loadedAudio;
            });
            this.onload(e) 
         };
         request.send();
      }

      public play() {
         this._audioElements[this._index].load();
         this._audioElements[this._index].play();
         this._index = (this._index + 1) % this._audioElements.length;
      }

      public stop() {
         this._audioElements.forEach((a)=>{
            a.pause();
         });
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
      private _path = "";
      private _isLoaded = false;
      private _loop = false;
      private _logger: Logger = Logger.getInstance();
      constructor(soundPath: string, volume?: number) {
         this._path = soundPath;
         if (volume) {
            this._volume.gain.value = volume;
         } else {
            this._volume.gain.value = 1; // max volume
         }

      }

      public setVolume(volume: number) {
         this._volume.gain.value = volume;
      }

      public onload: (e: any) => void = () => { };
      public onprogress: (e: any) => void = () => { };
      public onerror: (e: any) => void = () => { };

      public load() {
         var request = new XMLHttpRequest();
         request.open('GET', this._path);
         request.responseType = 'arraybuffer';
         request.onprogress = this.onprogress;
         request.onerror = this.onerror;
         request.onload = () => {
            if(request.status !== 200){
               this._logger.error("Failed to load audio resource ", this._path, " server responded with error code", request.status);
               this.onerror(request.response);
               this._isLoaded = false;
               return;
            }

            this._context.decodeAudioData(request.response,
               (buffer) => {
                  this._buffer = buffer;
                  this._isLoaded = true;
                  this.onload(this);
               },
               (e) => {
                  this._logger.error("Unable to decode " + this._path +
                     " this browser may not fully support this format, or the file may be corrupt, " +
                     "if this is an mp3 try removing id3 tags and album art from the file.");
                  this._isLoaded = false;
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
         this._loop = loop;
      }



      public play() {
         if (this._isLoaded) {
            this._sound = this._context.createBufferSource();
            this._sound.buffer = this._buffer;
            this._sound.loop = this._loop;
            this._sound.connect(this._volume);
            this._volume.connect(this._context.destination);
            this._sound.start(0);
         }
      }

      public stop() {
         if (this._sound) {
            try {
               this._sound.stop(0);
            } catch(e) {
               this._logger.warn("The sound clip", this._path, "has already been stopped!");
            }
         }
      }
   }
}