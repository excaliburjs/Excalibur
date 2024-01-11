import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';
import { ExcaliburAsyncMatchers } from 'excalibur-jasmine';

describe('A FadeInOut transition', () => {
  beforeAll(() => {
    jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);
  });
  it('exists', () => {
    expect(ex.CrossFade).toBeDefined();
  });

  it('can be constructed', () => {
    const sut = new ex.FadeInOut({duration: 1000, color: ex.Color.Red});
    expect(sut.duration).toBe(1000);
    expect(sut.name).toContain('FadeInOut#');
    expect(sut.color).toEqual(ex.Color.Red);
  });

  it('can fade in', (done) => {
    const engine = TestUtils.engine({backgroundColor: ex.Color.ExcaliburBlue});
    const clock = engine.clock as ex.TestClock;
    TestUtils.runToReady(engine).then(() => {
      engine.add(new ex.Actor({
        pos: ex.vec(20, 20),
        width: 100,
        height: 100,
        color: ex.Color.Red
      }));

      const onDeactivateSpy = jasmine.createSpy('onDeactivate').and.callFake(async () => {
        await Promise.resolve();
      });

      engine.director.getSceneInstance('root').onDeactivate = onDeactivateSpy;

      const sut = new ex.FadeInOut({duration: 1000, direction: 'in'});
      const scene = new ex.Scene();
      scene.add(new ex.Actor({
        pos: ex.vec(200, 200),
        width: 40,
        height: 40,
        color: ex.Color.Violet
      }));
      engine.addScene('newScene', { scene, transitions: {in: sut}});

      const goto = engine.goto('newScene');
      setTimeout(() => {
        clock.step(1);
      });
      setTimeout(() => {
        clock.step(500);
      });
      setTimeout(() => {
        clock.step(1);
        expect(onDeactivateSpy).toHaveBeenCalledTimes(1);
        expectAsync(TestUtils.flushWebGLCanvasTo2D(engine.canvas)).toEqualImage('/src/spec/images/FadeInOutSpec/fadein.png').then(() => {
          done();
        });
      });
    });
  });

  it('can fade out', (done) => {
    const engine = TestUtils.engine({backgroundColor: ex.Color.ExcaliburBlue});
    const clock = engine.clock as ex.TestClock;
    TestUtils.runToReady(engine).then(() => {
      engine.add(new ex.Actor({
        pos: ex.vec(20, 20),
        width: 100,
        height: 100,
        color: ex.Color.Red
      }));


      const sut = new ex.FadeInOut({duration: 1000, direction: 'out', color: ex.Color.Violet});
      const scene = new ex.Scene();
      scene.add(new ex.Actor({
        pos: ex.vec(200, 200),
        width: 40,
        height: 40,
        color: ex.Color.Violet
      }));
      engine.addScene('newScene', scene);

      const goto = engine.goto('newScene', {sourceOut: sut});
      setTimeout(() => {
        clock.step(1);
      });
      setTimeout(() => {
        clock.step(900);
      });
      setTimeout(() => {
        clock.step(1);
        expectAsync(TestUtils.flushWebGLCanvasTo2D(engine.canvas)).toEqualImage('/src/spec/images/FadeInOutSpec/fadeout.png').then(() => {
          done();
        });
      });
    });
  });
});