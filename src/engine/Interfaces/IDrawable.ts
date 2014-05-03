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
       * Clears all effects from the drawing and return it to its original state.
       * @method clearEffects
       */
      clearEffects();

      /**
       * Sets the point about which to apply transformations to the drawing relative to the 
       * top left corner of the drawing.
       * @method transformAbotPoint
       * @param point {Point} The point about which to apply transformations
       */
      transformAboutPoint(point: ex.Point);

      /**
       * Sets the scale trasformation
       * @method setScale
       * @param scale {number} The magnitude to scale the drawing in the x direction
       */
      setScaleX(scale: number);

      /**
       * Sets the scale trasformation
       * @method setScale
       * @param scale {number} The magnitude to scale the drawing in the y direction
       */
      setScaleY(scale: number);

      /**
       * Returns the current magnitude of the drawing's scale in the x direction.
       * @method getScaleX
       * @returns number
       */
      getScaleX(): number;

      /**
       * Returns the current magnitude of the drawing's scale in the y direction.
       * @method getScaleY
       * @returns number
       */
      getScaleY(): number;

      /**
       * Sets the current rotation transformation for the drawing.
       * @method setRotation
       * @param radians {number} The rotation to apply to the drawing.
       */
      setRotation(radians: number);

      /**
       * Returns the current rotation for the drawing.
       * @method getRotation
       * @returns number
       */
      getRotation(): number;

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