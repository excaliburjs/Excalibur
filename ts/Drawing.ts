/// <reference path="Core.ts" />
/// <reference path="Loader.ts" />
/// <reference path="Util.ts" />

module ex {

   export interface IDrawable {
      flipVertical: boolean;
      flipHorizontal: boolean;
      width: number;
      height: number;
      addEffect(effect: Effects.ISpriteEffect);
      clearEffects();
      transformAboutPoint(point: Point);
      setScale(scale: number);
      getScale(): number;
      setRotation(radians: number);
      getRotation(): number;
      reset();
      draw(ctx: CanvasRenderingContext2D, x: number, y: number);
   }

   export class SpriteSheet {
      public sprites: Sprite[] = [];
      private internalImage: HTMLImageElement;

      constructor(public image: Texture, private columns: number, private rows: number, spWidth: number, spHeight: number) {
         this.internalImage = image.image;
         this.sprites = new Array(columns * rows);

         // TODO: Inspect actual image dimensions with preloading
         /*if(spWidth * columns > this.internalImage.naturalWidth){
            throw new Error("SpriteSheet specified is wider than image width");
         }

         if(spHeight * rows > this.internalImage.naturalHeight){
            throw new Error("SpriteSheet specified is higher than image height");
         }*/

         var i = 0;
         var j = 0;
         for (i = 0; i < rows; i++) {
            for (j = 0; j < columns; j++) {
               this.sprites[j + i * columns] = new Sprite(this.image, j * spWidth, i * spHeight, spWidth, spHeight);
            }
         }
      }

      public getAnimationByIndices(engine: Engine, indices: number[], speed: number) {
         var images: Sprite[] = this.sprites.filter(function (sprite, index) {
            return indices.indexOf(index) > -1;
         });

         images = images.map(function (i) {
            return i.clone();
         });
         return new Animation(engine, images, speed);
      }

      public getAnimationBetween(engine: Engine, beginIndex: number, endIndex: number, speed: number) {
         var images = this.sprites.slice(beginIndex, endIndex);
         images = images.map(function (i) {
            return i.clone();
         });
         return new Animation(engine, images, speed);
      }

      public getAnimationForAll(engine: Engine, speed: number) {
         var sprites = this.sprites.map(function (i) {
            return i.clone();
         });
         return new Animation(engine, sprites, speed);
      }

      public getSprite(index: number): Sprite {
         if (index >= 0 && index < this.sprites.length) {
            return this.sprites[index].clone();
         }
      }
   }

   export class SpriteFont extends SpriteSheet {
      private spriteLookup: { [key: string]: Sprite; } = {};
      constructor(public image: Texture, private alphabet: string, private caseInsensitive: boolean, columns: number, rows: number, spWidth: number, spHeight: number) {
         super(image, columns, rows, spWidth, spHeight);
         for (var i = 0; i < alphabet.length; i++) {
            var char = alphabet[i];
            if (caseInsensitive) {
               char = char.toLowerCase();
            }
            this.spriteLookup[char] = this.sprites[i];
         }
      }

      public draw(ctx: CanvasRenderingContext2D, x: number, y: number, text: string) {
         var currX = x;
         for (var i = 0; i < text.length; i++) {
            var character = text[i];
            if (this.caseInsensitive) {
               character = character.toLowerCase();
            }
            try {
               var charSprite = this.spriteLookup[character];
               charSprite.draw(ctx, currX, y);
               currX += charSprite.swidth;
            } catch (e) {
               Logger.getInstance().error("SpriteFont Error drawing char " + character);
            }           
         }
      }
   }


   export module Effects {
      export interface ISpriteEffect {
         updatePixel(x: number, y: number, imageData: ImageData): void;
      }

      export class Grayscale implements ISpriteEffect {
         updatePixel(x: number, y: number, imageData: ImageData): void{
            var firstPixel = (x+y*imageData.width)*4;
            var pixel = imageData.data;
            var avg = (pixel[firstPixel+0] + pixel[firstPixel+1] + pixel[firstPixel+2])/3;
            pixel[firstPixel+0] = avg;
            pixel[firstPixel+1] = avg;
            pixel[firstPixel+2] = avg;
         }
      }

      export class Invert implements ISpriteEffect {
         updatePixel(x: number, y: number, imageData: ImageData): void{
            var firstPixel = (x+y*imageData.width)*4;
            var pixel = imageData.data;
            pixel[firstPixel+0] = 255 - pixel[firstPixel+0];
            pixel[firstPixel+1] = 255 - pixel[firstPixel+1];
            pixel[firstPixel+2] = 255 - pixel[firstPixel+2];
         }
      }

      export class Opacity implements ISpriteEffect {
         constructor(public opacity: number){}
         updatePixel(x: number, y: number, imageData: ImageData): void{
            var firstPixel = (x+y*imageData.width)*4;
            var pixel = imageData.data;
            if(pixel[firstPixel+3] !== 0){
               pixel[firstPixel+3] = Math.round(this.opacity);
            }
         }
      }

   }

   export class Sprite implements IDrawable {
      private texture: Texture;
      private scale: number = 1.0;
      private rotation: number = 0.0;
      private transformPoint: Point = new Point(0, 0);
      public flipVertical: boolean = false;
      public flipHorizontal: boolean = false;
      public width: number = 0;
      public height: number = 0;
      public effects: Effects.ISpriteEffect[] = [];

      private internalImage: HTMLImageElement = new Image();
      private spriteCanvas: HTMLCanvasElement = null;
      private spriteCtx: CanvasRenderingContext2D = null;
      private pixelData: ImageData = null;
      private pixelsLoaded: boolean = false;
      private dirtyEffect: boolean = false;

      /**
       * Sprite image
       * @class Sprite
       * @constructor
       */
      constructor(image: Texture, public sx: number, public sy: number, public swidth: number, public sheight: number) {
         this.texture = image;
         this.spriteCanvas = document.createElement('canvas');
         this.spriteCanvas.width = swidth;
         this.spriteCanvas.height = sheight;
         this.spriteCtx = this.spriteCanvas.getContext('2d');

         this.width = swidth;
         this.height = sheight;
      }

      private loadPixels(){
         if(this.texture.image && !this.pixelsLoaded){
            this.spriteCtx.drawImage(this.texture.image, this.sx, this.sy, this.swidth, this.sheight, 0, 0, this.swidth, this.sheight);
            //this.pixelData = this.spriteCtx.getImageData(0, 0, this.swidth, this.sheight);
            
            this.internalImage.src = this.spriteCanvas.toDataURL("image/png");
            this.pixelsLoaded = true;
         }
      }

      public addEffect(effect: Effects.ISpriteEffect){
         this.effects.push(effect);
         if(!this.texture.image){
            this.dirtyEffect = true;
         }else{
            this.applyEffects();
         }
      }

      private applyEffects(){
         this.spriteCtx.clearRect(0, 0, this.swidth, this.sheight);
         this.spriteCtx.drawImage(this.texture.image, this.sx, this.sy, this.swidth, this.sheight, 0, 0, this.swidth, this.sheight);
         this.pixelData = this.spriteCtx.getImageData(0, 0, this.swidth, this.sheight);

         this.effects.forEach((effect)=>{
            for(var y = 0; y < this.sheight; y++){            
               for(var x = 0; x < this.swidth; x++){
                  effect.updatePixel(x, y, this.pixelData);
               }
            }
         });
         this.spriteCtx.clearRect(0, 0, this.swidth, this.sheight);
         this.spriteCtx.putImageData(this.pixelData, 0, 0);
         this.internalImage.src = this.spriteCanvas.toDataURL("image/png");
      }

      public clearEffects(){
         this.effects.length = 0;
         this.applyEffects();
      }

      public transformAboutPoint(point: Point) {
         this.transformPoint = point;
      }

      public setRotation(radians: number) {
         this.rotation = radians;
      }

      public getRotation(): number {
         return this.rotation;
      }

      public setScale(scale: number) {
         this.scale = scale;
      }

      public getScale(): number {
         return this.scale;
      }

      public reset() {
         // do nothing
      }

      public draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
         this.loadPixels();
         if(this.dirtyEffect){
            this.applyEffects();
            this.dirtyEffect = false;
         }

         ctx.save();
         //var translateX = this.aboutCenter?this.swidth*this.scale/2:0;
         //var translateY = this.aboutCenter?this.sheight*this.scale/2:0;
         ctx.translate(x + this.transformPoint.x, y + this.transformPoint.y);
         ctx.rotate(this.rotation);
         //ctx.scale(this.scale, this.scale);

         if (this.flipHorizontal) {
            ctx.translate(this.swidth, 0);
            ctx.scale(-1, 1);
         }

         if (this.flipVertical) {
            ctx.translate(0, this.sheight);
            ctx.scale(1, -1);
         }
         if(this.internalImage){
            ctx.drawImage(this.internalImage, 0, 0, this.swidth, this.sheight, -this.transformPoint.x, -this.transformPoint.y, this.swidth * this.scale, this.sheight * this.scale);
         }
         ctx.restore();
      }

      public clone(): Sprite {
         var result = new Sprite(this.texture, this.sx, this.sy, this.swidth, this.sheight);
         result.scale = this.scale;
         result.rotation = this.rotation;
         result.flipHorizontal = this.flipHorizontal;
         result.flipVertical = this.flipVertical;
         return result;
      }
   }

   export class Animation implements IDrawable {
      private sprites: Sprite[];
      private speed: number;
      private currIndex: number = 0;
      private oldTime: number = Date.now();
      private rotation: number = 0.0;
      private scale: number = 1.0;
      public loop: boolean = false;
      public freezeFrame: number = -1;
      private engine: Engine;

      public flipVertical: boolean = false;
      public flipHorizontal: boolean = false;
      public width: number = 0;
      public height: number = 0;
      /**
       * Sprite animation
       * @class Animation
       * @constructor
       */
      constructor(engine: Engine, images: Sprite[], speed: number, loop?: boolean) {
         this.sprites = images;
         this.speed = speed;
         this.engine = engine;
         if (loop != null) {
            this.loop = loop;
         }
         this.height = images[0] ? images[0].height : 0;
         this.width = images[0] ? images[0].width : 0;
      }

      public addEffect(effect: Effects.ISpriteEffect){
         for(var i in this.sprites){
            this.sprites[i].addEffect(effect);
         }
      }

      public clearEffects(){
         for(var i in this.sprites){
            this.sprites[i].clearEffects();
         }  
      }

      public transformAboutPoint(point: Point) {
         for (var i in this.sprites) {
            this.sprites[i].transformAboutPoint(point);
         }
      }

      public setRotation(radians: number) {
         this.rotation = radians;
         for (var i in this.sprites) {
            this.sprites[i].setRotation(radians);
         }
      }

      public getRotation(): number {
         return this.rotation;
      }

      public setScale(scale: number) {
         this.scale = scale;
         for (var i in this.sprites) {
            this.sprites[i].setScale(scale);
         }
      }

      public getScale(): number {
         return this.scale;
      }

      public reset() {
         this.currIndex = 0;
      }

      public isDone() {
         return (!this.loop && this.currIndex >= this.sprites.length);
      }

      public tick() {
         var time = Date.now();
         if ((time - this.oldTime) > this.speed) {
            this.currIndex = (this.loop ? (this.currIndex + 1) % this.sprites.length : this.currIndex + 1);
            this.oldTime = time;
         }
      }

      public draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
         this.tick();
         if (this.currIndex < this.sprites.length) {
            var currSprite = this.sprites[this.currIndex];
            if (this.flipVertical) {
               currSprite.flipVertical = this.flipVertical;
            }
            if (this.flipHorizontal) {
               currSprite.flipHorizontal = this.flipHorizontal;
            }
            currSprite.draw(ctx, x, y);
         }

         if (this.freezeFrame !== -1 && this.currIndex >= this.sprites.length) {
            var currSprite = this.sprites[Util.clamp(this.freezeFrame, 0, this.sprites.length - 1)];
            currSprite.draw(ctx, x, y);
         }
      }

      public play(x: number, y: number) {
         this.reset();
         this.engine.playAnimation(this, x, y);
      }
    }

   export class Polygon implements IDrawable {
      public flipVertical: boolean;
      public flipHorizontal: boolean;
      public width: number;
      public height: number;
      public lineColor: Color;
      public fillColor: Color;
      public lineWidth: number = 5;
      public filled: boolean = false;
      
      private points: Point[] = [];
      private transformationPoint = new Point(0, 0);
      private rotation: number = 0;
      private scale: number = 1;

      /**
       * Polygon
       * @class Polygon
       * @constructor
       */
      constructor(points : Point[]) {
         this.points = points;

         var minX = this.points.reduce((prev: number, curr: Point) => {
            return Math.min(prev, curr.x);
         }, 0);
         var maxX = this.points.reduce((prev: number, curr: Point) => {
            return Math.max(prev, curr.x);
         }, 0);

         this.width = maxX - minX;

         var minY = this.points.reduce((prev: number, curr: Point) => {
            return Math.min(prev, curr.y);
         }, 0);
         var maxY = this.points.reduce((prev: number, curr: Point) => {
            return Math.max(prev, curr.y);
         }, 0);

         this.height = maxY - minY;
      }

      public addEffect(effect: Effects.ISpriteEffect){
         // not supported on polygons
      }

      public clearEffects(){
         // not supported on polygons
      }

      public transformAboutPoint(point: Point) {
         this.transformationPoint = point;
      }

      public setScale(scale: number) {
         this.scale = scale;
      }

      public getScale() {
         return this.scale;
      }

      public setRotation(radians: number) {
         this.rotation = radians;
      }

      public getRotation() {
         return this.rotation;
      }

      public reset() {
         //pass
      }

      public draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
         ctx.save();
         ctx.translate(x + this.transformationPoint.x, y + this.transformationPoint.y);
         ctx.scale(this.scale, this.scale);
         ctx.rotate(this.rotation);
         ctx.beginPath();
         ctx.lineWidth = this.lineWidth;

         // Iterate through the supplied points and contruct a 'polygon'
         var firstPoint = this.points[0];
         ctx.moveTo(firstPoint.x, firstPoint.y);
         this.points.forEach((point)=> {
            ctx.lineTo(point.x, point.y);
         });
         ctx.lineTo(firstPoint.x, firstPoint.y);
         ctx.closePath();

         if (this.filled) {
            ctx.fillStyle = this.fillColor.toString();
            ctx.fill();
         }

         ctx.strokeStyle = this.lineColor.toString();

         if (this.flipHorizontal) {
            ctx.translate(this.width, 0);
            ctx.scale(-1, 1);
         }

         if (this.flipVertical) {
            ctx.translate(0, this.height);
            ctx.scale(1, -1);
         }

         ctx.stroke();
         ctx.restore();
      }
   };

}