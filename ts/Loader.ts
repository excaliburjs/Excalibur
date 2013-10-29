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

interface ILoadable {
   begin(func? : (e : any) => void); // begin loading
   onprogress : (e : any) => void;
   oncomplete : () => void;
   onerror : (e : any) => void;
}

class PreloadedImage implements ILoadable {
   public width : number;
   public height : number;
   public image : HTMLImageElement;

   private progressCallback : (progress : number, total : number) => void
   private doneCallback : () => void;
   private errorCallback : (e : string) => void;

   constructor(public path: string){    
   }

   private _start(e : any){
      console.log("Started loading image " + this.path, e);
   }

   private base64Encode(inputStr : string){
      var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      var outputStr = "";
      var i = 0;
      
      while (i < inputStr.length)
      {
          //all three "& 0xff" added below are there to fix a known bug 
          //with bytes returned by xhr.responseText
          var byte1 = inputStr.charCodeAt(i++) & 0xff;
          var byte2 = inputStr.charCodeAt(i++) & 0xff;
          var byte3 = inputStr.charCodeAt(i++) & 0xff;
   
          var enc1 = byte1 >> 2;
          var enc2 = ((byte1 & 3) << 4) | (byte2 >> 4);
          
          var enc3, enc4;
          if (isNaN(byte2))
          {
              enc3 = enc4 = 64;
          }
          else
          {
              enc3 = ((byte2 & 15) << 2) | (byte3 >> 6);
              if (isNaN(byte3))
              {
                  enc4 = 64;
              }
              else
              {
                  enc4 = byte3 & 63;
              }
          }
   
          outputStr += b64.charAt(enc1) + b64.charAt(enc2) + b64.charAt(enc3) + b64.charAt(enc4);
       } 
      
       return outputStr;
   }

   public begin(func? : (e : any)=>void){
      this.image = new Image();
      var request = new XMLHttpRequest();
      request.onloadstart = (e) => {this._start(e)};
      request.onprogress = this.onprogress;
      request.onload = (e) => {this.image.src = "data:image/jpeg;base64," + this.base64Encode(request.responseText);this.oncomplete()};
      request.onerror = (e) => {this.onerror(e);};
      request.open("GET", this.path, true);
      request.overrideMimeType('text/plain; charset=x-user-defined'); 
      request.send();
     
   }

   public onprogress : (e : any) => void = () => {};

   public oncomplete : () => void = () => {};

   public onerror : (e : any) => void = () => {};
}

class PreloadedSound implements ILoadable {
   public onprogress : (e : any) => void = () => {};

   public oncomplete : () => void = () => {};

   public onerror : (e : any) => void = () => {};

   public sound : Media.Sound;

   constructor(public path : string){
      this.sound = new Media.Sound(path, 1.0);
   }

   public begin(){
      this.sound.onprogress = this.onprogress;
      this.sound.onload = this.oncomplete;
      this.sound.onerror = this.onerror;
      this.sound.load();
   }
}


class Loader implements ILoadable {

   private resources : {[key: string] : number;} = {}
   private resourceList : ILoadable[] = [];
   private index = 0;
   
   private resourceCount : number = 0;
   private numLoaded : number = 0;
   private progressCounts : {[key: string] : number;} = {};
   private totalCounts : {[key: string] : number;} = {};

   constructor(){

   }

   public addResource(key : string, loadable : ILoadable){
      this.resources[key] = this.index++;
      this.resourceList.push(loadable);
      this.progressCounts[key] = 0;
      this.totalCounts[key] = 1;
      this.resourceCount++;
   }

   public getResource(key : string) : ILoadable {
      return this.resourceList[this.resources[key]];
   }

   private sumCounts(obj) : number {
      var sum = 0;
      var vals = Object.keys(obj).forEach(function (key) {
        sum += obj[key];
      });
      return sum;
   }

  
   
   public begin(){      
      var me = this;
      this.resourceList.forEach((r, i) => {
        r.onprogress = function(e){
           var total = <number>e.total;
           var progress = <number>e.loaded;
           console.log('Inside progress '+ i);
           me.progressCounts[i] = progress;
           me.totalCounts[i] = total;
           me.onprogress.call(me, {loaded : me.sumCounts(me.progressCounts), total: me.sumCounts(me.totalCounts)});
        };
        r.oncomplete = function(){
           me.numLoaded++;
           if(me.numLoaded == me.resourceCount){
              me.oncomplete.call(me);
           }
        };
        r.begin();
      });
   }

   public onprogress : (e : any) => void = () => {};

   public oncomplete : ()=>void = () => {};

   public onerror : () => void = () => {};


}