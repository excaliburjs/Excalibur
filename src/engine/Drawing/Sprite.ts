import * as Effects from './SpriteEffects';
import { Color } from './Color';

import { IDrawable } from '../Interfaces/IDrawable';
import { Texture } from '../Resources/Texture';
import { Vector } from '../Algebra';
import { Logger } from '../Util/Log';
import { clamp } from '../Util/Util';
import { Configurable } from '../Configurable';

/**
 * A [[ISpriteCoordinate]] indicates a sprite location and size on a backing [[Texture]].
 */
export interface ISpriteCoordinate {
   x: number;
   y: number;
   width: number;
   height: number;
   anchor?: Vector;
}

/**
 * @hidden
 */
export class SpriteImpl implements IDrawable {
   private _texture: Texture;

   public sx: number;
   public sy: number;
   public swidth: number;
   public sheight: number;

   public rotation: number = 0.0;
   public anchor: Vector = new Vector(0.0, 0.0);
   public scale: Vector = new Vector(1, 1);

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

   public sx: number = 0;
   public sy: number = 0;
   public swidth: number = 0;
   public sheight: number = 0;

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
   constructor(imageOrConfig: Texture | ISpriteArgs, sx: number, sy: number, swidth: number, sheight: number) {
       if (arguments.length !== 2 && arguments.length !== 5) {
           this.logger.error('Invalid Sprite constructor arguments');
       }
       let image: Texture = arguments[0];
       if (arguments.length === 2) {
           var spriteCoord: ISpriteCoordinate = arguments[1];
           this.anchor = spriteCoord.anchor || this.anchor;
       }
       if (arguments.length === 5) {
           var sx: number = this.sx = spriteCoord ? spriteCoord.x : arguments[1];
           var sy: number = this.sy = spriteCoord ? spriteCoord.y : arguments[2];
           var swidth: number = this.swidth = spriteCoord ? spriteCoord.width : arguments[3];
           var sheight: number = this.sheight = spriteCoord ? spriteCoord.height : arguments[4];
       }
      if (sx < 0 || sy < 0 || swidth < 0 || sheight < 0) {
         this.logger.error('Sprite cannot have any negative dimensions x:', 
                              sx, 'y:', sy, 'width:', swidth, 'height:', sheight);            
      }

      var image = imageOrConfig;
      if (imageOrConfig && !(imageOrConfig instanceof Texture)) {
         sx = imageOrConfig.sx;
         sy = imageOrConfig.sy;
         swidth = imageOrConfig.swidth;
         sheight = imageOrConfig.sheight;
         image = imageOrConfig.image;
      }

      this.sx = sx || 0;
      this.sy = sy || 0;
      this.swidth = swidth || 0;
      this.sheight = sheight || 0;

      this._texture = <Texture>image;
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
      if (this._texture.isLoaded() && !this._pixelsLoaded) {
         var naturalWidth = this._texture.image.naturalWidth || 0;
         var naturalHeight = this._texture.image.naturalHeight || 0;

         if (this.swidth > naturalWidth) {
            this.logger.warn('The sprite width', this.swidth, 'exceeds the width', 
                              naturalWidth, 'of the backing texture', this._texture.path);
         }            
         if (this.sheight > naturalHeight) {
            this.logger.warn('The sprite height', this.sheight, 'exceeds the height', 
                              naturalHeight, 'of the backing texture', this._texture.path);
         }
         this._spriteCtx.drawImage(this._texture.image, 
            clamp(this.sx, 0, naturalWidth), 
            clamp(this.sy, 0, naturalHeight),
            clamp(this.swidth, 0, naturalWidth),
            clamp(this.sheight, 0, naturalHeight),
            0, 0, this.swidth, this.sheight);

         this._pixelsLoaded = true;
      }
   }

   /**
    * Applies the [[Opacity]] effect to a sprite, setting the alpha of all pixels to a given value
    */
   public opacity(value: number) {
      this.addEffect(new Effects.Opacity(value));
   }

   /**
    * Applies the [[Grayscale]] effect to a sprite, removing color information.
    */
   public grayscale() {
      this.addEffect(new Effects.Grayscale());
   }

   /**
    * Applies the [[Invert]] effect to a sprite, inverting the pixel colors.
    */
   public invert() {
      this.addEffect(new Effects.Invert());
   }

   /**
    * Applies the [[Fill]] effect to a sprite, changing the color channels of all non-transparent pixels to match a given color
    */
   public fill(color: Color) {
      this.addEffect(new Effects.Fill(color));
   }

   /**
    * Applies the [[Colorize]] effect to a sprite, changing the color channels of all pixels to be the average of the original color
    * and the provided color.
    */
   public colorize(color: Color) {
      this.addEffect(new Effects.Colorize(color));
   }

   /**
    * Applies the [[Lighten]] effect to a sprite, changes the lightness of the color according to HSL
    */
   public lighten(factor: number = 0.1) {
      this.addEffect(new Effects.Lighten(factor));
   }

   /**
    * Applies the [[Darken]] effect to a sprite, changes the darkness of the color according to HSL
    */
   public darken(factor: number = 0.1) {
      this.addEffect(new Effects.Darken(factor));
   }

   /**
    * Applies the [[Saturate]] effect to a sprite, saturates the color according to HSL
    */
   public saturate(factor: number = 0.1) {
      this.addEffect(new Effects.Saturate(factor));
   }

   /**
    * Applies the [[Desaturate]] effect to a sprite, desaturates the color according to HSL
    */
   public desaturate(factor: number = 0.1) {
      this.addEffect(new Effects.Desaturate(factor));
   }

   /**
    * Adds a new [[ISpriteEffect]] to this drawing.
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
    * Removes a [[ISpriteEffect]] from this sprite.
    * @param effect  Effect to remove from this sprite
    */
   public removeEffect(effect: Effects.ISpriteEffect): void;
   
   /**
    * Removes an effect given the index from this sprite.
    * @param index  Index of the effect to remove from this sprite
    */
   public removeEffect(index: number): void;
   public removeEffect(param: any) {
      var indexToRemove = -1;
      if (typeof param === 'number') {
         indexToRemove = param;
      } else {
         indexToRemove = this.effects.indexOf(param);
      }

      // bounds check
      if (indexToRemove < 0 || indexToRemove >= this.effects.length) {
         return;
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
         for (y; y < this.sheight; y++) {
            x = 0;
            for (x; x < this.swidth; x++) {
               this.effects[i].updatePixel(x, y, this._pixelData);
            }
         }
      }
      this._spriteCtx.clearRect(0, 0, this.swidth, this.sheight);
      this._spriteCtx.putImageData(this._pixelData, 0, 0);
      
      this._dirtyEffect = false;
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
      const scaledSWidth = this.width * this.scale.x;
      const scaledSHeight = this.height * this.scale.y;
      var xpoint = (scaledSWidth) * this.anchor.x;
      var ypoint = (scaledSHeight) * this.anchor.y;

      ctx.strokeStyle = Color.Black.toString();
      ctx.strokeRect(-xpoint, -ypoint, scaledSWidth, scaledSHeight);
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
      }
      
      // calculating current dimensions
      this.width = this.naturalWidth * this.scale.x;
      this.height = this.naturalHeight * this.scale.y;
      
      ctx.save();
      var xpoint = this.width * this.anchor.x;
      var ypoint = this.height * this.anchor.y;
      ctx.translate(x, y);
      ctx.rotate(this.rotation);

      var scaledSWidth = this.swidth * this.scale.x;
      var scaledSHeight = this.sheight * this.scale.y;
      
      // todo cache flipped sprites
      if (this.flipHorizontal) {
         ctx.translate(scaledSWidth, 0);
         ctx.scale(-1, 1);
      }

      if (this.flipVertical) {
         ctx.translate(0, scaledSHeight);
         ctx.scale(1, -1);
      }

      ctx.drawImage(this._spriteCanvas, 0, 0, this.swidth, this.sheight, 
         -xpoint, 
         -ypoint, 
         scaledSWidth,
         scaledSHeight);
      
      ctx.restore();
   }

   /**
    * Produces a copy of the current sprite
    */
   public clone(): SpriteImpl {
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

/**
 * [[include:Constructors.md]]
 */
export interface ISpriteArgs extends Partial<SpriteImpl> {
   image: Texture;
   sx: number;
   sy: number;
   swidth: number;
   sheight: number;
   rotation?: number;
   anchor?: Vector;
   scale?: Vector;
   flipVertical?: boolean;
   flipHorizontal?: boolean;
} 

/**
 * A [[Sprite]] is one of the main drawing primitives. It is responsible for drawing
 * images or parts of images from a [[Texture]] resource to the screen.
 *
 * [[include:Sprites.md]]
 */
export class Sprite extends Configurable(SpriteImpl) {
   constructor(config: ISpriteArgs);
   constructor(image: Texture, sx: number, sy: number, swidth: number, sheight: number)
   constructor(imageOrConfig: Texture | ISpriteArgs, sx?: number, sy?: number, swidth?: number, sheight?: number) {
      super(imageOrConfig, sx, sy, swidth, sheight);
   }
}

