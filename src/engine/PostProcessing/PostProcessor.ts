/**
 * Adds post processing support for the engine, can process raw pixel data and manipulate canvas directly.
 */
export interface PostProcessor {
  process(image: ImageData, out: CanvasRenderingContext2D): void;
}
