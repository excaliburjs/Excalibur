import { Vector } from '../Math/vector';
import { ExcaliburGraphicsContext, LineGraphicsOptions, PointGraphicsOptions } from './Context/ExcaliburGraphicsContext';
import { Color } from '../Color';
import { Ray } from '../Math/ray';
import { BoundingBox } from '../excalibur';

export class Debug {
  static _drawCalls: ((ctx: ExcaliburGraphicsContext) => void)[] = [];
  static _ctx: ExcaliburGraphicsContext;
  static z: number = Infinity;
  static registerGraphicsContext(ctx: ExcaliburGraphicsContext) {
    Debug._ctx = ctx;
  }
  static draw(debugDrawCall: (ctx: ExcaliburGraphicsContext) => void) {
    this._drawCalls.push(debugDrawCall);
  }

  static drawPoint(point: Vector, options?: PointGraphicsOptions) {
    Debug.draw((ctx) => {
      ctx.debug.drawPoint(point, options);
    });
  }

  static drawLine(start: Vector, end: Vector, options?: LineGraphicsOptions) {
    Debug.draw((ctx) => {
      ctx.debug.drawLine(start, end, options);
    });
  }

  static drawLines(points: Vector[], options?: LineGraphicsOptions) {
    if (points.length > 1) {
      Debug.draw((ctx) => {
        for (let i = 0; i < points.length - 1; i++) {
          ctx.debug.drawLine(points[i], points[i + 1], options);
        }
      });
    }
  }

  static drawText(text: string, pos: Vector) {
    Debug.draw((ctx) => {
      ctx.debug.drawText(text, pos);
    });
  }

  static drawPolygon(points: Vector[], options?: { color?: Color }) {
    if (points.length > 1) {
      Debug.draw((ctx) => {
        const firstPoint = points[0];
        const polygon = [...points, firstPoint];
        for (let i = 0; i < polygon.length - 1; i++) {
          ctx.debug.drawLine(polygon[i], polygon[i + 1], options);
        }
      });
    }
  }

  static drawCircle(
    center: Vector,
    radius: number,
    options?: {
      color?: Color;
      strokeColor?: Color;
      width?: number;
    }
  ) {
    const { color, strokeColor, width } = {
      color: Color.Black,
      strokeColor: undefined,
      width: undefined,
      ...options
    };
    Debug.draw((ctx) => {
      ctx.drawCircle(center, radius, color, strokeColor, width);
    });
  }

  static drawBounds(boundingBox: BoundingBox, options?: { color?: Color }): void {
    Debug.draw((ctx) => {
      ctx.debug.drawRect(boundingBox.left, boundingBox.top, boundingBox.width, boundingBox.height, options);
    });
  }

  static drawRay(ray: Ray, options?: { distance?: number; color?: Color }) {
    const { distance, color } = {
      color: Color.Blue,
      distance: 10,
      ...options
    };
    Debug.draw((ctx) => {
      const start = ray.pos;
      const end = ray.pos.add(ray.dir.scale(distance));

      ctx.debug.drawLine(start, end, { color });
    });
  }

  static flush(ctx: ExcaliburGraphicsContext) {
    ctx.save();
    ctx.z = Debug.z;
    for (const drawCall of Debug._drawCalls) {
      drawCall(ctx);
    }
    ctx.restore();
    Debug.clear();
  }

  static clear() {
    Debug._drawCalls.length = 0;
  }
}
