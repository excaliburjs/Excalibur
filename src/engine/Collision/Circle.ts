import { BoundingBox } from './BoundingBox';
import { CollisionJumpTable } from './CollisionJumpTable';
import { CollisionContact } from './CollisionContact';
import { CollisionShape } from './CollisionShape';
import { ConvexPolygon } from './ConvexPolygon';
import { Edge } from './Edge';

import { Vector, Ray, Projection, Line } from '../Algebra';
import { Physics } from '../Physics';
import { Color } from '../Drawing/Color';
import { Collider } from './Collider';

import { ClosestLineJumpTable } from './ClosestLineJumpTable';

export interface CircleOptions {
  /**
   * Optional pixel offset to shift the circle relative to the collider, by default (0, 0).
   */
  offset?: Vector;
  /**
   * Required radius of the circle
   */
  radius: number;
  /**
   * Optional collider to associate with this shape
   */
  collider?: Collider;
}

/**
 * This is a circle collision shape for the excalibur rigid body physics simulation
 */
export class Circle implements CollisionShape {
  /**
   * Position of the circle relative to the collider, by default (0, 0) meaning the shape is positioned on top of the collider.
   */
  public offset: Vector = Vector.Zero;

  public get worldPos(): Vector {
    if (this.collider && this.collider.body) {
      return this.collider.body.pos.add(this.offset);
    }
    return this.offset;
  }

  /**
   * This is the radius of the circle
   */
  public radius: number;

  /**
   * The collider associated for this shape, if any.
   */
  public collider?: Collider;

  constructor(options: CircleOptions) {
    this.offset = options.offset || Vector.Zero;
    this.radius = options.radius || 0;
    this.collider = options.collider || null;
  }

  /**
   * Returns a clone of this shape, not associated with any collider
   */
  public clone(): Circle {
    return new Circle({
      offset: this.offset.clone(),
      radius: this.radius,
      collider: null
    });
  }

  /**
   * Get the center of the collision shape in world coordinates
   */
  public get center(): Vector {
    if (this.collider && this.collider.body) {
      return this.offset.add(this.collider.body.pos);
    }
    return this.offset;
  }

  /**
   * Tests if a point is contained in this collision shape
   */
  public contains(point: Vector): boolean {
    let pos = this.offset;
    if (this.collider && this.collider.body) {
      pos = this.collider.body.pos;
    }
    const distance = pos.distance(point);
    if (distance <= this.radius) {
      return true;
    }
    return false;
  }

  /**
   * Casts a ray at the Circle shape and returns the nearest point of collision
   * @param ray
   */
  public rayCast(ray: Ray, max: number = Infinity): Vector {
    //https://en.wikipedia.org/wiki/Line%E2%80%93sphere_intersection
    const c = this.center;
    const dir = ray.dir;
    const orig = ray.pos;

    const discriminant = Math.sqrt(Math.pow(dir.dot(orig.sub(c)), 2) - Math.pow(orig.sub(c).distance(), 2) + Math.pow(this.radius, 2));

    if (discriminant < 0) {
      // no intersection
      return null;
    } else {
      let toi = 0;
      if (discriminant === 0) {
        toi = -dir.dot(orig.sub(c));
        if (toi > 0 && toi < max) {
          return ray.getPoint(toi);
        }
        return null;
      } else {
        const toi1 = -dir.dot(orig.sub(c)) + discriminant;
        const toi2 = -dir.dot(orig.sub(c)) - discriminant;

        const positiveToi: number[] = [];
        if (toi1 >= 0) {
          positiveToi.push(toi1);
        }

        if (toi2 >= 0) {
          positiveToi.push(toi2);
        }

        const mintoi = Math.min(...positiveToi);
        if (mintoi <= max) {
          return ray.getPoint(mintoi);
        }
        return null;
      }
    }
  }

  public getClosestLineBetween(shape: CollisionShape): Line {
    if (shape instanceof Circle) {
      return ClosestLineJumpTable.CircleCircleClosestLine(this, shape);
    } else if (shape instanceof ConvexPolygon) {
      return ClosestLineJumpTable.PolygonCircleClosestLine(shape, this).flip();
    } else if (shape instanceof Edge) {
      return ClosestLineJumpTable.CircleEdgeClosestLine(this, shape).flip();
    } else {
      throw new Error(`Polygon could not collide with unknown CollisionShape ${typeof shape}`);
    }
  }

  /**
   * @inheritdoc
   */
  public collide(shape: CollisionShape): CollisionContact {
    if (shape instanceof Circle) {
      return CollisionJumpTable.CollideCircleCircle(this, shape);
    } else if (shape instanceof ConvexPolygon) {
      return CollisionJumpTable.CollideCirclePolygon(this, shape);
    } else if (shape instanceof Edge) {
      return CollisionJumpTable.CollideCircleEdge(this, shape);
    } else {
      throw new Error(`Circle could not collide with unknown CollisionShape ${typeof shape}`);
    }
  }

  /**
   * Find the point on the shape furthest in the direction specified
   */
  public getFurthestPoint(direction: Vector): Vector {
    return this.center.add(direction.normalize().scale(this.radius));
  }

  /**
   * Get the axis aligned bounding box for the circle shape in world coordinates
   */
  public get bounds(): BoundingBox {
    let bodyPos = Vector.Zero;
    if (this.collider && this.collider.body) {
      bodyPos = this.collider.body.pos;
    }
    return new BoundingBox(
      this.offset.x + bodyPos.x - this.radius,
      this.offset.y + bodyPos.y - this.radius,
      this.offset.x + bodyPos.x + this.radius,
      this.offset.y + bodyPos.y + this.radius
    );
  }

  /**
   * Get the axis aligned bounding box for the circle shape in local coordinates
   */
  public get localBounds(): BoundingBox {
    return new BoundingBox(
      this.offset.x - this.radius,
      this.offset.y - this.radius,
      this.offset.x + this.radius,
      this.offset.y + this.radius
    );
  }

  /**
   * Get axis not implemented on circles, since there are infinite axis in a circle
   */
  public get axes(): Vector[] {
    return null;
  }

  /**
   * Returns the moment of inertia of a circle given it's mass
   * https://en.wikipedia.org/wiki/List_of_moments_of_inertia
   */
  public get inertia(): number {
    const mass = this.collider ? this.collider.mass : Physics.defaultMass;
    return (mass * this.radius * this.radius) / 2;
  }

  /**
   * Tests the separating axis theorem for circles against polygons
   */
  public testSeparatingAxisTheorem(polygon: ConvexPolygon): Vector {
    const axes = polygon.axes;
    const pc = polygon.center;
    // Special SAT with circles
    const closestPointOnPoly = polygon.getFurthestPoint(this.offset.sub(pc));
    axes.push(this.offset.sub(closestPointOnPoly).normalize());

    let minOverlap = Number.MAX_VALUE;
    let minAxis = null;
    let minIndex = -1;
    for (let i = 0; i < axes.length; i++) {
      const proj1 = polygon.project(axes[i]);
      const proj2 = this.project(axes[i]);
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
    if (minIndex < 0) {
      return null;
    }
    return minAxis.normalize().scale(minOverlap);
  }

  /* istanbul ignore next */
  public recalc(): void {
    // circles don't cache
  }

  /**
   * Project the circle along a specified axis
   */
  public project(axis: Vector): Projection {
    const scalars = [];
    const point = this.center;
    const dotProduct = point.dot(axis);
    scalars.push(dotProduct);
    scalars.push(dotProduct + this.radius);
    scalars.push(dotProduct - this.radius);
    return new Projection(Math.min.apply(Math, scalars), Math.max.apply(Math, scalars));
  }

  public draw(ctx: CanvasRenderingContext2D, color: Color = Color.Green, pos: Vector = Vector.Zero) {
    const newPos = pos.add(this.offset);
    ctx.beginPath();
    ctx.fillStyle = color.toString();
    ctx.arc(newPos.x, newPos.y, this.radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }

  /* istanbul ignore next */
  public debugDraw(ctx: CanvasRenderingContext2D, color: Color = Color.Green) {
    const body = this.collider.body;
    const pos = body ? body.pos.add(this.offset) : this.offset;
    const rotation = body ? body.rotation : 0;

    ctx.beginPath();
    ctx.strokeStyle = color.toString();
    ctx.arc(pos.x, pos.y, this.radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(Math.cos(rotation) * this.radius + pos.x, Math.sin(rotation) * this.radius + pos.y);
    ctx.closePath();
    ctx.stroke();
  }
}
