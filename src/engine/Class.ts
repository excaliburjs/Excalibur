import { EventEmitter } from './EventEmitter';
import { Eventable } from './Interfaces/Evented';

/**
 * Excalibur base class that provides basic functionality such as [[EventDispatcher]]
 * and extending abilities for vanilla Javascript projects
 * @deprecated Will be removed in v0.29.0
 */
export class Class implements Eventable {
  // TODO do we need this Class anymore in v0.29.0?
  /**
   * Direct access to the game object event dispatcher.
   * @deprecated Will be removed in v0.29.0 Use .events
   */
  public eventDispatcher: EventEmitter;

  constructor() {
    this.eventDispatcher = new EventEmitter();
  }

  /**
   * Alias for `addEventListener`. You can listen for a variety of
   * events off of the engine; see the events section below for a complete list.
   * @param eventName  Name of the event to listen for
   * @param handler    Event handler for the thrown event
   * @deprecated
   */
  public on(eventName: string, handler: (event: any) => void) {
    this.eventDispatcher.on(eventName, handler);
  }

  /**
   * Alias for `removeEventListener`. If only the eventName is specified
   * it will remove all handlers registered for that specific event. If the eventName
   * and the handler instance are specified only that handler will be removed.
   *
   * @param eventName  Name of the event to listen for
   * @param handler    Event handler for the thrown event
   * @deprecated
   */
  public off(eventName: string, handler?: (event: any) => void) {
    this.eventDispatcher.off(eventName, handler);
  }

  /**
   * Emits a new event
   * @param eventName   Name of the event to emit
   * @param eventObject Data associated with this event
   * @deprecated
   */
  public emit(eventName: string, eventObject: any) {
    this.eventDispatcher.emit(eventName, eventObject);
  }

  /**
   * Once listens to an event one time, then unsubscribes from that event
   *
   * @param eventName The name of the event to subscribe to once
   * @param handler   The handler of the event that will be auto unsubscribed
   * @deprecated
   */
  public once(eventName: string, handler: (event: any) => void) {
    this.eventDispatcher.once(eventName, handler);
  }
}
