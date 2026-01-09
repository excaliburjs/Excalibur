import type { Vector } from '../../math/vector';
import type { Color } from '../../color';
import type { Resolution } from '../../screen';
import type { PostProcessor } from '../post-processor/post-processor';
import type { AffineMatrix } from '../../math/affine-matrix';
import type { Material, MaterialOptions } from './material';
import { ImageFiltering } from '../filtering';

export type HTMLImageSource = HTMLImageElement | HTMLCanvasElement;

export interface AntialiasOptions {
  /**
   * Turns on the special pixel art sampler in excalibur's image shader for sub pixel
   * anti-aliasing
   *
   * Default false
   */
  pixelArtSampler?: boolean;
  /**
   * Configures the webgl's getContext('webgl2', {antialias: true | false}) or configures
   * Canvas2D imageSmoothing = true;
   *
   * **Note** this option is incompatible with `multiSampleAntialiasing`
   *
   * Default false
   */
  nativeContextAntialiasing?: boolean;
  /**
   * Configures the internal render buffer multi-sampling settings
   *
   * Default true, with max samples that the platform supports
   */
  multiSampleAntialiasing?:
    | boolean
    | {
        /**
         * Optionally specify number of samples (will be clamped to the max the platform supports)
         *
         * Default most platforms are 16 samples
         */
        samples: number;
      };
  /**
   * Sets the default image filtering for excalibur
   *
   * Default {@apilink ImageFiltering.Blended}
   */
  filtering?: ImageFiltering;
  /**
   * Sets the canvas image rendering CSS style
   *
   * Default 'auto'
   */
  canvasImageRendering?: 'pixelated' | 'auto';
}

export const DefaultAntialiasOptions: Required<AntialiasOptions> = {
  pixelArtSampler: false,
  nativeContextAntialiasing: false,
  multiSampleAntialiasing: true,
  filtering: ImageFiltering.Blended,
  canvasImageRendering: 'auto'
};

export const DefaultPixelArtOptions: Required<AntialiasOptions> = {
  pixelArtSampler: true,
  nativeContextAntialiasing: false,
  multiSampleAntialiasing: true,
  filtering: ImageFiltering.Blended,
  canvasImageRendering: 'auto'
};

export interface ExcaliburGraphicsContextOptions {
  /**
   * Target existing html canvas element
   */
  canvasElement: HTMLCanvasElement;
  /**
   * Enables antialiasing on the canvas context (smooths pixels with default canvas sampling)
   */
  antialiasing?: boolean;
  /**
   * Enable the sub pixel antialiasing pixel art sampler for nice looking pixel art
   */
  pixelArtSampler?: boolean;
  /**
   * Enable canvas transparency
   */
  enableTransparency?: boolean;
  /**
   * Enable or disable multi-sample antialiasing in the internal render buffer.
   *
   * If true the max number of samples will be used
   *
   * By default enabled
   */
  multiSampleAntialiasing?:
    | boolean
    | {
        /**
         * Specify number of samples to use during the multi sample anti-alias, if not specified the max will be used.
         * Limited by the hardware (usually 16)
         */
        samples: number;
      };
  /**
   * UV padding in pixels to use in the internal image rendering
   *
   * Recommended .25 - .5 of a pixel
   */
  uvPadding?: number;
  /**
   * Hint the power preference to the graphics context
   */
  powerPreference?: 'default' | 'high-performance' | 'low-power';
  /**
   * Snaps the pixel to an integer value (floor)
   */
  snapToPixel?: boolean;
  /**
   * Current clearing color of the context
   */
  backgroundColor?: Color;
  /**
   * Feature flag that enables draw sorting will removed in v0.29
   */
  useDrawSorting?: boolean;
}

export interface ExcaliburGraphicsContextState {
  opacity: number;
  z: number;
  tint: Color | null | undefined;
  material: Material | null | undefined;
}
export interface LineGraphicsOptions {
  color?: Color;
  dashed?: boolean;
  lineWidth?: number;
}

export interface RectGraphicsOptions {
  color?: Color;
  dashed?: boolean;
  lineWidth?: number;
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
   * Draw a circle to the Excalibur Graphics context
   * @param pos
   * @param radius
   * @param color
   * @param stroke Optionally specify the stroke color
   * @param thickness
   */
  drawCircle(pos: Vector, radius: number, color: Color, stroke?: Color, thickness?: number): void;

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
   * To force a specific draw call order, use {@apilink ExcaliburGraphicsContext.z}
   *
   * By default `useDrawSorting` is `true`, to opt out set this to `false`
   */
  useDrawSorting: boolean;

  /**
   * Set the current z context for the graphics context. Draw calls issued to the context will use this z
   * to inform their sort order.
   *
   * Note it is important to all {@apilink ExcaliburGraphicsContext.save} and {@apilink ExcaliburGraphicsContext.restore} when modifying state.
   */
  z: number;

  /**
   * Snaps all drawings to the nearest pixel truncated down, by default false
   */
  snapToPixel: boolean;

  /**
   * Enable smoothed drawing (also known as anti-aliasing), by default true
   */
  smoothing: boolean;

  /**
   * Set the background color of the graphics context, default is {@apilink Color.ExcaliburBlue}
   */
  backgroundColor: Color;

  /**
   * Sets the opacity of the current {@apilink Graphic} being drawn, default is 1
   */
  opacity: number;

  /**
   * Sets the tint color to be multiplied by any images drawn, default is black 0xFFFFFFFF
   */
  tint: Color | null | undefined;

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
  updateViewport(resolution: Resolution): void;

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
   * Updates all post processors in the graphics context
   *
   * Called internally by Excalibur
   * @param elapsed
   * @internal
   */
  updatePostProcessors(elapsed: number): void;

  /**
   * Gets or sets the material to be used in the current context's drawings
   *
   * This allows customs shaders to be used but draw calls are no longer batched by default.
   * @param material
   */
  material: Material | null | undefined;

  /**
   * Creates and initializes the material which compiles the internal shader
   * @param options
   * @returns
   */
  createMaterial(options: Omit<MaterialOptions, 'graphicsContext'>): Material;

  /**
   * Clears the screen with the current background color
   */
  clear(): void;

  /**
   * Flushes the batched draw calls to the screen
   */
  flush(): void;

  beginDrawLifecycle(): void;

  endDrawLifecycle(): void;

  dispose(): void;
}
