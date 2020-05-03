import { ExcaliburMatchers, ensureImagesLoaded } from 'excalibur-jasmine';
import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';
import { Mocks } from './util/Mocks';
import { BoundingBox } from '@excalibur';

describe('A camera', () => {
  let Camera;
  let actor: ex.Actor;
  let engine: ex.Engine;
  let scene: ex.Scene;
  const mock = new Mocks.Mocker();

  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    actor = new ex.Actor();

    // mock engine
    engine = TestUtils.engine({
      width: 500,
      height: 500
    });

    engine.setAntialiasing(false);

    engine.backgroundColor = ex.Color.Blue;

    actor.pos.x = 250;
    actor.width = 10;
    actor.pos.y = 250;
    actor.height = 10;
    actor.color = ex.Color.Red;
    scene = new ex.Scene(engine);
    scene.add(actor);
    engine.currentScene = scene;

    Camera = new ex.Camera();
  });

  afterEach(() => {
    engine.stop();
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

    Camera.pos.setTo(55, 555);
    expect(Camera.pos).toBeVector(new ex.Vector(55, 555));
    expect(Camera.x).toBe(55);
    expect(Camera.y).toBe(555);
  });

  it('can have its velocity set 2 ways', () => {
    Camera.dx = 100;
    Camera.dy = 1000;
    expect(Camera.vel).toBeVector(new ex.Vector(100, 1000));
    expect(Camera.dx).toBe(100);
    expect(Camera.dy).toBe(1000);

    Camera.vel.setTo(55, 555);
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

    Camera.acc.setTo(55, 555);
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
      });
    });

    // wait 11 frames (1100ms)
    for (let i = 0; i < 11; i++) {
      Camera.update(engine, 100);
    }

    // should be at new position
    expect(Camera.x).toBe(20);
    expect(Camera.y).toBe(10);

    // wait 11 frames (1100ms)
    for (let i = 0; i < 11; i++) {
      Camera.update(engine, 100);
    }

    // should be at new position
    expect(Camera.x).toBe(0);
    expect(Camera.y).toBe(0);

    // wait 11 frames (1100ms)
    for (let i = 0; i < 11; i++) {
      Camera.update(engine, 100);
    }

    // should be at new position
    expect(Camera.x).toBe(100);
    expect(Camera.y).toBe(100);
  });

  it('can shake', () => {
    engine.currentScene.camera = Camera;
    engine.currentScene.camera.strategy.lockToActor(actor);
    Camera.shake(5, 5, 5000);

    expect(Camera._isShaking).toBe(true);
  });

  it('can zoom', () => {
    engine.currentScene.camera = Camera;
    Camera.zoom(2, 0.1);

    expect(Camera._isZooming).toBe(true);
  });

  it('can use built-in locked camera strategy', () => {
    engine.currentScene.camera = new ex.Camera();
    const actor = new ex.Actor(0, 0);

    engine.currentScene.camera.strategy.lockToActor(actor);

    engine.currentScene.camera.update(engine, 100);
    expect(engine.currentScene.camera.x).toBe(0);
    expect(engine.currentScene.camera.y).toBe(0);

    actor.pos.setTo(100, 100);
    engine.currentScene.camera.update(engine, 100);
    expect(engine.currentScene.camera.x).toBe(100);
    expect(engine.currentScene.camera.y).toBe(100);
  });

  it('can use built-in locked camera x axis strategy', () => {
    engine.currentScene.camera = new ex.Camera();
    const actor = new ex.Actor(0, 0);

    engine.currentScene.camera.strategy.lockToActorAxis(actor, ex.Axis.X);

    engine.currentScene.camera.update(engine, 100);
    expect(engine.currentScene.camera.x).toBe(0);
    expect(engine.currentScene.camera.y).toBe(0);

    actor.pos.setTo(100, 100);
    engine.currentScene.camera.update(engine, 100);
    expect(engine.currentScene.camera.x).toBe(100);
    expect(engine.currentScene.camera.y).toBe(0);
  });

  it('can use built-in locked camera y axis strategy', () => {
    engine.currentScene.camera = new ex.Camera();
    const actor = new ex.Actor(0, 0);

    engine.currentScene.camera.strategy.lockToActorAxis(actor, ex.Axis.Y);

    engine.currentScene.camera.update(engine, 100);
    expect(engine.currentScene.camera.x).toBe(0);
    expect(engine.currentScene.camera.y).toBe(0);

    actor.pos.setTo(100, 100);
    engine.currentScene.camera.update(engine, 100);
    expect(engine.currentScene.camera.x).toBe(0);
    expect(engine.currentScene.camera.y).toBe(100);
  });

  it('can use built-in radius around actor strategy', () => {
    engine.currentScene.camera = new ex.Camera();
    const actor = new ex.Actor(0, 0);

    engine.currentScene.camera.strategy.radiusAroundActor(actor, 15);

    engine.currentScene.camera.update(engine, 100);
    expect(engine.currentScene.camera.x).toBe(0);
    expect(engine.currentScene.camera.y).toBe(0);

    actor.pos.setTo(100, 100);
    engine.currentScene.camera.update(engine, 100);
    const distance = engine.currentScene.camera.pos.distance(actor.pos);
    expect(distance).toBeCloseTo(15, 0.01);
  });

  it('can use built-in elastic around actor strategy', () => {
    engine.currentScene.camera = new ex.Camera();
    engine.currentScene.camera.pos.setTo(0, 0);
    const actor = new ex.Actor(0, 0);

    engine.currentScene.camera.strategy.elasticToActor(actor, 0.05, 0.1);

    engine.currentScene.camera.update(engine, 100);
    expect(engine.currentScene.camera.x).toBe(0);
    expect(engine.currentScene.camera.y).toBe(0);

    actor.pos.setTo(100, 100);
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
    const boundingBox = new BoundingBox(0, 0, 1000, 1000);
    engine.currentScene.camera.strategy.limitCameraBounds(boundingBox);

    // Test upper-left bounds
    engine.currentScene.camera.pos.setTo(11, 22);

    engine.currentScene.camera.update(engine, 1);
    expect(engine.currentScene.camera.pos.x).not.toBe(11);
    expect(engine.currentScene.camera.pos.y).not.toBe(22);
    expect(engine.currentScene.camera.pos.x).toBe(250);
    expect(engine.currentScene.camera.pos.y).toBe(250);

    // Test bottom-right bounds
    engine.currentScene.camera.pos.setTo(888, 999);

    engine.currentScene.camera.update(engine, 1);
    expect(engine.currentScene.camera.pos.x).not.toBe(888);
    expect(engine.currentScene.camera.pos.y).not.toBe(999);
    expect(engine.currentScene.camera.pos.x).toBe(750);
    expect(engine.currentScene.camera.pos.y).toBe(750);
  });

  it('can lerp over time', (done) => {
    engine.currentScene.camera.move(new ex.Vector(100, 100), 1000, ex.EasingFunctions.EaseOutCubic).then(() => {
      engine.currentScene.camera.move(new ex.Vector(200, 200), 1000, ex.EasingFunctions.Linear).then(() => {
        expect(engine.currentScene.camera.pos.x).toBe(200);
        expect(engine.currentScene.camera.pos.y).toBe(200);
        done();
      });
    });

    engine.currentScene.camera.update(engine, 999);
    engine.currentScene.camera.update(engine, 1);
    engine.currentScene.camera.update(engine, 1);
    engine.currentScene.camera.update(engine, 999);
    engine.currentScene.camera.update(engine, 1);
    engine.currentScene.camera.update(engine, 1);
  });

  xit('can zoom in over time', (done) => {
    engine.start().then(() => {
      engine.currentScene.camera.zoom(5, 1000).then(() => {
        ensureImagesLoaded(engine.canvas, 'src/spec/images/CameraSpec/zoomin.png').then(([canvas, image]) => {
          expect(canvas).toEqualImage(image, 0.995);
          done();
        });
      });
    });
  });

  xit('can zoom out over time', (done) => {
    engine.start().then(() => {
      engine.currentScene.camera.zoom(0.2, 1000).then(() => {
        ensureImagesLoaded(engine.canvas, 'src/spec/images/CameraSpec/zoomout.png').then(([canvas, image]) => {
          expect(canvas).toEqualImage(image, 0.995);
          done();
        });
      });
    });
  });

  describe('lifecycle overrides', () => {
    let camera: ex.Camera;

    beforeEach(() => {
      camera = new ex.Camera();
    });

    it('can have onInitialize overridden safely', () => {
      let initCalled = false;
      camera.onInitialize = (engine) => {
        expect(engine).not.toBe(null);
      };

      camera.on('initialize', () => {
        initCalled = true;
      });

      spyOn(camera, 'onInitialize').and.callThrough();

      camera.update(engine, 100);

      expect(initCalled).toBe(true);
      expect(camera.onInitialize).toHaveBeenCalledTimes(1);
    });

    it('can have onPostUpdate overridden safely', () => {
      camera.onPostUpdate = (engine, delta) => {
        expect(engine).not.toBe(null);
        expect(delta).toBe(100);
      };

      spyOn(camera, 'onPostUpdate').and.callThrough();
      spyOn(camera, '_postupdate').and.callThrough();

      camera.update(engine, 100);
      camera.update(engine, 100);

      expect(camera._postupdate).toHaveBeenCalledTimes(2);
      expect(camera.onPostUpdate).toHaveBeenCalledTimes(2);
    });

    it('can have onPreUpdate overridden safely', () => {
      camera.onPreUpdate = (engine, delta) => {
        expect(engine).not.toBe(null);
        expect(delta).toBe(100);
      };

      spyOn(camera, 'onPreUpdate').and.callThrough();
      spyOn(camera, '_preupdate').and.callThrough();

      camera.update(engine, 100);
      camera.update(engine, 100);

      expect(camera._preupdate).toHaveBeenCalledTimes(2);
      expect(camera.onPreUpdate).toHaveBeenCalledTimes(2);
    });
  });
});
