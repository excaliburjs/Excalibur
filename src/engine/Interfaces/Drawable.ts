import { Vector } from '../Algebra';
import { SpriteEffect } from '../Drawing/SpriteEffects';

/**
 * @deprecated Will be removed in v0.26.0
 */
export interface DrawOptions {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  drawWidth?: number;
  drawHeight?: number;
  rotation?: number;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  anchor?: Vector;
  offset?: Vector;
  opacity?: number;
}

/**
 * Interface for implementing anything in Excalibur that can be drawn to the screen.
 * @deprecated Will be removed in v0.26.0
 */
export interface Drawable {
  /**
   * Indicates whether the drawing is to be flipped vertically
   */
  flipVertical: boolean;
  /**
   * Indicates whether the drawing is to be flipped horizontally
   */
  flipHorizontal: boolean;
  /**
   * Indicates the current width of the drawing in pixels, factoring in the scale
   */
  drawWidth: number;
  /**
   * Indicates the current height of the drawing in pixels, factoring in the scale
   */
  drawHeight: number;

  /**
   * Indicates the natural width of the drawing in pixels, this is the original width of the source image
   */
  width: number;
  /**
   * Indicates the natural height of the drawing in pixels, this is the original height of the source image
   */
  height: number;

  /**
   * Adds a new [[SpriteEffect]] to this drawing.
   * @param effect  Effect to add to the this drawing
   */
  addEffect(effect: SpriteEffect): void;

  /**
   * Removes an effect [[SpriteEffect]] from this drawing.
   * @param effect  Effect to remove from this drawing
   */
  removeEffect(effect: SpriteEffect): void;

  /**
   * Removes an effect by index from this drawing.
   * @param index  Index of the effect to remove from this drawing
   */
  removeEffect(index: number): void;
  removeEffect(param: any): void;

  /**
   * Clears all effects from the drawing and return it to its original state.
   */
  clearEffects(): void;

  /**
   * Gets or sets the point about which to apply transformations to the drawing relative to the
   * top left corner of the drawing.
   */
  anchor: Vector;

  /**
   * Gets or sets the scale transformation
   */
  scale: Vector;

  /**
   * Sets the current rotation transformation for the drawing.
   */
  rotation: number;

  /**
   * Resets the internal state of the drawing (if any)
   */
  reset(): void;

  /**
   * Draws the sprite appropriately to the 2D rendering context.
   * @param ctx  The 2D rendering context
   * @param x    The x coordinate of where to draw
   * @param y    The y coordinate of where to draw
   */
  draw(ctx: CanvasRenderingContext2D, x: number, y: number): void;

  /**
   * Draws the sprite with custom options to override internals without mutating them.
   * @param options
   */
  draw(options: DrawOptions): void;
}
