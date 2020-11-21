import { Vector } from '../../Algebra';
import { Graphic } from '../Graphic';
import { Color } from '../../Drawing/Color';

export type ImageSource = HTMLImageElement | HTMLCanvasElement;

export interface ExcaliburGraphicsContextOptions {
  canvasElement: HTMLCanvasElement;
  smoothing?: boolean;
  enableTransparency?: boolean;
  snapToPixel?: boolean;
  backgroundColor?: Color;
}

export interface ExcaliburGraphicsContextState {
  opacity: number;
  z: number;
}
export interface LineGraphicsOptions {
  color: Color;
}

export interface RectGraphicsOptions {
  color: Color;
}

export interface PointGraphicsOptions {
  color: Color;
  size: number;
}

export interface DebugDraw {
  /**
   * Draw a debugging rectangle to the screen
   * @param x
   * @param y
   * @param width
   * @param height
   * @param rectOptions
   */
  drawRect(x: number, y: number, width: number, height: number, rectOptions?: RectGraphicsOptions): void;
  /**
   * Draw a debugging line to the screen
   * @param start '
   * @param end
   * @param lineOptions
   */
  drawLine(start: Vector, end: Vector, lineOptions?: LineGraphicsOptions): void;
  /**
   * Draw a debugging point to the screen
   * @param point
   * @param pointOptions
   */
  drawPoint(point: Vector, pointOptions?: PointGraphicsOptions): void;
}

export interface ExcaliburGraphicsContext {
  width: number;
  height: number;

  /**
   * Snaps all drawings to the nearest pixel trucated down, by default false
   */
  snapToPixel: boolean;

  /**
   * Enable smoothed drawing (also known as anti-aliasing), by default false
   */
  smoothing: boolean;

  /**
   * Set the background color of the graphics context, default is [[Color.ExcaliburBlue]]
   */
  backgroundColor: Color;

  /**
   * Sets the opacity of the current [[Graphic]] being drawn, default is 1
   */
  opacity: number;

  /**
   * Sets the z index of the current [[Graphic]] being drawn, default is 0
   */
  z: number;

  /**
   * Resets the current transform to the identity matrix
   */
  resetTransform(): void;

  /**
   * Update the context with the curren tviewport dimensions (used in resizing)
   */
  updateViewport(): void;

  /**
   * Access the debug drawing api
   */
  debug: DebugDraw;

  /**
   * Draw an image to the Excalibur Graphics context at an x and y coordinate using the images width and height
   */
  drawImage(graphic: Graphic, x: number, y: number): void;
  /**
   *
   * Draw an image to the Excalibur Graphics context at an x and y coordinate with a specific width and height
   */
  drawImage(graphic: Graphic, x: number, y: number, width: number, height: number): void;
  /**
   *
   * Draw an image to the Excalibur Graphics context specifying the source image coordinates (sx, sy, swidth, sheight)
   * and to a specific destination on the context (dx, dy, dwidth, dheight)
   */
  drawImage(
    graphic: Graphic,
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
   * Clears the screen with the current background color
   */
  clear(): void;

  /**
   * Flushes the batched draw calls to the screen
   */
  flush(): void;
}
