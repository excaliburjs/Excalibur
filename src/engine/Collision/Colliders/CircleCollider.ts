import { BoundingBox } from '../BoundingBox';
import { CollisionJumpTable } from './CollisionJumpTable';
import { CollisionContact } from '../Detection/CollisionContact';
import { PolygonCollider } from './PolygonCollider';
import { EdgeCollider } from './EdgeCollider';

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
import { BodyComponent } from '../Index';
import { RayCastHit } from '../Detection/RayCastHit';
import { approximatelyEqual } from '../../Math/util';

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

  private _globalMatrix: AffineMatrix = AffineMatrix.identity();

  public get worldPos(): Vector {
    return this._globalMatrix.getPosition();
  }

  private _naturalRadius: number;

  private _radius: number | undefined;
  /**
   * Get the radius of the circle
   */
  public get radius(): number {
    if (this._radius) {
      return this._radius;
    }
    const tx = this._transform;
    const scale = tx?.globalScale ?? Vector.One;
    // This is a trade off, the alternative is retooling circles to support ellipse collisions
    return (this._radius = this._naturalRadius * Math.min(scale.x, scale.y));
  }

  /**
   * Set the radius of the circle
   */
  public set radius(val: number) {
    const tx = this._transform;
    const scale = tx?.globalScale ?? Vector.One;
    // This is a trade off, the alternative is retooling circles to support ellipse collisions
    this._naturalRadius = val / Math.min(scale.x, scale.y);
    this._localBoundsDirty = true;
    this._radius = val;
  }

  private _transform: Transform;

  constructor(options: CircleColliderOptions) {
    super();
    this.offset = options.offset || Vector.Zero;
    this.radius = options.radius || 0;
    this._globalMatrix.translate(this.offset.x, this.offset.y);
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
    return this._globalMatrix.getPosition();
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
  public rayCast(ray: Ray, max: number = Infinity): RayCastHit | null {
    // https://en.wikipedia.org/wiki/Intersection_(geometry)#A_line_and_a_circle
    const c = this.center;
    const dir = ray.dir;
    const orig = ray.pos;

    const u = c.sub(orig);

    const u1 = dir.scale(u.dot(dir));
    const u2 = u.sub(u1);

    const d = u2.magnitude;

    if (d > this.radius) {
      return null;
    } else {
      // tangent case
      let toi = 0;
      if (approximatelyEqual(d, this.radius, 0.0001)) {
        toi = -dir.dot(orig.sub(c));
        if (toi > 0 && toi < max) {
          const point = ray.getPoint(toi);
          return {
            point,
            normal: point.sub(c).normalize(),
            collider: this,
            body: this.owner?.get(BodyComponent),
            distance: toi
          } satisfies RayCastHit;
        }
        return null;
      } else {
        // two point
        const discriminant = Math.sqrt(Math.pow(dir.dot(orig.sub(c)), 2) - Math.pow(orig.sub(c).distance(), 2) + Math.pow(this.radius, 2));

        const toi1 = -dir.dot(orig.sub(c)) + discriminant;
        const toi2 = -dir.dot(orig.sub(c)) - discriminant;

        const positiveToi: number[] = [];
        if (toi1 >= 0) {
          positiveToi.push(toi1);
        }

        if (toi2 >= 0) {
          positiveToi.push(toi2);
        }

        const minToi = Math.min(...positiveToi);
        if (minToi <= max) {
          const point = ray.getPoint(minToi);
          return {
            point,
            normal: point.sub(c).normalize(),
            collider: this,
            body: this.owner?.get(BodyComponent),
            distance: minToi
          } satisfies RayCastHit;
        }
        return null;
      }
    }
  }

  public getClosestLineBetween(shape: Collider): LineSegment {
    if (shape instanceof CircleCollider) {
      return ClosestLineJumpTable.CircleCircleClosestLine(this, shape);
    } else if (shape instanceof PolygonCollider) {
      return ClosestLineJumpTable.PolygonCircleClosestLine(shape, this).flip();
    } else if (shape instanceof EdgeCollider) {
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
    } else if (collider instanceof PolygonCollider) {
      return CollisionJumpTable.CollideCirclePolygon(this, collider);
    } else if (collider instanceof EdgeCollider) {
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
    return this.localBounds.transform(this._globalMatrix);
  }

  private _localBoundsDirty = true;
  private _localBounds: BoundingBox;
  /**
   * Get the axis aligned bounding box for the circle collider in local coordinates
   */
  public get localBounds(): BoundingBox {
    if (this._localBoundsDirty) {
      this._localBounds = new BoundingBox(-this._naturalRadius, -this._naturalRadius, +this._naturalRadius, +this._naturalRadius);
      this._localBoundsDirty = false;
    }
    return this._localBounds;
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
    const globalMat = transform.matrix ?? this._globalMatrix;
    globalMat.clone(this._globalMatrix);
    this._globalMatrix.translate(this.offset.x, this.offset.y);
    this._radius = undefined;
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

  public debug(ex: ExcaliburGraphicsContext, color: Color, options?: { lineWidth: number }) {
    const { lineWidth } = { ...{ lineWidth: 1 }, ...options };
    const tx = this._transform;
    const scale = tx?.globalScale ?? Vector.One;
    const rotation = tx?.globalRotation ?? 0;
    const pos = tx?.globalPos ?? Vector.Zero;
    ex.save();
    ex.translate(pos.x, pos.y);
    ex.rotate(rotation);
    ex.scale(scale.x, scale.y);
    ex.drawCircle(this.offset ?? Vector.Zero, this._naturalRadius, Color.Transparent, color, lineWidth);
    ex.restore();
  }
}
