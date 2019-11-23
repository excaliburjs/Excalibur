import { Physics } from './../Physics';
import { CollisionBroadphase } from './CollisionResolver';
import { DynamicTree } from './DynamicTree';
import { Pair } from './Pair';
import { Body } from './Body';

import { Vector, Ray } from '../Algebra';
import { FrameStats } from '../Debug';
import { CollisionResolutionStrategy } from '../Physics';
import { Logger } from '../Util/Log';
import { CollisionStartEvent, CollisionEndEvent } from '../Events';
import { CollisionType } from './CollisionType';
import { Collider } from './Collider';

export class DynamicTreeCollisionBroadphase implements CollisionBroadphase {
  private _dynamicCollisionTree = new DynamicTree();
  private _collisionHash: { [key: string]: boolean } = {};
  private _collisionPairCache: Pair[] = [];
  private _lastFramePairs: Pair[] = [];
  private _lastFramePairsHash: { [pairId: string]: Pair } = {};

  /**
   * Tracks a physics body for collisions
   */
  public track(target: Body): void {
    if (!target) {
      Logger.getInstance().warn('Cannot track null physics body');
      return;
    }
    this._dynamicCollisionTree.trackBody(target);
  }

  /**
   * Untracks a physics body
   */
  public untrack(target: Body): void {
    if (!target) {
      Logger.getInstance().warn('Cannot untrack a null physics body');
      return;
    }
    this._dynamicCollisionTree.untrackBody(target);
  }

  private _shouldGenerateCollisionPair(colliderA: Collider, colliderB: Collider) {
    // if the collision pair has been calculated already short circuit
    const hash = Pair.calculatePairHash(colliderA, colliderB);
    if (this._collisionHash[hash]) {
      return false; // pair exists easy exit return false
    }

    return Pair.canCollide(colliderA, colliderB);
  }

  /**
   * Detects potential collision pairs in a broadphase approach with the dynamic aabb tree strategy
   */
  public broadphase(targets: Body[], delta: number, stats?: FrameStats): Pair[] {
    const seconds = delta / 1000;

    // Retrieve the list of potential colliders, exclude killed, prevented, and self
    const potentialColliders = targets
      .map((t) => t.collider)
      .filter((other) => {
        return other.active && other.type !== CollisionType.PreventCollision;
      });

    // clear old list of collision pairs
    this._collisionPairCache = [];
    this._collisionHash = {};

    // check for normal collision pairs
    let collider: Collider;
    for (let j = 0, l = potentialColliders.length; j < l; j++) {
      collider = potentialColliders[j];

      // Query the collision tree for potential colliders
      this._dynamicCollisionTree.query(collider.body, (other: Body) => {
        if (this._shouldGenerateCollisionPair(collider, other.collider)) {
          const pair = new Pair(collider, other.collider);
          this._collisionHash[pair.id] = true;
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
        if (collider.type !== CollisionType.Active) {
          continue;
        }

        // Maximum travel distance next frame
        const updateDistance =
          collider.body.vel.magnitude() * seconds + // velocity term
          collider.body.acc.magnitude() * 0.5 * seconds * seconds; // acc term

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
          let minBody: Body;
          let minTranslate: Vector = new Vector(Infinity, Infinity);
          this._dynamicCollisionTree.rayCastQuery(ray, updateDistance + Physics.surfaceEpsilon * 2, (other: Body) => {
            if (collider.body !== other && other.collider.shape && Pair.canCollide(collider, other.collider)) {
              const hitPoint = other.collider.shape.rayCast(ray, updateDistance + Physics.surfaceEpsilon * 10);
              if (hitPoint) {
                const translate = hitPoint.sub(origin);
                if (translate.magnitude() < minTranslate.magnitude()) {
                  minTranslate = translate;
                  minBody = other;
                }
              }
            }
            return false;
          });

          if (minBody && Vector.isValid(minTranslate)) {
            const pair = new Pair(collider, minBody.collider);
            if (!this._collisionHash[pair.id]) {
              this._collisionHash[pair.id] = true;
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

  /**
   * Applies narrow phase on collision pairs to find actual area intersections
   * Adds actual colliding pairs to stats' Frame data
   */
  public narrowphase(pairs: Pair[], stats?: FrameStats): Pair[] {
    for (let i = 0; i < pairs.length; i++) {
      pairs[i].collide();
      if (stats && pairs[i].collision) {
        stats.physics.collisions++;
        stats.physics.collidersHash[pairs[i].id] = pairs[i];
      }
    }
    return pairs.filter((p) => p.collision);
  }

  /**
   * Perform collision resolution given a strategy (rigid body or box) and move objects out of intersect.
   */
  public resolve(pairs: Pair[], delta: number, strategy: CollisionResolutionStrategy): Pair[] {
    for (const pair of pairs) {
      pair.resolve(strategy);

      if (pair.collision) {
        pair.colliderA.body.applyMtv();
        pair.colliderB.body.applyMtv();
        // todo still don't like this, this is a small integration step to resolve narrowphase collisions
        pair.colliderA.body.integrate(delta * Physics.collisionShift);
        pair.colliderB.body.integrate(delta * Physics.collisionShift);
      }
    }

    return pairs.filter((p) => p.canCollide);
  }

  public runCollisionStartEnd(pairs: Pair[]) {
    const currentFrameHash: { [pairId: string]: Pair } = {};

    for (const p of pairs) {
      // load currentFrameHash
      currentFrameHash[p.id] = p;

      // find all new collisions
      if (!this._lastFramePairsHash[p.id]) {
        const actor1 = p.colliderA;
        const actor2 = p.colliderB;
        actor1.emit('collisionstart', new CollisionStartEvent(actor1, actor2, p));
        actor2.emit('collisionstart', new CollisionStartEvent(actor2, actor1, p));
      }
    }

    // find all old collisions
    for (const p of this._lastFramePairs) {
      if (!currentFrameHash[p.id]) {
        const actor1 = p.colliderA;
        const actor2 = p.colliderB;
        actor1.emit('collisionend', new CollisionEndEvent(actor1, actor2));
        actor2.emit('collisionend', new CollisionEndEvent(actor2, actor1));
      }
    }

    // reset the last frame cache
    this._lastFramePairs = pairs;
    this._lastFramePairsHash = currentFrameHash;
  }

  /**
   * Update the dynamic tree positions
   */
  public update(targets: Body[]): number {
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
      for (const pair of this._collisionPairCache) {
        pair.debugDraw(ctx);
      }
    }
  }
}
