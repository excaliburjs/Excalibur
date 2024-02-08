import { Vector } from "../Math/vector";
import { ExcaliburGraphicsContext } from "./Context/ExcaliburGraphicsContext";
import { Color } from '../Color';
import { Ray } from "../Math/ray";
import { BoundingBox } from "../excalibur";

export class DebugDraw {
  static _drawCalls: ((ctx: ExcaliburGraphicsContext) => void)[] = [];
  static _ctx: ExcaliburGraphicsContext;
  static registerGraphicsContext(ctx: ExcaliburGraphicsContext) {
    DebugDraw._ctx = ctx;
  }
  static draw(debugDrawCall: (ctx: ExcaliburGraphicsContext) => void) {
    this._drawCalls.push(debugDrawCall);
  }

  static drawPoint(vector: Vector, options?: {radius?: number, color?: Color}) {

  }

  static drawVector(origin: Vector, vector: Vector, options?: { width?: number, color?: Color }) {

  }

  static drawBounds(boundingBox: BoundingBox, options?: { width?: number, color?: Color }): void {

  }

  static drawRay(ray: Ray, options?: { distance?: number, color?: Color, width?: number }) {
    const { distance, color, width } = {
      color: Color.Blue,
      width: 1,
      distance: 10,
      ...options
    }
    DebugDraw.draw((ctx) => {
      const start = ray.pos
      const end = ray.pos.add(ray.dir.scale(distance))

      ctx.drawLine(start, end, color, width);
    })
  }

  static flush(ctx: ExcaliburGraphicsContext) {
    // TODO do we need to adjust the transform? or do a protective save/restore?
    for (const drawCall of DebugDraw._drawCalls) {
      drawCall(ctx);
    }
    DebugDraw._drawCalls.length = 0;
  }
}