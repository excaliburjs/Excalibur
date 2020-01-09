import { Graphic, GraphicOptions } from './Graphic';

export interface CircleOptions {
  radius: number;
}

export class Circle extends Graphic {
  public radius: number;
  constructor(options: GraphicOptions & CircleOptions) {
    super(options);
    this.radius = options.radius;
    this.width = this.radius * 2;
    this.height = this.radius * 2;
    this.rasterize();
  }

  execute(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.arc(this.radius, this.radius, this.radius, 0, Math.PI * 2);
    // ctx.closePath();

    if (this.fillStyle) {
      ctx.fill();
    }

    if (this.strokeStyle) {
      ctx.stroke();
    }
  }
}
