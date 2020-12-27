import { Physics } from '../Physics';
import { CollisionProcessor } from './CollisionResolver';
import { DynamicTree } from './DynamicTree';
import { Pair } from './Pair';

import { Vector, Ray } from '../Algebra';
import { FrameStats } from '../Debug';
import { Logger } from '../Util/Log';
import { CollisionStartEvent, CollisionEndEvent } from '../Events';
import { CollisionType } from './CollisionType';
import { Collider } from './Collider';
import { CollisionContact } from './CollisionContact';
import { DrawUtil } from '../Util/Index';
import { Color } from '../Drawing/Color';

/**
 * Responsible for performing the collision broadphase (locating potential colllisions) and 
 * the narrowphase (actual collision contacts)
 */
export class DynamicTreeCollisionProcessor implements CollisionProcessor {
  private _dynamicCollisionTree = new DynamicTree<Collider>();
  private _collisions = new Set<string>();

  private _collisionPairCache: Pair[] = [];
  private _lastFramePairs: Pair[] = [];
  private _lastFramePairsHash: { [pairId: string]: Pair } = {};

  /**
   * Tracks a physics body for collisions
   */
  public track(target: Collider): void {
    if (!target) {
      Logger.getInstance().warn('Cannot track null physics body');
      return;
    }
    this._dynamicCollisionTree.trackBody(target);
  }

  /**
   * Untracks a physics body
   */
  public untrack(target: Collider): void {
    if (!target) {
      Logger.getInstance().warn('Cannot untrack a null physics body');
      return;
    }
    this._dynamicCollisionTree.untrackBody(target);
  }

  private _shouldGenerateCollisionPair(colliderA: Collider, colliderB: Collider) {
    // if the collision pair is part of the same fixture that's invalid
    if ((colliderA.owningId !== null && colliderB.owningId !== null) && 
        colliderA.owningId === colliderB.owningId) {
      return false;
    }

    // if the collision pair has been calculated already short circuit
    const hash = Pair.calculatePairHash(colliderA.body, colliderB.body);
    if (this._collisions.has(hash)) {
      return false; // pair exists easy exit return false
    }

    return Pair.canCollide(colliderA.body, colliderB.body);
  }

  /**
   * Detects potential collision pairs in a broadphase approach with the dynamic aabb tree strategy
   */
  public broadphase(targets: Collider[], delta: number, stats?: FrameStats): Pair[] {
    const seconds = delta / 1000;

    // Retrieve the list of potential colliders, exclude killed, prevented, and self
    const potentialColliders = targets
      .filter((other) => {
        return other.body.active && other.body.collisionType !== CollisionType.PreventCollision;
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
          const pair = new Pair(collider.body, other.body);
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
        // Skip non-active objects. Does not make sense on other collision types
        if (collider.body.collisionType !== CollisionType.Active) {
          continue;
        }

        // Maximum travel distance next frame
        const updateDistance =
          collider.body.vel.size * seconds + // velocity term
          collider.body.acc.size * 0.5 * seconds * seconds; // acc term

        // Find the minimum dimension
        const minDimension = Math.min(collider.bounds.height, collider.bounds.width);
        if (Physics.disableMinimumSpeedForFastBody || updateDistance > minDimension / 2) {
          if (stats) {
            stats.physics.fastBodies++;
          }

          // start with the oldPos because the integration for actors has already happened
          // objects resting on a surface may be slightly penetrating in the current position
          const updateVec = collider.body.pos.sub(collider.body.oldPos);
          const centerPoint = collider.shape.center;
          const furthestPoint = collider.shape.getFurthestPoint(collider.body.vel);
          const origin: Vector = furthestPoint.sub(updateVec);

          const ray: Ray = new Ray(origin, collider.body.vel);

          // back the ray up by -2x surfaceEpsilon to account for fast moving objects starting on the surface
          ray.pos = ray.pos.add(ray.dir.scale(-2 * Physics.surfaceEpsilon));
          let minCollider: Collider;
          let minTranslate: Vector = new Vector(Infinity, Infinity);
          this._dynamicCollisionTree.rayCastQuery(ray, updateDistance + Physics.surfaceEpsilon * 2, (other: Collider) => {
            if (collider !== other && other.shape && Pair.canCollide(collider.body, other.body)) {
              const hitPoint = other.shape.rayCast(ray, updateDistance + Physics.surfaceEpsilon * 10);
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
            const pair = new Pair(collider.body, minCollider.body);
            if (!this._collisions.has(pair.id)) {
              this._collisions.add(pair.id);
              this._collisionPairCache.push(pair);
            }
            // move the fast moving object to the other body
            // need to push into the surface by ex.Physics.surfaceEpsilon
            const shift = centerPoint.sub(furthestPoint);
            collider.body.pos = origin
              .add(shift)
              .add(minTranslate)
              .add(ray.dir.scale(2 * Physics.surfaceEpsilon));
            collider.shape.recalc();

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

  private _contacts: CollisionContact[] = [];
  /**
   * Applies narrow phase on collision pairs to find actual area intersections
   * Adds actual colliding pairs to stats' Frame data
   */
  public narrowphase(pairs: Pair[], stats?: FrameStats): CollisionContact[] {
    let contacts: CollisionContact[] = []
    for (let i = 0; i < pairs.length; i++) {
      contacts = contacts.concat(pairs[i].collide());
      if (stats && contacts.length > 0) {
        stats.physics.collidersHash[pairs[i].id] = pairs[i];
      }
    }
    if (stats) {
      stats.physics.collisions+= contacts.length;
    }
    return this._contacts = contacts;
  }

  public runCollisionStartEnd(pairs: Pair[]) {
    const currentFrameHash: { [pairId: string]: Pair } = {};

    for (const p of pairs) {
      // load currentFrameHash
      currentFrameHash[p.id] = p;

      // find all new collisions
      if (!this._lastFramePairsHash[p.id]) {
        const colliderA = p.bodyA;
        const colliderB = p.bodyB;
        colliderA.events.emit('collisionstart', new CollisionStartEvent(colliderA, colliderB, p));
        colliderB.events.emit('collisionstart', new CollisionStartEvent(colliderB, colliderA, p));
      }
    }

    // find all old collisions
    for (const p of this._lastFramePairs) {
      if (!currentFrameHash[p.id]) {
        const colliderA = p.bodyA;
        const colliderB = p.bodyB;
        colliderA.events.emit('collisionend', new CollisionEndEvent(colliderA, colliderB));
        colliderB.events.emit('collisionend', new CollisionEndEvent(colliderB, colliderA));
      }
    }

    // reset the last frame cache
    this._lastFramePairs = pairs;
    this._lastFramePairsHash = currentFrameHash;
  }

  /**
   * Update the dynamic tree positions
   */
  public update(targets: Collider[]): number {
    let updated = 0;
    const len = targets.length;

    for (let i = 0; i < len; i++) {
      if (this._dynamicCollisionTree.updateBody(targets[i])) {
        updated++;
      }
    }
    return updated;
  }

  /* istanbul ignore next */
  public debugDraw(ctx: CanvasRenderingContext2D) {
    if (Physics.broadphaseDebug) {
      this._dynamicCollisionTree.debugDraw(ctx);
    }

    if (Physics.showContacts || Physics.showCollisionNormals) {
      for (const contact of this._contacts) {
        if (Physics.showContacts) {
          DrawUtil.point(ctx, Color.Red, contact.point);
        }
        if (Physics.showCollisionNormals) {
          DrawUtil.vector(ctx, Color.Cyan, contact.point, contact.normal, 30);
        }
      }
    }
  }
}
