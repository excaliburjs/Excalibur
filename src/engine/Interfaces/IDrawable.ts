/// <reference path="../SpriteEffects.ts" />

module ex {
   /**
    * Interface for implementing anything in Excalibur that can be drawn to the screen.
    */
   export interface IDrawable {
      /**
       * Indicates whether the drawing is to be flipped vertically
       */
      flipVertical: boolean;
      /**
       * Indicates whether the drawing is to be flipped horizontally
       */
      flipHorizontal: boolean;
      /**
       * Indicates the width of the drawing in pixels
       */
      width: number;
      /**
       * Indicates the height of the drawing in pixels
       */
      height: number;

      /**
       * Adds a new [[ISpriteEffect]] to this drawing.
       * @param effect  Effect to add to the this drawing
       */
      addEffect(effect: ex.Effects.ISpriteEffect);

      /**
       * Removes an effect [[ISpriteEffect]] from this drawing.
       * @param effect  Effect to remove from this drawing
       */
      removeEffect(effect: ex.Effects.ISpriteEffect);

      /**
       * Removes an effect by index from this drawing.
       * @param index  Index of the effect to remove from this drawing
       */
      removeEffect(index: number);
      removeEffect(param: any);


      /**
       * Clears all effects from the drawing and return it to its original state.
       */
      clearEffects();

      /**
       * Gets or sets the point about which to apply transformations to the drawing relative to the 
       * top left corner of the drawing.
       */
      anchor: ex.Point;


      /**
       * Gets or sets the scale trasformation
       */
      scale: ex.Point;

      /**
       * Sets the current rotation transformation for the drawing.
       */
      rotation: number;

      /**
       * Resets the internal state of the drawing (if any)
       */
      reset();

      /**
       * Draws the sprite appropriately to the 2D rendering context.
       * @param ctx  The 2D rendering context
       * @param x    The x coordinate of where to draw
       * @param y    The y coordinate of where to draw
       */
      draw(ctx: CanvasRenderingContext2D, x: number, y: number);
   }
}