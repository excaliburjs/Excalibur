import {
  ExcaliburGraphicsContext,
  LineGraphicsOptions,
  PointGraphicsOptions,
  ExcaliburGraphicsContextOptions,
  DebugDraw,
  HTMLImageSource
} from './ExcaliburGraphicsContext';
import { Vector } from '../../Algebra';
import { Color } from '../../Drawing/Color';
import { StateStack } from './state-stack';
import { GraphicsDiagnostics } from '../GraphicsDiagnostics';

class ExcaliburGraphicsContext2DCanvasDebug implements DebugDraw {
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
      this._ex.snapToPixel ? ~~x : x,
      this._ex.snapToPixel ? ~~y : y,
      this._ex.snapToPixel ? ~~width : width,
      this._ex.snapToPixel ? ~~height : height
    );
    this._ex.__ctx.restore();
  }

  drawLine(start: Vector, end: Vector, lineOptions: LineGraphicsOptions = { color: Color.Black }): void {
    this._ex.__ctx.save();
    this._ex.__ctx.beginPath();
    this._ex.__ctx.strokeStyle = lineOptions.color.toString();
    this._ex.__ctx.moveTo(this._ex.snapToPixel ? ~~start.x : start.x, this._ex.snapToPixel ? ~~start.y : start.y);
    this._ex.__ctx.lineTo(this._ex.snapToPixel ? ~~end.x : end.x, this._ex.snapToPixel ? ~~end.y : end.y);
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
      this._ex.snapToPixel ? ~~point.x : point.x,
      this._ex.snapToPixel ? ~~point.y : point.y,
      pointOptions.size,
      0,
      Math.PI * 2
    );
    this._ex.__ctx.fill();
    this._ex.__ctx.closePath();
    this._ex.__ctx.restore();
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

  public backgroundColor: Color = Color.ExcaliburBlue;

  private _state = new StateStack();

  public get opacity(): number {
    return this._state.current.opacity;
  }

  public set opacity(value: number) {
    this._state.current.opacity = value;
  }

  public snapToPixel: boolean = true;

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

  public updateViewport(): void {
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
    this.__ctx.translate(this.snapToPixel ? ~~x : x, this.snapToPixel ? ~~y : y);
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
