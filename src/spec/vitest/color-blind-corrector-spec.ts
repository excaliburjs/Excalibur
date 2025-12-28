import * as ex from '@excalibur';
import { TestUtils } from '../__util__/test-utils';

describe('A ColorBlindCorrector', () => {
  let bg: ex.ImageSource;
  let engine: ex.Engine;
  let clock: ex.TestClock;

  describe('@visual', () => {
    beforeEach(async () => {
      engine = TestUtils.engine({ width: 800, height: 200 }, []);
      bg = new ex.ImageSource('/src/spec/assets/images/ColorBlindCorrectorSpec/actor.png');
      const loader = new ex.Loader([bg]);
      clock = engine.clock as ex.TestClock;
      await TestUtils.runToReady(engine, loader);
    });

    afterEach(() => {
      engine.stop();
      engine.dispose();
    });

    it('is normal', () =>
      new Promise<void>((done) => {
        const actor = new ex.Actor();
        actor.graphics.use(bg.toSprite());
        engine.add(actor);

        engine.once('postframe', (ev: ex.PostDrawEvent) => {
          expect(engine.canvas)
            .toEqualImage('/src/spec/assets/images/ColorBlindCorrectorSpec/normal.png')
            .then(() => {
              done();
            });
        });
        clock.step(1);
      }));

    it('corrects deuteranopia', () =>
      new Promise<void>((done) => {
        const actor = new ex.Actor();
        actor.graphics.use(bg.toSprite());
        engine.add(actor);
        engine.debug.colorBlindMode.correct(ex.ColorBlindnessMode.Deuteranope);
        engine.once('postframe', (ev: ex.PostDrawEvent) => {
          expect(engine.canvas)
            .toEqualImage('/src/spec/assets/images/ColorBlindCorrectorSpec/deuteranope_correct.png')
            .then(() => {
              done();
            });
        });
        clock.step(1);
      }));

    it('simulates deuteranopia', () =>
      new Promise<void>((done) => {
        const actor = new ex.Actor();
        actor.graphics.use(bg.toSprite());
        engine.add(actor);
        engine.debug.colorBlindMode.simulate(ex.ColorBlindnessMode.Deuteranope);
        engine.once('postframe', (ev: ex.PostDrawEvent) => {
          expect(engine.canvas)
            .toEqualImage('/src/spec/assets/images/ColorBlindCorrectorSpec/deuteranope_simulate.png')
            .then(() => {
              done();
            });
        });
        clock.step(1);
      }));

    it('corrects protanopia', () =>
      new Promise<void>((done) => {
        const actor = new ex.Actor();
        actor.graphics.use(bg.toSprite());
        engine.add(actor);
        engine.debug.colorBlindMode.correct(ex.ColorBlindnessMode.Protanope);
        engine.once('postframe', (ev: ex.PostDrawEvent) => {
          expect(engine.canvas)
            .toEqualImage('/src/spec/assets/images/ColorBlindCorrectorSpec/protanope_correct.png')
            .then(() => {
              done();
            });
        });
        clock.step(1);
      }));

    it('simulates protanopia', () =>
      new Promise<void>((done) => {
        const actor = new ex.Actor();
        actor.graphics.use(bg.toSprite());
        engine.add(actor);
        engine.debug.colorBlindMode.simulate(ex.ColorBlindnessMode.Protanope);
        engine.once('postframe', (ev: ex.PostDrawEvent) => {
          expect(engine.canvas)
            .toEqualImage('/src/spec/assets/images/ColorBlindCorrectorSpec/protanope_simulate.png')
            .then(() => {
              done();
            });
        });
        clock.step(1);
      }));

    it('corrects tritanopia', () =>
      new Promise<void>((done) => {
        const actor = new ex.Actor();
        actor.graphics.use(bg.toSprite());
        engine.add(actor);
        engine.debug.colorBlindMode.correct(ex.ColorBlindnessMode.Tritanope);
        engine.once('postframe', (ev: ex.PostDrawEvent) => {
          expect(engine.canvas)
            .toEqualImage('/src/spec/assets/images/ColorBlindCorrectorSpec/tritanope_correct.png')
            .then(() => {
              done();
            });
        });
        clock.step(1);
      }));

    it('simulates tritanopia', () =>
      new Promise<void>((done) => {
        const actor = new ex.Actor();
        actor.graphics.use(bg.toSprite());
        engine.add(actor);
        engine.debug.colorBlindMode.simulate(ex.ColorBlindnessMode.Tritanope);
        engine.once('postframe', (ev: ex.PostDrawEvent) => {
          expect(engine.canvas)
            .toEqualImage('/src/spec/assets/images/ColorBlindCorrectorSpec/tritanope_simulate.png')
            .then(() => {
              done();
            });
        });
        clock.step(1);
      }));
  });
});
