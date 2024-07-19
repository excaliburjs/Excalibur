export interface GarbageCollectionOptions {
  textureCollectInterval: number; // default 60_000 ms
  fontCollectInterval: number; // default 60_000 ms
  textMeasurementCollectInterval: number; // default 60_000 ms
}

export interface GarbageCollectorOptions {
  /**
   * Returns a timestamp in milliseconds representing now
   */
  nowFn: () => number;
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
    this._collectionMap.set(resource, [type, this.options.nowFn()]);
  }

  /**
   * Update the resource last used timestamp preventing collection
   * @param resource
   */
  touch(resource: any) {
    const collectionData = this._collectionMap.get(resource);
    if (collectionData) {
      this._collectionMap.set(resource, [collectionData[0], this.options.nowFn()]);
    }
  }

  public collectStaleResources = (deadline?: IdleDeadline) => {
    if (!this._running) {
      return;
    }
    for (const [type, [collector, timeoutInterval]] of this._collectors.entries()) {
      const now = this.options.nowFn();
      for (const [resource, [resourceType, time]] of this._collectionMap.entries()) {
        if (type !== resourceType || (time + timeoutInterval >= now)) {
          continue;
        }
        
        const collected = collector(resource);
        if (collected) {
          this._collectionMap.delete(resource);
        }
      }
    }

    this._collectHandle = requestIdleCallback(this.collect);
  };

  start() {
    this._running = true;
    this.collect();
  }

  stop() {
    this._running = false;
    cancelIdleCallback(this._collectHandle);
  }
}