import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';
import { Mocks } from './util/Mocks';
import { ensureImagesLoaded, ExcaliburMatchers } from 'excalibur-jasmine';

describe('The engine', () => {
  let engine: ex.Engine;
  let scene: ex.Scene;
  const mock = new Mocks.Mocker();
  let loop: Mocks.GameLoopLike;

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

    engine = TestUtils.engine();
    scene = new ex.Scene(engine);
    engine.add('default', scene);
    engine.goToScene('default');

    loop = mock.loop(engine);

    engine.start();
  });

  afterEach(() => {
    reset();
  });

  it('should show the play button by default', (done) => {
    reset();
    engine = TestUtils.engine({
      suppressPlayButton: false
    });
    (<any>engine)._suppressPlayButton = false;
    engine.currentScene = scene;

    loop = mock.loop(engine);

    engine.start(new ex.Loader([new ex.Texture('base/src/spec/images/SpriteSpec/icon.png', true)]));
    setTimeout(() => {
      ensureImagesLoaded(engine.canvas, 'src/spec/images/EngineSpec/engine-load-complete.png').then(([canvas, image]) => {
        expect(document.getElementById('excalibur-play')).toBeDefined('Play button should exist in the document');
        expect(canvas).toEqualImage(image);
        done();
      });
    }, 600);
  });

  it('should not show the play button when suppressPlayButton is turned on', (done) => {
    reset();
    engine = TestUtils.engine({
      suppressPlayButton: true
    });
    engine.currentScene = scene;
    engine.currentScene.add(
      new ex.Actor({
        pos: new ex.Vector(250, 250),
        width: 20,
        height: 20,
        color: ex.Color.Red
      })
    );

    loop = mock.loop(engine);

    engine.start(new ex.Loader([new ex.Texture('base/src/spec/images/SpriteSpec/icon.png', true)])).then(() => {
      setTimeout(() => {
        ensureImagesLoaded(engine.canvas, 'src/spec/images/EngineSpec/engine-suppress-play.png').then(([canvas, image]) => {
          expect(canvas).toEqualImage(image);
          done();
        });
      }, 600);
    });
  });

  it('should emit a preframe event', () => {
    let fired = false;
    engine.on('preframe', () => (fired = true));

    loop.advance(100);

    expect(fired).toBe(true);
  });

  it('should emit a postframe event', () => {
    let fired = false;
    engine.on('postframe', () => (fired = true));

    loop.advance(100);

    expect(fired).toBe(true);
  });

  it('should emit a preupdate event', () => {
    let fired = false;
    engine.on('preupdate', () => (fired = true));

    loop.advance(100);

    expect(fired).toBe(true);
  });

  it('should emit a postupdate event', () => {
    let fired = false;
    engine.on('postupdate', () => (fired = true));

    loop.advance(100);

    expect(fired).toBe(true);
  });

  it('should emit a predraw event', () => {
    let fired = false;
    engine.on('predraw', () => (fired = true));

    loop.advance(100);

    expect(fired).toBe(true);
  });

  it('should emit a postdraw event', () => {
    let fired = false;
    engine.on('postdraw', () => (fired = true));

    loop.advance(100);

    expect(fired).toBe(true);
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
    engine.currentScene.camera.z = 2;

    expect(engine.drawHeight).toBe(250);
    expect(engine.drawWidth).toBe(250);
    expect(engine.halfDrawHeight).toBe(125);
    expect(engine.halfDrawWidth).toBe(125);

    expect(engine.canvasHeight).toBe(500);
    expect(engine.canvasWidth).toBe(500);
    expect(engine.halfCanvasHeight).toBe(250);
    expect(engine.halfCanvasWidth).toBe(250);
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

  describe('lifecycle overrides', () => {
    let engine: ex.Engine;
    beforeEach(() => {
      engine = TestUtils.engine({ width: 400, height: 400 });
    });

    afterEach(() => {
      engine.stop();
      engine = null;
    });

    it('can have onInitialize overridden safely', () => {
      let initCalled = false;
      engine.onInitialize = (engine) => {
        expect(engine).not.toBe(null);
      };

      engine.on('initialize', () => {
        initCalled = true;
      });

      spyOn(engine, 'onInitialize').and.callThrough();

      (<any>engine)._update(100);

      expect(initCalled).toBe(true);
      expect(engine.onInitialize).toHaveBeenCalledTimes(1);
    });

    it('can have onPostUpdate overridden safely', () => {
      engine.onPostUpdate = (engine, delta) => {
        expect(engine).not.toBe(null);
        expect(delta).toBe(100);
      };

      spyOn(engine, 'onPostUpdate').and.callThrough();
      spyOn(engine, '_postupdate').and.callThrough();

      (<any>engine)._update(100);
      (<any>engine)._update(100);

      expect(engine._postupdate).toHaveBeenCalledTimes(2);
      expect(engine.onPostUpdate).toHaveBeenCalledTimes(2);
    });

    it('can have onPreUpdate overridden safely', () => {
      engine.onPreUpdate = (engine, delta) => {
        expect(engine).not.toBe(null);
        expect(delta).toBe(100);
      };

      spyOn(engine, 'onPreUpdate').and.callThrough();
      spyOn(engine, '_preupdate').and.callThrough();

      (<any>engine)._update(100);
      (<any>engine)._update(100);

      expect(engine._preupdate).toHaveBeenCalledTimes(2);
      expect(engine.onPreUpdate).toHaveBeenCalledTimes(2);
    });

    it('can have onPreDraw overridden safely', () => {
      engine.onPreDraw = (ctx, delta) => {
        expect(<any>ctx).not.toBe(null);
        expect(delta).toBe(100);
      };

      spyOn(engine, 'onPreDraw').and.callThrough();
      spyOn(engine, '_predraw').and.callThrough();

      (<any>engine)._draw(100);
      (<any>engine)._draw(100);

      expect(engine._predraw).toHaveBeenCalledTimes(2);
      expect(engine.onPreDraw).toHaveBeenCalledTimes(2);
    });

    it('can have onPostDraw overridden safely', () => {
      engine.onPostDraw = (ctx, delta) => {
        expect(<any>ctx).not.toBe(null);
        expect(delta).toBe(100);
      };

      spyOn(engine, 'onPostDraw').and.callThrough();
      spyOn(engine, '_postdraw').and.callThrough();

      (<any>engine)._draw(100);
      (<any>engine)._draw(100);

      expect(engine._postdraw).toHaveBeenCalledTimes(2);
      expect(engine.onPostDraw).toHaveBeenCalledTimes(2);
    });
  });
});
