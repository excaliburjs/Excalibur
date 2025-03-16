import * as ex from '@excalibur';
import { type MockInstance } from 'vitest';

describe('A garbage collector', () => {
  let requestIdleCallback: MockInstance<typeof window.requestIdleCallback>;
  let cancelIdleCallback: MockInstance<typeof window.cancelIdleCallback>;

  it('exists', () => {
    expect(ex.GarbageCollector).toBeDefined();
  });

  beforeEach(() => {
    requestIdleCallback = vi.spyOn(window, 'requestIdleCallback');
    cancelIdleCallback = vi.spyOn(window, 'cancelIdleCallback');
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

    const collect = vi.fn(() => true);

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

    const collect = vi.fn(() => true);

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

    const collect = vi.fn(() => true);

    sut.start();
    sut.registerCollector('test', 100, collect);
    const resource = { my: 'cool resource' };
    sut.addCollectableResource('test', resource);
    sut.registerCollector('test2', 100, collect);
    const resource2 = { my: 'cool resource2' };
    sut.addCollectableResource('test2', resource2);

    sut.forceCollectAll();

    expect(collect.mock.calls[0]).toEqual([resource]);
    expect(collect.mock.calls[1]).toEqual([resource2]);
  });
});
