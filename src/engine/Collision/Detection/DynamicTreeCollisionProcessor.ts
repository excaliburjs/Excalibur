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
import { CollisionGroup } from '../Group/CollisionGroup';
import { ExcaliburGraphicsContext } from '../../Graphics/Context/ExcaliburGraphicsContext';
import { RayCastHit } from './RayCastHit';
import { DeepRequired } from '../../Util/Required';
import { PhysicsConfig } from '../PhysicsConfig';
import { RayCastOptions } from './RayCastOptions';
import { BoundingBox } from '../BoundingBox';
import { createId } from '../../Id';

/**
 * Responsible for performing the collision broadphase (locating potential collisions) and
 * the narrowphase (actual collision contacts)
 */
export class DynamicTreeCollisionProcessor implements CollisionProcessor {
  private _dynamicCollisionTree: DynamicTree<Collider>;
  private _pairs = new Set<string>();

  private _collisionPairCache: Pair[] = [];
  private _colliders: Collider[] = [];

  constructor(private _config: DeepRequired<PhysicsConfig>) {
    this._dynamicCollisionTree = new DynamicTree<Collider>(_config.dynamicTree);
  }

  public getColliders(): readonly Collider[] {
    return this._colliders;
  }

  public query(point: Vector): Collider[];
  public query(bounds: BoundingBox): Collider[];
  public query(pointOrBounds: Vector | BoundingBox): Collider[] {
    const results: Collider[] = [];
    if (pointOrBounds instanceof BoundingBox) {
      this._dynamicCollisionTree.query(
        {
          id: createId('collider', -1),
          owner: null,
          bounds: pointOrBounds
        } as Collider,
        (other) => {
          results.push(other);
          return false;
        }
      );
    } else {
      this._dynamicCollisionTree.query(
        {
          id: createId('collider', -1),
          owner: null,
          bounds: new BoundingBox(pointOrBounds.x, pointOrBounds.y, pointOrBounds.x, pointOrBounds.y)
        } as Collider,
        (other) => {
          results.push(other);
          return false;
        }
      );
    }
    return results;
  }

  public rayCast(ray: Ray, options?: RayCastOptions): RayCastHit[] {
    const results: RayCastHit[] = [];
    const maxDistance = options?.maxDistance ?? Infinity;
    const collisionGroup = options?.collisionGroup;
    const collisionMask = !collisionGroup ? options?.collisionMask ?? CollisionGroup.All.category : collisionGroup.category;
    const searchAllColliders = options?.searchAllColliders ?? false;
    this._dynamicCollisionTree.rayCastQuery(ray, maxDistance, (collider) => {
      const owner = collider.owner;
      const maybeBody = owner.get(BodyComponent);

      if (options?.ignoreCollisionGroupAll && maybeBody.group === CollisionGroup.All) {
        return false;
      }

      const canCollide = (collisionMask & maybeBody.group.category) !== 0;

      // Early exit if not the right group
      if (maybeBody?.group && !canCollide) {
        return false;
      }

      const hit = collider.rayCast(ray, maxDistance);

      if (hit) {
        if (options?.filter) {
          if (options.filter(hit)) {
            results.push(hit);
            if (!searchAllColliders) {
              // returning true exits the search
              return true;
            }
          }
        } else {
          results.push(hit);
          if (!searchAllColliders) {
            // returning true exits the search
            return true;
          }
        }
      }
      return false;
    });
    return results;
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
  public broadphase(targets: Collider[], elapsed: number, stats?: FrameStats): Pair[] {
    const seconds = elapsed / 1000;

    // Retrieve the list of potential colliders, exclude killed, prevented, and self
    const potentialColliders = targets.filter((other) => {
      const body = other.owner?.get(BodyComponent);
      return other.owner?.isActive && body.collisionType !== CollisionType.PreventCollision;
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
    if (this._config.continuous.checkForFastBodies) {
      for (const collider of potentialColliders) {
        const body = collider.owner.get(BodyComponent);
        // Skip non-active objects. Does not make sense on other collision types
        if (body.collisionType !== CollisionType.Active) {
          continue;
        }

        // Maximum travel distance next frame
        const updateDistance =
          body.vel.magnitude * seconds + // velocity term
          body.acc.magnitude * 0.5 * seconds * seconds; // acc term

        // Find the minimum dimension
        const minDimension = Math.min(collider.bounds.height, collider.bounds.width);
        if (this._config.continuous.disableMinimumSpeedForFastBody || updateDistance > minDimension / 2) {
          if (stats) {
            stats.physics.fastBodies++;
          }

          // start with the oldPos because the integration for actors has already happened
          // objects resting on a surface may be slightly penetrating in the current position
          const updateVec = body.globalPos.sub(body.oldPos);
          const centerPoint = collider.center;
          const furthestPoint = collider.getFurthestPoint(body.vel);
          const origin: Vector = furthestPoint.sub(updateVec);

          const ray: Ray = new Ray(origin, body.vel);

          // back the ray up by -2x surfaceEpsilon to account for fast moving objects starting on the surface
          ray.pos = ray.pos.add(ray.dir.scale(-2 * this._config.continuous.surfaceEpsilon));
          let minCollider: Collider;
          let minTranslate: Vector = new Vector(Infinity, Infinity);
          this._dynamicCollisionTree.rayCastQuery(ray, updateDistance + this._config.continuous.surfaceEpsilon * 2, (other: Collider) => {
            if (!this._pairExists(collider, other) && Pair.canCollide(collider, other)) {
              const hit = other.rayCast(ray, updateDistance + this._config.continuous.surfaceEpsilon * 10);
              if (hit) {
                const translate = hit.point.sub(origin);
                if (translate.magnitude < minTranslate.magnitude) {
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
            body.globalPos = origin
              .add(shift)
              .add(minTranslate)
              .add(ray.dir.scale(10 * this._config.continuous.surfaceEpsilon)); // needed to push the shape slightly into contact
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
