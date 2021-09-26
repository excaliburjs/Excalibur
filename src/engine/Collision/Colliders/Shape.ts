import { PolygonCollider } from './PolygonCollider';
import { CircleCollider } from './CircleCollider';
import { EdgeCollider } from './EdgeCollider';
import { BoundingBox } from '../BoundingBox';
import { Vector } from '../../Math/vector';

/**
 * Excalibur helper for defining colliders quickly
 */
export class Shape {
  /**
   * Creates a box collider, under the hood defines a [[ConvexPolygon]] collider
   * @param width Width of the box
   * @param height Height of the box
   * @param anchor Anchor of the box (default (.5, .5)) which positions the box relative to the center of the collider's position
   * @param offset Optional offset relative to the collider in local coordinates
   */
  static Box(width: number, height: number, anchor: Vector = Vector.Half, offset: Vector = Vector.Zero): PolygonCollider {
    return new PolygonCollider({
      points: new BoundingBox(-width * anchor.x, -height * anchor.y, width - width * anchor.x, height - height * anchor.y).getPoints(),
      offset: offset
    });
  }

  /**
   * Creates a new [[ConvexPolygon|arbitrary polygon]] collider
   * @param points Points specified in counter clockwise
   * @param clockwiseWinding Optionally changed the winding of points, by default false meaning counter-clockwise winding.
   * @param offset Optional offset relative to the collider in local coordinates
   */
  static Polygon(points: Vector[], clockwiseWinding: boolean = false, offset: Vector = Vector.Zero): PolygonCollider {
    return new PolygonCollider({
      points: points,
      offset: offset,
      clockwiseWinding: clockwiseWinding
    });
  }

  /**
   * Creates a new [[Circle|circle]] collider
   * @param radius Radius of the circle collider
   * @param offset Optional offset relative to the collider in local coordinates
   */
  static Circle(radius: number, offset: Vector = Vector.Zero): CircleCollider {
    return new CircleCollider({
      radius: radius,
      offset: offset
    });
  }

  /**
   * Creates a new [[Edge|edge]] collider
   * @param begin Beginning of the edge in local coordinates to the collider
   * @param end Ending of the edge in local coordinates to the collider
   */
  static Edge(begin: Vector, end: Vector): EdgeCollider {
    return new EdgeCollider({
      begin: begin,
      end: end
    });
  }
}
