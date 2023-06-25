export type EventMap = Record<string, any>;
export type EventKey<T extends EventMap> = string & keyof T;
export type Handler<EventType> = (event: EventType) => void;

/**
 * Interface that represents a handle to a subscription that can be closed
 */
export interface Subscription {
  close(): void;
}

/**
 * Excalibur's typed event emitter, this allows events to be sent with any string to Type mapping
 */
export class EventEmitter<T extends EventMap> {
  private _paused = false;
  private _listeners: Record<string, Handler<any>[]> = {};
  private _listenersOnce: Record<string, Handler<any>[]> = {};
  private _pipes: EventEmitter<any>[] = [];

  on<K extends EventKey<T>>(eventName: K, fn: Handler<T[K]>): Subscription;
  on(eventName: string, fn: Handler<unknown>): Subscription;
  on<K extends EventKey<T> | string>(eventName: K, fn: Handler<T[K]>): Subscription {
    this._listeners[eventName] = this._listeners[eventName] ?? [];
    this._listeners[eventName].push(fn);
    return {
      close: () => this.off(eventName, fn)
    };
  }

  once<K extends EventKey<T>>(eventName: K, fn: Handler<T[K]>): Subscription;
  once(eventName: string, fn: Handler<unknown>): Subscription;
  once<K extends EventKey<T> | string>(eventName: K, fn: Handler<T[K]>): Subscription {
    this._listenersOnce[eventName] = this._listenersOnce[eventName] ?? [];
    this._listenersOnce[eventName].push(fn);
    return {
      close: () => this.off(eventName, fn)
    };
  }

  off<K extends EventKey<T>>(eventName: K, fn: Handler<T[K]>): void;
  off(eventName: string, fn: Handler<unknown>): void;
  off(eventName: string): void;
  off<K extends EventKey<T> | string>(eventName: K, fn?: Handler<T[K]>): void {
    if (fn) {
      const listenerIndex = this._listeners[eventName]?.indexOf(fn);
      if (listenerIndex > -1) {
        this._listeners[eventName]?.splice(listenerIndex, 1);
      }
      const onceIndex = this._listenersOnce[eventName]?.indexOf(fn);
      if (onceIndex > -1) {
        this._listenersOnce[eventName]?.splice(onceIndex, 1);
      }
    } else {
      delete this._listeners[eventName];
    }
  }

  emit<K extends EventKey<T>>(eventName: K, event: T[K]): void;
  emit(eventName: string, event?: any): void;
  emit<K extends EventKey<T> | string>(eventName: K, event?: T[K]): void {
    if (this._paused) {
      return;
    }
    this._listeners[eventName]?.forEach((fn) => fn(event));
    const onces = this._listenersOnce[eventName];
    this._listenersOnce[eventName] = [];
    if (onces) {
      onces.forEach((fn) => fn(event));
    }
    this._pipes.forEach((pipe) => {
      pipe.emit(eventName, event);
    });
  }

  pipe(emitter: EventEmitter<any>): Subscription {
    if (this === emitter) {
      throw Error('Cannot pipe to self');
    }
    this._pipes.push(emitter);
    return {
      close: () => {
        let i = -1;
        if ((i = this._pipes.indexOf(emitter)) > -1) {
          this._pipes.splice(i, 1);
        }
      }
    };
  }

  unpipe(emitter: EventEmitter<any>): void {
    let i = -1;
    if ((i = this._pipes.indexOf(emitter)) > -1) {
      this._pipes.splice(i, 1);
    }
  }

  pause(): void {
    this._paused = true;
  }

  unpause(): void {
    this._paused = false;
  }
}