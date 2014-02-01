/// <reference path="Sound.ts" />
/// <reference path="Util.ts" />
/// <reference path="Promises.ts" />

module ex {
   export interface ILoadable {
      load(): Promise<any>;
      onprogress: (e: any) => void;
      oncomplete: () => void;
      onerror: (e: any) => void;
   }

   export class Texture implements ILoadable {
      public width: number;
      public height: number;
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

   export class Sound implements ILoadable, ex.Internal.ISound {
      public onprogress: (e: any) => void = () => { };

      public oncomplete: () => void = () => { };

      public onerror: (e: any) => void = () => { };

      public onload: (e: any) => void = () => { };

      public sound: ex.Internal.FallbackAudio;

      constructor(public path: string, volume?: number) {
         this.sound = new ex.Internal.FallbackAudio(path, volume || 1.0);
      }

      public setVolume(volume: number) {
         if (this.sound) this.sound.setVolume(volume);
      }
      public setLoop(loop: boolean) {
         if (this.sound) this.sound.setLoop(loop);
      }
      public play() {
         if (this.sound) this.sound.play();
      }

      public stop() {
         if (this.sound) this.sound.stop();
      }

      public load(): Promise<ex.Internal.FallbackAudio> {
         var complete = new Promise<ex.Internal.FallbackAudio>();

         this.sound.onprogress = this.onprogress;
         this.sound.onload = () => {
            this.oncomplete();
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

      public addResource(loadable: ILoadable) {
         var key = this.index++;
         this.resourceList.push(loadable);
         this.progressCounts[key] = 0;
         this.totalCounts[key] = 1;
         this.resourceCount++;
      }

      public addResources(loadables: ILoadable[]) {
         loadables.forEach((l) => {
            this.addResource(l);
         });
      }

      private sumCounts(obj): number {
         var sum = 0;
         for (var i in obj) {
            sum += obj[i] | 0;
         }
         return sum;
      }



      public load(): Promise<any> {
         var complete = new Promise<any>();
         var me = this;
         if (this.resourceList.length === 0) {
            me.oncomplete.call(me);
            return complete;
         }
         this.resourceList.forEach((r, i) => {
            r.onprogress = function (e) {
               var total = <number>e.total;
               var progress = <number>e.loaded;
               me.progressCounts[i] = progress;
               me.totalCounts[i] = total;
               me.onprogress.call(me, { loaded: me.sumCounts(me.progressCounts), total: me.sumCounts(me.totalCounts) });
            };
            r.oncomplete = function () {
               me.numLoaded++;
               if (me.numLoaded === me.resourceCount) {
                  me.oncomplete.call(me);

               }
            };
            r.load();
         });

         return complete;
      }

      public onprogress: (e: any) => void = () => { };

      public oncomplete: () => void = () => { };

      public onerror: () => void = () => { };

   }
}