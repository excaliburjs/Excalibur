import { GameEvent } from '../Events';

export interface IEvented {

   /**
    * Emits an event for target
    * @param eventName  The name of the event to publish
    * @param event      Optionally pass an event data object to the handler
    */
   emit(eventName: string, event?: GameEvent);

   /**
    * Subscribe an event handler to a particular event name, multiple handlers per event name are allowed.
    * @param eventName  The name of the event to subscribe to
    * @param handler    The handler callback to fire on this event
    */
   on(eventName: string, handler: (event?: GameEvent) => void);

   /**
    * Unsubscribe an event handler(s) from an event. If a specific handler
    * is specified for an event, only that handler will be unsubscribed. 
    * Otherwise all handlers will be unsubscribed for that event.
    *
    * @param eventName  The name of the event to unsubscribe
    * @param handler    Optionally the specific handler to unsubscribe
    *
    */
   off(eventName: string, handler: (event?: GameEvent) => void);
}