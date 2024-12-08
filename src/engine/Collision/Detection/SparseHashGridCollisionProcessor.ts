import { FrameStats } from '../../Debug/DebugConfig';
import { Entity } from '../../EntityComponentSystem';
import { ExcaliburGraphicsContext } from '../../Graphics/Context/ExcaliburGraphicsContext';
import { createId } from '../../Id';
import { Ray } from '../../Math/ray';
import { Vector, vec } from '../../Math/vector';
import { Pool } from '../../Util/Pool';
import { BodyComponent } from '../BodyComponent';
import { BoundingBox } from '../BoundingBox';
import { Collider } from '../Colliders/Collider';
import { CompositeCollider } from '../Colliders/CompositeCollider';
import { CollisionType } from '../CollisionType';
import { CollisionGroup } from '../Group/CollisionGroup';
import { CollisionContact } from './CollisionContact';
import { CollisionProcessor } from './CollisionProcessor';
import { Pair } from './Pair';
import { RayCastHit } from './RayCastHit';
import { RayCastOptions } from './RayCastOptions';
import { HashGridCell, HashGridProxy, SparseHashGrid } from './SparseHashGrid';

/**
 * Proxy type to stash collision info
 */
export class HashColliderProxy extends HashGridProxy<Collider> {
  id: number = -1;
  owner: Entity;
  body: BodyComponent;
  collisionType: CollisionType;
  hasZeroBounds = false;
  /**
   * left bounds x hash coordinate
   */
  leftX: number;
  /**
   * right bounds x hash coordinate
   */
  rightX: number;
  /**
   * bottom bounds y hash coordinate
   */
  bottomY: number;
  /**
   * top bounds y hash coordinate
   */
  topY: number;
  /**
   * References to the hash cell the collider is a current member of
   */
  cells: HashGridCell<Collider, HashColliderProxy>[] = [];
  /**
   * Grid size in pixels
   */
  readonly gridSize: number;
  constructor(
    public collider: Collider,
    gridSize: number
  ) {
    super(collider, gridSize);
    this.gridSize = gridSize;
    const bounds = collider.bounds;
    this.hasZeroBounds = bounds.hasZeroDimensions();
    this.leftX = Math.floor(bounds.left / this.gridSize);
    this.rightX = Math.floor(bounds.right / this.gridSize);
    this.bottomY = Math.floor(bounds.bottom / this.gridSize);
    this.topY = Math.floor(bounds.top / this.gridSize);
    this.owner = collider.owner;
    this.body = this.owner?.get(BodyComponent);
    this.collisionType = this.body.collisionType ?? CollisionType.PreventCollision;
  }

  /**
   * Updates the hashed bounds coordinates
   */
  update(): void {
    super.update();
    this.body = this.owner?.get(BodyComponent);
    this.collisionType = this.body.collisionType ?? CollisionType.PreventCollision;
    this.hasZeroBounds = this.collider.localBounds.hasZeroDimensions();
  }
}

/**
 * This collision processor uses a sparsely populated grid of uniform cells to bucket potential
 * colliders together for the purpose of detecting collision pairs and collisions.
 */
export class SparseHashGridCollisionProcessor implements CollisionProcessor {
  readonly gridSize: number;
  readonly hashGrid: SparseHashGrid<Collider, HashColliderProxy>;

  private _pairs = new Set<string>();
  private _nonPairs = new Set<string>();

  public _pairPool = new Pool<Pair>(
    () => new Pair({ id: createId('collider', 0) } as Collider, { id: createId('collider', 0) } as Collider),
    (instance) => {
      instance.colliderA = null;
      instance.colliderB = null;
      return instance;
    },
    200
  );

  constructor(options: { size: number }) {
    this.gridSize = options.size;
    this.hashGrid = new SparseHashGrid<Collider, HashColliderProxy>({
      size: this.gridSize,
      proxyFactory: (collider, size) => new HashColliderProxy(collider, size)
    });
    this._pairPool.disableWarnings = true;

    // TODO dynamic grid size potentially larger than the largest collider
    // TODO Re-hash the objects if the median proves to be different
  }

  getColliders(): readonly Collider[] {
    return Array.from(this.hashGrid.objectToProxy.keys());
  }

  query(point: Vector): Collider[];
  query(bound: BoundingBox): Collider[];
  query(boundsOrPoint: Vector | BoundingBox): Collider[] {
    // FIXME workaround TS: https://github.com/microsoft/TypeScript/issues/14107
    return this.hashGrid.query(boundsOrPoint as any);
  }

  rayCast(ray: Ray, options?: RayCastOptions): RayCastHit[] {
    // DDA raycast algo
    const results: RayCastHit[] = [];
    const maxDistance = options?.maxDistance ?? Infinity;
    const collisionGroup = options?.collisionGroup;
    const collisionMask = !collisionGroup ? options?.collisionMask ?? CollisionGroup.All.category : collisionGroup.category;
    const searchAllColliders = options?.searchAllColliders ?? false;

    const unitRay = ray.dir.normalize();

    const dydx = unitRay.y / unitRay.x;
    const dxdy = unitRay.x / unitRay.y;

    const unitStepX = Math.sqrt(1 + dydx * dydx) * this.gridSize;
    const unitStepY = Math.sqrt(1 + dxdy * dxdy) * this.gridSize;

    const startXCoord = ray.pos.x / this.gridSize;
    const startYCoord = ray.pos.y / this.gridSize;

    const stepDir = vec(1, 1);

    let currentXCoord = ~~startXCoord;
    let currentYCoord = ~~startYCoord;
    let currentRayLengthX = 0;
    let currentRayLengthY = 0;

    if (unitRay.x < 0) {
      stepDir.x = -1;
      currentRayLengthX = (startXCoord - currentXCoord) * unitStepX;
    } else {
      stepDir.x = 1;
      currentRayLengthX = (currentXCoord + 1 - startXCoord) * unitStepX;
    }

    if (unitRay.y < 0) {
      stepDir.y = -1;
      currentRayLengthY = (startYCoord - currentYCoord) * unitStepY;
    } else {
      stepDir.y = 1;
      currentRayLengthY = (currentYCoord + 1 - startYCoord) * unitStepY;
    }

    const collidersVisited = new Set<number>();

    let done = false;
    let maxIterations = 9999;
    while (!done && maxIterations > 0) {
      maxIterations--; // safety exit
      // exit if exhausted max hash grid coordinate, bounds of the sparse grid
      if (!this.hashGrid.bounds.contains(vec(currentXCoord * this.gridSize, currentYCoord * this.gridSize))) {
        break;
      }
      // Test colliders at cell
      const key = HashGridCell.calculateHashKey(currentXCoord, currentYCoord);
      const cell = this.hashGrid.sparseHashGrid.get(key);
      if (cell) {
        const cellHits: RayCastHit[] = [];
        for (let colliderIndex = 0; colliderIndex < cell.proxies.length; colliderIndex++) {
          const collider = cell.proxies[colliderIndex];
          if (!collidersVisited.has(collider.collider.id.value)) {
            collidersVisited.add(collider.collider.id.value);

            if (options?.ignoreCollisionGroupAll && collider.body.group === CollisionGroup.All) {
              continue;
            }

            const canCollide = (collisionMask & collider.body.group.category) !== 0;

            // Early exit if not the right group
            if (collider.body.group && !canCollide) {
              continue;
            }

            const hit = collider.collider.rayCast(ray, maxDistance);

            // Collect up all the colliders that hit inside a cell
            // they can be in any order so we need to sort them next
            if (hit) {
              cellHits.push(hit);
            }
          }
        }
        cellHits.sort((hit1, hit2) => hit1.distance - hit2.distance);
        for (let i = 0; i < cellHits.length; i++) {
          const hit = cellHits[i];
          if (options?.filter) {
            if (options.filter(hit)) {
              results.push(hit);
              if (!searchAllColliders) {
                done = true;
                break;
              }
            }
          } else {
            results.push(hit);
            if (!searchAllColliders) {
              done = true;
              break;
            }
          }
        }
      }

      if (currentRayLengthX < currentRayLengthY) {
        currentXCoord += stepDir.x;
        currentRayLengthX += unitStepX;
      } else {
        currentYCoord += stepDir.y;
        currentRayLengthY += unitStepY;
      }
    }

    // Sort by distance
    results.sort((hit1, hit2) => hit1.distance - hit2.distance);
    if (!searchAllColliders && results.length) {
      return [results[0]];
    }
    return results;
  }

  /**
   * Adds the collider to the internal data structure for collision tracking
   * @param target
   */
  track(target: Collider): void {
    let colliders = [target];
    if (target instanceof CompositeCollider) {
      const compColliders = target.getColliders();
      for (const c of compColliders) {
        c.owner = target.owner;
      }
      colliders = compColliders;
    }

    for (const target of colliders) {
      this.hashGrid.track(target);
    }
  }

  /**
   * Removes a collider from the internal data structure for tracking collisions
   * @param target
   */
  untrack(target: Collider): void {
    let colliders = [target];
    if (target instanceof CompositeCollider) {
      colliders = target.getColliders();
    }

    for (const target of colliders) {
      this.hashGrid.untrack(target);
    }
  }

  private _canCollide(colliderA: HashColliderProxy, colliderB: HashColliderProxy) {
    // Prevent self collision
    if (colliderA.collider.id === colliderB.collider.id) {
      return false;
    }

    // Colliders with the same owner do not collide (composite colliders)
    if (colliderA.owner && colliderB.owner && colliderA.owner.id === colliderB.owner.id) {
      return false;
    }

    // if the pair has a member with zero dimension don't collide
    if (colliderA.hasZeroBounds || colliderB.hasZeroBounds) {
      return false;
    }

    // If both are in the same collision group short circuit
    if (!colliderA.body.group.canCollide(colliderB.body.group)) {
      return false;
    }

    // if both are fixed short circuit
    if (colliderA.collisionType === CollisionType.Fixed && colliderB.collisionType === CollisionType.Fixed) {
      return false;
    }

    // if the either is prevent collision short circuit
    if (colliderA.collisionType === CollisionType.PreventCollision || colliderB.collisionType === CollisionType.PreventCollision) {
      return false;
    }

    // if either is dead short circuit
    if (!colliderA.owner.isActive || !colliderB.owner.isActive) {
      return false;
    }

    return true;
  }

  /**
   * Runs the broadphase sweep over tracked colliders and returns possible collision pairs
   * @param targets
   * @param elapsed
   */
  broadphase(targets: Collider[], elapsed: number): Pair[] {
    const pairs: Pair[] = [];
    this._pairs.clear();
    this._nonPairs.clear();

    let proxyId = 0;
    for (const proxy of this.hashGrid.objectToProxy.values()) {
      proxy.id = proxyId++; // track proxies we've already processed
      if (!proxy.owner.isActive || proxy.collisionType === CollisionType.PreventCollision) {
        continue;
      }
      // for every cell proxy collider is member of
      for (let cellIndex = 0; cellIndex < proxy.cells.length; cellIndex++) {
        const cell = proxy.cells[cellIndex];
        // TODO Can we skip any cells or make this iteration faster?
        // maybe a linked list here
        for (let otherIndex = 0; otherIndex < cell.proxies.length; otherIndex++) {
          const other = cell.proxies[otherIndex];
          if (other.id === proxy.id) {
            // skip duplicates
            continue;
          }
          const id = Pair.calculatePairHash(proxy.collider.id, other.collider.id);
          if (this._nonPairs.has(id)) {
            continue; // Is there a way we can re-use the non-pair cache
          }
          if (!this._pairs.has(id) && this._canCollide(proxy, other) && proxy.object.bounds.overlaps(other.object.bounds)) {
            const pair = this._pairPool.get();
            pair.colliderA = proxy.collider;
            pair.colliderB = other.collider;
            pair.id = id;
            this._pairs.add(id);
            pairs.push(pair);
          } else {
            this._nonPairs.add(id);
          }
        }
      }
    }
    return pairs;
  }

  /**
   * Runs a fine grain pass on collision pairs and does geometry intersection tests producing any contacts
   * @param pairs
   * @param stats
   */
  narrowphase(pairs: Pair[], stats?: FrameStats): CollisionContact[] {
    const contacts: CollisionContact[] = [];
    for (let i = 0; i < pairs.length; i++) {
      const newContacts = pairs[i].collide();
      for (let j = 0; j < newContacts.length; j++) {
        const c = newContacts[j];
        contacts.push(c);
        if (stats) {
          stats.physics.contacts.set(c.id, c);
        }
      }
    }
    this._pairPool.done();
    if (stats) {
      stats.physics.collisions += contacts.length;
    }
    return contacts; // TODO maybe we can re-use contacts as likely pairs next frame
  }

  /**
   * Perform data structure maintenance, returns number of colliders updated
   */
  update(targets: Collider[], elapsed: number): number {
    return this.hashGrid.update(targets);
  }

  /**
   * Draws the internal data structure
   * @param ex
   * @param elapsed
   */
  debug(ex: ExcaliburGraphicsContext, elapsed: number): void {
    this.hashGrid.debug(ex, elapsed);
  }
}
