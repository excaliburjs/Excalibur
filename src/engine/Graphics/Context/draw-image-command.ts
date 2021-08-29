import { Matrix } from '../../Math/matrix';
import { BoundingBox } from '../../Collision/Index';
import { Color } from '../../Color';
import { Pool, Poolable } from '../../Util/Pool';
import { HTMLImageSource } from './ExcaliburGraphicsContext';
import { vec, Vector } from '../../Algebra';

export enum DrawCommandType {
  Image = 'image',
  Line = 'line',
  Rectangle = 'rectangle',
  Circle = 'circle'
}

export class DrawImageCommand implements Poolable {
  _pool: Pool<this> = undefined;

  public snapToPixel: boolean = true;
  public image: HTMLImageSource;
  public color: Color;
  public type = DrawCommandType.Image
  public opacity: number = 1;
  public width: number = 0;
  public height: number = 0;
  public dest: [number, number] = [0, 0]; // x, y
  public view: [number, number, number, number] = [0, 0, 0, 0]; // sx, sy, sw, sh
  private _geom: [number, number][] = [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0]
  ];
  constructor();
  constructor(image: HTMLImageSource, x: number, y: number);
  constructor(image: HTMLImageSource, x: number, y: number, width?: number, height?: number);
  constructor(
    image: HTMLImageSource,
    sx: number,
    sy: number,
    swidth?: number,
    sheight?: number,
    dx?: number,
    dy?: number,
    dwidth?: number,
    dheight?: number
  );
  constructor(
    image?: HTMLImageSource,
    sx?: number,
    sy?: number,
    swidth?: number,
    sheight?: number,
    dx?: number,
    dy?: number,
    dwidth?: number,
    dheight?: number
  ) {
    this.init(image, sx, sy, swidth, sheight, dx, dy, dwidth, dheight);
  }

  public init(
    image?: HTMLImageSource,
    sx?: number,
    sy?: number,
    swidth?: number,
    sheight?: number,
    dx?: number,
    dy?: number,
    dwidth?: number,
    dheight?: number
  ) {
    this.type = DrawCommandType.Image;
    this.image = image;
    this.width = image?.width || swidth || 0;
    this.height = image?.height || sheight || 0;
    this.view = [0, 0, swidth ?? image?.width, sheight ?? image?.height];
    this.dest = [sx, sy];
    // If destination is specified, update view and dest
    if (dx !== undefined && dy !== undefined && dwidth !== undefined && dheight !== undefined) {
      this.view = [sx, sy, swidth ?? image?.width, sheight ?? image?.height];
      this.dest = [dx, dy];
      this.width = dwidth;
      this.height = dheight;
    }

    let index = 0;
    this._geom[index++] = [this.dest[0], this.dest[1]];
    this._geom[index++] = [this.dest[0], this.dest[1] + this.height];
    this._geom[index++] = [this.dest[0] + this.width, this.dest[1]];
    this._geom[index++] = [this.dest[0] + this.width, this.dest[1]];
    this._geom[index++] = [this.dest[0], this.dest[1] + this.height];
    this._geom[index++] = [this.dest[0] + this.width, this.dest[1] + this.height];
    if (this.snapToPixel) {
      for (const point of this._geom) {
        point[0] = ~~point[0];
        point[1] = ~~point[1];
      }
    }
    return this;
  }
  public initRect(color: Color, start: Vector, width: number, height: number) {
    this.type = DrawCommandType.Rectangle
    this.color = color;
    this.width = width;
    this.height = height;
    let index = 0;
    this._geom[index++] = [start.x, start.y];
    this._geom[index++] = [start.x, start.y + this.height];
    this._geom[index++] = [start.x + this.width, start.y];
    this._geom[index++] = [start.x + this.width, start.y];
    this._geom[index++] = [start.x, start.y + this.height];
    this._geom[index++] = [start.x + this.width, start.y + this.height];

    if (this.snapToPixel) {
      for (const point of this._geom) {
        point[0] = ~~point[0];
        point[1] = ~~point[1];
      }
    }
    return this;
  }

  public initLine(color: Color, start: Vector, end: Vector, thickness: number) {
    this.type = DrawCommandType.Line;
    this.color = color;
    const dir = end.sub(start).normalize();
    const normal = dir.perpendicular();
    const halfThick = thickness / 2;
    const startTop = normal.scale(halfThick).add(start);
    const startBottom = normal.scale(-halfThick).add(start);
    const endTop = normal.scale(halfThick).add(end);
    const endBottom = normal.scale(-halfThick).add(end);

    /**
     * 
     *    +---------------------^----------------------+
     *    |                     | (normal)             |
     *   (startx, starty)------------------>(endx, endy)
     *    |                                            |
     *    + -------------------------------------------+
     */

    let index = 0;
    this._geom[index++] = [startTop.x, startTop.y];
    this._geom[index++] = [endTop.x, endTop.y];
    this._geom[index++] = [startBottom.x, startBottom.y];
    this._geom[index++] = [startBottom.x, startBottom.y];
    this._geom[index++] = [endTop.x, endTop.y];
    this._geom[index++] = [endBottom.x,endBottom.y];
    this._geom;//?
    if (this.snapToPixel) {
      for (const point of this._geom) {
        point[0] = ~~point[0];
        point[1] = ~~point[1];
      }
    }
    return this;
  }

  public initCircle(pos: Vector, radius: number, color: Color) {
    this.type = DrawCommandType.Circle;
    this.color = color;
    let topLeft = pos.add(vec(-radius, -radius));
    let topRight = pos.add(vec(radius, -radius));
    let bottomRight = pos.add(vec(radius, radius));
    let bottomLeft = pos.add(vec(-radius, radius));
    let index = 0;
    this._geom[index++] = [topLeft.x, topLeft.y];
    this._geom[index++] = [topRight.x, topRight.y];
    this._geom[index++] = [bottomLeft.x, bottomLeft.y];
    this._geom[index++] = [bottomLeft.x, bottomLeft.y];
    this._geom[index++] = [topRight.x, topRight.y];
    this._geom[index++] = [bottomRight.x, bottomRight.y];
    this._geom;//?
    if (this.snapToPixel) {
      for (const point of this._geom) {
        point[0] = ~~point[0];
        point[1] = ~~point[1];
      }
    }
    return this;
  }

  public dispose() {
    this.image = null;
    this.width = 0;
    this.height = 0;
    this.view = [0, 0, 0, 0];
    this.dest = [0, 0];

    let index = 0;
    this._geom[index++] = [this.dest[0], this.dest[1]];
    this._geom[index++] = [this.dest[0], this.dest[1] + this.height];
    this._geom[index++] = [this.dest[0] + this.width, this.dest[1]];
    this._geom[index++] = [this.dest[0] + this.width, this.dest[1]];
    this._geom[index++] = [this.dest[0], this.dest[1] + this.height];
    this._geom[index++] = [this.dest[0] + this.width, this.dest[1] + this.height];
    return this;
  }

  // todo weird
  applyTransform(transform: Matrix, opacity: number): void {
    if (transform) {
      for (let i = 0; i < this._geom.length; i++) {
        this._geom[i] = transform.multv(this._geom[i]);
        if (this.snapToPixel) {
          this._geom[i] = [~~this._geom[i][0], ~~this._geom[i][1]];
        }
      }
    }
    this.opacity = opacity;
  }

  public get geometry() {
    return this._geom;
  }
}

export class DrawRectCommand {
  public dest: [number, number] = [0, 0];
  public width: number = 0;
  public height: number = 0;
  constructor(x: number, y: number, width: number, height: number) {
    this.dest = [x, y];
    this.width = width;
    this.height = height;
  }
}

export class DrawDebugRectCommand {
  constructor(public bounds: BoundingBox, public color: Color) {}
}
