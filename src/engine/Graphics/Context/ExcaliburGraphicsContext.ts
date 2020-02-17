import { Vector } from '../../Algebra';

export type ImageSource = HTMLImageElement | HTMLCanvasElement | WebGLTexture;

export interface HasExcaliburDraw {
  draw(ex: ExcaliburGraphicsContext, x: number, y: number): void;
}

export interface ExcaliburGraphicsContextState {
  opacity: number;
}

export interface ExcaliburGraphicsContext {
  width: number;
  height: number;

  snapToPixel: boolean;

  opacity: number;

  // diag: ExcaliburContextDiagnostics;

  drawDebugRect(x: number, y: number, width: number, height: number): void;
  drawDebugLine(start: Vector, end: Vector): void;

  /**
   * Draw an image to the Excalibur Graphics context at an x and y coordinate using the images width and height
   */
  drawImage(graphic: ImageSource, x: number, y: number): void;
  /**
   *
   * Draw an image to the Excalibur Graphics context at an x and y coordinate with a specific width and height
   */
  drawImage(graphic: ImageSource, x: number, y: number, width: number, height: number): void;
  /**
   *
   * Draw an image to the Excalibur Graphics context specifying the source image coordinates (sx, sy, swidth, sheight)
   * and to a specific destination on the context (dx, dy, dwidth, dheight)
   */
  drawImage(
    graphic: ImageSource,
    sx: number,
    sy: number,
    swidth?: number,
    sheight?: number,
    dx?: number,
    dy?: number,
    dwidth?: number,
    dheight?: number
  ): void;

  /**
   * Save the current state of the canvas to the stack (transforms and opacity)
   */
  save(): void;
  /**
   * Restore the state of the canvas from the stack
   */
  restore(): void;

  /**
   * Translate the origin of the context by an x and y
   * @param x
   * @param y
   */
  translate(x: number, y: number): void;
  /**
   * Rotate the context about the current origin
   */
  rotate(angle: number): void;
  /**
   * Scale the context by an x and y factor
   * @param x
   * @param y
   */
  scale(x: number, y: number): void;

  /**
   * Flushes the batched draw calls to the screen
   */
  flush(): void;
}
