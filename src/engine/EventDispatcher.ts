/// <reference path="Events.ts" />

module ex {
   /**
    * Excalibur's internal event dispatcher implementation. Callbacks are fired immediately after an event is published
    * @class EventDispatcher
    * @constructor
    * @param target {any} The object that will be the recipient of events from this event dispatcher
    */
   export class EventDispatcher {
      private _handlers: { [key: string]: { (event?: GameEvent): void }[]; } = {};
      private _wiredEventDispatchers: EventDispatcher[] = [];

      private _target: any;
      private _log: Logger = Logger.getInstance();
      constructor(target) {
         this._target = target;
      }

      /**
       * Publish an event for target
       * @method publish
       * @param eventName {string} The name of the event to publish
       * @param [event=undefined] {GameEvent} Optionally pass an event data object to the handler
       */
      public publish(eventName: string, event?: GameEvent) {
         if (!eventName) {
            // key not mapped
            return;
         }
         eventName = eventName.toLowerCase();
         var target = this._target;
         if(!event){
            event = new GameEvent();
         }
         event.target = target;
         if (this._handlers[eventName]) {
            this._handlers[eventName].forEach(function (callback) {
               callback.call(target, event);
            });
         }
      }

      /**
       * Alias for publish, publishs an event for target
       * @method emit
       * @param eventName {string} The name of the event to publish
       * @param [event=undefined] {GameEvent} Optionally pass an event data object to the handler
       */
      public emit(eventName: string, event?: GameEvent) {
         this.publish(eventName, event);
      }

      /**
       * Subscribe an event handler to a particular event name, multiple handlers per event name are allowed.
       * @method subscribe
       * @param eventName {string} The name of the event to subscribe to
       * @param handler {GameEvent=>void} The handler callback to fire on this event
       */
      public subscribe(eventName: string, handler: (event?: GameEvent) => void) {
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
       * Unsubscribe a event handler(s) from an event. If a specific handler
       * is specified for an event, only that handler will be unsubscribed. 
       * Otherwise all handlers will be unsubscribed for that event.
       * @method unsubscribe
       * @param eventName {string} The name of the event to unsubscribe
       * @param [handler=undefined] Optionally the specific handler to unsubscribe
       *
       */
      public unsubscribe(eventName: string, handler?: (event?: GameEvent) => void){
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
       * Wires this event dispatcher to also recieve events from another
       * @method wire
       * @param eventDispatcher {EventDispatcher}
       */
      public wire(eventDispatcher: EventDispatcher): void {
         eventDispatcher._wiredEventDispatchers.push(this);
      }

      /**
       * Unwires this event dispatcher from another
       * @method unwire
       * @param eventDispatcher {EventDispatcher}
       */
      public unwire(eventDispatcher: EventDispatcher): void {
         var index = eventDispatcher._wiredEventDispatchers.indexOf(this);
         if (index > -1) {
            eventDispatcher._wiredEventDispatchers.splice(index, 1);
         }

      }

   }
}