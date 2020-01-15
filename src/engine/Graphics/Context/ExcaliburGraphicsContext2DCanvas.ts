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

  drawDebugRect(x: number, y: number, width: number, height: number): void {
    this._ctx.save();
    this._ctx.strokeStyle = 'red';
    this._ctx.strokeRect(x, y, width, height);
    this._ctx.restore();
  }

  /**
   *
   * @param image
   * @param x
   * @param y
   */
  drawImage(graphic: ImageSource, x: number, y: number): void;
  /**
   *
   * @param image
   * @param x
   * @param y
   * @param width
   * @param height
   */
  drawImage(graphic: ImageSource, x: number, y: number, width: number, height: number): void;
  /**
   *
   * @param image
   * @param sx
   * @param sy
   * @param swidth
   * @param sheight
   * @param dx
   * @param dy
   * @param dwidth
   * @param dheight
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
    const args = [graphic, sx, sy, swidth, sheight, dx, dy, dwidth, dheight].filter((a) => a !== undefined);
    if (graphic instanceof HTMLCanvasElement || graphic instanceof HTMLImageElement) {
      this._ctx.drawImage.apply(this._ctx, args);
    }
  }

  save(): void {
    this._ctx.save();
  }

  restore(): void {
    this._ctx.restore();
  }

  translate(x: number, y: number): void {
    this._ctx.translate(x, y);
  }

  rotate(angle: number): void {
    this._ctx.rotate(angle);
  }

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
