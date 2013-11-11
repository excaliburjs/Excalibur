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

/// <reference path="Core.ts" />
/// <reference path="Loader.ts" />

module Drawing{

   export interface IDrawable{
      setScale(scale: number);
      setRotation(radians: number);
      reset();
      draw(ctx: CanvasRenderingContext2D, x: number, y: number);
   }

   export class SpriteSheet {
      public sprites : Sprite[] = [];
      private internalImage : HTMLImageElement;

      constructor(public image : PreloadedImage, private columns: number, private rows: number, spWidth: number, spHeight: number){
         this.internalImage = image.image;
         this.sprites = new Array(columns*rows);

         // TODO: Inspect actual image dimensions with preloading
         /*if(spWidth * columns > this.internalImage.naturalWidth){
            throw new Error("SpriteSheet specified is wider than image width");
         }

         if(spHeight * rows > this.internalImage.naturalHeight){
            throw new Error("SpriteSheet specified is higher than image height");
         }*/

         var i = 0;
         var j = 0;
         for(i = 0; i < rows; i++){
            for(j = 0; j < columns; j++){
               this.sprites[j+i*columns] = new Sprite(this.image, j*spWidth, i*spHeight, spWidth, spHeight);
            }
         }
      }
      
      public getAnimationByIndices(engine: Engine, indices: number[], speed : number){
         var images : Sprite[] = this.sprites.filter(function(sprite, index){
            return indices.indexOf(index) > -1;
         });
         return new Animation(engine, images, speed);
      }

      public getAnimationBetween(engine: Engine, beginIndex : number, endIndex : number, speed : number){
         var images = this.sprites.slice(beginIndex, endIndex);
         return new Animation(engine, images, speed);
      }

      public getAnimationForAll(engine: Engine, speed : number){
         return new Animation(engine, this.sprites, speed);
      }

      public getSprite(index : number) : Sprite{
         if(index >= 0 && index < this.sprites.length){
            return this.sprites[index];
         }
      }
   }

   export class SpriteFont extends SpriteSheet {
      private spriteLookup : {[key:string] : Sprite;} = {};
      constructor(public image : PreloadedImage, private alphabet : string, private caseInsensitive : boolean, columns : number, rows : number, spWidth : number, spHeight : number){
         super(image, columns, rows, spWidth, spHeight);
         for(var i = 0; i < alphabet.length; i++){
            var char = alphabet[i];
            if(caseInsensitive){
               char = char.toLowerCase();
            }
            this.spriteLookup[char] = this.sprites[i];
         }
      }

      public draw(ctx : CanvasRenderingContext2D, x : number, y : number, text : string){
         var currX = x;
         for(var i = 0; i < text.length; i++){
            var char = text[i];
            if(this.caseInsensitive){
               char = char.toLowerCase();
            }
            try{
               var charSprite = this.spriteLookup[char];
               charSprite.draw(ctx, currX, y);
            }catch(e){
               Logger.getInstance().log("SpriteFont Error drawing char " + char, Log.ERROR);
            }
            currX += charSprite.swidth;

         }
      }
   }

   export class Sprite implements IDrawable {
      private internalImage : HTMLImageElement;
      private scale: number = 1.0;
      private rotation: number = 0.0;
      constructor(image: PreloadedImage, public sx: number, public sy:number, public swidth: number, public sheight : number){
         this.internalImage = image.image;
      }

      public setRotation(radians : number){
         this.rotation = radians;
      }

      public setScale(scale : number){
         this.scale = scale;
      }
      public reset(){
         // do nothing
      }

      public draw(ctx: CanvasRenderingContext2D, x: number, y: number){
         ctx.drawImage(this.internalImage, this.sx, this.sy, this.swidth, this.sheight, x, y, this.swidth*this.scale, this.sheight*this.scale);
      }
   }

   export enum AnimationType {
      CYCLE, // default
      PINGPONG,
      ONCE
   }

   export class Animation implements IDrawable {
      private sprites : Sprite[];
      private speed : number;
      private currIndex : number = 0;
      private oldTime : number = Date.now();
      private rotation : number = 0.0;
      private scale : number = 1.0;
      public loop : boolean = false;
      private engine : Engine;

      constructor(engine : Engine, images: Sprite[], speed: number, loop? : boolean){
         this.sprites = images;
         this.speed = speed;
         this.engine = engine;
         if(loop != null){
            this.loop = loop;
         }
      }

      public setRotation(radians: number){
         this.rotation = radians;
         for(var i in this.sprites){
            this.sprites[i].setRotation(radians);
         }
      }

      public setScale(scale: number){
         this.scale = scale;
         for(var i in this.sprites){
            this.sprites[i].setScale(scale);
         }
      }

      public reset(){
         this.currIndex = 0;
      }

      public isDone(){
         return (!this.loop && this.currIndex >= this.sprites.length);
      }

      public tick(){
         var time = Date.now();
         if((time - this.oldTime) > this.speed){
            this.currIndex = (this.loop?(this.currIndex + 1) % this.sprites.length: this.currIndex + 1);
            this.oldTime = time;
         }
      }

      public draw(ctx: CanvasRenderingContext2D, x: number, y: number){
         this.tick();
         if(this.currIndex < this.sprites.length){
            this.sprites[this.currIndex].draw(ctx, x, y);
         }
      }

      public play (x : number, y : number){
         this.reset();
         this.engine.playAnimation(this, x, y);
      }
   }
}