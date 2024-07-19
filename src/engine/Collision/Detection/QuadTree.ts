import { Color } from '../../Color';
import { ExcaliburGraphicsContext } from '../../Graphics';
import { BoundingBox } from '../BoundingBox';

export interface QuadTreeItem {
  bounds: BoundingBox;
}

export interface QuadTreeOptions {
  maxDepth?: number;
  capacity: number;
  level?: number;
}

/**
 * QuadTree spatial data structure. Useful for quickly retrieving all objects that might
 * be in a specific location.
 */
export class QuadTree<TItem extends QuadTreeItem> {
  private _defaultOptions: QuadTreeOptions = {
    maxDepth: 10,
    capacity: 10,
    level: 0
  };

  public halfWidth: number;
  public halfHeight: number;
  public items: TItem[] = [];
  private _isDivided = false;

  public topLeft: QuadTree<TItem> | null = null;
  public topRight: QuadTree<TItem> | null = null;
  public bottomLeft: QuadTree<TItem> | null = null;
  public bottomRight: QuadTree<TItem> | null = null;

  constructor(
    public bounds: BoundingBox,
    public options?: QuadTreeOptions
  ) {
    this.options = { ...this._defaultOptions, ...options };
    this.halfWidth = bounds.width / 2;
    this.halfHeight = bounds.height / 2;
  }

  /**
   * Splits the quad tree one level deeper
   */
  private _split() {
    this._isDivided = true;
    const newLevelOptions = {
      maxDepth: this.options.maxDepth,
      capacity: this.options.capacity,
      level: this.options.level + 1
    };
    this.topLeft = new QuadTree<TItem>(
      new BoundingBox({
        left: this.bounds.left,
        top: this.bounds.top,
        right: this.bounds.left + this.halfWidth,
        bottom: this.bounds.top + this.halfHeight
      }),
      newLevelOptions
    );
    this.topRight = new QuadTree<TItem>(
      new BoundingBox({
        left: this.bounds.left + this.halfWidth,
        top: this.bounds.top,
        right: this.bounds.right,
        bottom: this.bounds.top + this.halfHeight
      }),
      newLevelOptions
    );
    this.bottomLeft = new QuadTree<TItem>(
      new BoundingBox({
        left: this.bounds.left,
        top: this.bounds.top + this.halfHeight,
        right: this.bounds.left + this.halfWidth,
        bottom: this.bounds.bottom
      }),
      newLevelOptions
    );
    this.bottomRight = new QuadTree<TItem>(
      new BoundingBox({
        left: this.bounds.left + this.halfWidth,
        top: this.bounds.top + this.halfHeight,
        right: this.bounds.right,
        bottom: this.bounds.bottom
      }),
      newLevelOptions
    );
  }

  private _insertIntoSubNodes(item: TItem) {
    if (this.topLeft?.bounds.overlaps(item.bounds)) {
      this.topLeft.insert(item);
    }

    if (this.topRight?.bounds.overlaps(item.bounds)) {
      this.topRight.insert(item);
    }

    if (this.bottomLeft?.bounds.overlaps(item.bounds)) {
      this.bottomLeft.insert(item);
    }

    if (this.bottomRight?.bounds.overlaps(item.bounds)) {
      this.bottomRight.insert(item);
    }
  }

  /**
   * Insert an item to be tracked in the QuadTree
   * @param item
   */
  insert(item: TItem): void {
    // add to subnodes if it matches
    if (this._isDivided) {
      this._insertIntoSubNodes(item);
      return;
    }

    // leaf case
    this.items.push(item);

    // capacity
    if (this.items.length > this.options.capacity && this.options.level < this.options.maxDepth) {
      if (!this._isDivided) {
        this._split();
      }
      // divide this level's items into it's subnodes
      for (const item of this.items) {
        this._insertIntoSubNodes(item);
      }
      // clear this level
      this.items.length = 0;
    }
  }

  /**
   * Remove a tracked item in the QuadTree
   * @param item
   */
  remove(item: TItem): void {
    if (!this.bounds.overlaps(item.bounds)) {
      return;
    }

    if (!this._isDivided) {
      const index = this.items.indexOf(item);
      if (index > -1) {
        this.items.splice(index, 1);
      }
      return;
    }

    if (this.topLeft?.bounds.overlaps(item.bounds)) {
      this.topLeft.remove(item);
    }

    if (this.topRight?.bounds.overlaps(item.bounds)) {
      this.topRight.remove(item);
    }

    if (this.bottomLeft?.bounds.overlaps(item.bounds)) {
      this.bottomLeft.remove(item);
    }

    if (this.bottomRight?.bounds.overlaps(item.bounds)) {
      this.bottomRight.remove(item);
    }
  }

  /**
   * Query the structure for all objects that intersect the bounding box
   * @param boundingBox
   * @returns items
   */
  query(boundingBox: BoundingBox): TItem[] {
    let results = this.items;

    if (this._isDivided) {
      if (this.topLeft.bounds.overlaps(boundingBox)) {
        results = results.concat(this.topLeft.query(boundingBox));
      }
      if (this.topRight.bounds.overlaps(boundingBox)) {
        results = results.concat(this.topRight.query(boundingBox));
      }
      if (this.bottomLeft.bounds.overlaps(boundingBox)) {
        results = results.concat(this.bottomLeft.query(boundingBox));
      }
      if (this.bottomRight.bounds.overlaps(boundingBox)) {
        results = results.concat(this.bottomRight.query(boundingBox));
      }
    }

    results = results.filter((item, index) => {
      return results.indexOf(item) >= index;
    });

    return results;
  }

  clear() {
    this.items = [];
    this._isDivided = false;

    this.topLeft = null;
    this.topRight = null;
    this.bottomLeft = null;
    this.bottomRight = null;
  }

  getAllItems(): TItem[] {
    let results = this.items;

    if (this._isDivided) {
      results = results.concat(this.topLeft.getAllItems());
      results = results.concat(this.topRight.getAllItems());
      results = results.concat(this.bottomLeft.getAllItems());
      results = results.concat(this.bottomRight.getAllItems());
    }

    results = results.filter((item, index) => {
      return results.indexOf(item) >= index;
    });

    return results;
  }

  getTreeDepth(): number {
    if (!this._isDivided) {
      return 0;
    }

    return (
      1 +
      Math.max(this.topLeft.getTreeDepth(), this.topRight.getTreeDepth(), this.bottomLeft.getTreeDepth(), this.bottomRight.getTreeDepth())
    );
  }

  debug(ctx: ExcaliburGraphicsContext) {
    this.bounds.draw(ctx, Color.Yellow);
    if (this._isDivided) {
      this.topLeft.bounds.draw(ctx, Color.Yellow);
      this.topRight.bounds.draw(ctx, Color.Yellow);
      this.bottomLeft.bounds.draw(ctx, Color.Yellow);
      this.bottomRight.bounds.draw(ctx, Color.Yellow);
    }
  }
}
