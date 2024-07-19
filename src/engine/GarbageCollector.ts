export interface GarbageCollectionOptions {
  /**
   * Textures that aren't drawn after a certain number of milliseconds are unloaded from the GPU
   * Default 60_000 ms
   */
  textureCollectInterval?: number; // default 60_000 ms
  // TODO future work to integrate the font and text configuration, refactor existing collection mechanism
  // /**
  //  * Font pre-renders that aren't drawn after a certain number of milliseconds are unloaded from the GPU
  //  * Default 60_000 ms
  //  */
  // fontCollectInterval: number; // default 60_000 ms
  // /**
  //  * Text measurements that aren't used after a certain number of milliseconds are unloaded from the GPU
  //  * Default 60_000 ms
  //  */
  // textMeasurementCollectInterval: number; // default 60_000 ms
}

export const DefaultGarbageCollectionOptions: GarbageCollectionOptions = {
  textureCollectInterval: 60_000
  // TODO future work to integrate the font and text configuration, refactor existing collection mechanism
  // fontCollectInterval: 60_000,
  // textMeasurementCollectInterval: 60_000,
};

export interface GarbageCollectorOptions {
  /**
   * Returns a timestamp in milliseconds representing now
   */
  getTimestamp: () => number;
}

export class GarbageCollector {
  private _collectHandle: number;
  private _running = false;
  private _collectionMap = new Map<any, [type: string, time: number]>();
  private _collectors = new Map<string, [(resource: any) => boolean, interval: number]>();

  constructor(public options: GarbageCollectorOptions) {}

  /**
   *
   * @param type Resource type
   * @param timeoutInterval If resource type exceeds interval in milliseconds collect() is called
   * @param collect Collection implementation, returns true if collected
   */
  registerCollector(type: string, timeoutInterval: number, collect: (resource: any) => boolean) {
    this._collectors.set(type, [collect, timeoutInterval]);
  }

  /**
   * Add a resource to be tracked for collection
   * @param type
   * @param resource
   */
  addCollectableResource(type: string, resource: any) {
    this._collectionMap.set(resource, [type, this.options.getTimestamp()]);
  }

  /**
   * Update the resource last used timestamp preventing collection
   * @param resource
   */
  touch(resource: any) {
    const collectionData = this._collectionMap.get(resource);
    if (collectionData) {
      this._collectionMap.set(resource, [collectionData[0], this.options.getTimestamp()]);
    }
  }

  /**
   * Runs the collection loop to cleanup any stale resources given the registered collect handlers
   */
  public collectStaleResources = (deadline?: IdleDeadline) => {
    if (!this._running) {
      return;
    }
    for (const [type, [collector, timeoutInterval]] of this._collectors.entries()) {
      const now = this.options.getTimestamp();
      for (const [resource, [resourceType, time]] of this._collectionMap.entries()) {
        if (type !== resourceType || time + timeoutInterval >= now) {
          continue;
        }

        const collected = collector(resource);
        if (collected) {
          this._collectionMap.delete(resource);
        }
      }
    }

    this._collectHandle = requestIdleCallback(this.collectStaleResources);
  };

  /**
   * Force collect all resources, useful for shutting down a game
   * or if you know that you will not use anything you've allocated before now
   */
  public forceCollectAll() {
    for (const [_, [collector]] of this._collectors.entries()) {
      for (const [resource] of this._collectionMap.entries()) {
        const collected = collector(resource);
        if (collected) {
          this._collectionMap.delete(resource);
        }
      }
    }
  }

  /**
   * Starts the garbage collection loop
   */
  start() {
    this._running = true;
    this.collectStaleResources();
  }

  /**
   * Stops the garbage collection loop
   */
  stop() {
    this._running = false;
    cancelIdleCallback(this._collectHandle);
  }
}
