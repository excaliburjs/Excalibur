export type EventMap = Record<string, any>;
export type EventKey<T extends EventMap> = string & keyof T;
export type Handler<EventType> = (event: EventType) => void;

/**
 * Interface that represents a handle to a subscription that can be closed
 */
export interface Subscription {
  /**
   * Removes the associated event handler, synonymous with events.off(...);
   */
  close(): void;
}

/**
 * Excalibur's typed event emitter, this allows events to be sent with any string to Type mapping
 */
export class EventEmitter<TEventMap extends EventMap = any> {
  private _paused = false;
  private _empty = true;
  private _listeners: Record<string, Handler<any>[]> = {};
  private _listenersOnce: Record<string, Handler<any>[]> = {};
  private _pipes: EventEmitter<any>[] = [];

  /**
   * Removes all listeners and pipes
   */
  clear() {
    this._listeners = {};
    this._listenersOnce = {};
    this._pipes.length = 0;
    this._empty = true;
  }

  on<TEventName extends EventKey<TEventMap>>(eventName: TEventName, handler: Handler<TEventMap[TEventName]>): Subscription;
  on(eventName: string, handler: Handler<unknown>): Subscription;
  on<TEventName extends EventKey<TEventMap> | string>(eventName: TEventName, handler: Handler<TEventMap[TEventName]>): Subscription {
    this._empty = false;
    this._listeners[eventName] = this._listeners[eventName] ?? [];
    this._listeners[eventName].push(handler);
    return {
      close: () => this.off(eventName, handler)
    };
  }

  once<TEventName extends EventKey<TEventMap>>(eventName: TEventName, handler: Handler<TEventMap[TEventName]>): Subscription;
  once(eventName: string, handler: Handler<unknown>): Subscription;
  once<TEventName extends EventKey<TEventMap> | string>(eventName: TEventName, handler: Handler<TEventMap[TEventName]>): Subscription {
    this._empty = false;
    this._listenersOnce[eventName] = this._listenersOnce[eventName] ?? [];
    this._listenersOnce[eventName].push(handler);
    return {
      close: () => this.off(eventName, handler)
    };
  }

  off<TEventName extends EventKey<TEventMap>>(eventName: TEventName, handler: Handler<TEventMap[TEventName]>): void;
  off(eventName: string, handler: Handler<unknown>): void;
  off(eventName: string): void;
  off<TEventName extends EventKey<TEventMap> | string>(eventName: TEventName, handler?: Handler<TEventMap[TEventName]>): void {
    if (handler) {
      const newListeners = this._listeners[eventName]?.filter((h) => h !== handler);
      this._listeners[eventName] = newListeners;

      const newOnceListeners = this._listenersOnce[eventName]?.filter((h) => h !== handler);
      this._listenersOnce[eventName] = newOnceListeners;
    } else {
      delete this._listeners[eventName];
    }
  }

  emit<TEventName extends EventKey<TEventMap>>(eventName: TEventName, event: TEventMap[TEventName]): void;
  emit(eventName: string, event?: any): void;
  emit<TEventName extends EventKey<TEventMap> | string>(eventName: TEventName, event?: TEventMap[TEventName]): void {
    if (this._empty) {
      return;
    }
    if (this._paused) {
      return;
    }
    const listeners = this._listeners[eventName];
    if (listeners) {
      for (let i = 0; i < listeners.length; i++) {
        listeners[i](event);
      }
    }
    const onces = this._listenersOnce[eventName];
    this._listenersOnce[eventName] = [];
    if (onces) {
      for (let i = 0; i < onces.length; i++) {
        onces[i](event);
      }
    }
    for (let i = 0; i < this._pipes.length; i++) {
      this._pipes[i].emit(eventName, event);
    }
  }

  /**
   * Replay events from this emitter to another
   * @param emitter
   */
  pipe(emitter: EventEmitter<any>): Subscription {
    if (this === emitter) {
      throw Error('Cannot pipe to self');
    }
    this._empty = false;
    this._pipes.push(emitter);
    return {
      close: () => {
        const i = this._pipes.indexOf(emitter);
        if (i > -1) {
          this._pipes.splice(i, 1);
        }
      }
    };
  }

  /**
   * Remove any piped emitters
   * @param emitter
   */
  unpipe(emitter: EventEmitter<any>): void {
    const i = this._pipes.indexOf(emitter);
    if (i > -1) {
      this._pipes.splice(i, 1);
    }
  }

  /**
   * Paused event emitters do not emit events
   */
  pause(): void {
    this._paused = true;
  }

  /**
   * Unpaused event emitter do emit events
   */
  unpause(): void {
    this._paused = false;
  }
}
