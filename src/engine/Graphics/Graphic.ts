import { Vector, vec } from '../Algebra';
import { ExcaliburGraphicsContext } from './Context/ExcaliburGraphicsContext';
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
  opacity?: number;
}

export interface GraphicOptions {
  width?: number;
  height?: number;
  // smoothing?: boolean;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  rotation?: number;
  scale?: Vector;
  // fillStyle?: string;
  // strokeStyle?: string;
  opacity?: number; // Is opacity a raster option? what about sprites!!!
  /**
   * The origin of the drawing to use when drawing, by default (0, 0)
   */
  origin?: Vector; // this may need to go onto base graphic?
}

export abstract class Graphic {
  private _bounds: BoundingBox;

  public showDebug: boolean = false;

  /**
   * Gets or sets the flipHorizontal, which will flip the graphic horizontally (across the y axis)
   */
  public flipHorizontal: boolean = false;

  /**
   * Gets or sets the flipVertical, which will flip the graphic vertically (across the x axis)
   */
  public flipVertical: boolean = false;

  /**
   * Gets or sets the rotation of the graphic
   */
  public rotation: number = 0;

  public opacity: number = 1;

  /**
   * Gets or sets the scale of the graphic
   */
  public scale = Vector.One;

  // TODO origin needs implementing
  /**
   * Gets or sets the origin of the graphic
   */
  public origin = Vector.Zero;

  constructor(options?: GraphicOptions) {
    if (options) {
      this.origin = options.origin ?? this.origin;
      this._bounds = new BoundingBox(0, 0, options.width, options.height);
      this.flipHorizontal = options.flipHorizontal ?? this.flipHorizontal;
      this.flipVertical = options.flipVertical ?? this.flipVertical;
      this.rotation = options.rotation ?? this.rotation;
      this.opacity = options.opacity ?? this.opacity;
      this.scale = options.scale ?? this.scale;
    }
  }

  private _width: number = 0;
  /**
   * Gets or sets the width of the graphic
   */
  public get width() {
    return this._width;
  }

  private _height: number = 0;
  /**
   * Gets or sets the height of the graphic
   */
  public get height() {
    return this._height;
  }

  public set width(value: number) {
    this._width = value;
  }

  public set height(value: number) {
    this._height = value;
  }

  /**
   * Gets or sets the bounds of the graphic
   */
  public get bounds() {
    return this._bounds;
  }

  public set bounds(value) {
    this._bounds = value;
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
   * Draw the whole graphic to the context including transform
   * @param ex The excalibur graphics context
   * @param x
   * @param y
   */
  public draw(ex: ExcaliburGraphicsContext, x: number, y: number) {
    this._preDraw(ex, x, y);
    this._drawImage(ex, 0, 0);
    this._postDraw(ex);
  }

  /**
   * Meant to be overriden by the graphic implementation to draw the underlying image (HTMLCanvasElement or HTMLImageElement)
   * to the graphics context without transform. Transformations like position, rotation, and scale are handled by [[Graphic._preDraw]] and [[Graphic._postDraw]]
   * @param ex The excalibur graphics context
   * @param x
   * @param y
   */
  protected abstract _drawImage(ex: ExcaliburGraphicsContext, x: number, y: number): void;

  /**
   * Apply transformations to the graphics context to manipulate the graphic
   * @param ex
   * @param x
   * @param y
   */
  protected _preDraw(ex: ExcaliburGraphicsContext, x: number, y: number): void {
    ex.save();
    ex.translate(x, y);
    // TODO handle with origin/anchor
    ex.translate(this.width / 2, this.height / 2);
    ex.rotate(this.rotation);
    ex.translate(-this.width / 2, -this.height / 2);
    ex.scale(this.scale.x, this.scale.y);

    if (this.flipHorizontal) {
      ex.translate(this.width, 0);
      ex.scale(-1, 1);
    }

    if (this.flipVertical) {
      ex.translate(0, this.height);
      ex.scale(1, -1);
    }
    ex.opacity = this.opacity;
  }

  /**
   * Apply any addtional work after [[Graphic._drawImage]] and restore the context state.
   * @param ex
   */
  protected _postDraw(ex: ExcaliburGraphicsContext): void {
    if (this.showDebug) {
      ex.drawDebugRect(0, 0, this.width, this.height);
    }
    ex.restore();
  }
}
