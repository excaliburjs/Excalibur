import type { Color } from '../../Color';
import { BoundingBox } from '../BoundingBox';
import { EdgeCollider } from './EdgeCollider';
import { CollisionJumpTable } from './CollisionJumpTable';
import { CircleCollider } from './CircleCollider';
import type { CollisionContact } from '../Detection/CollisionContact';
import { Projection } from '../../Math/projection';
import { LineSegment } from '../../Math/line-segment';
import { Vector, vec } from '../../Math/vector';
import { Ray } from '../../Math/ray';
import { ClosestLineJumpTable } from './ClosestLineJumpTable';
import { Collider } from './Collider';
import type { ExcaliburGraphicsContext } from '../..';
import { BodyComponent, Debug, Logger, sign } from '../..';
import { CompositeCollider } from './CompositeCollider';
import { Shape } from './Shape';
import { Transform } from '../../Math/transform';
import type { RayCastHit } from '../Detection/RayCastHit';

export interface PolygonColliderOptions {
  /**
   * Pixel offset relative to a collider's body transform position.
   */
  offset?: Vector;
  /**
   * Points in the polygon in order around the perimeter in local coordinates. These are relative from the body transform position.
   * **Must be at least 3 points**
   */
  points: Vector[];

  /**
   * Suppresses convexity warning
   */
  suppressConvexWarning?: boolean;
}

/**
 * Polygon collider for detecting collisions
 */
export class PolygonCollider extends Collider {
  private _logger = Logger.getInstance();

  public flagDirty() {
    this._localBoundsDirty = true;
    this._localSidesDirty = true;
    this._transformedPointsDirty = true;
    this._sidesDirty = true;
  }

  private _points: Vector[];
  private _normals: Vector[];

  public get normals(): readonly Vector[] {
    return this._normals;
  }

  /**
   * Points in the polygon in order around the perimeter in local coordinates. These are relative from the body transform position.
   * Excalibur stores these in counter-clockwise order
   */
  public set points(points: Vector[]) {
    if (points.length < 3) {
      throw new Error('PolygonCollider cannot be created with less that 3 points');
    }
    this._points = points;
    this._checkAndUpdateWinding(this._points);
    this._calculateNormals();
    this.flagDirty();
  }

  private _calculateNormals() {
    const normals: Vector[] = [];
    for (let i = 0; i < this._points.length; i++) {
      normals.push(this._points[(i + 1) % this._points.length].sub(this._points[i]).normal());
    }
    this._normals = normals;
  }

  /**
   * Points in the polygon in order around the perimeter in local coordinates. These are relative from the body transform position.
   * Excalibur stores these in counter-clockwise order
   */
  public get points(): Vector[] {
    return this._points;
  }

  private _transform: Transform = new Transform();
  public get transform() {
    return this._transform;
  }

  private _transformedPoints: Vector[] = [];
  private _sides: LineSegment[] = [];
  private _localSides: LineSegment[] = [];

  constructor(options: PolygonColliderOptions) {
    super();
    this.offset = options.offset ?? Vector.Zero;
    this._transform.pos.x += this.offset.x;
    this._transform.pos.y += this.offset.y;
    this.points = options.points;

    if (!this.isConvex()) {
      if (!options.suppressConvexWarning) {
        this._logger.warn(
          'Excalibur only supports convex polygon colliders and will not behave properly.' +
            'Call PolygonCollider.triangulate() to build a new collider composed of smaller convex triangles'
        );
      }
    }

    // calculate initial transformation
    this._calculateTransformation();
  }

  private _checkAndUpdateWinding(points: Vector[]) {
    const counterClockwise = this._isCounterClockwiseWinding(points);
    if (!counterClockwise) {
      points.reverse();
    }
  }
  public _isCounterClockwiseWinding(points: Vector[]): boolean {
    // https://stackoverflow.com/a/1165943
    let sum = 0;
    for (let i = 0; i < points.length; i++) {
      sum += (points[(i + 1) % points.length].x - points[i].x) * (points[(i + 1) % points.length].y + points[i].y);
    }
    return sum < 0;
  }

  /**
   * Returns if the polygon collider is convex, Excalibur does not handle non-convex collision shapes.
   * Call {@apilink Polygon.triangulate} to generate a {@apilink CompositeCollider} from this non-convex shape
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
      newPoint = point;
      direction = Math.atan2(newPoint.y - oldPoint.y, newPoint.x - oldPoint.x);
      if (oldPoint.equals(newPoint)) {
        return false; // repeat point
      }
      let angle = direction - oldDirection;
      if (angle <= -Math.PI) {
        angle += Math.PI * 2;
      } else if (angle > Math.PI) {
        angle -= Math.PI * 2;
      }
      if (i === 0) {
        if (angle === 0.0) {
          return false;
        }
        orientation = angle > 0 ? 1 : -1;
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
   * Tessellates the polygon into a triangle fan as a {@apilink CompositeCollider} of triangle polygons
   */
  public tessellate(): CompositeCollider {
    const polygons: Vector[][] = [];
    for (let i = 1; i < this.points.length - 2; i++) {
      polygons.push([this.points[0], this.points[i + 1], this.points[i + 2]]);
    }
    polygons.push([this.points[0], this.points[1], this.points[2]]);

    return new CompositeCollider(polygons.map((points) => Shape.Polygon(points)));
  }

  /**
   * Triangulate the polygon collider using the "Ear Clipping" algorithm.
   * Returns a new {@apilink CompositeCollider} made up of smaller triangles.
   */
  public triangulate(): CompositeCollider {
    // https://www.youtube.com/watch?v=hTJFcHutls8
    if (this.points.length < 3) {
      throw Error('Invalid polygon');
    }

    const triangles: [Vector, Vector, Vector][] = [];
    // algorithm likes clockwise
    const vertices = [...this.points].reverse();
    let vertexCount = vertices.length;

    /**
     * Returns the previous index based on the current vertex
     */
    function getPrevIndex(index: number) {
      return index === 0 ? vertexCount - 1 : index - 1;
    }

    /**
     * Retrieves the next index based on the current vertex
     */
    function getNextIndex(index: number) {
      return index === vertexCount - 1 ? 0 : index + 1;
    }

    /**
     * Whether or not the angle at this vertex index is convex
     */
    function isConvex(index: number) {
      const prev = getPrevIndex(index);
      const next = getNextIndex(index);

      const va = vertices[prev];
      const vb = vertices[index];
      const vc = vertices[next];

      // Check convexity
      const leftArm = va.sub(vb);
      const rightArm = vc.sub(vb);
      // Positive cross product is convex
      if (leftArm.cross(rightArm) < 0) {
        return false;
      }
      return true;
    }

    const convexVertices = vertices.map((_, i) => isConvex(i));

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

    /**
     * Calculate the area of the triangle
     */
    // function triangleArea(a: Vector, b: Vector, c: Vector) {
    //   return Math.abs(a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - c.y))/2;
    // }

    /**
     * Find the next suitable ear tip
     */
    function findEarTip() {
      for (let i = 0; i < vertexCount; i++) {
        if (convexVertices[i]) {
          const prev = getPrevIndex(i);
          const next = getNextIndex(i);

          const va = vertices[prev];
          const vb = vertices[i];
          const vc = vertices[next];

          let isEar = true;
          // Check that if any vertices are in the triangle a, b, c
          for (let j = 0; j < vertexCount; j++) {
            // We can skip these verts because they are the triangle we are testing
            if (j === i || j === prev || j === next) {
              continue;
            }
            const point = vertices[j];
            if (isPointInTriangle(point, va, vb, vc)) {
              isEar = false;
              break;
            }
          }

          // Add ear to polygon list and remove from list
          if (isEar) {
            return i;
          }
        }
      }

      // Fall back to any convex vertex
      for (let i = 0; i < vertexCount; i++) {
        if (convexVertices[i]) {
          return i;
        }
      }

      // bail and return the first one?
      return 0;
    }

    /**
     * Cut the ear and produce a triangle, update internal state
     */
    function cutEarTip(index: number) {
      const prev = getPrevIndex(index);
      const next = getNextIndex(index);

      const va = vertices[prev];
      const vb = vertices[index];
      const vc = vertices[next];

      // Clockwise winding
      // if (triangleArea(va, vb, vc) > 0) {
      triangles.push([va, vb, vc]);
      // }
      vertices.splice(index, 1);
      convexVertices.splice(index, 1);
      vertexCount--;
    }

    // Loop over all the vertices finding ears
    while (vertexCount > 3) {
      const earIndex = findEarTip();
      cutEarTip(earIndex);

      // reclassify vertices
      for (let i = 0; i < vertexCount; i++) {
        convexVertices[i] = isConvex(i);
      }
    }

    // Last triangle after the loop
    triangles.push([vertices[0], vertices[1], vertices[2]]);

    // FIXME: there is a colinear triangle that sneaks in here sometimes
    return new CompositeCollider(triangles.map((points) => Shape.Polygon(points, Vector.Zero, true)));
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
    return this._transform.pos;
  }

  /**
   * Get the center of the collider in world coordinates
   */
  public get center(): Vector {
    return this.bounds.center;
  }

  private _transformedPointsDirty = true;
  /**
   * Calculates the underlying transformation from the body relative space to world space
   */
  private _calculateTransformation() {
    const points = this.points;
    const len = points.length;
    this._transformedPoints.length = 0; // clear out old transform
    for (let i = 0; i < len; i++) {
      this._transformedPoints[i] = this._transform.apply(points[i].clone());
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
    if (transform) {
      // This change means an update must be performed in order for geometry to update
      transform.cloneWithParent(this._transform);
      this._transformedPointsDirty = true;
      this._sidesDirty = true;
      if (this.offset.x !== 0 || this.offset.y !== 0) {
        this._transform.pos.x += this.offset.x;
        this._transform.pos.y += this.offset.y;
      }

      if (this._transform.isMirrored()) {
        // negative transforms really mess with things in collision local space
        // flatten out the negatives by applying to geometry
        this.points = this.points.map((p) => vec(p.x * sign(this._transform.scale.x), p.y * sign(this._transform.scale.y)));
        this._transform.scale.x = Math.abs(this._transform.scale.x);
        this._transform.scale.y = Math.abs(this._transform.scale.y);
      }
    }
  }

  /**
   * Tests if a point is contained in this collider in world space
   */
  public contains(point: Vector): boolean {
    // Always cast to the right, as long as we cast in a consistent fixed direction we
    // will be fine
    const localPoint = this._transform.applyInverse(point);
    const testRay = new Ray(localPoint, new Vector(1, 0));

    let intersectCount = 0;
    const sides = this.getLocalSides();
    for (let sideIndex = 0; sideIndex < sides.length; sideIndex++) {
      const side = sides[sideIndex];
      if (testRay.intersect(side) >= 0) {
        intersectCount++;
      }
    }

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
    return this.localBounds.transform(this._transform.matrix);
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
      numerator += crossTerm * (points[i].dot(points[i]) + points[i].dot(points[iplusone]) + points[iplusone].dot(points[iplusone]));
      denominator += crossTerm;
    }
    this._cachedMass = mass;
    return (this._cachedInertia = (mass / 6) * (numerator / denominator));
  }

  /**
   * Casts a ray into the polygon and returns a vector representing the point of contact (in world space) or null if no collision.
   */
  public rayCast(ray: Ray, max: number = Infinity): RayCastHit | null {
    // find the minimum contact time greater than 0
    // contact times less than 0 are behind the ray and we don't want those
    const sides = this.getSides();
    const len = sides.length;
    let minContactTime = Number.MAX_VALUE;
    let contactSide: LineSegment;
    let contactIndex = -1;
    for (let i = 0; i < len; i++) {
      const contactTime = ray.intersect(sides[i]);
      if (contactTime >= 0 && contactTime < minContactTime && contactTime <= max) {
        minContactTime = contactTime;
        contactSide = sides[i];
        contactIndex = i;
      }
    }

    // contact was found
    if (contactIndex >= 0) {
      return {
        collider: this,
        distance: minContactTime,
        body: this.owner?.get(BodyComponent),
        point: ray.getPoint(minContactTime),
        normal: contactSide.normal()
      } satisfies RayCastHit;
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

  public debug(ex: ExcaliburGraphicsContext, color: Color, options?: { lineWidth: number; pointSize: number }) {
    const points = this.getTransformedPoints();
    Debug.drawPolygon(points, { color });
  }
}
