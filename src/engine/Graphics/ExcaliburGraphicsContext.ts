import { Graphic } from './Graphic';
import { RawImage } from './RawImage';

export type ImageSource = Graphic | RawImage;

export interface HasExcaliburDraw {
  draw(ex: ExcaliburGraphicsContext, x: number, y: number): void;
}

export interface ExcaliburGraphicsContext {
  width: number;
  height: number;

  snapToPixel: boolean;

  // diag: ExcaliburContextDiagnostics;

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

  save(): void;
  restore(): void;

  translate(x: number, y: number): void;
  rotate(angle: number): void;
  scale(x: number, y: number): void;

  /**
   * Flushes the batched draw calls to the screen
   */
  flush(): void;
}

export class ExcaliburGraphicsContext2DCanvas implements ExcaliburGraphicsContext {
  public get width() {
    return this._ctx.canvas.width;
  }

  public get height() {
    return this._ctx.canvas.height;
  }

  public snapToPixel: boolean = false;

  constructor(private _ctx: CanvasRenderingContext2D) {}

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
    if (graphic instanceof Graphic) {
      this._ctx.drawImage(graphic._bitmap, sx, sy); //, swidth, sheight, dx, dy, dwidth, dheight);
    }

    if (graphic instanceof RawImage) {
      this._ctx.drawImage(graphic.image, sx, sy, swidth, sheight, dx, dy, dwidth, dheight);
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
