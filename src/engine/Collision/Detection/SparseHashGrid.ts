import { Color } from '../../Color';
import { ExcaliburGraphicsContext } from '../../Graphics/Context/ExcaliburGraphicsContext';
import { Vector, vec } from '../../Math/vector';
import { RentalPool } from '../../Util/RentalPool';
import { BoundingBox } from '../BoundingBox';

export class HashGridProxy<T extends { bounds: BoundingBox }> {
  id: number = -1;
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

  bounds: BoundingBox;

  cells: HashGridCell<T>[] = [];
  hasZeroBounds = false;
  /**
   * Grid size in pixels
   */
  readonly gridSize: number;
  constructor(
    public object: T,
    gridSize: number
  ) {
    this.gridSize = gridSize;
    this.bounds = object.bounds;
    this.hasZeroBounds = this.bounds.hasZeroDimensions();
    this.leftX = Math.floor(this.bounds.left / this.gridSize);
    this.rightX = Math.floor(this.bounds.right / this.gridSize);
    this.bottomY = Math.floor(this.bounds.bottom / this.gridSize);
    this.topY = Math.floor(this.bounds.top / this.gridSize);
  }

  /**
   * Has the hashed bounds changed
   */
  hasChanged(): boolean {
    const bounds = this.object.bounds;
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
      const index = cell.proxies.indexOf(this);
      if (index > -1) {
        cell.proxies.splice(index, 1);
      }
      // TODO reclaim cell in pool if empty?
    }
  }

  /**
   * Update bounds of the proxy
   */
  updateBounds(): void {
    this.bounds = this.object.bounds;
  }

  /**
   * Updates the hashed bounds coordinates
   */
  update(): void {
    this.bounds = this.object.bounds;

    this.leftX = Math.floor(this.bounds.left / this.gridSize);
    this.rightX = Math.floor(this.bounds.right / this.gridSize);
    this.bottomY = Math.floor(this.bounds.bottom / this.gridSize);
    this.topY = Math.floor(this.bounds.top / this.gridSize);
    this.hasZeroBounds = this.object.bounds.hasZeroDimensions();
  }
}

export class HashGridCell<TObject extends { bounds: BoundingBox }, TProxy extends HashGridProxy<TObject> = HashGridProxy<TObject>> {
  proxies: TProxy[] = [];
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

export class SparseHashGrid<TObject extends { bounds: BoundingBox }, TProxy extends HashGridProxy<TObject> = HashGridProxy<TObject>> {
  readonly gridSize: number;
  readonly sparseHashGrid: Map<string, HashGridCell<TObject, TProxy>>;
  readonly objectToProxy: Map<TObject, TProxy>;

  public bounds = new BoundingBox();

  private _hashGridCellPool = new RentalPool<HashGridCell<TObject, TProxy>>(
    () => new HashGridCell(),
    (instance) => {
      instance.configure(0, 0);
      instance.proxies.length = 0;
      return instance;
    },
    1000
  );

  private _buildProxy: (object: TObject) => TProxy;

  constructor(options: { size: number; proxyFactory?: (object: TObject, gridSize: number) => TProxy }) {
    this.gridSize = options.size;
    this.sparseHashGrid = new Map<string, HashGridCell<TObject, TProxy>>();
    this.objectToProxy = new Map<TObject, TProxy>();
    if (options.proxyFactory) {
      this._buildProxy = (object: TObject) => options.proxyFactory(object, this.gridSize);
    } else {
      this._buildProxy = (object: TObject) => new HashGridProxy(object, this.gridSize) as TProxy;
    }

    // TODO dynamic grid size potentially larger than the largest collider
    // TODO Re-hash the objects if the median proves to be different
  }

  query(point: Vector): TObject[];
  query(bounds: BoundingBox): TObject[];
  query(boundsOrPoint: BoundingBox | Vector): TObject[] {
    const results = new Set<TObject>();
    if (boundsOrPoint instanceof BoundingBox) {
      const bounds = boundsOrPoint;
      const leftX = Math.floor(bounds.left / this.gridSize);
      const rightX = Math.floor(bounds.right / this.gridSize);
      const bottomY = Math.floor(bounds.bottom / this.gridSize);
      const topY = Math.floor(bounds.top / this.gridSize);
      for (let x = leftX; x <= rightX; x++) {
        for (let y = topY; y <= bottomY; y++) {
          const key = HashGridCell.calculateHashKey(x, y);
          // Hash bounds into appropriate cell
          const cell = this.sparseHashGrid.get(key);
          if (cell) {
            for (let i = 0; i < cell.proxies.length; i++) {
              cell.proxies[i].updateBounds();
              if (cell.proxies[i].bounds.intersect(bounds)) {
                results.add(cell.proxies[i].object);
              }
            }
          }
        }
      }
    } else {
      const point = boundsOrPoint;
      const key = HashGridCell.calculateHashKey(Math.floor(point.x / this.gridSize), Math.floor(point.y / this.gridSize));
      // Hash points into appropriate cell
      const cell = this.sparseHashGrid.get(key);
      if (cell) {
        for (let i = 0; i < cell.proxies.length; i++) {
          cell.proxies[i].updateBounds();
          if (cell.proxies[i].bounds.contains(point)) {
            results.add(cell.proxies[i].object);
          }
        }
      }
    }
    return Array.from(results);
  }

  get(xCoord: number, yCoord: number): HashGridCell<TObject> {
    const key = HashGridCell.calculateHashKey(xCoord, yCoord);
    const cell = this.sparseHashGrid.get(key);
    return cell;
  }

  private _insert(x: number, y: number, proxy: TProxy): void {
    const key = HashGridCell.calculateHashKey(x, y);
    // Hash collider into appropriate cell
    let cell = this.sparseHashGrid.get(key);
    if (!cell) {
      cell = this._hashGridCellPool.rent();
      cell.configure(x, y);
      this.sparseHashGrid.set(cell.key, cell);
    }
    cell.proxies.push(proxy);
    proxy.cells.push(cell); // TODO dupes, doesn't seem to be a problem
    this.bounds.combine(proxy.bounds, this.bounds);
  }

  private _remove(x: number, y: number, proxy: TProxy): void {
    const key = HashGridCell.calculateHashKey(x, y);
    // Hash collider into appropriate cell
    const cell = this.sparseHashGrid.get(key);
    if (cell) {
      const proxyIndex = cell.proxies.indexOf(proxy);
      if (proxyIndex > -1) {
        cell.proxies.splice(proxyIndex, 1);
      }
      const cellIndex = proxy.cells.indexOf(cell);
      if (cellIndex > -1) {
        proxy.cells.splice(cellIndex, 1);
      }
      if (cell.proxies.length === 0) {
        this._hashGridCellPool.return(cell);
        this.sparseHashGrid.delete(key);
      }
    }
  }

  track(target: TObject): void {
    const proxy = this._buildProxy(target);
    this.objectToProxy.set(target, proxy);
    for (let x = proxy.leftX; x <= proxy.rightX; x++) {
      for (let y = proxy.topY; y <= proxy.bottomY; y++) {
        this._insert(x, y, proxy);
      }
    }
  }

  untrack(target: TObject): void {
    const proxy = this.objectToProxy.get(target);
    if (proxy) {
      proxy.clear();
      this.objectToProxy.delete(target);
    }
  }

  update(targets: TObject[]): number {
    let updated = 0;
    // FIXME resetting bounds is wrong, if nothing has updated then
    // the bounds stay 0
    // this.bounds.reset();
    for (const target of targets) {
      const proxy = this.objectToProxy.get(target);
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
        // TODO slightly wasteful only add new
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

  debug(ex: ExcaliburGraphicsContext, elapsed: number): void {
    const transparent = Color.Transparent;
    const color = Color.White;
    for (const cell of this.sparseHashGrid.values()) {
      ex.drawRectangle(vec(cell.x * this.gridSize, cell.y * this.gridSize), this.gridSize, this.gridSize, transparent, color, 2);
    }
  }
}
