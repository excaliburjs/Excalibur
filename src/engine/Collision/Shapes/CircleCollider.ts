import { BoundingBox } from '../BoundingBox';
import { CollisionJumpTable } from './CollisionJumpTable';
import { CollisionContact } from '../Detection/CollisionContact';
import { ConvexPolygon } from './ConvexPolygon';
import { Edge } from './Edge';

import { Projection } from '../../Math/projection';
import { Line } from '../../Math/line';
import { Vector } from '../../Math/vector';
import { Ray } from '../../Math/ray';
import { Color } from '../../Color';
import { Collider } from './Collider';

import { ClosestLineJumpTable } from './ClosestLineJumpTable';
import { Transform } from '../../EntityComponentSystem';

export interface CircleColliderOptions {
  /**
   * Optional pixel offset to shift the circle relative to the collider, by default (0, 0).
   */
  offset?: Vector;
  /**
   * Required radius of the circle
   */
  radius: number;
}

/**
 * This is a circle collider for the excalibur rigid body physics simulation
 */
export class CircleCollider extends Collider {
  /**
   * Position of the circle relative to the collider, by default (0, 0).
   */
  public offset: Vector = Vector.Zero;

  public get worldPos(): Vector {
    return this.offset.add(this._transform?.pos ?? Vector.Zero);
  }

  /**
   * This is the radius of the circle
   */
  public radius: number;

  private _transform: Transform;

  constructor(options: CircleColliderOptions) {
    super();
    this.offset = options.offset || Vector.Zero;
    this.radius = options.radius || 0;
  }

  /**
   * Returns a clone of this shape, not associated with any collider
   */
  public clone(): CircleCollider {
    return new CircleCollider({
      offset: this.offset.clone(),
      radius: this.radius
    });
  }

  /**
   * Get the center of the collider in world coordinates
   */
  public get center(): Vector {
    return this.offset.add(this._transform?.pos ?? Vector.Zero);
  }

  /**
   * Tests if a point is contained in this collider
   */
  public contains(point: Vector): boolean {
    const pos = this._transform?.pos ?? this.offset;
    const distance = pos.distance(point);
    if (distance <= this.radius) {
      return true;
    }
    return false;
  }

  /**
   * Casts a ray at the Circle collider and returns the nearest point of collision
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

  public getClosestLineBetween(shape: Collider): Line {
    if (shape instanceof CircleCollider) {
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
  public collide(collider: Collider): CollisionContact[] {
    if (collider instanceof CircleCollider) {
      return CollisionJumpTable.CollideCircleCircle(this, collider);
    } else if (collider instanceof ConvexPolygon) {
      return CollisionJumpTable.CollideCirclePolygon(this, collider);
    } else if (collider instanceof Edge) {
      return CollisionJumpTable.CollideCircleEdge(this, collider);
    } else {
      throw new Error(`Circle could not collide with unknown CollisionShape ${typeof collider}`);
    }
  }

  /**
   * Find the point on the collider furthest in the direction specified
   */
  public getFurthestPoint(direction: Vector): Vector {
    return this.center.add(direction.normalize().scale(this.radius));
  }

  /**
   * Find the local point on the shape in the direction specified
   * @param direction
   */
  public getFurthestLocalPoint(direction: Vector): Vector {
    const dir = direction.normalize();
    return dir.scale(this.radius);
  }

  /**
   * Get the axis aligned bounding box for the circle collider in world coordinates
   */
  public get bounds(): BoundingBox {
    const bodyPos = this._transform?.pos ?? Vector.Zero;
    return new BoundingBox(
      this.offset.x + bodyPos.x - this.radius,
      this.offset.y + bodyPos.y - this.radius,
      this.offset.x + bodyPos.x + this.radius,
      this.offset.y + bodyPos.y + this.radius
    );
  }

  /**
   * Get the axis aligned bounding box for the circle collider in local coordinates
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
    return [];
  }

  /**
   * Returns the moment of inertia of a circle given it's mass
   * https://en.wikipedia.org/wiki/List_of_moments_of_inertia
   */
  public getInertia(mass: number): number {
    return (mass * this.radius * this.radius) / 2;
  }

  /* istanbul ignore next */
  public update(transform: Transform): void {
    this._transform = transform;
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
    const transform = this._transform;
    const pos = transform ? transform.pos.add(this.offset) : this.offset;
    const rotation = transform ? transform.rotation : 0;

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
