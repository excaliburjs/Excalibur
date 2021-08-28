import { Color } from '../../Color';
import { BoundingBox } from '../BoundingBox';
import { Edge } from './Edge';
import { CollisionJumpTable } from './CollisionJumpTable';
import { CircleCollider } from './CircleCollider';
import { CollisionContact } from '../Detection/CollisionContact';
import { Vector, Line, Ray, Projection } from '../../Algebra';
import { ClosestLineJumpTable } from './ClosestLineJumpTable';
import { Transform, TransformComponent } from '../../EntityComponentSystem';
import { Collider } from './Collider';

export interface ConvexPolygonOptions {
  /**
   * Pixel offset relative to a collider's body transform position.
   */
  offset?: Vector;
  /**
   * Points in the polygon in order around the perimeter in local coordinates. These are relative from the body transform position.
   */
  points: Vector[];
  /**
   * Whether points are specified in clockwise or counter clockwise order, default counter-clockwise
   */
  clockwiseWinding?: boolean;
}

/**
 * Polygon collider for detecting collisions
 */
export class ConvexPolygon extends Collider {
  /**
   * Pixel offset relative to a collider's body transform position.
   */
  public offset: Vector;

  /**
   * Points in the polygon in order around the perimeter in local coordinates. These are relative from the body transform position.
   */
  public points: Vector[];

  private _transform: Transform;

  private _transformedPoints: Vector[] = [];
  private _axes: Vector[] = [];
  private _sides: Line[] = [];
  private _localSides: Line[] = [];

  constructor(options: ConvexPolygonOptions) {
    super();
    this.offset = options.offset ?? Vector.Zero;
    const winding = !!options.clockwiseWinding;
    this.points = (winding ? options.points.reverse() : options.points) || [];

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
    } else if (collider instanceof ConvexPolygon) {
      return ClosestLineJumpTable.PolygonPolygonClosestLine(this, collider);
    } else if (collider instanceof Edge) {
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
    } else if (collider instanceof ConvexPolygon) {
      return CollisionJumpTable.CollidePolygonPolygon(this, collider);
    } else if (collider instanceof Edge) {
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
    // const points = this.getTransformedPoints();
    const scale = this._transform?.scale ?? Vector.One;
    const rotation = this._transform?.rotation ?? 0;
    const pos = (this._transform?.pos ?? Vector.Zero).add(this.offset);
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
