import { PolygonArea } from './PolygonArea';

import { Actor } from '../Actor';
import { Vector, Ray } from '../Algebra';
import { Color } from '../Drawing/Color';

/**
 * Interface all collidable objects must implement
 */
export interface ICollidable {
  /**
   * Test whether this bounding box collides with another one.
   *
   * @param collidable  Other collidable to test
   * @returns Vector The intersection vector that can be used to resolve the collision.
   * If there is no collision, `null` is returned.
   */
  collides(collidable: ICollidable): Vector;
  /**
   * Tests wether a point is contained within the collidable
   * @param point  The point to test
   */
  contains(point: Vector): boolean;

  debugDraw(ctx: CanvasRenderingContext2D): void;
}

/**
 * Axis Aligned collision primitive for Excalibur.
 */
export class BoundingBox implements ICollidable {
  /**
   * @param left    x coordinate of the left edge
   * @param top     y coordinate of the top edge
   * @param right   x coordinate of the right edge
   * @param bottom  y coordinate of the bottom edge
   */
  constructor(public left: number = 0, public top: number = 0, public right: number = 0, public bottom: number = 0) {}

  public static fromPoints(points: Vector[]): BoundingBox {
    var minX = Infinity;
    var minY = Infinity;
    var maxX = -Infinity;
    var maxY = -Infinity;
    for (var i = 0; i < points.length; i++) {
      if (points[i].x < minX) {
        minX = points[i].x;
      }
      if (points[i].x > maxX) {
        maxX = points[i].x;
      }
      if (points[i].y < minY) {
        minY = points[i].y;
      }
      if (points[i].y > maxY) {
        maxY = points[i].y;
      }
    }
    return new BoundingBox(minX, minY, maxX, maxY);
  }

  /**
   * Returns the calculated width of the bounding box
   */
  public getWidth() {
    return this.right - this.left;
  }

  /**
   * Returns the calculated height of the bounding box
   */
  public getHeight() {
    return this.bottom - this.top;
  }

  /**
   * Rotates a bounding box by and angle and around a point, if no point is specified (0, 0) is used by default. The resulting bounding
   * box is also axis-align. This is useful when a new axis-aligned bounding box is needed for rotated geometry.
   */
  public rotate(angle: number, point: Vector = Vector.Zero): BoundingBox {
    var points = this.getPoints().map((p) => p.rotate(angle, point));
    return BoundingBox.fromPoints(points);
  }

  /**
   * Returns the perimeter of the bounding box
   */
  public getPerimeter(): number {
    var wx = this.getWidth();
    var wy = this.getHeight();
    return 2 * (wx + wy);
  }

  public getPoints(): Vector[] {
    var results = [];
    results.push(new Vector(this.left, this.top));
    results.push(new Vector(this.right, this.top));
    results.push(new Vector(this.right, this.bottom));
    results.push(new Vector(this.left, this.bottom));
    return results;
  }

  /**
   * Creates a Polygon collision area from the points of the bounding box
   */
  public toPolygon(actor?: Actor): PolygonArea {
    return new PolygonArea({
      body: actor ? actor.body : null,
      points: this.getPoints(),
      pos: Vector.Zero
    });
  }

  /**
   * Determines whether a ray intersects with a bounding box
   */
  public rayCast(ray: Ray, farClipDistance = Infinity): boolean {
    // algorithm from https://tavianator.com/fast-branchless-raybounding-box-intersections/
    var tmin = -Infinity;
    var tmax = +Infinity;

    var xinv = ray.dir.x === 0 ? Number.MAX_VALUE : 1 / ray.dir.x;
    var yinv = ray.dir.y === 0 ? Number.MAX_VALUE : 1 / ray.dir.y;

    var tx1 = (this.left - ray.pos.x) * xinv;
    var tx2 = (this.right - ray.pos.x) * xinv;
    tmin = Math.min(tx1, tx2);
    tmax = Math.max(tx1, tx2);

    var ty1 = (this.top - ray.pos.y) * yinv;
    var ty2 = (this.bottom - ray.pos.y) * yinv;
    tmin = Math.max(tmin, Math.min(ty1, ty2));
    tmax = Math.min(tmax, Math.max(ty1, ty2));

    return tmax >= Math.max(0, tmin) && tmin < farClipDistance;
  }

  public rayCastTime(ray: Ray, farClipDistance = Infinity): number {
    // algorithm from https://tavianator.com/fast-branchless-raybounding-box-intersections/
    var tmin = -Infinity;
    var tmax = +Infinity;

    var xinv = ray.dir.x === 0 ? Number.MAX_VALUE : 1 / ray.dir.x;
    var yinv = ray.dir.y === 0 ? Number.MAX_VALUE : 1 / ray.dir.y;

    var tx1 = (this.left - ray.pos.x) * xinv;
    var tx2 = (this.right - ray.pos.x) * xinv;
    tmin = Math.min(tx1, tx2);
    tmax = Math.max(tx1, tx2);

    var ty1 = (this.top - ray.pos.y) * yinv;
    var ty2 = (this.bottom - ray.pos.y) * yinv;
    tmin = Math.max(tmin, Math.min(ty1, ty2));
    tmax = Math.min(tmax, Math.max(ty1, ty2));

    if (tmax >= Math.max(0, tmin) && tmin < farClipDistance) {
      return tmin;
    }
    return -1;
  }

  /**
   * Tests whether a point is contained within the bounding box
   * @param p  The point to test
   */
  public contains(p: Vector): boolean;

  /**
   * Tests whether another bounding box is totally contained in this one
   * @param bb  The bounding box to test
   */
  public contains(bb: BoundingBox): boolean;
  public contains(val: any): boolean {
    if (val instanceof Vector) {
      return this.left <= val.x && this.top <= val.y && this.bottom >= val.y && this.right >= val.x;
    } else if (val instanceof BoundingBox) {
      if (this.left < val.left && this.top < val.top && val.bottom < this.bottom && val.right < this.right) {
        return true;
      }
      return false;
    }
    return false;
  }

  /**
   * Combines this bounding box and another together returning a new bounding box
   * @param other  The bounding box to combine
   */
  public combine(other: BoundingBox): BoundingBox {
    var compositeBB = new BoundingBox(
      Math.min(this.left, other.left),
      Math.min(this.top, other.top),
      Math.max(this.right, other.right),
      Math.max(this.bottom, other.bottom)
    );
    return compositeBB;
  }

  public get dimensions(): Vector {
    return new Vector(this.getWidth(), this.getHeight());
  }

  /**
   * Test wether this bounding box collides with another returning,
   * the intersection vector that can be used to resolve the collision. If there
   * is no collision null is returned.
   *
   * @returns A Vector in the direction of the current BoundingBox
   * @param collidable  Other collidable to test
   */
  public collides(collidable: ICollidable): Vector {
    if (collidable instanceof BoundingBox) {
      var other: BoundingBox = <BoundingBox>collidable;
      var totalBoundingBox = this.combine(other);

      // If the total bounding box is less than or equal the sum of the 2 bounds then there is collision
      if (
        totalBoundingBox.getWidth() < other.getWidth() + this.getWidth() &&
        totalBoundingBox.getHeight() < other.getHeight() + this.getHeight() &&
        !totalBoundingBox.dimensions.equals(other.dimensions) &&
        !totalBoundingBox.dimensions.equals(this.dimensions)
      ) {
        // collision
        var overlapX = 0;
        // right edge is between the other's left and right edge
        /**
         *     +-this-+
         *     |      |
         *     |    +-other-+
         *     +----|-+     |
         *          |       |
         *          +-------+
         *         <---
         *          ^ overlap
         */
        if (this.right >= other.left && this.right <= other.right) {
          overlapX = other.left - this.right;
          // right edge is past the other's right edge
          /**
           *     +-other-+
           *     |       |
           *     |    +-this-+
           *     +----|--+   |
           *          |      |
           *          +------+
           *          --->
           *          ^ overlap
           */
        } else {
          overlapX = other.right - this.left;
        }

        var overlapY = 0;
        // top edge is between the other's top and bottom edge
        /**
         *     +-other-+
         *     |       |
         *     |    +-this-+   | <- overlap
         *     +----|--+   |   |
         *          |      |  \ /
         *          +------+   '
         */
        if (this.top <= other.bottom && this.top >= other.top) {
          overlapY = other.bottom - this.top;
          // top edge is above the other top edge
          /**
           *     +-this-+         .
           *     |      |        / \
           *     |    +-other-+   | <- overlap
           *     +----|-+     |   |
           *          |       |
           *          +-------+
           */
        } else {
          overlapY = other.top - this.bottom;
        }

        if (Math.abs(overlapX) < Math.abs(overlapY)) {
          return new Vector(overlapX, 0);
        } else {
          return new Vector(0, overlapY);
        }
        // Case of total containment of one bounding box by another
      } else if (totalBoundingBox.dimensions.equals(other.dimensions) || totalBoundingBox.dimensions.equals(this.dimensions)) {
        let overlapX = 0;
        // this is wider than the other
        if (this.getWidth() - other.getWidth() >= 0) {
          // This right edge is closest to the others right edge
          if (this.right - other.right <= other.left - this.left) {
            overlapX = other.left - this.right;
            // This left edge is closest to the others left edge
          } else {
            overlapX = other.right - this.left;
          }
          // other is wider than this
        } else {
          // This right edge is closest to the others right edge
          if (other.right - this.right <= this.left - other.left) {
            overlapX = this.left - other.right;
            // This left edge is closest to the others left edge
          } else {
            overlapX = this.right - other.left;
          }
        }

        let overlapY = 0;
        // this is taller than other
        if (this.getHeight() - other.getHeight() >= 0) {
          // The bottom edge is closest to the others bottom edge
          if (this.bottom - other.bottom <= other.top - this.top) {
            overlapY = other.top - this.bottom;
          } else {
            overlapY = other.bottom - this.top;
          }
          // other is taller than this
        } else {
          // The bottom edge is closest to the others bottom edge
          if (other.bottom - this.bottom <= this.top - other.top) {
            overlapY = this.top - other.bottom;
          } else {
            overlapY = this.bottom - other.top;
          }
        }

        if (Math.abs(overlapX) < Math.abs(overlapY)) {
          return new Vector(overlapX, 0);
        } else {
          return new Vector(0, overlapY);
        }
      } else {
        return null;
      }
    }

    return null;
  }

  /* istanbul ignore next */
  public debugDraw(ctx: CanvasRenderingContext2D, color: Color = Color.Yellow) {
    ctx.strokeStyle = color.toString();
    ctx.strokeRect(this.left, this.top, this.getWidth(), this.getHeight());
  }
}
