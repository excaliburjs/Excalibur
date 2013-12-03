/**
Copyright (c) 2013 Erik Onarheim
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.
3. All advertising materials mentioning features or use of this software
   must display the following acknowledgement:
   This product includes software developed by the ExcaliburJS Team.
4. Neither the name of the creator nor the
   names of its contributors may be used to endorse or promote products
   derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE EXCALIBURJS TEAM ''AS IS'' AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE EXCALIBURJS TEAM BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/// <reference path="Sound.ts" />
/// <reference path="Util.ts" />
/// <reference path="Promises.ts" />

interface ILoadable {
   load() : Promise<any>;
   onprogress : (e : any) => void;
   oncomplete : () => void;
   onerror : (e : any) => void;
}

class Texture implements ILoadable {
   public width : number;
   public height : number;
   public image : HTMLImageElement;
   private logger : Logger = Logger.getInstance();

   private progressCallback : (progress : number, total : number) => void
   private doneCallback : () => void;
   private errorCallback : (e : string) => void;

   constructor(public path: string){    
   }

   private _start(e : any){
      this.logger.log("Started loading image " + this.path, Log.DEBUG);
   }

   
   public load() : Promise<HTMLImageElement>{
      var complete = new Promise();

      this.image = new Image();
      var request = new XMLHttpRequest();
      request.open("GET", this.path, true);
      request.responseType = "blob";
      request.onloadstart = (e) => {this._start(e)};
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
      if(request.overrideMimeType) {
         request.overrideMimeType('text/plain; charset=x-user-defined'); 
      }
      request.send();

      return complete;     
   }

   public onprogress : (e : any) => void = () => {};

   public oncomplete : () => void = () => {};

   public onerror : (e : any) => void = () => {};
}

class Sound implements ILoadable, Media.ISound {
   public onprogress : (e : any) => void = () => {};

   public oncomplete : () => void = () => {};

   public onerror : (e : any) => void = () => {};

   public onload : (e : any) => void = () => {};

   public sound : Media.FallbackAudio;

   constructor(public path : string, volume? : number){
      this.sound = new Media.FallbackAudio(path, volume || 1.0);
   }

   public setVolume(volume : number){
      if(this.sound) this.sound.setVolume(volume);
   }
   public setLoop(loop : boolean){
      if(this.sound) this.sound.setLoop(loop);
   }
   public play(){
      if(this.sound) this.sound.play();
   }
      
   public stop(){
      if(this.sound) this.sound.stop();
   }      

   public load() : Promise<Media.FallbackAudio>{
      var complete = new Promise<Media.FallbackAudio>();

      this.sound.onprogress = this.onprogress;
      this.sound.onload = ()=>{
        this.oncomplete();
        complete.resolve(this.sound);
      }
      this.sound.onerror = (e)=>{
        this.onerror(e);
        complete.reject(e);
      }
      this.sound.load();
      return complete;
   }
}

class Loader implements ILoadable {
   private resourceList : ILoadable[] = [];
   private index = 0;
   
   private resourceCount : number = 0;
   private numLoaded : number = 0;
   private progressCounts : {[key: string] : number;} = {};
   private totalCounts : {[key: string] : number;} = {};

   constructor(loadables? : ILoadable[]){
      if(loadables){
         this.addResources(loadables);
      }
   }

   public addResource(loadable : ILoadable){
      var key = this.index++;
      this.resourceList.push(loadable);
      this.progressCounts[key] = 0;
      this.totalCounts[key] = 1;
      this.resourceCount++;
   }

   public addResources(loadables : ILoadable[]){
      loadables.forEach((l)=>{
        this.addResource(l);
      });
   }

   private sumCounts(obj) : number {
      var sum = 0;
      for(var i in obj){
        sum += obj[i] | 0;
      }
      return sum;
   }

  
   
   public load() : Promise<any>{      
      var complete = new Promise<any>();
      var me = this;
      if(this.resourceList.length === 0){
         me.oncomplete.call(me);
         return complete;
      }
      this.resourceList.forEach((r, i) => {
        r.onprogress = function(e){
           var total = <number>e.total;
           var progress = <number>e.loaded;
           me.progressCounts[i] = progress;
           me.totalCounts[i] = total;
           me.onprogress.call(me, {loaded : me.sumCounts(me.progressCounts), total: me.sumCounts(me.totalCounts)});
        };
        r.oncomplete = function(){
           me.numLoaded++;
           if(me.numLoaded === me.resourceCount){
              me.oncomplete.call(me);

           }
        };
        r.load();
      });

      return complete;
   }

   public onprogress : (e : any) => void = () => {};

   public oncomplete : ()=>void = () => {};

   public onerror : () => void = () => {};

}