import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';
import { ExcaliburAsyncMatchers } from 'excalibur-jasmine';

describe('A Director', () => {
  beforeAll(() => {
    jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);
  });
  it('exists', () => {
    expect(ex.Director).toBeDefined();
  });

  it('can be constructed with a varied scene map', () => {
    const engine = TestUtils.engine();
    const sut = new ex.Director(engine, {
      scene1: new ex.Scene(),
      scene2: { scene: new ex.Scene() },
      scene3: { scene: ex.Scene },
      scene4: ex.Scene
    });

    expect(sut).toBeDefined();
    expect(sut.rootScene).not.toBe(null);
    expect(sut.getSceneInstance('scene1')).not.toBe(null);
    expect(sut.getSceneInstance('scene2')).not.toBe(null);
    expect(sut.getSceneInstance('scene3')).not.toBe(null);
    expect(sut.getSceneInstance('scene4')).not.toBe(null);
    engine.dispose();
  });

  it('can be constructed with a varied loaders', () => {
    const engine = TestUtils.engine();
    const sut = new ex.Director(engine, {
      scene1: new ex.Scene(),
      scene2: { scene: new ex.Scene(), loader: new ex.DefaultLoader() },
      scene3: { scene: ex.Scene, loader: ex.DefaultLoader },
      scene4: ex.Scene
    });

    expect(sut).toBeDefined();
    expect(sut.rootScene).not.toBe(null);
    expect(sut.getSceneInstance('scene1')).not.toBe(null);
    expect(sut.getSceneInstance('scene2')).not.toBe(null);
    expect(sut.getSceneInstance('scene3')).not.toBe(null);
    expect(sut.getSceneInstance('scene4')).not.toBe(null);
    engine.dispose();
  });

  it('can configure start, non deferred', async () => {
    const engine = TestUtils.engine();
    const clock = engine.clock as ex.TestClock;
    const scene1 = new ex.Scene();
    const scene2 = new ex.Scene();
    const sut = new ex.Director(engine, {
      scene1,
      scene2
    });
    sut.onInitialize();

    const fadeIn = new ex.FadeInOut({ direction: 'in', duration: 1000 });
    const loader = new ex.DefaultLoader();
    sut.configureStart('scene1', {
      inTransition: fadeIn,
      loader
    });
    await engine.load(loader);
    await TestUtils.flushMicrotasks(clock, 5);

    expect(sut.currentTransition).toBe(fadeIn);
    expect(sut.currentSceneName).toBe('scene1');
    expect(sut.currentScene).toBe(scene1);
    engine.dispose();
  });

  it('can configure start deferred', async () => {
    const engine = TestUtils.engine();
    const scene1 = new ex.Scene();
    const scene2 = new ex.Scene();
    const sut = new ex.Director(engine, {
      scene1,
      scene2
    });
    const fadeIn = new ex.FadeInOut({ direction: 'in', duration: 1000 });
    const loader = new ex.DefaultLoader();
    sut.configureStart('scene1', {
      inTransition: fadeIn,
      loader
    });

    sut.onInitialize();
    await engine.load(loader);

    expect(sut.currentTransition).toBe(fadeIn);
    expect(sut.currentSceneName).toBe('scene1');
    expect(sut.currentScene).toBe(scene1);
    engine.dispose();
  });

  it('will draw a start scene transition', async () => {
    const engine = TestUtils.engine();
    const clock = engine.clock as ex.TestClock;
    clock.start();
    const scene1 = new ex.Scene();
    scene1._initialize(engine);
    const scene2 = new ex.Scene();
    scene2._initialize(engine);
    const sut = new ex.Director(engine, {
      scene1,
      scene2
    });
    sut.rootScene._initialize(engine);
    engine.rootScene._initialize(engine);
    const fadeIn = new ex.FadeInOut({ direction: 'in', duration: 1000 });
    engine.screen.setCurrentCamera(engine.currentScene.camera);
    fadeIn._initialize(engine);
    const loader = new ex.DefaultLoader();
    sut.configureStart('scene1', {
      inTransition: fadeIn,
      loader
    });

    sut.onInitialize();
    await engine.load(loader);
    await (engine as any)._overrideInitialize(engine);

    clock.step(100);
    clock.step(100);
    clock.step(100);
    clock.step(100);

    expect(sut.currentTransition).toBe(fadeIn);
    expect(sut.currentSceneName).toBe('scene1');
    expect(sut.currentScene).toBe(scene1);

    await expectAsync(engine.canvas).toEqualImage('/src/spec/images/DirectorSpec/fadein.png');
    engine.dispose();
  });

  it('will run the loader cycle on a scene only once', async () => {
    const engine = TestUtils.engine();
    const clock = engine.clock as ex.TestClock;
    clock.start();
    const scene1 = new ex.Scene();
    const loaderSpy = jasmine.createSpy('loader');
    scene1.onPreLoad = loaderSpy;
    const scene2 = new ex.Scene();
    const sut = new ex.Director(engine, {
      scene1,
      scene2
    });

    await sut.maybeLoadScene('scene1');
    await sut.maybeLoadScene('scene1');
    await sut.maybeLoadScene('scene1');
    await sut.maybeLoadScene('scene1');

    expect(loaderSpy).toHaveBeenCalledTimes(1);
    engine.dispose();
  });

  it('can remove a scene', () => {
    const engine = TestUtils.engine();
    const clock = engine.clock as ex.TestClock;
    clock.start();
    const sut = new ex.Director(engine, {
      scene1: new ex.Scene(),
      scene2: { scene: new ex.Scene() },
      scene3: { scene: ex.Scene },
      scene4: ex.Scene
    });

    sut.remove('scene1');
    expect(sut.getSceneDefinition('scene1')).toBe(undefined);
    expect(sut.getSceneInstance('scene1')).toBe(undefined);
    sut.remove('scene2');
    expect(sut.getSceneDefinition('scene2')).toBe(undefined);
    expect(sut.getSceneInstance('scene2')).toBe(undefined);
    sut.remove('scene3');
    expect(sut.getSceneDefinition('scene3')).toBe(undefined);
    expect(sut.getSceneInstance('scene3')).toBe(undefined);
    sut.remove('scene4');
    expect(sut.getSceneDefinition('scene4')).toBe(undefined);
    expect(sut.getSceneInstance('scene4')).toBe(undefined);
    engine.dispose();
  });

  it('cant remove an active scene', () => {
    const engine = TestUtils.engine();
    const clock = engine.clock as ex.TestClock;
    clock.start();
    const sut = new ex.Director(engine, {
      scene1: new ex.Scene(),
      scene2: { scene: new ex.Scene() },
      scene3: { scene: ex.Scene },
      scene4: ex.Scene
    });

    expect(() => sut.remove('root')).toThrowError('Cannot remove a currently active scene: root');
    expect(() => sut.remove(sut.rootScene)).toThrowError('Cannot remove a currently active scene: root');
    engine.dispose();
  });

  it('can add a scene that was already deleted', async () => {
    const engine = TestUtils.engine();
    const clock = engine.clock as ex.TestClock;
    clock.start();
    const scene1 = new ex.Scene();
    const scene2 = new ex.Scene();
    const sut = new ex.Director(engine, {
      scene1,
      scene2
    });
    sut.configureStart('scene1');
    sut.onInitialize();
    await sut.goto('scene2');
    expect(sut.currentScene).toBe(scene2);
    sut.remove('scene1');

    const newScene = new ex.Scene();
    sut.add('scene1', newScene);

    await sut.goto('scene1');
    expect(sut.currentScene).toBe(newScene);
    engine.dispose();
  });

  it('can goto a scene', async () => {
    const engine = TestUtils.engine();
    const clock = engine.clock as ex.TestClock;
    clock.start();
    const scene2 = new ex.Scene();
    class MyScene extends ex.Scene {}
    const sut = new ex.Director(engine, {
      scene1: new ex.Scene(),
      scene2: { scene: scene2 },
      scene3: { scene: ex.Scene },
      scene4: MyScene
    });
    sut.configureStart('root');

    sut.onInitialize();
    await engine.load(sut.mainLoader);
    await (engine as any)._overrideInitialize(engine);

    await sut.goto('scene2');

    expect(sut.currentScene).toBe(scene2);
    expect(sut.currentSceneName).toBe('scene2');

    await sut.goto('scene4');
    expect(sut.currentSceneName).toBe('scene4');
    expect(sut.currentScene).toBeInstanceOf(MyScene);
    engine.dispose();
  });
});
