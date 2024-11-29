export class RentalPool<T> {
  private _pool: T[] = [];
  private _size: number = 0;
  constructor(
    public builder: () => T,
    public cleaner: (used: T) => T,
    preAllocate: number = 1
  ) {
    this.grow(preAllocate);
  }

  /**
   * Grow the pool size by an amount
   * @param amount
   */
  grow(amount: number): void {
    if (amount > 0) {
      this._size += amount;
      for (let i = 0; i < amount; i++) {
        this._pool.push(this.builder());
      }
    }
  }

  /**
   * Rent an object from the pool, optionally clean it. If not cleaned previous state may be set.
   *
   * The pool will automatically double if depleted
   * @param clean
   */
  rent(clean: boolean = false): T {
    if (this._pool.length === 0) {
      this.grow(this._size);
    }

    return clean ? this.cleaner(this._pool.pop()) : this._pool.pop();
  }

  /**
   * Return an object to the pool
   * @param object
   */
  return(object: T): void {
    this._pool.push(object);
  }
}
