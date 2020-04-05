import { Matrix } from '../../Math/matrix';
import { Graphic } from '../Graphic';

export interface DrawCommand {
  image: Graphic;
  width: number;
  height: number;
  dest: [number, number]; // x, y
}

export class DrawImageCommand implements DrawCommand {
  public image: Graphic;
  public width: number = 0;
  public height: number = 0;
  public dest: [number, number] = [0, 0]; // x, y
  public view: [number, number, number, number] = [0, 0, 0, 0]; // sx, sy, sw, sh
  public transform: Matrix | null = null;
  private _geom: [number, number][] = [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0]
  ];
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
    image: Graphic,
    sx: number,
    sy: number,
    swidth?: number,
    sheight?: number,
    dx?: number,
    dy?: number,
    dwidth?: number,
    dheight?: number
  ) {
    this.image = image;
    this.width = image.width || swidth;
    this.height = image.height || sheight;
    this.view = [0, 0, swidth ?? image.width, sheight ?? image.height];
    this.dest = [sx, sy];
    // If destination is specified, update view and dest
    if (dx !== undefined && dy !== undefined && dwidth !== undefined && dheight !== undefined) {
      this.view = [sx, sy, swidth ?? image.width, sheight ?? image.height];
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
  }

  calculateGeometry(): void {
    if (this.transform) {
      for (let i = 0; i < this._geom.length; i++) {
        this._geom[i] = this.transform.multv(this._geom[i]);
      }
    }
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
