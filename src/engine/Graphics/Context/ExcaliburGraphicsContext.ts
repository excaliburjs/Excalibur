import { Vector } from '../../Math/vector';
import { Color } from '../../Color';
import { ScreenDimension } from '../../Screen';
import { PostProcessor } from '../PostProcessor/PostProcessor';
import { AffineMatrix } from '../../Math/affine-matrix';

export type HTMLImageSource = HTMLImageElement | HTMLCanvasElement;

export interface ExcaliburGraphicsContextOptions {
  canvasElement: HTMLCanvasElement;
  smoothing?: boolean;
  enableTransparency?: boolean;
  snapToPixel?: boolean;
  backgroundColor?: Color;
  useDrawSorting?: boolean;
}

export interface ExcaliburGraphicsContextState {
  opacity: number;
  z: number;
  tint: Color;
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

  /**
   * Draw debug text
   * @param text
   * @param pos
   */
  drawText(text: string, pos: Vector): void;
}

export interface ExcaliburGraphicsContext {
  width: number;
  height: number;

  /**
   * Excalibur will automatically sort draw calls by z and priority for maximal draw performance,
   * this can disrupt a specific desired painter order.
   *
   * To force a specific draw call order, use [[ExcaliburGraphicsContext.z]]
   *
   * By default `useDrawSorting` is `true`, to opt out set this to `false`
   */
  useDrawSorting: boolean;

  /**
   * Set the current z context for the graphics context. Draw calls issued to the context will use this z
   * to inform their sort order.
   *
   * Note it is important to all [[ExcaliburGraphicsContext.save]] and [[ExcaliburGraphicsContext.restore]] when modifying state.
   */
  z: number;

  /**
   * Snaps all drawings to the nearest pixel truncated down, by default false
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
   * Sets the tint color to be multiplied by any images drawn, default is black 0xFFFFFFFF
   */
  tint: Color;

  /**
   * Resets the current transform to the identity matrix
   */
  resetTransform(): void;

  /**
   * Gets the current transform
   */
  getTransform(): AffineMatrix;

  /**
   * Multiplies the current transform by a matrix
   * @param m
   */
  multiply(m: AffineMatrix): void;

  /**
   * Update the context with the current viewport dimensions (used in resizing)
   */
  updateViewport(resolution: ScreenDimension): void;

  /**
   * Access the debug drawing api
   */
  debug: DebugDraw;

  /**
   * Draw an image to the Excalibur Graphics context at an x and y coordinate using the images width and height
   */
  drawImage(image: HTMLImageSource, x: number, y: number): void;
  /**
   *
   * Draw an image to the Excalibur Graphics context at an x and y coordinate with a specific width and height
   */
  drawImage(image: HTMLImageSource, x: number, y: number, width: number, height: number): void;
  /**
   *
   * Draw an image to the Excalibur Graphics context specifying the source image coordinates (sx, sy, swidth, sheight)
   * and to a specific destination on the context (dx, dy, dwidth, dheight)
   */
  drawImage(
    image: HTMLImageSource,
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
   * Draw a solid line to the Excalibur Graphics context
   * @param start
   * @param end
   * @param color
   * @param thickness
   */
  drawLine(start: Vector, end: Vector, color: Color, thickness: number): void;

  /**
   * Draw a solid rectangle to the Excalibur Graphics context
   * @param pos
   * @param width
   * @param height
   * @param color
   */
  drawRectangle(pos: Vector, width: number, height: number, color: Color, stroke?: Color, strokeThickness?: number): void;

  /**
   * Draw a circle to the Excalibur Graphics context
   * @param pos
   * @param radius
   * @param color
   * @param stroke Optionally specify the stroke color
   * @param thickness
   */
  drawCircle(pos: Vector, radius: number, color: Color, stroke?: Color, thickness?: number): void;

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
   * Add a post processor to the graphics context
   *
   * Post processors are run in the order they were added.
   * @param postprocessor
   */
  addPostProcessor(postprocessor: PostProcessor): void;

  /**
   * Remove a specific post processor from the graphics context
   * @param postprocessor
   */
  removePostProcessor(postprocessor: PostProcessor): void;

  /**
   * Remove all post processors from the graphics context
   */
  clearPostProcessors(): void;

  /**
   * Clears the screen with the current background color
   */
  clear(): void;

  /**
   * Flushes the batched draw calls to the screen
   */
  flush(): void;

  beginDrawLifecycle(): void;

  endDrawLifecycle(): void
}
