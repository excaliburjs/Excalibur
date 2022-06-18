import { Physics } from '../Physics';
import { CollisionProcessor } from './CollisionProcessor';
import { DynamicTree } from './DynamicTree';
import { Pair } from './Pair';

import { Vector } from '../../Math/vector';
import { Ray } from '../../Math/ray';
import { FrameStats } from '../../Debug';
import { Logger } from '../../Util/Log';
import { CollisionType } from '../CollisionType';
import { Collider } from '../Colliders/Collider';
import { CollisionContact } from '../Detection/CollisionContact';
import { BodyComponent } from '../BodyComponent';
import { CompositeCollider } from '../Colliders/CompositeCollider';
import { ExcaliburGraphicsContext } from '../..';

/**
 * Responsible for performing the collision broadphase (locating potential collisions) and
 * the narrowphase (actual collision contacts)
 */
export class DynamicTreeCollisionProcessor implements CollisionProcessor {
  private _dynamicCollisionTree = new DynamicTree<Collider>();
  private _pairs = new Set<string>();

  private _collisionPairCache: Pair[] = [];
  private _colliders: Collider[] = [];

  public getColliders(): readonly Collider[] {
    return this._colliders;
  }

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
      for (const c of colliders) {
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
      for (const c of colliders) {
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

  private _pairExists(colliderA: Collider, colliderB: Collider) {
    // if the collision pair has been calculated already short circuit
    const hash = Pair.calculatePairHash(colliderA.id, colliderB.id);
    return this._pairs.has(hash);
  }

  /**
   * Detects potential collision pairs in a broadphase approach with the dynamic AABB tree strategy
   */
  public broadphase(targets: Collider[], delta: number, stats?: FrameStats): Pair[] {
    const seconds = delta / 1000;

    // Retrieve the list of potential colliders, exclude killed, prevented, and self
    const potentialColliders = targets.filter((other) => {
      const body = other.owner?.get(BodyComponent);
      return other.owner?.active && body.collisionType !== CollisionType.PreventCollision;
    });

    // clear old list of collision pairs
    this._collisionPairCache = [];
    this._pairs.clear();

    // check for normal collision pairs
    let collider: Collider;
    for (let j = 0, l = potentialColliders.length; j < l; j++) {
      collider = potentialColliders[j];
      // Query the collision tree for potential colliders
      this._dynamicCollisionTree.query(collider, (other: Collider) => {
        if (!this._pairExists(collider, other) && Pair.canCollide(collider, other)) {
          const pair = new Pair(collider, other);
          this._pairs.add(pair.id);
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
            if (!this._pairExists(collider, other) && Pair.canCollide(collider, other)) {
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
            if (!this._pairs.has(pair.id)) {
              this._pairs.add(pair.id);
              this._collisionPairCache.push(pair);
            }
            // move the fast moving object to the other body
            // need to push into the surface by ex.Physics.surfaceEpsilon
            const shift = centerPoint.sub(furthestPoint);
            body.pos = origin
              .add(shift)
              .add(minTranslate)
              .add(ray.dir.scale(10 * Physics.surfaceEpsilon)); // needed to push the shape slightly into contact
            collider.update(body.transform.get());

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
      const newContacts = pairs[i].collide();
      contacts = contacts.concat(newContacts);
      if (stats && newContacts.length > 0) {
        for (const c of newContacts) {
          stats.physics.contacts.set(c.id, c);
        }
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

  public debug(ex: ExcaliburGraphicsContext) {
    this._dynamicCollisionTree.debug(ex);
  }
}
