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
   This product includes software developed by the GameTS Team.
4. Neither the name of the creator nor the
   names of its contributors may be used to endorse or promote products
   derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE GAMETS TEAM ''AS IS'' AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE GAMETS TEAM BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

module Drawing{

   export interface IDrawable{
      setScale(scale: number);
      setRotation(radians: number);
      draw(ctx: CanvasRenderingContext2D, x: number, y: number);
   }

   export class SpriteSheet {
      public sprites : Sprite[] = [];
      private internalImage : HTMLImageElement;
      constructor(public path: string, private columns: number, private rows: number, spWidth: number, spHeight: number){
         this.internalImage = new Image();
         this.internalImage.src = path;
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
               this.sprites[j+i*columns] = new Sprite(this.internalImage, j*spWidth, i*spHeight, spWidth, spHeight);
            }
         }
      }

      getAnimationForRow(rowIndex: number, start: number, count: number, speed: number){
         var begin = start+rowIndex*this.columns;
         return new Animation(this.sprites.slice(begin,begin+count), speed);
      }

      getAnimationByIndices(indices: number[], speed: number){
         var images : Sprite[] = this.sprites.filter(function(sprite, index){
            return indices.indexOf(index) > -1;
         });
         return new Animation(images, speed);
      }
   }

   export class SpriteFont extends SpriteSheet {
      private spriteLookup : {[key:string] : Sprite;} = {};
      constructor(public path : string, private alphabet : string, private caseInsensitive : boolean, columns : number, rows : number, spWidth : number, spHeight : number){
         super(path, columns, rows, spWidth, spHeight);
         for(var i = 0; i < alphabet.length; i++){
            var char = alphabet[i];
            if(caseInsensitive){
               char = char.toLowerCase();
            }
            this.spriteLookup[char] = this.sprites[i];
         }
      }

      draw(ctx : CanvasRenderingContext2D, x : number, y : number, text : string){
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
   	constructor(image: HTMLImageElement, public sx: number, public sy:number, public swidth: number, public sheight : number){
         this.internalImage = image;
   	}

      setRotation(radians : number){
         this.rotation = radians;
      }

      setScale(scale : number){
         this.scale = scale;
      }

      draw(ctx: CanvasRenderingContext2D, x: number, y: number){
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
      private maxIndex : number;
      private currIndex : number = 0;
      private oldTime : number = Date.now();
      private rotation : number = 0.0;
      private scale : number = 1.0;
      public type : AnimationType = AnimationType.CYCLE;

      private direction : number = 1;

   	constructor(images: Sprite[], speed: number){
   		this.sprites = images;
         this.speed = speed;
         this.maxIndex = images.length;
   	}

      setRotation(radians: number){
         this.rotation = radians;
         for(var i in this.sprites){
            this.sprites[i].setRotation(radians);
         }
      }

      setScale(scale: number){
         this.scale = scale;
         for(var i in this.sprites){
            this.sprites[i].setScale(scale);
         }
      }

      private cycle(){
         var time = Date.now();
         if((time - this.oldTime) > this.speed){
            this.currIndex = (this.currIndex + 1) % this.maxIndex;
            this.oldTime = time;
         }
      }

      private pingpong(){
         var time = Date.now();
         if((time - this.oldTime) > this.speed){
            if(this.currIndex + this.direction === this.maxIndex || this.currIndex + this.direction === -1){
               this.direction = -1 * this.direction;
            }
            this.currIndex += this.direction;

            this.oldTime = time;
         }
      }

      private once(){
         var time = Date.now();
         if((time - this.oldTime) > this.speed){
            if(this.currIndex + 1 < this.maxIndex){
               this.currIndex++;
            }
            this.oldTime = time;
         }
      }

      reset(){
         this.currIndex = 0;
         this.direction = 1;
      }

      tick(){
         if(this.type === AnimationType.CYCLE){
            this.cycle();
         }else if(this.type === AnimationType.PINGPONG){
            this.pingpong();
         }else if(this.type === AnimationType.ONCE){
            this.once();
         }
      }

      draw(ctx: CanvasRenderingContext2D, x: number, y: number){
         this.tick();
         this.sprites[this.currIndex].draw(ctx, x, y);
      }
   }
}