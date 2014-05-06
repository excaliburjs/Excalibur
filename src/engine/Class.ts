/// <reference path="Events.ts" />

module ex {
   /**
    * Excalibur base class
    * @class Class
    * @constructor 
    */
   export class Class {
      /**
       * Direct access to the game object event dispatcher.
       * @property eventDispatcher {EventDispatcher}
       */
      public eventDispatcher: EventDispatcher;
      constructor(){
         this.eventDispatcher = new EventDispatcher(this);
      }

      /**
       * Add an event listener. You can listen for a variety of
       * events off of the engine; see the events section below for a complete list.
       * @method addEventListener
       * @param eventName {string} Name of the event to listen for
       * @param handler {event=>void} Event handler for the thrown event
       */
      public addEventListener(eventName: string, handler: (event?: GameEvent) => void) {
         this.eventDispatcher.subscribe(eventName, handler);
      }

      /**
       * Removes an event listener. If only the eventName is specified
       * it will remove all handlers registered for that specific event. If the eventName
       * and the handler instance are specified just that handler will be removed.
       *
       * @method removeEventListener
       * @param eventName {string} Name of the event to listen for
       * @param [handler=undefined] {event=>void} Event handler for the thrown event
       */
      public removeEventListener(eventName: string, handler?:(event?: GameEvent)=> void){
         this.eventDispatcher.unsubscribe(eventName, handler);
      }

      /**
       * Alias for "addEventListener". You can listen for a variety of
       * events off of the engine; see the events section below for a complete list.
       * @method on
       * @param eventName {string} Name of the event to listen for
       * @param handler {event=>void} Event handler for the thrown event
       */
      public on(eventName: string, handler: (event?: GameEvent) => void) {
         this.eventDispatcher.subscribe(eventName, handler);
      }
      /**
       * Alias for "removeEventListener". If only the eventName is specified
       * it will remove all handlers registered for that specific event. If the eventName
       * and the handler instance are specified only that handler will be removed.
       *
       * @method off
       * @param eventName {string} Name of the event to listen for
       * @param [handler=undefined] {event=>void} Event handler for the thrown event
       */
      public off(eventName: string, handler?:(event?: GameEvent)=> void){
         this.eventDispatcher.unsubscribe(eventName, handler);
      }

      /**
       * You may wish to extend native Excalibur functionality. Any method on 
       * actor may be extended to support additional functionaliy. In the 
       * example below we create a new type called "MyActor"
       * <br/><b>Example</b><pre>var MyActor = Actor.extend({
   constructor : function(){ 
      this.newprop = 'something';
      Actor.apply(this, arguments);
   },
   update : function(engine, delta){
      // Implement custom update 

         // Call super constructor update
         Actor.prototype.update.call(this, engine, delta);
         console.log("Something cool!");
   }
});
var myActor = new MyActor(100, 100, 100, 100, Color.Azure);</pre>
       * @method extend
       * @static
       * @param methods {any}
       */
      public static extend(methods: any): any{
          var parent: any = this;
          var child: any;

          if (methods && methods.hasOwnProperty('constructor')) {
            child = methods.constructor;
          } else {
            child = function(){ return parent.apply(this, arguments); };
          }

          // Using constructor allows JS to lazily instantiate super classes
          var Super: any = function(){ this.constructor = child; };
          Super.prototype = parent.prototype;
          child.prototype = new Super;

          if (methods){
            for(var prop in methods){
               if(methods.hasOwnProperty(prop)){
                  child.prototype[prop] = methods[prop];
               }
            }
          }

          // Make subclasses extendable
          child.extend = Class.extend;

          return child;
      }
   }
}