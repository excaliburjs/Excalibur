import { Graphic } from '../Graphic';
import { RawImage } from '../RawImage';

export type ImageSource = Graphic | RawImage;

export interface HasExcaliburDraw {
  draw(ex: ExcaliburGraphicsContext, x: number, y: number): void;
}

export interface ExcaliburGraphicsContextState {
  opacity: number;
}

export interface ExcaliburGraphicsContext {
  width: number;
  height: number;

  snapToPixel: boolean;

  opacity: number;

  // diag: ExcaliburContextDiagnostics;

  drawDebugRect(x: number, y: number, width: number, height: number): void;

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
