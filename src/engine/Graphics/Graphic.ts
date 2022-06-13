import { Vector, vec } from '../Math/vector';
import { ExcaliburGraphicsContext } from './Context/ExcaliburGraphicsContext';
import { BoundingBox } from '../Collision/BoundingBox';
import { Color } from '../Color';
import { watch } from '../Util/Watch';
import { AffineMatrix } from '../Math/affine-matrix';

export interface GraphicOptions {
  /**
   * The width of the graphic
   */
  width?: number;
  /**
   * The height of the graphic
   */
  height?: number;
  /**
   * Should the graphic be flipped horizontally
   */
  flipHorizontal?: boolean;
  /**
   * Should the graphic be flipped vertically
   */
  flipVertical?: boolean;
  /**
   * The rotation of the graphic
   */
  rotation?: number;
  /**
   * The scale of the graphic
   */
  scale?: Vector;
  /**
   * The opacity of the graphic
   */
  opacity?: number;
  /**
   * The tint of the graphic, this color will be multiplied by the original pixel colors
   */
  tint?: Color;
  /**
   * The origin of the drawing in pixels to use when applying transforms, by default it will be the center of the image
   */
  origin?: Vector;
}

/**
 * A Graphic is the base Excalibur primitive for something that can be drawn to the [[ExcaliburGraphicsContext]].
 * [[Sprite]], [[Animation]], [[GraphicsGroup]], [[Canvas]], [[Rectangle]], [[Circle]], and [[Polygon]] all derive from the
 * [[Graphic]] abstract class.
 *
 * Implementors of a Graphic must override the abstract [[Graphic._drawImage]] method to render an image to the graphics context. Graphic
 * handles all the position, rotation, and scale transformations in [[Graphic._preDraw]] and [[Graphic._postDraw]]
 */
export abstract class Graphic {
  private static _ID: number = 0;
  readonly id = Graphic._ID++;

  public transform: AffineMatrix = AffineMatrix.identity();
  public tint: Color = null;

  private _transformStale = true;
  public isStale() {
    return this._transformStale;
  }

  /**
   * Gets or sets wether to show debug information about the graphic
   */
  public showDebug: boolean = false;


  private _flipHorizontal = false;
  /**
   * Gets or sets the flipHorizontal, which will flip the graphic horizontally (across the y axis)
   */
  public get flipHorizontal(): boolean {
    return this._flipHorizontal;
  }

  public set flipHorizontal(value: boolean) {
    this._flipHorizontal = value;
    this._transformStale = true;
  }

  private _flipVertical = false;
  /**
   * Gets or sets the flipVertical, which will flip the graphic vertically (across the x axis)
   */
  public get flipVertical(): boolean {
    return this._flipVertical;
  }

  public set flipVertical(value: boolean) {
    this._flipVertical = value;
    this._transformStale = true;
  }

  private _rotation = 0;
  /**
   * Gets or sets the rotation of the graphic
   */
  public get rotation(): number {
    return this._rotation;
  }

  public set rotation(value: number) {
    this._rotation = value;
    this._transformStale = true;
  }

  /**
   * Gets or sets the opacity of the graphic, 0 is transparent, 1 is solid (opaque).
   */
  public opacity: number = 1;

  private _scale = Vector.One;
  /**
   * Gets or sets the scale of the graphic, this affects the width and
   */
  public get scale() {
    return this._scale;
  }

  public set scale(value: Vector) {
    this._scale = watch(value, () => {
      this._transformStale = true;
    });
    this._transformStale = true;
  }

  private _origin: Vector | null = null;
  /**
   * Gets or sets the origin of the graphic, if not set the center of the graphic is the origin
   */
  public get origin(): Vector | null {
    return this._origin;
  }

  public set origin(value: Vector | null) {
    this._origin = watch(value, () => {
      this._transformStale = true;
    });
    this._transformStale = true;
  }

  constructor(options?: GraphicOptions) {
    if (options) {
      this.origin = options.origin ?? this.origin;
      this.flipHorizontal = options.flipHorizontal ?? this.flipHorizontal;
      this.flipVertical = options.flipVertical ?? this.flipVertical;
      this.rotation = options.rotation ?? this.rotation;
      this.opacity = options.opacity ?? this.opacity;
      this.scale = options.scale ?? this.scale;
    }
  }

  public cloneGraphicOptions(): GraphicOptions {
    return {
      origin: this.origin ? this.origin.clone() : null,
      flipHorizontal: this.flipHorizontal,
      flipVertical: this.flipVertical,
      rotation: this.rotation,
      opacity: this.opacity,
      scale: this.scale ? this.scale.clone() : null
    };
  }

  private _width: number = 0;

  /**
   * Gets or sets the width of the graphic (always positive)
   */
  public get width() {
    return Math.abs(this._width * this.scale.x);
  }

  private _height: number = 0;

  /**
   * Gets or sets the height of the graphic (always positive)
   */
  public get height() {
    return Math.abs(this._height * this.scale.y);
  }

  public set width(value: number) {
    this._width = value;
    this._transformStale = true;
  }

  public set height(value: number) {
    this._height = value;
    this._transformStale = true;
  }

  /**
   * Gets a copy of the bounds in pixels occupied by the graphic on the the screen. This includes scale.
   */
  public get localBounds(): BoundingBox {
    return BoundingBox.fromDimension(this.width, this.height, Vector.Zero);
  }

  /**
   * Draw the whole graphic to the context including transform
   * @param ex The excalibur graphics context
   * @param x
   * @param y
   */
  public draw(ex: ExcaliburGraphicsContext, x: number, y: number): void {
    this._preDraw(ex, x, y);
    this._drawImage(ex, 0, 0);
    this._postDraw(ex);
  }

  /**
   * Meant to be overridden by the graphic implementation to draw the underlying image (HTMLCanvasElement or HTMLImageElement)
   * to the graphics context without transform. Transformations like position, rotation, and scale are handled by [[Graphic._preDraw]]
   * and [[Graphic._postDraw]]
   * @param ex The excalibur graphics context
   * @param x
   * @param y
   */
  protected abstract _drawImage(ex: ExcaliburGraphicsContext, x: number, y: number): void;

  /**
   * Apply affine transformations to the graphics context to manipulate the graphic before [[Graphic._drawImage]]
   * @param ex
   * @param x
   * @param y
   */
  protected _preDraw(ex: ExcaliburGraphicsContext, x: number, y: number): void {
    ex.save();
    ex.translate(x, y);
    if (this._transformStale) {
      this.transform.reset();
      this.transform.scale(Math.abs(this.scale.x), Math.abs(this.scale.y));
      this._rotate(this.transform);
      this._flip(this.transform);
      this._transformStale = false;
    }
    ex.multiply(this.transform);
    // it is important to multiply alphas so graphics respect the current context
    ex.opacity = ex.opacity * this.opacity;
    if (this.tint) {
      ex.tint = this.tint;
    }
  }

  protected _rotate(ex: ExcaliburGraphicsContext | AffineMatrix) {
    const scaleDirX = this.scale.x > 0 ? 1 : -1;
    const scaleDirY = this.scale.y > 0 ? 1 : -1;
    const origin = this.origin ?? vec(this.width / 2, this.height / 2);
    ex.translate(origin.x, origin.y);
    ex.rotate(this.rotation);
    // This is for handling direction changes 1 or -1, that way we don't have mismatched translates()
    ex.scale(scaleDirX, scaleDirY);
    ex.translate(-origin.x, -origin.y);
  }

  protected _flip(ex: ExcaliburGraphicsContext | AffineMatrix) {
    if (this.flipHorizontal) {
      ex.translate(this.width / this.scale.x, 0);
      ex.scale(-1, 1);
    }

    if (this.flipVertical) {
      ex.translate(0, this.height / this.scale.y);
      ex.scale(1, -1);
    }
  }

  /**
   * Apply any additional work after [[Graphic._drawImage]] and restore the context state.
   * @param ex
   */
  protected _postDraw(ex: ExcaliburGraphicsContext): void {
    if (this.showDebug) {
      ex.debug.drawRect(0, 0, this.width, this.height);
    }
    ex.restore();
  }

  /**
   * Returns a new instance of the graphic that has the same properties
   */
  abstract clone(): Graphic;
}
