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
import { Collider } from './Collider';
import { Transform } from '../../Math/transform';

export class CompositeCollider extends Collider {
  private _transform: Transform;
  private _collisionProcessor = new DynamicTreeCollisionProcessor();
  private _dynamicAABBTree = new DynamicTree();
  private _colliders: Collider[] = [];

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
    this.events.wire(collider.events);
    collider.__compositeColliderId = this.id;
    this._colliders.push(collider);
    this._collisionProcessor.track(collider);
    this._dynamicAABBTree.trackCollider(collider);
  }

  removeCollider(collider: Collider) {
    this.events.unwire(collider.events);
    collider.__compositeColliderId = null;
    Util.removeItemFromArray(collider, this._colliders);
    this._collisionProcessor.untrack(collider);
    this._dynamicAABBTree.untrackCollider(collider);
  }

  getColliders(): Collider[] {
    return this._colliders;
  }

  get worldPos(): Vector {
    // TODO transform component world pos
    return this._transform?.pos ?? Vector.Zero;
  }

  get center(): Vector {
    return this._transform?.pos ?? Vector.Zero;
  }

  get bounds(): BoundingBox {
    // TODO cache this
    const colliders = this.getColliders();
    const results = colliders.reduce(
      (acc, collider) => acc.combine(collider.bounds),
      colliders[0]?.bounds ?? new BoundingBox().translate(this.worldPos)
    );

    return results;
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
  rayCast(ray: Ray, max?: number): Vector {
    const colliders = this.getColliders();
    const points: Vector[] = [];
    for (const collider of colliders) {
      const vec = collider.rayCast(ray, max);
      if (vec) {
        points.push(vec);
      }
    }
    if (points.length) {
      let minPoint = points[0];
      let minDistance = minPoint.dot(ray.dir);
      for (const point of points) {
        const distance = ray.dir.dot(point);
        if (distance < minDistance) {
          minPoint = point;
          minDistance = distance;
        }
      }
      return minPoint;
    }
    return null;
  }
  project(axis: Vector): Projection {
    const colliders = this.getColliders();
    const projs: Projection[] = [];
    for (const collider of colliders) {
      const proj = collider.project(axis);
      if (proj) {
        projs.push(proj);
      }
    }
    // Merge all proj's on the same axis
    if (projs.length) {
      const newProjection = new Projection(projs[0].min, projs[0].max);
      for (const proj of projs) {
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

  public debug(ex: ExcaliburGraphicsContext, color: Color) {
    const colliders = this.getColliders();
    for (const collider of colliders) {
      collider.debug(ex, color);
    }
  }

  clone(): Collider {
    return new CompositeCollider(this._colliders.map((c) => c.clone()));
  }
}
