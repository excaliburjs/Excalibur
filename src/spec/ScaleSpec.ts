import { ExcaliburMatchers, ensureImagesLoaded } from 'excalibur-jasmine';
import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';
import { Mocks } from './util/Mocks';

describe('A scaled and rotated actor', () => {
  let actor: ex.Actor;
  let engine: ex.Engine;
  const mock = new Mocks.Mocker();

  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);

    actor = new ex.ScreenElement({x: 50, y:50, width: 100, height: 50});
    actor.color = ex.Color.Blue;
    actor.body.collisionType = ex.CollisionType.Active;
    engine = TestUtils.engine({ width: 800, height: 600 });
    engine.setAntialiasing(false);

    spyOn(engine.rootScene, 'draw').and.callThrough();
    spyOn(actor, 'draw').and.callThrough();
  });

  afterEach(() => {
    engine.stop();
  });

  it('is drawn correctly scaled at 90 degrees', (done) => {
    const bg = new ex.Texture('./src/spec/images/ScaleSpec/logo.png', true);

    engine.start(new ex.Loader([bg])).then(() => {
      const actor = new ex.Actor({
        x: engine.halfDrawWidth,
        y: engine.halfDrawHeight,
        width: 100,
        height: 10,
        color: ex.Color.Black
      });
      actor.addDrawing(bg);
      actor.scale.setTo(1, 0.2);
      engine.add(actor);

      actor.rotation = Math.PI / 2;

      actor.on('postdraw', (ev: ex.PostDrawEvent) => {
        engine.stop();
        ensureImagesLoaded(engine.canvas, 'src/spec/images/ScaleSpec/scale.png').then(([canvas, image]) => {
          expect(canvas).toEqualImage(image);
          done();
        });
      });
    });
  });
});
