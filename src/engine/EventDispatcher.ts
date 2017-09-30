import { GameEvent, SubscribeEvent, UnsubscribeEvent } from './Events';
import { IEvented } from './Interfaces/IEvented';


/**
 * Excalibur's internal event dispatcher implementation. 
 * Callbacks are fired immediately after an event is published.
 * Typically you will use [[Class.eventDispatcher]] since most classes in
 * Excalibur inherit from [[Class]]. You will rarely create an `EventDispatcher`
 * yourself.
 *
 * [[include:Events.md]]
 */
export class EventDispatcher implements IEvented {
   private _handlers: { [key: string]: { (event?: GameEvent<any>): void }[]; } = {};
   private _wiredEventDispatchers: EventDispatcher[] = [];

   private _target: any;

   /**
    * @param target  The object that will be the recipient of events from this event dispatcher
    */
   constructor(target: any) {
      this._target = target;
   }

   /**
    * Emits an event for target
    * @param eventName  The name of the event to publish
    * @param event      Optionally pass an event data object to the handler
    */
   public emit(eventName: string, event?: GameEvent<any>) {
      if (!eventName) {
         // key not mapped
         return;
      }
      eventName = eventName.toLowerCase();
      var target = this._target;
      if (!event) {
         event = new GameEvent();
      }
      event.target = target;

      var i: number, len: number;

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
   public on(eventName: string, handler: (event?: GameEvent<any>) => void) {
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
   public off(eventName: string, handler?: (event?: GameEvent<any>) => void) {
      eventName = eventName.toLowerCase();
      var eventHandlers = this._handlers[eventName];

      if (eventHandlers) {
         // if no explicit handler is give with the event name clear all handlers
         if (!handler) {
            this._handlers[eventName].length = 0;
         } else {
            var index = eventHandlers.indexOf(handler);
            this._handlers[eventName].splice(index, 1);
         }
      }
      // meta event handlers
      if (eventName !== 'unsubscribe' && eventName !== 'subscribe') {
         this.emit('unsubscribe', new UnsubscribeEvent(eventName, handler));
      }
   }

   /**
    * Once listens to an event once then auto unsubscribes from that event
    *
    * @param eventName The name of the event to subscribe to once
    * @param handler   The handler of the event that will be auto unsubscribed
    */
   public once(eventName: string, handler: (event?: GameEvent<any>) => void) {

      let metaHandler = (event?: GameEvent<any>) => {
         let ev = event || new GameEvent();
         ev.target = ev.target || this._target;

         this.off(eventName, handler);
         handler.call(ev.target, ev);
      };

      this.on(eventName, metaHandler);
   }

   /**
    * Wires this event dispatcher to also recieve events from another
    */
   public wire(eventDispatcher: EventDispatcher): void {
      eventDispatcher._wiredEventDispatchers.push(this);
   }

   /**
    * Unwires this event dispatcher from another
    */
   public unwire(eventDispatcher: EventDispatcher): void {
      var index = eventDispatcher._wiredEventDispatchers.indexOf(this);
      if (index > -1) {
         eventDispatcher._wiredEventDispatchers.splice(index, 1);
      }

   }

}