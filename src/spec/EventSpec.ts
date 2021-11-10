import * as ex from '@excalibur';

describe('An Event Dispatcher', () => {
  let pubsub: ex.EventDispatcher;
  beforeEach(() => {
    pubsub = new ex.EventDispatcher();
  });

  it('exists', () => {
    expect(ex.EventDispatcher).toBeDefined();
  });

  it('can be created', () => {
    expect(pubsub).toBeTruthy();
  });

  it('can publish events', () => {
    let eventFired = false;
    pubsub.on('event', function() {
      eventFired = true;
    });
    pubsub.emit('event', null);
    expect(eventFired).toBeTruthy();
  });

  it('cannot published against a target', () => {
    let targetContext = null;
    const target = new ex.Actor();

    pubsub = new ex.EventDispatcher();
    pubsub.on('event', function() {
      targetContext = this;
    });
    pubsub.emit('event', null);
    expect(target).not.toBe(targetContext);
  });

  it('has an emit alias for publish', () => {
    let eventFired = false;
    pubsub.on('event', function() {
      eventFired = true;
    });
    pubsub.emit('event', null);
    expect(eventFired).toBeTruthy();
  });

  it('has event handlers called in the right order', () => {
    const subscriptions: number[] = [];
    let eventHistory: number[];

    for (let i = 0; i < 5; i++) {
      subscriptions.push(i);
    }

    eventHistory = [];
    subscriptions.forEach((i) => pubsub.on('event', () => eventHistory.push(i)));
    pubsub.emit('event', null);
    expect(eventHistory).toEqual(subscriptions);

    pubsub.off('event');
    subscriptions.push(subscriptions.shift());

    eventHistory = [];
    subscriptions.forEach((i) => pubsub.on('event', () => eventHistory.push(i)));
    pubsub.emit('event', null);
    expect(eventHistory).toEqual(subscriptions);
  });

  it('can wire to other event dispatchers', () => {
    const newPubSub = new ex.EventDispatcher();
    pubsub.wire(newPubSub);

    let eventFired = false;
    pubsub.on('someevent', () => {
      eventFired = true;
    });

    newPubSub.emit('someevent', null);
    expect(eventFired).toBeTruthy();
  });

  it('can unwire from other event dispatchers', () => {
    const newPubSub = new ex.EventDispatcher();
    pubsub.wire(newPubSub);

    let eventFired = false;
    pubsub.on('someevent', () => {
      eventFired = true;
    });

    newPubSub.emit('someevent', null);

    expect(eventFired).toBeTruthy();

    let otherEvent = false;
    pubsub.on('otherevent', () => {
      otherEvent = true;
    });

    pubsub.unwire(newPubSub);
    newPubSub.emit('otherevent', null);
    expect(otherEvent).toBeFalsy();
  });

  it('can listen to a handler only once', () => {
    const pubsub = new ex.EventDispatcher();

    let callCount = 0;
    pubsub.once('onlyonce', () => {
      callCount++;
    });

    pubsub.emit('onlyonce', null);
    pubsub.emit('onlyonce', null);
    pubsub.emit('onlyonce', null);

    expect(callCount).toBe(1, 'There should only be one call to the handler with once.');
  });
});
