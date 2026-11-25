import { Logger } from '../util/log';

/**
 * This pool works like an arena allocator, it preallocates a large list of objects and passes them out sequentially
 * It is meant to be freed all at once, so things that can be reclaimed after a frame are the ideal type.
 *
 * If you need to take singular objects and put singular objects back {@link RentalPool} is ideal.
 *
 * The builder can take arguments: {@link ArenaPool.getWith} passes them to the builder for a new instance or to the
 * recycler for a reused one. `get()`, `preallocate()` and `done()` still build with no arguments, so give the builder's
 * parameters defaults.
 *
 * ```typescript
 * const enemies = new ArenaPool(
 *   (type: EnemyType = EnemyType.Basic) => new Enemy(type),
 *   (enemy, type = EnemyType.Basic) => enemy.reset(type)
 * );
 * const rocket = enemies.getWith(EnemyType.Rocket);
 * ```
 */
export class ArenaPool<Type, Args extends unknown[] = []> {
  public totalAllocations = 0;
  public index = 0;
  public objects: Type[] = [];
  public disableWarnings = false;
  private _logger = Logger.getInstance();

  constructor(
    public builder: (...args: Args | []) => Type,
    public recycler?: NoInfer<(instance: Type, ...args: Args) => Type>,
    public maxObjects: number = 100
  ) {}

  dispose() {
    this.objects.length = 0;
  }

  preallocate() {
    for (let i = 0; i < this.maxObjects; i++) {
      this.objects[i] = this.builder();
    }
  }

  /**
   * Use many instances out of the in the context and return all to the pool.
   *
   * By returning values out of the context they will be un-hooked from the pool and are free to be passed to consumers
   * @param context
   */
  using(context: (pool: ArenaPool<Type, Args>) => Type[] | void) {
    const result = context(this);
    if (result) {
      return this.done(...result);
    }
    return this.done();
  }

  /**
   * Use a single instance out of th pool and immediately return it to the pool
   * @param context
   */
  borrow(context: (object: Type) => void) {
    const object = this.get();
    context(object);
    this.index--;
  }

  /**
   * Retrieve a value from the pool, will allocate a new instance if necessary or recycle from the pool
   */
  get(): Type {
    if (this.index === this.maxObjects) {
      if (!this.disableWarnings) {
        this._logger.warn('Max pooled objects reached, possible memory leak? Doubling');
      }
      this.maxObjects = this.maxObjects * 2;
    }

    if (this.objects[this.index]) {
      // Pool has an available object already constructed
      if (this.recycler) {
        // Args comes from a builder that works without arguments, so the recycler does too
        return (this.recycler as (instance: Type, ...args: Args | []) => Type)(this.objects[this.index++]);
      }
      return this.objects[this.index++];
    } else {
      // New allocation
      this.totalAllocations++;
      const object = (this.objects[this.index++] = this.builder());
      return object;
    }
  }

  /**
   * Retrieve a value from the pool like {@link ArenaPool.get}, passing arguments along. A new instance gets them from the
   * builder, a reused instance is passed to the recycler with them. Without a recycler a reused instance comes back as it
   * was.
   *
   * The argument types come from the builder's parameters.
   * @param args Arguments for the builder or recycler
   */
  getWith(...args: Args): Type {
    if (this.index === this.maxObjects) {
      if (!this.disableWarnings) {
        this._logger.warn('Max pooled objects reached, possible memory leak? Doubling');
      }
      this.maxObjects = this.maxObjects * 2;
    }

    if (this.objects[this.index]) {
      // Pool has an available object already constructed
      if (this.recycler) {
        return this.recycler(this.objects[this.index++], ...args);
      }
      return this.objects[this.index++];
    } else {
      // New allocation
      this.totalAllocations++;
      const object = (this.objects[this.index++] = this.builder(...args));
      return object;
    }
  }

  /**
   * Signals we are done with the pool objects for now, Reclaims all objects in the pool.
   *
   * If a list of pooled objects is passed to done they are un-hooked from the pool and are free
   * to be passed to consumers
   * @param objects A list of object to separate from the pool
   */
  done(...objects: Type[]): Type[];
  done(): void;
  done(...objects: Type[]): Type[] | void {
    // All objects in pool now considered "free"
    this.index = 0;
    for (const object of objects) {
      const poolIndex = this.objects.indexOf(object);
      // Build a new object to take the pool place
      this.objects[poolIndex] = (this as any).builder();
      this.totalAllocations++;
    }
    return objects;
  }
}
