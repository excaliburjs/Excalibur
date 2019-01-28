import { Body } from './Body';
import { BoundingBox } from './BoundingBox';
import { CollisionContact } from './CollisionContact';
import { CollisionJumpTable } from './CollisionJumpTable';
import { ICollisionArea } from './ICollisionArea';
import { CircleArea } from './CircleArea';
import { PolygonArea } from './PolygonArea';

import { Vector, Ray, Projection } from '../Algebra';
import { Physics } from '../Physics';
import { Color } from '../Drawing/Color';

export interface IEdgeAreaOptions {
  begin?: Vector;
  end?: Vector;
  body?: Body;
}

export class EdgeArea implements ICollisionArea {
  body: Body;
  pos: Vector;
  begin: Vector;
  end: Vector;

  constructor(options: IEdgeAreaOptions) {
    this.begin = options.begin || Vector.Zero;
    this.end = options.end || Vector.Zero;
    this.body = options.body || null;

    this.pos = this.getCenter();
  }

  /**
   * Get the center of the collision area in world coordinates
   */
  public getCenter(): Vector {
    var pos = this.begin.average(this.end).add(this._getBodyPos());
    return pos;
  }

  private _getBodyPos(): Vector {
    var bodyPos = Vector.Zero;
    if (this.body.pos) {
      bodyPos = this.body.pos;
    }
    return bodyPos;
  }

  private _getTransformedBegin(): Vector {
    var angle = this.body ? this.body.rotation : 0;
    return this.begin.rotate(angle).add(this._getBodyPos());
  }

  private _getTransformedEnd(): Vector {
    var angle = this.body ? this.body.rotation : 0;
    return this.end.rotate(angle).add(this._getBodyPos());
  }

  /**
   * Returns the slope of the line in the form of a vector
   */
  public getSlope(): Vector {
    var begin = this._getTransformedBegin();
    var end = this._getTransformedEnd();
    var distance = begin.distance(end);
    return end.sub(begin).scale(1 / distance);
  }

  /**
   * Returns the length of the line segment in pixels
   */
  public getLength(): number {
    var begin = this._getTransformedBegin();
    var end = this._getTransformedEnd();
    var distance = begin.distance(end);
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
    var numerator = this._getTransformedBegin().sub(ray.pos);

    // Test is line and ray are parallel and non intersecting
    if (ray.dir.cross(this.getSlope()) === 0 && numerator.cross(ray.dir) !== 0) {
      return null;
    }

    // Lines are parallel
    var divisor = ray.dir.cross(this.getSlope());
    if (divisor === 0) {
      return null;
    }

    var t = numerator.cross(this.getSlope()) / divisor;

    if (t >= 0 && t <= max) {
      var u = numerator.cross(ray.dir) / divisor / this.getLength();
      if (u >= 0 && u <= 1) {
        return ray.getPoint(t);
      }
    }

    return null;
  }

  /**
   * @inheritdoc
   */
  public collide(area: ICollisionArea): CollisionContact {
    if (area instanceof CircleArea) {
      return CollisionJumpTable.CollideCircleEdge(area, this);
    } else if (area instanceof PolygonArea) {
      return CollisionJumpTable.CollidePolygonEdge(area, this);
    } else if (area instanceof EdgeArea) {
      return CollisionJumpTable.CollideEdgeEdge();
    } else {
      throw new Error(`Edge could not collide with unknown ICollisionArea ${typeof area}`);
    }
  }

  /**
   * Find the point on the shape furthest in the direction specified
   */
  public getFurthestPoint(direction: Vector): Vector {
    var transformedBegin = this._getTransformedBegin();
    var transformedEnd = this._getTransformedEnd();
    if (direction.dot(transformedBegin) > 0) {
      return transformedBegin;
    } else {
      return transformedEnd;
    }
  }

  /**
   * Get the axis aligned bounding box for the circle area
   */
  public getBounds(): BoundingBox {
    var transformedBegin = this._getTransformedBegin();
    var transformedEnd = this._getTransformedEnd();
    return new BoundingBox(
      Math.min(transformedBegin.x, transformedEnd.x),
      Math.min(transformedBegin.y, transformedEnd.y),
      Math.max(transformedBegin.x, transformedEnd.x),
      Math.max(transformedBegin.y, transformedEnd.y)
    );
  }

  /**
   * Get the axis associated with the edge
   */
  public getAxes(): Vector[] {
    var e = this._getTransformedEnd().sub(this._getTransformedBegin());
    var edgeNormal = e.normal();

    var axes = [];
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
  public getMomentOfInertia(): number {
    var mass = this.body ? this.body.mass : Physics.defaultMass;
    var length = this.end.sub(this.begin).distance() / 2;
    return mass * length * length;
  }

  /**
   * @inheritdoc
   */
  public recalc(): void {
    // edges don't have any cached data
  }

  /**
   * Project the edge along a specified axis
   */
  public project(axis: Vector): Projection {
    var scalars = [];

    var points = [this._getTransformedBegin(), this._getTransformedEnd()];
    var len = points.length;
    for (var i = 0; i < len; i++) {
      scalars.push(points[i].dot(axis));
    }

    return new Projection(Math.min.apply(Math, scalars), Math.max.apply(Math, scalars));
  }

  /* istanbul ignore next */
  public debugDraw(ctx: CanvasRenderingContext2D, color: Color = Color.Red) {
    ctx.strokeStyle = color.toString();
    ctx.beginPath();
    ctx.moveTo(this.begin.x, this.begin.y);
    ctx.lineTo(this.end.x, this.end.y);
    ctx.closePath();
    ctx.stroke();
  }
}
