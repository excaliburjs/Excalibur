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
    Debug.draw(ctx => {
      ctx.debug.drawPoint(point, options);
    });
  }

  static drawLine(start: Vector, end: Vector, options?: LineGraphicsOptions) {
    Debug.draw(ctx => {
      ctx.debug.drawLine(start, end, options);
    });
  }

  static drawBounds(boundingBox: BoundingBox, options?: { width?: number, color?: Color }): void {
    Debug.draw(ctx => {
      ctx.debug.drawRect(boundingBox.left, boundingBox.top, boundingBox.width, boundingBox.height, options);
    });
  }

  static drawRay(ray: Ray, options?: { distance?: number, color?: Color, width?: number }) {
    const { distance, color, width } = {
      color: Color.Blue,
      width: 1,
      distance: 10,
      ...options
    };
    Debug.draw((ctx) => {
      const start = ray.pos;
      const end = ray.pos.add(ray.dir.scale(distance));

      ctx.drawLine(start, end, color, width);
    });
  }

  static flush(ctx: ExcaliburGraphicsContext) {
    // TODO do we need to adjust the transform? or do a protective save/restore?
    ctx.save();
    ctx.z = Debug.z;
    for (const drawCall of Debug._drawCalls) {
      drawCall(ctx);
    }
    ctx.restore();
    Debug._drawCalls.length = 0;
  }
}