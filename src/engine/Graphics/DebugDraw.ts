import { Vector } from '../Math/vector';
import { ExcaliburGraphicsContext, LineGraphicsOptions, PointGraphicsOptions } from './Context/ExcaliburGraphicsContext';
import { Color } from '../Color';
import { Ray } from '../Math/ray';
import { BoundingBox } from '../excalibur';

export class DebugDraw {
  static _drawCalls: ((ctx: ExcaliburGraphicsContext) => void)[] = [];
  static _ctx: ExcaliburGraphicsContext;
  static registerGraphicsContext(ctx: ExcaliburGraphicsContext) {
    DebugDraw._ctx = ctx;
  }
  static draw(debugDrawCall: (ctx: ExcaliburGraphicsContext) => void) {
    this._drawCalls.push(debugDrawCall);
  }

  static drawPoint(point: Vector, options?: PointGraphicsOptions) {
    DebugDraw.draw(ctx => {
      ctx.debug.drawPoint(point, options);
    });
  }

  static drawLine(start: Vector, end: Vector, options?: LineGraphicsOptions) {
    DebugDraw.draw(ctx => {
      ctx.debug.drawLine(start, end, options);
    });
  }

  static drawBounds(boundingBox: BoundingBox, options?: { width?: number, color?: Color }): void {
    DebugDraw.draw(ctx => {
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
    DebugDraw.draw((ctx) => {
      const start = ray.pos;
      const end = ray.pos.add(ray.dir.scale(distance));

      ctx.drawLine(start, end, color, width);
    });
  }

  static flush(ctx: ExcaliburGraphicsContext) {
    // TODO do we need to adjust the transform? or do a protective save/restore?
    for (const drawCall of DebugDraw._drawCalls) {
      drawCall(ctx);
    }
    DebugDraw._drawCalls.length = 0;
  }
}