import {
  ExcaliburGraphicsContext,
  LineGraphicsOptions,
  PointGraphicsOptions,
  ExcaliburGraphicsContextOptions,
  DebugDraw,
  HTMLImageSource
} from './ExcaliburGraphicsContext';
import { Vector } from '../../Math/vector';
import { Color } from '../../Color';
import { StateStack } from './state-stack';
import { GraphicsDiagnostics } from '../GraphicsDiagnostics';
import { DebugText } from './debug-text';
import { ScreenDimension } from '../../Screen';
import { PostProcessor } from '../PostProcessor/PostProcessor';
import { AffineMatrix } from '../../Math/affine-matrix';

const pixelSnapEpsilon = 0.0001;

class ExcaliburGraphicsContext2DCanvasDebug implements DebugDraw {
  private _debugText = new DebugText();
  constructor(private _ex: ExcaliburGraphicsContext2DCanvas) {}
  /**
   * Draw a debug rectangle to the context
   * @param x
   * @param y
   * @param width
   * @param height
   */
  drawRect(x: number, y: number, width: number, height: number): void {
    this._ex.__ctx.save();
    this._ex.__ctx.strokeStyle = 'red';
    this._ex.__ctx.strokeRect(
      this._ex.snapToPixel ? ~~(x + pixelSnapEpsilon) : x,
      this._ex.snapToPixel ? ~~(y + pixelSnapEpsilon) : y,
      this._ex.snapToPixel ? ~~(width + pixelSnapEpsilon) : width,
      this._ex.snapToPixel ? ~~(height + pixelSnapEpsilon) : height
    );
    this._ex.__ctx.restore();
  }

  drawLine(start: Vector, end: Vector, lineOptions: LineGraphicsOptions = { color: Color.Black }): void {
    this._ex.__ctx.save();
    this._ex.__ctx.beginPath();
    this._ex.__ctx.strokeStyle = lineOptions.color.toString();
    this._ex.__ctx.moveTo(
      this._ex.snapToPixel ? ~~(start.x + pixelSnapEpsilon) : start.x,
      this._ex.snapToPixel ? ~~(start.y + pixelSnapEpsilon) : start.y
    );
    this._ex.__ctx.lineTo(
      this._ex.snapToPixel ? ~~(end.x + pixelSnapEpsilon) : end.x,
      this._ex.snapToPixel ? ~~(end.y + pixelSnapEpsilon) : end.y
    );
    this._ex.__ctx.lineWidth = 2;
    this._ex.__ctx.stroke();
    this._ex.__ctx.closePath();
    this._ex.__ctx.restore();
  }

  drawPoint(point: Vector, pointOptions: PointGraphicsOptions = { color: Color.Black, size: 5 }): void {
    this._ex.__ctx.save();
    this._ex.__ctx.beginPath();
    this._ex.__ctx.fillStyle = pointOptions.color.toString();
    this._ex.__ctx.arc(
      this._ex.snapToPixel ? ~~(point.x + pixelSnapEpsilon) : point.x,
      this._ex.snapToPixel ? ~~(point.y + pixelSnapEpsilon) : point.y,
      pointOptions.size,
      0,
      Math.PI * 2
    );
    this._ex.__ctx.fill();
    this._ex.__ctx.closePath();
    this._ex.__ctx.restore();
  }

  drawText(text: string, pos: Vector) {
    this._debugText.write(this._ex, text, pos);
  }
}

export class ExcaliburGraphicsContext2DCanvas implements ExcaliburGraphicsContext {
  /**
   * Meant for internal use only. Access the internal context at your own risk and no guarantees this will exist in the future.
   * @internal
   */
  public __ctx: CanvasRenderingContext2D;
  public get width() {
    return this.__ctx.canvas.width;
  }

  public get height() {
    return this.__ctx.canvas.height;
  }

  /**
   * Unused in Canvas implementation
   */
  public readonly useDrawSorting: boolean = false;

  /**
   * Unused in Canvas implementation
   */
  public z: number = 0;

  public backgroundColor: Color = Color.ExcaliburBlue;

  private _state = new StateStack();

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

  public snapToPixel: boolean = false;

  public get smoothing(): boolean {
    return this.__ctx.imageSmoothingEnabled;
  }

  public set smoothing(value: boolean) {
    this.__ctx.imageSmoothingEnabled = value;
  }

  constructor(options: ExcaliburGraphicsContextOptions) {
    const { canvasElement, enableTransparency, snapToPixel, smoothing, backgroundColor } = options;
    this.__ctx = canvasElement.getContext('2d', {
      alpha: enableTransparency ?? true
    });
    this.backgroundColor = backgroundColor ?? this.backgroundColor;
    this.snapToPixel = snapToPixel ?? this.snapToPixel;
    this.smoothing = smoothing ?? this.smoothing;
  }

  public resetTransform(): void {
    this.__ctx.resetTransform();
  }

  public updateViewport(_resolution: ScreenDimension): void {
    // pass
  }

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

    this.__ctx.globalAlpha = this.opacity;
    const args = [image, sx, sy, swidth, sheight, dx, dy, dwidth, dheight]
      .filter((a) => a !== undefined)
      .map((a) => (typeof a === 'number' && this.snapToPixel ? ~~a : a));
    this.__ctx.drawImage.apply(this.__ctx, args);
    GraphicsDiagnostics.DrawCallCount++;
    GraphicsDiagnostics.DrawnImagesCount = 1;
  }

  public drawLine(start: Vector, end: Vector, color: Color, thickness = 1) {
    this.__ctx.save();
    this.__ctx.beginPath();
    this.__ctx.strokeStyle = color.toString();
    this.__ctx.moveTo(
      this.snapToPixel ? ~~ (start.x + pixelSnapEpsilon) : start.x,
      this.snapToPixel ? ~~(start.y + pixelSnapEpsilon) : start.y
    );
    this.__ctx.lineTo(
      this.snapToPixel ? ~~ (end.x + pixelSnapEpsilon) : end.x,
      this.snapToPixel ? ~~(end.y + pixelSnapEpsilon) : end.y
    );
    this.__ctx.lineWidth = thickness;
    this.__ctx.stroke();
    this.__ctx.closePath();
    this.__ctx.restore();
  }

  public drawRectangle(pos: Vector, width: number, height: number, color: Color) {
    this.__ctx.save();
    this.__ctx.fillStyle = color.toString();
    this.__ctx.fillRect(
      this.snapToPixel ? ~~(pos.x + pixelSnapEpsilon) : pos.x,
      this.snapToPixel ? ~~(pos.y + pixelSnapEpsilon) : pos.y,
      this.snapToPixel ? ~~(width + pixelSnapEpsilon) : width,
      this.snapToPixel ? ~~(height + pixelSnapEpsilon) : height
    );
    this.__ctx.restore();
  }

  public drawCircle(pos: Vector, radius: number, color: Color, stroke?: Color, thickness?: number) {
    this.__ctx.save();
    this.__ctx.beginPath();
    if (stroke) {
      this.__ctx.strokeStyle = stroke.toString();
    }
    if (thickness) {
      this.__ctx.lineWidth = thickness;
    }
    this.__ctx.fillStyle = color.toString();
    this.__ctx.arc(
      this.snapToPixel ? ~~(pos.x + pixelSnapEpsilon) : pos.x,
      this.snapToPixel ? ~~(pos.y + pixelSnapEpsilon) : pos.y, radius, 0, Math.PI * 2
    );
    this.__ctx.fill();
    if (stroke) {
      this.__ctx.stroke();
    }
    this.__ctx.closePath();
    this.__ctx.restore();
  }

  debug = new ExcaliburGraphicsContext2DCanvasDebug(this);

  /**
   * Save the current state of the canvas to the stack (transforms and opacity)
   */
  save(): void {
    this.__ctx.save();
  }

  /**
   * Restore the state of the canvas from the stack
   */
  restore(): void {
    this.__ctx.restore();
  }

  /**
   * Translate the origin of the context by an x and y
   * @param x
   * @param y
   */
  translate(x: number, y: number): void {
    this.__ctx.translate(this.snapToPixel ? ~~(x + pixelSnapEpsilon) : x, this.snapToPixel ? ~~(y + pixelSnapEpsilon) : y);
  }

  /**
   * Rotate the context about the current origin
   */
  rotate(angle: number): void {
    this.__ctx.rotate(angle);
  }

  /**
   * Scale the context by an x and y factor
   * @param x
   * @param y
   */
  scale(x: number, y: number): void {
    this.__ctx.scale(x, y);
  }

  public getTransform(): AffineMatrix {
    throw new Error('Not implemented');
  }

  public multiply(_m: AffineMatrix): void {
    this.__ctx.setTransform(this.__ctx.getTransform().multiply(_m.toDOMMatrix()));
  }

  public addPostProcessor(_postprocessor: PostProcessor) {
    // pass
  }

  public removePostProcessor(_postprocessor: PostProcessor) {
    // pass
  }

  public clearPostProcessors() {
    // pass
  }

  public beginDrawLifecycle() {
    // pass
  }

  public endDrawLifecycle() {
    // pass
  }

  clear(): void {
    // Clear frame
    this.__ctx.clearRect(0, 0, this.width, this.height);
    this.__ctx.fillStyle = this.backgroundColor.toString();
    this.__ctx.fillRect(0, 0, this.width, this.height);
    GraphicsDiagnostics.clear();
  }

  /**
   * Flushes the batched draw calls to the screen
   */
  flush(): void {
    // pass
  }
}
