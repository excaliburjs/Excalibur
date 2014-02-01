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

      public play() {
         this.soundImpl.play();
      }

      public stop() {
         this.soundImpl.stop();
      }
   }

   export class AudioTag implements ISound {
      private audioElement: HTMLAudioElement;
      private isLoaded = false;
      constructor(public soundPath: string, volume?: number) {
         this.audioElement = new Audio();


         if (volume) {
            this.audioElement.volume = volume
         } else {
            this.audioElement.volume = 1.0;
         }
      }

      private audioLoaded() {
         this.isLoaded = true;
      }

      public setVolume(volume: number) {
         this.audioElement.volume = volume;
      }

      public setLoop(loop: boolean) {
         this.audioElement.loop = loop;
      }

      public onload: (e: any) => void = () => { };
      public onprogress: (e: any) => void = () => { };
      public onerror: (e: any) => void = () => { };

      public load() {
         var request = new XMLHttpRequest();
         request.open("GET", this.soundPath, true);
         request.responseType = 'blob';
         request.onprogress = this.onprogress;
         request.onload = (e) => { this.audioElement.src = URL.createObjectURL(request.response); this.onload(e) };
         request.onerror = (e) => { this.onerror(e); };
         request.send();
      }

      public play() {
         this.audioElement.play();
      }

      public stop() {
         this.audioElement.pause();
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
      private logger: Logger = Logger.getInstance();
      constructor(soundPath: string, volume?: number) {
         this.path = soundPath;
         if (volume) {
            this.volume.gain.value = volume;
         } else {
            this.volume.gain.value = 1; // max volume
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



      public play() {
         if (this.isLoaded) {
            this.sound = this.context.createBufferSource();
            this.sound.buffer = this.buffer;
            this.sound.loop = this.loop;
            this.sound.connect(this.volume);
            this.volume.connect(this.context.destination);
            this.sound.start(0);
         }
      }

      public stop() {
         if (this.sound) {
            this.sound.stop(0);
         }
      }
   }
}