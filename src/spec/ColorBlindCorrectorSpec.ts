import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';
import { ExcaliburMatchers, ensureImagesLoaded } from 'excalibur-jasmine';
import { Texture, ColorBlindness } from '@excalibur';
import { base64Encode } from '../engine/Util/Util';

describe('A ColorBlindCorrector', () => {
  let bg: Texture;
  let engine: ex.Engine;

  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);

    engine = TestUtils.engine({ width: 800, height: 200 });
    bg = new ex.Texture('base/src/spec/images/ColorBlindCorrectorSpec/actor.png', true);

    return engine.start(new ex.Loader([bg]));
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
  });
});
