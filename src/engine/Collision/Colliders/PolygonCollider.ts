import { Color } from '../../Color';
import { BoundingBox } from '../BoundingBox';
import { EdgeCollider } from './EdgeCollider';
import { CollisionJumpTable } from './CollisionJumpTable';
import { CircleCollider } from './CircleCollider';
import { CollisionContact } from '../Detection/CollisionContact';
import { Projection } from '../../Math/projection';
import { Line } from '../../Math/line';
import { Vector } from '../../Math/vector';
import { Ray } from '../../Math/ray';
import { ClosestLineJumpTable } from './ClosestLineJumpTable';
import { Transform, TransformComponent } from '../../EntityComponentSystem';
import { Collider } from './Collider';
import { ExcaliburGraphicsContext, Logger, range } from '../..';
import { CompositeCollider } from './CompositeCollider';
import { Shape } from './Shape';

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

  /**
   * Points in the polygon in order around the perimeter in local coordinates. These are relative from the body transform position.
   * Excalibur stores these in clockwise order
   */
  public points: Vector[];

  private _transform: Transform;

  private _transformedPoints: Vector[] = [];
  private _axes: Vector[] = [];
  private _sides: Line[] = [];
  private _localSides: Line[] = [];

  constructor(options: PolygonColliderOptions) {
    super();
    this.offset = options.offset ?? Vector.Zero;
    this.points = options.points ?? [];
    const clockwise = this._isClockwiseWinding(this.points);
    if (!clockwise) {
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

  private _isClockwiseWinding(points: Vector[]): boolean {
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

  /**
   * Calculates the underlying transformation from the body relative space to world space
   */
  private _calculateTransformation() {
    const transform = this._transform as TransformComponent;

    const pos = transform ? transform.globalPos.add(this.offset) : this.offset;
    const angle = transform ? transform.globalRotation : 0;
    const scale = transform ? transform.globalScale : Vector.One;

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
    this._calculateTransformation();
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
   * Returns the local coordinate space sides
   */
  public getLocalSides(): Line[] {
    if (this._localSides.length) {
      return this._localSides;
    }
    const lines = [];
    const points = this.points;
    const len = points.length;
    for (let i = 0; i < len; i++) {
      // This winding is important
      lines.push(new Line(points[i], points[(i + 1) % len]));
    }
    this._localSides = lines;
    return this._localSides;
  }

  /**
   * Given a direction vector find the world space side that is most in that direction
   * @param direction
   */
  public findSide(direction: Vector): Line {
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
  public findLocalSide(direction: Vector): Line {
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
    if (this._axes.length) {
      return this._axes;
    }
    const axes = this.getSides().map((s) => s.normal());
    this._axes = axes;
    return this._axes;
  }

  public update(transform: Transform): void {
    this._transform = transform;
    this._sides.length = 0;
    this._localSides.length = 0;
    this._axes.length = 0;
    this._transformedPoints.length = 0;
    this.getTransformedPoints();
    this.getSides();
    this.getLocalSides();
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

  public getClosestLineBetween(collider: Collider): Line {
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
   * Get the axis aligned bounding box for the polygon collider in world coordinates
   */
  public get bounds(): BoundingBox {
    const tx = this._transform as TransformComponent;
    const scale = tx?.globalScale ?? Vector.One;
    const rotation = tx?.globalRotation ?? 0;
    const pos = (tx?.globalPos ?? Vector.Zero).add(this.offset);
    return this.localBounds.scale(scale).rotate(rotation).translate(pos);
  }

  /**
   * Get the axis aligned bounding box for the polygon collider in local coordinates
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
    const effectiveOffset = pos.add(this.offset);
    ctx.beginPath();
    ctx.fillStyle = color.toString();

    const firstPoint = this.points[0].add(effectiveOffset);
    ctx.moveTo(firstPoint.x, firstPoint.y);

    // Points are relative
    this.points
      .map((p) => p.add(effectiveOffset))
      .forEach(function (point) {
        ctx.lineTo(point.x, point.y);
      });
    ctx.lineTo(firstPoint.x, firstPoint.y);
    ctx.closePath();
    ctx.fill();
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
