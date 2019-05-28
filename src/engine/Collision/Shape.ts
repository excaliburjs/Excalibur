import { ConvexPolygon } from './ConvexPolygon';
import { Circle } from './Circle';
import { Edge } from './Edge';
import { BoundingBox } from './BoundingBox';
import { Vector } from '../Algebra';

export class Shape {
  /**
   * Creates a box collision shape
   * @param width Width of the box
   * @param height Height of the box
   * @param anchor Anchor of the box (default (.5, .5)) which positions the box relative to the center of the collider's position
   * @param center Optional offset relative to the collider in local coordinates
   */
  static Box(width: number, height: number, anchor: Vector = Vector.Half, center: Vector = Vector.Zero): ConvexPolygon {
    return new ConvexPolygon({
      points: new BoundingBox(-width * anchor.x, -height * anchor.y, width - width * anchor.x, height - height * anchor.y).getPoints(),
      pos: center
    });
  }

  /**
   * Creates a new arbitrary polygon collision shape
   * @param points Points specified in
   * @param center Optional offset relative to the collider in local coordinates
   */
  static Polygon(points: Vector[], center: Vector = Vector.Zero): ConvexPolygon {
    return new ConvexPolygon({
      points: points,
      pos: center
    });
  }

  /**
   * Creates a new circle collision shape
   * @param radius Radius of the circle shape
   * @param center Optional offset relative to the collider in local coordinates
   */
  static Circle(radius: number, center: Vector = Vector.Zero): Circle {
    return new Circle({
      radius: radius,
      pos: center
    });
  }

  /**
   * Creates a new edge collision shape
   * @param begin Beginning of the edge in local coordinates to the collider
   * @param end Ending of the edge in local coordinates to the collider
   */
  static Edge(begin: Vector, end: Vector): Edge {
    return new Edge({
      begin: begin,
      end: end
    });
  }
}
