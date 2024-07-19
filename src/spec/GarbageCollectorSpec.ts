import * as ex from '@excalibur';

describe('A garbage collector', () => {
  let requestIdleCallback: jasmine.Spy<(typeof window)['requestIdleCallback']>;
  let cancelIdleCallback: jasmine.Spy<(typeof window)['cancelIdleCallback']>;

  it('exists', () => {
    expect(ex.GarbageCollector).toBeDefined();
  });

  beforeEach(() => {
    requestIdleCallback = spyOn(window, 'requestIdleCallback');
    cancelIdleCallback = spyOn(window, 'cancelIdleCallback');
  });

  it('can be started', () => {
    const currentTime = 0;
    const getTimestamp = () => currentTime;
    const sut = new ex.GarbageCollector({ getTimestamp });
    sut.start();
    expect(requestIdleCallback).toHaveBeenCalled();
  });

  it('can be stopped', () => {
    const currentTime = 0;
    const getTimestamp = () => currentTime;
    const sut = new ex.GarbageCollector({ getTimestamp });
    sut.start();
    sut.stop();
    expect(requestIdleCallback).toHaveBeenCalled();
    expect(cancelIdleCallback).toHaveBeenCalled();
  });

  it('can register a resource for collection that will be collected', () => {
    let currentTime = 0;
    const getTimestamp = () => currentTime;
    const sut = new ex.GarbageCollector({ getTimestamp });

    const collect = jasmine.createSpy('collect').and.returnValue(true);

    sut.start();
    sut.registerCollector('test', 100, collect);
    const resource = { my: 'cool resource' };
    sut.addCollectableResource('test', resource);
    sut.collectStaleResources();

    expect(collect).not.toHaveBeenCalled();

    currentTime = 101;
    sut.collectStaleResources();
    expect(collect).toHaveBeenCalled();
  });

  it('can register a resource for collection and touch will prevent collection', () => {
    let currentTime = 0;
    const getTimestamp = () => currentTime;
    const sut = new ex.GarbageCollector({ getTimestamp });

    const collect = jasmine.createSpy('collect').and.returnValue(true);

    sut.start();
    sut.registerCollector('test', 100, collect);
    const resource = { my: 'cool resource' };
    sut.addCollectableResource('test', resource);
    sut.collectStaleResources();

    expect(collect).not.toHaveBeenCalled();

    currentTime = 101;
    sut.touch(resource);
    sut.collectStaleResources();
    expect(collect).not.toHaveBeenCalled();

    currentTime = 202;
    sut.collectStaleResources();
    expect(collect).toHaveBeenCalled();
  });

  it('can force collect all resources', () => {
    const currentTime = 0;
    const getTimestamp = () => currentTime;
    const sut = new ex.GarbageCollector({ getTimestamp });

    const collect = jasmine.createSpy('collect').and.returnValue(true);

    sut.start();
    sut.registerCollector('test', 100, collect);
    const resource = { my: 'cool resource' };
    sut.addCollectableResource('test', resource);
    sut.registerCollector('test2', 100, collect);
    const resource2 = { my: 'cool resource2' };
    sut.addCollectableResource('test2', resource2);

    sut.forceCollectAll();

    expect(collect.calls.argsFor(0)).toEqual([resource]);
    expect(collect.calls.argsFor(1)).toEqual([resource2]);
  });
});
