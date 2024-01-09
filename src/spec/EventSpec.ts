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

    pubsub.off('event'); // clear all handlers
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

  it('will handle remove invalid handler', () => {
    const eventSpy1 = jasmine.createSpy('handler');
    const eventSpy2 = jasmine.createSpy('handler');
    const eventSpy3 = jasmine.createSpy('handler');
    const dispatcher = new ex.EventDispatcher();
    dispatcher.on('foo', () => eventSpy1());
    dispatcher.on('foo', () => eventSpy2());
    dispatcher.on('foo', () => eventSpy3());
    dispatcher.off('foo', () => 'invalid');
    dispatcher.emit('foo', null);

    expect(eventSpy1).toHaveBeenCalled();
    expect(eventSpy2).toHaveBeenCalled();
    expect(eventSpy3).toHaveBeenCalled();
    expect(eventSpy1).toHaveBeenCalledBefore(eventSpy2);
    expect(eventSpy2).toHaveBeenCalledBefore(eventSpy3);
  });

  it('once will remove the handler correctly', () => {
    const eventSpy1 = jasmine.createSpy('handler');
    const eventSpy2 = jasmine.createSpy('handler');
    const eventSpy3 = jasmine.createSpy('handler');
    const dispatcher = new ex.EventDispatcher();
    dispatcher.once('foo', () => eventSpy1());
    dispatcher.on('foo', () => eventSpy2());
    dispatcher.on('foo', () => eventSpy3());
    dispatcher.emit('foo', null);
    dispatcher.emit('foo', null);

    expect(eventSpy1).toHaveBeenCalledTimes(1);
    expect(eventSpy2).toHaveBeenCalledTimes(2);
    expect(eventSpy3).toHaveBeenCalledTimes(2);
  });

  it('should not fail if event handlers change during iteration', () => {
    expect(() => {
      const dispatcher = new ex.EventDispatcher();
      dispatcher.once('foo', () => 'foo1');
      dispatcher.on('foo', () => 'foo2');
      dispatcher.on('foo', () => 'foo3');
      dispatcher.emit('foo', null);
    }).not.toThrow();
  });

  it('converts undefined value to GameEvent', () => {
    const newPubSub = new ex.EventDispatcher();
    pubsub.wire(newPubSub);

    let value;
    pubsub.on('someevent', (v) => {
      value = v;
    });

    newPubSub.emit('someevent', undefined);
    expect(value).toBeInstanceOf(ex.GameEvent);
  });

  it('converts null value to GameEvent', () => {
    const newPubSub = new ex.EventDispatcher();
    pubsub.wire(newPubSub);

    let value;
    pubsub.on('someevent', (v) => {
      value = v;
    });

    newPubSub.emit('someevent', null);
    expect(value).toBeInstanceOf(ex.GameEvent);
  });

  // issue #2418
  it('preserves falsy event value', () => {
    const newPubSub = new ex.EventDispatcher();
    pubsub.wire(newPubSub);

    let value;
    pubsub.on('someevent', (v) => {
      value = v;
    });

    // emit is typed to take a GameEvent, but inherting classes take `any`
    newPubSub.emit('someevent', 0 as any);
    expect(value).toBe(0);
  });
});
