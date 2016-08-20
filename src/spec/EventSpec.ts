/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="Mocks.ts" />

describe('An Event Dispatcher', () => {
   var pubsub: ex.EventDispatcher;
   beforeEach(() => {
      pubsub = new ex.EventDispatcher(null);
   });

   it('exists', () => {
      expect(ex.EventDispatcher).toBeDefined();
   });

   it('can be created', () => {
      expect(pubsub).toBeTruthy();
   });

   it('can publish events', () => {
      var eventFired = false;
      pubsub.on('event', function () {
         eventFired = true;
      });
      pubsub.emit('event');
      expect(eventFired).toBeTruthy();
   });

   it('can published against a target', () => {
      var targetContext = null;
      var target = new ex.Actor();

      pubsub = new ex.EventDispatcher(target);
      pubsub.on('event', function () {
         targetContext = this;
      });
      pubsub.emit('event');
      expect(target).toBe(targetContext);

   });

   it('has an emit alias for publish', () => {
      var eventFired = false;
      pubsub.on('event', function () {
         eventFired = true;
      });
      pubsub.emit('event');
      expect(eventFired).toBeTruthy();
   });

   //it('has event handlers called in the right order', () => {
   //   //TODO
   //});

   //it('can be subscribed to', () => { }); //TODO

   //it('can be unsubscribed from', () => { }); //TODO

   it('can wire to other event dispatchers', () => {
      var newPubSub = new ex.EventDispatcher(null);
      pubsub.wire(newPubSub);

      var eventFired = false;
      pubsub.on('someevent', () => {
         eventFired = true;
      });
      
      newPubSub.emit('someevent', null);
      expect(eventFired).toBeTruthy();
   });

   it('can unwire from other event dispatchers', () => {
      var newPubSub = new ex.EventDispatcher(null);
      pubsub.wire(newPubSub);

      var eventFired = false;
      pubsub.on('someevent', () => {
         eventFired = true;
      });

      newPubSub.emit('someevent', null);

      expect(eventFired).toBeTruthy();

      var otherEvent = false;
      pubsub.on('otherevent', () => {
         otherEvent = true;
      });

      pubsub.unwire(newPubSub);
      newPubSub.emit('otherevent', null);
      expect(otherEvent).toBeFalsy();
   });

}); 