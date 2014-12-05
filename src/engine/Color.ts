module ex {
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
      constructor(public r: number, public g: number, public b: number, public a?: number) {
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