import { ExcaliburAsyncMatchers, ExcaliburMatchers } from 'excalibur-jasmine';
import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';
import { Mocks } from './util/Mocks';

describe('A scaled and rotated actor', () => {
  let actor: ex.Actor;
  let engine: ex.Engine;
  const mock = new Mocks.Mocker();

  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);

    actor = new ex.ScreenElement({x: 50, y:50, width: 100, height: 50});
    actor.color = ex.Color.Blue;
    actor.body.collisionType = ex.CollisionType.Active;
    engine = TestUtils.engine({ width: 800, height: 600 });
    engine.setAntialiasing(false);

    spyOn(engine.rootScene, 'draw').and.callThrough();
  });

  afterEach(() => {
    engine.stop();
    engine.dispose();
  });

  xit('is drawn correctly scaled at 90 degrees', (done) => {
    const clock = engine.clock as ex.TestClock;
    const bg = new ex.ImageSource('./src/spec/images/ScaleSpec/logo.png');
    const loader = new ex.Loader([bg]);
    TestUtils.runToReady(engine, loader).then(() => {
      const actor = new ex.Actor({
        x: engine.halfDrawWidth,
        y: engine.halfDrawHeight,
        width: 100,
        height: 10,
        color: ex.Color.Black
      });
      actor.graphics.use(bg.toSprite());
      actor.scale.setTo(1, 0.2);
      engine.add(actor);

      actor.rotation = Math.PI / 2;

      clock.step(1);

      expectAsync(engine.canvas).toEqualImage('src/spec/images/ScaleSpec/scale.png').then(() => {
        done();
      });
    });
  });
});
