import { GameEvent } from './Events';
import { EventDispatcher } from './EventDispatcher';
import { IEvented } from './Interfaces/IEvented';

/**
 * Excalibur base class that provides basic functionality such as [[EventDispatcher]]
 * and extending abilities for vanilla Javascript projects
 */
export class Class implements IEvented {

   /**
    * Direct access to the game object event dispatcher.
    */
   public eventDispatcher: EventDispatcher;

   constructor() {
      this.eventDispatcher = new EventDispatcher(this);
   }

   /**
    * Alias for `addEventListener`. You can listen for a variety of
    * events off of the engine; see the events section below for a complete list.
    * @param eventName  Name of the event to listen for
    * @param handler    Event handler for the thrown event
    */
   public on(eventName: string, handler: (event?: GameEvent) => void) {
      this.eventDispatcher.on(eventName, handler);
   }

   /**
    * Alias for `removeEventListener`. If only the eventName is specified
    * it will remove all handlers registered for that specific event. If the eventName
    * and the handler instance are specified only that handler will be removed.
    *
    * @param eventName  Name of the event to listen for
    * @param handler    Event handler for the thrown event
    */
   public off(eventName: string, handler?: (event?: GameEvent) => void) {
      this.eventDispatcher.off(eventName, handler);
   }

   /**
    * Emits a new event
    * @param eventName   Name of the event to emit
    * @param eventObject Data associated with this event
    */
   public emit(eventName: string, eventObject?: GameEvent) {
      this.eventDispatcher.emit(eventName, eventObject);
   }


   /**
    * You may wish to extend native Excalibur functionality in vanilla Javascript. 
    * Any method on a class inheriting [[Class]] may be extended to support 
    * additional functionality. In the example below we create a new type called `MyActor`.
    * 
    *
    * ```js
    * var MyActor = Actor.extend({
    *
    *    constructor: function() { 
    *       this.newprop = 'something';
    *       Actor.apply(this, arguments);
    *    },
    *
    *    update: function(engine, delta) {
    *       // Implement custom update 
    *       // Call super constructor update
    *       Actor.prototype.update.call(this, engine, delta);
    *
    *       console.log("Something cool!");
    *    }
    * });
    * 
    * var myActor = new MyActor(100, 100, 100, 100, Color.Azure);
    * ```
    *
    * In TypeScript, you only need to use the `extends` syntax, you do not need
    * to use this method of extension.
    *
    * @param methods A JSON object contain any methods/properties you want to extend
    */
   public static extend(methods: any): any {
      var parent: any = this;
      var child: any;

      if (methods && methods.hasOwnProperty('constructor')) {
         child = methods.constructor;
      } else {
         child = function (this: any) { return parent.apply(this, arguments); };
      }

      // Using constructor allows JS to lazily instantiate super classes
      var Super: any = function (this: any) { this.constructor = child; };
      Super.prototype = parent.prototype;
      child.prototype = new Super;

      if (methods) {
         for (var prop in methods) {
            if (methods.hasOwnProperty(prop)) {
               child.prototype[prop] = methods[prop];
            }
         }
      }

      // Make subclasses extendable
      child.extend = Class.extend;

      return child;
   }
}