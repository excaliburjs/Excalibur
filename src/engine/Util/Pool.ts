export interface Poolable {
  /**
   * Any type that is a member of a an object pool will have a reference to teh pool
   * @internal
   */
  _pool?: Pool<this>;
  dispose(): this;
}

export class Pool<Type extends Poolable> {
  public totalAllocations = 0;
  public index = 0;
  public objects: Type[] = [];

  constructor(
    public builder: (...args: any[]) => Type,
    public recycler: (instance: Type, ...args: any[]) => Type,
    public maxObjects: number = 100
  ) {}

  /**
   * Use many instances out of the in the context and return all to the pool.
   *
   * By returning values out of the contex they will be un-hooked from the pool and are free to be passed to consumers
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
    this.done();
  }

  /**
   * Retrieve a value from the pool, will allocate a new instance if necessary or recycle from the pool
   * @param args
   */
  get(...args: any[]): Type {
    if (this.index === this.maxObjects - 1) {
      // TODO implement hard or soft cap
      throw new Error('Max pooled objects reached, possible memory leak?');
    }

    if (this.objects[this.index]) {
      // Pool has an available object already constructed
      return this.recycler(this.objects[this.index++], ...args);
    } else {
      // New allocation
      this.totalAllocations++;
      const object = (this.objects[this.index++] = this.builder(...args));
      object._pool = this;
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
      this.objects[poolIndex] = (this as any).builder(); // TODO problematic 0-arg only support
      this.objects[poolIndex]._pool = this;
      // console.log("Allocation leaving using");
      this.totalAllocations++;
      // Unhook object from the pool
      object._pool = undefined;
    }
    return objects;
  }
}
