import type { Vector } from '../Math/vector';
import type {
  ExcaliburGraphicsContext,
  LineGraphicsOptions,
  PointGraphicsOptions,
  RectGraphicsOptions
} from './Context/ExcaliburGraphicsContext';
import { Color } from '../Color';
import type { Ray } from '../Math/ray';
import type { BoundingBox } from '../Collision/BoundingBox';
import type { DebugConfig } from '../Debug';

export class Debug {
  static _drawCalls: ((ctx: ExcaliburGraphicsContext) => void)[] = [];
  static _ctx: ExcaliburGraphicsContext;
  static z: number = Infinity;
  static config: DebugConfig = {
    // add some defaults
    settings: {
      text: {
        foreground: Color.Black,
        background: Color.Transparent,
        border: Color.Transparent
      },
      z: {
        text: Number.POSITIVE_INFINITY,
        point: Number.MAX_SAFE_INTEGER - 1,
        ray: Number.MAX_SAFE_INTEGER - 1,
        dashed: Number.MAX_SAFE_INTEGER - 2,
        solid: Number.MAX_SAFE_INTEGER - 3
      }
    }
  } as any;

  static registerDebugConfig(config: DebugConfig) {
    Debug.config = config;
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
      ctx.debug.drawCircle(center, radius, color, strokeColor, width);
    });
  }

  static drawBounds(boundingBox: BoundingBox, options?: RectGraphicsOptions): void {
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
      ctx.z = Debug.config.settings.z.ray;
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
