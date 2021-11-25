import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';
import { ExcaliburMatchers, ensureImagesLoaded } from 'excalibur-jasmine';
import { ColorBlindness } from '@excalibur';

describe('A ColorBlindCorrector', () => {
  let bg: ex.LegacyDrawing.Texture;
  let engine: ex.Engine;
  let clock: ex.TestClock;

  beforeEach(async () => {
    jasmine.addMatchers(ExcaliburMatchers);

    engine = TestUtils.engine({ width: 800, height: 200 });
    bg = new ex.LegacyDrawing.Texture('src/spec/images/ColorBlindCorrectorSpec/actor.png', true);
    const loader = new ex.Loader([bg]);
    const start = engine.start(loader);
    clock = engine.clock as ex.TestClock;
    await loader.areResourcesLoaded();
    clock.run(2, 100);
    await start;
    clock.run(5, 100);
  });

  afterEach(() => {
    engine.stop();
  });

  it('is normal', (done) => {
    const actor = new ex.Actor();
    actor.addDrawing(bg);
    engine.add(actor);
    engine.once('postdraw', (ev: ex.PostDrawEvent) => {
      ensureImagesLoaded(engine.canvas, 'src/spec/images/ColorBlindCorrectorSpec/normal.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
    clock.step(1);
  });

  it('corrects deuteranopia', (done) => {
    const actor = new ex.Actor();
    actor.addDrawing(bg);
    engine.add(actor);
    engine.debug.colorBlindMode.correct(ColorBlindness.Deuteranope);
    engine.once('postdraw', (ev: ex.PostDrawEvent) => {
      ensureImagesLoaded(engine.canvas, 'src/spec/images/ColorBlindCorrectorSpec/deuteranope_correct.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
    clock.step(1);
  });

  it('simulates deuteranopia', (done) => {
    const actor = new ex.Actor();
    actor.addDrawing(bg);
    engine.add(actor);
    engine.debug.colorBlindMode.simulate(ColorBlindness.Deuteranope);
    engine.once('postdraw', (ev: ex.PostDrawEvent) => {
      ensureImagesLoaded(engine.canvas, 'src/spec/images/ColorBlindCorrectorSpec/deuteranope_simulate.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
    clock.step(1);
  });

  it('corrects protanopia', (done) => {
    const actor = new ex.Actor();
    actor.addDrawing(bg);
    engine.add(actor);
    engine.debug.colorBlindMode.correct(ColorBlindness.Protanope);
    engine.once('postdraw', (ev: ex.PostDrawEvent) => {
      ensureImagesLoaded(engine.canvas, 'src/spec/images/ColorBlindCorrectorSpec/protanope_correct.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
    clock.step(1);
  });

  it('simulates protanopia', (done) => {
    const actor = new ex.Actor();
    actor.addDrawing(bg);
    engine.add(actor);
    engine.debug.colorBlindMode.simulate(ColorBlindness.Protanope);
    engine.once('postdraw', (ev: ex.PostDrawEvent) => {
      ensureImagesLoaded(engine.canvas, 'src/spec/images/ColorBlindCorrectorSpec/protanope_simulate.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
    clock.step(1);
  });

  it('corrects tritanopia', (done) => {
    const actor = new ex.Actor();
    actor.addDrawing(bg);
    engine.add(actor);
    engine.debug.colorBlindMode.correct(ColorBlindness.Tritanope);
    engine.once('postdraw', (ev: ex.PostDrawEvent) => {
      ensureImagesLoaded(engine.canvas, 'src/spec/images/ColorBlindCorrectorSpec/tritanope_correct.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
    clock.step(1);
  });

  it('simulates tritanopia', (done) => {
    const actor = new ex.Actor();
    actor.addDrawing(bg);
    engine.add(actor);
    engine.debug.colorBlindMode.simulate(ColorBlindness.Tritanope);
    engine.once('postdraw', (ev: ex.PostDrawEvent) => {
      ensureImagesLoaded(engine.canvas, 'src/spec/images/ColorBlindCorrectorSpec/tritanope_simulate.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
    clock.step(1);
  });
});
