import {
  ExcaliburGraphicsContext,
  LineGraphicsOptions,
  RectGraphicsOptions,
  PointGraphicsOptions,
  ExcaliburGraphicsContextOptions,
  DebugDraw
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
import { Canvas } from '../Canvas';
import { DrawDiagnostics } from '../DrawDiagnostics';

class ExcaliburGraphicsContextWebGLDebug implements DebugDraw {
  constructor(private _ex: ExcaliburGraphicsContextWebGL) {}

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
    this._ex.__lineRenderer.addLine(start, end, lineOptions.color);
  }

  /**
   * Draw a debugging point to the context
   * @param point
   * @param pointOptions
   */
  drawPoint(point: Vector, pointOptions: PointGraphicsOptions = { color: Color.Black, size: 5 }): void {
    this._ex.__pointRenderer.addPoint(point, pointOptions.color, pointOptions.size);
  }
}

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


  /**
   * Holds the 2d context shim
   */
  private _canvas: Canvas; // Configure z for shim?
  public __ctx: CanvasRenderingContext2D;

  private _transform = new TransformStack();
  private _state = new StateStack();
  private _ortho!: Matrix;

  public __pointRenderer: PointRenderer;

  public __lineRenderer: LineRenderer;

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
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this.__pointRenderer = new PointRenderer(gl, { matrix: this._ortho, transform: this._transform, state: this._state });
    this.__lineRenderer = new LineRenderer(gl, { matrix: this._ortho, transform: this._transform, state: this._state });
    this.__imageRenderer = new ImageRenderer(gl, { matrix: this._ortho, transform: this._transform, state: this._state });

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

  public updateViewport(): void {
    const gl = this.__gl;
    this._ortho = this._ortho = Matrix.ortho(0, gl.canvas.width, gl.canvas.height, 0, 400, -400);
    this.__pointRenderer.shader.addUniformMatrix('u_matrix', this._ortho.data);
    this.__lineRenderer.shader.addUniformMatrix('u_matrix', this._ortho.data);
    this.__imageRenderer.shader.addUniformMatrix('u_matrix', this._ortho.data);

    // 2D ctx shim
    this._canvas.width = gl.canvas.width;
    this._canvas.height = gl.canvas.height;
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
    this.__imageRenderer.addImage(graphic, sx, sy, swidth, sheight, dx, dy, dwidth, dheight);
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

  clear() {
    const gl = this.__gl;
    gl.clearColor(this.backgroundColor.r / 255, this.backgroundColor.g / 255, this.backgroundColor.b / 255, this.backgroundColor.a);
    // Clear the context with the newly set color. This is
    // the function call that actually does the drawing.
    gl.clear(gl.COLOR_BUFFER_BIT);
    DrawDiagnostics.clear();
  }

  /**
   * Flushes all batched rendering to the screen
   */
  flush() {
    const gl = this.__gl;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    this.__imageRenderer.render();
    this.__lineRenderer.render();
    this.__pointRenderer.render();
  }
}
