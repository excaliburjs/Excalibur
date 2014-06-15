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
      private _scaleX: number = 1.0;
      private _scaleY: number = 1.0;
      private _rotation: number = 0.0;
      private _transformPoint: Point = new Point(0, 0);

      public flipVertical: boolean = false;
      public flipHorizontal: boolean = false;
      public width: number = 0;
      public height: number = 0;
      public effects: Effects.ISpriteEffect[] = [];

      private _internalImage: HTMLImageElement = new Image();
      private _spriteCanvas: HTMLCanvasElement = null;
      private _spriteCtx: CanvasRenderingContext2D = null;
      private _pixelData: ImageData = null;
      private _pixelsLoaded: boolean = false;
      private _dirtyEffect: boolean = false;

      
      constructor(image: Texture, public sx: number, public sy: number, public swidth: number, public sheight: number) {
         this._texture = image;
         this._spriteCanvas = document.createElement('canvas');
         this._spriteCanvas.width = swidth;
         this._spriteCanvas.height = sheight;
         this._spriteCtx = this._spriteCanvas.getContext('2d');

         this.width = swidth;
         this.height = sheight;
      }

      private _loadPixels(){
         if (this._texture.isLoaded() && !this._pixelsLoaded){
            this._spriteCtx.drawImage(this._texture.image, this.sx, this.sy, this.swidth, this.sheight, 0, 0, this.swidth, this.sheight);
            //this.pixelData = this.spriteCtx.getImageData(0, 0, this.swidth, this.sheight);
            
            this._internalImage.src = this._spriteCanvas.toDataURL("image/png");
            this._pixelsLoaded = true;
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
         if (!this._texture.isLoaded() || !this._pixelsLoaded){
            this._dirtyEffect = true;
         }else{
            this._applyEffects();
         }
      }

      private _applyEffects(){
         this._spriteCtx.clearRect(0, 0, this.swidth, this.sheight);
         this._spriteCtx.drawImage(this._texture.image, this.sx, this.sy, this.swidth, this.sheight, 0, 0, this.swidth, this.sheight);
         this._pixelData = this._spriteCtx.getImageData(0, 0, this.swidth, this.sheight);

         this.effects.forEach((effect)=>{
            for(var y = 0; y < this.sheight; y++){            
               for(var x = 0; x < this.swidth; x++){
                  effect.updatePixel(x, y, this._pixelData);
               }
            }
         });
         this._spriteCtx.clearRect(0, 0, this.swidth, this.sheight);
         this._spriteCtx.putImageData(this._pixelData, 0, 0);
         this._internalImage.src = this._spriteCanvas.toDataURL("image/png");
      }

      /**
       * Clears all effects from the drawing and return it to its original state.
       * @method clearEffects
       */
      public clearEffects(){
         this.effects.length = 0;
         this._applyEffects();
      }

      /**
       * Sets the point about which to apply transformations to the drawing relative to the 
       * top left corner of the drawing.
       * @method transformAbotPoint
       * @param point {Point} The point about which to apply transformations
       */
      public transformAboutPoint(point: Point) {
         this._transformPoint = point;
      }

      /**
       * Sets the current rotation transformation for the drawing.
       * @method setRotation
       * @param radians {number} The rotation to apply to the drawing.
       */
      public setRotation(radians: number) {
         this._rotation = radians;
      }

      /**
       * Returns the current rotation for the drawing in radians.
       * @method getRotation
       * @returns number
       */
      public getRotation(): number {
         return this._rotation;
      }

      /**
       * Sets the scale trasformation in the x direction
       * @method setScale
       * @param scale {number} The magnitude to scale the drawing in the x direction
       */
      public setScaleX(scaleX: number) {
         this._scaleX = scaleX;
      }

      /**
       * Sets the scale trasformation in the x direction
       * @method setScale
       * @param scale {number} The magnitude to scale the drawing in the x direction
       */
      public setScaleY(scaleY: number) {
         this._scaleY = scaleY;
      }

      /**
       * Returns the current magnitude of the drawing's scale in the x direction
       * @method getScale
       * @returns number
       */
      public getScaleX(): number {
         return this._scaleX;
      }

      /**
       * Returns the current magnitude of the drawing's scale in the y direction
       * @method getScale
       * @returns number
       */
      public getScaleY(): number {
         return this._scaleY;
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
         this._loadPixels();
         if (this._dirtyEffect){
            this._applyEffects();
            this._dirtyEffect = false;
         }

         ctx.save();
         //var translateX = this.aboutCenter?this.swidth*this.scale/2:0;
         //var translateY = this.aboutCenter?this.sheight*this.scale/2:0;
         ctx.translate(x + this._transformPoint.x, y + this._transformPoint.y);
         ctx.rotate(this._rotation);
         //ctx.scale(this.scale, this.scale);

         if (this.flipHorizontal) {
            ctx.translate(this.swidth, 0);
            ctx.scale(-1, 1);
         }

         if (this.flipVertical) {
            ctx.translate(0, this.sheight);
            ctx.scale(1, -1);
         }
         if (this._internalImage){
            ctx.drawImage(this._internalImage, 0, 0, this.swidth, this.sheight, -this._transformPoint.x, -this._transformPoint.y, this.swidth * this._scaleX, this.sheight * this._scaleY);
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
         result._scaleX = this._scaleX;
         result._scaleY = this._scaleY;
         result._rotation = this._rotation;
         result.flipHorizontal = this.flipHorizontal;
         result.flipVertical = this.flipVertical;

         this.effects.forEach((e)=>{
            result.addEffect(e);
         });
         return result;
      }
   }
}