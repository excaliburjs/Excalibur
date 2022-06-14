import { Color } from '../../Color';
import { BoundingBox } from '../BoundingBox';
import { EdgeCollider } from './EdgeCollider';
import { CollisionJumpTable } from './CollisionJumpTable';
import { CircleCollider } from './CircleCollider';
import { CollisionContact } from '../Detection/CollisionContact';
import { Projection } from '../../Math/projection';
import { LineSegment } from '../../Math/line-segment';
import { Vector } from '../../Math/vector';
import { AffineMatrix } from '../../Math/affine-matrix';
import { Ray } from '../../Math/ray';
import { ClosestLineJumpTable } from './ClosestLineJumpTable';
import { Collider } from './Collider';
import { ExcaliburGraphicsContext, Logger, range } from '../..';
import { CompositeCollider } from './CompositeCollider';
import { Shape } from './Shape';
import { Transform } from '../../Math/transform';

export interface PolygonColliderOptions {
  /**
   * Pixel offset relative to a collider's body transform position.
   */
  offset?: Vector;
  /**
   * Points in the polygon in order around the perimeter in local coordinates. These are relative from the body transform position.
   */
  points: Vector[];
}

/**
 * Polygon collider for detecting collisions
 */
export class PolygonCollider extends Collider {
  private _logger = Logger.getInstance();
  /**
   * Pixel offset relative to a collider's body transform position.
   */
  public offset: Vector;

  private _points: Vector[];
  /**
   * Points in the polygon in order around the perimeter in local coordinates. These are relative from the body transform position.
   * Excalibur stores these in counter-clockwise order
   */
  public set points(points: Vector[]) {
    this._localBoundsDirty = true;
    this._localSidesDirty = true;
    this._sidesDirty = true;
    this._points = points;
  }

  /**
   * Points in the polygon in order around the perimeter in local coordinates. These are relative from the body transform position.
   * Excalibur stores these in counter-clockwise order
   */
  public get points(): Vector[] {
    return this._points;
  }

  private _transform: Transform;

  private _transformedPoints: Vector[] = [];
  private _sides: LineSegment[] = [];
  private _localSides: LineSegment[] = [];

  constructor(options: PolygonColliderOptions) {
    super();
    this.offset = options.offset ?? Vector.Zero;
    this._globalMatrix.translate(this.offset.x, this.offset.y);
    this.points = options.points ?? [];
    const counterClockwise = this._isCounterClockwiseWinding(this.points);
    if (!counterClockwise) {
      this.points.reverse();
    }
    if (!this.isConvex()) {
      this._logger.warn(
        'Excalibur only supports convex polygon colliders and will not behave properly.'+
        'Call PolygonCollider.triangulate() to build a new collider composed of smaller convex triangles');
    }

    // calculate initial transformation
    this._calculateTransformation();
  }

  private _isCounterClockwiseWinding(points: Vector[]): boolean {
    // https://stackoverflow.com/a/1165943
    let sum = 0;
    for (let i = 0; i < points.length; i++) {
      sum += (points[(i + 1) % points.length].x - points[i].x) * (points[(i + 1) % points.length].y + points[i].y);
    }
    return sum < 0;
  }

  /**
   * Returns if the polygon collider is convex, Excalibur does not handle non-convex collision shapes.
   * Call [[Polygon.triangulate]] to generate a [[CompositeCollider]] from this non-convex shape
   */
  public isConvex(): boolean {
    // From SO: https://stackoverflow.com/a/45372025
    if (this.points.length < 3) {
      return false;
    }
    let oldPoint = this.points[this.points.length - 2];
    let newPoint = this.points[this.points.length - 1];
    let direction = Math.atan2(newPoint.y - oldPoint.y, newPoint.x - oldPoint.x);
    let oldDirection = 0;
    let orientation = 0;
    let angleSum = 0;
    for (const [i, point] of this.points.entries()) {
      oldPoint = newPoint;
      oldDirection = direction;
      newPoint =  point;
      direction = Math.atan2(newPoint.y - oldPoint.y, newPoint.x - oldPoint.x);
      if (oldPoint.equals(newPoint)) {
        return false; // repeat point
      }
      let angle = direction - oldDirection;
      if (angle <= -Math.PI){
        angle += Math.PI * 2;
      } else if (angle > Math.PI) {
        angle -= Math.PI * 2;
      }
      if (i === 0) {
        if (angle === 0.0) {
          return false;
        }
        orientation = angle  > 0 ? 1 : -1;
      } else {
        if (orientation * angle <= 0) {
          return false;
        }
      }
      angleSum += angle;
    }
    return Math.abs(Math.round(angleSum / (Math.PI * 2))) === 1;
  }

  /**
   * Tessellates the polygon into a triangle fan as a [[CompositeCollider]] of triangle polygons
   */
  public tessellate(): CompositeCollider {
    const polygons: Vector[][] = [];
    for (let i = 1; i < this.points.length - 2; i++) {
      polygons.push([this.points[0], this.points[i + 1], this.points[i + 2]]);
    }
    polygons.push([this.points[0], this.points[1], this.points[2]]);

    return new CompositeCollider(polygons.map(points => Shape.Polygon(points)));
  }

  /**
   * Triangulate the polygon collider using the "Ear Clipping" algorithm.
   * Returns a new [[CompositeCollider]] made up of smaller triangles.
   */
  public triangulate(): CompositeCollider {
    // https://www.youtube.com/watch?v=hTJFcHutls8
    if (this.points.length < 3) {
      throw Error('Invalid polygon');
    }

    /**
     * Helper to get a vertex in the list
     */
    function getItem<T>(index: number, list: T[]) {
      if (index >= list.length) {
        return list[index % list.length];
      } else if (index < 0) {
        return list[index % list.length + list.length];
      } else {
        return list[index];
      }
    }

    /**
     * Quick test for point in triangle
     */
    function isPointInTriangle(point: Vector, a: Vector, b: Vector, c: Vector) {
      const ab = b.sub(a);
      const bc = c.sub(b);
      const ca = a.sub(c);

      const ap = point.sub(a);
      const bp = point.sub(b);
      const cp = point.sub(c);

      const cross1 = ab.cross(ap);
      const cross2 = bc.cross(bp);
      const cross3 = ca.cross(cp);

      if (cross1 > 0 || cross2 > 0 || cross3 > 0) {
        return false;
      }
      return true;
    }

    const triangles: Vector[][] = [];
    const vertices = [...this.points];
    const indices = range(0, this.points.length - 1);

    // 1. Loop through vertices clockwise
    //    if the vertex is convex (interior angle is < 180) (cross product positive)
    //    if the polygon formed by it's edges doesn't contain the points
    //         it's an ear add it to our list of triangles, and restart

    while (indices.length > 3) {
      for (let i = 0; i < indices.length; i++) {
        const a = indices[i];
        const b = getItem(i - 1, indices);
        const c = getItem(i + 1, indices);

        const va = vertices[a];
        const vb = vertices[b];
        const vc = vertices[c];

        // Check convexity
        const leftArm = vb.sub(va);
        const rightArm = vc.sub(va);
        const isConvex = rightArm.cross(leftArm) > 0; // positive cross means convex
        if (!isConvex) {
          continue;
        }

        let isEar = true;
        // Check that if any vertices are in the triangle a, b, c
        for (let j = 0; j < indices.length; j++) {
          const vertIndex = indices[j];
          // We can skip these
          if (vertIndex === a || vertIndex === b || vertIndex === c) {
            continue;
          }

          const point = vertices[vertIndex];
          if (isPointInTriangle(point, vb, va, vc)) {
            isEar = false;
            break;
          }
        }

        // Add ear to polygon list and remove from list
        if (isEar) {
          triangles.push([vb, va, vc]);
          indices.splice(i, 1);
          break;
        }
      }
    }

    triangles.push([vertices[indices[0]], vertices[indices[1]], vertices[indices[2]]]);

    return new CompositeCollider(triangles.map(points => Shape.Polygon(points)));
  }

  /**
   * Returns a clone of this ConvexPolygon, not associated with any collider
   */
  public clone(): PolygonCollider {
    return new PolygonCollider({
      offset: this.offset.clone(),
      points: this.points.map((p) => p.clone())
    });
  }

  /**
   * Returns the world position of the collider, which is the current body transform plus any defined offset
   */
  public get worldPos(): Vector {
    if (this._transform) {
      return this._transform.pos.add(this.offset);
    }
    return this.offset;
  }

  /**
   * Get the center of the collider in world coordinates
   */
  public get center(): Vector {
    return this.bounds.center;
  }

  private _globalMatrix: AffineMatrix = AffineMatrix.identity();

  private _transformedPointsDirty = true;
  /**
   * Calculates the underlying transformation from the body relative space to world space
   */
  private _calculateTransformation() {
    const points = this.points;
    const len = points.length;
    this._transformedPoints.length = 0; // clear out old transform
    for (let i = 0; i < len; i++) {
      this._transformedPoints[i] = this._globalMatrix.multiply(points[i].clone());
    }
  }

  /**
   * Gets the points that make up the polygon in world space, from actor relative space (if specified)
   */
  public getTransformedPoints(): Vector[] {
    if (this._transformedPointsDirty) {
      this._calculateTransformation();
      this._transformedPointsDirty = false;
    }
    return this._transformedPoints;
  }

  private _sidesDirty = true;
  /**
   * Gets the sides of the polygon in world space
   */
  public getSides(): LineSegment[] {
    if (this._sidesDirty) {
      const lines = [];
      const points = this.getTransformedPoints();
      const len = points.length;
      for (let i = 0; i < len; i++) {
        // This winding is important
        lines.push(new LineSegment(points[i], points[(i + 1) % len]));
      }
      this._sides = lines;
      this._sidesDirty = false;
    }
    return this._sides;
  }

  private _localSidesDirty = true;
  /**
   * Returns the local coordinate space sides
   */
  public getLocalSides(): LineSegment[] {
    if (this._localSidesDirty) {
      const lines = [];
      const points = this.points;
      const len = points.length;
      for (let i = 0; i < len; i++) {
        // This winding is important
        lines.push(new LineSegment(points[i], points[(i + 1) % len]));
      }
      this._localSides = lines;
      this._localSidesDirty = false;
    }

    return this._localSides;
  }

  /**
   * Given a direction vector find the world space side that is most in that direction
   * @param direction
   */
  public findSide(direction: Vector): LineSegment {
    const sides = this.getSides();
    let bestSide = sides[0];
    let maxDistance = -Number.MAX_VALUE;
    for (let side = 0; side < sides.length; side++) {
      const currentSide = sides[side];
      const sideNormal = currentSide.normal();
      const mostDirection = sideNormal.dot(direction);
      if (mostDirection > maxDistance) {
        bestSide = currentSide;
        maxDistance = mostDirection;
      }
    }
    return bestSide;
  }

  /**
   * Given a direction vector find the local space side that is most in that direction
   * @param direction
   */
  public findLocalSide(direction: Vector): LineSegment {
    const sides = this.getLocalSides();
    let bestSide = sides[0];
    let maxDistance = -Number.MAX_VALUE;
    for (let side = 0; side < sides.length; side++) {
      const currentSide = sides[side];
      const sideNormal = currentSide.normal();
      const mostDirection = sideNormal.dot(direction);
      if (mostDirection > maxDistance) {
        bestSide = currentSide;
        maxDistance = mostDirection;
      }
    }
    return bestSide;
  }

  /**
   * Get the axis associated with the convex polygon
   */
  public get axes(): Vector[] {
    const axes: Vector[] = [];
    const sides = this.getSides();
    for (let i = 0; i < sides.length; i++) {
      axes.push(sides[i].normal());
    }
    return axes;
  }

  /**
   * Updates the transform for the collision geometry
   *
   * Collision geometry (points/bounds) will not change until this is called.
   * @param transform
   */
  public update(transform: Transform): void {
    this._transform = transform;
    this._transformedPointsDirty = true;
    this._sidesDirty = true;
    // This change means an update must be performed in order for geometry to update
    const globalMat = transform.matrix ?? this._globalMatrix;
    globalMat.clone(this._globalMatrix);
    this._globalMatrix.translate(this.offset.x, this.offset.y);
  }

  /**
   * Tests if a point is contained in this collider in world space
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

  public getClosestLineBetween(collider: Collider): LineSegment {
    if (collider instanceof CircleCollider) {
      return ClosestLineJumpTable.PolygonCircleClosestLine(this, collider);
    } else if (collider instanceof PolygonCollider) {
      return ClosestLineJumpTable.PolygonPolygonClosestLine(this, collider);
    } else if (collider instanceof EdgeCollider) {
      return ClosestLineJumpTable.PolygonEdgeClosestLine(this, collider);
    } else {
      throw new Error(`Polygon could not collide with unknown CollisionShape ${typeof collider}`);
    }
  }

  /**
   * Returns a collision contact if the 2 colliders collide, otherwise collide will
   * return null.
   * @param collider
   */
  public collide(collider: Collider): CollisionContact[] {
    if (collider instanceof CircleCollider) {
      return CollisionJumpTable.CollideCirclePolygon(collider, this);
    } else if (collider instanceof PolygonCollider) {
      return CollisionJumpTable.CollidePolygonPolygon(this, collider);
    } else if (collider instanceof EdgeCollider) {
      return CollisionJumpTable.CollidePolygonEdge(this, collider);
    } else {
      throw new Error(`Polygon could not collide with unknown CollisionShape ${typeof collider}`);
    }
  }

  /**
   * Find the point on the collider furthest in the direction specified
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
   * Find the local point on the collider furthest in the direction specified
   * @param direction
   */
  public getFurthestLocalPoint(direction: Vector): Vector {
    const pts = this.points;
    let furthestPoint = pts[0];
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
  public getClosestFace(point: Vector): { distance: Vector; face: LineSegment } {
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
   * Get the axis aligned bounding box for the polygon collider in world coordinates
   */
  public get bounds(): BoundingBox {
    return this.localBounds.transform(this._globalMatrix);
  }

  private _localBoundsDirty = true;
  private _localBounds: BoundingBox;
  /**
   * Get the axis aligned bounding box for the polygon collider in local coordinates
   */
  public get localBounds(): BoundingBox {
    if (this._localBoundsDirty) {
      this._localBounds = BoundingBox.fromPoints(this.points);
      this._localBoundsDirty = false;
    }

    return this._localBounds;
  }

  private _cachedMass: number;
  private _cachedInertia: number;
  /**
   * Get the moment of inertia for an arbitrary polygon
   * https://en.wikipedia.org/wiki/List_of_moments_of_inertia
   */
  public getInertia(mass: number): number {
    if (this._cachedMass === mass && this._cachedInertia) {
      return this._cachedInertia;
    }
    let numerator = 0;
    let denominator = 0;
    const points = this.points;
    for (let i = 0; i < points.length; i++) {
      const iplusone = (i + 1) % points.length;
      const crossTerm = points[iplusone].cross(points[i]);
      numerator +=
        crossTerm *
        (points[i].dot(points[i]) + points[i].dot(points[iplusone]) + points[iplusone].dot(points[iplusone]));
      denominator += crossTerm;
    }
    this._cachedMass = mass;
    return this._cachedInertia = (mass / 6) * (numerator / denominator);
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

  public debug(ex: ExcaliburGraphicsContext, color: Color) {
    const firstPoint = this.getTransformedPoints()[0];
    const points = [firstPoint, ...this.getTransformedPoints(), firstPoint];
    for (let i = 0; i < points.length - 1; i++) {
      ex.drawLine(points[i], points[i + 1], color, 2);
      ex.drawCircle(points[i], 2, color);
      ex.drawCircle(points[i + 1], 2, color);
    }
  }
}
