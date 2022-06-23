class Future<T> {
  private resolver: (value: T) => void; // readonly
  private rejecter: (error: Error) => void; // readonly
  private _isCompleted: boolean = false;

  constructor() {
      this.promise = new Promise((resolve, reject) => {
          this.resolver = resolve;
          this.rejecter = reject;
      });
  }

  public readonly promise: Promise<T>;
  
  public get isCompleted(): boolean {
      return this._isCompleted;
  }

  public resolve(value: T): void {
      if (this._isCompleted) {
          return;
      }
      this._isCompleted = true;
      this.resolver(value);
  }

  public reject(error: Error): void {
      if (this._isCompleted) {
          return;
      }
      this._isCompleted = true;
      this.rejecter(error);
  }
}

class AsyncWaitQueue<T> {
  private queue: Future<T>[] = [];

  public get length(): number {
      return this.queue.length;
  }

  public enqueue(): Promise<T> {
      let future = new Future<T>();
      this.queue.push(future);
      return future.promise;
  }

  public dequeue(value: T): void {
      let future = this.queue.shift();
      future.resolve(value);
  }

  public dequeueAll(value: T): void {
      this.queue.forEach(x => x.resolve(value));
      this.queue = [];
  }
}

export class Semaphore {
  private _count = 0;
  private _waitQueue = new AsyncWaitQueue();
  constructor(private _maxCalls: number) {}
  
  public async enter() {
    if (this._count < this._maxCalls) {
      this._count++;
      return Promise.resolve();
    }
    return this._waitQueue.enqueue();
  }

  public exit(count: number = 1) {
    if (count === 0) {
        return;
    }
    while (count !== 0 && this._waitQueue.length !== 0) {
        this._waitQueue.dequeue(null);
        --count;
        this._count--;
    }
  }
}