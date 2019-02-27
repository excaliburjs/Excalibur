import * as ex from '../../build/dist/excalibur';

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
    pubsub.on('event', function() {
      eventFired = true;
    });
    pubsub.emit('event');
    expect(eventFired).toBeTruthy();
  });

  it('can published against a target', () => {
    var targetContext = null;
    var target = new ex.Actor();

    pubsub = new ex.EventDispatcher(target);
    pubsub.on('event', function() {
      targetContext = this;
    });
    pubsub.emit('event');
    expect(target).toBe(targetContext);
  });

  it('has an emit alias for publish', () => {
    var eventFired = false;
    pubsub.on('event', function() {
      eventFired = true;
    });
    pubsub.emit('event');
    expect(eventFired).toBeTruthy();
  });

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

  it('can listen to a handler only once', () => {
    let pubsub = new ex.EventDispatcher(null);

    let callCount = 0;
    pubsub.once('onlyonce', () => {
      callCount++;
    });

    pubsub.emit('onlyonce');
    pubsub.emit('onlyonce');
    pubsub.emit('onlyonce');

    expect(callCount).toBe(1, 'There should only be one call to the handler with once.');
  });
});
