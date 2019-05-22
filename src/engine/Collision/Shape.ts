import { ConvexPolygon } from './ConvexPolygon';
import { Circle } from './Circle';
import { Edge } from './Edge';
import { BoundingBox } from './BoundingBox';
import { Vector } from '../Algebra';

export class Shape {
  static Box(width: number, height: number, anchor: Vector = Vector.Half, center: Vector = Vector.Zero): ConvexPolygon {
    return new ConvexPolygon({
      points: new BoundingBox(-width * anchor.x, -height * anchor.y, width - width * anchor.x, height - height * anchor.y).getPoints(),
      pos: center
    });
  }

  static Polygon(points: Vector[], center: Vector = Vector.Zero): ConvexPolygon {
    return new ConvexPolygon({
      points: points,
      pos: center
    });
  }

  static Circle(radius: number, center: Vector = Vector.Zero): Circle {
    return new Circle({
      radius: radius,
      pos: center
    });
  }

  static Edge(begin: Vector, end: Vector): Edge {
    return new Edge({
      begin: begin,
      end: end
    });
  }
}
