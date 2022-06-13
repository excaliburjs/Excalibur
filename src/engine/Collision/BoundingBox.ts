import { Vector } from '../Math/vector';
import { Ray } from '../Math/ray';
import { Color } from '../Color';
import { Side } from './Side';
import { ExcaliburGraphicsContext } from '../Graphics/Context/ExcaliburGraphicsContext';
import { AffineMatrix } from '../Math/affine-matrix';

export interface BoundingBoxOptions {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/**
 * Axis Aligned collision primitive for Excalibur.
 */
export class BoundingBox {
  public top: number;
  public right: number;
  public bottom: number;
  public left: number;

  /**
   * Constructor allows passing of either an object with all coordinate components,
   * or the coordinate components passed separately.
   * @param leftOrOptions    Either x coordinate of the left edge or an options object
   * containing the four coordinate components.
   * @param top     y coordinate of the top edge
   * @param right   x coordinate of the right edge
   * @param bottom  y coordinate of the bottom edge
   */
  constructor(leftOrOptions: number | BoundingBoxOptions = 0, top: number = 0, right: number = 0, bottom: number = 0) {
    if (typeof leftOrOptions === 'object') {
      this.left = leftOrOptions.left;
      this.top = leftOrOptions.top;
      this.right = leftOrOptions.right;
      this.bottom = leftOrOptions.bottom;
    } else if (typeof leftOrOptions === 'number') {
      this.left = leftOrOptions;
      this.top = top;
      this.right = right;
      this.bottom = bottom;
    }
  }

  /**
   * Returns a new instance of [[BoundingBox]] that is a copy of the current instance
   */
  public clone(): BoundingBox {
    return new BoundingBox(this.left, this.top, this.right, this.bottom);
  }

  /**
   * Given bounding box A & B, returns the side relative to A when intersection is performed.
   * @param intersection Intersection vector between 2 bounding boxes
   */
  public static getSideFromIntersection(intersection: Vector): Side {
    if (!intersection) {
      return Side.None;
    }
    if (intersection) {
      if (Math.abs(intersection.x) > Math.abs(intersection.y)) {
        if (intersection.x < 0) {
          return Side.Right;
        }
        return Side.Left;
      } else {
        if (intersection.y < 0) {
          return Side.Bottom;
        }
        return Side.Top;
      }
    }
    return Side.None;
  }

  public static fromPoints(points: Vector[]): BoundingBox {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < points.length; i++) {
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

  public static fromDimension(width: number, height: number, anchor: Vector = Vector.Half, pos: Vector = Vector.Zero) {
    return new BoundingBox(
      -width * anchor.x + pos.x,
      -height * anchor.y + pos.y,
      width - width * anchor.x + pos.x,
      height - height * anchor.y + pos.y
    );
  }

  /**
   * Returns the calculated width of the bounding box
   */
  public get width() {
    return this.right - this.left;
  }

  /**
   * Returns the calculated height of the bounding box
   */
  public get height() {
    return this.bottom - this.top;
  }

  /**
   * Return whether the bounding box has zero dimensions in height,width or both
   */
  public hasZeroDimensions() {
    return this.width === 0 || this.height === 0;
  }

  /**
   * Returns the center of the bounding box
   */
  public get center(): Vector {
    return new Vector((this.left + this.right) / 2, (this.top + this.bottom) / 2);
  }

  public translate(pos: Vector): BoundingBox {
    return new BoundingBox(this.left + pos.x, this.top + pos.y, this.right + pos.x, this.bottom + pos.y);
  }

  /**
   * Rotates a bounding box by and angle and around a point, if no point is specified (0, 0) is used by default. The resulting bounding
   * box is also axis-align. This is useful when a new axis-aligned bounding box is needed for rotated geometry.
   */
  public rotate(angle: number, point: Vector = Vector.Zero): BoundingBox {
    const points = this.getPoints().map((p) => p.rotate(angle, point));
    return BoundingBox.fromPoints(points);
  }

  /**
   * Scale a bounding box by a scale factor, optionally provide a point
   * @param scale
   * @param point
   */
  public scale(scale: Vector, point: Vector = Vector.Zero): BoundingBox {
    const shifted = this.translate(point);
    return new BoundingBox(shifted.left * scale.x, shifted.top * scale.y, shifted.right * scale.x, shifted.bottom * scale.y);
  }

  /**
   * Transform the axis aligned bounding box by a [[Matrix]], producing a new axis aligned bounding box
   * @param matrix
   */
  public transform(matrix: AffineMatrix) {
    // inlined these calculations to not use vectors would speed it up slightly
    // const matFirstColumn = vec(matrix.data[0], matrix.data[1]);
    // const xa = matFirstColumn.scale(this.left);
    const xa1 = matrix.data[0] * this.left;
    const xa2 = matrix.data[1] * this.left;

    // const xb = matFirstColumn.scale(this.right);
    const xb1 = matrix.data[0] * this.right;
    const xb2 = matrix.data[1] * this.right;

    // const matSecondColumn = vec(matrix.data[2], matrix.data[3]);
    // const ya = matSecondColumn.scale(this.top);
    const ya1 = matrix.data[2] * this.top;
    const ya2 = matrix.data[3] * this.top;

    // const yb = matSecondColumn.scale(this.bottom);
    const yb1 = matrix.data[2] * this.bottom;
    const yb2 = matrix.data[3] * this.bottom;

    const matrixPos = matrix.getPosition();
    // const topLeft = Vector.min(xa, xb).add(Vector.min(ya, yb)).add(matrixPos);
    // const bottomRight = Vector.max(xa, xb).add(Vector.max(ya, yb)).add(matrixPos);
    const left = Math.min(xa1, xb1) + Math.min(ya1, yb1) + matrixPos.x;
    const top = Math.min(xa2, xb2) + Math.min(ya2, yb2) + matrixPos.y;
    const right = Math.max(xa1, xb1) + Math.max(ya1, yb1) + matrixPos.x;
    const bottom = Math.max(xa2, xb2) + Math.max(ya2, yb2) + matrixPos.y;

    return new BoundingBox({
      left,//: topLeft.x,
      top,//: topLeft.y,
      right,//: bottomRight.x,
      bottom//: bottomRight.y
    });
  }

  /**
   * Returns the perimeter of the bounding box
   */
  public getPerimeter(): number {
    const wx = this.width;
    const wy = this.height;
    return 2 * (wx + wy);
  }

  public getPoints(): Vector[] {
    const results = [];
    results.push(new Vector(this.left, this.top));
    results.push(new Vector(this.right, this.top));
    results.push(new Vector(this.right, this.bottom));
    results.push(new Vector(this.left, this.bottom));
    return results;
  }

  /**
   * Determines whether a ray intersects with a bounding box
   */
  public rayCast(ray: Ray, farClipDistance = Infinity): boolean {
    // algorithm from https://tavianator.com/fast-branchless-raybounding-box-intersections/
    let tmin = -Infinity;
    let tmax = +Infinity;

    const xinv = ray.dir.x === 0 ? Number.MAX_VALUE : 1 / ray.dir.x;
    const yinv = ray.dir.y === 0 ? Number.MAX_VALUE : 1 / ray.dir.y;

    const tx1 = (this.left - ray.pos.x) * xinv;
    const tx2 = (this.right - ray.pos.x) * xinv;
    tmin = Math.min(tx1, tx2);
    tmax = Math.max(tx1, tx2);

    const ty1 = (this.top - ray.pos.y) * yinv;
    const ty2 = (this.bottom - ray.pos.y) * yinv;
    tmin = Math.max(tmin, Math.min(ty1, ty2));
    tmax = Math.min(tmax, Math.max(ty1, ty2));

    return tmax >= Math.max(0, tmin) && tmin < farClipDistance;
  }

  public rayCastTime(ray: Ray, farClipDistance = Infinity): number {
    // algorithm from https://tavianator.com/fast-branchless-raybounding-box-intersections/
    let tmin = -Infinity;
    let tmax = +Infinity;

    const xinv = ray.dir.x === 0 ? Number.MAX_VALUE : 1 / ray.dir.x;
    const yinv = ray.dir.y === 0 ? Number.MAX_VALUE : 1 / ray.dir.y;

    const tx1 = (this.left - ray.pos.x) * xinv;
    const tx2 = (this.right - ray.pos.x) * xinv;
    tmin = Math.min(tx1, tx2);
    tmax = Math.max(tx1, tx2);

    const ty1 = (this.top - ray.pos.y) * yinv;
    const ty2 = (this.bottom - ray.pos.y) * yinv;
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
      if (this.left <= val.left && this.top <= val.top && val.bottom <= this.bottom && val.right <= this.right) {
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
    const compositeBB = new BoundingBox(
      Math.min(this.left, other.left),
      Math.min(this.top, other.top),
      Math.max(this.right, other.right),
      Math.max(this.bottom, other.bottom)
    );
    return compositeBB;
  }

  public get dimensions(): Vector {
    return new Vector(this.width, this.height);
  }

  /**
   * Returns true if the bounding boxes overlap.
   * @param other
   * @param epsilon Optionally specify a small epsilon (default 0) as amount of overlap to ignore as overlap.
   * This epsilon is useful in stable collision simulations.
   */
  public overlaps(other: BoundingBox, epsilon?: number): boolean {
    const e = epsilon || 0;
    if (other.hasZeroDimensions()){
      return this.contains(other);
    }
    if (this.hasZeroDimensions()) {
      return other.contains(this);
    }
    const totalBoundingBox = this.combine(other);
    return totalBoundingBox.width + e < other.width + this.width &&
           totalBoundingBox.height + e < other.height + this.height;
  }

  /**
   * Test wether this bounding box intersects with another returning
   * the intersection vector that can be used to resolve the collision. If there
   * is no intersection null is returned.
   *
   * @param other  Other [[BoundingBox]] to test intersection with
   * @returns A Vector in the direction of the current BoundingBox, this <- other
   */
  public intersect(other: BoundingBox): Vector {
    const totalBoundingBox = this.combine(other);

    // If the total bounding box is less than or equal the sum of the 2 bounds then there is collision
    if (
      totalBoundingBox.width < other.width + this.width &&
      totalBoundingBox.height < other.height + this.height &&
      !totalBoundingBox.dimensions.equals(other.dimensions) &&
      !totalBoundingBox.dimensions.equals(this.dimensions)
    ) {
      // collision
      let overlapX = 0;
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

      let overlapY = 0;
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
      if (this.width - other.width >= 0) {
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
      if (this.height - other.height >= 0) {
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

  /**
   * Test whether the bounding box has intersected with another bounding box, returns the side of the current bb that intersected.
   * @param bb The other actor to test
   */
  public intersectWithSide(bb: BoundingBox): Side {
    const intersect = this.intersect(bb);
    return BoundingBox.getSideFromIntersection(intersect);
  }

  /**
   * Draw a debug bounding box
   * @param ex
   * @param color
   */
  public draw(ex: ExcaliburGraphicsContext, color: Color = Color.Yellow) {
    ex.debug.drawRect(this.left, this.top, this.width, this.height, { color });
  }
}
