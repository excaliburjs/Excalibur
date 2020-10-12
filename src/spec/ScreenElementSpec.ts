import { ExcaliburMatchers, ensureImagesLoaded } from 'excalibur-jasmine';
import * as ex from '@excalibur';
import { Mocks } from './util/Mocks';
import { TestUtils } from './util/TestUtils';

describe('A ScreenElement', () => {
  let screenElement: ex.ScreenElement;
  let engine: ex.Engine;
  let scene: ex.Scene;
  const mock = new Mocks.Mocker();

  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);

    screenElement = new ex.ScreenElement({
      pos: new ex.Vector(50, 50),
      width: 100,
      height: 50,
      color: ex.Color.Blue
    });
    screenElement.body.collider.type = ex.CollisionType.Active;
    engine = TestUtils.engine();
    engine.backgroundColor = ex.Color.Transparent;

    scene = new ex.Scene();
    engine.addScene('test', scene);
    engine.goToScene('test');

    spyOn(scene, 'draw').and.callThrough();
    spyOn(screenElement, 'draw').and.callThrough();
  });

  afterEach(() => {
    engine.stop();
  });

  it('is drawn when visible', () => {
    screenElement.visible = true;

    scene.add(screenElement);
    scene.draw(engine.ctx, 100);

    expect(screenElement.draw).toHaveBeenCalled();
  });

  it('is not drawn when not visible', () => {
    screenElement.visible = false;

    scene.add(screenElement);
    scene.draw(engine.ctx, 100);

    expect(screenElement.draw).not.toHaveBeenCalled();
  });

  it('is drawn on the screen when visible', (done) => {
    screenElement.visible = true;
    scene.add(screenElement);
    scene.draw(engine.ctx, 100);

    ensureImagesLoaded(engine.canvas, 'src/spec/images/ScreenElementSpec/actordraws.png').then(([canvas, image]) => {
      expect(canvas).toEqualImage(image);
      done();
    });
  });

  it('is not drawn on the screen when not visible', (done) => {
    screenElement.visible = false;
    scene.add(screenElement);
    scene.draw(engine.ctx, 100);

    ensureImagesLoaded(engine.canvas, 'src/spec/images/ScreenElementSpec/actordoesnotdraw.png').then(([canvas, image]) => {
      expect(canvas).toEqualImage(image);
      done();
    });
  });

  it('is drawn on the top left with empty constructor', (done) => {
    const game = TestUtils.engine({ width: 720, height: 480 });
    const bg = new ex.Texture('base/src/spec/images/ScreenElementSpec/emptyctor.png', true);

    game.start(new ex.Loader([bg])).then(() => {
      const screenElement = new ex.ScreenElement();
      screenElement.addDrawing(bg);
      game.add(screenElement);

      screenElement.on('postdraw', (ev: ex.PostDrawEvent) => {
        game.stop();

        ensureImagesLoaded(game.canvas, 'src/spec/images/ScreenElementSpec/emptyctor.png').then(([canvas, image]) => {
          expect(canvas).toEqualImage(image);
          done();
        });
      });
    });
  });
});
