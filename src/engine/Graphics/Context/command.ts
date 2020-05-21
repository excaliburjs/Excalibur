import { Matrix } from '../../Math/matrix';
import { Graphic } from '../Graphic';
import { Poolable, initializePoolData } from './pool';
import { BoundingBox } from '../../Collision/Index';
import { Color } from '../../Drawing/Color';

export interface DrawCommand {
  image: Graphic;
  width: number;
  height: number;
  dest: [number, number]; // x, y
}

export class DrawImageCommand implements DrawCommand, Poolable {
  _poolData = initializePoolData();

  public image: Graphic;
  public opacity: number = 1;
  public z: number = 0;
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
  constructor(image: Graphic, x: number, y: number);
  constructor(image: Graphic, x: number, y: number, width?: number, height?: number);
  constructor(
    image: Graphic,
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
    image?: Graphic,
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
    image?: Graphic,
    sx?: number,
    sy?: number,
    swidth?: number,
    sheight?: number,
    dx?: number,
    dy?: number,
    dwidth?: number,
    dheight?: number
  ) {
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
  }

  // todo weird
  applyTransform(transform: Matrix, opacity: number, z: number): void {
    if (transform) {
      for (let i = 0; i < this._geom.length; i++) {
        this._geom[i] = transform.multv(this._geom[i]);
      }
    }
    this.opacity = opacity;
    this.z = z;
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
