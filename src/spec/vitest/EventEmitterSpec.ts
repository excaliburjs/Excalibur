import * as ex from '@excalibur';

class FakeEvent {}

describe('An EventEmitter', () => {
  it('should exist', () => {
    expect(ex.EventEmitter).toBeDefined();
  });

  it('should be constructed', () => {
    const emitter = new ex.EventEmitter();
    expect(emitter).not.toBeNull();
  });

  it('can listen to events "on" multiple times', () => {
    const emitter = new ex.EventEmitter<{ someevent: FakeEvent }>();
    const evt = new FakeEvent();
    const handler = vi.fn();
    emitter.on('someevent', handler);

    emitter.emit('someevent', evt);
    emitter.emit('someevent', evt);
    emitter.emit('someevent', evt);

    expect(handler).toHaveBeenCalledTimes(3);
    expect(handler).toHaveBeenCalledWith(evt);
  });

  it('can listen to events "once" then unsubscribe', () => {
    const emitter = new ex.EventEmitter();
    const handler = vi.fn();
    emitter.once('someotherevent', handler);

    emitter.emit('someotherevent');
    emitter.emit('someotherevent');
    emitter.emit('someotherevent');

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(undefined);
  });

  it('can be closed when using "on"', () => {
    const emitter = new ex.EventEmitter();
    const handler = vi.fn();

    const sub = emitter.on('myevent', handler);

    emitter.emit('myevent');
    sub.close();
    emitter.emit('myevent');

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('can be closed when using "once"', () => {
    const emitter = new ex.EventEmitter();
    const handler = vi.fn();

    const sub = emitter.on('myevent', handler);
    sub.close();

    emitter.emit('myevent');
    emitter.emit('myevent');

    expect(handler).toHaveBeenCalledTimes(0);
  });

  it('can be switched off by name and handler', () => {
    const emitter = new ex.EventEmitter();
    const handler = vi.fn();

    emitter.on('myevent2', handler);
    emitter.on('myevent1', handler);

    emitter.emit('myevent2');
    emitter.emit('myevent1');

    emitter.off('myevent2', handler);

    emitter.emit('myevent2');
    emitter.emit('myevent1');

    expect(handler).toHaveBeenCalledTimes(3);
  });

  it('can be switched off by name and handler for multiple installs', () => {
    const emitter = new ex.EventEmitter();
    const handler = vi.fn();

    emitter.on('myevent2', handler);
    emitter.on('myevent2', handler);

    emitter.off('myevent2', handler);

    emitter.emit('myevent2');

    expect(handler).toHaveBeenCalledTimes(0);
  });

  it('can be switched off by name and handler for multiple installs in once', () => {
    const emitter = new ex.EventEmitter();
    const handler = vi.fn();

    emitter.once('myevent2', handler);
    emitter.once('myevent2', handler);

    emitter.off('myevent2', handler);

    emitter.emit('myevent2');

    expect(handler).toHaveBeenCalledTimes(0);
  });

  it('can be switched off by name and handler for "once"', () => {
    const emitter = new ex.EventEmitter();
    const handler = vi.fn();

    emitter.on('onetime', handler);

    emitter.off('onetime', handler);

    emitter.emit('onetime', handler);

    expect(handler).toHaveBeenCalledTimes(0);
  });

  it('can pipe events into other emitters', () => {
    const sceneEmitter = new ex.EventEmitter();
    const actorEmitter = new ex.EventEmitter();
    // Pipe actor events into scene
    const pipeSub = actorEmitter.pipe(sceneEmitter);

    const handler = vi.fn();

    sceneEmitter.on('myactorevent', handler);
    actorEmitter.emit('myactorevent');
    pipeSub.close();
    actorEmitter.emit('myactorevent');

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('can unpipe from other emitters', () => {
    const pubSub = new ex.EventEmitter();
    const newPubSub = new ex.EventEmitter<{ someevent: number; otherevent: number }>();
    newPubSub.pipe(pubSub);

    const handler = vi.fn();
    pubSub.on('someevent', handler);

    newPubSub.emit('someevent');

    expect(handler).toHaveBeenCalledTimes(1);

    const otherHandler = vi.fn();
    pubSub.on('otherevent', otherHandler);
    newPubSub.unpipe(pubSub);
    newPubSub.emit('otherevent');

    expect(otherHandler).not.toHaveBeenCalled();
  });

  it('can unpipe from other emitters via subscription.close()', () => {
    const pubSub = new ex.EventEmitter();
    const newPubSub = new ex.EventEmitter<{ someevent: number; otherevent: number }>();
    const sub = newPubSub.pipe(pubSub);

    const handler = vi.fn();
    pubSub.on('someevent', handler);

    newPubSub.emit('someevent');

    expect(handler).toHaveBeenCalledTimes(1);

    const otherHandler = vi.fn();
    pubSub.on('otherevent', otherHandler);

    sub.close();
    newPubSub.emit('otherevent');

    expect(otherHandler).not.toHaveBeenCalled();
  });

  it('cannot pipe to self', () => {
    const pubSub = new ex.EventEmitter();
    expect(() => {
      pubSub.pipe(pubSub);
    }).toThrowError('Cannot pipe to self');
  });

  it('can listen to a handler only once', () => {
    const pubsub = new ex.EventEmitter();

    const handler = vi.fn();

    pubsub.once('onlyonce', handler);

    pubsub.emit('onlyonce');
    pubsub.emit('onlyonce');
    pubsub.emit('onlyonce');

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('will handle remove invalid handler', () => {
    const eventSpy1 = vi.fn();
    const eventSpy2 = vi.fn();
    const eventSpy3 = vi.fn();
    const emitter = new ex.EventEmitter();
    emitter.on('foo', () => eventSpy1());
    emitter.on('foo', () => eventSpy2());
    emitter.on('foo', () => eventSpy3());
    emitter.off('foo', () => 'invalid');
    emitter.emit('foo', null);

    expect(eventSpy1).toHaveBeenCalled();
    expect(eventSpy2).toHaveBeenCalled();
    expect(eventSpy3).toHaveBeenCalled();
    expect(eventSpy1).toHaveBeenCalledBefore(eventSpy2);
    expect(eventSpy2).toHaveBeenCalledBefore(eventSpy3);
  });

  it('once will remove the handler correctly', () => {
    const eventSpy1 = vi.fn();
    const eventSpy2 = vi.fn();
    const eventSpy3 = vi.fn();
    const emitter = new ex.EventEmitter();
    emitter.once('foo', () => eventSpy1());
    emitter.on('foo', () => eventSpy2());
    emitter.on('foo', () => eventSpy3());
    emitter.emit('foo', null);
    emitter.emit('foo', null);

    expect(eventSpy1).toHaveBeenCalledTimes(1);
    expect(eventSpy2).toHaveBeenCalledTimes(2);
    expect(eventSpy3).toHaveBeenCalledTimes(2);
  });

  it('should not fail if event handlers change during iteration', () => {
    expect(() => {
      const dispatcher = new ex.EventEmitter();
      dispatcher.once('foo', () => 'foo1');
      dispatcher.on('foo', () => 'foo2');
      dispatcher.on('foo', () => 'foo3');
      dispatcher.emit('foo', null);
    }).not.toThrow();
  });

  // issue #2418
  it('preserves falsy event value', () => {
    const pubSub = new ex.EventEmitter();
    const newPubSub = new ex.EventEmitter();
    newPubSub.pipe(pubSub);

    let value;
    pubSub.on('someevent', (v) => {
      value = v;
    });

    // emit is typed to take a GameEvent, but inherting classes take `any`
    newPubSub.emit('someevent', 0);
    expect(value).toBe(0);
  });

  it('has event handlers called in the right order', () => {
    const pubsub = new ex.EventEmitter();

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
});
