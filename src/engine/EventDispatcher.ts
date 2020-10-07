import { GameEvent, SubscribeEvent, UnsubscribeEvent } from './Events';
import { Eventable } from './Interfaces/Evented';

export class EventDispatcher<T = any> implements Eventable {
  private _handlers: { [key: string]: { (event: GameEvent<T>): void }[] } = {};
  private _wiredEventDispatchers: Eventable[] = [];

  private _target: T;

  /**
   * @param target  The object that will be the recipient of events from this event dispatcher
   */
  constructor(target: T) {
    this._target = target;
  }

  /**
   * Clears any existing handlers or wired event dispatchers on this event dispatcher
   */
  public clear() {
    this._handlers = {};
    this._wiredEventDispatchers = [];
  }

  /**
   * Emits an event for target
   * @param eventName  The name of the event to publish
   * @param event      Optionally pass an event data object to the handler
   */
  public emit(eventName: string, event: GameEvent<T>) {
    if (!eventName) {
      // key not mapped
      return;
    }
    eventName = eventName.toLowerCase();
    const target = this._target;
    if (!event) {
      event = new GameEvent();
    }
    event.target = target;

    let i: number, len: number;

    if (this._handlers[eventName]) {
      i = 0;
      len = this._handlers[eventName].length;

      for (i; i < len; i++) {
        this._handlers[eventName][i].call(target, event);
      }
    }

    i = 0;
    len = this._wiredEventDispatchers.length;

    for (i; i < len; i++) {
      this._wiredEventDispatchers[i].emit(eventName, event);
    }
  }

  /**
   * Subscribe an event handler to a particular event name, multiple handlers per event name are allowed.
   * @param eventName  The name of the event to subscribe to
   * @param handler    The handler callback to fire on this event
   */
  public on(eventName: string, handler: (event: GameEvent<T>) => void) {
    eventName = eventName.toLowerCase();
    if (!this._handlers[eventName]) {
      this._handlers[eventName] = [];
    }
    this._handlers[eventName].push(handler);

    // meta event handlers
    if (eventName !== 'unsubscribe' && eventName !== 'subscribe') {
      this.emit('subscribe', new SubscribeEvent(eventName, handler));
    }
  }

  /**
   * Unsubscribe an event handler(s) from an event. If a specific handler
   * is specified for an event, only that handler will be unsubscribed.
   * Otherwise all handlers will be unsubscribed for that event.
   *
   * @param eventName  The name of the event to unsubscribe
   * @param handler    Optionally the specific handler to unsubscribe
   *
   */
  public off(eventName: string, handler?: (event: GameEvent<T>) => void) {
    eventName = eventName.toLowerCase();
    const eventHandlers = this._handlers[eventName];

    if (eventHandlers) {
      // if no explicit handler is give with the event name clear all handlers
      if (!handler) {
        this._handlers[eventName].length = 0;
      } else {
        const index = eventHandlers.indexOf(handler);
        this._handlers[eventName].splice(index, 1);
      }
    }
    // meta event handlers
    if (eventName !== 'unsubscribe' && eventName !== 'subscribe') {
      this.emit('unsubscribe', new UnsubscribeEvent(eventName, handler));
    }
  }

  /**
   * Once listens to an event one time, then unsubscribes from that event
   *
   * @param eventName The name of the event to subscribe to once
   * @param handler   The handler of the event that will be auto unsubscribed
   */
  public once(eventName: string, handler: (event: GameEvent<T>) => void) {
    const metaHandler = (event: GameEvent<T>) => {
      const ev = event || new GameEvent();
      ev.target = ev.target || this._target;

      this.off(eventName, handler);
      handler.call(ev.target, ev);
    };

    this.on(eventName, metaHandler);
  }

  /**
   * Wires this event dispatcher to also receive events from another
   */
  public wire(eventDispatcher: EventDispatcher): void {
    eventDispatcher._wiredEventDispatchers.push(this);
  }

  /**
   * Unwires this event dispatcher from another
   */
  public unwire(eventDispatcher: EventDispatcher): void {
    const index = eventDispatcher._wiredEventDispatchers.indexOf(this);
    if (index > -1) {
      eventDispatcher._wiredEventDispatchers.splice(index, 1);
    }
  }
}
