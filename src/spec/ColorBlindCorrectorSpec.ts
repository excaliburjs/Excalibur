import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';
import { ExcaliburMatchers, ensureImagesLoaded } from 'excalibur-jasmine';

/**
 *
 */
function flushWebGLCanvasTo2D(source: HTMLCanvasElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(source, 0, 0);
  return canvas;
}

describe('A ColorBlindCorrector', () => {
  let bg: ex.ImageSource;
  let engine: ex.Engine;
  let clock: ex.TestClock;

  beforeEach(async () => {
    jasmine.addMatchers(ExcaliburMatchers);

    engine = TestUtils.engine({ width: 800, height: 200 }, []);
    bg = new ex.ImageSource('src/spec/images/ColorBlindCorrectorSpec/actor.png');
    const loader = new ex.Loader([bg]);
    clock = engine.clock as ex.TestClock;
    await TestUtils.runToReady(engine, loader);
  });

  afterEach(() => {
    engine.stop();
  });

  it('is normal', (done) => {
    const actor = new ex.Actor();
    actor.graphics.use(bg.toSprite());
    engine.add(actor);
    engine.once('postframe', (ev: ex.PostDrawEvent) => {
      ensureImagesLoaded(flushWebGLCanvasTo2D(engine.canvas),
        'src/spec/images/ColorBlindCorrectorSpec/normal.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
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
      ensureImagesLoaded(flushWebGLCanvasTo2D(engine.canvas),
        'src/spec/images/ColorBlindCorrectorSpec/deuteranope_correct.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
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
      ensureImagesLoaded(flushWebGLCanvasTo2D(engine.canvas),
        'src/spec/images/ColorBlindCorrectorSpec/deuteranope_simulate.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
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
      ensureImagesLoaded(flushWebGLCanvasTo2D(engine.canvas),
        'src/spec/images/ColorBlindCorrectorSpec/protanope_correct.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
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
      ensureImagesLoaded(flushWebGLCanvasTo2D(engine.canvas),
        'src/spec/images/ColorBlindCorrectorSpec/protanope_simulate.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
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
      ensureImagesLoaded(flushWebGLCanvasTo2D(engine.canvas),
        'src/spec/images/ColorBlindCorrectorSpec/tritanope_correct.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
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
      ensureImagesLoaded(flushWebGLCanvasTo2D(engine.canvas),
        'src/spec/images/ColorBlindCorrectorSpec/tritanope_simulate.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
    clock.step(1);
  });
});
