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
import { Pool } from '../../Util/Pool';
import { DrawCall } from './draw-call';
import { AffineMatrix } from '../../Math/affine-matrix';

export const pixelSnapEpsilon = 0.0001;

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
  public useDrawSorting = true;

  private _drawCallPool = new Pool<DrawCall>(
    () => new DrawCall(),
    (instance) => {
      instance.priority = 0;
      instance.z = 0;
      instance.renderer = undefined;
      instance.args = undefined;
      return instance;
    }, 4000);
  private _drawCalls: DrawCall[] = [];

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
  public __gl: WebGL2RenderingContext;

  private _transform = new TransformStack();
  private _state = new StateStack();
  private _ortho!: Matrix;

  public snapToPixel: boolean = false;

  public smoothing: boolean = false;

  public backgroundColor: Color = Color.ExcaliburBlue;

  public get z(): number {
    return this._state.current.z;
  }

  public set z(value: number) {
    this._state.current.z = value;
  }

  public get opacity(): number {
    return this._state.current.opacity;
  }

  public set opacity(value: number) {
    this._state.current.opacity = value;
  }

  public get tint(): Color {
    return this._state.current.tint;
  }

  public set tint(color: Color) {
    this._state.current.tint = color;
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
    const { canvasElement, enableTransparency, smoothing, snapToPixel, backgroundColor, useDrawSorting } = options;
    this.__gl = canvasElement.getContext('webgl2', {
      antialias: smoothing ?? this.smoothing,
      premultipliedAlpha: false,
      alpha: enableTransparency ?? true,
      depth: true,
      powerPreference: 'high-performance'
      // TODO Chromium fixed the bug where this didn't work now it breaks CI :(
      // failIfMajorPerformanceCaveat: true
    });
    if (!this.__gl) {
      throw Error('Failed to retrieve webgl context from browser');
    }
    ExcaliburWebGLContextAccessor.register(this.__gl);
    TextureLoader.register(this.__gl);
    this.snapToPixel = snapToPixel ?? this.snapToPixel;
    this.smoothing = smoothing ?? this.smoothing;
    this.backgroundColor = backgroundColor ?? this.backgroundColor;
    this.useDrawSorting = useDrawSorting ?? this.useDrawSorting;
    this._drawCallPool.disableWarnings = true;
    this._drawCallPool.preallocate();
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

    const renderer = this._renderers.get(rendererName);
    if (renderer) {
      if (this.useDrawSorting) {
        const drawCall = this._drawCallPool.get();
        drawCall.z = this._state.current.z;
        drawCall.priority = renderer.priority;
        drawCall.renderer = rendererName;
        this.getTransform().clone(drawCall.transform);
        drawCall.state.z = this._state.current.z;
        drawCall.state.opacity = this._state.current.opacity;
        drawCall.state.tint = this._state.current.tint;
        drawCall.args = args;
        this._drawCalls.push(drawCall);
      } else {
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
      }
    } else {
      throw Error(`No renderer with name ${rendererName} has been registered`);
    }
  }

  public resetTransform(): void {
    this._transform.current = AffineMatrix.identity();
  }

  public updateViewport(resolution: ScreenDimension): void {
    const gl = this.__gl;
    this._ortho = this._ortho = Matrix.ortho(0, resolution.width, resolution.height, 0, 400, -400);

    this._renderTarget.setResolution(gl.canvas.width, gl.canvas.height);
    this._postProcessTargets[0].setResolution(gl.canvas.width, gl.canvas.height);
    this._postProcessTargets[1].setResolution(gl.canvas.width, gl.canvas.height);
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
    this.draw<RectangleRenderer>('ex.rectangle', start, end, color, thickness);
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
    this._transform.translate(this.snapToPixel ? ~~(x + pixelSnapEpsilon) : x, this.snapToPixel ? ~~(y + pixelSnapEpsilon) : y);
  }

  public rotate(angle: number): void {
    this._transform.rotate(angle);
  }

  public scale(x: number, y: number): void {
    this._transform.scale(x, y);
  }

  public transform(matrix: AffineMatrix) {
    this._transform.current = matrix;
  }

  public getTransform(): AffineMatrix {
    return this._transform.current;
  }

  public multiply(m: AffineMatrix) {
    this._transform.current.multiply(m, this._transform.current);
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

    if (this.useDrawSorting) {
      // sort draw calls
      // Find the original order of the first instance of the draw call
      const originalSort = new Map<string, number>();
      for (const [name] of this._renderers) {
        const firstIndex = this._drawCalls.findIndex(dc => dc.renderer === name);
        originalSort.set(name, firstIndex);
      }

      this._drawCalls.sort((a, b) => {
        const zIndex = a.z - b.z;
        const originalSortOrder = originalSort.get(a.renderer) - originalSort.get(b.renderer);
        const priority = a.priority - b.priority;
        if (zIndex === 0) { // sort by z first
          if (priority === 0) { // sort by priority
            return originalSortOrder; // use the original order to inform draw call packing to maximally preserve painter order
          }
          return priority;
        }
        return zIndex;
      });

      const oldTransform = this._transform.current;
      const oldState = this._state.current;

      if (this._drawCalls.length) {
        let currentRendererName = this._drawCalls[0].renderer;
        let currentRenderer = this._renderers.get(currentRendererName);
        for (let i = 0; i < this._drawCalls.length; i++) {
          // hydrate the state for renderers
          this._transform.current = this._drawCalls[i].transform;
          this._state.current = this._drawCalls[i].state;

          if (this._drawCalls[i].renderer !== currentRendererName) {
            // switching graphics renderer means we must flush the previous
            currentRenderer.flush();
            currentRendererName = this._drawCalls[i].renderer;
            currentRenderer = this._renderers.get(currentRendererName);
          }

          // If we are still using the same renderer we can add to the current batch
          currentRenderer.draw(...this._drawCalls[i].args);
        }
        if (currentRenderer.hasPendingDraws()) {
          currentRenderer.flush();
        }
      }

      // reset state
      this._transform.current = oldTransform;
      this._state.current = oldState;

      // reclaim draw calls
      this._drawCallPool.done();
      this._drawCalls.length = 0;
    } else {
      // This is the final flush at the moment to draw any leftover pending draw
      for (const renderer of this._renderers.values()) {
        if (renderer.hasPendingDraws()) {
          renderer.flush();
        }
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
