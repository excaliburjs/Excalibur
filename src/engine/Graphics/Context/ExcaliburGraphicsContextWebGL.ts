import {
  ExcaliburGraphicsContext,
  ExcaliburContextDiagnostics,
  LineGraphicsOptions,
  RectGraphicsOptions,
  PointGraphicsOptions,
  ExcaliburGraphicsContextOptions
} from './ExcaliburGraphicsContext';

import { Matrix } from '../../Math/matrix';
import { TransformStack } from './transform-stack';
import { Graphic } from '../Graphic';
import { Vector, vec } from '../../Algebra';
import { Color } from '../../Drawing/Color';
import { StateStack } from './state-stack';
import { Logger } from '../../Util/Log';
import { LineRenderer } from './line-renderer';
import { ImageRenderer } from './image-renderer';
import { PointRenderer } from './point-renderer';

export interface WebGLGraphicsContextInfo {
  transform: TransformStack;
  state: StateStack;
  matrix: Matrix;
}

export class ExcaliburGraphicsContextWebGL implements ExcaliburGraphicsContext {
  /**
   * Meant for internal use only. Access the internal context at your own risk and no guarantees this will exist in the future.
   * @internal
   */
  public __gl: WebGLRenderingContext;
  private _transform = new TransformStack();
  private _state = new StateStack();
  private _ortho!: Matrix;

  private _pointRenderer: PointRenderer;

  private _lineRenderer: LineRenderer;

  private _imageRenderer: ImageRenderer;

  public snapToPixel: boolean = true;

  public backgroundColor: Color = Color.ExcaliburBlue;

  public get opacity(): number {
    return this._state.current.opacity;
  }

  public set opacity(value: number) {
    this._state.current.opacity = value;
  }

  public get z(): number {
    return this._state.current.z;
  }

  public set z(value: number) {
    this._state.current.z = value;
  }

  public get width() {
    return this.__gl.canvas.width;
  }

  public get height() {
    return this.__gl.canvas.height;
  }

  constructor(options: ExcaliburGraphicsContextOptions) {
    const { canvasElement, enableTransparency, antiAlias, snapToPixel, backgroundColor } = options;
    this.__gl = canvasElement.getContext('webgl', {
      antialias: antiAlias ?? false,
      premultipliedAlpha: false,
      alpha: enableTransparency ?? true,
      depth: true,
      powerPreference: 'high-performance'
    });
    this.snapToPixel = snapToPixel ?? this.snapToPixel;
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
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this._pointRenderer = new PointRenderer(gl, { matrix: this._ortho, transform: this._transform, state: this._state });
    this._lineRenderer = new LineRenderer(gl, { matrix: this._ortho, transform: this._transform, state: this._state });
    this._imageRenderer = new ImageRenderer(gl, { matrix: this._ortho, transform: this._transform, state: this._state });
  }

  drawImage(graphic: Graphic, x: number, y: number): void;
  drawImage(graphic: Graphic, x: number, y: number, width: number, height: number): void;
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
  ): void {
    if (!graphic) {
      Logger.getInstance().warn('Cannot draw a null or undefined image');
      // tslint:disable-next-line: no-console
      if (console.trace) {
        // tslint:disable-next-line: no-console
        console.trace();
      }
      return;
    }
    this._imageRenderer.addImage(graphic, sx, sy, swidth, sheight, dx, dy, dwidth, dheight);
  }

  private _diag: ExcaliburContextDiagnostics = {
    quads: 0,
    batches: 0,
    uniqueTextures: 0,
    maxTexturePerDraw: 0
  };

  public get diag(): ExcaliburContextDiagnostics {
    return this._diag;
  }

  public save(): void {
    this._transform.save();
    this._state.save();
  }

  public restore(): void {
    this._transform.restore();
    this._state.restore();
  }

  public translate(x: number, y: number): void {
    this._transform.translate(x, y);
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

  clear() {
    const gl = this.__gl;
    gl.clearColor(this.backgroundColor.r / 255, this.backgroundColor.g / 255, this.backgroundColor.b / 255, this.backgroundColor.a);
    // Clear the context with the newly set color. This is
    // the function call that actually does the drawing.
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  /**
   * Flushes all batched rendering to the screen
   */
  flush() {
    this._diag.quads = 0;
    this._diag.uniqueTextures = 0;
    this._diag.batches = 0;
    // this._diag.maxTexturePerDraw = this._maxGPUTextures;

    this.clear();
    // TODO add a list of renderers
    this._imageRenderer.render();
    this._lineRenderer.render();
    this._pointRenderer.render();
  }

  /**
   * Draw a debug rectangle to the context
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

  drawLine(start: Vector, end: Vector, lineOptions: LineGraphicsOptions = { color: Color.Black }): void {
    this._lineRenderer.addLine(start, end, lineOptions.color);
  }

  drawPoint(point: Vector, pointOptions: PointGraphicsOptions = { color: Color.Black, size: 5 }): void {
    this._pointRenderer.addPoint(point, pointOptions.color, pointOptions.size);
  }
}
