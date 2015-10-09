/// <reference path="Events.ts" />

module ex {

   /**
    * Excalibur's internal event dispatcher implementation. 
    * Callbacks are fired immediately after an event is published.
    * Typically you'd use [[Class.eventDispatcher]] since most classes in
    * Excalibur inherit from [[Class]]. You'd rarely create an `EventDispatcher`
    * yourself.
    *
    * When working with events, be sure to keep in mind the order of subscriptions
    * and try not to create a situation that requires specific things to happen in
    * order. Events are best used for input events, tying together disparate objects, 
    * or for UI updates.
    *
    * ## Example: Actor events
    *
    * Actors implement an EventDispatcher ([[Actor.eventDispatcher]]) so they can 
    * send and receive events. For example, they can enable Pointer events (mouse/touch)
    * and you can respond to them by subscribing to the event names.
    *
    * You can also emit any other kind of event for your game just by using a custom
    * `string` value and implementing a class that inherits from [[GameEvent]].
    *
    * ```js
    * var player = new ex.Actor(...);
    * 
    * // Enable pointer events for this actor
    * player.enableCapturePointer = true;
    *
    * // subscribe to pointerdown event
    * player.on("pointerdown", function (evt: ex.Input.PointerEvent) {
    *   console.log("Player was clicked!");
    * });
    *
    * // turn off subscription
    * player.off("pointerdown");
    *
    * // subscribe to custom event
    * player.on("death", function (evt) {
    *   console.log("Player died:", evt);
    * });
    *
    * // trigger custom event
    * player.emit("death", new DeathEvent());
    *
    * ```
    *
    * ## Example: Pub/Sub with Excalibur
    *
    * You can also create an EventDispatcher for any arbitrary object, for example
    * a global game event aggregator (`vent`). Anything in your game can subscribe to
    * it, if the event aggregator is in the global scope.
    *
    * *Warning:* This can easily get out of hand. Avoid this usage, it just serves as
    * an example.
    *
    * ```js
    * // create a publisher on an empty object
    * var vent = new ex.EventDispatcher({});
    *
    * // handler for an event
    * var subscription = function (event) {
    *   console.log(event);
    * }
    *
    * // add a subscription
    * vent.subscribe("someevent", subscription);
    *
    * // publish an event somewhere in the game
    * vent.publish("someevent", new ex.GameEvent());
    * ```
    */
   export class EventDispatcher {
      private _handlers: { [key: string]: { (event?: GameEvent): void }[]; } = {};
      private _wiredEventDispatchers: EventDispatcher[] = [];

      private _target: any;
      private _log: Logger = Logger.getInstance();

      /**
       * @param target  The object that will be the recipient of events from this event dispatcher
       */
      constructor(target) {
         this._target = target;
      }

      /**
       * Publish an event for target
       * @param eventName  The name of the event to publish
       * @param event      Optionally pass an event data object to the handler
       */
      public publish(eventName: string, event?: GameEvent) {
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
            this._wiredEventDispatchers[i].publish(eventName, event);
         }

      }

      /**
       * Alias for [[publish]], publishes an event for target
       * @param eventName  The name of the event to publish
       * @param event      Optionally pass an event data object to the handler
       */
      public emit(eventName: string, event?: GameEvent) {
         this.publish(eventName, event);
      }

      /**
       * Subscribe an event handler to a particular event name, multiple handlers per event name are allowed.
       * @param eventName  The name of the event to subscribe to
       * @param handler    The handler callback to fire on this event
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
       * Unsubscribe an event handler(s) from an event. If a specific handler
       * is specified for an event, only that handler will be unsubscribed. 
       * Otherwise all handlers will be unsubscribed for that event.
       *
       * @param eventName  The name of the event to unsubscribe
       * @param handler    Optionally the specific handler to unsubscribe
       *
       */
      public unsubscribe(eventName: string, handler?: (event?: GameEvent) => void) {
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
}