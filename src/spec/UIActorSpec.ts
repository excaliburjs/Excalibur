import { ExcaliburMatchers, ensureImagesLoaded } from 'excalibur-jasmine';
import * as ex from '../../build/dist/excalibur';
import { Mocks } from './util/Mocks';
import { TestUtils } from './util/TestUtils';

describe('A UIActor', () => {
  let uiActor: ex.UIActor;
  let engine: ex.Engine;
  let scene: ex.Scene;
  const mock = new Mocks.Mocker();

  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);

    uiActor = new ex.UIActor({
      pos: new ex.Vector(50, 50),
      width: 100,
      height: 50,
      color: ex.Color.Blue
    });
    uiActor.body.collider.type = ex.CollisionType.Active;
    engine = TestUtils.engine();

    scene = new ex.Scene(engine);
    engine.currentScene = scene;

    spyOn(scene, 'draw').and.callThrough();
    spyOn(uiActor, 'draw').and.callThrough();
  });

  afterEach(() => {
    engine.stop();
  });

  it('is drawn when visible', () => {
    uiActor.visible = true;

    scene.add(uiActor);
    scene.draw(engine.ctx, 100);

    expect(uiActor.draw).toHaveBeenCalled();
  });

  it('is not drawn when not visible', () => {
    uiActor.visible = false;

    scene.add(uiActor);
    scene.draw(engine.ctx, 100);

    expect(uiActor.draw).not.toHaveBeenCalled();
  });

  it('is drawn on the screen when visible', (done) => {
    uiActor.visible = true;
    scene.add(uiActor);
    scene.draw(engine.ctx, 100);

    ensureImagesLoaded(engine.canvas, 'src/spec/images/UIActorSpec/actordraws.png').then(([canvas, image]) => {
      expect(canvas).toEqualImage(image);
      done();
    });
  });

  it('is not drawn on the screen when not visible', (done) => {
    uiActor.visible = false;
    scene.add(uiActor);
    scene.draw(engine.ctx, 100);

    ensureImagesLoaded(engine.canvas, 'src/spec/images/UIActorSpec/actordoesnotdraw.png').then(([canvas, image]) => {
      expect(canvas).toEqualImage(image);
      done();
    });
  });

  it('is drawn on the top left with empty constructor', (done) => {
    const game = TestUtils.engine({ width: 720, height: 480 });
    const bg = new ex.Texture('base/src/spec/images/UIActorSpec/emptyctor.png', true);

    game.start(new ex.Loader([bg])).then(() => {
      const uiActor = new ex.UIActor();
      uiActor.addDrawing(bg);
      game.add(uiActor);

      uiActor.on('postdraw', (ev: ex.PostDrawEvent) => {
        game.stop();

        ensureImagesLoaded(game.canvas, 'src/spec/images/UIActorSpec/emptyctor.png').then(([canvas, image]) => {
          expect(canvas).toEqualImage(image);
          done();
        });
      });
    });
  });
});
