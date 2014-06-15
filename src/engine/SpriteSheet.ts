/// <reference path="Sprite.ts" />

module ex {
   /**
    * SpriteSheets are a useful mechanism for slicing up image resources into
    * separate sprites or for generating in game animations. Sprites are organized
    * in row major order in the SpriteSheet.
    * @class SpriteSheet
    * @constructor 
    * @param image {Texture} The backing image texture to build the SpriteSheet
    * @param columns {number} The number of columns in the image texture
    * @param rows {number} The number of rows in the image texture
    * @param spWidth {number} The width of each individual sprite in pixels
    * @param spHeight {number} The height of each individual sprite in pixels
    */
   export class SpriteSheet {
      public sprites: Sprite[] = [];
      private _internalImage: HTMLImageElement;

      constructor(public image: Texture, private _columns: number, private _rows: number, spWidth: number, spHeight: number) {
         this._internalImage = image.image;
         this.sprites = new Array(_columns * _rows);

         // TODO: Inspect actual image dimensions with preloading
         /*if(spWidth * columns > this.internalImage.naturalWidth){
            throw new Error("SpriteSheet specified is wider than image width");
         }

         if(spHeight * rows > this.internalImage.naturalHeight){
            throw new Error("SpriteSheet specified is higher than image height");
         }*/

         var i = 0;
         var j = 0;
         for (i = 0; i < _rows; i++) {
            for (j = 0; j < _columns; j++) {
               this.sprites[j + i * _columns] = new Sprite(this.image, j * spWidth, i * spHeight, spWidth, spHeight);
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
         var images: Sprite[] = indices.map((index) => {
            return this.sprites[index];
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
            return this.sprites[index];
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
      private _spriteLookup: { [key: string]: number; } = {};
      private _colorLookup: {[key: string]: Sprite[];} = {};
      private __currentColor: Color = Color.Black;
      constructor(public image: Texture, private _alphabet: string, private _caseInsensitive: boolean, columns: number, rows: number, spWidth: number, spHeight: number) {
         super(image, columns, rows, spWidth, spHeight);
      }

      /**
       * Returns a dictionary that maps each character in the alphabet to the appropriate Sprite.
       * @method getTextSprites
       * @returns {Object}
       */
      public getTextSprites(): { [key: string]: Sprite; }{
         var lookup: { [key: string]: Sprite; } = {};
         for (var i = 0; i < this._alphabet.length; i++) {
            var char = this._alphabet[i];
            if (this._caseInsensitive) {
               char = char.toLowerCase();
            }
            lookup[char] = this.sprites[i].clone();
         }
         return lookup;
      }
   }
}