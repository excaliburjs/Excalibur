import { PolygonCollider } from './PolygonCollider';
import { CircleCollider } from './CircleCollider';
import { EdgeCollider } from './EdgeCollider';
import { BoundingBox } from '../BoundingBox';
import { vec, Vector } from '../../Math/vector';
import { CompositeCollider } from './CompositeCollider';
import { Logger } from '../..';

/**
 * Excalibur helper for defining colliders quickly
 */
export class Shape {
  /**
   * Creates a box collider, under the hood defines a [[PolygonCollider]] collider
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
   * Creates a new [[PolygonCollider|arbitrary polygon]] collider
   *
   * PolygonColliders are useful for creating convex polygon shapes
   * @param points Points specified in counter clockwise
   * @param offset Optional offset relative to the collider in local coordinates
   */
  static Polygon(points: Vector[], offset: Vector = Vector.Zero): PolygonCollider {
    return new PolygonCollider({
      points: points,
      offset: offset
    });
  }

  /**
   * Creates a new [[CircleCollider|circle]] collider
   *
   * Circle colliders are useful for balls, or to make collisions more forgiving on sharp edges
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
   * Creates a new [[EdgeCollider|edge]] collider
   *
   * Edge colliders are useful for  floors, walls, and other barriers
   * @param begin Beginning of the edge in local coordinates to the collider
   * @param end Ending of the edge in local coordinates to the collider
   */
  static Edge(begin: Vector, end: Vector): EdgeCollider {
    return new EdgeCollider({
      begin: begin,
      end: end
    });
  }

  /**
   * Creates a new capsule shaped [[CompositeCollider]] using 2 circles and a box
   *
   * Capsule colliders are useful for platformers with incline or jagged floors to have a smooth
   * player experience.
   *
   * @param width
   * @param height
   * @param offset Optional offset
   */
  static Capsule(width: number, height: number, offset = Vector.Zero): CompositeCollider {
    const logger = Logger.getInstance();
    if (width === height) {
      logger.warn('A capsule collider with equal width and height is a circle, consider using a ex.Shape.Circle or ex.CircleCollider');
    }

    const vertical = height >= width;

    if (vertical) {
      // height > width, if equal maybe use a circle
      const capsule = new CompositeCollider([
        Shape.Circle(width / 2, vec(0, -height / 2 + width / 2).add(offset)),
        Shape.Box(width, height - width, Vector.Half, offset),
        Shape.Circle(width / 2, vec(0, height / 2 - width / 2).add(offset))
      ]);
      return capsule;
    } else {
      // width > height, if equal maybe use a circle
      const capsule = new CompositeCollider([
        Shape.Circle(height / 2, vec(-width / 2 + height / 2, 0).add(offset)),
        Shape.Box(width - height, height, Vector.Half, offset),
        Shape.Circle(height / 2, vec(width / 2 - height / 2, 0).add(offset))
      ]);
      return capsule;
    }
  }
}
