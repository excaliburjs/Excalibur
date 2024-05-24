import { FrameStats } from '../../Debug/DebugConfig';
import { Entity } from '../../EntityComponentSystem';
import { ExcaliburGraphicsContext } from '../../Graphics/Context/ExcaliburGraphicsContext';
import { createId } from '../../Id';
import { Ray } from '../../Math/ray';
import { Pool } from '../../Util/Pool';
import { BodyComponent } from '../BodyComponent';
import { BoundingBox } from '../BoundingBox';
import { Collider } from '../Colliders/Collider';
import { CompositeCollider } from '../Colliders/CompositeCollider';
import { CollisionType } from '../CollisionType';
import { CollisionContact } from './CollisionContact';
import { CollisionProcessor } from './CollisionProcessor';
import { Pair } from './Pair';
import { RayCastHit } from './RayCastHit';
import { RayCastOptions } from './RayCastOptions';

export class HashGridCell {
  colliders = new Set<Collider>();
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
  cells = new Set<HashGridCell>();
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
   * Clears all collider references
   */
  clear(): void {
    for (const cell of this.cells) {
      cell.colliders.delete(this.collider);
      if (cell.colliders.size === 0) {
        // TODO reclaim cell in pool
      }
    }
  }

  /**
   * Updates the hashed bounds coordinates
   */
  update(): void {
    const bounds = this.collider.bounds;
    this.leftX = Math.floor(bounds.left / this.gridSize);
    this.rightX = Math.floor(bounds.right / this.gridSize);
    this.bottomY = Math.floor(bounds.bottom / this.gridSize);
    this.topY = Math.floor(bounds.top / this.gridSize);
    this.body = this.owner?.get(BodyComponent);
    this.collisionType = this.body.collisionType ?? CollisionType.PreventCollision;
  }
}

export class SparseHashGridCollisionProcessor implements CollisionProcessor {
  readonly gridSize: number;
  readonly sparseHashGrid: Map<string, HashGridCell>;
  readonly colliderToProxy: Map<Collider, HashColliderProxy>;

  private _pairs = new Set<string>();

  private _hashGridCellPool = new Pool<HashGridCell>(
    () => new HashGridCell(),
    (instance) => {
      instance.configure(0, 0);
      instance.colliders.clear();
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
    this.gridSize = 100; // TODO configurable grid size
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
          results = results.concat(Array.from(cell.colliders));
        }
      }
    }

    return results;
  }

  rayCast(ray: Ray, options?: RayCastOptions): RayCastHit[] {
    // TODO Bresenham incremental raycast
    // https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm
    return [];
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
    cell.colliders.add(proxy.collider);
    proxy.cells.add(cell);
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

  private _pairExists(colliderA: Collider, colliderB: Collider) {
    // if the collision pair has been calculated already short circuit
    const hash = Pair.calculatePairHash(colliderA.id, colliderB.id);
    return this._pairs.has(hash);
  }

  broadphase(targets: Collider[], delta: number): Pair[] {
    const pairs: Pair[] = [];
    this._pairs.clear();
    for (const collider of targets) {
      const proxy = this.colliderToProxy.get(collider);
      if (!proxy) {
        continue;
      }
      if (!proxy.owner.active || proxy.collisionType === CollisionType.PreventCollision) {
        continue;
      }
      for (const cell of proxy.cells) {
        for (const other of cell.colliders) {
          if (!this._pairExists(collider, other) && Pair.canCollide(collider, other)) {
            const pair = this._pairPool.get();
            pair.colliderA = collider;
            pair.colliderB = other;
            pair.id = Pair.calculatePairHash(collider.id, other.id);
            this._pairs.add(pair.id);
            pairs.push(pair);
          }
        }
      }
    }
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
    return contacts;
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
        proxy.clear();
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
