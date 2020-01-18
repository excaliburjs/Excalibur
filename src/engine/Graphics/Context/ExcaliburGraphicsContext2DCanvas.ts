import { ExcaliburGraphicsContext, ExcaliburGraphicsContextState, ImageSource } from './ExcaliburGraphicsContext';

export class ExcaliburGraphicsContext2DCanvas implements ExcaliburGraphicsContext {
  public get width() {
    return this._ctx.canvas.width;
  }

  public get height() {
    return this._ctx.canvas.height;
  }

  private _state: ExcaliburGraphicsContextState[] = [
    {
      opacity: 1
    }
  ];

  public get opacity(): number {
    return this._state[0].opacity;
  }

  public set opacity(value: number) {
    this._state[0].opacity = value;
  }

  public snapToPixel: boolean = false;

  constructor(private _ctx: CanvasRenderingContext2D) {}

  /**
   * Draw a debug rectangle to the context
   * @param x
   * @param y
   * @param width
   * @param height
   */
  drawDebugRect(x: number, y: number, width: number, height: number): void {
    this._ctx.save();
    this._ctx.strokeStyle = 'red';
    this._ctx.strokeRect(x, y, width, height);
    this._ctx.restore();
  }

  /**
   * Draw an image to the Excalibur Graphics context at an x and y coordinate using the images width and height
   */
  drawImage(graphic: ImageSource, x: number, y: number): void;
  /**
   *
   * Draw an image to the Excalibur Graphics context at an x and y coordinate with a specific width and height
   */
  drawImage(graphic: ImageSource, x: number, y: number, width: number, height: number): void;
  /**
   *
   * Draw an image to the Excalibur Graphics context specifying the source image coordinates (sx, sy, swidth, sheight)
   * and to a specific destination on the context (dx, dy, dwidth, dheight)
   */
  drawImage(
    graphic: ImageSource,
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
    graphic: ImageSource,
    sx: number,
    sy: number,
    swidth?: number,
    sheight?: number,
    dx?: number,
    dy?: number,
    dwidth?: number,
    dheight?: number
  ): void {
    this._ctx.globalAlpha = this.opacity;
    const args = [graphic, sx, sy, swidth, sheight, dx, dy, dwidth, dheight]
      .filter((a) => a !== undefined)
      .map((a) => (typeof a === 'number' && this.snapToPixel ? ~~a : a));
    if (graphic instanceof HTMLCanvasElement || graphic instanceof HTMLImageElement) {
      this._ctx.drawImage.apply(this._ctx, args);
    }
  }

  /**
   * Save the current state of the canvas to the stack (transforms and opacity)
   */
  save(): void {
    this._ctx.save();
  }

  /**
   * Restore the state of the canvas from the stack
   */
  restore(): void {
    this._ctx.restore();
  }

  /**
   * Translate the origin of the context by an x and y
   * @param x
   * @param y
   */
  translate(x: number, y: number): void {
    this._ctx.translate(this.snapToPixel ? ~~x : x, this.snapToPixel ? ~~y : y);
  }

  /**
   * Rotate the context about the current origin
   */
  rotate(angle: number): void {
    this._ctx.rotate(angle);
  }

  /**
   * Scale the context by an x and y factor
   * @param x
   * @param y
   */
  scale(x: number, y: number): void {
    this._ctx.scale(x, y);
  }

  /**
   * Flushes the batched draw calls to the screen
   */
  flush(): void {
    // pass
  }
}
