/// <reference path="Actor.ts" />

module ex {
   /**
    * Enum representing the different horizontal text alignments
    * @class TextAlign
    */
   export enum TextAlign {
      /**
       * The text is left-aligned.
       * @property Left
       * @static 
       */
      Left,
      /**
       * The text is right-aligned.
       * @property Right
       * @static 
       */
      Right,
      /**
       * The text is centered.
       * @property Center
       * @static 
       */
      Center,
      /**
       * The text is aligned at the normal start of the line (left-aligned for left-to-right locales, right-aligned for right-to-left locales).
       * @property Start
       * @static 
       */
      Start,
      /**
       * The text is aligned at the normal end of the line (right-aligned for left-to-right locales, left-aligned for right-to-left locales).
       * @property End
       * @static 
       */
      End
   }

   /**
    * Enum representing the different baseline text alignments
    * @class BaseAlign
    */
   export enum BaseAlign {
      /**
       * The text baseline is the top of the em square.
       * @property Top
       * @static 
       */
      Top,
      /**
       * The text baseline is the hanging baseline.  Currently unsupported; this will act like alphabetic.
       * @property Hanging
       * @static 
       */
      Hanging,
      /**
       * The text baseline is the middle of the em square.
       * @property Middle
       * @static 
       */
      Middle,
      /**
       * The text baseline is the normal alphabetic baseline.
       * @property Alphabetic
       * @static 
       */
      Alphabetic,
      /**
       * The text baseline is the ideographic baseline; this is the bottom of 
       * the body of the characters, if the main body of characters protrudes 
       * beneath the alphabetic baseline.  Currently unsupported; this will 
       * act like alphabetic.
       * @property Ideographic
       * @static 
       */
      Ideographic,
      /**
       * The text baseline is the bottom of the bounding box.  This differs
       * from the ideographic baseline in that the ideographic baseline 
       * doesn't consider descenders.
       * @property Bottom
       * @static 
       */
      Bottom
   }

   /**
    * Labels are the way to draw small amounts of text to the screen in Excalibur. They are
    * actors and inherit all of the benifits and capabilities.
    * @class Label
    * @extends Actor
    * @constructor
    * @param [text=empty] {string} The text of the label
    * @param [x=0] {number} The x position of the label
    * @param [y=0] {number} The y position of the label
    * @param [font=sans-serif] {string} Use any valid css font string for the label's font. Default is "10px sans-serif".
    * @param [spriteFont=undefined] {SpriteFont} Use an Excalibur sprite font for the label's font, if a SpriteFont is provided it will take precendence over a css font.
    *
    */
   export class Label extends Actor {

      public text: string;
      public spriteFont: SpriteFont;
      public font: string;
      /**
       * Gets or sets the horizontal text alignment property for the label. 
       * @property textAlign {TextAlign}
       */
      public textAlign: TextAlign;
      /**
       * Gets or sets the baseline alignment property for the label.
       * @property textBaseline {BaseAlign}
       */
      public baseAlign: BaseAlign;
      /**
       * Gets or sets the maximum width (in pixels) that the label should occupy
       * @property maxWidth {number}
       */
      public maxWidth: number;
      /**
       * Gets or sets the letter spacing on a Label. Only supported with Sprite Fonts.
       * @property [letterSpacing=0] {number}
       */
      public letterSpacing: number = 0;//px

      public caseInsensitive: boolean = true;

      private _textShadowOn: boolean = false;
      private _shadowOffsetX: number = 0;
      private _shadowOffsetY: number = 0;
      private _shadowColor: Color = Color.Black.clone();
      private _shadowColorDirty: boolean = false;

      private _textSprites: { [key: string]: Sprite; } = {};
      private _shadowSprites: { [key: string]: Sprite; } = {};

      private _color: Color = Color.Black.clone();
      constructor(text?: string, x?: number, y?: number, font?: string, spriteFont?: SpriteFont) {
         super(x, y);
         this.text = text || "";
         this.color = Color.Black.clone();
         this.spriteFont = spriteFont;
         this.collisionType = CollisionType.PreventCollision;
         this.font = font || "10px sans-serif"; // coallesce to default canvas font
         if (spriteFont) {
            this._textSprites = spriteFont.getTextSprites();
         }
      }


      /**
       * Returns the width of the text in the label (in pixels);
       * @method getTextWidth {number}
       * @param ctx {CanvasRenderingContext2D} Rending context to measure the string with
       */
      public getTextWidth(ctx: CanvasRenderingContext2D): number {
         var oldFont = ctx.font;
         ctx.font = this.font;
         var width = ctx.measureText(this.text).width;
         ctx.font = oldFont;
         return width;
      }

      // TypeScript doesn't support string enums :(
      private _lookupTextAlign(textAlign: TextAlign): string {
         switch (textAlign) {
            case TextAlign.Left:
               return "left";
               break;
            case TextAlign.Right:
               return "right";
               break;
            case TextAlign.Center:
               return "center";
               break;
            case TextAlign.End:
               return "end";
               break;
            case TextAlign.Start:
               return "start";
               break;
            default:
               return "start";
               break;
         }
      }

      private _lookupBaseAlign(baseAlign: BaseAlign): string {
         switch (baseAlign) {
            case BaseAlign.Alphabetic:
               return "alphabetic";
               break;
            case BaseAlign.Bottom:
               return "bottom";
               break;
            case BaseAlign.Hanging:
               return "hangin";
               break;
            case BaseAlign.Ideographic:
               return "ideographic";
               break;
            case BaseAlign.Middle:
               return "middle";
               break;
            case BaseAlign.Top:
               return "top";
               break;
            default:
               return "alphabetic";
               break;
         }
      }

      /**
       * Sets the text shadow for sprite fonts
       * @method setTextShadow
       * @param offsetX {number} The x offset in pixels to place the shadow
       * @param offsetY {number} The y offset in pixles to place the shadow
       * @param shadowColor {Color} The color of the text shadow
       */
      public setTextShadow(offsetX: number, offsetY: number, shadowColor: Color) {
         this._textShadowOn = true;
         this._shadowOffsetX = offsetX;
         this._shadowOffsetY = offsetY;
         this._shadowColor = shadowColor.clone();
         this._shadowColorDirty = true;
         for (var character in this._textSprites) {
            this._shadowSprites[character] = this._textSprites[character].clone();
         }
      }

      /**
       * Clears the current text shadow
       * @method clearTextShadow
       */
      public clearTextShadow() {
         this._textShadowOn = false;
         this._shadowOffsetX = 0;
         this._shadowOffsetY = 0;
         this._shadowColor = Color.Black.clone();
      }

      public update(engine: Engine, delta: number) {
         super.update(engine, delta);

         if (this.spriteFont && this._color !== this.color) {
            for (var character in this._textSprites) {
               this._textSprites[character].clearEffects();
               this._textSprites[character].addEffect(new Effects.Fill(this.color.clone()));
               this._color = this.color;
            }
         }

         if (this.spriteFont && this._textShadowOn && this._shadowColorDirty && this._shadowColor) {
            for (var character in this._shadowSprites) {
               this._shadowSprites[character].clearEffects();
               this._shadowSprites[character].addEffect(new Effects.Fill(this._shadowColor.clone()));
            }
            this._shadowColorDirty = false;
         }
      }

      public draw(ctx: CanvasRenderingContext2D, delta: number) {

         ctx.save();
         ctx.translate(this.x, this.y);
         ctx.scale(this.scale.x, this.scale.y);
         ctx.rotate(this.rotation);

         if (this._textShadowOn) {
            ctx.save();
            ctx.translate(this._shadowOffsetX, this._shadowOffsetY);
            this._fontDraw(ctx, delta, this._shadowSprites);
            ctx.restore();
         }
         this._fontDraw(ctx, delta, this._textSprites);

         super.draw(ctx, delta);
         ctx.restore();
      }

      private _fontDraw(ctx: CanvasRenderingContext2D, delta: number, sprites: { [key: string]: Sprite; }) {

         if (this.spriteFont) {

            var currX = 0;

            for (var i = 0; i < this.text.length; i++) {
               var character = this.text[i];
               if (this.caseInsensitive) {
                  character = character.toLowerCase();
               }
               try {
                  var charSprite = sprites[character];
                  if (this.previousOpacity !== this.opacity) {
                     charSprite.clearEffects();
                     charSprite.addEffect(new ex.Effects.Opacity(this.opacity));
                  }
                  charSprite.draw(ctx, currX, 0);
                  currX += (charSprite.swidth + this.letterSpacing);
               } catch (e) {
                  Logger.getInstance().error("SpriteFont Error drawing char " + character);
               }
            }
            if (this.previousOpacity !== this.opacity) {
               this.previousOpacity = this.opacity;
            }
            //this.spriteFont.draw(ctx, 0, 0, this.text, color, this.letterSpacing);
         } else {
            var oldAlign = ctx.textAlign;
            var oldTextBaseline = ctx.textBaseline;

            ctx.textAlign = this._lookupTextAlign(this.textAlign);
            ctx.textBaseline = this._lookupBaseAlign(this.baseAlign);
            if (this.color) {
               this.color.a = this.opacity;
            }
            ctx.fillStyle = this.color.toString();
            ctx.font = this.font;
            if (this.maxWidth) {
               ctx.fillText(this.text, 0, 0, this.maxWidth);
            } else {
               ctx.fillText(this.text, 0, 0);
            }

            ctx.textAlign = oldAlign;
            ctx.textBaseline = oldTextBaseline;
         }
      }

      public debugDraw(ctx: CanvasRenderingContext2D) {
         super.debugDraw(ctx);
      }

   }
}