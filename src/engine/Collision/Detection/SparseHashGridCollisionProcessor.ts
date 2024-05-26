import { FrameStats } from '../../Debug/DebugConfig';
import { Entity } from '../../EntityComponentSystem';
import { ExcaliburGraphicsContext } from '../../Graphics/Context/ExcaliburGraphicsContext';
import { createId } from '../../Id';
import { Ray } from '../../Math/ray';
import { vec } from '../../Math/vector';
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

export class HashGridCell {
  colliders: HashColliderProxy[] = []; // TODO would a linked list be faster?
  key: string;
  x: number;
  y: number;

  configure(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.key = HashGridCell.calculateHashKey(x, y);
  }

  static calculateHashKey(x: number, y: number) {
    return `${x}+${y}`;
  }
}

export class HashColliderProxy {
  id: number = -1;
  owner: Entity;
  body: BodyComponent;
  collisionType: CollisionType;
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
  cells: HashGridCell[] = [];
  /**
   * Grid size in pixels
   */
  readonly gridSize: number;
  constructor(
    public collider: Collider,
    gridSize: number
  ) {
    this.gridSize = gridSize;
    const bounds = collider.bounds;
    this.leftX = Math.floor(bounds.left / this.gridSize);
    this.rightX = Math.floor(bounds.right / this.gridSize);
    this.bottomY = Math.floor(bounds.bottom / this.gridSize);
    this.topY = Math.floor(bounds.top / this.gridSize);
    this.owner = collider.owner;
    this.body = this.owner?.get(BodyComponent);
    this.collisionType = this.body.collisionType ?? CollisionType.PreventCollision;
  }

  /**
   * Has the hashed bounds changed
   */
  hasChanged(): boolean {
    const bounds = this.collider.bounds;
    const leftX = Math.floor(bounds.left / this.gridSize);
    const rightX = Math.floor(bounds.right / this.gridSize);
    const bottomY = Math.floor(bounds.bottom / this.gridSize);
    const topY = Math.floor(bounds.top / this.gridSize);
    if (this.leftX !== leftX || this.rightX !== rightX || this.bottomY !== bottomY || this.topY !== topY) {
      return true;
    }
    return false;
  }

  /**
   * New minus old coordinate
   */
  changedBounds(): [left: number, right: number, bottom: number, top: number] {
    const bounds = this.collider.bounds;
    const leftX = Math.floor(bounds.left / this.gridSize);
    const rightX = Math.floor(bounds.right / this.gridSize);
    const bottomY = Math.floor(bounds.bottom / this.gridSize);
    const topY = Math.floor(bounds.top / this.gridSize);
    return [leftX - this.leftX, rightX - this.rightX, bottomY - this.bottomY, topY - this.topY];
  }

  /**
   * Clears all collider references
   */
  clear(): void {
    for (const cell of this.cells) {
      const index = cell.colliders.indexOf(this);
      if (index > -1) {
        cell.colliders.splice(index, 1);
      }
      // TODO reclaim cell in pool if empty?
    }
  }

  /**
   * Updates the hashed bounds coordinates
   */
  update(): void {
    const bounds = this.collider.bounds;

    // const oldLeftX = this.leftX;
    // const oldRightX = this.rightX;
    // const oldBottomY = this.bottomY;
    // const oldTopY = this.topY;

    this.leftX = Math.floor(bounds.left / this.gridSize);
    this.rightX = Math.floor(bounds.right / this.gridSize);
    this.bottomY = Math.floor(bounds.bottom / this.gridSize);
    this.topY = Math.floor(bounds.top / this.gridSize);
    this.body = this.owner?.get(BodyComponent);
    this.collisionType = this.body.collisionType ?? CollisionType.PreventCollision;

    // TODO only update cells that have changed
    // cases up/down/left/right
  }
}

export class SparseHashGridCollisionProcessor implements CollisionProcessor {
  readonly gridSize: number;
  readonly sparseHashGrid: Map<string, HashGridCell>;
  readonly colliderToProxy: Map<Collider, HashColliderProxy>;

  public bounds = new BoundingBox();

  private _pairs = new Set<string>();
  private _nonPairs = new Set<string>();

  private _hashGridCellPool = new Pool<HashGridCell>(
    () => new HashGridCell(),
    (instance) => {
      instance.configure(0, 0);
      instance.colliders.length = 0;
      return instance;
    },
    1000
  );

  public _pairPool = new Pool<Pair>(
    () => new Pair({ id: createId('collider', 0) } as Collider, { id: createId('collider', 0) } as Collider),
    (instance) => {
      instance.colliderA = null;
      instance.colliderB = null;
      return instance;
    },
    200
  );

  constructor() {
    this.gridSize = 35; // TODO configurable grid size
    this.sparseHashGrid = new Map<string, HashGridCell>();
    this.colliderToProxy = new Map<Collider, HashColliderProxy>();

    // TODO dynamic grid size potentially larger than the largest collider
  }

  getColliders(): readonly Collider[] {
    return Array.from(this.colliderToProxy.keys());
  }

  query(bounds: BoundingBox): Collider[] {
    const leftX = Math.floor(bounds.left / this.gridSize);
    const rightX = Math.floor(bounds.right / this.gridSize);
    const bottomY = Math.floor(bounds.bottom / this.gridSize);
    const topY = Math.floor(bounds.top / this.gridSize);
    let results: Collider[] = [];
    for (let x = leftX; x <= rightX; x++) {
      for (let y = topY; y <= bottomY; y++) {
        const key = HashGridCell.calculateHashKey(x, y);
        // Hash collider into appropriate cell
        const cell = this.sparseHashGrid.get(key);
        if (cell) {
          results = results.concat(Array.from(cell.colliders).map((c) => c.collider));
        }
      }
    }

    return results;
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

    // TODO walk the ray
    // TODO check colliders in cell
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
    let maxIterations = 800;
    while (!done && maxIterations > 0) {
      maxIterations--; // safety exit

      // Test colliders at cell
      const key = HashGridCell.calculateHashKey(currentXCoord, currentYCoord);
      // TODO exit if exhausted max hash grid coordinate, bounds of the sparse grid?
      const cell = this.sparseHashGrid.get(key);
      if (cell) {
        for (let colliderIndex = 0; colliderIndex < cell.colliders.length; colliderIndex++) {
          const collider = cell.colliders[colliderIndex];
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

            if (hit) {
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

    return results;
  }

  private _insert(x: number, y: number, proxy: HashColliderProxy) {
    const key = HashGridCell.calculateHashKey(x, y);
    // Hash collider into appropriate cell
    let cell = this.sparseHashGrid.get(key);
    if (!cell) {
      // TODO no reclaim on the grid cell pool
      cell = this._hashGridCellPool.get();
      cell.configure(x, y);
      this.sparseHashGrid.set(cell.key, cell);
    }
    cell.colliders.push(proxy);
    proxy.cells.push(cell); // TODO dupes, doesn't seem to be a problem
  }

  private _remove(x: number, y: number, proxy: HashColliderProxy) {
    const key = HashGridCell.calculateHashKey(x, y);
    // Hash collider into appropriate cell
    const cell = this.sparseHashGrid.get(key);
    if (cell) {
      const colliderIndex = cell.colliders.indexOf(proxy);
      if (colliderIndex > -1) {
        cell.colliders.splice(colliderIndex, 1);
      }
      const cellIndex = proxy.cells.indexOf(cell);
      if (cellIndex > -1) {
        proxy.cells.splice(cellIndex, 1);
      }
    }
  }

  track(target: Collider) {
    let colliders = [target];
    if (target instanceof CompositeCollider) {
      const compColliders = target.getColliders();
      for (const c of compColliders) {
        c.owner = target.owner;
      }
      colliders = compColliders;
    }

    for (const target of colliders) {
      const proxy = new HashColliderProxy(target, this.gridSize);
      this.colliderToProxy.set(target, proxy);

      if (proxy.collisionType === CollisionType.PreventCollision) {
        continue;
      }
      for (let x = proxy.leftX; x <= proxy.rightX; x++) {
        for (let y = proxy.topY; y <= proxy.bottomY; y++) {
          this._insert(x, y, proxy);
        }
      }
    }
  }

  untrack(target: Collider) {
    let colliders = [target];
    if (target instanceof CompositeCollider) {
      colliders = target.getColliders();
    }

    for (const target of colliders) {
      const proxy = this.colliderToProxy.get(target);
      if (proxy) {
        proxy.clear();
        this.colliderToProxy.delete(target);
      }
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
    if (colliderA.collider.localBounds.hasZeroDimensions() || colliderB.collider.localBounds.hasZeroDimensions()) {
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
    if (!colliderA.owner.active || !colliderB.owner.active) {
      return false;
    }

    return true;
  }

  broadphase(targets: Collider[], delta: number): Pair[] {
    const pairs: Pair[] = [];
    this._pairs.clear();
    this._nonPairs.clear();

    let proxyId = 0;
    for (const proxy of this.colliderToProxy.values()) {
      proxy.id = proxyId++; // track proxies we've already processed
      if (!proxy.owner.active || proxy.collisionType === CollisionType.PreventCollision) {
        continue;
      }
      // for every cell proxy collider is member of
      for (let cellIndex = 0; cellIndex < proxy.cells.length; cellIndex++) {
        const cell = proxy.cells[cellIndex];
        // TODO Can we skip any cells or make this iteration faster?
        // maybe a linked list here
        for (let otherIndex = 0; otherIndex < cell.colliders.length; otherIndex++) {
          const other = cell.colliders[otherIndex];
          if (other.id <= proxy.id) {
            // skip duplicates already processed
            // continue; // TODO this seems flawed breaking tests?
          }
          const id = Pair.calculatePairHash(proxy.collider.id, other.collider.id);
          if (this._nonPairs.has(id)) {
            continue; // Is there a way we can re-use the non-pair cache
          }
          if (!this._pairs.has(id) && this._canCollide(proxy, other)) {
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
    // console.log("pairs:", pairs.length);
    return pairs;
  }
  narrowphase(pairs: Pair[], stats?: FrameStats): CollisionContact[] {
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
    this._pairPool.done();
    if (stats) {
      stats.physics.collisions += contacts.length;
    }
    // console.log("contacts:", contacts.length);
    return contacts; // TODO maybe we can re-use contacts as likely pairs next frame
  }

  /**
   * Perform data structure maintenance
   */
  update(targets: Collider[], delta: number): number {
    let updated = 0;
    for (const target of targets) {
      const proxy = this.colliderToProxy.get(target);
      if (!proxy) {
        continue;
      }
      if (proxy.hasChanged()) {
        // TODO slightly wasteful only remove from changed
        for (let x = proxy.leftX; x <= proxy.rightX; x++) {
          for (let y = proxy.topY; y <= proxy.bottomY; y++) {
            this._remove(x, y, proxy);
          }
        }
        proxy.update();
        for (let x = proxy.leftX; x <= proxy.rightX; x++) {
          for (let y = proxy.topY; y <= proxy.bottomY; y++) {
            this._insert(x, y, proxy);
          }
        }
        updated++;
      }
    }
    return updated;
  }

  debug(ex: ExcaliburGraphicsContext, delta: number): void {
    // TODO
  }
}
