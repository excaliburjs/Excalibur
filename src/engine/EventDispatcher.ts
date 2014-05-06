/// <reference path="Events.ts" />

module ex {
   /**
    * Excalibur's internal queueing event dispatcher. Callbacks are queued up and not fired until the update is called.
    * @class EventDispatcher
    * @constructor
    * @param target {any} The object that will be the recipient of events from this event dispatcher
    */
   export class EventDispatcher {
      private _handlers: { [key: string]: { (event?: GameEvent): void }[]; } = {};
      private queue: { (any: void): void }[] = [];
      private target: any;
      private log: Logger = Logger.getInstance();
      constructor(target) {
         this.target = target;
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
         var queue = this.queue;
         var target = this.target;
         if(!event){
            event = new GameEvent();
         }
         event.target = target;
         if (this._handlers[eventName]) {
            this._handlers[eventName].forEach(function (callback) {
               queue.push(function () {
                  callback.call(target, event);
               });
            });
         }
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
         
         if(eventHandlers){
            // if no explicit handler is give with the event name clear all handlers
            if(!handler){
               this._handlers[eventName].length = 0;
            }else {               
               var index = eventHandlers.indexOf(handler);
               this._handlers[eventName].splice(index, 1);               
            }
         }
      }

      /**
       * Dispatches all queued events to their handlers for execution.
       * @method update
       */
      public update() {
         var callback;
         while (callback = this.queue.shift()) {
            callback();
         }
      }

   }
}