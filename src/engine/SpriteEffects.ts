module ex {
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
       * Applies the "Lighten" effect to a sprite
       * @class Effects.Lighten
       * @extends ISpriteEffect
       * @constructor
       * @param number {number} 
       */
      export class Lighten implements ISpriteEffect {
         constructor(public factor: number = 0.1) { }
         updatePixel(x: number, y: number, imageData: ImageData): void {
            var firstPixel = (x + y * imageData.width) * 4;
            var pixel = imageData.data;
            var color = Color.fromRGB(pixel[firstPixel + 0], pixel[firstPixel + 1], pixel[firstPixel + 2], pixel[firstPixel + 3]).lighten(this.factor);

            pixel[firstPixel + 0] = color.r;
            pixel[firstPixel + 1] = color.g;
            pixel[firstPixel + 2] = color.b;
            pixel[firstPixel + 3] = color.a;

         }
      }

      /**
       * Applies the "Darken" effect to a sprite
       * @class Effects.Darken
       * @extends ISpriteEffect
       * @constructor
       * @param factor {number}
       */
      export class Darken implements ISpriteEffect {
         constructor(public factor: number = 0.1) { }
         updatePixel(x: number, y: number, imageData: ImageData): void {
            var firstPixel = (x + y * imageData.width) * 4;
            var pixel = imageData.data;
            var color = Color.fromRGB(pixel[firstPixel + 0], pixel[firstPixel + 1], pixel[firstPixel + 2], pixel[firstPixel + 3]).darken(this.factor);

            pixel[firstPixel + 0] = color.r;
            pixel[firstPixel + 1] = color.g;
            pixel[firstPixel + 2] = color.b;
            pixel[firstPixel + 3] = color.a;

         }
      }

      /**
       * Applies the "Saturate" effect to a sprite
       * @class Effects.Saturate
       * @extends ISpriteEffect
       * @constructor
       * @param factor {number}
       */
      export class Saturate implements ISpriteEffect {
         constructor(public factor: number = 0.1) { }
         updatePixel(x: number, y: number, imageData: ImageData): void {
            var firstPixel = (x + y * imageData.width) * 4;
            var pixel = imageData.data;
            var color = Color.fromRGB(pixel[firstPixel + 0], pixel[firstPixel + 1], pixel[firstPixel + 2], pixel[firstPixel + 3]).saturate(this.factor);

            pixel[firstPixel + 0] = color.r;
            pixel[firstPixel + 1] = color.g;
            pixel[firstPixel + 2] = color.b;
            pixel[firstPixel + 3] = color.a;

         }
      }

      /**
       * Applies the "Desaturate" effect to a sprite
       * @class Effects.Desaturate
       * @extends ISpriteEffect
       * @constructor
       * @param factor {number}
       */
      export class Desaturate implements ISpriteEffect {
         constructor(public factor: number = 0.1) { }
         updatePixel(x: number, y: number, imageData: ImageData): void {
            var firstPixel = (x + y * imageData.width) * 4;
            var pixel = imageData.data;
            var color = Color.fromRGB(pixel[firstPixel + 0], pixel[firstPixel + 1], pixel[firstPixel + 2], pixel[firstPixel + 3]).desaturate(this.factor);

            pixel[firstPixel + 0] = color.r;
            pixel[firstPixel + 1] = color.g;
            pixel[firstPixel + 2] = color.b;
            pixel[firstPixel + 3] = color.a;

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
}