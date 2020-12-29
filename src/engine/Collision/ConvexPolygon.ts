import { Color } from '../Drawing/Color';
import { BoundingBox } from './BoundingBox';
import { Edge } from './Edge';
import { CollisionJumpTable } from './CollisionJumpTable';
import { Circle } from './Circle';
import { CollisionContact } from './CollisionContact';
import { CollisionShape } from './CollisionShape';
import { Vector, Line, Ray, Projection } from '../Algebra';
import { ClosestLineJumpTable } from './ClosestLineJumpTable';
import { Transform } from '../EntityComponentSystem';
import { Collider } from './Collider';

export interface ConvexPolygonOptions {
  /**
   * Pixel offset relative to a collider's position
   */

  offset?: Vector;
  /**
   * Points in the polygon in order around the perimeter in local coordinates
   */
  points: Vector[];
  /**
   * Whether points are specified in clockwise or counter clockwise order, default counter-clockwise
   */
  clockwiseWinding?: boolean;
  /**
   * Collider to associate optionally with this shape
   */
  collider?: Collider;
}

/**
 * Polygon collision shape for detecting collisions
 */
export class ConvexPolygon implements CollisionShape {
  public offset: Vector;
  public points: Vector[];

  private _transform: Transform;

  /**
   * Collider associated with this shape
   */
  public collider?: Collider;

  private _transformedPoints: Vector[] = [];
  private _axes: Vector[] = [];
  private _sides: Line[] = [];

  constructor(options: ConvexPolygonOptions) {
    this.offset = options.offset || Vector.Zero;
    const winding = !!options.clockwiseWinding;
    this.points = (winding ? options.points.reverse() : options.points) || [];
    this.collider = this.collider = options.collider || null;

    // calculate initial transformation
    this._calculateTransformation();
  }

  /**
   * Returns a clone of this ConvexPolygon, not associated with any collider
   */
  public clone(): ConvexPolygon {
    return new ConvexPolygon({
      offset: this.offset.clone(),
      points: this.points.map((p) => p.clone())
    });
  }

  public get worldPos(): Vector {
    if (this._transform) {
      return this._transform.pos.add(this.offset);
    }
    return this.offset;
  }

  /**
   * Get the center of the collision shape in world coordinates
   */
  public get center(): Vector {
    return this.bounds.center;
  }

  /**
   * Calculates the underlying transformation from the body relative space to world space
   */
  private _calculateTransformation() {
    const transform = this._transform;
    
    const pos = transform ? transform.pos.add(this.offset) : this.offset;
    const angle = transform ? transform.rotation : 0;
    const scale = transform ? transform.scale : Vector.One;

    const len = this.points.length;
    this._transformedPoints.length = 0; // clear out old transform
    for (let i = 0; i < len; i++) {
      this._transformedPoints[i] = this.points[i].scale(scale).rotate(angle).add(pos);
    }
  }

  /**
   * Gets the points that make up the polygon in world space, from actor relative space (if specified)
   */
  public getTransformedPoints(): Vector[] {
    // only recalculate geometry if, hasn't been calculated
    if (
      !this._transformedPoints.length ||
      // or the position or rotation has changed in world space
      true //(this.collider?.body?.hasChanged())
    ) {
      this._calculateTransformation();
    }
    return this._transformedPoints;
  }

  /**
   * Gets the sides of the polygon in world space
   */
  public getSides(): Line[] {
    if (this._sides.length) {
      return this._sides;
    }
    const lines = [];
    const points = this.getTransformedPoints();
    const len = points.length;
    for (let i = 0; i < len; i++) {
      // This winding is important
      lines.push(new Line(points[i], points[(i + 1) % len]));
    }
    this._sides = lines;
    return this._sides;
  }

  /**
   * Get the axis associated with the convex polygon
   */
  public get axes(): Vector[] {
    if (this._axes.length) {
      return this._axes;
    }
    const axes = this.getSides().map(s => s.normal());
    this._axes = axes;
    return this._axes;
  }

  public update(transform: Transform): void {
    this._transform = transform;
    this._sides.length = 0;
    this._axes.length = 0;
    this._transformedPoints.length = 0;
    this.getTransformedPoints();
    this.getSides();
  }

  /**
   * Tests if a point is contained in this collision shape in world space
   */
  public contains(point: Vector): boolean {
    // Always cast to the right, as long as we cast in a consistent fixed direction we
    // will be fine
    const testRay = new Ray(point, new Vector(1, 0));
    const intersectCount = this.getSides().reduce(function (accum, side) {
      if (testRay.intersect(side) >= 0) {
        return accum + 1;
      }
      return accum;
    }, 0);

    if (intersectCount % 2 === 0) {
      return false;
    }
    return true;
  }

  public getClosestLineBetween(shape: CollisionShape): Line {
    if (shape instanceof Circle) {
      return ClosestLineJumpTable.PolygonCircleClosestLine(this, shape);
    } else if (shape instanceof ConvexPolygon) {
      return ClosestLineJumpTable.PolygonPolygonClosestLine(this, shape);
    } else if (shape instanceof Edge) {
      return ClosestLineJumpTable.PolygonEdgeClosestLine(this, shape);
    } else {
      throw new Error(`Polygon could not collide with unknown CollisionShape ${typeof shape}`);
    }
  }

  /**
   * Returns a collision contact if the 2 collision shapes collide, otherwise collide will
   * return null.
   * @param shape
   */
  public collide(shape: CollisionShape): CollisionContact {
    if (shape instanceof Circle) {
      return CollisionJumpTable.CollideCirclePolygon(shape, this);
    } else if (shape instanceof ConvexPolygon) {
      return CollisionJumpTable.CollidePolygonPolygon(this, shape);
    } else if (shape instanceof Edge) {
      return CollisionJumpTable.CollidePolygonEdge(this, shape);
    } else {
      throw new Error(`Polygon could not collide with unknown CollisionShape ${typeof shape}`);
    }
  }

  /**
   * Find the point on the shape furthest in the direction specified
   */
  public getFurthestPoint(direction: Vector): Vector {
    const pts = this.getTransformedPoints();
    let furthestPoint = null;
    let maxDistance = -Number.MAX_VALUE;
    for (let i = 0; i < pts.length; i++) {
      const distance = direction.dot(pts[i]);
      if (distance > maxDistance) {
        maxDistance = distance;
        furthestPoint = pts[i];
      }
    }
    return furthestPoint;
  }

  /**
   * Finds the closes face to the point using perpendicular distance
   * @param point point to test against polygon
   */
  public getClosestFace(point: Vector): { distance: Vector; face: Line } {
    const sides = this.getSides();
    let min = Number.POSITIVE_INFINITY;
    let faceIndex = -1;
    let distance = -1;
    for (let i = 0; i < sides.length; i++) {
      const dist = sides[i].distanceToPoint(point);
      if (dist < min) {
        min = dist;
        faceIndex = i;
        distance = dist;
      }
    }

    if (faceIndex !== -1) {
      return {
        distance: sides[faceIndex].normal().scale(distance),
        face: sides[faceIndex]
      };
    }

    return null;
  }

  /**
   * Get the axis aligned bounding box for the polygon shape in world coordinates
   */
  public get bounds(): BoundingBox {
    // const points = this.getTransformedPoints();
    const scale = this._transform?.scale ?? Vector.One;
    const rotation = this._transform?.rotation ?? 0;
    const pos = this._transform?.pos ?? Vector.Zero;
    return this.localBounds
      .scale(scale)
      .rotate(rotation)
      .translate(pos);
    // return BoundingBox.fromPoints(points);
  }

  /**
   * Get the axis aligned bounding box for the polygon shape in local coordinates
   */
  public get localBounds(): BoundingBox {
    return BoundingBox.fromPoints(this.points);
  }

  /**
   * Get the moment of inertia for an arbitrary polygon
   * https://en.wikipedia.org/wiki/List_of_moments_of_inertia
   */
  public getInertia(mass: number): number {
    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < this.points.length; i++) {
      const iplusone = (i + 1) % this.points.length;
      const crossTerm = this.points[iplusone].cross(this.points[i]);
      numerator +=
        crossTerm *
        (this.points[i].dot(this.points[i]) + this.points[i].dot(this.points[iplusone]) + this.points[iplusone].dot(this.points[iplusone]));
      denominator += crossTerm;
    }
    return (mass / 6) * (numerator / denominator);
  }

  /**
   * Casts a ray into the polygon and returns a vector representing the point of contact (in world space) or null if no collision.
   */
  public rayCast(ray: Ray, max: number = Infinity) {
    // find the minimum contact time greater than 0
    // contact times less than 0 are behind the ray and we don't want those
    const sides = this.getSides();
    const len = sides.length;
    let minContactTime = Number.MAX_VALUE;
    let contactIndex = -1;
    for (let i = 0; i < len; i++) {
      const contactTime = ray.intersect(sides[i]);
      if (contactTime >= 0 && contactTime < minContactTime && contactTime <= max) {
        minContactTime = contactTime;
        contactIndex = i;
      }
    }

    // contact was found
    if (contactIndex >= 0) {
      return ray.getPoint(minContactTime);
    }

    // no contact found
    return null;
  }

  public queryAxisSeparation(other: ConvexPolygon): { poly: ConvexPolygon, separation: number, side: Line, axis: Vector } {
    const polyA = this;
    const polyB = other;

    const sides = polyA.getSides();
    let bestSeparation = -Number.MAX_VALUE;
    let bestSide: Line = null;
    let bestAxis: Vector = null;
    for (let i = 0; i < sides.length; i++){
      const side = sides[i];
      const axis = side.normal();
      const vertB = polyB.getFurthestPoint(axis.negate());
      const vertSeparation = side.distanceToPoint(vertB, true); // Separation on side i's axis
      if (vertSeparation > bestSeparation) {
        bestSeparation = vertSeparation;
        bestSide = side;
        bestAxis = axis;
      }
    }

    return {
      poly: this,
      separation: bestSeparation,
      side: bestSide,
      axis: bestAxis
    }
  }

  public queryForOppositeSide(direction: Vector): Line {

    const normal = direction.normalize();
    const sides = this.getSides();
    let leastParallel = Number.MAX_VALUE;
    let mostOpposite: Line = null;
    for (let i = 0; i < sides.length; i++) {
      const parallel = normal.dot(sides[i].normal());
      if (parallel < leastParallel) {
        leastParallel = parallel;
        mostOpposite = sides[i];
      }
    }

    return mostOpposite;
  }

  /**
   * Perform Separating Axis test against another polygon, returns null if no overlap in polys
   * Reference http://www.dyn4j.org/2010/01/sat/
   * Reference https://ubm-twvideo01.s3.amazonaws.com/o1/vault/gdc2013/slides/822403Gregorius_Dirk_TheSeparatingAxisTest.pdf
   */
  public testSeparatingAxisTheorem(other: ConvexPolygon): { ref: ConvexPolygon, overlap: number, side: Line, normal: Vector } {
    const polyA = this;
    const polyB = other;

    // Positive signed separation means there is space between an edge and point in the poly
    const sep1 = polyA.queryAxisSeparation(polyB);
    if (sep1.separation > 0) {
      return null;
    }

    const sep2 = polyB.queryAxisSeparation(polyA);
    if (sep2.separation > 0) {
      return null
    }

    // We want the closest to zero, minimal movement
    let bestSeparation = sep1.separation > sep2.separation ? sep1 : sep2;

    let minAxis = bestSeparation.side.normal().normalize();
    const sameDir = minAxis.dot(polyB.center.sub(polyA.center));
    minAxis = sameDir < 0 ? minAxis.negate() : minAxis;

    // `this` is allways the reference
    if (bestSeparation === sep2) {
      bestSeparation = {
        poly: this,
        separation: sep2.separation,
        side: this.queryForOppositeSide(sep2.side.normal()),
        axis: minAxis
      }
    }
  
    return {
      ref: bestSeparation.poly,
      overlap: Math.abs(bestSeparation.separation),
      side: bestSeparation.side,
      normal: minAxis
    };
  }

  public testSeparatingAxisTheoremOld(other: ConvexPolygon): Vector {
    const poly1 = this;
    const poly2 = other;
    const axes = poly1.axes.concat(poly2.axes);

    let minOverlap = Number.MAX_VALUE;
    let minAxis = null;
    let minIndex = -1;
    for (let i = 0; i < axes.length; i++) {
      const proj1 = poly1.project(axes[i]);
      const proj2 = poly2.project(axes[i]);
      const overlap = proj1.getOverlap(proj2);
      if (overlap <= 0) {
        return null;
      } else {
        if (overlap < minOverlap) {
          minOverlap = overlap;
          minAxis = axes[i];
          minIndex = i;
        }
      }
    }

    // Sanity check
    if (minIndex === -1) {
      return null;
    }

    return minAxis.normalize().scale(minOverlap);
  }

  /**
   * Project the edges of the polygon along a specified axis
   */
  public project(axis: Vector): Projection {
    const points = this.getTransformedPoints();
    const len = points.length;
    let min = Number.MAX_VALUE;
    let max = -Number.MAX_VALUE;
    for (let i = 0; i < len; i++) {
      const scalar = points[i].dot(axis);
      min = Math.min(min, scalar);
      max = Math.max(max, scalar);
    }

    return new Projection(min, max);
  }

  public draw(ctx: CanvasRenderingContext2D, color: Color = Color.Green, pos: Vector = Vector.Zero) {
    const basePos = this.points[0].add(pos);
    ctx.beginPath();
    ctx.fillStyle = color.toString();
    ctx.moveTo(basePos.x, basePos.y);
    this.points
      .map((p) => p.add(pos))
      .forEach(function (point) {
        ctx.lineTo(point.x, point.y);
      });
    ctx.lineTo(basePos.x, basePos.y);
    ctx.closePath();
    ctx.fill();
  }

  /* istanbul ignore next */
  public debugDraw(ctx: CanvasRenderingContext2D, color: Color = Color.Red) {
    ctx.beginPath();
    ctx.strokeStyle = color.toString();
    // Iterate through the supplied points and construct a 'polygon'
    const firstPoint = this.getTransformedPoints()[0];
    ctx.moveTo(firstPoint.x, firstPoint.y);
    this.getTransformedPoints().forEach(function (point) {
      ctx.lineTo(point.x, point.y);
    });
    ctx.lineTo(firstPoint.x, firstPoint.y);
    ctx.closePath();
    ctx.stroke();
  }
}
