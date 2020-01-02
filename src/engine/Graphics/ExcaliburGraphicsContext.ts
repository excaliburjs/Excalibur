import { Graphic } from './Graphic';

export interface ExcaliburGraphicsContext {
  width: number;
  height: number;
  snapToPixel: boolean;
  packBatch: boolean;
  // diag: ExcaliburContextDiagnostics;

  /**
   *
   * @param image
   * @param x
   * @param y
   */
  drawImage(image: Graphic, x: number, y: number): void;
  /**
   *
   * @param image
   * @param x
   * @param y
   * @param width
   * @param height
   */
  drawImage(image: Graphic, x: number, y: number, width: number, height: number): void;
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
    image: Graphic,
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
  paint(): void;
}
