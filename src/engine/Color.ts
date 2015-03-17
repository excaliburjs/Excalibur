module ex {

   // Internal HSL Color representation
   // http://en.wikipedia.org/wiki/HSL_and_HSV
   // http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
   class HSLColor {
      constructor(public h: number, public s: number, public l: number, public a: number) { }

      public static fromRGBA(r: number, g: number, b: number, a: number): HSLColor {
         r /= 255, g /= 255, b /= 255;
         var max = Math.max(r, g, b), min = Math.min(r, g, b);
         var h, s, l = (max + min) / 2;

         if (max === min) {
            h = s = 0; // achromatic
         } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
               case r: h = (g - b) / d + (g < b ? 6 : 0); break;
               case g: h = (b - r) / d + 2; break;
               case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
         }

         return new HSLColor(h, s, l, a);
      }

      public toRGBA(): Color {
         var r: number, g: number, b: number;

         if (this.s == 0) {
            r = g = b = this.l; // achromatic
         } else {
            function hue2rgb(p: number, q: number, t: number): number {
               if (t < 0) t += 1;
               if (t > 1) t -= 1;
               if (t < 1 / 6) return p + (q - p) * 6 * t;
               if (t < 1 / 2) return q;
               if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
               return p;
            }

            var q = this.l < 0.5 ? this.l * (1 + this.s) : this.l + this.s - this.l * this.s;
            var p = 2 * this.l - q;
            r = hue2rgb(p, q, this.h + 1 / 3);
            g = hue2rgb(p, q, this.h);
            b = hue2rgb(p, q, this.h - 1 / 3);
         }

         return new Color(r * 255, g * 255, b * 255, this.a);
      }
   }

   export class Color {
      /**
       * Color constant
       * @property Black {ex.Color} 
       * @static 
       * @final
       */
      public static Black: Color = Color.fromHex('#000000');
      /**
       * Color constant
       * @property White {ex.Color} 
       * @static 
       * @final
       */
      public static White: Color = Color.fromHex('#FFFFFF');

      /**
       * Color constant
       * @property Gray {ex.Color}
       * @static
       * @final
       */
      public static Gray: Color = Color.fromHex('#808080');

      /**
       * Color constant
       * @property LightGray {ex.Color}
       * @static
       * @final
       */
      public static LightGray: Color = Color.fromHex('#D3D3D3');

      /**
       * Color constant
       * @property DarkGray {ex.Color}
       * @static
       * @final
       */
      public static DarkGray: Color = Color.fromHex('#A9A9A9');

      /**
       * Color constant
       * @property Yellow {ex.Color} 
       * @static 
       * @final
       */
      public static Yellow: Color = Color.fromHex('#FFFF00');
      /**
       * Color constant
       * @property Orange {ex.Color} 
       * @static 
       * @final
       */
      public static Orange: Color = Color.fromHex('#FFA500');
      /**
       * Color constant
       * @property Red {ex.Color} 
       * @static 
       * @final
       */
      public static Red: Color = Color.fromHex('#FF0000');
      /**
       * Color constant
       * @property Vermillion {ex.Color} 
       * @static 
       * @final
       */
      public static Vermillion: Color = Color.fromHex('#FF5B31');
      /**
       * Color constant
       * @property Rose {ex.Color} 
       * @static 
       * @final
       */
      public static Rose: Color = Color.fromHex('#FF007F');
      /**
       * Color constant
       * @property Magenta {ex.Color} 
       * @static 
       * @final
       */
      public static Magenta: Color = Color.fromHex('#FF00FF');
      /**
       * Color constant
       * @property Violet {ex.Color} 
       * @static 
       * @final
       */
      public static Violet: Color = Color.fromHex('#7F00FF');
      /**
       * Color constant
       * @property Blue {ex.Color} 
       * @static 
       * @final
       */
      public static Blue: Color = Color.fromHex('#0000FF');
      /**
       * Color constant
       * @property Azure {ex.Color} 
       * @static 
       * @final
       */
      public static Azure: Color = Color.fromHex('#007FFF');
      /**
       * Color constant
       * @property Cyan {ex.Color} 
       * @static 
       * @final
       */
      public static Cyan: Color = Color.fromHex('#00FFFF');
      /**
       * Color constant
       * @property Viridian {ex.Color} 
       * @static 
       * @final
       */
      public static Viridian: Color = Color.fromHex('#59978F');
      /**
       * Color constant
       * @property Green {ex.Color} 
       * @static 
       * @final
       */
      public static Green: Color = Color.fromHex('#00FF00');
      /**
       * Color constant
       * @property Chartreuse {ex.Color} 
       * @static 
       * @final
       */
      public static Chartreuse: Color = Color.fromHex('#7FFF00');
      /**
       * Color constant
       * @property Transparent {ex.Color} 
       * @static 
       * @final
       */
      public static Transparent: Color = Color.fromHex('#FFFFFF00');


      public r: number;
      public g: number;
      public b: number;

      public a: number;

      public h: number;
      public s: number;
      public l: number;

      /**
       * Creates a new instance of Color from an r, g, b, a
       *
       * @class Color
       * @constructor
       * @param r {number} The red component of color (0-255)
       * @param g {number} The green component of color (0-255)
       * @param b {number} The blue component of color (0-255)
       * @param [a=1] {number} The alpha component of color (0-1.0)    
       */
      constructor(r: number, g: number, b: number, a?: number) {
         this.r = r;
         this.g = g;
         this.b = b;
         this.a = (a != null ? a : 1);
      }

      /**
       * Creates a new instance of Color from an r, g, b, a
       *
       * @method fromRGB
       * @static
       * @param r {number} The red component of color (0-255)
       * @param g {number} The green component of color (0-255)
       * @param b {number} The blue component of color (0-255)
       * @param [a=1] {number} The alpha component of color (0-1.0)
       * @returns Color
       */
      public static fromRGB(r: number, g: number, b: number, a?: number): Color {
         return new Color(r, g, b, a);
      }

      /**
       * Creates a new inscance of Color from a hex string
       * 
       * @method fromHex
       * @static
       * @param hex {string} CSS color string of the form #ffffff, the alpha component is optional
       * @returns Color
       */
      public static fromHex(hex: string): Color {
         var hexRegEx: RegExp = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/i;
         var match = null;
         if (match = hex.match(hexRegEx)) {
            var r = parseInt(match[1], 16);
            var g = parseInt(match[2], 16);
            var b = parseInt(match[3], 16);
            var a = 1;
            if (match[4]) {
               a = parseInt(match[4], 16) / 255;
            }
            return new Color(r, g, b, a);
         } else {
            throw new Error("Invalid hex string: " + hex);
         }
      }

      /**
       * Creats a new instance of Color from hsla values
       *
       * @method fromHSL
       * @static
       * @param h {number} Hue is represented [0-1]
       * @param s {number} Saturation is represented [0-1]
       * @param l {number} Luminance is represented [0-1]
       * @param [a=1] {number} Alpha is represented [0-1]
       * @returns Color
       */
      public static fromHSL(h: number, s: number, l: number, a: number = 1.0): Color {
         var temp = new HSLColor(h, s, l, a);
         return temp.toRGBA();
      }

      /**
       * Lightens the current color by a specified amount 
       *
       * @method lighten
       * @param [factor=.1] {number} 
       * @returns Color
       */
      public lighten(factor: number = 0.1): Color {
         var temp = HSLColor.fromRGBA(this.r, this.g, this.b, this.a);
         temp.l += (temp.l * factor);
         return temp.toRGBA();
      }

      /**
       * Darkens the current color by a specified amount 
       *
       * @method darken
       * @param [factor=.1] {number} 
       * @returns Color
       */
      public darken(factor: number = 0.1): Color {
         var temp = HSLColor.fromRGBA(this.r, this.g, this.b, this.a);
         temp.l -= (temp.l * factor);
         return temp.toRGBA();
      }

      /**
       * Saturates the current color by a specified amount 
       *
       * @method saturate
       * @param [factor=.1] {number} 
       * @returns Color
       */
      public saturate(factor: number = 0.1): Color {
         var temp = HSLColor.fromRGBA(this.r, this.g, this.b, this.a);
         temp.s += (temp.s * factor);
         return temp.toRGBA();
      }

      /**
       * Desaturates the current color by a specified amount 
       *
       * @method desaturate
       * @param [factor=.1] {number} 
       * @returns Color
       */
      public desaturate(factor: number = 0.1): Color {
         var temp = HSLColor.fromRGBA(this.r, this.g, this.b, this.a);
         temp.s -= (temp.s * factor);
         return temp.toRGBA();
      }

      /**
       * Multiplies a color by another, results in a darker color
       *
       * @method mulitiply
       * @param color {Color}
       * @returns Color
       */
      public mulitiply(color: Color): Color {
         var newR = ((color.r / 255 * this.r / 255) * 255);
         var newG = ((color.g / 255 * this.g / 255) * 255);
         var newB = ((color.b / 255 * this.b / 255) * 255);
         var newA = (color.a * this.a);
         return new Color(newR, newG, newB, newA);
      }

      /**
       * Screens a color by another, results in a lighter color
       *
       * @method screen
       * @param color {Color}
       * @returns Color
       */
      public screen(color: Color): Color {
         var color1 = color.invert();
         var color2 = color.invert();
         return color1.mulitiply(color2).invert();
      }

      /**
       * Inverts the current color
       *
       * @method invert
       * @returns Color
       */
      public invert(): Color {
         return new Color(255 - this.r, 255 - this.g, 255 - this.b, 1.0 - this.a);
      }

      /**
       * Averages the current color with another
       *
       * @method average
       * @param color {Color} 
       * @returns Color
       */
      public average(color: Color): Color {
         var newR = (color.r + this.r) / 2;
         var newG = (color.g + this.g) / 2;
         var newB = (color.b + this.b) / 2;
         var newA = (color.a + this.a) / 2;
         return new Color(newR, newG, newB, newA);
      }


      /**
       * Returns a CSS string representation of a color. 
       * @method toString
       * @returns string
       */
      public toString() {
         var result = String(this.r.toFixed(0)) + ", " + String(this.g.toFixed(0)) + ", " + String(this.b.toFixed(0));
         if (this.a !== undefined || this.a !== null) {
            return "rgba(" + result + ", " + String(this.a) + ")";
         }
         return "rgb(" + result + ")";
      }

      /**
       * Returns a CSS string representation of a color.
       * @method fillStyle
       * @returns string
       */
      public fillStyle(){
         return this.toString();
      }

      /**
       * Returns a clone of the current color.
       * @method clone
       * @returns Color
       */
      public clone(): Color {
         return new Color(this.r, this.g, this.b, this.a);
      }
   }
}