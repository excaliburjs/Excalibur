import type {
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
import type { Vector } from '../../Math/vector';
import { vec } from '../../Math/vector';
import { Color } from '../../Color';
import { StateStack } from './state-stack';
import { Logger } from '../../Util/Log';
import { DebugText } from './debug-text';
import type { Resolution } from '../../Screen';
import { RenderTarget } from './render-target';
import type { PostProcessor } from '../PostProcessor/PostProcessor';
import { TextureLoader } from './texture-loader';
import type { RendererPlugin } from './renderer';

// renderers
import { DebugLineRenderer } from './debug-line-renderer/debug-line-renderer';
import { DebugPointRenderer } from './debug-point-renderer/debug-point-renderer';
import { DebugCircleRenderer } from './debug-circle-renderer/debug-circle-renderer';
import { ScreenPassPainter } from './screen-pass-painter/screen-pass-painter';
import { ImageRenderer } from './image-renderer/image-renderer';
import { RectangleRenderer } from './rectangle-renderer/rectangle-renderer';
import { CircleRenderer } from './circle-renderer/circle-renderer';
import { Pool } from '../../Util/Pool';
import { DrawCall } from './draw-call';
import type { AffineMatrix } from '../../Math/affine-matrix';
import type { MaterialOptions } from './material';
import { Material } from './material';
import { MaterialRenderer } from './material-renderer/material-renderer';
import type { ShaderOptions } from './shader';
import { Shader } from './shader';
import type { GarbageCollector } from '../../GarbageCollector';
import { ParticleRenderer } from './particle-renderer/particle-renderer';
import { ImageRendererV2 } from './image-renderer-v2/image-renderer-v2';
import { Flags } from '../../Flags';

export const pixelSnapEpsilon = 0.0001;

class ExcaliburGraphicsContextWebGLDebug implements DebugDraw {
  private _debugText = new DebugText();
  constructor(private _webglCtx: ExcaliburGraphicsContextWebGL) {}

  /**
   * Draw a debugging rectangle to the graphics context
   *
   * Debugging draws are independent of scale/zoom
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
   * Draw a debugging line to the graphics context
   *
   * Debugging draws are independent of scale/zoom
   * @param start
   * @param end
   * @param lineOptions
   */
  drawLine(start: Vector, end: Vector, lineOptions?: LineGraphicsOptions): void {
    this._webglCtx.draw<DebugLineRenderer>(
      'ex.debug-line',
      start,
      end,
      lineOptions?.color ?? Color.Black,
      lineOptions?.lineWidth,
      lineOptions?.dashed
    );
  }

  /**
   * Draw a debugging point to the graphics context
   *
   * Debugging draws are independent of scale/zoom
   * @param point
   * @param pointOptions
   */
  drawPoint(point: Vector, pointOptions: PointGraphicsOptions = { color: Color.Black, size: 5 }): void {
    this._webglCtx.draw<DebugPointRenderer>('ex.debug-point', point, pointOptions.color, pointOptions.size);
  }

  /**
   * Draw a debugging circle to the graphics context
   *
   * Debugging draws are independent of scale/zoom
   */
  drawCircle(pos: Vector, radius: number, color: Color, stroke?: Color, thickness?: number) {
    this._webglCtx.draw<DebugCircleRenderer>('ex.debug-circle', pos, radius, color, stroke, thickness);
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

export interface ExcaliburGraphicsContextWebGLOptions extends ExcaliburGraphicsContextOptions {
  context?: WebGL2RenderingContext;
  garbageCollector?: { garbageCollector: GarbageCollector; collectionInterval: number };
  handleContextLost?: (e: Event) => void;
  handleContextRestored?: (e: Event) => void;
}

export class ExcaliburGraphicsContextWebGL implements ExcaliburGraphicsContext {
  private _logger = Logger.getInstance();
  private _renderers: Map<string, RendererPlugin> = new Map<string, RendererPlugin>();
  private _lazyRenderersFactory: Map<string, () => RendererPlugin> = new Map<string, () => RendererPlugin>();
  public imageRenderer: 'ex.image' | 'ex.image-v2' = Flags.isEnabled('use-legacy-image-renderer') ? 'ex.image' : 'ex.image-v2';
  private _isDrawLifecycle = false;
  public useDrawSorting = true;

  private _drawCallPool = new Pool<DrawCall>(() => new DrawCall(), undefined, 4000);

  private _drawCallIndex = 0;
  private _drawCalls: DrawCall[] = new Array(4000).fill(null);

  // Main render target
  private _renderTarget!: RenderTarget;

  // Quad boundary MSAA
  private _msaaTarget!: RenderTarget;

  // Postprocessing is a tuple with 2 render targets, these are flip-flopped during the postprocessing process
  private _postProcessTargets: RenderTarget[] = [];

  private _screenRenderer!: ScreenPassPainter;

  private _postprocessors: PostProcessor[] = [];

  /**
   * Meant for internal use only. Access the internal context at your own risk and no guarantees this will exist in the future.
   * @internal
   */
  public __gl: WebGL2RenderingContext;

  private _transform = new TransformStack();
  private _state = new StateStack();
  private _ortho!: Matrix;

  /**
   * Snaps the drawing x/y coordinate to the nearest whole pixel
   */
  public snapToPixel: boolean = false;

  /**
   * Native context smoothing
   */
  public readonly smoothing: boolean = false;

  /**
   * Whether the pixel art sampler is enabled for smooth sub pixel anti-aliasing
   */
  public readonly pixelArtSampler: boolean = false;

  /**
   * UV padding in pixels to use in internal image rendering to prevent texture bleed
   *
   */
  public uvPadding = 0.01;

  public backgroundColor: Color = Color.ExcaliburBlue;

  public textureLoader: TextureLoader;

  public materialScreenTexture!: WebGLTexture | null;

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

  public get tint(): Color | undefined | null {
    return this._state.current.tint;
  }

  public set tint(color: Color | undefined | null) {
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
  public checkIfResolutionSupported(dim: Resolution): boolean {
    // Slight hack based on this thread https://groups.google.com/g/webgl-dev-list/c/AHONvz3oQTo
    let supported = true;
    if (dim.width > 4096 || dim.height > 4096) {
      supported = false;
    }
    return supported;
  }

  public readonly multiSampleAntialiasing: boolean = true;
  public readonly samples?: number;
  public readonly transparency: boolean = true;
  private _isContextLost = false;

  constructor(options: ExcaliburGraphicsContextWebGLOptions) {
    const {
      canvasElement,
      context,
      enableTransparency,
      antialiasing,
      uvPadding,
      multiSampleAntialiasing,
      pixelArtSampler,
      powerPreference,
      snapToPixel,
      backgroundColor,
      useDrawSorting,
      garbageCollector,
      handleContextLost,
      handleContextRestored
    } = options;
    this.__gl =
      context ??
      (canvasElement.getContext('webgl2', {
        antialias: antialiasing ?? this.smoothing,
        premultipliedAlpha: false,
        alpha: enableTransparency ?? this.transparency,
        depth: false,
        powerPreference: powerPreference ?? 'high-performance'
      }) as WebGL2RenderingContext);
    if (!this.__gl) {
      throw Error('Failed to retrieve webgl context from browser');
    }

    if (handleContextLost) {
      this.__gl.canvas.addEventListener('webglcontextlost', handleContextLost, false);
    }

    if (handleContextRestored) {
      this.__gl.canvas.addEventListener('webglcontextrestored', handleContextRestored, false);
    }

    this.__gl.canvas.addEventListener('webglcontextlost', () => {
      this._isContextLost = true;
    });

    this.__gl.canvas.addEventListener('webglcontextrestored', () => {
      this._isContextLost = false;
    });

    this.textureLoader = new TextureLoader(this.__gl, garbageCollector);
    this.snapToPixel = snapToPixel ?? this.snapToPixel;
    this.smoothing = antialiasing ?? this.smoothing;
    this.transparency = enableTransparency ?? this.transparency;
    this.pixelArtSampler = pixelArtSampler ?? this.pixelArtSampler;
    this.uvPadding = uvPadding ?? this.uvPadding;
    this.multiSampleAntialiasing = typeof multiSampleAntialiasing === 'boolean' ? multiSampleAntialiasing : this.multiSampleAntialiasing;
    this.samples = typeof multiSampleAntialiasing === 'object' ? multiSampleAntialiasing.samples : undefined;
    this.backgroundColor = backgroundColor ?? this.backgroundColor;
    this.useDrawSorting = useDrawSorting ?? this.useDrawSorting;
    this._drawCallPool.disableWarnings = true;
    this._drawCallPool.preallocate();
    this._init();
  }

  private _disposed = false;
  public dispose() {
    if (!this._disposed) {
      this._disposed = true;
      this.textureLoader.dispose();
      for (const renderer of this._renderers.values()) {
        renderer.dispose();
      }
      this._renderers.clear();
      this._drawCallPool.dispose();
      this._drawCalls.length = 0;
      this.__gl = null as any;
    }
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
    gl.depthMask(false);
    // Setup builtin renderers
    this.register(
      new ImageRenderer({
        uvPadding: this.uvPadding,
        pixelArtSampler: this.pixelArtSampler
      })
    );
    this.register(new MaterialRenderer());
    this.register(new RectangleRenderer());
    this.register(new CircleRenderer());
    this.lazyRegister('ex.debug-circle', () => new DebugCircleRenderer());
    this.lazyRegister('ex.debug-point', () => new DebugPointRenderer());
    this.lazyRegister('ex.debug-line', () => new DebugLineRenderer());
    this.lazyRegister('ex.particle', () => new ParticleRenderer());
    this.register(
      new ImageRendererV2({
        uvPadding: this.uvPadding,
        pixelArtSampler: this.pixelArtSampler
      })
    );

    this.materialScreenTexture = gl.createTexture();
    if (!this.materialScreenTexture) {
      throw new Error('Could not create screen texture!');
    }
    gl.bindTexture(gl.TEXTURE_2D, this.materialScreenTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.bindTexture(gl.TEXTURE_2D, null);

    this._screenRenderer = new ScreenPassPainter(this);

    this._renderTarget = new RenderTarget({
      gl,
      transparency: this.transparency,
      width: gl.canvas.width,
      height: gl.canvas.height
    });

    this._postProcessTargets = [
      new RenderTarget({
        gl,
        transparency: this.transparency,
        width: gl.canvas.width,
        height: gl.canvas.height
      }),
      new RenderTarget({
        gl,
        transparency: this.transparency,
        width: gl.canvas.width,
        height: gl.canvas.height
      })
    ];

    this._msaaTarget = new RenderTarget({
      gl,
      transparency: this.transparency,
      width: gl.canvas.width,
      height: gl.canvas.height,
      antialias: this.multiSampleAntialiasing,
      samples: this.samples
    });

    this.debug = new ExcaliburGraphicsContextWebGLDebug(this);
  }

  public register<T extends RendererPlugin>(renderer: T) {
    this._renderers.set(renderer.type, renderer);
    renderer.initialize(this.__gl, this);
  }

  public lazyRegister<TRenderer extends RendererPlugin>(type: TRenderer['type'], renderer: () => TRenderer) {
    this._lazyRenderersFactory.set(type, renderer);
  }

  public get(rendererName: string): RendererPlugin | undefined {
    let maybeRenderer = this._renderers.get(rendererName);
    if (!maybeRenderer) {
      const lazyFactory = this._lazyRenderersFactory.get(rendererName);
      if (lazyFactory) {
        this._logger.debug('lazy init renderer:', rendererName);
        maybeRenderer = lazyFactory();
        this.register(maybeRenderer);
      }
    }
    return maybeRenderer;
  }

  private _currentRenderer: RendererPlugin | undefined;

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

  public draw<TRenderer extends RendererPlugin>(rendererName: TRenderer['type'], ...args: Parameters<TRenderer['draw']>) {
    if (process.env.NODE_ENV === 'development') {
      if (args.length > 9) {
        throw new Error('Only 10 or less renderer arguments are supported!;');
      }
    }
    if (!this._isDrawLifecycle) {
      this._logger.warnOnce(
        `Attempting to draw outside the the drawing lifecycle (preDraw/postDraw) is not supported and is a source of bugs/errors.\n` +
          `If you want to do custom drawing, use Actor.graphics, or any onPreDraw or onPostDraw handler.`
      );
    }
    if (this._isContextLost) {
      this._logger.errorOnce(`Unable to draw ${rendererName}, the webgl context is lost`);
      return;
    }

    const renderer = this.get(rendererName);
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
        drawCall.state.material = this._state.current.material;
        drawCall.args[0] = args[0];
        drawCall.args[1] = args[1];
        drawCall.args[2] = args[2];
        drawCall.args[3] = args[3];
        drawCall.args[4] = args[4];
        drawCall.args[5] = args[5];
        drawCall.args[6] = args[6];
        drawCall.args[7] = args[7];
        drawCall.args[8] = args[8];
        drawCall.args[9] = args[9];
        this._drawCalls[this._drawCallIndex++] = drawCall;
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
        renderer.draw(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9]);

        this._currentRenderer = renderer;
      }
    } else {
      throw Error(`No renderer with name ${rendererName} has been registered`);
    }
  }

  public resetTransform(): void {
    this._transform.reset();
  }

  public updateViewport(resolution: Resolution): void {
    const gl = this.__gl;
    this._ortho = this._ortho = Matrix.ortho(0, resolution.width, resolution.height, 0, 400, -400);

    this._renderTarget.setResolution(gl.canvas.width, gl.canvas.height);
    this._msaaTarget.setResolution(gl.canvas.width, gl.canvas.height);
    this._postProcessTargets[0].setResolution(gl.canvas.width, gl.canvas.height);
    this._postProcessTargets[1].setResolution(gl.canvas.width, gl.canvas.height);
  }

  private _imageToWidth = new Map<HTMLImageSource, number>();
  private _getImageWidth(image: HTMLImageSource) {
    let maybeWidth = this._imageToWidth.get(image);
    if (maybeWidth === undefined) {
      maybeWidth = image.width;
      this._imageToWidth.set(image, maybeWidth);
    }
    return maybeWidth;
  }

  private _imageToHeight = new Map<HTMLImageSource, number>();
  private _getImageHeight(image: HTMLImageSource) {
    let maybeHeight = this._imageToHeight.get(image);
    if (maybeHeight === undefined) {
      maybeHeight = image.height;
      this._imageToHeight.set(image, maybeHeight);
    }
    return maybeHeight;
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
    } else if (this._getImageWidth(image) === 0 || this._getImageHeight(image) === 0) {
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

    if (this._state.current.material) {
      this.draw<MaterialRenderer>('ex.material', image, sx, sy, swidth, sheight, dx, dy, dwidth, dheight);
    } else {
      if (this.imageRenderer === 'ex.image') {
        this.draw<ImageRenderer>(this.imageRenderer, image, sx, sy, swidth, sheight, dx, dy, dwidth, dheight);
      } else {
        this.draw<ImageRendererV2>(this.imageRenderer, image, sx, sy, swidth, sheight, dx, dy, dwidth, dheight);
      }
    }
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

  debug!: ExcaliburGraphicsContextWebGLDebug;

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
    postprocessor.initialize(this);
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

  private _totalPostProcessorTime = 0;
  public updatePostProcessors(elapsed: number) {
    for (const postprocessor of this._postprocessors) {
      const shader = postprocessor.getShader();
      shader.use();
      const uniforms = shader.getUniformDefinitions();
      this._totalPostProcessorTime += elapsed;

      if (uniforms.find((u) => u.name === 'u_time_ms')) {
        shader.setUniformFloat('u_time_ms', this._totalPostProcessorTime);
      }
      if (uniforms.find((u) => u.name === 'u_elapsed_ms')) {
        shader.setUniformFloat('u_elapsed_ms', elapsed);
      }
      if (uniforms.find((u) => u.name === 'u_resolution')) {
        shader.setUniformFloatVector('u_resolution', vec(this.width, this.height));
      }

      if (postprocessor.onUpdate) {
        postprocessor.onUpdate(elapsed);
      }
    }
  }

  public set material(material: Material | null | undefined) {
    this._state.current.material = material;
  }

  public get material(): Material | null | undefined {
    return this._state.current.material;
  }

  /**
   * Creates and initializes the material which compiles the internal shader
   * @param options
   * @returns Material
   */
  public createMaterial(options: Omit<MaterialOptions, 'graphicsContext'>): Material {
    const material = new Material({ ...options, graphicsContext: this });
    return material;
  }

  public createShader(options: Omit<ShaderOptions, 'graphicsContext'>): Shader {
    const { name, vertexSource, fragmentSource, uniforms, images, startingTextureSlot } = options;
    const shader = new Shader({
      name,
      graphicsContext: this,
      vertexSource,
      fragmentSource,
      uniforms,
      images,
      startingTextureSlot
    });
    shader.compile();
    return shader;
  }

  clear() {
    const gl = this.__gl;
    const currentTarget = this.multiSampleAntialiasing ? this._msaaTarget : this._renderTarget;
    currentTarget.use();
    gl.clearColor(this.backgroundColor.r / 255, this.backgroundColor.g / 255, this.backgroundColor.b / 255, this.backgroundColor.a);
    // Clear the context with the newly set color. This is
    // the function call that actually does the drawing.
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  /**
   * Flushes all batched rendering to the screen
   */
  flush() {
    if (this._isContextLost) {
      this._logger.errorOnce(`Unable to flush the webgl context is lost`);
      return;
    }

    // render target captures all draws and redirects to the render target
    let currentTarget = this.multiSampleAntialiasing ? this._msaaTarget : this._renderTarget;
    currentTarget.use();

    if (this.useDrawSorting) {
      // null out unused draw calls
      for (let i = this._drawCallIndex; i < this._drawCalls.length; i++) {
        this._drawCalls[i] = null as any;
      }
      // sort draw calls
      // Find the original order of the first instance of the draw call
      const originalSort = new Map<string, number>();
      for (const [name] of this._renderers) {
        let firstIndex = 0;
        for (firstIndex = 0; firstIndex < this._drawCallIndex; firstIndex++) {
          if (this._drawCalls[firstIndex].renderer === name) {
            break;
          }
        }
        originalSort.set(name, firstIndex);
      }

      this._drawCalls.sort((a, b) => {
        if (a === null || b === null) {
          return 0;
        }
        const zIndex = a.z - b.z;
        const originalSortOrder = originalSort.get(a.renderer)! - originalSort.get(b.renderer)!;
        const priority = a.priority - b.priority;
        if (zIndex === 0) {
          // sort by z first
          if (priority === 0) {
            // sort by priority
            return originalSortOrder; // use the original order to inform draw call packing to maximally preserve painter order
          }
          return priority;
        }
        return zIndex;
      });

      const oldTransform = this._transform.current;
      const oldState = this._state.current;

      if (this._drawCalls.length && this._drawCallIndex) {
        let currentRendererName = this._drawCalls[0].renderer;
        let currentRenderer = this.get(currentRendererName);
        for (let i = 0; i < this._drawCallIndex; i++) {
          // hydrate the state for renderers
          this._transform.current = this._drawCalls[i].transform;
          this._state.current = this._drawCalls[i].state;

          if (this._drawCalls[i].renderer !== currentRendererName) {
            // switching graphics renderer means we must flush the previous
            currentRenderer!.flush();
            currentRendererName = this._drawCalls[i].renderer;
            currentRenderer = this.get(currentRendererName);
          }

          // ! hack to grab screen texture before materials run because they might want it
          if (currentRenderer instanceof MaterialRenderer && this.material?.isUsingScreenTexture) {
            currentTarget.copyToTexture(this.materialScreenTexture!);
            currentTarget.use();
          }
          // If we are still using the same renderer we can add to the current batch
          currentRenderer!.draw(...this._drawCalls[i].args);
        }
        if (currentRenderer!.hasPendingDraws()) {
          currentRenderer!.flush();
        }
      }

      // reset state
      this._transform.current = oldTransform;
      this._state.current = oldState;

      // reclaim draw calls
      this._drawCallPool.done();
      this._drawCallIndex = 0;
      this._imageToHeight.clear();
      this._imageToWidth.clear();
    } else {
      // This is the final flush at the moment to draw any leftover pending draw
      for (const renderer of this._renderers.values()) {
        if (renderer.hasPendingDraws()) {
          renderer.flush();
        }
      }
    }

    currentTarget.disable();

    // post process step
    if (this._postprocessors.length > 0) {
      currentTarget.toRenderSource().use();
    }

    // flip flop render targets for post processing
    for (let i = 0; i < this._postprocessors.length; i++) {
      currentTarget = this._postProcessTargets[i % 2];
      this._postProcessTargets[i % 2].use();
      this._screenRenderer.renderWithPostProcessor(this._postprocessors[i]);
      this._postProcessTargets[i % 2].toRenderSource().use();
    }

    // Final blit to the screen
    currentTarget.blitToScreen();
  }
}
