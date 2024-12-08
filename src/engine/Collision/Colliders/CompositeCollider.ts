import { Util } from '../..';
import { Pair } from '../Detection/Pair';
import { Color } from '../../Color';
import { ExcaliburGraphicsContext } from '../../Graphics/Context/ExcaliburGraphicsContext';
import { LineSegment } from '../../Math/line-segment';
import { Projection } from '../../Math/projection';
import { Ray } from '../../Math/ray';
import { Vector } from '../../Math/vector';
import { BoundingBox } from '../BoundingBox';
import { CollisionContact } from '../Detection/CollisionContact';
import { DynamicTree } from '../Detection/DynamicTree';
import { DynamicTreeCollisionProcessor } from '../Detection/DynamicTreeCollisionProcessor';
import { RayCastHit } from '../Detection/RayCastHit';
import { Collider } from './Collider';
import { Transform } from '../../Math/transform';
import { getDefaultPhysicsConfig } from '../PhysicsConfig';

export class CompositeCollider extends Collider {
  private _transform: Transform;
  private _collisionProcessor = new DynamicTreeCollisionProcessor({
    ...getDefaultPhysicsConfig()
  });
  private _dynamicAABBTree = new DynamicTree({
    boundsPadding: 5,
    velocityMultiplier: 2
  });
  private _colliders: Collider[] = [];

  private _compositeStrategy?: 'separate' | 'together';
  /**
   * Treat composite collider's member colliders as either separate colliders for the purposes of onCollisionStart/onCollision
   * or as a single collider together.
   *
   * This property can be overridden on individual {@apilink CompositeColliders}.
   *
   * For composites without gaps or small groups of colliders, you probably want 'together'
   *
   * For composites with deliberate gaps, like a platforming level layout, you probably want 'separate'
   *
   * Default is 'together' if unset
   */
  public set compositeStrategy(value: 'separate' | 'together') {
    this._compositeStrategy = value;
  }
  public get compositeStrategy() {
    return this._compositeStrategy;
  }

  constructor(colliders: Collider[]) {
    super();
    for (const c of colliders) {
      this.addCollider(c);
    }
  }

  clearColliders() {
    this._colliders = [];
  }

  addCollider(collider: Collider) {
    let colliders: Collider[];
    if (collider instanceof CompositeCollider) {
      colliders = collider.getColliders();
      colliders.forEach((c) => c.offset.addEqual(collider.offset));
    } else {
      colliders = [collider];
    }
    // Flatten composites
    for (const c of colliders) {
      c.events.pipe(this.events);
      c.composite = this;
      this._colliders.push(c);
      this._collisionProcessor.track(c);
      this._dynamicAABBTree.trackCollider(c);
    }
  }

  removeCollider(collider: Collider) {
    collider.events.pipe(this.events);
    collider.composite = null;
    Util.removeItemFromArray(collider, this._colliders);
    this._collisionProcessor.untrack(collider);
    this._dynamicAABBTree.untrackCollider(collider);
  }

  getColliders(): Collider[] {
    return this._colliders;
  }

  get worldPos(): Vector {
    return (this._transform?.pos ?? Vector.Zero).add(this.offset);
  }

  get center(): Vector {
    return (this._transform?.pos ?? Vector.Zero).add(this.offset);
  }

  get bounds(): BoundingBox {
    // TODO cache this
    const colliders = this.getColliders();
    const results = colliders.reduce(
      (acc, collider) => acc.combine(collider.bounds),
      colliders[0]?.bounds ?? new BoundingBox().translate(this.worldPos)
    );

    return results.translate(this.offset);
  }

  get localBounds(): BoundingBox {
    // TODO cache this
    const colliders = this.getColliders();
    const results = colliders.reduce((acc, collider) => acc.combine(collider.localBounds), colliders[0]?.localBounds ?? new BoundingBox());

    return results;
  }

  get axes(): Vector[] {
    // TODO cache this
    const colliders = this.getColliders();
    let axes: Vector[] = [];
    for (const collider of colliders) {
      axes = axes.concat(collider.axes);
    }
    return axes;
  }

  getFurthestPoint(direction: Vector): Vector {
    const colliders = this.getColliders();
    const furthestPoints: Vector[] = [];
    for (const collider of colliders) {
      furthestPoints.push(collider.getFurthestPoint(direction));
    }
    // Pick best point from all colliders
    let bestPoint = furthestPoints[0];
    let maxDistance = -Number.MAX_VALUE;
    for (const point of furthestPoints) {
      const distance = point.dot(direction);
      if (distance > maxDistance) {
        bestPoint = point;
        maxDistance = distance;
      }
    }
    return bestPoint;
  }

  getInertia(mass: number): number {
    const colliders = this.getColliders();
    let totalInertia = 0;
    for (const collider of colliders) {
      totalInertia += collider.getInertia(mass);
    }
    return totalInertia;
  }

  collide(other: Collider): CollisionContact[] {
    let otherColliders = [other];
    if (other instanceof CompositeCollider) {
      otherColliders = other.getColliders();
    }

    const pairs: Pair[] = [];
    for (const c of otherColliders) {
      this._dynamicAABBTree.query(c, (potentialCollider: Collider) => {
        pairs.push(new Pair(c, potentialCollider));
        return false;
      });
    }

    let contacts: CollisionContact[] = [];
    for (const p of pairs) {
      contacts = contacts.concat(p.collide());
    }
    return contacts;
  }

  getClosestLineBetween(other: Collider): LineSegment {
    const colliders = this.getColliders();
    const lines: LineSegment[] = [];
    if (other instanceof CompositeCollider) {
      const otherColliders = other.getColliders();
      for (const colliderA of colliders) {
        for (const colliderB of otherColliders) {
          const maybeLine = colliderA.getClosestLineBetween(colliderB);
          if (maybeLine) {
            lines.push(maybeLine);
          }
        }
      }
    } else {
      for (const collider of colliders) {
        const maybeLine = other.getClosestLineBetween(collider);
        if (maybeLine) {
          lines.push(maybeLine);
        }
      }
    }

    if (lines.length) {
      let minLength = lines[0].getLength();
      let minLine = lines[0];
      for (const line of lines) {
        const length = line.getLength();
        if (length < minLength) {
          minLength = length;
          minLine = line;
        }
      }
      return minLine;
    }
    return null;
  }
  contains(point: Vector): boolean {
    const colliders = this.getColliders();
    for (const collider of colliders) {
      if (collider.contains(point)) {
        return true;
      }
    }
    return false;
  }
  rayCast(ray: Ray, max?: number): RayCastHit | null {
    const colliders = this.getColliders();
    const hits: RayCastHit[] = [];
    for (const collider of colliders) {
      const hit = collider.rayCast(ray, max);
      if (hit) {
        hits.push(hit);
      }
    }
    if (hits.length) {
      let minHit = hits[0];
      let minDistance = minHit.point.dot(ray.dir);
      for (const hit of hits) {
        const distance = ray.dir.dot(hit.point);
        if (distance < minDistance) {
          minHit = hit;
          minDistance = distance;
        }
      }
      return minHit;
    }
    return null;
  }
  project(axis: Vector): Projection {
    const colliders = this.getColliders();
    const projections: Projection[] = [];
    for (const collider of colliders) {
      const proj = collider.project(axis);
      if (proj) {
        projections.push(proj);
      }
    }
    // Merge all proj's on the same axis
    if (projections.length) {
      const newProjection = new Projection(projections[0].min, projections[0].max);
      for (const proj of projections) {
        newProjection.min = Math.min(proj.min, newProjection.min);
        newProjection.max = Math.max(proj.max, newProjection.max);
      }
      return newProjection;
    }
    return null;
  }

  update(transform: Transform): void {
    if (transform) {
      const colliders = this.getColliders();
      for (const collider of colliders) {
        collider.owner = this.owner;
        collider.update(transform);
      }
    }
  }

  public debug(ex: ExcaliburGraphicsContext, color: Color, options?: { lineWidth: number; pointSize: number }) {
    const colliders = this.getColliders();
    ex.save();
    ex.translate(this.offset.x, this.offset.y);
    for (const collider of colliders) {
      collider.debug(ex, color, options);
    }
    ex.restore();
  }

  clone(): Collider {
    const result = new CompositeCollider(this._colliders.map((c) => c.clone()));
    result.offset = this.offset.clone();
    return result;
  }
}
