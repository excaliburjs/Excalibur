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

   export class SpriteSheet {
      sprites : any = {};
      internalImage : HTMLImageElement;
      constructor(public path: string, columns: number, rows: number, spWidth: number, spHeight: number){
         this.internalImage = new Image();
         this.internalImage.src = path;
         for(var i = 0; i < rows; i++){
            this.sprites[i] = [];
            for(var j= 0; j < columns; j++){
               this.sprites[i].push(new Sprite(this.internalImage, j*spWidth, i*spHeight, spWidth, spHeight));
            }
         }
      }

      getAnimationForRow(rowIndex: number, speed: number){
         return new Animation(this.sprites[rowIndex], speed);
      }

   }

   export class Sprite {
      internalImage : HTMLImageElement;
   	constructor(image: HTMLImageElement, public sx: number, public sy:number, public swidth: number, public sheight : number){
         this.internalImage = image;
   	}

      draw(ctx: CanvasRenderingContext2D, x: number, y: number){
         ctx.drawImage(this.internalImage, this.sx, this.sy, this.swidth, this.sheight, x, y, this.swidth, this.sheight);
      }
   }

   export class Animation {
   	sprites : Sprite[];
      speed : number;
      maxIndex : number;
      currIndex : number = 0;
      oldTime : number = new Date().getTime();


   	constructor(images: Sprite[], speed: number){
   		this.sprites = images;
         this.speed = speed;
         this.maxIndex = images.length;
   	}

      tick(){
         var time = new Date().getTime();
         if((time - this.oldTime)/1000 > this.speed){
            this.currIndex = (this.currIndex + 1) % this.maxIndex;
            this.oldTime = time;
         }

      }

      draw(ctx: CanvasRenderingContext2D, x: number, y: number){
         this.tick();
         this.sprites[this.currIndex].draw(ctx, x, y);
      }
   }
}