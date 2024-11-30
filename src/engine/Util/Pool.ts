import { Logger } from '../Util/Log';
export class Pool<Type> {
  public totalAllocations = 0;
  public index = 0;
  public objects: Type[] = [];
  public disableWarnings = false;
  private _logger = Logger.getInstance();

  constructor(
    public builder: () => Type,
    public recycler?: (instance: Type) => Type,
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
  using(context: (pool: Pool<Type>) => Type[] | void) {
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
        return this.recycler(this.objects[this.index++]);
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
