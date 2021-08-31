import { Physics } from '../Physics';
import { CollisionProcessor } from './CollisionProcessor';
import { DynamicTree } from './DynamicTree';
import { Pair } from './Pair';

import { Vector, Ray } from '../../Algebra';
import { FrameStats } from '../../Debug';
import { Logger } from '../../Util/Log';
import { CollisionType } from '../CollisionType';
import { Collider } from '../Shapes/Collider';
import { CollisionContact } from '../Detection/CollisionContact';
import { Color } from '../../Color';
import { ConvexPolygon } from '../Shapes/ConvexPolygon';
import { DrawUtil } from '../../Util/Index';
import { BodyComponent } from '../BodyComponent';
import { CompositeCollider } from '../Shapes/CompositeCollider';

/**
 * Responsible for performing the collision broadphase (locating potential colllisions) and
 * the narrowphase (actual collision contacts)
 */
export class DynamicTreeCollisionProcessor implements CollisionProcessor {
  private _dynamicCollisionTree = new DynamicTree<Collider>();
  private _collisions = new Set<string>();

  private _collisionPairCache: Pair[] = [];
  private _colliders: Collider[] = [];

  /**
   * Tracks a physics body for collisions
   */
  public track(target: Collider): void {
    if (!target) {
      Logger.getInstance().warn('Cannot track null collider');
      return;
    }
    if (target instanceof CompositeCollider) {
      const colliders = target.getColliders();
      for (let c of colliders) {
        c.owner = target.owner;
        this._colliders.push(c);
        this._dynamicCollisionTree.trackCollider(c);
      }
    } else {
      this._colliders.push(target);
      this._dynamicCollisionTree.trackCollider(target);
    }
  }

  /**
   * Untracks a physics body
   */
  public untrack(target: Collider): void {
    if (!target) {
      Logger.getInstance().warn('Cannot untrack a null collider');
      return;
    }

    if (target instanceof CompositeCollider) {
      const colliders = target.getColliders();
      for (let c of colliders) {
        const index = this._colliders.indexOf(c);
      if (index !== -1) {
        this._colliders.splice(index, 1);
      }
      this._dynamicCollisionTree.untrackCollider(c);
      }
    } else {
      const index = this._colliders.indexOf(target);
      if (index !== -1) {
        this._colliders.splice(index, 1);
      }
      this._dynamicCollisionTree.untrackCollider(target);
    }
  }

  private _shouldGenerateCollisionPair(colliderA: Collider, colliderB: Collider) {
    // if the collision pair must be 2 separate colliders
    if ((colliderA.id !== null && colliderB.id !== null) &&
        colliderA.id === colliderB.id) {
      return false;
    }

    // if the collision pair has been calculated already short circuit
    const hash = Pair.calculatePairHash(colliderA.id, colliderB.id);
    if (this._collisions.has(hash)) {
      return false; // pair exists easy exit return false
    }

    // if the pair has a member with zero dimension
    if (colliderA.localBounds.hasZeroDimensions() || colliderB.localBounds.hasZeroDimensions()){
      return false;
    }

    return Pair.canCollide(colliderA, colliderB);
  }

  /**
   * Detects potential collision pairs in a broadphase approach with the dynamic aabb tree strategy
   */
  public broadphase(targets: Collider[], delta: number, stats?: FrameStats): Pair[] {
    const seconds = delta / 1000;

    // Retrieve the list of potential colliders, exclude killed, prevented, and self
    const potentialColliders = targets
      .filter((other) => {
        const body = other.owner?.get(BodyComponent);
        return other.owner?.active && body.collisionType !== CollisionType.PreventCollision;
      });

    // clear old list of collision pairs
    this._collisionPairCache = [];
    this._collisions.clear();

    // check for normal collision pairs
    let collider: Collider;
    for (let j = 0, l = potentialColliders.length; j < l; j++) {
      collider = potentialColliders[j];
      // Query the collision tree for potential colliders
      this._dynamicCollisionTree.query(collider, (other: Collider) => {
        if (this._shouldGenerateCollisionPair(collider, other)) {
          const pair = new Pair(collider, other);
          this._collisions.add(pair.id);
          this._collisionPairCache.push(pair);
        }
        // Always return false, to query whole tree. Returning true in the query method stops searching
        return false;
      });
    }
    if (stats) {
      stats.physics.pairs = this._collisionPairCache.length;
    }

    // Check dynamic tree for fast moving objects
    // Fast moving objects are those moving at least there smallest bound per frame
    if (Physics.checkForFastBodies) {
      for (const collider of potentialColliders) {
        const body = collider.owner.get(BodyComponent);
        // Skip non-active objects. Does not make sense on other collision types
        if (body.collisionType !== CollisionType.Active) {
          continue;
        }

        // Maximum travel distance next frame
        const updateDistance =
          body.vel.size * seconds + // velocity term
          body.acc.size * 0.5 * seconds * seconds; // acc term

        // Find the minimum dimension
        const minDimension = Math.min(collider.bounds.height, collider.bounds.width);
        if (Physics.disableMinimumSpeedForFastBody || updateDistance > minDimension / 2) {
          if (stats) {
            stats.physics.fastBodies++;
          }

          // start with the oldPos because the integration for actors has already happened
          // objects resting on a surface may be slightly penetrating in the current position
          const updateVec = body.pos.sub(body.oldPos);
          const centerPoint = collider.center;
          const furthestPoint = collider.getFurthestPoint(body.vel);
          const origin: Vector = furthestPoint.sub(updateVec);

          const ray: Ray = new Ray(origin, body.vel);

          // back the ray up by -2x surfaceEpsilon to account for fast moving objects starting on the surface
          ray.pos = ray.pos.add(ray.dir.scale(-2 * Physics.surfaceEpsilon));
          let minCollider: Collider;
          let minTranslate: Vector = new Vector(Infinity, Infinity);
          this._dynamicCollisionTree.rayCastQuery(ray, updateDistance + Physics.surfaceEpsilon * 2, (other: Collider) => {
            if (collider !== other && Pair.canCollide(collider, other)) {
              const hitPoint = other.rayCast(ray, updateDistance + Physics.surfaceEpsilon * 10);
              if (hitPoint) {
                const translate = hitPoint.sub(origin);
                if (translate.size < minTranslate.size) {
                  minTranslate = translate;
                  minCollider = other;
                }
              }
            }
            return false;
          });

          if (minCollider && Vector.isValid(minTranslate)) {
            const pair = new Pair(collider, minCollider);
            if (!this._collisions.has(pair.id)) {
              this._collisions.add(pair.id);
              this._collisionPairCache.push(pair);
            }
            // move the fast moving object to the other body
            // need to push into the surface by ex.Physics.surfaceEpsilon
            const shift = centerPoint.sub(furthestPoint);
            body.pos = origin
              .add(shift)
              .add(minTranslate)
              .add(ray.dir.scale(2 * Physics.surfaceEpsilon));
            collider.update(body.transform);

            if (stats) {
              stats.physics.fastBodyCollisions++;
            }
          }
        }
      }
    }
    // return cache
    return this._collisionPairCache;
  }

  /**
   * Applies narrow phase on collision pairs to find actual area intersections
   * Adds actual colliding pairs to stats' Frame data
   */
  public narrowphase(pairs: Pair[], stats?: FrameStats): CollisionContact[] {
    let contacts: CollisionContact[] = [];
    for (let i = 0; i < pairs.length; i++) {
      contacts = contacts.concat(pairs[i].collide());
      if (stats && contacts.length > 0) {
        stats.physics.collidersHash[pairs[i].id] = pairs[i];
      }
    }
    if (stats) {
      stats.physics.collisions += contacts.length;
    }
    return contacts;
  }

  /**
   * Update the dynamic tree positions
   */
  public update(targets: Collider[]): number {
    let updated = 0;
    const len = targets.length;

    for (let i = 0; i < len; i++) {
      if (this._dynamicCollisionTree.updateCollider(targets[i])) {
        updated++;
      }
    }
    return updated;
  }

  /* istanbul ignore next */
  public debugDraw(ctx: CanvasRenderingContext2D) {
    if (Physics.debug.broadphaseDebug) {
      this._dynamicCollisionTree.debugDraw(ctx);
    }

    if (Physics.debug.showColliderGeometry) {
      for (const collider of this._colliders) {
        const body = collider.owner.get(BodyComponent);
        if (Physics.debug.showColliderBounds) {
          collider.bounds.debugDraw(ctx, Color.Yellow);
        }

        if (Physics.debug.showColliderGeometry) {
          let color = Color.Green;
          if (body.sleeping || body.collisionType === CollisionType.Fixed) {
            color = Color.Gray;
          }
          collider.debugDraw(ctx, color);
        }

        if (Physics.debug.showColliderNormals && collider instanceof ConvexPolygon) {
          for (const side of collider.getSides()) {
            DrawUtil.point(ctx, Color.Blue, side.midpoint);
            DrawUtil.vector(ctx, Color.Yellow, side.midpoint, side.normal(), 30);
          }
        }
      }
    }
  }
}
