import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';
import { ExcaliburAsyncMatchers, ExcaliburMatchers } from 'excalibur-jasmine';

/**
 *
 */
function flushWebGLCanvasTo2D(source: HTMLCanvasElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(source, 0, 0);
  return canvas;
}

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

  it('should not throw if no loader provided', () => {
    const exceptionSpy = jasmine.createSpy('exception');
    const boot = () => {
      const engine = TestUtils.engine();
      const clock = engine.clock as ex.TestClock;
      clock.setFatalExceptionHandler(exceptionSpy);
      clock.start();
      clock.step(100);
    };

    boot();

    expect(exceptionSpy).not.toHaveBeenCalled();
  });
  it('should show the play button by default', (done) => {
    reset();
    engine = TestUtils.engine({
      suppressPlayButton: false
    });
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
        engine.graphicsContext.flush();
        expectAsync(TestUtils.flushWebGLCanvasTo2D(engine.canvas))
          .toEqualImage('src/spec/images/EngineSpec/engine-load-complete.png').then(() => {
            done();
          });
      });
    });
  });

  it('should log if loading fails', async () => {
    class FailedLoader implements ex.Loadable<void> {
      data = undefined;
      load(): Promise<void> {
        throw new Error('I failed');
      }
      isLoaded(): boolean {
        return false;
      }
    }
    const logger = ex.Logger.getInstance();
    spyOn(logger, 'error');

    engine = TestUtils.engine();


    await engine.load(new FailedLoader());

    expect(logger.error).toHaveBeenCalledWith('Error loading resources, things may not behave properly', new Error('I failed'));
  });

  it('can switch to the canvas fallback on command', () => {
    engine = TestUtils.engine({
      suppressPlayButton: false
    });

    const originalScreen = engine.screen;
    const originalPointers = engine.input.pointers;
    spyOn(engine.screen, 'dispose').and.callThrough();
    spyOn(engine.input.pointers, 'detach').and.callThrough();
    spyOn(engine.input.pointers, 'recreate').and.callThrough();

    engine.useCanvas2DFallback();

    expect(engine.graphicsContext).toBeInstanceOf(ex.ExcaliburGraphicsContext2DCanvas);
    expect(originalScreen.dispose).toHaveBeenCalled();
    expect(originalPointers.detach).toHaveBeenCalled();
    expect(originalPointers.recreate).toHaveBeenCalled();
  });

  it('can switch to the canvas fallback on poor performance', async () => {
    engine = TestUtils.engine({
      suppressPlayButton: false
    });
    await TestUtils.runToReady(engine);
    spyOn(engine, 'useCanvas2DFallback');

    const clock = engine.clock as ex.TestClock;
    clock.fpsSampler = new ex.FpsSampler({
      initialFps: 10,
      nowFn: () => 1
    });

    clock.run(100, 1);

    expect(engine.useCanvas2DFallback).toHaveBeenCalled();
  });

  it('can use a fixed update fps and can catch up', async () => {
    engine = TestUtils.engine({
      fixedUpdateFps: 30
    });

    const clock = engine.clock as ex.TestClock;

    await TestUtils.runToReady(engine);

    spyOn(engine as any, '_update');
    spyOn(engine as any, '_draw');

    clock.step(101);

    expect((engine as any)._update).toHaveBeenCalledTimes(3);
    expect((engine as any)._draw).toHaveBeenCalledTimes(1);
  });

  it('can use a fixed update fps and will skip updates', async () => {
    engine = TestUtils.engine({
      fixedUpdateFps: 30
    });

    const clock = engine.clock as ex.TestClock;

    await TestUtils.runToReady(engine);

    spyOn(engine as any, '_update');
    spyOn(engine as any, '_draw');

    clock.step(16);
    clock.step(16);
    clock.step(16);

    expect((engine as any)._update).toHaveBeenCalledTimes(1);
    expect((engine as any)._draw).toHaveBeenCalledTimes(3);
  });

  it('can flag on to the canvas fallback', async () => {
    engine = TestUtils.engine({
      suppressPlayButton: false
    }, ['use-canvas-context']);
    await TestUtils.runToReady(engine);

    expect(engine.graphicsContext).toBeInstanceOf(ex.ExcaliburGraphicsContext2DCanvas);
  });

  it('should update the frame stats every tick', () => {
    engine = TestUtils.engine();
    const testClock = engine.clock as ex.TestClock;
    testClock.start();
    expect(engine.stats.currFrame.id).toBe(0);
    testClock.step(1);
    expect(engine.stats.currFrame.id).toBe(1);
    testClock.step(1);
    expect(engine.stats.currFrame.id).toBe(2);
  });

  it('should have a default resolution to SVGA (800x600) if none specified', () => {
    const engine = new ex.Engine();
    expect(engine.screen.displayMode).toBe(ex.DisplayMode.FitScreen);
    expect(engine.screen.resolution.width).toBe(800);
    expect(engine.screen.resolution.height).toBe(600);
  });

  it('should hint the texture loader image filter to Blended when aa=true', () => {
    engine = TestUtils.engine({
      antialiasing: true
    });
    expect(ex.TextureLoader.filtering).toBe(ex.ImageFiltering.Blended);
  });

  it('should hint the texture loader image filter to Pixel when aa=false', () => {
    engine = TestUtils.engine({
      antialiasing: false
    });
    expect(ex.TextureLoader.filtering).toBe(ex.ImageFiltering.Pixel);
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
      engine.graphicsContext.flush();
      expectAsync(TestUtils.flushWebGLCanvasTo2D(engine.canvas))
        .toEqualImage('src/spec/images/EngineSpec/engine-suppress-play.png').then(() => {
          done();
        });
    });
  });

  it('can set snapToPixel', () => {
    engine = TestUtils.engine({width: 100, height: 100});
    expect(engine.snapToPixel).toBeFalse();

    engine.snapToPixel = true;

    expect(engine.snapToPixel).toBeTrue();
    expect(engine.graphicsContext.snapToPixel).toBeTrue();
  });

  it('can set pixelRatio', () => {
    engine = TestUtils.engine({width: 100, height: 100, pixelRatio: 5, suppressHiDPIScaling: false});
    expect(engine.pixelRatio).toBe(5);
    expect(engine.screen.pixelRatio).toBe(5);
    expect(engine.screen.scaledWidth).toBe(500);
    expect(engine.screen.scaledHeight).toBe(500);
  });

  it('can use draw sorting', () => {
    engine = TestUtils.engine({width: 100, height: 100, useDrawSorting: false}, []);
    expect(engine.graphicsContext.useDrawSorting).toBe(false);

    engine = TestUtils.engine({width: 100, height: 100, useDrawSorting: true}, []);
    expect(engine.graphicsContext.useDrawSorting).toBe(true);
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

  it('will update keyboard & gamepad events after postupdate', () => {
    const postupdate = jasmine.createSpy('postupdate');
    spyOn(engine.input.keyboard, 'update').and.callThrough();
    spyOn(engine.input.gamepads, 'update').and.callThrough();
    engine.on('postupdate', postupdate);

    const clock = engine.clock as ex.TestClock;

    clock.step(1);

    expect(postupdate).toHaveBeenCalledBefore(engine.input.keyboard.update);
    expect(postupdate).toHaveBeenCalledBefore(engine.input.gamepads.update);
  });

  it('will fire wasPressed in onPostUpdate handler', (done) => {
    engine.input.keyboard.triggerEvent('down', ex.Keys.Enter);
    engine.on('postupdate', () => {
      if (engine.input.keyboard.wasPressed(ex.Keys.Enter)) {
        done();
      }
    });

    const clock = engine.clock as ex.TestClock;
    clock.step(1);
  });

  it('will fire wasReleased in onPostUpdate handler', (done) => {
    engine.input.keyboard.triggerEvent('up', ex.Keys.Enter);
    engine.on('postupdate', () => {
      if (engine.input.keyboard.wasReleased(ex.Keys.Enter)) {
        done();
      }
    });

    const clock = engine.clock as ex.TestClock;
    clock.step(1);
  });

  it('will fire isHeld in onPostUpdate handler', () => {
    engine.input.keyboard.triggerEvent('down', ex.Keys.Enter);
    const held = jasmine.createSpy('held');
    engine.on('postupdate', () => {
      if (engine.input.keyboard.isHeld(ex.Keys.Enter)) {
        held();
      }
    });

    const clock = engine.clock as ex.TestClock;
    clock.step(1);
    clock.step(1);
    clock.step(1);

    expect(held).toHaveBeenCalledTimes(3);
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

  it('should emit a visible event', () => {
    const fired = jasmine.createSpy('fired');
    engine.on('visible', fired);

    spyOnProperty(window.document, 'visibilityState').and.returnValue('visible');
    window.document.dispatchEvent(new CustomEvent('visibilitychange'));

    expect(fired).toHaveBeenCalled();
  });

  it('should emit a hidden event', () => {
    const fired = jasmine.createSpy('fired');
    engine.on('hidden', fired);

    spyOnProperty(window.document, 'visibilityState').and.returnValue('hidden');
    window.document.dispatchEvent(new CustomEvent('visibilitychange'));

    expect(fired).toHaveBeenCalled();
  });

  it('should tell engine is running', () => {
    const status = engine.isRunning();
    expect(status).toBe(true);
  });

  it('should tell engine is paused', () => {
    engine.stop();
    const status = engine.isRunning();
    expect(status).toBe(false);
  });

  it('should again tell engine is running', () => {
    engine.start();
    const status = engine.isRunning();
    expect(status).toBe(true);
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

  it('will add actors to the correct scene when initialized after a deferred goTo', () => {
    const engine = TestUtils.engine();
    const scene1 = new ex.Scene();
    const scene2 = new ex.Scene();
    engine.add('scene1', scene1);
    engine.add('scene2', scene2);

    scene1.onInitialize = () => {
      engine.goToScene('scene2');
    };
    scene2.onInitialize = () => {
      engine.add(new ex.Actor());
    };

    spyOn(scene1, 'onInitialize').and.callThrough();
    spyOn(scene2, 'onInitialize').and.callThrough();


    engine.goToScene('scene1');

    TestUtils.runToReady(engine);

    expect(engine.currentScene).toBe(scene2);
    expect(scene1.actors.length).toBe(0);
    expect(scene2.actors.length).toBe(1);
  });

  it('can screen shot the game (in WebGL)', (done) => {

    const engine = TestUtils.engine({}, []);
    const clock = engine.clock as ex.TestClock;

    engine.add(new ex.Actor({
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      color: ex.Color.Red
    }));
    TestUtils.runToReady(engine);

    clock.step(1);

    engine.screenshot().then((image) => {
      return expectAsync(image).toEqualImage(flushWebGLCanvasTo2D(engine.canvas)).then(() => {
        done();
      });
    });

    clock.step(1);
  });

  it('can screen shot the game HiDPI (in WebGL)', async () => {

    const engine = TestUtils.engine({}, []);
    const clock = engine.clock as ex.TestClock;
    (engine.screen as any)._pixelRatioOverride = 2;
    engine.screen.applyResolutionAndViewport();

    engine.add(new ex.Actor({
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      color: ex.Color.Red
    }));
    TestUtils.runToReady(engine);

    clock.step(1);
    const screenShotPromise = engine.screenshot();
    clock.step(1);
    const hidpiImagePromise = engine.screenshot(true);
    clock.step(1);

    const image = await screenShotPromise;
    const hidpiImage = await hidpiImagePromise;

    expect(image.width).toBe(500);
    expect(image.height).toBe(500);

    expect(hidpiImage.width).toBe(1000);
    expect(hidpiImage.height).toBe(1000);
    await expectAsync(hidpiImage).toEqualImage(flushWebGLCanvasTo2D(engine.canvas));
  });

  it('can screen shot and match the anti-aliasing with a half pixel when pixelRatio != 1.0', async () => {
    const engine = TestUtils.engine({
      width: 200,
      height: 200,
      pixelRatio: 1.2,
      suppressHiDPIScaling: false,
      antialiasing: false,
      snapToPixel: false
    }, []);
    const clock = engine.clock as ex.TestClock;
    const img = new ex.ImageSource('src/spec/images/EngineSpec/sprite.png');
    await img.load();
    const actor = new ex.Actor({
      x: 40.5,
      y: 40.0,
      scale: ex.vec(2, 2)
    });
    actor.graphics.use(img.toSprite());
    engine.add(actor);
    TestUtils.runToReady(engine);

    clock.step(1);
    const screenShotPromise = engine.screenshot();
    clock.step(1);

    const image = await screenShotPromise;

    await expectAsync(image).toEqualImage('src/spec/images/EngineSpec/screenshot.png', 1.0);
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
