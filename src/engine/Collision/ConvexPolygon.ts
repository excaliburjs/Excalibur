import { Color } from '../Drawing/Color';
import { Physics } from '../Physics';
import { BoundingBox } from './BoundingBox';
import { Edge } from './Edge';
import { CollisionJumpTable } from './CollisionJumpTable';
import { Circle } from './Circle';
import { CollisionContact } from './CollisionContact';
import { CollisionGeometry } from './CollisionGeometry';
import { Body } from './Body';
import { Vector, Line, Ray, Projection } from '../Algebra';
import { Collider } from './Collider';

export interface ConvexPolygonOptions {
  pos?: Vector;
  points?: Vector[];
  clockwiseWinding?: boolean;
  collider?: Collider;
  // @obsolete Will be removed in v0.24.0 please use [[collider]] to set and retrieve body information
  body?: Body;
}

/**
 * Polygon collision area for detecting collisions for actors, or independently
 */
export class ConvexPolygon implements CollisionGeometry {
  public pos: Vector;
  public points: Vector[];

  // @obsolete Will be removed in v0.24.0 please use [[collider]] to set and retrieve body information
  public body: Body;

  public collider: Collider;

  private _transformedPoints: Vector[] = [];
  private _axes: Vector[] = [];
  private _sides: Line[] = [];

  constructor(options: ConvexPolygonOptions) {
    this.pos = options.pos || Vector.Zero;
    const winding = !!options.clockwiseWinding;
    this.points = (winding ? options.points.reverse() : options.points) || [];
    this.collider = this.collider = options.collider || null;

    // @obsolete Remove next release in v0.24.0, code exists for backwards compat
    if (options.body) {
      this.collider = options.body.collider;
      this.body = this.collider.body;
    }
    // ==================================

    // calculate initial transformation
    this._calculateTransformation();
  }

  /**
   * Get the center of the collision area in world coordinates
   */
  public getCenter(): Vector {
    let body = this.collider ? this.collider.body : null;
    if (body) {
      return body.pos.add(this.pos);
    }
    return this.pos;
  }

  /**
   * Calculates the underlying transformation from the body relative space to world space
   */
  private _calculateTransformation() {
    const body = this.collider ? this.collider.body : null;
    const pos = body ? body.pos.add(this.pos) : this.pos;
    const angle = body ? body.rotation : 0;

    const len = this.points.length;
    this._transformedPoints.length = 0; // clear out old transform
    for (let i = 0; i < len; i++) {
      this._transformedPoints[i] = this.points[i].rotate(angle).add(pos);
    }
  }

  /**
   * Gets the points that make up the polygon in world space, from actor relative space (if specified)
   */
  public getTransformedPoints(): Vector[] {
    if (!this._transformedPoints.length) {
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
      lines.push(new Line(points[i], points[(i - 1 + len) % len]));
    }
    this._sides = lines;
    return this._sides;
  }

  public recalc(): void {
    this._sides.length = 0;
    this._axes.length = 0;
    this._transformedPoints.length = 0;
    this.getTransformedPoints();
    this.getAxes();
    this.getSides();
  }

  /**
   * Tests if a point is contained in this collision area in world space
   */
  public contains(point: Vector): boolean {
    // Always cast to the right, as long as we cast in a consitent fixed direction we
    // will be fine
    const testRay = new Ray(point, new Vector(1, 0));
    const intersectCount = this.getSides().reduce(function(accum, side) {
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

  /**
   * Returns a collision contact if the 2 collision areas collide, otherwise collide will
   * return null.
   * @param area
   */
  public collide(area: CollisionGeometry): CollisionContact {
    if (area instanceof Circle) {
      return CollisionJumpTable.CollideCirclePolygon(area, this);
    } else if (area instanceof ConvexPolygon) {
      return CollisionJumpTable.CollidePolygonPolygon(this, area);
    } else if (area instanceof Edge) {
      return CollisionJumpTable.CollidePolygonEdge(this, area);
    } else {
      throw new Error(`Polygon could not collide with unknown CollisionGeometry ${typeof area}`);
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
   * Get the axis aligned bounding box for the polygon area
   */
  public getBounds(): BoundingBox {
    // todo there is a faster way to do this
    const points = this.getTransformedPoints();

    const minX = points.reduce(function(prev, curr) {
      return Math.min(prev, curr.x);
    }, 999999999);
    const maxX = points.reduce(function(prev, curr) {
      return Math.max(prev, curr.x);
    }, -99999999);

    const minY = points.reduce(function(prev, curr) {
      return Math.min(prev, curr.y);
    }, 9999999999);
    const maxY = points.reduce(function(prev, curr) {
      return Math.max(prev, curr.y);
    }, -9999999999);

    return new BoundingBox(minX, minY, maxX, maxY);
  }

  /**
   * Get the moment of inertia for an arbitrary polygon
   * https://en.wikipedia.org/wiki/List_of_moments_of_inertia
   */
  public getMomentOfInertia(): number {
    const mass = this.collider ? this.collider.mass : Physics.defaultMass;
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
   * Get the axis associated with the edge
   */
  public getAxes(): Vector[] {
    if (this._axes.length) {
      return this._axes;
    }

    const axes = [];
    const points = this.getTransformedPoints();
    const len = points.length;
    for (let i = 0; i < len; i++) {
      axes.push(points[i].sub(points[(i + 1) % len]).normal());
    }
    this._axes = axes;
    return this._axes;
  }

  /**
   * Perform Separating Axis test against another polygon, returns null if no overlap in polys
   * Reference http://www.dyn4j.org/2010/01/sat/
   */
  public testSeparatingAxisTheorem(other: ConvexPolygon): Vector {
    const poly1 = this;
    const poly2 = other;
    const axes = poly1.getAxes().concat(poly2.getAxes());

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

  /* istanbul ignore next */
  public debugDraw(ctx: CanvasRenderingContext2D, color: Color = Color.Red) {
    ctx.beginPath();
    ctx.strokeStyle = color.toString();
    // Iterate through the supplied points and construct a 'polygon'
    const firstPoint = this.getTransformedPoints()[0];
    ctx.moveTo(firstPoint.x, firstPoint.y);
    this.getTransformedPoints().forEach(function(point) {
      ctx.lineTo(point.x, point.y);
    });
    ctx.lineTo(firstPoint.x, firstPoint.y);
    ctx.closePath();
    ctx.stroke();
  }
}

/**
 * @obsolete Use [[ConvexPolygonOptions]], PolygonAreaOptions will be removed in v0.24.0
 */
export interface PolygonAreaOptions extends ConvexPolygonOptions {}
export class PolygonArea extends ConvexPolygon {}
