import { Physics } from './../Physics';
import { CollisionContact } from './CollisionContact';
import { Pair } from './Pair';
import { Actor, CollisionType } from './../Actor';
import { ICollisionBroadphase } from './ICollisionResolver';
import { CollisionStartEvent, CollisionEndEvent } from '../Events';

export class NaiveCollisionBroadphase implements ICollisionBroadphase {
  private _lastFramePairs: Pair[] = [];
  private _lastFramePairsHash: { [pairId: string]: Pair } = {};

  public track() {
    // pass
  }

  public untrack() {
    // pass
  }

  /**
   * Detects potential collision pairs in a broadphase approach with the dynamic aabb tree strategy
   */
  public broadphase(targets: Actor[]): Pair[] {
    // Retrieve the list of potential colliders, exclude killed, prevented, and self
    var potentialColliders = targets.filter((other) => {
      return !other.isKilled() && other.collisionType !== CollisionType.PreventCollision;
    });

    var actor1: Actor;
    var actor2: Actor;
    var collisionPairs: Pair[] = [];

    for (var j = 0, l = potentialColliders.length; j < l; j++) {
      actor1 = potentialColliders[j];

      for (var i = j + 1; i < l; i++) {
        actor2 = potentialColliders[i];

        var minimumTranslationVector;
        if ((minimumTranslationVector = actor1.collides(actor2))) {
          var pair = new Pair(actor1.body, actor2.body);
          pair.collision = new CollisionContact(
            actor1.collisionArea,
            actor2.collisionArea,
            minimumTranslationVector,
            actor1.pos,
            minimumTranslationVector
          );
          if (
            !collisionPairs.some((cp) => {
              return cp.id === pair.id;
            })
          ) {
            collisionPairs.push(pair);
          }
        }
      }
    }
    return collisionPairs;
  }

  /**
   * Identify actual collisions from those pairs, and calculate collision impulse
   */
  public narrowphase(pairs: Pair[]): Pair[] {
    return pairs;
  }

  public runCollisionStartEnd(pairs: Pair[]) {
    let currentFrameHash: { [pairId: string]: Pair } = {};

    for (let p of pairs) {
      // load currentFrameHash
      currentFrameHash[p.id] = p;

      // find all new collisions
      if (!this._lastFramePairsHash[p.id]) {
        let actor1 = p.bodyA.actor;
        let actor2 = p.bodyB.actor;
        actor1.emit('collisionstart', new CollisionStartEvent(actor1, actor2, p));
        actor2.emit('collisionstart', new CollisionStartEvent(actor2, actor1, p));
      }
    }

    // find all old collisions
    for (let p of this._lastFramePairs) {
      if (!currentFrameHash[p.id]) {
        let actor1 = p.bodyA.actor;
        let actor2 = p.bodyB.actor;
        actor1.emit('collisionend', new CollisionEndEvent(actor1, actor2));
        actor2.emit('collisionend', new CollisionEndEvent(actor2, actor1));
      }
    }

    // reset the last frame cache
    this._lastFramePairs = pairs;
    this._lastFramePairsHash = currentFrameHash;
  }

  /**
   * Resolve the position and velocity of the physics bodies
   */
  public resolve(pairs: Pair[]): Pair[] {
    for (var pair of pairs) {
      pair.resolve(Physics.collisionResolutionStrategy);
    }

    return pairs.filter((p) => p.canCollide);
  }

  public update(): number {
    return 0;
  }

  public debugDraw() {
    return;
  }
}
