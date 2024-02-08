import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';
import { ExcaliburAsyncMatchers, ExcaliburMatchers, ensureImagesLoaded } from 'excalibur-jasmine';

describe('A ColorBlindCorrector', () => {
  let bg: ex.ImageSource;
  let engine: ex.Engine;
  let clock: ex.TestClock;

  beforeEach(async () => {
    jasmine.addMatchers(ExcaliburMatchers);
    jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);

    engine = TestUtils.engine({ width: 800, height: 200 }, []);
    bg = new ex.ImageSource('src/spec/images/ColorBlindCorrectorSpec/actor.png');
    const loader = new ex.Loader([bg]);
    clock = engine.clock as ex.TestClock;
    await TestUtils.runToReady(engine, loader);
  });

  afterEach(() => {
    engine.stop();
    engine.dispose();
  });

  it('is normal', (done) => {
    const actor = new ex.Actor();
    actor.graphics.use(bg.toSprite());
    engine.add(actor);
    engine.once('postframe', (ev: ex.PostDrawEvent) => {
      expectAsync(engine.canvas).toEqualImage('src/spec/images/ColorBlindCorrectorSpec/normal.png').then(() => {
        done();
      });
    });
    clock.step(1);
  });

  it('corrects deuteranopia', (done) => {
    const actor = new ex.Actor();
    actor.graphics.use(bg.toSprite());
    engine.add(actor);
    engine.debug.colorBlindMode.correct(ex.ColorBlindnessMode.Deuteranope);
    engine.once('postframe', (ev: ex.PostDrawEvent) => {
      expectAsync(engine.canvas).toEqualImage('src/spec/images/ColorBlindCorrectorSpec/deuteranope_correct.png').then(() => {
        done();
      });
    });
    clock.step(1);
  });

  it('simulates deuteranopia', (done) => {
    const actor = new ex.Actor();
    actor.graphics.use(bg.toSprite());
    engine.add(actor);
    engine.debug.colorBlindMode.simulate(ex.ColorBlindnessMode.Deuteranope);
    engine.once('postframe', (ev: ex.PostDrawEvent) => {
      expectAsync(engine.canvas).toEqualImage('src/spec/images/ColorBlindCorrectorSpec/deuteranope_simulate.png').then(() => {
        done();
      });
    });
    clock.step(1);
  });

  it('corrects protanopia', (done) => {
    const actor = new ex.Actor();
    actor.graphics.use(bg.toSprite());
    engine.add(actor);
    engine.debug.colorBlindMode.correct(ex.ColorBlindnessMode.Protanope);
    engine.once('postframe', (ev: ex.PostDrawEvent) => {
      expectAsync(engine.canvas).toEqualImage('src/spec/images/ColorBlindCorrectorSpec/protanope_correct.png').then(() => {
        done();
      });
    });
    clock.step(1);
  });

  it('simulates protanopia', (done) => {
    const actor = new ex.Actor();
    actor.graphics.use(bg.toSprite());
    engine.add(actor);
    engine.debug.colorBlindMode.simulate(ex.ColorBlindnessMode.Protanope);
    engine.once('postframe', (ev: ex.PostDrawEvent) => {
      expectAsync(engine.canvas).toEqualImage('src/spec/images/ColorBlindCorrectorSpec/protanope_simulate.png').then(() => {
        done();
      });
    });
    clock.step(1);
  });

  it('corrects tritanopia', (done) => {
    const actor = new ex.Actor();
    actor.graphics.use(bg.toSprite());
    engine.add(actor);
    engine.debug.colorBlindMode.correct(ex.ColorBlindnessMode.Tritanope);
    engine.once('postframe', (ev: ex.PostDrawEvent) => {
      expectAsync(engine.canvas).toEqualImage('src/spec/images/ColorBlindCorrectorSpec/tritanope_correct.png').then(() => {
        done();
      });
    });
    clock.step(1);
  });

  it('simulates tritanopia', (done) => {
    const actor = new ex.Actor();
    actor.graphics.use(bg.toSprite());
    engine.add(actor);
    engine.debug.colorBlindMode.simulate(ex.ColorBlindnessMode.Tritanope);
    engine.once('postframe', (ev: ex.PostDrawEvent) => {
      expectAsync(engine.canvas).toEqualImage('src/spec/images/ColorBlindCorrectorSpec/tritanope_simulate.png').then(() => {
        done();
      });
    });
    clock.step(1);
  });
});
