/// <reference path="../SpriteEffects.ts" />

module ex {
   /**
    * Interface for implementing anything in Excalibur that can be drawn to the screen.
    * @class IDrawable
    */
   export interface IDrawable {
      /**
       * Indicates whether the drawing is to be flipped vertically
       * @property flipVertical {boolean}
       */
      flipVertical: boolean;
      /**
       * Indicates whether the drawing is to be flipped horizontally
       * @property flipHorizontal {boolean}
       */
      flipHorizontal: boolean;
      /**
       * Indicates the width of the drawing in pixels
       * @property width {number}
       */
      width: number;
      /**
       * Indicates the height of the drawing in pixels
       * @property height {number}
       */
      height: number;

      /**
       * Adds a new {{#crossLink ISpriteEffect}}{{/crossLink}} to this drawing.
       * @method addEffect
       * @param effect {ISpriteEffect} Effect to add to the this drawing
       */
      addEffect(effect: ex.Effects.ISpriteEffect);

      /**
       * Removes an effect {{#crossLink ISpriteEffect}}{{/crossLink}} from this drawing.
       * @method removeEffect
       * @param effect {{ISpriteEffect}} Effect to remove from this drawing
       */
      removeEffect(effect: ex.Effects.ISpriteEffect);

      /**
       * Removes an effect by index from this drawing.
       * @method removeEffect
       * @param index {{number}} Index of the effect to remove from this drawing
       */
      removeEffect(index: number);
      removeEffect(param: any);


      /**
       * Clears all effects from the drawing and return it to its original state.
       * @method clearEffects
       */
      clearEffects();

      /**
       * Gets or sets the point about which to apply transformations to the drawing relative to the 
       * top left corner of the drawing.
       * @property anchor
       */
      anchor: ex.Point;


      /**
       * Gets or sets the scale trasformation
       * @property scale
       */
      scale: ex.Point;

      /**
       * Sets the current rotation transformation for the drawing.
       * @property rotation
       */
      rotation: number;

      /**
       * Resets the internal state of the drawing (if any)
       * @method reset
       */
      reset();

      /**
       * Draws the sprite appropriately to the 2D rendering context.
       * @method draw
       * @param ctx {CanvasRenderingContext2D} The 2D rendering context
       * @param x {number} The x coordinate of where to draw
       * @param y {number} The y coordinate of where to draw
       */
      draw(ctx: CanvasRenderingContext2D, x: number, y: number);
   }
}