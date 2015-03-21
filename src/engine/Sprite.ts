module ex {
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
      private _texture: Texture;

      public rotation: number = 0.0;
      public anchor: Point = new Point(0.0, 0.0);
      public scale: Point = new ex.Point(1, 1);

      public logger: Logger = Logger.getInstance();

      public flipVertical: boolean = false;
      public flipHorizontal: boolean = false;

      public width: number = 0;
      public height: number = 0;
      public effects: Effects.ISpriteEffect[] = [];

      public internalImage: HTMLImageElement = new Image();
      private spriteCanvas: HTMLCanvasElement = null;
      private spriteCtx: CanvasRenderingContext2D = null;
      private pixelData: ImageData = null;
      private pixelsLoaded: boolean = false;
      private dirtyEffect: boolean = false;

      
      constructor(image: Texture, public sx: number, public sy: number, public swidth: number, public sheight: number) {
         if(sx < 0 || sy < 0 || swidth < 0 || sheight < 0){
            this.logger.error("Sprite cannot have any negative dimensions x:",sx,"y:",sy,"width:",swidth,"height:",sheight);            
         }

         this._texture = image;
         this.spriteCanvas = document.createElement('canvas');
         this.spriteCanvas.width = swidth;
         this.spriteCanvas.height = sheight;
         this.spriteCtx = this.spriteCanvas.getContext('2d');
         this._texture.loaded.then(()=>{
            this.spriteCanvas.width = this.spriteCanvas.width || this._texture.image.naturalWidth;
            this.spriteCanvas.height = this.spriteCanvas.height || this._texture.image.naturalHeight;
            this.loadPixels();            
            this.dirtyEffect = true;
         }).error((e)=>{
            this.logger.error("Error loading texture ", this._texture.path, e);
         });
         

         this.width = swidth;
         this.height = sheight;
      }

      private loadPixels(){
         if(this._texture.isLoaded() && !this.pixelsLoaded){
            var clamp = ex.Util.clamp;
            var naturalWidth = this._texture.image.naturalWidth || 0;
            var naturalHeight = this._texture.image.naturalHeight || 0;

            if(this.swidth > naturalWidth){
               this.logger.warn("The sprite width",this.swidth,"exceeds the width", naturalWidth, "of the backing texture", this._texture.path);
            }            
            if(this.sheight > naturalHeight){
               this.logger.warn("The sprite height",this.sheight,"exceeds the height", naturalHeight, "of the backing texture", this._texture.path);
            }
            this.spriteCtx.drawImage(this._texture.image, 
               clamp(this.sx, 0, naturalWidth), 
               clamp(this.sy, 0, naturalHeight),
               clamp(this.swidth, 0, naturalWidth),
               clamp(this.sheight, 0, naturalHeight),
               0, 0, this.swidth, this.sheight);
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
         if(!this._texture.isLoaded() || !this.pixelsLoaded){
            this.dirtyEffect = true;
         }else{
            this.applyEffects();
         }
      }

      /**
       * Removes a {{#crossLink Effects.ISpriteEffect}}{{/crossLink}} from this sprite.
       * @method removeEffect
       * @param effect {Effects.ISpriteEffect} Effect to remove from this sprite
       */
      public removeEffect(effect: Effects.ISpriteEffect): void;
      
      /**
       * Removes an effect given the index from this sprite.
       * @method removeEffect
       * @param index {number} Index of the effect to remove from this sprite
       */
      public removeEffect(index: number): void;
      public removeEffect(param: any) {
         var indexToRemove = null;
         if(typeof param === 'number'){
            indexToRemove = param;
         }else{
            indexToRemove = this.effects.indexOf(param);
         }

         this.effects.splice(indexToRemove, 1);
         // We must check if the texture and the backing sprite pixels are loaded as well before 
         // an effect can be applied
         if(!this._texture.isLoaded() || !this.pixelsLoaded){
            this.dirtyEffect = true;
         }else{
            this.applyEffects();
         }
      }

      private applyEffects() {
         var clamp = ex.Util.clamp;
         var naturalWidth = this._texture.image.naturalWidth || 0;
         var naturalHeight = this._texture.image.naturalHeight || 0;

         this.spriteCtx.clearRect(0, 0, this.swidth, this.sheight);
         this.spriteCtx.drawImage(this._texture.image, clamp(this.sx, 0, naturalWidth),
            clamp(this.sy, 0, naturalHeight),
            clamp(this.swidth, 0, naturalWidth),
            clamp(this.sheight, 0, naturalHeight),
            0, 0, this.swidth, this.sheight);
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
       * Resets the internal state of the drawing (if any)
       * @method reset
       */
      public reset() {
         // do nothing
      }

      public debugDraw(ctx: CanvasRenderingContext2D) {
         // todo implement debug draw

      }

      /**
       * Draws the sprite appropriately to the 2D rendering context, at an x and y coordinate.
       * @method draw
       * @param ctx {CanvasRenderingContext2D} The 2D rendering context
       * @param x {number} The x coordinate of where to draw
       * @param y {number} The y coordinate of where to draw
       */
      public draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
         if(this.dirtyEffect){
            this.applyEffects();
            this.dirtyEffect = false;
         }

         ctx.save();
         var xpoint = (this.width * this.scale.x) * this.anchor.x;
         var ypoint = (this.height * this.scale.y) * this.anchor.y;
         ctx.translate(x, y);
         ctx.rotate(this.rotation);
         
         // todo cache flipped sprites
         if (this.flipHorizontal) {
            ctx.translate(this.swidth * this.scale.x, 0);
            ctx.scale(-1, 1);
         }

         if (this.flipVertical) {
            ctx.translate(0, this.sheight * this.scale.y);
            ctx.scale(1, -1);
         }
         if (this.internalImage) {
            
            ctx.drawImage(this.internalImage, 0, 0, this.swidth, this.sheight, 
               -xpoint, 
               -ypoint, 
               this.swidth * this.scale.x, 
               this.sheight * this.scale.y);
         }
         ctx.restore();
      }

      /**
       * Produces a copy of the current sprite
       * @method clone
       * @returns Sprite
       */
      public clone(): Sprite {
         var result = new Sprite(this._texture, this.sx, this.sy, this.swidth, this.sheight);
         result.scale = this.scale.clone();
         result.rotation = this.rotation;
         result.flipHorizontal = this.flipHorizontal;
         result.flipVertical = this.flipVertical;

         this.effects.forEach((e)=>{
            result.addEffect(e);
         });
         return result;
      }
   }
}