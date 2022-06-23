import { Future } from './Future';

class AsyncWaitQueue<T> {
  // Code from StephenCleary https://gist.github.com/StephenCleary/ba50b2da419c03b9cba1d20cb4654d5e
  private _queue: Future<T>[] = [];

  public get length(): number {
    return this._queue.length;
  }

  public enqueue(): Promise<T> {
    const future = new Future<T>();
    this._queue.push(future);
    return future.promise;
  }

  public dequeue(value: T): void {
    const future = this._queue.shift();
    future.resolve(value);
  }

  public dequeueAll(value: T): void {
    this._queue.forEach(x => x.resolve(value));
    this._queue = [];
  }
}

/**
 * Semaphore allows you to limit the amount of async calls happening between `enter()` and `exit()`
 *
 * This can be useful when limiting the number of http calls, browser api calls, etc either for performance or to work
 * around browser limitations like max Image.decode() calls in chromium being 256.
 */
export class Semaphore {
  private _count = 0;
  private _waitQueue = new AsyncWaitQueue();
  constructor(private _maxCalls: number) { }

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