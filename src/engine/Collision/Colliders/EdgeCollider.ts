import { BoundingBox } from '../BoundingBox';
import { CollisionContact } from '../Detection/CollisionContact';
import { CollisionJumpTable } from './CollisionJumpTable';
import { CircleCollider } from './CircleCollider';
import { PolygonCollider } from './PolygonCollider';

import { Projection } from '../../Math/projection';
import { LineSegment } from '../../Math/line-segment';
import { Vector } from '../../Math/vector';
import { Ray } from '../../Math/ray';
import { Color } from '../../Color';
import { Collider } from './Collider';
import { ClosestLineJumpTable } from './ClosestLineJumpTable';
import { ExcaliburGraphicsContext } from '../../Graphics/Context/ExcaliburGraphicsContext';
import { Transform } from '../../Math/transform';
import { AffineMatrix } from '../../Math/affine-matrix';

export interface EdgeColliderOptions {
  /**
   * The beginning of the edge defined in local coordinates to the collider
   */
  begin: Vector;
  /**
   * The ending of the edge defined in local coordinates to the collider
   */
  end: Vector;
  /**
   * Optionally specify an offset
   */
  offset?: Vector;
}

/**
 * Edge is a single line collider to create collisions with a single line.
 */
export class EdgeCollider extends Collider {
  offset: Vector;
  begin: Vector;
  end: Vector;

  private _transform: Transform;
  private _globalMatrix: AffineMatrix = AffineMatrix.identity();

  constructor(options: EdgeColliderOptions) {
    super();
    this.begin = options.begin || Vector.Zero;
    this.end = options.end || Vector.Zero;
    this.offset = options.offset ?? Vector.Zero;
  }

  /**
   * Returns a clone of this Edge, not associated with any collider
   */
  public clone(): EdgeCollider {
    return new EdgeCollider({
      begin: this.begin.clone(),
      end: this.end.clone()
    });
  }

  public get worldPos(): Vector {
    const tx = this._transform;
    return tx?.globalPos.add(this.offset) ?? this.offset;
  }

  /**
   * Get the center of the collision area in world coordinates
   */
  public get center(): Vector {
    const begin = this._getTransformedBegin();
    const end = this._getTransformedEnd();
    const pos = begin.average(end);
    return pos;
  }

  private _getTransformedBegin(): Vector {
    return this._globalMatrix.multiply(this.begin);
  }

  private _getTransformedEnd(): Vector {
    return this._globalMatrix.multiply(this.end);
  }

  /**
   * Returns the slope of the line in the form of a vector
   */
  public getSlope(): Vector {
    const begin = this._getTransformedBegin();
    const end = this._getTransformedEnd();
    const distance = begin.distance(end);
    return end.sub(begin).scale(1 / distance);
  }

  /**
   * Returns the length of the line segment in pixels
   */
  public getLength(): number {
    const begin = this._getTransformedBegin();
    const end = this._getTransformedEnd();
    const distance = begin.distance(end);
    return distance;
  }

  /**
   * Tests if a point is contained in this collision area
   */
  public contains(): boolean {
    return false;
  }

  /**
   * @inheritdoc
   */
  public rayCast(ray: Ray, max: number = Infinity): Vector {
    const numerator = this._getTransformedBegin().sub(ray.pos);

    // Test is line and ray are parallel and non intersecting
    if (ray.dir.cross(this.getSlope()) === 0 && numerator.cross(ray.dir) !== 0) {
      return null;
    }

    // Lines are parallel
    const divisor = ray.dir.cross(this.getSlope());
    if (divisor === 0) {
      return null;
    }

    const t = numerator.cross(this.getSlope()) / divisor;

    if (t >= 0 && t <= max) {
      const u = numerator.cross(ray.dir) / divisor / this.getLength();
      if (u >= 0 && u <= 1) {
        return ray.getPoint(t);
      }
    }

    return null;
  }

  /**
   * Returns the closes line between this and another collider, from this -> collider
   * @param shape
   */
  public getClosestLineBetween(shape: Collider): LineSegment {
    if (shape instanceof CircleCollider) {
      return ClosestLineJumpTable.CircleEdgeClosestLine(shape, this);
    } else if (shape instanceof PolygonCollider) {
      return ClosestLineJumpTable.PolygonEdgeClosestLine(shape, this).flip();
    } else if (shape instanceof EdgeCollider) {
      return ClosestLineJumpTable.EdgeEdgeClosestLine(this, shape);
    } else {
      throw new Error(`Polygon could not collide with unknown CollisionShape ${typeof shape}`);
    }
  }

  /**
   * @inheritdoc
   */
  public collide(shape: Collider): CollisionContact[] {
    if (shape instanceof CircleCollider) {
      return CollisionJumpTable.CollideCircleEdge(shape, this);
    } else if (shape instanceof PolygonCollider) {
      return CollisionJumpTable.CollidePolygonEdge(shape, this);
    } else if (shape instanceof EdgeCollider) {
      return CollisionJumpTable.CollideEdgeEdge();
    } else {
      throw new Error(`Edge could not collide with unknown CollisionShape ${typeof shape}`);
    }
  }

  /**
   * Find the point on the collider furthest in the direction specified
   */
  public getFurthestPoint(direction: Vector): Vector {
    const transformedBegin = this._getTransformedBegin();
    const transformedEnd = this._getTransformedEnd();
    if (direction.dot(transformedBegin) > 0) {
      return transformedBegin;
    } else {
      return transformedEnd;
    }
  }

  private _boundsFromBeginEnd(begin: Vector, end: Vector, padding = 10) {
    // A perfectly vertical or horizontal edge would have a bounds 0 width or height
    // this causes problems for the collision system so we give them some padding
    return new BoundingBox(
      Math.min(begin.x, end.x) - padding,
      Math.min(begin.y, end.y) - padding,
      Math.max(begin.x, end.x) + padding,
      Math.max(begin.y, end.y) + padding
    );
  }

  /**
   * Get the axis aligned bounding box for the edge collider in world space
   */
  public get bounds(): BoundingBox {
    const transformedBegin = this._getTransformedBegin();
    const transformedEnd = this._getTransformedEnd();
    return this._boundsFromBeginEnd(transformedBegin, transformedEnd);
  }

  /**
   * Get the axis aligned bounding box for the edge collider in local space
   */
  public get localBounds(): BoundingBox {
    return this._boundsFromBeginEnd(this.begin, this.end);
  }

  /**
   * Returns this edge represented as a line in world coordinates
   */
  public asLine(): LineSegment {
    return new LineSegment(this._getTransformedBegin(), this._getTransformedEnd());
  }

  /**
   * Return this edge as a line in local line coordinates (relative to the position)
   */
  public asLocalLine(): LineSegment {
    return new LineSegment(this.begin, this.end);
  }

  /**
   * Get the axis associated with the edge
   */
  public get axes(): Vector[] {
    const e = this._getTransformedEnd().sub(this._getTransformedBegin());
    const edgeNormal = e.normal();

    const axes = [];
    axes.push(edgeNormal);
    axes.push(edgeNormal.negate());
    axes.push(edgeNormal.normal());
    axes.push(edgeNormal.normal().negate());
    return axes;
  }

  /**
   * Get the moment of inertia for an edge
   * https://en.wikipedia.org/wiki/List_of_moments_of_inertia
   */
  public getInertia(mass: number): number {
    const length = this.end.sub(this.begin).distance() / 2;
    return mass * length * length;
  }

  /**
   * @inheritdoc
   */
  public update(transform: Transform): void {
    this._transform = transform;
    const globalMat = transform.matrix ?? this._globalMatrix;
    globalMat.clone(this._globalMatrix);
    this._globalMatrix.translate(this.offset.x, this.offset.y);
  }

  /**
   * Project the edge along a specified axis
   */
  public project(axis: Vector): Projection {
    const scalars = [];

    const points = [this._getTransformedBegin(), this._getTransformedEnd()];
    const len = points.length;
    for (let i = 0; i < len; i++) {
      scalars.push(points[i].dot(axis));
    }

    return new Projection(Math.min.apply(Math, scalars), Math.max.apply(Math, scalars));
  }

  public debug(ex: ExcaliburGraphicsContext, color: Color) {
    const begin = this._getTransformedBegin();
    const end = this._getTransformedEnd();
    ex.drawLine(begin, end, color, 2);
    ex.drawCircle(begin, 2, color);
    ex.drawCircle(end, 2, color);
  }

}
