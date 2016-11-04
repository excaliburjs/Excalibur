/// <reference path="Sprite.ts" />

module ex {

   /**
    * Sprite Sheets
    *
    * Sprite sheets are a useful mechanism for slicing up image resources into
    * separate sprites or for generating in game animations. [[Sprite|Sprites]] are organized
    * in row major order in the [[SpriteSheet]].
    *
    * You can also use a [[SpriteFont]] which is special kind of [[SpriteSheet]] for use
    * with [[Label|Labels]].
    *
    * ## Creating a SpriteSheet
    *
    * To create a [[SpriteSheet]] you need a loaded [[Texture]] resource.
    *
    * ```js
    * var game = new ex.Engine();
    * var txAnimPlayerIdle = new ex.Texture("/assets/tx/anim-player-idle.png");
    *
    * // load assets
    * var loader = new ex.Loader(txAnimPlayerIdle);
    * 
    * // start game
    * game.start(loader).then(function () {
    *   var player = new ex.Actor();
    *  
    *   // create sprite sheet with 5 columns, 1 row, 80x80 frames
    *   var playerIdleSheet = new ex.SpriteSheet(txAnimPlayerIdle, 5, 1, 80, 80);
    *   
    *   // create animation (125ms frame speed)
    *   var playerIdleAnimation = playerIdleSheet.getAnimationForAll(game, 125);
    *  
    *   // add drawing to player as "idle"
    *   player.addDrawing("idle", playerIdleAnimation);
    *
    *   // add player to game
    *   game.add(player);
    * });
    * ```
    *
    * ## Creating animations
    *
    * [[SpriteSheets]] provide a quick way to generate a new [[Animation]] instance.
    * You can use *all* the frames of a [[Texture]] ([[SpriteSheet.getAnimationForAll]])
    * or you can use a range of frames ([[SpriteSheet.getAnimationBetween]]) or you
    * can use specific frames ([[SpriteSheet.getAnimationByIndices]]).
    *
    * To create an [[Animation]] these methods must be passed an instance of [[Engine]].
    * It's recommended to generate animations for an [[Actor]] in their [[Actor.onInitialize]]
    * event because the [[Engine]] is passed to the initialization function. However, if your
    * [[Engine]] instance is in the global scope, you can create an [[Animation]] at any time
    * provided the [[Texture]] has been [[Loader|loaded]].
    *
    * ```js
    *   // create sprite sheet with 5 columns, 1 row, 80x80 frames
    *   var playerIdleSheet = new ex.SpriteSheet(txAnimPlayerIdle, 5, 1, 80, 80);
    *   
    *   // create animation for all frames (125ms frame speed)
    *   var playerIdleAnimation = playerIdleSheet.getAnimationForAll(game, 125);
    *
    *   // create animation for a range of frames (2-4) (125ms frame speed)
    *   var playerIdleAnimation = playerIdleSheet.getAnimationBetween(game, 1, 3, 125);
    *
    *   // create animation for specific frames 2, 4, 5 (125ms frame speed)
    *   var playerIdleAnimation = playerIdleSheet.getAnimationByIndices(game, [1, 3, 4], 125);
    *
    *   // create a repeating animation (ping-pong)
    *   var playerIdleAnimation = playerIdleSheet.getAnimationByIndices(game, [1, 3, 4, 3, 1], 125);
    * ```
    *
    * ## Multiple rows
    *
    * Sheets are organized in "row major order" which means left-to-right, top-to-bottom.
    * Indexes are zero-based, so while you might think to yourself the first column is
    * column "1", to the engine it is column "0". You can easily calculate an index 
    * of a frame using this formula:
    *
    *     Given: col = 5, row = 3, columns = 10
    *
    *     index = col + row * columns
    *     index = 4 + 2 * 10 // zero-based, subtract 1 from col & row
    *     index = 24
    *
    * You can also simply count the frames of the image visually starting from the top left
    * and beginning with zero.
    *
    * ```js
    * // get a sprite for column 3, row 6
    * var sprite = animation.getSprite(2 + 5 * 10)
    * ```
    */
   export class SpriteSheet {
      public sprites: Sprite[] = [];
      private _internalImage: HTMLImageElement;

      /**
       * @param image     The backing image texture to build the SpriteSheet
       * @param columns   The number of columns in the image texture
       * @param rows      The number of rows in the image texture
       * @param spWidth   The width of each individual sprite in pixels
       * @param spHeight  The height of each individual sprite in pixels
       */
      constructor(public image: Texture, private columns: number, private rows: number, spWidth: number, spHeight: number) {
         this._internalImage = image.image;
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
       * @param engine   Reference to the current game [[Engine]]
       * @param indices  An array of sprite indices to use in the animation
       * @param speed    The number in milliseconds to display each frame in the animation
       */
      public getAnimationByIndices(engine: Engine, indices: number[], speed: number) {
         var images: Sprite[] = indices.map((index) => {
            return this.sprites[index];
         });

         images = images.map(function(i) {
            return i.clone();
         });
         return new Animation(engine, images, speed);
      }

      /**
       * Create an animation from the this SpriteSheet by specifing the range of
       * images with the beginning and ending index
       * @param engine      Reference to the current game Engine
       * @param beginIndex  The index to start taking frames
       * @param endIndex    The index to stop taking frames
       * @param speed       The number in milliseconds to display each frame in the animation
       */
      public getAnimationBetween(engine: Engine, beginIndex: number, endIndex: number, speed: number) {
         var images = this.sprites.slice(beginIndex, endIndex);
         images = images.map(function(i) {
            return i.clone();
         });
         return new Animation(engine, images, speed);
      }

      /**
       * Treat the entire SpriteSheet as one animation, organizing the frames in 
       * row major order.
       * @param engine  Reference to the current game [[Engine]]
       * @param speed   The number in milliseconds to display each frame the animation
       */
      public getAnimationForAll(engine: Engine, speed: number) {
         var sprites = this.sprites.map(function(i) {
            return i.clone();
         });
         return new Animation(engine, sprites, speed);
      }

      /**
       * Retreive a specific sprite from the SpriteSheet by its index. Sprites are organized
       * in row major order in the SpriteSheet.
       * @param index  The index of the sprite
       */
      public getSprite(index: number): Sprite {
         if (index >= 0 && index < this.sprites.length) {
            return this.sprites[index];
         }
      }
   }

   /**
    * Sprite Fonts
    *
    * Sprite fonts are a used in conjunction with a [[Label]] to specify
    * a particular bitmap as a font. Note that some font features are not 
    * supported by Sprite fonts.
    *
    * ## Generating the font sheet
    *
    * You can use tools such as [Bitmap Font Builder](http://www.lmnopc.com/bitmapfontbuilder/) to
    * generate a sprite sheet for you to load into Excalibur.
    *
    * ## Creating a sprite font
    *
    * Start with an image with a grid containing all the letters you want to support.
    * Once you load it into Excalibur using a [[Texture]] resource, you can create
    * a [[SpriteFont]] using the constructor.
    *
    * For example, here is a representation of a font sprite sheet for an uppercase alphabet
    * with 4 columns and 7 rows:
    *
    * ```
    * ABCD
    * EFGH
    * IJKL
    * MNOP
    * QRST
    * UVWX
    * YZ
    * ```
    *
    * Each letter is 30x30 and after Z is a blank one to represent a space.
    *
    * Then to create the [[SpriteFont]]:
    *
    * ```js
    * var game = new ex.Engine();
    * var txFont = new ex.Texture("/assets/tx/font.png");
    *
    * // load assets
    * var loader = new ex.Loader(txFont);
    * 
    * // start game
    * game.start(loader).then(function () {
    * 
    *   // create a font
    *   var font = new ex.SpriteFont(txFont, "ABCDEFGHIJKLMNOPQRSTUVWXYZ ", true, 4, 7, 30, 30);
    *
    *   // create a label using this font
    *   var label = new ex.Label("Hello World", 0, 0, null, font);
    *
    *   // display in-game
    *   game.add(label);
    *
    * });
    * ```
    *
    * If you want to use a lowercase representation in the font, you can pass `false` for [[caseInsensitive]]
    * and the matching will be case-sensitive. In our example, you would need another 7 rows of 
    * lowercase characters.
    *
    * ## Font colors
    *    
    * When using sprite fonts with a [[Label]], you can set the [[Label.color]] property
    * to use different colors.
    *
    * ## Known Issues
    *
    * **One font per Label**
    * [Issue #172](https://github.com/excaliburjs/Excalibur/issues/172)
    *
    * If you intend on changing colors or applying opacity effects, you have to use
    * a new [[SpriteFont]] instance per [[Label]].
    *
    * **Using opacity removes other effects**
    * [Issue #148](https://github.com/excaliburjs/Excalibur/issues/148)
    *
    * If you apply any custom effects to the sprites in a SpriteFont, including trying to
    * use [[Label.color]], they will be removed when modifying [[Label.opacity]].
    *
    */
   export class SpriteFont extends SpriteSheet {
      private _spriteLookup: { [key: string]: number; } = {};
      private _colorLookup: { [key: string]: Sprite[]; } = {};
      private _currentColor: Color = Color.Black.clone();
      private _currentOpacity: Number = 1.0;
      private _sprites: { [key: string]: Sprite; } = {};

      // text shadow
      private _textShadowOn: boolean = false;
      private _textShadowDirty: boolean = true;
      private _textShadowColor: Color = Color.Black.clone();
      private _textShadowSprites: { [key: string]: Sprite; } = {};
      private _shadowOffsetX: number = 5;
      private _shadowOffsetY: number = 5;

      

      /**
       * @param image           The backing image texture to build the SpriteFont
       * @param alphabet        A string representing all the characters in the image, in row major order.
       * @param caseInsensitive  Indicate whether this font takes case into account 
       * @param columns         The number of columns of characters in the image
       * @param rows            The number of rows of characters in the image
       * @param spWidth         The width of each character in pixels
       * @param spHeight        The height of each character in pixels
       */
      constructor(public image: Texture,
         private alphabet: string,
         private caseInsensitive: boolean,
         columns: number,
         rows: number,
         public spWidth: number,
         public spHeight: number) {
         super(image, columns, rows, spWidth, spHeight);
         this._sprites = this.getTextSprites();
      }

      /**
       * Returns a dictionary that maps each character in the alphabet to the appropriate [[Sprite]].
       */
      public getTextSprites(): { [key: string]: Sprite; } {
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

      /**
       * Sets the text shadow for sprite fonts
       * @param offsetX      The x offset in pixels to place the shadow
       * @param offsetY      The y offset in pixels to place the shadow
       * @param shadowColor  The color of the text shadow
       */
      public setTextShadow(offsetX: number, offsetY: number, shadowColor: Color) {
         this._textShadowOn = true;
         this._shadowOffsetX = offsetX;
         this._shadowOffsetY = offsetY;
         this._textShadowColor = shadowColor.clone();
         this._textShadowDirty = true;
         for (var character in this._sprites) {
            this._textShadowSprites[character] = this._sprites[character].clone();
         }
      }

      /**
       * Toggles text shadows on or off
       */
      public useTextShadow(on: boolean) {
         this._textShadowOn = on;
         if (on) {
            this.setTextShadow(5, 5, this._textShadowColor);
         }
      }
      
      /**
       * Draws the current sprite font 
       */
      public draw(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, options: ISpriteFontOptions) {
         options = this._parseOptions(options);
         
         if (this._currentColor.toString() !== options.color.toString() || this._currentOpacity !== options.opacity) {
            this._currentOpacity = options.opacity;
            this._currentColor = options.color;
            for (var char in this._sprites) {
               this._sprites[char].clearEffects();
               this._sprites[char].fill(options.color);
               this._sprites[char].opacity(options.opacity);
            }
         }

         if (this._textShadowOn && this._textShadowDirty && this._textShadowColor) {
            for (var characterShadow in this._textShadowSprites) {
               this._textShadowSprites[characterShadow].clearEffects();
               this._textShadowSprites[characterShadow].addEffect(new Effects.Fill(this._textShadowColor.clone()));
            }
            this._textShadowDirty = false;
         }
         
         
         // find the current length of text in pixels
         var sprite = this.sprites[0];
         
         // find the current height fo the text in pixels
         var height = sprite.sheight;
         
         // calculate appropriate scale for font size
         var scale = options.fontSize / height;
         
         var length = (text.length * sprite.swidth * scale) + (text.length * options.letterSpacing);

         var currX = x;
         if (options.textAlign === TextAlign.Left || options.textAlign === TextAlign.Start) {
            currX = x;
         } else if (options.textAlign === TextAlign.Right || options.textAlign === TextAlign.End) {
            currX = x - length;
         } else if (options.textAlign === TextAlign.Center) {
            currX = x - length / 2;
         }
                 

         var currY = y - height * scale;
         if (options.baseAlign === BaseAlign.Top || options.baseAlign === BaseAlign.Hanging) {
            currY = y;
         } else if (options.baseAlign === BaseAlign.Ideographic || 
                    options.baseAlign === BaseAlign.Bottom || 
                    options.baseAlign === BaseAlign.Alphabetic) {
            currY = y - height * scale;
         } else if (options.baseAlign === BaseAlign.Middle) {
            currY = y - (height * scale) / 2;
         }
         
         
         for (var i = 0; i < text.length; i++) {
            var character = text[i];
            if (this.caseInsensitive) {
               character = character.toLowerCase();
            }
            try {
               // if text shadow
               if (this._textShadowOn) {
                  this._textShadowSprites[character].scale.x = scale;
                  this._textShadowSprites[character].scale.y = scale;
                  this._textShadowSprites[character].draw(ctx, currX + this._shadowOffsetX, currY + this._shadowOffsetY);
               }
               
               var charSprite = this._sprites[character];
               charSprite.scale.x = scale;
               charSprite.scale.y = scale;
               charSprite.draw(ctx, currX, currY);
               currX += (charSprite.width + options.letterSpacing);
            } catch (e) {
               Logger.getInstance().error(`SpriteFont Error drawing char ${character}`);
            }
         }
         
      }

      private _parseOptions(options: ISpriteFontOptions): ISpriteFontOptions {
         return {
            fontSize: options.fontSize || 10,
            letterSpacing: options.letterSpacing || 0,
            color: options.color || ex.Color.Black.clone(),
            textAlign: typeof options.textAlign === undefined ? TextAlign.Left : options.textAlign,
            baseAlign: typeof options.baseAlign === undefined ?  BaseAlign.Bottom : options.baseAlign,
            maxWidth: options.maxWidth || -1,
            opacity: options.opacity || 0
         };
      }
   }
   
   /**
    * Specify various font attributes for sprite fonts 
    */
   export interface ISpriteFontOptions {
      color?: Color;
      opacity?: number;
      fontSize?: number;
      letterSpacing?: number;
      textAlign?: TextAlign;
      baseAlign?: BaseAlign;
      maxWidth?: number;
   }
}