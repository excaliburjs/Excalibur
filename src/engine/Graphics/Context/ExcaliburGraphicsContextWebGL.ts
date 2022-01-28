import {
  ExcaliburGraphicsContext,
  LineGraphicsOptions,
  RectGraphicsOptions,
  PointGraphicsOptions,
  ExcaliburGraphicsContextOptions,
  DebugDraw,
  HTMLImageSource
} from './ExcaliburGraphicsContext';

import { Matrix } from '../../Math/matrix';
import { TransformStack } from './transform-stack';
import { Vector, vec } from '../../Math/vector';
import { Color } from '../../Color';
import { StateStack } from './state-stack';
import { Logger } from '../../Util/Log';
import { Canvas } from '../Canvas';
import { DebugText } from './debug-text';
import { ScreenDimension } from '../../Screen';
import { RenderTarget } from './render-target';
import { PostProcessor } from '../PostProcessor/PostProcessor';
import { ExcaliburWebGLContextAccessor } from './webgl-adapter';
import { TextureLoader } from './texture-loader';
import { RendererPlugin } from './renderer';

// renderers
import { LineRenderer } from './line-renderer/line-renderer';
import { PointRenderer } from './point-renderer/point-renderer';
import { ScreenPassPainter } from './screen-pass-painter/screen-pass-painter';
import { ImageRenderer } from './image-renderer/image-renderer';
import { RectangleRenderer } from './rectangle-renderer/rectangle-renderer';
import { CircleRenderer } from './circle-renderer/circle-renderer';

class ExcaliburGraphicsContextWebGLDebug implements DebugDraw {
  private _debugText = new DebugText();
  constructor(private _webglCtx: ExcaliburGraphicsContextWebGL) {}

  /**
   * Draw a debugging rectangle to the context
   * @param x
   * @param y
   * @param width
   * @param height
   */
  drawRect(x: number, y: number, width: number, height: number, rectOptions: RectGraphicsOptions = { color: Color.Black }): void {
    this.drawLine(vec(x, y), vec(x + width, y), { ...rectOptions });
    this.drawLine(vec(x + width, y), vec(x + width, y + height), { ...rectOptions });
    this.drawLine(vec(x + width, y + height), vec(x, y + height), { ...rectOptions });
    this.drawLine(vec(x, y + height), vec(x, y), { ...rectOptions });
  }

  /**
   * Draw a debugging line to the context
   * @param start
   * @param end
   * @param lineOptions
   */
  drawLine(start: Vector, end: Vector, lineOptions: LineGraphicsOptions = { color: Color.Black }): void {
    this._webglCtx.draw<LineRenderer>('ex.line', start, end, lineOptions.color);
  }

  /**
   * Draw a debugging point to the context
   * @param point
   * @param pointOptions
   */
  drawPoint(point: Vector, pointOptions: PointGraphicsOptions = { color: Color.Black, size: 5 }): void {
    this._webglCtx.draw<PointRenderer>('ex.point', point, pointOptions.color, pointOptions.size);
  }

  drawText(text: string, pos: Vector) {
    this._debugText.write(this._webglCtx, text, pos);
  }
}

export interface WebGLGraphicsContextInfo {
  transform: TransformStack;
  state: StateStack;
  ortho: Matrix;
  context: ExcaliburGraphicsContextWebGL;
}

export class ExcaliburGraphicsContextWebGL implements ExcaliburGraphicsContext {
  private _logger = Logger.getInstance();
  private _renderers: Map<string, RendererPlugin> = new Map<string, RendererPlugin>();
  private _isDrawLifecycle = false;

  // Main render target
  private _renderTarget: RenderTarget;

  // Postprocessing is a tuple with 2 render targets, these are flip-flopped during the postprocessing process
  private _postProcessTargets: RenderTarget[] = [];

  private _screenRenderer: ScreenPassPainter;

  private _postprocessors: PostProcessor[] = [];
  /**
   * Meant for internal use only. Access the internal context at your own risk and no guarantees this will exist in the future.
   * @internal
   */
  public __gl: WebGLRenderingContext;

  /**
   * Holds the 2d context shim
   */
  private _canvas: Canvas; // Configure z for shim?
  /**
   * Meant for internal use only. Access the internal context at your own risk and no guarantees this will exist in the future.
   * @internal
   */
  public __ctx: CanvasRenderingContext2D;

  private _transform = new TransformStack();
  private _state = new StateStack();
  private _ortho!: Matrix;

  /**
   * Meant for internal use only. Access the internal context at your own risk and no guarantees this will exist in the future.
   * @internal
   */
  public __lineRenderer: LineRenderer;

  /**
   * Meant for internal use only. Access the internal context at your own risk and no guarantees this will exist in the future.
   * @internal
   */
  // public __imageRenderer: ImageRenderer;

  public snapToPixel: boolean = true;

  public smoothing: boolean = false;

  public backgroundColor: Color = Color.ExcaliburBlue;

  public get opacity(): number {
    return this._state.current.opacity;
  }

  public set opacity(value: number) {
    this._state.current.opacity = value;
  }

  public get width() {
    return this.__gl.canvas.width;
  }

  public get height() {
    return this.__gl.canvas.height;
  }

  public get ortho(): Matrix {
    return this._ortho;
  }

  /**
   * Checks the underlying webgl implementation if the requested internal resolution is supported
   * @param dim
   */
  public checkIfResolutionSupported(dim: ScreenDimension): boolean {
    // Slight hack based on this thread https://groups.google.com/g/webgl-dev-list/c/AHONvz3oQTo
    let supported = true;
    if (dim.width > 4096 || dim.height > 4096) {
      supported = false;
    }
    return supported;
  }

  constructor(options: ExcaliburGraphicsContextOptions) {
    const { canvasElement, enableTransparency, smoothing, snapToPixel, backgroundColor } = options;
    this.__gl = canvasElement.getContext('webgl', {
      antialias: smoothing ?? this.smoothing,
      premultipliedAlpha: false,
      alpha: enableTransparency ?? true,
      depth: true,
      powerPreference: 'high-performance'
    });
    ExcaliburWebGLContextAccessor.register(this.__gl);
    TextureLoader.register(this.__gl);
    this.snapToPixel = snapToPixel ?? this.snapToPixel;
    this.smoothing = smoothing ?? this.smoothing;
    this.backgroundColor = backgroundColor ?? this.backgroundColor;
    this._init();
  }

  private _init() {
    const gl = this.__gl;
    // Setup viewport and view matrix
    this._ortho = Matrix.ortho(0, gl.canvas.width, gl.canvas.height, 0, 400, -400);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear background
    gl.clearColor(this.backgroundColor.r / 255, this.backgroundColor.g / 255, this.backgroundColor.b / 255, this.backgroundColor.a);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Enable alpha blending
    // https://www.realtimerendering.com/blog/gpus-prefer-premultiplication/
    gl.enable(gl.BLEND);
    gl.blendEquation(gl.FUNC_ADD);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
    gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // Setup builtin renderers
    this.register(new ImageRenderer());
    this.register(new RectangleRenderer());
    this.register(new CircleRenderer());
    this.register(new PointRenderer());
    this.register(new LineRenderer());

    this._screenRenderer = new ScreenPassPainter(gl);

    this._renderTarget = new RenderTarget({
      gl,
      width: gl.canvas.width,
      height: gl.canvas.height
    });


    this._postProcessTargets = [
      new RenderTarget({
        gl,
        width: gl.canvas.width,
        height: gl.canvas.height
      }),
      new RenderTarget({
        gl,
        width: gl.canvas.width,
        height: gl.canvas.height
      })
    ];

    // 2D ctx shim
    this._canvas = new Canvas({
      width: gl.canvas.width,
      height: gl.canvas.height
    });
    this.__ctx = this._canvas.ctx;
  }

  public register<T extends RendererPlugin>(renderer: T) {
    this._renderers.set(renderer.type, renderer);
    renderer.initialize(this.__gl, this);
  }

  public get(rendererName: string): RendererPlugin {
    return this._renderers.get(rendererName);
  }

  private _currentRenderer: RendererPlugin;

  private _isCurrentRenderer(renderer: RendererPlugin): boolean {
    if (!this._currentRenderer || this._currentRenderer === renderer) {
      return true;
    }
    return false;
  }

  public beginDrawLifecycle() {
    this._isDrawLifecycle = true;
  }

  public endDrawLifecycle() {
    this._isDrawLifecycle = false;
  }

  private _alreadyWarnedDrawLifecycle = false;

  public draw<TRenderer extends RendererPlugin>(rendererName: TRenderer['type'], ...args: Parameters<TRenderer['draw']>) {
    if (!this._isDrawLifecycle && !this._alreadyWarnedDrawLifecycle) {
      this._logger.warn(
        `Attempting to draw outside the the drawing lifecycle (preDraw/postDraw) is not supported and is a source of bugs/errors.\n` +
        `If you want to do custom drawing, use Actor.graphics, or any onPreDraw or onPostDraw handler.`);
      this._alreadyWarnedDrawLifecycle = true;
    }
    // TODO does not handle priority yet...
    //  in order to do this draw commands need to be captured and fed in priority order
    const renderer = this._renderers.get(rendererName);
    if (renderer) {
      // Set the current renderer if not defined
      if (!this._currentRenderer) {
        this._currentRenderer = renderer;
      }

      if (!this._isCurrentRenderer(renderer)) {
        // switching graphics means we must flush the previous
        this._currentRenderer.flush();
      }

      // If we are still using the same renderer we can add to the current batch
      renderer.draw(...args);

      this._currentRenderer = renderer;
    } else {
      throw Error(`No renderer with name ${rendererName} has been registered`);
    }
  }

  public resetTransform(): void {
    this._transform.current = Matrix.identity();
  }

  public updateViewport(resolution: ScreenDimension): void {
    const gl = this.__gl;
    this._ortho = this._ortho = Matrix.ortho(0, resolution.width, resolution.height, 0, 400, -400);

    this._renderTarget.setResolution(gl.canvas.width, gl.canvas.height);
    this._postProcessTargets[0].setResolution(gl.canvas.width, gl.canvas.height);
    this._postProcessTargets[1].setResolution(gl.canvas.width, gl.canvas.height);

    // 2D ctx shim
    this._canvas.width = gl.canvas.width;
    this._canvas.height = gl.canvas.height;
  }

  drawImage(image: HTMLImageSource, x: number, y: number): void;
  drawImage(image: HTMLImageSource, x: number, y: number, width: number, height: number): void;
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
  ): void {
    if (swidth === 0 || sheight === 0) {
      return; // zero dimension dest exit early
    } else if (dwidth === 0 || dheight === 0) {
      return; // zero dimension dest exit early
    } else if (image.width === 0 || image.height === 0) {
      return; // zero dimension source exit early
    }

    if (!image) {
      Logger.getInstance().warn('Cannot draw a null or undefined image');
      // tslint:disable-next-line: no-console
      if (console.trace) {
        // tslint:disable-next-line: no-console
        console.trace();
      }
      return;
    }
    this.draw<ImageRenderer>('ex.image', image, sx, sy, swidth, sheight, dx, dy, dwidth, dheight);
  }

  public drawLine(start: Vector, end: Vector, color: Color, thickness = 1) {
    const rectangleRenderer = this._renderers.get('ex.rectangle') as RectangleRenderer;
    rectangleRenderer.drawLine(start, end, color, thickness);
  }

  public drawRectangle(pos: Vector, width: number, height: number, color: Color, stroke?: Color, strokeThickness?: number) {
    this.draw<RectangleRenderer>('ex.rectangle', pos, width, height, color, stroke, strokeThickness);
  }

  public drawCircle(pos: Vector, radius: number, color: Color, stroke?: Color, thickness?: number) {
    this.draw<CircleRenderer>('ex.circle', pos, radius, color, stroke, thickness);
  }

  debug = new ExcaliburGraphicsContextWebGLDebug(this);

  public save(): void {
    this._transform.save();
    this._state.save();
  }

  public restore(): void {
    this._transform.restore();
    this._state.restore();
  }

  public translate(x: number, y: number): void {
    this._transform.translate(this.snapToPixel ? ~~x : x, this.snapToPixel ? ~~y : y);
  }

  public rotate(angle: number): void {
    this._transform.rotate(angle);
  }

  public scale(x: number, y: number): void {
    this._transform.scale(x, y);
  }

  public transform(matrix: Matrix) {
    this._transform.current = matrix;
  }

  public getTransform(): Matrix {
    return this._transform.current;
  }

  public multiply(m: Matrix) {
    this._transform.current = this._transform.current.multm(m);
  }

  public addPostProcessor(postprocessor: PostProcessor) {
    this._postprocessors.push(postprocessor);
    postprocessor.initialize(this.__gl);
  }

  public removePostProcessor(postprocessor: PostProcessor) {
    const index = this._postprocessors.indexOf(postprocessor);
    if (index !== -1) {
      this._postprocessors.splice(index, 1);
    }
  }

  public clearPostProcessors() {
    this._postprocessors.length = 0;
  }

  clear() {
    const gl = this.__gl;
    this._renderTarget.use();
    gl.clearColor(this.backgroundColor.r / 255, this.backgroundColor.g / 255, this.backgroundColor.b / 255, this.backgroundColor.a);
    // Clear the context with the newly set color. This is
    // the function call that actually does the drawing.
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  /**
   * Flushes all batched rendering to the screen
   */
  flush() {
    const gl = this.__gl;

    // render target captures all draws and redirects to the render target
    this._renderTarget.use();
    // This is the final flush at the moment to draw any leftover pending draw
    // TODO sort by priority and flush in order
    for (const renderer of this._renderers.values()) {
      if (renderer.hasPendingDraws()) {
        renderer.flush();
      }
    }
    this._renderTarget.disable();

    // post process step
    const source = this._renderTarget.toRenderSource();
    source.use();

    // flip flop render targets
    for (let i = 0; i < this._postprocessors.length; i++) {
      this._postProcessTargets[i % 2].use();
      this._screenRenderer.renderWithPostProcessor(this._postprocessors[i]);
      this._postProcessTargets[i % 2].toRenderSource().use();
    }

    // passing null switches rendering back to the canvas
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this._screenRenderer.renderToScreen();
  }
}
