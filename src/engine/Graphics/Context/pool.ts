export interface PoolData {
  _poolId: number;
  _free: boolean;
}

export interface Poolable {
  _poolData: PoolData;
  dispose(): void;
}

export function initializePoolData(): PoolData {
  return {
    _poolId: 0,
    _free: true
  };
}

export type FactoryFunc<T> = () => T;

export class Pool<T extends Poolable> {
  private _pool: T[] = [];
  private _freeIds: number[] = [];

  constructor(public objectFactory: FactoryFunc<T>, preAllocate: number = 100) {
    this.allocate(preAllocate);
  }

  public allocate(number: number) {
    for (let i = this._pool.length; i < number; i++) {
      this._pool.push(this.objectFactory());
      this._pool[i]._poolData._poolId = i;
      this._pool[i]._poolData._free = true;
      this._freeIds.push(i);
    }
  }

  public get(): T {
    if (this._freeIds.length === 0) {
      console.log('Pool empty: allocating more doubling');
      this.allocate(this._pool.length);
    }
    const id = this._freeIds.pop();
    const thing = this._pool[id];
    if (thing._poolData._poolId !== id) {
      throw new Error('pool corrupt');
    }
    thing._poolData._free = false;
    return thing;
  }
  public free(thing: T) {
    thing.dispose();
    thing._poolData._free = true;
    this._freeIds.push(thing._poolData._poolId);
  }
}
