import * as ex from '../../build/dist/excalibur';

describe('An Event Dispatcher', () => {
  let pubsub: ex.EventDispatcher;
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
    let eventFired = false;
    pubsub.on('event', function() {
      eventFired = true;
    });
    pubsub.emit('event');
    expect(eventFired).toBeTruthy();
  });

  it('can published against a target', () => {
    let targetContext = null;
    const target = new ex.Actor();

    pubsub = new ex.EventDispatcher(target);
    pubsub.on('event', function() {
      targetContext = this;
    });
    pubsub.emit('event');
    expect(target).toBe(targetContext);
  });

  it('has an emit alias for publish', () => {
    let eventFired = false;
    pubsub.on('event', function() {
      eventFired = true;
    });
    pubsub.emit('event');
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
    pubsub.emit('event');
    expect(eventHistory).toEqual(subscriptions);

    pubsub.off('event');
    subscriptions.push(subscriptions.shift());

    eventHistory = [];
    subscriptions.forEach((i) => pubsub.on('event', () => eventHistory.push(i)));
    pubsub.emit('event');
    expect(eventHistory).toEqual(subscriptions);
  });

  //it('can be subscribed to', () => { }); //TODO

  //it('can be unsubscribed from', () => { }); //TODO

  it('can wire to other event dispatchers', () => {
    const newPubSub = new ex.EventDispatcher(null);
    pubsub.wire(newPubSub);

    let eventFired = false;
    pubsub.on('someevent', () => {
      eventFired = true;
    });

    newPubSub.emit('someevent', null);
    expect(eventFired).toBeTruthy();
  });

  it('can unwire from other event dispatchers', () => {
    const newPubSub = new ex.EventDispatcher(null);
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
    const pubsub = new ex.EventDispatcher(null);

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
