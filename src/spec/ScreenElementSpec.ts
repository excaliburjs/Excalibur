import { ExcaliburMatchers, ensureImagesLoaded, ExcaliburAsyncMatchers } from 'excalibur-jasmine';
import * as ex from '@excalibur';
import { Mocks } from './util/Mocks';
import { TestUtils } from './util/TestUtils';
import { ScreenElement } from '@excalibur';

describe('A ScreenElement', () => {
  let screenElement: ex.ScreenElement;
  let engine: ex.Engine;
  let scene: ex.Scene;
  let clock: ex.TestClock;

  beforeAll(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);
  });

  beforeEach(() => {
    screenElement = new ex.ScreenElement({
      pos: new ex.Vector(50, 50),
      width: 100,
      height: 50,
      color: ex.Color.Blue
    });

    engine = TestUtils.engine();

    scene = new ex.Scene();
    engine.addScene('test', scene);
    engine.goToScene('test');
    engine.start();

    clock = engine.clock as ex.TestClock;

  });

  afterEach(() => {
    engine.stop();
    engine = null;
  });

  it('can be constructed with zero args without a warning', () => {
    const logger = ex.Logger.getInstance();
    spyOn(logger, 'warn');

    const sut = new ScreenElement();

    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('can be constructed with a non-default anchor', () => {

    const sut = new ScreenElement({
      width: 100,
      height: 100,
      anchor: ex.vec(.5, .5)
    });

    expect(sut.anchor).toBeVector(ex.vec(.5, .5));
    expect(sut.collider.get()).toBeInstanceOf(ex.PolygonCollider);
    expect(sut.collider.get().bounds.width).toBe(100);
    expect(sut.collider.get().bounds.height).toBe(100);
    expect(sut.collider.get().bounds.left).toBe(-50);
    expect(sut.collider.get().bounds.right).toBe(50);
    expect(sut.collider.get().bounds.top).toBe(-50);
    expect(sut.collider.get().bounds.bottom).toBe(50);
  });

  it('can be constructed with a non-default collider', () => {

    const sut = new ScreenElement({
      width: 100,
      height: 100,
      collisionType: ex.CollisionType.Active,
      collider: ex.Shape.Circle(50)
    });

    expect(sut.anchor).toBeVector(ex.vec(0, 0));
    expect(sut.body.collisionType).toBe(ex.CollisionType.Active);
    expect(sut.collider.get()).toBeInstanceOf(ex.CircleCollider);
    expect(sut.collider.get().bounds.width).toBe(100);
    expect(sut.collider.get().bounds.height).toBe(100);
    expect(sut.collider.get().bounds.left).toBe(-50);
    expect(sut.collider.get().bounds.right).toBe(50);
    expect(sut.collider.get().bounds.top).toBe(-50);
    expect(sut.collider.get().bounds.bottom).toBe(50);
  });

  it('captures pointer by default', () => {
    const sut = new ScreenElement({
      width: 100,
      height: 100
    });

    expect(sut.pointer.useGraphicsBounds).toBe(true);
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

  it('is drawn on the top left with empty constructor', async () => {
    const game = TestUtils.engine({ width: 720, height: 480 });
    const clock = game.clock as ex.TestClock;
    const bg = new ex.ImageSource('src/spec/images/ScreenElementSpec/emptyctor.png');
    const loader = new ex.Loader([bg]);
    await TestUtils.runToReady(game, loader);
    const screenElement = new ex.ScreenElement();
    screenElement.graphics.use(bg.toSprite());
    game.add(screenElement);
    game.currentScene.draw(game.graphicsContext, 100);
    game.graphicsContext.flush();
    await expectAsync(TestUtils.flushWebGLCanvasTo2D(game.canvas)).toEqualImage('src/spec/images/ScreenElementSpec/emptyctor.png');
  });
});
