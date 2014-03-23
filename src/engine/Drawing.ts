/// <reference path="Core.ts" />
/// <reference path="Loader.ts" />
/// <reference path="Util.ts" />

module ex {

   /**
    * Interface for implementing anything in Excalibur that can be drawn to the screen.
    * @class IDrawable
    */
   export interface IDrawable {
      /**
       * Indicates whether the drawing is to be flipped vertically
       * @property flipVertical {boolean}
       */
      flipVertical: boolean;
      /**
       * Indicates whether the drawing is to be flipped horizontally
       * @property flipHorizontal {boolean}
       */
      flipHorizontal: boolean;
      /**
       * Indicates the width of the drawing in pixels
       * @property width {number}
       */
      width: number;
      /**
       * Indicates the height of the drawing in pixels
       * @property height {number}
       */
      height: number;

      /**
       * Adds a new {{#crossLink ISpriteEffect}}{{/crossLink}} to this drawing.
       * @method addEffect
       * @param effect {ISpriteEffect} Effect to add to the this drawing
       */
      addEffect(effect: Effects.ISpriteEffect);
      /**
       * Clears all effects from the drawing and return it to its original state.
       * @method clearEffects
       */
      clearEffects();

      /**
       * Sets the point about which to apply transformations to the drawing relative to the 
       * top left corner of the drawing.
       * @method transformAbotPoint
       * @param point {Point} The point about which to apply transformations
       */
      transformAboutPoint(point: Point);

      /**
       * Sets the scale trasformation
       * @method setScale
       * @param scale {number} The magnitude to scale the drawing in the x direction
       */
      setScaleX(scale: number);

      /**
       * Sets the scale trasformation
       * @method setScale
       * @param scale {number} The magnitude to scale the drawing in the y direction
       */
      setScaleY(scale: number);

      /**
       * Returns the current magnitude of the drawing's scale in the x direction.
       * @method getScaleX
       * @returns number
       */
      getScaleX(): number;

      /**
       * Returns the current magnitude of the drawing's scale in the y direction.
       * @method getScaleY
       * @returns number
       */
      getScaleY(): number;

      /**
       * Sets the current rotation transformation for the drawing.
       * @method setRotation
       * @param radians {number} The rotation to apply to the drawing.
       */
      setRotation(radians: number);

      /**
       * Returns the current rotation for the drawing.
       * @method getRotation
       * @returns number
       */
      getRotation(): number;

      /**
       * Resets the internal state of the drawing (if any)
       * @method reset
       */
      reset();

      /**
       * Draws the sprite appropriately to the 2D rendering context.
       * @method draw
       * @param ctx {CanvasRenderingContext2D} The 2D rendering context
       * @param x {number} The x coordinate of where to draw
       * @param y {number} The y coordinate of where to draw
       */
      draw(ctx: CanvasRenderingContext2D, x: number, y: number);
   }

   /**
    * SpriteSheets are a useful mechanism for slicing up image resources into
    * separate sprites or for generating in game animations. Sprites are organized
    * in row major order in the SpriteSheet.
    * @class SpriteSheet
    * @contructor 
    * @param image {Texture} The backing image texture to build the SpriteSheet
    * @param columns {number} The number of columns in the image texture
    * @param rows {number} The number of rows in the image texture
    * @param spWidth {number} The width of each individual sprite in pixels
    * @param spHeight {number} The height of each individual sprite in pixels
    */
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

      /**
       * Create an animation from the this SpriteSheet by listing out the
       * sprite indices. Sprites are organized in row major order in the SpriteSheet.
       * @method getAnimationByIndices
       * @param engine {Engine} Reference to the current game Engine
       * @param indices {number[]} An array of sprite indices to use in the animation
       * @param speed {number} The number in milliseconds to display each frame in the animation
       * @returns Animation
       */
      public getAnimationByIndices(engine: Engine, indices: number[], speed: number) {
         var images: Sprite[] = this.sprites.filter(function (sprite, index) {
            return indices.indexOf(index) > -1;
         });

         images = images.map(function (i) {
            return i.clone();
         });
         return new Animation(engine, images, speed);
      }

      /**
       * Create an animation from the this SpriteSheet by specifing the range of
       * images with the beginning and ending index
       * @method getAnimationBetween
       * @param engine {Engine} Reference to the current game Engine
       * @param beginIndex {number} The index to start taking frames
       * @param endIndex {number} The index to stop taking frames
       * @param speed {number} The number in milliseconds to display each frame in the animation
       * @returns Animation
       */
      public getAnimationBetween(engine: Engine, beginIndex: number, endIndex: number, speed: number) {
         var images = this.sprites.slice(beginIndex, endIndex);
         images = images.map(function (i) {
            return i.clone();
         });
         return new Animation(engine, images, speed);
      }

      /**
       * Treat the entire SpriteSheet as one animation, organizing the frames in 
       * row major order.
       * @method getAnimationForAll
       * @param engine {Engine} Reference to the current game Engine
       * @param speed {number} The number in milliseconds to display each frame the animation
       * @returns Animation
       */
      public getAnimationForAll(engine: Engine, speed: number) {
         var sprites = this.sprites.map(function (i) {
            return i.clone();
         });
         return new Animation(engine, sprites, speed);
      }

      /**
       * Retreive a specific sprite from the SpriteSheet by its index. Sprites are organized
       * in row major order in the SpriteSheet.
       * @method getSprite
       * @param index {number} The index of the sprite
       * @returns Sprite
       */
      public getSprite(index: number): Sprite {
         if (index >= 0 && index < this.sprites.length) {
            return this.sprites[index].clone();
         }
      }
   }

   /**
    * SpriteFonts are a used in conjunction with a {{#crossLink Label}}{{/crossLink}} to specify
    * a particular bitmap as a font.
    * @class SpriteFont
    * @extends SpriteSheet
    * @constructor
    * @param image {Texture} The backing image texture to build the SpriteFont
    * @param alphabet {string} A string representing all the charaters in the image, in row major order.
    * @param caseInsensitve {boolean} Indicate whether this font takes case into account 
    * @param columns {number} The number of columns of characters in the image
    * @param rows {number} The number of rows of characters in the image
    * @param spWdith {number} The width of each character in pixels
    * @param spHeight {number} The height of each character in pixels
    */
   export class SpriteFont extends SpriteSheet {
      private spriteLookup: { [key: string]: number; } = {};
      private colorLookup: {[key: string]: Sprite[];} = {};
      private _currentColor: Color = Color.Black;
      constructor(public image: Texture, private alphabet: string, private caseInsensitive: boolean, columns: number, rows: number, spWidth: number, spHeight: number) {
         super(image, columns, rows, spWidth, spHeight);
      }

      /**
       * Returns a dictionary that maps each character in the alphabet to the appropriate Sprite.
       * @method getTextSprites
       * @returns {Object}
       */
      public getTextSprites(): { [key: string]: Sprite; }{
         var lookup: { [key: string]: Sprite; } = {};
         for (var i = 0; i < this.alphabet.length; i++) {
            var char = this.alphabet[i];
            if (this.caseInsensitive) {
               char = char.toLowerCase();
            }
            lookup[char] = this.sprites[i].clone();
         }
         return lookup;
      }
   }


   export module Effects {
      /**
       * The interface that all sprite effects must implement
       * @class ISpriteEffect
       */
      export interface ISpriteEffect {
         /**
          * Should update individual pixels values
          * @method updatePixel
          * @param x {number} The pixel's x coordinate
          * @param y {number} The pixel's y coordinate
          * @param imageData {ImageData} The sprites raw pixel data
          */
         updatePixel(x: number, y: number, imageData: ImageData): void;
      }

      /**
       * Applies the "Grayscale" effect to a sprite, removing color information.
       * @class Effects.Grayscale
       * @constructor
       * @extends ISpriteEffect
       */
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

      /**
       * Applies the "Invert" effect to a sprite, inverting the pixel colors.
       * @class Effects.Invert
       * @constructor
       * @extends ISpriteEffect
       */
      export class Invert implements ISpriteEffect {
         updatePixel(x: number, y: number, imageData: ImageData): void{
            var firstPixel = (x+y*imageData.width)*4;
            var pixel = imageData.data;
            pixel[firstPixel+0] = 255 - pixel[firstPixel+0];
            pixel[firstPixel+1] = 255 - pixel[firstPixel+1];
            pixel[firstPixel+2] = 255 - pixel[firstPixel+2];
         }
      }

      /**
       * Applies the "Opacity" effect to a sprite, setting the alpha of all pixels to a given value.
       * @class Effects.Opacity
       * @extends ISpriteEffect
       * @constructor
       * @param opacity {number} The new opacity of the sprite from 0-1.0  
       */
      export class Opacity implements ISpriteEffect {
         constructor(public opacity: number){}
         updatePixel(x: number, y: number, imageData: ImageData): void{
            var firstPixel = (x+y*imageData.width)*4;
            var pixel = imageData.data;
            if(pixel[firstPixel+3] !== 0){
               pixel[firstPixel+3] = Math.round(this.opacity*255);
            }
         }
      }

      /**
       * Applies the "Colorize" effect to a sprite, changing the color channels of all the pixels to an 
       * average of the original color and the provided color
       * @class Effects.Colorize
       * @extends ISpriteEffect
       * @constructor
       * @param color {Color} The color to apply to the sprite
       */
      export class Colorize implements ISpriteEffect {
         constructor(public color: Color){}
         updatePixel(x: number, y: number, imageData: ImageData): void {
            var firstPixel = (x+y*imageData.width)*4;
            var pixel = imageData.data;
            if(pixel[firstPixel+3] !== 0){
               pixel[firstPixel+0] = (pixel[firstPixel+0] + this.color.r)/2;
               pixel[firstPixel+1] = (pixel[firstPixel+1] + this.color.g)/2;
               pixel[firstPixel+2] = (pixel[firstPixel+2] + this.color.b)/2;
            }
         }
      }

      /**
       * Applies the "Fill" effect to a sprite, changing the color channels of all non-transparent pixels to match
       * a given color
       * @class Effects.Fill
       * @extends ISpriteEffect
       * @constructor
       * @param color {Color} The color to apply to the sprite
       */
      export class Fill implements ISpriteEffect {
         constructor(public color: Color){}
         updatePixel(x: number, y: number, imageData: ImageData): void {
            var firstPixel = (x+y*imageData.width)*4;
            var pixel = imageData.data;
            if(pixel[firstPixel+3] !== 0){
               pixel[firstPixel+0] = this.color.r;
               pixel[firstPixel+1] = this.color.g;
               pixel[firstPixel+2] = this.color.b;
            }
         }
      }
   }

   /**
    * A Sprite is one of the main drawing primitives. It is responsible for drawing
    * images or parts of images known as Textures to the screen.
    * @class Sprite
    * @constructor
    * @param image {Texture} The backing image texture to build the Sprite
    * @param sx {number} The x position of the sprite
    * @param sy {number} The y position of the sprite
    * @param swidth {number} The width of the sprite in pixels
    * @param sheight {number} The height of the sprite in pixels
    */
   export class Sprite implements IDrawable {
      private texture: Texture;
      private scaleX: number = 1.0;
      private scaleY: number = 1.0;
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
      /**
       * Adds a new {{#crossLink Effects.ISpriteEffect}}{{/crossLink}} to this drawing.
       * @method addEffect
       * @param effect {Effects.ISpriteEffect} Effect to add to the this drawing
       */
      public addEffect(effect: Effects.ISpriteEffect){
         this.effects.push(effect);
         // We must check if the texture and the backing sprite pixels are loaded as well before 
         // an effect can be applied
         if(!this.texture.isLoaded() || !this.pixelsLoaded){
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

      /**
       * Clears all effects from the drawing and return it to its original state.
       * @method clearEffects
       */
      public clearEffects(){
         this.effects.length = 0;
         this.applyEffects();
      }

      /**
       * Sets the point about which to apply transformations to the drawing relative to the 
       * top left corner of the drawing.
       * @method transformAbotPoint
       * @param point {Point} The point about which to apply transformations
       */
      public transformAboutPoint(point: Point) {
         this.transformPoint = point;
      }

      /**
       * Sets the current rotation transformation for the drawing.
       * @method setRotation
       * @param radians {number} The rotation to apply to the drawing.
       */
      public setRotation(radians: number) {
         this.rotation = radians;
      }

      /**
       * Returns the current rotation for the drawing in radians.
       * @method getRotation
       * @returns number
       */
      public getRotation(): number {
         return this.rotation;
      }

      /**
       * Sets the scale trasformation in the x direction
       * @method setScale
       * @param scale {number} The magnitude to scale the drawing in the x direction
       */
      public setScaleX(scaleX: number) {
         this.scaleX = scaleX;
      }

      /**
       * Sets the scale trasformation in the x direction
       * @method setScale
       * @param scale {number} The magnitude to scale the drawing in the x direction
       */
      public setScaleY(scaleY: number) {
         this.scaleY = scaleY;
      }

      /**
       * Returns the current magnitude of the drawing's scale in the x direction
       * @method getScale
       * @returns number
       */
      public getScaleX(): number {
         return this.scaleX;
      }

      /**
       * Returns the current magnitude of the drawing's scale in the y direction
       * @method getScale
       * @returns number
       */
      public getScaleY(): number {
         return this.scaleY;
      }

      /**
       * Resets the internal state of the drawing (if any)
       * @method reset
       */
      public reset() {
         // do nothing
      }

      /**
       * Draws the sprite appropriately to the 2D rendering context, at an x and y coordinate.
       * @method draw
       * @param ctx {CanvasRenderingContext2D} The 2D rendering context
       * @param x {number} The x coordinate of where to draw
       * @param y {number} The y coordinate of where to draw
       */
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
            ctx.drawImage(this.internalImage, 0, 0, this.swidth, this.sheight, -this.transformPoint.x, -this.transformPoint.y, this.swidth * this.scaleX, this.sheight * this.scaleY);
         }
         ctx.restore();
      }

      /**
       * Produces a copy of the current sprite
       * @method clone
       * @returns Sprite
       */
      public clone(): Sprite {
         var result = new Sprite(this.texture, this.sx, this.sy, this.swidth, this.sheight);
         result.scaleX = this.scaleX;
         result.scaleY = this.scaleY;
         result.rotation = this.rotation;
         result.flipHorizontal = this.flipHorizontal;
         result.flipVertical = this.flipVertical;

         this.effects.forEach((e)=>{
            result.addEffect(e);
         });
         return result;
      }
   }

   /**
    * Animations allow you to display a series of images one after another,
    * creating the illusion of change. Generally these images will come from a sprite sheet source.
    * @class Animation
    * @extends IDrawable
    * @constructor
    * @param engine {Engine} Reference to the current game engine
    * @param images {Sprite[]} An array of sprites to create the frames for the animation
    * @param speed {number} The number in milliseconds to display each frame in the animation
    * @param [loop=false] {boolean} Indicates whether the animation should loop after it is completed
    */
   export class Animation implements IDrawable {
      private sprites: Sprite[];
      private speed: number;
      private currIndex: number = 0;
      private oldTime: number = Date.now();
      private rotation: number = 0.0;
      private scaleX: number = 1.0;
      private scaleY: number = 1.0;
      /**
       * Indicates whether the animation should loop after it is completed
       * @property [loop=false] {boolean} 
       */
      public loop: boolean = false;
      public freezeFrame: number = -1;
      private engine: Engine;

      public flipVertical: boolean = false;
      public flipHorizontal: boolean = false;
      public width: number = 0;
      public height: number = 0;

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

      public setScaleX(scaleX: number) {
         this.scaleX = scaleX;
         for (var i in this.sprites) {
            this.sprites[i].setScaleX(scaleX);
         }
      }

      public setScaleY(scaleY: number) {
         this.scaleY = scaleY;
         for (var i in this.sprites) {
            this.sprites[i].setScaleY(scaleY);
         }
      }

      public getScaleX(): number {
         return this.scaleX;
      }

      public getScaleY(): number {
         return this.scaleY;
      }

      /**
       * Resets the animation to first frame.
       * @method reset
       */
      public reset() {
         this.currIndex = 0;
      }

      /**
       * Indicates whether the animation is complete, animations that loop are never complete.
       * @method isDone
       * @returns boolean
       */
      public isDone() {
         return (!this.loop && this.currIndex >= this.sprites.length);
      }

      /**
       * Not meant to be called by game developers. Ticks the animation forward internally an
       * calculates whether to change to teh frame.
       * @method tick
       */
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

      /**
       * Plays an animation at an arbitrary location in the game.
       * @method play
       * @param x {number} The x position in the game to play
       * @param y {number} The y position in the game to play
       */
      public play(x: number, y: number) {
         this.reset();
         this.engine.playAnimation(this, x, y);
      }
    }

   /**
    * Creates a closed polygon drawing given a list a of points. Polygons should be 
    * used sparingly as there is a <b>performance</b> impact for using them.
    * @class Polygon
    * @extends IDrawable
    * @constructor
    * @params points {Point[]} The points to use to build the polygon in order
    */
   export class Polygon implements IDrawable {
      public flipVertical: boolean;
      public flipHorizontal: boolean;
      public width: number;
      public height: number;

      /**
       * The color to use for the lines of the polygon
       * @property lineColor {Color}
       */
      public lineColor: Color;
      /**
       * The color to use for the interior of the polygon
       * @property fillColor {Color}
       */
      public fillColor: Color;
      /**
       * The width of the lines of the polygon
       * @property [lineWidth=5] {number} The width of the lines in pixels
       */
      public lineWidth: number = 5;
      /**
       * Indicates whether the polygon is filled or not.
       * @property [filled=false] {boolean}
       */
      public filled: boolean = false;
      
      private points: Point[] = [];
      private transformationPoint = new Point(0, 0);
      private rotation: number = 0;
      private scaleX: number = 1;
      private scaleY: number = 1;

      
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

      /**
       * Effects are <b>not supported</b> on polygons
       * @method addEffect
       */
      public addEffect(effect: Effects.ISpriteEffect){
         // not supported on polygons
      }

      /**
       * Effects are <b>not supported</b> on polygons
       * @method clearEffects
       */
      public clearEffects(){
         // not supported on polygons
      }

      public transformAboutPoint(point: Point) {
         this.transformationPoint = point;
      }

      public setScaleX(scaleX: number) {
         this.scaleX = scaleX;
      }

      public setScaleY(scaleY: number) {
         this.scaleY = scaleY;
      }

      public getScaleX() {
         return this.scaleX;
      }

      public getScaleY() {
         return this.scaleY;
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
         ctx.scale(this.scaleX, this.scaleY);
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