import { Vector } from '../Algebra';
import { nullish } from '../Util/Util';
import { ExcaliburGraphicsContext } from './ExcaliburGraphicsContext';
import { BoundingBox } from '../Collision/BoundingBox';

export interface DrawOptions {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  anchor?: Vector;
  scale?: Vector;
  offset?: Vector;
  fillStyle?: string;
  strokeStyle?: string;
  opacity?: number;
}

export interface GraphicOptions {
  smoothing?: boolean;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  rotation?: number;
  scale?: Vector;
  fillStyle?: string;
  strokeStyle?: string;
  opacity?: number;
  /**
   * The origin of the drawing to use when drawing, by default (0, 0)
   */
  origin?: Vector; // this may need to go onto base graphic?
}

export abstract class Graphic {
  public image: HTMLCanvasElement;
  // TODO webgl texture here
  private _ctx: CanvasRenderingContext2D;

  // Options
  public smoothing: boolean = false;
  public flipHorizontal: boolean = false;
  public flipVertical: boolean = false;
  public rotation: number = 0;
  public opacity: number = 1.0;
  public scale = Vector.One;
  public origin = Vector.Zero;
  public fillStyle: string = 'black';
  public strokeStyle: string = '';

  constructor(options?: GraphicOptions) {
    if (options) {
      this.smoothing = nullish(options.smoothing, this.smoothing);
      this.flipHorizontal = nullish(options.flipHorizontal, this.flipHorizontal);
      this.flipVertical = nullish(options.flipVertical, this.flipVertical);
      this.rotation = nullish(options.rotation, this.rotation);
      this.opacity = nullish(options.opacity, this.opacity);
      this.scale = nullish(options.scale, this.scale);
      this.origin = nullish(options.origin, this.origin);
      this.fillStyle = nullish(options.fillStyle, this.fillStyle);
      this.strokeStyle = nullish(options.strokeStyle, this.strokeStyle);
    }

    this.image = document.createElement('canvas');
    const maybeCtx = this.image.getContext('2d');
    if (!maybeCtx) {
      throw new Error('Browser does not support 2d canvas drawing');
    } else {
      this._ctx = maybeCtx;
    }
  }

  /**
   * Gets or sets the width of the graphic bitmap,
   */
  public get width() {
    return this.image.width;
  }

  /**
   * Gets or sets the height of the graphic bitmap
   */
  public get height() {
    return this.image.height;
  }

  public set width(value: number) {
    this.image.width = value;
  }

  public set height(value: number) {
    this.image.height = value;
  }

  public get bounds() {
    return BoundingBox.fromDimension(this.width, this.height);
  }

  // Is there a better name for this
  /**
   * Whether the graphic has a possible end state
   */
  public get canFinish(): boolean {
    return true;
  }

  /**
   * A promise that resolves after the graphic is at the end state
   */
  public get finished(): Promise<any> {
    return Promise.resolve();
  }

  /**
   * A promise that resolve when the graphic is ready to be painted
   */
  public get readyToPaint(): Promise<any> {
    return Promise.resolve();
  }

  /**
   * Rasterize the graphic making it usuable as in excalibur
   */
  public paint(): void {
    this._ctx.clearRect(0, 0, this.width, this.height);
    this._pushTransforms();
    this.draw(this._ctx);
    this._popTransforms();
  }

  protected _pushTransforms(options?: DrawOptions): void {
    options = options ?? {};
    const { x, y, rotation, width, height, opacity, flipHorizontal, flipVertical } = {
      ...options,
      x: options?.x ?? 0,
      y: options?.y ?? 0,
      rotation: options?.rotation ?? this.rotation,
      width: options?.width ?? this.width,
      height: options?.height ?? this.height,
      // scale: nullish(options.scale, this.scale),
      flipHorizontal: options?.flipHorizontal ?? this.flipHorizontal,
      flipVertical: options?.flipVertical ?? this.flipVertical,
      opacity: options?.opacity ?? this.opacity
    };

    this._ctx.save();

    this._ctx.imageSmoothingEnabled = this.smoothing;
    this._ctx.strokeStyle = this.strokeStyle;
    this._ctx.fillStyle = this.fillStyle;
    this._ctx.globalAlpha = opacity;

    // adjust center to be origin
    this._ctx.translate(width / 2, height / 2);

    this._ctx.translate(x, y);
    this._ctx.rotate(rotation);
    // this._ctx.scale(scale.x, scale.y);

    if (flipHorizontal) {
      this._ctx.translate(width, 0);
      this._ctx.scale(-1, 1);
    }

    if (flipVertical) {
      this._ctx.translate(0, height);
      this._ctx.scale(1, -1);
    }
    this._ctx.translate(-width / 2, -height / 2);
  }

  protected _popTransforms(): void {
    this._ctx.restore();
  }

  public blit(ex: ExcaliburGraphicsContext, x: number, y: number) {
    ex.drawImage(this, x, y);
  }

  abstract draw(ctx: CanvasRenderingContext2D, options?: DrawOptions): void;
}
