import { Graphic, GraphicOptions } from './Graphic';

export interface RectOptions {
  width: number;
  height: number;
}

export class Rect extends Graphic {
  public width: number;
  public height: number;

  constructor(options: GraphicOptions & RectOptions) {
    super(options);
    this.width = options.width;
    this.height = options.height;
    this.rasterize();
  }

  execute(ctx: CanvasRenderingContext2D): void {
    ctx.fillRect(0, 0, this.width, this.height);
  }
}
