import * as ex from '@excalibur';
import { TestUtils } from '../__util__/test-utils';

describe('A camera', () => {
  let Camera: ex.Camera;
  let actor: ex.Actor;
  let engine: ex.Engine;
  let scene: ex.Scene;

  beforeEach(() => {
    actor = new ex.Actor({
      width: 10,
      height: 10
    });

    // mock engine
    engine = TestUtils.engine({
      width: 500,
      height: 500,
      antialiasing: false
    });

    engine.backgroundColor = ex.Color.Blue;

    actor.pos.x = 250;
    actor.pos.y = 250;
    actor.color = ex.Color.Red;
    scene = new ex.Scene();
    scene.add(actor);
    engine.addScene('root', scene);

    Camera = new ex.Camera();
    Camera._initialize(engine);
  });

  afterEach(() => {
    engine.stop();
    engine.dispose();
    engine = null;
    vi.restoreAllMocks();
  });

  it('should be center screen by default (when loading not complete)', () => {
    engine.dispose();
    engine = null;
    engine = TestUtils.engine({
      viewport: { width: 100, height: 100 },
      resolution: { width: 1000, height: 1200 }
    });
    engine.screen.pushResolutionAndViewport();
    engine.screen.resolution = { width: 100, height: 1000 };
    vi.spyOn(engine, 'loadingComplete', 'get').mockImplementation(() => false);
    vi.spyOn(engine.screen, 'peekResolution');

    const sut = new ex.Camera();
    sut.zoom = 2; // zoom should not change the center position
    sut._initialize(engine);

    expect(sut.pos).toBeVector(ex.vec(500, 600));
    expect(engine.screen.peekResolution).toHaveBeenCalled();
  });

  it('should run strategies on initialize for the first frame', () => {
    engine.dispose();
    engine = null;
    engine = TestUtils.engine({
      viewport: { width: 100, height: 100 },
      resolution: { width: 1000, height: 1200 }
    });

    const sut = new ex.Camera();

    vi.spyOn(sut, 'runStrategies');
    sut._initialize(engine);

    expect(sut.runStrategies).toHaveBeenCalledTimes(1);
  });

  it('should update viewport on initialize for the first frame', () => {
    engine.dispose();
    engine = null;
    engine = TestUtils.engine({
      viewport: { width: 100, height: 100 },
      resolution: { width: 1000, height: 1200 }
    });

    const sut = new ex.Camera();
    expect(sut.viewport).toEqual(new ex.BoundingBox());
    vi.spyOn(sut, 'updateViewport');
    sut._initialize(engine);

    expect(sut.viewport).toEqual(ex.BoundingBox.fromDimension(1000, 1200, ex.Vector.Zero));
    expect(sut.updateViewport).toHaveBeenCalledTimes(1);
  });

  it('should be center screen by default (when loading complete)', () => {
    engine.dispose();
    engine = null;
    engine = TestUtils.engine({
      viewport: { width: 100, height: 100 },
      resolution: { width: 1000, height: 1200 }
    });

    vi.spyOn(engine, 'loadingComplete', 'get').mockImplementation(() => true);
    vi.spyOn(engine.screen, 'peekResolution');
    const sut = new ex.Camera();
    sut.zoom = 2; // zoom should not change the center position
    sut._initialize(engine);

    expect(sut.pos).toBeVector(ex.vec(500, 600));
    expect(engine.screen.peekResolution).not.toHaveBeenCalled();
  });

  it('can focus on a point', () => {
    // set the focus with positional attributes
    Camera.x = 10;
    Camera.y = 20;

    expect(Camera.getFocus().x).toBe(10);
    expect(Camera.getFocus().y).toBe(20);

    Camera.x = 20;
    Camera.y = 10;

    expect(Camera.getFocus().x).toBe(20);
    expect(Camera.getFocus().y).toBe(10);
  });

  it('can move to a point', () => {
    Camera.x = 10;
    Camera.y = 20;

    // verify initial position
    expect(Camera.getFocus().x).toBe(10);
    expect(Camera.getFocus().y).toBe(20);

    // move (1000ms)
    Camera.move(new ex.Vector(20, 10), 1000);

    // shouldn't have moved already
    expect(Camera.getFocus().x).toBe(10);
    expect(Camera.getFocus().y).toBe(20);

    // wait 11 frames (1100ms)
    for (let i = 0; i < 11; i++) {
      Camera.update(engine, 100);
    }

    // should be at new position
    expect(Camera.getFocus().x).toBe(20);
    expect(Camera.getFocus().y).toBe(10);
  });

  it('can have its position set 2 ways', () => {
    Camera.x = 100;
    Camera.y = 1000;
    expect(Camera.pos).toBeVector(new ex.Vector(100, 1000));
    expect(Camera.x).toBe(100);
    expect(Camera.y).toBe(1000);

    Camera.pos = ex.vec(55, 555);
    expect(Camera.pos).toBeVector(new ex.Vector(55, 555));
    expect(Camera.x).toBe(55);
    expect(Camera.y).toBe(555);
  });

  it('can be rotated', () => {
    Camera._initialize(engine);
    Camera.rotation = Math.PI / 2;

    Camera.updateTransform(Camera.pos);

    expect(Camera.transform.getRotation()).toBe(Math.PI / 2);
  });

  it('can have its velocity set 2 ways', () => {
    Camera.dx = 100;
    Camera.dy = 1000;
    expect(Camera.vel).toBeVector(new ex.Vector(100, 1000));
    expect(Camera.dx).toBe(100);
    expect(Camera.dy).toBe(1000);

    Camera.vel = ex.vec(55, 555);
    expect(Camera.vel).toBeVector(new ex.Vector(55, 555));
    expect(Camera.dx).toBe(55);
    expect(Camera.dy).toBe(555);
  });

  it('can have its acceleration set 2 ways', () => {
    Camera.ax = 100;
    Camera.ay = 1000;
    expect(Camera.acc).toBeVector(new ex.Vector(100, 1000));
    expect(Camera.ax).toBe(100);
    expect(Camera.ay).toBe(1000);

    Camera.acc = ex.vec(55, 555);
    expect(Camera.acc).toBeVector(new ex.Vector(55, 555));
    expect(Camera.ax).toBe(55);
    expect(Camera.ay).toBe(555);
  });

  it('can chain moves from various points', () => {
    Camera.x = 10;
    Camera.y = 20;

    // verify initial position
    expect(Camera.x).toBe(10);
    expect(Camera.y).toBe(20);

    Camera.move(new ex.Vector(20, 10), 1000).then(() => {
      Camera.move(new ex.Vector(0, 0), 1000).then(() => {
        Camera.move(new ex.Vector(100, 100), 1000);
        // wait 11 frames (1100ms)
        for (let i = 0; i < 11; i++) {
          Camera.update(engine, 100);
        }

        // should be at new position
        expect(Camera.x).toBe(100);
        expect(Camera.y).toBe(100);
      });

      // wait 11 frames (1100ms)
      for (let i = 0; i < 11; i++) {
        Camera.update(engine, 100);
      }

      // should be at new position
      expect(Camera.x).toBe(0);
      expect(Camera.y).toBe(0);
    });

    // wait 11 frames (1100ms)
    for (let i = 0; i < 11; i++) {
      Camera.update(engine, 100);
    }

    // should be at new position
    expect(Camera.x).toBe(20);
    expect(Camera.y).toBe(10);
  });

  it('can shake', () => {
    engine.currentScene.camera = Camera;
    engine.currentScene.camera.strategy.lockToActor(actor);
    Camera.shake(5, 5, 5000);

    expect((Camera as any)._isShaking).toBe(true);
  });

  it('can zoom', () => {
    engine.currentScene.camera = Camera;
    Camera.zoomOverTime(2, 0.1);

    expect((Camera as any)._isZooming).toBe(true);
  });

  it('can use built-in locked camera strategy', () => {
    engine.currentScene.camera = new ex.Camera();
    const actor = new ex.Actor();

    engine.currentScene.camera.strategy.lockToActor(actor);

    engine.currentScene.camera.update(engine, 100);
    expect(engine.currentScene.camera.x).toBe(0);
    expect(engine.currentScene.camera.y).toBe(0);

    actor.pos = ex.vec(100, 100);
    engine.currentScene.camera.update(engine, 100);
    expect(engine.currentScene.camera.x).toBe(100);
    expect(engine.currentScene.camera.y).toBe(100);
  });

  it('can use built-in locked camera x axis strategy', () => {
    engine.currentScene.camera = new ex.Camera();
    engine.currentScene.camera.pos = ex.Vector.Zero;
    const actor = new ex.Actor({ x: 0, y: 0 });

    engine.currentScene.camera.strategy.lockToActorAxis(actor, ex.Axis.X);

    engine.currentScene.camera.update(engine, 100);
    expect(engine.currentScene.camera.x).toBe(0);
    expect(engine.currentScene.camera.y).toBe(0);

    actor.pos = ex.vec(100, 100);
    engine.currentScene.camera.update(engine, 100);
    expect(engine.currentScene.camera.x).toBe(100);
    expect(engine.currentScene.camera.y).toBe(0);
  });

  it('can use built-in locked camera y axis strategy', () => {
    engine.currentScene.camera = new ex.Camera();
    engine.currentScene.camera.pos = ex.Vector.Zero;
    const actor = new ex.Actor({ x: 0, y: 0 });

    engine.currentScene.camera.strategy.lockToActorAxis(actor, ex.Axis.Y);

    engine.currentScene.camera.update(engine, 100);
    expect(engine.currentScene.camera.x).toBe(0);
    expect(engine.currentScene.camera.y).toBe(0);

    actor.pos = ex.vec(100, 100);
    engine.currentScene.camera.update(engine, 100);
    expect(engine.currentScene.camera.x).toBe(0);
    expect(engine.currentScene.camera.y).toBe(100);
  });

  it('can use built-in radius around actor strategy', () => {
    engine.currentScene.camera = new ex.Camera();
    engine.currentScene.camera.pos = ex.Vector.Zero;
    const actor = new ex.Actor({ x: 0, y: 0 });

    engine.currentScene.camera.strategy.radiusAroundActor(actor, 15);

    engine.currentScene.camera.update(engine, 100);
    expect(engine.currentScene.camera.x).toBe(0);
    expect(engine.currentScene.camera.y).toBe(0);

    actor.pos = ex.vec(100, 100);
    engine.currentScene.camera.update(engine, 100);
    const distance = engine.currentScene.camera.pos.distance(actor.pos);
    expect(distance).toBeCloseTo(15, 0.01);
  });

  it('can use built-in elastic around actor strategy', () => {
    engine.currentScene.camera = new ex.Camera();
    engine.currentScene.camera.pos = ex.vec(0, 0);
    const actor = new ex.Actor();

    engine.currentScene.camera.strategy.elasticToActor(actor, 0.05, 0.1);

    engine.currentScene.camera.update(engine, 100);
    expect(engine.currentScene.camera.x).toBe(0);
    expect(engine.currentScene.camera.y).toBe(0);

    actor.pos = ex.vec(100, 100);
    engine.currentScene.camera.update(engine, 100);
    engine.currentScene.camera.update(engine, 100);
    engine.currentScene.camera.update(engine, 100);
    const distance = engine.currentScene.camera.pos.distance(actor.pos);
    expect(distance).toBeLessThan(new ex.Vector(100, 100).distance());

    engine.currentScene.camera.update(engine, 100);
    engine.currentScene.camera.update(engine, 100);
    engine.currentScene.camera.update(engine, 100);
    const distance2 = engine.currentScene.camera.pos.distance(actor.pos);
    expect(distance2).toBeLessThan(distance);
  });

  it('can use built-in limit to bounds strategy', () => {
    engine.currentScene.camera = new ex.Camera();
    const boundingBox = new ex.BoundingBox(10, 10, 1000, 1000);
    engine.currentScene.camera.strategy.limitCameraBounds(boundingBox);

    // Test upper-left bounds
    engine.currentScene.camera.pos = ex.vec(11, 22);

    engine.currentScene.camera.update(engine, 1);
    expect(engine.currentScene.camera.pos.x).not.toBe(11);
    expect(engine.currentScene.camera.pos.y).not.toBe(22);
    expect(engine.currentScene.camera.pos.x).toBe(260); // screen half size + top-left bounds
    expect(engine.currentScene.camera.pos.y).toBe(260);

    // Test bottom-right bounds
    engine.currentScene.camera.pos = ex.vec(888, 999);

    engine.currentScene.camera.update(engine, 1);
    expect(engine.currentScene.camera.pos.x).not.toBe(888);
    expect(engine.currentScene.camera.pos.y).not.toBe(999);
    expect(engine.currentScene.camera.pos.x).toBe(750);
    expect(engine.currentScene.camera.pos.y).toBe(750);
  });

  it('can add a single strategy', () => {
    const strategy = new ex.LockCameraToActorStrategy(actor);
    engine.currentScene.camera = new ex.Camera();

    engine.currentScene.camera.addStrategy(strategy);

    expect(engine.currentScene.camera.strategies).toEqual([strategy]);
  });

  it('can add multiple strategies', () => {
    const strategyA = new ex.LockCameraToActorStrategy(actor);
    const strategyB = new ex.LimitCameraBoundsStrategy(new ex.BoundingBox(10, 10, 1000, 1000));
    const strategyC = new ex.ElasticToActorStrategy(actor, 0.5, 0.2);
    engine.currentScene.camera = new ex.Camera();

    engine.currentScene.camera.addStrategy(strategyA, strategyB, strategyC);

    expect(engine.currentScene.camera.strategies).toEqual([strategyA, strategyB, strategyC]);
  });

  it('can set strategies', () => {
    const strategyA = new ex.LockCameraToActorStrategy(actor);
    const strategyB = new ex.LimitCameraBoundsStrategy(new ex.BoundingBox(10, 10, 1000, 1000));
    const strategyC = new ex.ElasticToActorStrategy(actor, 0.5, 0.2);
    engine.currentScene.camera = new ex.Camera();

    engine.currentScene.camera.addStrategy(strategyA);
    engine.currentScene.camera.setStrategies([strategyB, strategyC]);

    expect(engine.currentScene.camera.strategies).toEqual([strategyB, strategyC]);
  });

  it('can remove strategies', () => {
    const strategyA = new ex.LockCameraToActorStrategy(actor);
    const strategyB = new ex.LimitCameraBoundsStrategy(new ex.BoundingBox(10, 10, 1000, 1000));
    engine.currentScene.camera = new ex.Camera();

    engine.currentScene.camera.setStrategies([strategyA, strategyB]);
    engine.currentScene.camera.removeStrategy(strategyA);

    expect(engine.currentScene.camera.strategies).toEqual([strategyB]);
  });

  it('can clear all strategies', () => {
    const strategyA = new ex.LockCameraToActorStrategy(actor);
    const strategyB = new ex.LimitCameraBoundsStrategy(new ex.BoundingBox(10, 10, 1000, 1000));
    engine.currentScene.camera = new ex.Camera();

    engine.currentScene.camera.setStrategies([strategyA, strategyB]);
    engine.currentScene.camera.clearAllStrategies();

    expect(engine.currentScene.camera.strategies).toEqual([]);
  });

  it('can lerp over time', () =>
    new Promise<void>((done) => {
      engine.currentScene.camera.move(new ex.Vector(100, 100), 1000, ex.easeOutCubic).then(() => {
        engine.currentScene.camera.move(new ex.Vector(200, 200), 1000, ex.linear).then(() => {
          expect(engine.currentScene.camera.pos.x).toBe(200);
          expect(engine.currentScene.camera.pos.y).toBe(200);
          done();
        });
        engine.currentScene.camera.update(engine, 999);
        engine.currentScene.camera.update(engine, 1);
        engine.currentScene.camera.update(engine, 1);
      });

      engine.currentScene.camera.update(engine, 999);
      engine.currentScene.camera.update(engine, 1);
      engine.currentScene.camera.update(engine, 1);
    }));

  describe('lifecycle overrides', () => {
    let camera: ex.Camera;
    let engine: ex.Engine;

    beforeEach(() => {
      camera = new ex.Camera();
      engine = TestUtils.engine();
    });
    afterEach(() => {
      engine.dispose();
      engine = null;
    });

    it('can have onInitialize overridden safely', () => {
      let initCalled = false;
      camera.onInitialize = (engine) => {
        expect(engine).not.toBe(null);
      };

      camera.on('initialize', () => {
        initCalled = true;
      });

      vi.spyOn(camera, 'onInitialize');

      camera.update(engine, 100);

      expect(initCalled).toBe(true);
      expect(camera.onInitialize).toHaveBeenCalledTimes(1);
    });

    it('can have onPostUpdate overridden safely', () => {
      camera.onPostUpdate = (engine, elapsedMs) => {
        expect(engine).not.toBe(null);
        expect(elapsedMs).toBe(100);
      };

      vi.spyOn(camera, 'onPostUpdate');
      vi.spyOn(camera, '_postupdate');

      camera.update(engine, 100);
      camera.update(engine, 100);

      expect(camera._postupdate).toHaveBeenCalledTimes(2);
      expect(camera.onPostUpdate).toHaveBeenCalledTimes(2);
    });

    it('can have onPreUpdate overridden safely', () => {
      camera.onPreUpdate = (engine, elapsedMs) => {
        expect(engine).not.toBe(null);
        expect(elapsedMs).toBe(100);
      };

      vi.spyOn(camera, 'onPreUpdate');
      vi.spyOn(camera, '_preupdate');

      camera.update(engine, 100);
      camera.update(engine, 100);

      expect(camera._preupdate).toHaveBeenCalledTimes(2);
      expect(camera.onPreUpdate).toHaveBeenCalledTimes(2);
    });
  });
});
