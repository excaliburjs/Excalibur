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
import { LineRenderer } from './line-renderer';
import { ImageRenderer } from './image-renderer';
import { PointRenderer } from './point-renderer';
import { Canvas } from '../Canvas';
import { GraphicsDiagnostics } from '../GraphicsDiagnostics';
import { DebugText } from './debug-text';
import { ScreenDimension } from '../../Screen';
import { RenderTarget } from './render-target';
import { ScreenRenderer } from './screen-renderer';
import { PostProcessor } from '../PostProcessor/PostProcessor';

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
    this._webglCtx.__lineRenderer.addLine(start, end, lineOptions.color);
  }

  /**
   * Draw a debugging point to the context
   * @param point
   * @param pointOptions
   */
  drawPoint(point: Vector, pointOptions: PointGraphicsOptions = { color: Color.Black, size: 5 }): void {
    this._webglCtx.__pointRenderer.addPoint(point, pointOptions.color, pointOptions.size);
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
  private _renderTarget: RenderTarget;

  private _postProcessTargets: RenderTarget[] = [];

  private _screenRenderer: ScreenRenderer;
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
  public __pointRenderer: PointRenderer;

  /**
   * Meant for internal use only. Access the internal context at your own risk and no guarantees this will exist in the future.
   * @internal
   */
  public __lineRenderer: LineRenderer;

  /**
   * Meant for internal use only. Access the internal context at your own risk and no guarantees this will exist in the future.
   * @internal
   */
  public __imageRenderer: ImageRenderer;

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

  /**
   * Checks the underlying webgl implementation if the requested internal resolution is supported
   * @param dim
   */
  public checkIfResolutionSupported(dim: ScreenDimension): boolean {
    // Slight hack based on this thread https://groups.google.com/g/webgl-dev-list/c/AHONvz3oQTo
    const gl = this.__gl;
    // If any dimension is greater than max texture size (divide by 4 bytes per pixel)
    const maxDim = gl.getParameter(gl.MAX_TEXTURE_SIZE) / 4;
    let supported = true;
    if (dim.width > maxDim || dim.height > maxDim) {
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

    this.__pointRenderer = new PointRenderer(gl, { ortho: this._ortho, transform: this._transform, state: this._state, context: this });
    this.__lineRenderer = new LineRenderer(gl, { ortho: this._ortho, transform: this._transform, state: this._state, context: this });
    this.__imageRenderer = new ImageRenderer(gl, { ortho: this._ortho, transform: this._transform, state: this._state, context: this });
    this._screenRenderer = new ScreenRenderer(gl);

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

  public resetTransform(): void {
    this._transform.current = Matrix.identity();
  }

  public updateViewport(resolution: ScreenDimension): void {
    const gl = this.__gl;
    this._ortho = this._ortho = Matrix.ortho(0, resolution.width, resolution.height, 0, 400, -400);
    this.__pointRenderer.shader.addUniformMatrix('u_matrix', this._ortho.data);
    this.__lineRenderer.shader.addUniformMatrix('u_matrix', this._ortho.data);
    this.__imageRenderer.shader.addUniformMatrix('u_matrix', this._ortho.data);

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
    this.__imageRenderer.addImage(image, sx, sy, swidth, sheight, dx, dy, dwidth, dheight);
  }

  public drawLine(start: Vector, end: Vector, color: Color, thickness = 1) {
    this.__imageRenderer.addLine(color, start, end, thickness);
  }

  public drawRectangle(pos: Vector, width: number, height: number, color: Color) {
    this.__imageRenderer.addRectangle(color, pos, width, height);
  }

  public drawCircle(pos: Vector, radius: number, color: Color) {
    this.__imageRenderer.addCircle(pos, radius, color);
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
    this._transform.current = this._transform.current.multm(m)
  }

  public addPostProcessor(postprocessor: PostProcessor) {
    this._postprocessors.push(postprocessor);
    postprocessor.intialize(this.__gl);
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
    this._renderTarget.disable();
    GraphicsDiagnostics.clear();
  }

  /**
   * Flushes all batched rendering to the screen
   */
  flush() {
    const gl = this.__gl;

    // render target captures all draws and redirects to the render target
    this._renderTarget.use();
    this.__imageRenderer.render();
    this.__lineRenderer.render();
    this.__pointRenderer.render();
    this._renderTarget.disable();

    // post process step
    const source = this._renderTarget.toRenderSource();
    source.use();

    // flip flop render targets
    for (let i = 0; i < this._postprocessors.length; i++) {
      this._postProcessTargets[i % 2].use();
      this._screenRenderer.renderWithShader(this._postprocessors[i].getShader());
      this._postProcessTargets[i % 2].toRenderSource().use();
    }

    // passing null switches renderering back to the canvas
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this._screenRenderer.render();
  }
}
