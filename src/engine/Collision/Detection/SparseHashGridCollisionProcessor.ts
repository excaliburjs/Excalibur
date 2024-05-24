import { ExcaliburGraphicsContext } from '../../Graphics/Context/ExcaliburGraphicsContext';
import { Ray } from '../../Math/ray';
import { BoundingBox } from '../BoundingBox';
import { Collider } from '../Colliders/Collider';
import { CollisionContact } from './CollisionContact';
import { CollisionProcessor } from './CollisionProcessor';
import { Pair } from './Pair';
import { RayCastHit } from './RayCastHit';
import { RayCastOptions } from './RayCastOptions';

export class HashGridCell {
  colliders = new Set<Collider>();
  readonly key: string;
  constructor(x: number, y: number) {
    this.key = HashGridCell.calculateHashKey(x, y);
  }

  static calculateHashKey(x: number, y: number) {
    return `${x}+${y}`;
  }
}

export class HashColliderProxy {
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
  }
}

export class SparseHashGridCollisionProcessor implements CollisionProcessor {
  readonly gridSize: number;
  readonly sparseHashGrid: Map<string, HashGridCell>;
  readonly colliderToProxy: Map<Collider, HashColliderProxy>;
  constructor(options: { gridSize: number }) {
    const { gridSize } = options;
    this.gridSize = gridSize;
    this.sparseHashGrid = new Map<string, HashGridCell>();
    this.colliderToProxy = new Map<Collider, HashColliderProxy>();
  }

  query(bounds: BoundingBox): Collider[] {
    const leftX = Math.floor(bounds.left / this.gridSize);
    const rightX = Math.floor(bounds.right / this.gridSize);
    const bottomY = Math.floor(bounds.bottom / this.gridSize);
    const topY = Math.floor(bounds.top / this.gridSize);
    let results: Collider[] = [];
    for (let x = leftX; x < rightX; x++) {
      for (let y = topY; y < bottomY; y++) {
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
      // TODO pool cells
      cell = new HashGridCell(x, y);
      this.sparseHashGrid.set(cell.key, cell);
    }
    cell.colliders.add(proxy.collider);
    proxy.cells.add(cell);
  }

  track(target: Collider) {
    const proxy = new HashColliderProxy(target, this.gridSize);
    this.colliderToProxy.set(target, proxy);

    for (let x = proxy.leftX; x < proxy.rightX; x++) {
      for (let y = proxy.topY; y < proxy.bottomY; y++) {
        this._insert(x, y, proxy);
      }
    }
  }
  untrack(target: Collider) {
    const proxy = this.colliderToProxy.get(target);
    proxy.clear();
    this.colliderToProxy.delete(target);
  }
  broadphase(targets: Collider[], delta: number): Pair[] {
    throw new Error('Method not implemented.');
  }
  narrowphase(pairs: Pair[]): CollisionContact[] {
    throw new Error('Method not implemented.');
  }
  update(targets: Collider[], delta: number): number {
    let updated = 0;
    for (const target of targets) {
      const proxy = this.colliderToProxy.get(target);
      if (proxy?.hasChanged()) {
        proxy.clear();
        proxy.update();
        for (let x = proxy.leftX; x < proxy.rightX; x++) {
          for (let y = proxy.topY; y < proxy.bottomY; y++) {
            this._insert(x, y, proxy);
          }
        }
        updated++;
      }
    }
    return updated;
  }
  debug(ex: ExcaliburGraphicsContext, delta: number): void {
    throw new Error('Method not implemented.');
  }
}
