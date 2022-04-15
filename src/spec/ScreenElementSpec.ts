import { ExcaliburMatchers, ensureImagesLoaded, ExcaliburAsyncMatchers } from 'excalibur-jasmine';
import * as ex from '@excalibur';
import { Mocks } from './util/Mocks';
import { TestUtils } from './util/TestUtils';

describe('A ScreenElement', () => {
  let screenElement: ex.ScreenElement;
  let engine: ex.Engine;
  let scene: ex.Scene;

  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);

    screenElement = new ex.ScreenElement({
      pos: new ex.Vector(50, 50),
      width: 100,
      height: 50,
      color: ex.Color.Blue
    });
    screenElement.body.collisionType = ex.CollisionType.Active;
    engine = TestUtils.engine();
    engine.backgroundColor = ex.Color.Transparent;

    scene = new ex.Scene();
    engine.addScene('test', scene);
    engine.goToScene('test');
    engine.start();

    const clock = engine.clock as ex.TestClock;
    clock.step(1);

    spyOn(scene, 'draw').and.callThrough();
  });

  afterEach(() => {
    engine.stop();
    engine = null;
  });

  it('is drawn when visible', () => {
    screenElement.graphics.visible = true;
    screenElement.graphics.onPostDraw = jasmine.createSpy('draw');

    scene.add(screenElement);
    scene.draw(engine.graphicsContext, 100);

    expect(screenElement.graphics.onPostDraw).toHaveBeenCalled();
  });

  it('is not drawn when not visible', () => {
    screenElement.graphics.visible = false;
    screenElement.graphics.onPostDraw = jasmine.createSpy('draw');

    scene.add(screenElement);
    scene.draw(engine.graphicsContext, 100);

    expect(screenElement.graphics.onPostDraw).not.toHaveBeenCalled();
  });

  it('is drawn on the screen when visible', async () => {
    screenElement.graphics.visible = true;
    scene.add(screenElement);
    scene.update(engine, 100);
    scene.draw(engine.graphicsContext, 100);
    engine.graphicsContext.flush();

    await expectAsync(TestUtils.flushWebGLCanvasTo2D(engine.canvas)).toEqualImage('src/spec/images/ScreenElementSpec/actordraws.png');
  });

  it('is not drawn on the screen when not visible', async () => {
    screenElement.graphics.visible = false;
    scene.add(screenElement);
    scene.draw(engine.graphicsContext, 100);
    engine.graphicsContext.flush();

    await expectAsync(TestUtils.flushWebGLCanvasTo2D(engine.canvas)).toEqualImage('src/spec/images/ScreenElementSpec/actordoesnotdraw.png');
  });

  it('contains in screen space or world space', () => {
    screenElement = new ex.ScreenElement({
      x: 0,
      y: 0,
      width: 100,
      height: 100
    });
    scene.add(screenElement);
    scene.update(engine, 0);

    expect(screenElement.contains(50, 50, false)).toBe(true);
    expect(screenElement.contains(50, 50, true)).toBe(true);
  });

  it('is drawn on the top left with empty constructor', (done) => {
    const game = TestUtils.engine({ width: 720, height: 480 });
    const clock = game.clock as ex.TestClock;
    const bg = new ex.ImageSource('src/spec/images/ScreenElementSpec/emptyctor.png');
    const loader = new ex.Loader([bg]);
    TestUtils.runToReady(game, loader).then(() => {
      const screenElement = new ex.ScreenElement();
      screenElement.graphics.use(bg.toSprite());
      game.add(screenElement);
      game.currentScene.draw(game.graphicsContext, 100);
      game.graphicsContext.flush();

      ensureImagesLoaded(TestUtils.flushWebGLCanvasTo2D(game.canvas), 'src/spec/images/ScreenElementSpec/emptyctor.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
  });
});
