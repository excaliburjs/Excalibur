module ex {

   /**
    * Sprites
    *
    * A [[Sprite]] is one of the main drawing primitives. It is responsible for drawing
    * images or parts of images from a [[Texture]] resource to the screen.
    *
    * ## Creating a sprite
    *
    * To create a [[Sprite]] you need to have a loaded [[Texture]] resource. You can
    * then use [[Texture.asSprite]] to quickly create a [[Sprite]] or you can create
    * a new instance of [[Sprite]] using the constructor. This is useful if you
    * want to "slice" out a portion of an image or if you want to change the dimensions.
    *
    * ```js
    * var game = new ex.Engine();
    * var txPlayer = new ex.Texture("/assets/tx/player.png");
    *
    * // load assets
    * var loader = new ex.Loader(txPlayer);
    * 
    * // start game
    * game.start(loader).then(function () {
    * 
    *   // create a sprite (quick)
    *   var playerSprite = txPlayer.asSprite();
    *
    *   // create a sprite (custom)
    *   var playerSprite = new ex.Sprite(txPlayer, 0, 0, 80, 80);
    *
    * });
    * ```
    *
    * You can then assign an [[Actor]] a sprite through [[Actor.addDrawing]] and
    * [[Actor.setDrawing]].
    *
    * ## Sprite Effects
    *
    * Excalibur offers many sprite effects such as [[Effects.Colorize]] to let you manipulate
    * sprites. Keep in mind, more effects requires more power and can lead to memory or CPU
    * constraints and hurt performance.
    *
    * It's still recommended to create an [[Animation]] or build in your effects to the sprites
    * for optimal performance.
    */
   export class Sprite implements IDrawable {
      private _texture: Texture;

      public rotation: number = 0.0;
      public anchor: Point = new Point(0.0, 0.0);
      public scale: Point = new ex.Point(1, 1);

      public logger: Logger = Logger.getInstance();

      /**
       * Draws the sprite flipped vertically
       */
      public flipVertical: boolean = false;

      /**
       * Draws the sprite flipped horizontally
       */
      public flipHorizontal: boolean = false;

      public width: number = 0;
      public height: number = 0;
      public effects: Effects.ISpriteEffect[] = [];

      public internalImage: HTMLImageElement = new Image();
      public naturalWidth: number = 0;
      public naturalHeight: number = 0;

      private _spriteCanvas: HTMLCanvasElement = null;
      private _spriteCtx: CanvasRenderingContext2D = null;
      private _pixelData: ImageData = null;
      private _pixelsLoaded: boolean = false;
      private _dirtyEffect: boolean = false;

      /**
       * @param image   The backing image texture to build the Sprite
       * @param sx      The x position of the sprite
       * @param sy      The y position of the sprite
       * @param swidth  The width of the sprite in pixels
       * @param sheight The height of the sprite in pixels
       */
      constructor(image: Texture, public sx: number, public sy: number, public swidth: number, public sheight: number) {
         if(sx < 0 || sy < 0 || swidth < 0 || sheight < 0) {
            this.logger.error('Sprite cannot have any negative dimensions x:', 
                               sx, 'y:', sy, 'width:', swidth, 'height:', sheight);            
         }

         this._texture = image;
         this._spriteCanvas = document.createElement('canvas');
         this._spriteCanvas.width = swidth;
         this._spriteCanvas.height = sheight;
         this._spriteCtx = <CanvasRenderingContext2D>this._spriteCanvas.getContext('2d');
         this._texture.loaded.then(() => {
            this._spriteCanvas.width = this._spriteCanvas.width || this._texture.image.naturalWidth;
            this._spriteCanvas.height = this._spriteCanvas.height || this._texture.image.naturalHeight;
            this._loadPixels();            
            this._dirtyEffect = true;
         }).error((e) => {
            this.logger.error('Error loading texture ', this._texture.path, e);
         });
         
         this.width = swidth;
         this.height = sheight;
         this.naturalWidth = swidth;
         this.naturalHeight = sheight;
      }

      private _loadPixels() {
         if(this._texture.isLoaded() && !this._pixelsLoaded) {
            var clamp = ex.Util.clamp;
            var naturalWidth = this._texture.image.naturalWidth || 0;
            var naturalHeight = this._texture.image.naturalHeight || 0;

            if(this.swidth > naturalWidth) {
               this.logger.warn('The sprite width', this.swidth, 'exceeds the width', 
                                naturalWidth, 'of the backing texture', this._texture.path);
            }            
            if(this.sheight > naturalHeight) {
               this.logger.warn('The sprite height', this.sheight, 'exceeds the height', 
                                naturalHeight, 'of the backing texture', this._texture.path);
            }
            this._spriteCtx.drawImage(this._texture.image, 
               clamp(this.sx, 0, naturalWidth), 
               clamp(this.sy, 0, naturalHeight),
               clamp(this.swidth, 0, naturalWidth),
               clamp(this.sheight, 0, naturalHeight),
               0, 0, this.swidth, this.sheight);
            //this.pixelData = this.spriteCtx.getImageData(0, 0, this.swidth, this.sheight);
            
            this.internalImage.src = this._spriteCanvas.toDataURL('image/png');
            this._pixelsLoaded = true;
         }
      }

      /**
       * Applies the [[Effects.Opacity]] to a sprite, setting the alpha of all pixels to a given value
       */
      public opacity(value: number) {
         this.addEffect(new Effects.Opacity(value));
      }

      /**
       * Applies the [[Effects.Grayscale]] to a sprite, removing color information.
       */
      public grayscale() {
         this.addEffect(new Effects.Grayscale());
      }

      /**
       * Applies the [[Effects.Invert]] to a sprite, inverting the pixel colors.
       */
      public invert() {
         this.addEffect(new Effects.Invert());
      }

      /**
       * Applies the [[Effects.Fill]] to a sprite, changing the color channels of all non-transparent pixels to match a given color
       */
      public fill(color: Color) {
         this.addEffect(new Effects.Fill(color));
      }

      /**
       * Applies the [[Effects.Colorize]] to a sprite, changing the color channels of all pixesl to be the average of the original color
       * and the provided color.
       */
      public colorize(color: Color) {
         this.addEffect(new Effects.Colorize(color));
      }

      /**
       * Applies the [[Effects.Lighten]] to a sprite, changes the lightness of the color according to HSL
       */
      public lighten(factor: number = 0.1) {
         this.addEffect(new Effects.Lighten(factor));
      }

      /**
       * Applies the [[Effects.Darken]] to a sprite, changes the darkness of the color according to HSL
       */
      public darken(factor: number = 0.1) {
         this.addEffect(new Effects.Darken(factor));
      }

      /**
       * Applies the [[Effects.Saturate]] to a sprite, saturates the color acccording to HSL
       */
      public saturate(factor: number = 0.1) {
         this.addEffect(new Effects.Saturate(factor));
      }

      /**
       * Applies the [[Effects.Desaturate]] to a sprite, desaturates the color acccording to HSL
       */
      public desaturate(factor: number = 0.1) {
         this.addEffect(new Effects.Desaturate(factor));
      }

      /**
       * Adds a new [[Effects.ISpriteEffect]] to this drawing.
       * @param effect  Effect to add to the this drawing
       */
      public addEffect(effect: Effects.ISpriteEffect) {
         this.effects.push(effect);
         // We must check if the texture and the backing sprite pixels are loaded as well before 
         // an effect can be applied
         if (!this._texture.isLoaded() || !this._pixelsLoaded) {
            this._dirtyEffect = true;
         } else {
            this._applyEffects();
         }
      }

      /**
       * Removes a [[Effects.ISpriteEffect]] from this sprite.
       * @param effect  Effect to remove from this sprite
       */
      public removeEffect(effect: Effects.ISpriteEffect): void;
      
      /**
       * Removes an effect given the index from this sprite.
       * @param index  Index of the effect to remove from this sprite
       */
      public removeEffect(index: number): void;
      public removeEffect(param: any) {
         var indexToRemove = null;
         if (typeof param === 'number') {
            indexToRemove = param;
         } else {
            indexToRemove = this.effects.indexOf(param);
         }

         this.effects.splice(indexToRemove, 1);
         // We must check if the texture and the backing sprite pixels are loaded as well before 
         // an effect can be applied
         if (!this._texture.isLoaded() || !this._pixelsLoaded) {
            this._dirtyEffect = true;
         } else {
            this._applyEffects();
         }
      }

      private _applyEffects() {
         var clamp = ex.Util.clamp;
         var naturalWidth = this._texture.image.naturalWidth || 0;
         var naturalHeight = this._texture.image.naturalHeight || 0;

         this._spriteCtx.clearRect(0, 0, this.swidth, this.sheight);
         this._spriteCtx.drawImage(this._texture.image, clamp(this.sx, 0, naturalWidth),
            clamp(this.sy, 0, naturalHeight),
            clamp(this.swidth, 0, naturalWidth),
            clamp(this.sheight, 0, naturalHeight),
            0, 0, this.swidth, this.sheight);
         this._pixelData = this._spriteCtx.getImageData(0, 0, this.swidth, this.sheight);

         var i = 0, x = 0, y = 0, len = this.effects.length;
         for (i; i < len; i++) {
            y = 0;
            for(y; y < this.sheight; y++) {
               x = 0;
               for(x; x < this.swidth; x++) {
                  this.effects[i].updatePixel(x, y, this._pixelData);
               }
            }
         }
         this._spriteCtx.clearRect(0, 0, this.swidth, this.sheight);
         this._spriteCtx.putImageData(this._pixelData, 0, 0);
         this.internalImage.src = this._spriteCanvas.toDataURL('image/png');
      }

      /**
       * Clears all effects from the drawing and return it to its original state.
       */
      public clearEffects() {
         this.effects.length = 0;
         this._applyEffects();
      }
      
      /**
       * Resets the internal state of the drawing (if any)
       */
      public reset() {
         // do nothing
      }

      public debugDraw(ctx: CanvasRenderingContext2D, x: number, y: number) {
         ctx.save();
         ctx.translate(x, y);
         ctx.rotate(this.rotation);
         var xpoint = (this.width * this.scale.x) * this.anchor.x;
         var ypoint = (this.height * this.scale.y) * this.anchor.y;

         ctx.strokeStyle = Color.Black;
         ctx.strokeRect(-xpoint, -ypoint, this.width * this.scale.x, this.height * this.scale.y);
         ctx.restore();
      }

      /**
       * Draws the sprite appropriately to the 2D rendering context, at an x and y coordinate.
       * @param ctx  The 2D rendering context
       * @param x    The x coordinate of where to draw
       * @param y    The y coordinate of where to draw
       */
      public draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
         if (this._dirtyEffect) {
            this._applyEffects();
            this._dirtyEffect = false;
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

         // calculating current dimensions
         this.width = this.naturalWidth * this.scale.x;
         this.height = this.naturalHeight * this.scale.y;

      }

      /**
       * Produces a copy of the current sprite
       */
      public clone(): Sprite {
         var result = new Sprite(this._texture, this.sx, this.sy, this.swidth, this.sheight);
         result.scale = this.scale.clone();
         result.rotation = this.rotation;
         result.flipHorizontal = this.flipHorizontal;
         result.flipVertical = this.flipVertical;

         var i = 0, len = this.effects.length;
         for (i; i < len; i++) {
            result.addEffect(this.effects[i]);
         }
         return result;
      }

   }
}