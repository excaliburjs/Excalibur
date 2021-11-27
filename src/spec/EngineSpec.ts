import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';
import { ExcaliburAsyncMatchers, ExcaliburMatchers } from 'excalibur-jasmine';
import { Engine } from '@excalibur';

describe('The engine', () => {
  let engine: ex.Engine;
  let scene: ex.Scene;

  const reset = () => {
    engine.stop();
    engine = null;
    (<any>window).devicePixelRatio = 1;
    const playButton = document.getElementById('excalibur-play');
    if (playButton) {
      const body = playButton.parentNode.parentNode;
      body.removeChild(playButton.parentNode);
    }
  };

  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);

    engine = TestUtils.engine();
    scene = new ex.Scene();
    engine.add('default', scene);
    engine.goToScene('default');
    engine.start();
    const clock = engine.clock as ex.TestClock;
    clock.step(1);
  });

  afterEach(() => {
    reset();
  });

  it('should show the play button by default', (done) => {
    reset();
    engine = TestUtils.engine({
      suppressPlayButton: false
    }, ['use-canvas-context']);
    (<any>engine)._suppressPlayButton = false;
    const imageSource = new ex.ImageSource('src/spec/images/SpriteSpec/icon.png');

    const loader = new ex.Loader([imageSource]);
    engine.start(loader);
    const testClock = engine.clock as ex.TestClock;

    loader.areResourcesLoaded().then(() => {
      testClock.run(2, 100); // 200 ms delay in loader
      expect(document.getElementById('excalibur-play')).withContext('Play button should exist in the document').toBeDefined();
      setTimeout(() => { // needed for the delay to work
        testClock.run(1, 100);
        expectAsync(engine.canvas).toEqualImage('src/spec/images/EngineSpec/engine-load-complete.png').then(() => {
          done();
        });
      });
    });
  });

  it('should have a default resolution to SVGA (800x600) if none specified', () => {
    const engine = new ex.Engine();
    expect(engine.screen.displayMode).toBe(ex.DisplayMode.FitScreen);
    expect(engine.screen.resolution.width).toBe(800);
    expect(engine.screen.resolution.height).toBe(600);
  });

  it('should not show the play button when suppressPlayButton is turned on', (done) => {
    reset();
    engine = TestUtils.engine({
      suppressPlayButton: true
    });
    engine.currentScene.add(
      new ex.Actor({
        pos: new ex.Vector(250, 250),
        width: 20,
        height: 20,
        color: ex.Color.Red
      })
    );

    const testClock = engine.clock as ex.TestClock;
    const loader = new ex.Loader([new ex.ImageSource('src/spec/images/SpriteSpec/icon.png')]);

    TestUtils.runToReady(engine, loader).then(() => {
      // With suppress play there is another 500 ms delay in engine load()
      testClock.step(1);
      expectAsync(engine.canvas).toEqualImage('src/spec/images/EngineSpec/engine-suppress-play.png').then(() => {
        done();
      });
    });
  });

  it('should emit a preframe event', () => {
    const fired = jasmine.createSpy('fired');
    engine.on('preframe', fired);
    expect(fired).not.toHaveBeenCalled();
    const clock = engine.clock as ex.TestClock;
    clock.step(1);
    clock.step(1);
    expect(fired).toHaveBeenCalledTimes(2);
  });

  it('should emit a postframe event', () => {
    const fired = jasmine.createSpy('fired');
    engine.on('postframe', fired);

    expect(fired).not.toHaveBeenCalled();
    const clock = engine.clock as ex.TestClock;
    clock.step(1);
    clock.step(1);
    expect(fired).toHaveBeenCalledTimes(2);
  });

  it('should emit a preupdate event', () => {
    const fired = jasmine.createSpy('fired');
    engine.on('preupdate', fired);
    expect(fired).not.toHaveBeenCalled();
    const clock = engine.clock as ex.TestClock;
    clock.step(1);
    clock.step(1);
    expect(fired).toHaveBeenCalledTimes(2);
  });

  it('should emit a postupdate event', () => {
    const fired = jasmine.createSpy('fired');
    engine.on('postupdate', fired);

    expect(fired).not.toHaveBeenCalled();
    const clock = engine.clock as ex.TestClock;
    clock.step(1);
    clock.step(1);
    expect(fired).toHaveBeenCalledTimes(2);
  });

  it('should emit a predraw event', () => {
    const fired = jasmine.createSpy('fired');
    engine.on('predraw', fired);

    expect(fired).not.toHaveBeenCalled();
    const clock = engine.clock as ex.TestClock;
    clock.step(1);
    clock.step(1);
    expect(fired).toHaveBeenCalledTimes(2);
  });

  it('should emit a postdraw event', () => {
    const fired = jasmine.createSpy('fired');
    engine.on('postdraw', fired);

    expect(fired).not.toHaveBeenCalled();
    const clock = engine.clock as ex.TestClock;
    clock.step(1);
    clock.step(1);
    expect(fired).toHaveBeenCalledTimes(2);
  });

  it('should tell engine is running', () => {
    const status = engine.isPaused();
    expect(status).toBe(false);
  });

  it('should tell engine is paused', () => {
    engine.stop();
    const status = engine.isPaused();
    expect(status).toBe(true);
  });

  it('should again tell engine is running', () => {
    engine.start();
    const status = engine.isPaused();
    expect(status).toBe(false);
  });

  it('should tell debug drawing is disabled', () => {
    const status = engine.isDebug;
    expect(status).toBe(false);
  });

  it('should enable and disable debug drawing', () => {
    engine.showDebug(true);
    expect(engine.isDebug).toBe(true);
    engine.showDebug(false);
    expect(engine.isDebug).toBe(false);
  });

  it('should toggle debug drawing', () => {
    expect(engine.isDebug).toBe(false);
    const result = engine.toggleDebug();
    expect(engine.isDebug).toBe(true);
    expect(result).toBe(true);
  });

  it('should return screen dimensions', () => {
    engine.start();
    const left = engine.screenToWorldCoordinates(ex.Vector.Zero).x;
    const top = engine.screenToWorldCoordinates(ex.Vector.Zero).y;
    const right = left + engine.drawWidth;
    const bottom = top + engine.drawHeight;
    const localBoundingBox = new ex.BoundingBox(left, top, right, bottom);
    expect(engine.getWorldBounds()).toEqual(localBoundingBox);
  });

  it('should return correct screen dimensions if zoomed in', () => {
    engine.start();
    const clock = engine.clock as ex.TestClock;
    clock.step(1);
    engine.currentScene.camera.zoom = 2;

    expect(engine.drawHeight).toBe(250);
    expect(engine.drawWidth).toBe(250);
    expect(engine.halfDrawHeight).toBe(125);
    expect(engine.halfDrawWidth).toBe(125);

    expect(engine.canvasHeight).toBe(500);
    expect(engine.canvasWidth).toBe(500);
    expect(engine.halfCanvasHeight).toBe(250);
    expect(engine.halfCanvasWidth).toBe(250);
  });

  it('should return if fullscreen', () => {
    engine.start();
    expect(engine.isFullscreen).toBe(false);
  });

  it('should accept a displayMode of Position', () => {
    engine = TestUtils.engine({
      displayMode: ex.DisplayMode.Position,
      position: 'top'
    });
    expect(engine.displayMode).toEqual(ex.DisplayMode.Position);
  });

  it('should accept strings to position the window', () => {
    engine = TestUtils.engine({
      displayMode: ex.DisplayMode.Position,
      position: 'top'
    });
    expect(engine.canvas.style.top).toEqual('0px');
  });

  it('should accept AbsolutePosition Interfaces to position the window', () => {
    const game = new ex.Engine({
      height: 600,
      width: 800,
      suppressConsoleBootMessage: true,
      suppressMinimumBrowserFeatureDetection: true,
      displayMode: ex.DisplayMode.Position,
      position: { top: 1, left: '5em' }
    });

    expect(game.canvas.style.top).toEqual('1px');
  });

  it('should accept backgroundColor', () => {
    const game = new ex.Engine({
      height: 600,
      width: 800,
      suppressConsoleBootMessage: true,
      suppressMinimumBrowserFeatureDetection: true,
      backgroundColor: ex.Color.White
    });

    expect(game.backgroundColor.toString()).toEqual(ex.Color.White.toString());
  });

  it('should accept default backgroundColor #2185d0', () => {
    const game = new ex.Engine({
      height: 600,
      width: 800,
      suppressConsoleBootMessage: true,
      suppressMinimumBrowserFeatureDetection: true
    });

    expect(game.backgroundColor.toString()).toEqual(ex.Color.fromHex('#2185d0').toString());
  });

  it('should detect hidpi when the device pixel ratio is greater than 1', (done) => {
    // Arrange
    const oldWidth = 100;
    const oldHeight = 100;

    (<any>window).devicePixelRatio = 2;
    const newWidth = oldWidth * (<any>window).devicePixelRatio;
    const newHeight = oldHeight * (<any>window).devicePixelRatio;

    engine = TestUtils.engine({
      width: 100,
      height: 100,
      suppressHiDPIScaling: false
    });
    // Act
    engine.start().then(() => {
      // Assert
      expect(engine.isHiDpi).toBe(true);
      (<any>window).devicePixelRatio = 1;

      done();
    });
  });

  it('should not detect hidpi with a device pixel ratio equal to 1', (done) => {
    // Arrange
    const oldWidth = 100;
    const oldHeight = 100;

    (<any>window).devicePixelRatio = 1;
    const newWidth = oldWidth * (<any>window).devicePixelRatio;
    const newHeight = oldHeight * (<any>window).devicePixelRatio;

    // Act
    engine = TestUtils.engine({
      width: 100,
      height: 100,
      suppressHiDPIScaling: false
    });

    engine.start().then(() => {
      // Assert
      expect(engine.isHiDpi).toBe(false);
      done();
    });
  });

  it('should respect a hidpi suppression flag even if the pixel ratio is greater than 1', (done) => {
    // Arrange
    (<any>window).devicePixelRatio = 2;

    // Act
    engine = TestUtils.engine({
      width: 100,
      height: 100,
      suppressHiDPIScaling: true
    });

    engine.start().then(() => {
      // Assert
      expect(engine.isHiDpi).toBe(false);
      expect(engine.drawWidth).toBe(100);
      expect(engine.drawHeight).toBe(100);
      (<any>window).devicePixelRatio = 1;
      done();
    });
  });

  it('should accept custom enableCanvasTransparency false', () => {
    const game = new ex.Engine({
      height: 600,
      width: 800,
      enableCanvasTransparency: false,
      suppressConsoleBootMessage: true
    });
    expect(game.enableCanvasTransparency).toBe(false);
  });

  it('should accept default enableCanvasTransparency true', () => {
    const game = new ex.Engine({
      height: 600,
      width: 800,
      suppressConsoleBootMessage: true
    });
    expect(game.enableCanvasTransparency).toBe(true);
  });

  it('can limit fps', () => {
    const game = new ex.Engine({height: 600, width: 800, maxFps: 15});
    (game as any)._hasStarted = true; // TODO gross

    const mockRAF = (_mainloop: () => any) => {
      return 0;
    };

    let _currentTime = 0;
    const mockNow = () => {
      return _currentTime;
    };
    // 16ms tick
    const actualFpsInterval = 1000/60;
    const tick = () => _currentTime += actualFpsInterval;

    const sut = Engine.createMainLoop(game, mockRAF, mockNow);

    for (let i = 0; i < 6; i++) {
      sut();
      tick();
    }

    expect(game.maxFps).toBe(15);
    expect(game.stats.currFrame.fps).toBeCloseTo(15);
  });

  it('will allow fps as fast as the tick', () => {
    const game = new ex.Engine({height: 600, width: 800});
    (game as any)._hasStarted = true; // TODO gross

    const mockRAF = (_mainloop: () => any) => {
      return 0;
    };

    let _currentTime = 0;
    const mockNow = () => {
      return _currentTime;
    };

    const actualFpsInterval = 1000/120;
    const tick = () => _currentTime += actualFpsInterval;

    const sut = Engine.createMainLoop(game, mockRAF, mockNow);
    game.on('postframe', tick);

    expect(game.maxFps).toBe(Infinity);

    sut();

    // fps sampler samples every 100ms
    for (let i = 0; i < (100/actualFpsInterval) + 2; i++) {
      sut();
    }
    expect(game.stats.currFrame.fps).toBeCloseTo(120);
  });

  it('will warn if scenes are being overwritten', () => {
    spyOn(ex.Logger.getInstance(), 'warn');
    const scene = new ex.Scene();
    engine.addScene('dup', scene);
    engine.addScene('dup', scene);
    expect(ex.Logger.getInstance().warn).toHaveBeenCalledWith('Scene', 'dup', 'already exists overwriting');
  });

  it('can have scenes removed by reference', () => {
    const scene = new ex.Scene();
    engine.addScene('otherScene', scene);
    expect(engine.scenes.otherScene).toBeDefined();

    engine.remove(scene);

    expect(engine.scenes.otherScene).toBeUndefined();
  });

  it('can remove scenes by key', () => {
    const scene = new ex.Scene();
    engine.add('mySceneKey', scene);
    expect(engine.scenes.mySceneKey).toBeDefined();

    engine.remove('mySceneKey');
    expect(engine.scenes.mySceneKey).toBeUndefined();
  });

  it('can remove actors by reference', () => {
    const actor = new ex.Actor();
    engine.add(actor);
    expect(engine.currentScene.actors.length).toBe(1);
    engine.remove(actor);
    engine.currentScene.update(engine, 0);
    expect(engine.currentScene.actors.length).toBe(0);
  });

  it('will log an error if the scene does not exist', () => {
    spyOn(ex.Logger.getInstance(), 'error');
    engine.goToScene('madeUp');
    expect(ex.Logger.getInstance().error).toHaveBeenCalledWith('Scene', 'madeUp', 'does not exist!');
  });

  describe('lifecycle overrides', () => {
    let engine: ex.Engine;
    beforeEach(() => {
      engine = TestUtils.engine({ width: 400, height: 400 });
    });

    afterEach(() => {
      engine.stop();
      engine = null;
    });

    it('can have onInitialize overridden safely', async () => {
      let initCalled = false;

      engine.onInitialize = (engine) => {
        expect(engine).not.toBe(null);
      };

      engine.on('initialize', () => {
        initCalled = true;
      });

      spyOn(engine, 'onInitialize').and.callThrough();

      await TestUtils.runToReady(engine);
      const clock = engine.clock as ex.TestClock;
      clock.step(1);

      expect(initCalled).toBe(true);
      expect(engine.onInitialize).toHaveBeenCalledTimes(1);
    });

    it('can have onPostUpdate overridden safely', () => {
      engine.start();
      const clock = engine.clock as ex.TestClock;
      expect(engine.clock.isRunning()).toBe(true);

      engine.onPostUpdate = (engine, delta) => {
        expect(engine).not.toBe(null);
        expect(delta).toBe(100);
      };

      spyOn(engine, 'onPostUpdate').and.callThrough();
      spyOn(engine, '_postupdate').and.callThrough();

      clock.step(100);
      clock.step(100);

      expect(engine._postupdate).toHaveBeenCalledTimes(2);
      expect(engine.onPostUpdate).toHaveBeenCalledTimes(2);
    });

    it('can have onPreUpdate overridden safely', () => {
      engine.start();
      const clock = engine.clock as ex.TestClock;
      expect(engine.clock.isRunning()).toBe(true);

      engine.onPreUpdate = (engine, delta) => {
        expect(engine).not.toBe(null);
        expect(delta).toBe(100);
      };

      spyOn(engine, 'onPreUpdate').and.callThrough();
      spyOn(engine, '_preupdate').and.callThrough();

      clock.step(100);
      clock.step(100);

      expect(engine._preupdate).toHaveBeenCalledTimes(2);
      expect(engine.onPreUpdate).toHaveBeenCalledTimes(2);
    });

    it('can have onPreDraw overridden safely', () => {
      engine.start();
      const clock = engine.clock as ex.TestClock;
      expect(engine.clock.isRunning()).toBe(true);

      engine.currentScene._initialize(engine);
      engine.onPreDraw = (ctx, delta) => {
        expect(<any>ctx).not.toBe(null);
        expect(delta).toBe(100);
      };
      spyOn(engine, 'onPreDraw').and.callThrough();
      spyOn(engine, '_predraw').and.callThrough();

      clock.step(100);
      clock.step(100);

      expect(engine._predraw).toHaveBeenCalledTimes(2);
      expect(engine.onPreDraw).toHaveBeenCalledTimes(2);
    });

    it('can have onPostDraw overridden safely', () => {
      engine.start();
      const clock = engine.clock as ex.TestClock;
      expect(engine.clock.isRunning()).toBe(true);

      engine.currentScene._initialize(engine);
      engine.onPostDraw = (ctx, delta) => {
        expect(<any>ctx).not.toBe(null);
        expect(delta).toBe(100);
      };

      spyOn(engine, 'onPostDraw').and.callThrough();
      spyOn(engine, '_postdraw').and.callThrough();

      clock.step(100);
      clock.step(100);

      expect(engine._postdraw).toHaveBeenCalledTimes(2);
      expect(engine.onPostDraw).toHaveBeenCalledTimes(2);
    });
  });
});
