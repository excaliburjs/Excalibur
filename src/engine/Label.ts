/// <reference path="Actor.ts" />

module ex {

   /**
    * Enum representing the different font size units
    * https://developer.mozilla.org/en-US/docs/Web/CSS/font-size
    */ 
   export enum FontUnit {
      /**
       * Em is a scalable unit, 1 em is equal to the current font size of the current element, parent elements can effect em values
       */
      Em,
      /**
       * Rem is similar to the Em, it is a scalable unit. 1 rem is eqaul to the font size of the root element
       */
      Rem,
      /**
       * Pixel is a unit of length in screen pixels
       */
      Px,
      /**
       * Point is a physical unit length (1/72 of an inch)
       */
      Pt,
      /**
       * Percent is a scalable unit similar to Em, the only difference is the Em units scale faster when Text-Size stuff
       */
      Percent
   }

   /**
    * Enum representing the different horizontal text alignments
    */
   export enum TextAlign {
      /**
       * The text is left-aligned.
       */
      Left,
      /**
       * The text is right-aligned.
       */
      Right,
      /**
       * The text is centered.
       */
      Center,
      /**
       * The text is aligned at the normal start of the line (left-aligned for left-to-right locales, 
       * right-aligned for right-to-left locales).
       */
      Start,
      /**
       * The text is aligned at the normal end of the line (right-aligned for left-to-right locales, 
       * left-aligned for right-to-left locales).
       */
      End
   }

   /**
    * Enum representing the different baseline text alignments
    */
   export enum BaseAlign {
      /**
       * The text baseline is the top of the em square.
       */
      Top,
      /**
       * The text baseline is the hanging baseline.  Currently unsupported; this will act like 
       * alphabetic.
       */
      Hanging,
      /**
       * The text baseline is the middle of the em square.
       */
      Middle,
      /**
       * The text baseline is the normal alphabetic baseline.
       */
      Alphabetic,
      /**
       * The text baseline is the ideographic baseline; this is the bottom of 
       * the body of the characters, if the main body of characters protrudes 
       * beneath the alphabetic baseline.  Currently unsupported; this will 
       * act like alphabetic.
       */
      Ideographic,
      /**
       * The text baseline is the bottom of the bounding box.  This differs
       * from the ideographic baseline in that the ideographic baseline 
       * doesn't consider descenders.
       */
      Bottom
   }

   /**
    * Labels are the way to draw small amounts of text to the screen. They are
    * actors and inherit all of the benefits and capabilities.
    *
    * [[include:Labels.md]]
    */
   export class Label extends Actor {

      /**
       * The text to draw.
       */
      public text: string;

      /**
       * The [[SpriteFont]] to use, if any. Overrides [[font]] if present.
       */
      public spriteFont: SpriteFont;

      /**
       * The CSS font family string (e.g. `sans-serif`, `Droid Sans Pro`). Web fonts
       * are supported, same as in CSS.
       */
      public fontFamily: string;
      
      /**
       * The font size in the selected units, default is 10 (default units is pixel)
       */
      public fontSize: number = 10;

      /**
       * The css units for a font size such as px, pt, em (SpriteFont only support px), by default is 'px';
       */ 
      public fontUnit: FontUnit = FontUnit.Px;

      /**
       * Gets or sets the horizontal text alignment property for the label. 
       */
      public textAlign: TextAlign = TextAlign.Left;

      /**
       * Gets or sets the baseline alignment property for the label.
       */
      public baseAlign: BaseAlign = BaseAlign.Bottom;

      /**
       * Gets or sets the maximum width (in pixels) that the label should occupy
       */
      public maxWidth: number;
      
      /**
       * Gets or sets the letter spacing on a Label. Only supported with Sprite Fonts.
       */
      public letterSpacing: number = 0; //px

      /**
       * Whether or not the [[SpriteFont]] will be case-sensitive when matching characters.
       */
      public caseInsensitive: boolean = true;

      private _textShadowOn: boolean = false;
      private _shadowOffsetX: number = 0;
      private _shadowOffsetY: number = 0;
      private _shadowColor: Color = Color.Black.clone();
      private _shadowColorDirty: boolean = false;

      private _textSprites: { [key: string]: Sprite; } = {};
      private _shadowSprites: { [key: string]: Sprite; } = {};

      private _color: Color = Color.Black.clone();
      
      /**
       * @param text        The text of the label
       * @param x           The x position of the label
       * @param y           The y position of the label
       * @param fontFamily  Use any valid CSS font string for the label's font. Web fonts are supported. Default is `10px sans-serif`.
       * @param spriteFont  Use an Excalibur sprite font for the label's font, if a SpriteFont is provided it will take precedence 
       * over a css font.
       */
      constructor(text?: string, x?: number, y?: number, fontFamily?: string, spriteFont?: SpriteFont) {
         super(x, y);
         this.text = text || '';
         this.color = Color.Black.clone();
         this.spriteFont = spriteFont;
         this.collisionType = CollisionType.PreventCollision;                  
         this.fontFamily = fontFamily || 'sans-serif'; // coalesce to default canvas font
         if (spriteFont) {
            //this._textSprites = spriteFont.getTextSprites();
         }
      }


      /**
       * Returns the width of the text in the label (in pixels);
       * @param ctx  Rendering context to measure the string with
       */
      public getTextWidth(ctx: CanvasRenderingContext2D): number {
         var oldFont = ctx.font;
         ctx.font = this._fontString;
         var width = ctx.measureText(this.text).width;
         ctx.font = oldFont;
         return width;
      }

      // TypeScript doesn't support string enums :(
      private _lookupFontUnit(fontUnit: FontUnit): string {
         switch (fontUnit) {
            case FontUnit.Em:
               return 'em';
            case FontUnit.Rem:
               return 'rem';
            case FontUnit.Pt:
               return 'pt';
            case FontUnit.Px:
               return 'px';
            case FontUnit.Percent:
               return '%';
            default:
               return 'px';
         }
      }

      private _lookupTextAlign(textAlign: TextAlign): string {
         switch (textAlign) {
            case TextAlign.Left:
               return 'left';
            case TextAlign.Right:
               return 'right';
            case TextAlign.Center:
               return 'center';
            case TextAlign.End:
               return 'end';
            case TextAlign.Start:
               return 'start';
            default:
               return 'start';
         }
      }

      private _lookupBaseAlign(baseAlign: BaseAlign): string {
         switch (baseAlign) {
            case BaseAlign.Alphabetic:
               return 'alphabetic';
            case BaseAlign.Bottom:
               return 'bottom';
            case BaseAlign.Hanging:
               return 'hangin';
            case BaseAlign.Ideographic:
               return 'ideographic';
            case BaseAlign.Middle:
               return 'middle';
            case BaseAlign.Top:
               return 'top';
            default:
               return 'alphabetic';
         }
      }

      /**
       * Sets the text shadow for sprite fonts
       * @param offsetX      The x offset in pixels to place the shadow
       * @param offsetY      The y offset in pixels to place the shadow
       * @param shadowColor  The color of the text shadow
       */
      public setTextShadow(offsetX: number, offsetY: number, shadowColor: Color) {
         this.spriteFont.setTextShadow(offsetX, offsetY, shadowColor);
      }

      /**
       * Toggles text shadows on or off, only applies when using sprite fonts
       */
      public useTextShadow(on: boolean) {
         this.spriteFont.useTextShadow(on);
      }

      /**
       * Clears the current text shadow
       */
      public clearTextShadow() {
         this._textShadowOn = false;
         this._shadowOffsetX = 0;
         this._shadowOffsetY = 0;
         this._shadowColor = Color.Black.clone();
      }

      public update(engine: Engine, delta: number) {
         super.update(engine, delta);

          /*
         if (this.spriteFont && (this._color !== this.color || this.previousOpacity !== this.opacity)) {
            for (var character in this._textSprites) {
               this._textSprites[character].clearEffects();
               this._textSprites[character].fill(this.color.clone());
               this._textSprites[character].opacity(this.opacity);
               
            }
            this._color = this.color;
            this.previousOpacity = this.opacity;
         }

         if (this.spriteFont && this._textShadowOn && this._shadowColorDirty && this._shadowColor) {
            for (var characterShadow in this._shadowSprites) {
               this._shadowSprites[characterShadow].clearEffects();
               this._shadowSprites[characterShadow].addEffect(new Effects.Fill(this._shadowColor.clone()));
            }
            this._shadowColorDirty = false;
         }*/
      }

      public draw(ctx: CanvasRenderingContext2D, delta: number) {

         ctx.save();
         ctx.translate(this.pos.x, this.pos.y);
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
            this.spriteFont.draw(ctx, this.text, 0, 0, {
               color: this.color.clone(),
               baseAlign: this.baseAlign,
               textAlign: this.textAlign,
               fontSize: this.fontSize,
               letterSpacing: this.letterSpacing,
               opacity: this.opacity
            });
         } else {
            var oldAlign = ctx.textAlign;
            var oldTextBaseline = ctx.textBaseline;

            ctx.textAlign = this._lookupTextAlign(this.textAlign);
            ctx.textBaseline = this._lookupBaseAlign(this.baseAlign);
            if (this.color) {
               this.color.a = this.opacity;
            }
            ctx.fillStyle = this.color.toString();
            ctx.font = this._fontString;
            if (this.maxWidth) {
               ctx.fillText(this.text, 0, 0, this.maxWidth);
            } else {
               ctx.fillText(this.text, 0, 0);
            }

            ctx.textAlign = oldAlign;
            ctx.textBaseline = oldTextBaseline;
         }
      }

      protected get _fontString() {
          return `${this.fontSize}${this._lookupFontUnit(this.fontUnit)} ${this.fontFamily}`;
      }

      public debugDraw(ctx: CanvasRenderingContext2D) {
         super.debugDraw(ctx);
      }

   }
}