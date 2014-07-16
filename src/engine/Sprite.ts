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
      private texture: Texture;
      private scaleX: number = 1.0;
      private scaleY: number = 1.0;
      private rotation: number = 0.0;
      private transformPoint: Point = new Point(0, 0);

      public logger: Logger = Logger.getInstance();

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
         if(sx < 0 || sy < 0 || swidth < 0 || sheight < 0){
            this.logger.error("Sprite cannot have any negative dimensions x:",sx,"y:",sy,"width:",swidth,"height:",sheight);            
         }

         this.texture = image;
         this.spriteCanvas = document.createElement('canvas');
         this.spriteCanvas.width = swidth;
         this.spriteCanvas.height = sheight;
         this.spriteCtx = this.spriteCanvas.getContext('2d');
         this.texture.loaded.then(()=>{
            this.loadPixels();            
            this.dirtyEffect = true;
         }).error((e)=>{
            this.logger.error("Error loading texture ", this.texture.path, e);
         });
         

         this.width = swidth;
         this.height = sheight;
      }

      private loadPixels(){
         if(this.texture.isLoaded() && !this.pixelsLoaded){
            var clamp = ex.Util.clamp;
            var naturalWidth = this.texture.image.naturalWidth || 0;
            var naturalHeight = this.texture.image.naturalHeight || 0;

            if(this.swidth > naturalWidth){
               this.logger.warn("The sprite width",this.swidth,"exceeds the width", naturalWidth, "of the backing texture", this.texture.path);
            }            
            if(this.sheight > naturalHeight){
               this.logger.warn("The sprite height",this.sheight,"exceeds the height", naturalHeight, "of the backing texture", this.texture.path);
            }
            this.spriteCtx.drawImage(this.texture.image, 
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
}