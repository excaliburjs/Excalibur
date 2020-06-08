import {
  ExcaliburGraphicsContext,
  LineGraphicsOptions,
  PointGraphicsOptions,
  ExcaliburGraphicsContextOptions
} from './ExcaliburGraphicsContext';
import { Vector } from '../../Algebra';
import { Graphic } from '../Graphic';
import { Color } from '../../Drawing/Color';
import { StateStack } from './state-stack';

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

  public get z(): number {
    return this._state.current.z;
  }

  public set z(value: number) {
    this._state.current.z = value;
  }

  public snapToPixel: boolean = true;

  constructor(options: ExcaliburGraphicsContextOptions) {
    const { canvasElement, enableTransparency, snapToPixel, backgroundColor } = options;
    this.__ctx = canvasElement.getContext('2d', {
      alpha: enableTransparency ?? true
    });
    this.backgroundColor = backgroundColor ?? this.backgroundColor;
    this.snapToPixel = snapToPixel ?? this.snapToPixel;
  }

  /**
   * Draw a debug rectangle to the context
   * @param x
   * @param y
   * @param width
   * @param height
   */
  drawRect(x: number, y: number, width: number, height: number): void {
    this.__ctx.save();
    this.__ctx.strokeStyle = 'red';
    this.__ctx.strokeRect(
      this.snapToPixel ? ~~x : x,
      this.snapToPixel ? ~~y : y,
      this.snapToPixel ? ~~width : width,
      this.snapToPixel ? ~~height : height
    );
    this.__ctx.restore();
  }

  drawLine(start: Vector, end: Vector, lineOptions: LineGraphicsOptions = { color: Color.Black }): void {
    this.__ctx.save();
    this.__ctx.beginPath();
    this.__ctx.strokeStyle = lineOptions.color.toString();
    this.__ctx.moveTo(this.snapToPixel ? ~~start.x : start.x, this.snapToPixel ? ~~start.y : start.y);
    this.__ctx.lineTo(this.snapToPixel ? ~~end.x : end.x, this.snapToPixel ? ~~end.y : end.y);
    this.__ctx.lineWidth = 2;
    this.__ctx.stroke();
    this.__ctx.closePath();
    this.__ctx.restore();
  }

  drawPoint(point: Vector, pointOptions: PointGraphicsOptions = { color: Color.Black, size: 5 }): void {
    this.__ctx.save();
    this.__ctx.beginPath();
    this.__ctx.fillStyle = pointOptions.color.toString();
    this.__ctx.arc(this.snapToPixel ? ~~point.x : point.x, this.snapToPixel ? ~~point.y : point.y, pointOptions.size, 0, Math.PI * 2);
    this.__ctx.fill();
    this.__ctx.closePath();
    this.__ctx.restore();
  }

  /**
   * Draw an image to the Excalibur Graphics context at an x and y coordinate using the images width and height
   */
  drawImage(graphic: Graphic, x: number, y: number): void;
  /**
   *
   * Draw an image to the Excalibur Graphics context at an x and y coordinate with a specific width and height
   */
  drawImage(graphic: Graphic, x: number, y: number, width: number, height: number): void;
  /**
   *
   * Draw an image to the Excalibur Graphics context specifying the source image coordinates (sx, sy, swidth, sheight)
   * and to a specific destination on the context (dx, dy, dwidth, dheight)
   */
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
    this.__ctx.globalAlpha = this.opacity;
    const args = [graphic.getSource(), sx, sy, swidth, sheight, dx, dy, dwidth, dheight]
      .filter((a) => a !== undefined)
      .map((a) => (typeof a === 'number' && this.snapToPixel ? ~~a : a));
    this.__ctx.drawImage.apply(this.__ctx, args);
  }

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
  }

  /**
   * Flushes the batched draw calls to the screen
   */
  flush(): void {
    // pass
  }
}
