import { Future } from '../util/future';

export function abortError(): DOMException {
  return new DOMException('The load was aborted', 'AbortError');
}

export function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw abortError();
  }
}

export function withAbort<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) {
    return promise;
  }
  if (signal.aborted) {
    promise.catch(() => undefined);
    return Promise.reject(abortError());
  }
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => {
      signal.removeEventListener('abort', onAbort);
      reject(abortError());
    };
    signal.addEventListener('abort', onAbort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener('abort', onAbort);
        resolve(value);
      },
      (error) => {
        signal.removeEventListener('abort', onAbort);
        reject(error);
      }
    );
  });
}

interface SharedLoadOperation<T> {
  controller: AbortController;
  completion: Future<T>;
  waiters: number;
}

/** Keep one in-flight load alive while it still has interested callers. */
export class SharedLoad<T> {
  private _operation?: SharedLoadOperation<T>;

  load(start: (signal?: AbortSignal) => Promise<T>, signal?: AbortSignal): Promise<T> {
    if (signal?.aborted) {
      return Promise.reject(abortError());
    }
    if (this._operation?.controller.signal.aborted) {
      return withAbort(
        this._operation.completion.promise.catch(() => undefined).then(() => this.load(start, signal)),
        signal
      );
    }

    const startsLoad = !this._operation;
    const operation = (this._operation ??= {
      controller: new AbortController(),
      completion: new Future<T>(),
      waiters: 0
    });
    // Register interest before start() can synchronously emit loadstart.
    const result = this._wait(operation, signal);
    if (startsLoad) {
      const finish = () => {
        if (this._operation === operation) {
          this._operation = undefined;
        }
      };
      const resolve = (value: T) => {
        finish();
        operation.completion.resolve(value);
      };
      const reject = (error: Error) => {
        finish();
        operation.completion.reject(error);
      };
      try {
        void start(signal ? operation.controller.signal : undefined).then(resolve, reject);
      } catch (error) {
        reject(error as Error);
      }
    }
    return result;
  }

  private _wait(operation: SharedLoadOperation<T>, signal?: AbortSignal): Promise<T> {
    operation.waiters++;
    let released = false;
    let onAbort: () => void;
    const release = () => {
      if (released) {
        return;
      }
      released = true;
      signal?.removeEventListener('abort', onAbort);
      operation.waiters--;
      if (operation.waiters === 0 && !operation.completion.isCompleted) {
        operation.controller.abort();
      }
    };
    const result = new Promise<T>((resolve, reject) => {
      let settled = false;
      onAbort = () => {
        release();
        // A completed load wins over an abort raised by its completion event.
        queueMicrotask(() => {
          if (!settled && !operation.completion.isCompleted) {
            settled = true;
            reject(abortError());
          }
        });
      };
      signal?.addEventListener('abort', onAbort, { once: true });
      operation.completion.promise.then(
        (value) => {
          if (!settled) {
            settled = true;
            resolve(value);
          }
        },
        (error) => {
          if (!settled) {
            settled = true;
            reject(error);
          }
        }
      );
    });
    return result.finally(release);
  }
}
