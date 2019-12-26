import { Vector } from '../Algebra';
import { nullish } from '../Util/Util';

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
  public canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;
  private _dirty: boolean = true;

  // Options
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
      this.flipHorizontal = nullish(options.flipHorizontal, this.flipHorizontal);
      this.flipVertical = nullish(options.flipVertical, this.flipVertical);
      this.rotation = nullish(options.rotation, this.rotation);
      this.opacity = nullish(options.opacity, this.opacity);
      this.scale = nullish(options.scale, this.scale);
      this.origin = nullish(options.origin, this.origin);
      this.fillStyle = nullish(options.fillStyle, this.fillStyle);
      this.strokeStyle = nullish(options.strokeStyle, this.strokeStyle);
    }

    this.canvas = document.createElement('canvas');
    const maybeCtx = this.canvas.getContext('2d');
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
    return this.canvas.width;
  }

  /**
   * Gets or sets the height of the graphic bitmap
   */
  public get height() {
    return this.canvas.height;
  }

  public set width(value: number) {
    this.canvas.width = value;
  }

  public set height(value: number) {
    this.canvas.height = value;
  }

  public flagDirty(): void {
    this._dirty = true;
  }

  // Is there a better name for this
  public get canFinish(): boolean {
    return true;
  }

  /**
   * Rasterize the graphic making it usuable as in excalibur
   */
  public paint(): void {
    if (this._dirty) {
      this._ctx.clearRect(0, 0, this.width, this.height);
      this.draw(this._ctx);
      this._dirty = false;
    }
  }

  protected _pushTransforms(options?: DrawOptions): void {
    const { x, y, rotation, width, height, scale, opacity, flipHorizontal, flipVertical } = {
      ...options,
      x: nullish(options.x, 0),
      y: nullish(options.y, 0),
      rotation: nullish(options.rotation, this.rotation),
      width: nullish(options.width, this.width),
      height: nullish(options.height, this.height),
      scale: nullish(options.scale, this.scale),
      flipHorizontal: nullish(options.flipHorizontal, this.flipHorizontal),
      flipVertical: nullish(options.flipVertical, this.flipVertical),
      opacity: nullish(options.opacity, this.opacity)
    };

    this._ctx.save();
    this._ctx.strokeStyle = this.strokeStyle;
    this._ctx.fillStyle = this.fillStyle;
    this._ctx.globalAlpha = opacity;

    this._ctx.translate(x, y);
    this._ctx.rotate(rotation);
    this._ctx.scale(scale.x, scale.y);

    if (flipHorizontal) {
      this._ctx.translate(width, 0);
      this._ctx.scale(-1, 1);
    }

    if (flipVertical) {
      this._ctx.translate(0, height);
      this._ctx.scale(1, -1);
    }
  }

  protected _popTransforms(): void {
    this._ctx.restore();
  }

  abstract draw(ctx: CanvasRenderingContext2D, options?: DrawOptions): void;
}
