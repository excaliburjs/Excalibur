import { Vector, vec } from '../Algebra';
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
  width?: number;
  height?: number;
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
  /**
   * Bitmap used in internal implemenation to display graphics
   * THIS WILL CHANGE, do not rely on it
   * @internal
   */
  public _bitmap: HTMLCanvasElement;
  public _texture: WebGLTexture;

  private _ctx: CanvasRenderingContext2D;
  private _dirty: boolean = true;
  private _bounds: BoundingBox;

  /**
   * Gets whether teh graphic is dirty
   */
  public get dirty() {
    return this._dirty;
  }

  /**
   * Flags the graphic as dirty, meaning it must be re-rasterized before draw.
   * This should be called any time the graphics state changes such that it affects the outputed drawing
   */
  public flagDirty() {
    this._dirty = true;
  }

  // TODO changing anyone of these invalidates the _bitmap, sets the dirty flag
  // Maybe use proxy to cleanup?
  // Options
  private _smoothing: boolean = false;
  /**
   * Gets or sets the smoothing (anti-aliasing of the graphic)
   */
  public get smoothing() {
    return this._smoothing;
  }
  public set smoothing(value: boolean) {
    this._smoothing = value;
    this.flagDirty();
  }

  private _flipHorizontal: boolean = false;
  /**
   * Gets or sets the flipHorizontal, which will flip the graphic horizontally (across the y axis)
   */
  public get flipHorizontal() {
    return this._flipHorizontal;
  }
  public set flipHorizontal(value: boolean) {
    this._flipHorizontal = value;
    this.flagDirty();
  }

  private _flipVertical: boolean = false;
  /**
   * Gets or sets the flipVertical, which will flip the graphic vertically (across the x axis)
   */
  public get flipVertical() {
    return this._flipVertical;
  }
  public set flipVertical(value: boolean) {
    this._flipVertical = value;
    this.flagDirty();
  }

  private _rotation: number = 0;
  /**
   * Gets or sets the rotation of the graphic
   */
  public get rotation() {
    return this._rotation;
  }
  public set rotation(value: number) {
    this._rotation = value;
    this.flagDirty();
  }

  private _opacity: number = 1.0;
  public get opacity() {
    return this._opacity;
  }
  public set opacity(value: number) {
    this._opacity = value;
    this.flagDirty();
  }

  private _scale = Vector.One;
  public get scale() {
    return this._scale;
  }
  public set scale(value) {
    this._scale = value;
    this.flagDirty();
  }

  // TODO origin needs implementing
  private _origin = Vector.Zero;
  public get origin() {
    return this._origin;
  }
  public set origin(value) {
    this._origin = value;
    this.flagDirty();
  }

  private _fillStyle: string = 'black';
  public get fillStyle() {
    return this._fillStyle;
  }
  public set fillStyle(value) {
    this._fillStyle = value;
    this.flagDirty();
  }

  private _strokeStyle: string = '';
  public get strokeStyle() {
    return this._strokeStyle;
  }
  public set strokeStyle(value) {
    this._strokeStyle = value;
    this.flagDirty();
  }

  constructor(options?: GraphicOptions) {
    if (options) {
      this.origin = options.origin ?? this.origin;
      this._bounds = new BoundingBox(0, 0, options.width, options.height);
      this.smoothing = options.smoothing ?? this.smoothing;
      this.flipHorizontal = options.flipHorizontal ?? this.flipHorizontal;
      this.flipVertical = options.flipVertical ?? this.flipVertical;
      this.rotation = options.rotation ?? this.rotation;
      this.opacity = options.opacity ?? this.opacity;
      this.scale = options.scale ?? this.scale;
      this.fillStyle = options.fillStyle ?? this.fillStyle;
      this.strokeStyle = options.strokeStyle ?? this.strokeStyle;
    }

    this._bitmap = document.createElement('canvas');
    const maybeCtx = this._bitmap.getContext('2d');
    if (!maybeCtx) {
      throw new Error('Browser does not support 2d canvas drawing');
    } else {
      this._ctx = maybeCtx;
    }
  }

  /**
   * Gets or sets the width of the graphic bitmap, note setting a new value this flags the graphic [[Graphic.dirty]]
   */
  public get width() {
    return this._bitmap.width;
  }

  /**
   * Gets or sets the height of the graphic bitmap, note setting a new value flags the graphic [[Graphic.dirty]]
   */
  public get height() {
    return this._bitmap.height;
  }

  public set width(value: number) {
    this._bitmap.width = value;
    this.flagDirty();
  }

  public set height(value: number) {
    this._bitmap.height = value;
    this.flagDirty();
  }

  /**
   * Gets or sets the bounds of the graphic
   */
  public get bounds() {
    return this._bounds;
  }

  public set bounds(value) {
    this._bounds = value;
    this.flagDirty();
  }

  public get rotatedBounds() {
    return this._bounds.rotate(this.rotation, vec(this.width / 2, this.height / 2));
  }

  /**
   * A promise that resolves after the graphic is at the end state
   */
  public get finished(): Promise<any> {
    return Promise.resolve();
  }

  /**
   * A promise that resolve when the graphic is ready to be rasterized
   */
  public get readyToRasterize(): Promise<any> {
    return Promise.resolve();
  }

  /**
   * Rasterize the graphic to a bitmap making it usuable as in excalibur. Rasterize is called automatically if
   * the graphic is [[Graphic.dirty]] on the next [[Graphic.draw]] call
   */
  public rasterize(): void {
    this._dirty = false;
    this._ctx.clearRect(0, 0, this.width, this.height);
    this._pushContextTransforms();
    this.execute(this._ctx);
    this._popContextTransforms();
  }

  protected _pushContextTransforms(options?: DrawOptions): void {
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
    this._ctx.translate(-width / 2, -height / 2);

    this._ctx.translate(x, y);
    this._ctx.rotate(rotation);
    // this._ctx.scale(scale.x, scale.y);

    if (flipHorizontal) {
      this._ctx.scale(-1, 1);
    }

    if (flipVertical) {
      this._ctx.scale(1, -1);
    }
    this._ctx.translate(width / 2, height / 2);
  }

  protected _popContextTransforms(): void {
    this._ctx.restore();
  }

  /**
   * Draw the graphic on the excalibur graphics context
   * @param ex The excalibur graphics context
   * @param x
   * @param y
   */
  public draw(ex: ExcaliburGraphicsContext, x: number, y: number) {
    // TODO draw with options to avoid manipulating graphic state
    // If dirty re-raster
    if (this._dirty) {
      this.rasterize();
    }

    ex.drawImage(this, x, y);
  }

  /**
   * Executes drawing implemenation of the graphic, this is where the specific drawing code for the graphic
   * should be implemented. Once `rasterize()` the graphic can be drawn to the [[ExcaliburGraphicsContext]] via `draw(...)`
   * @param ctx Canvas to draw the graphic to
   * @param options
   */
  abstract execute(ctx: CanvasRenderingContext2D, options?: DrawOptions): void;
}
