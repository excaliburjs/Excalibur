import * as ex from '@excalibur';
import { TestUtils } from '../__util__/TestUtils';

describe('A Slide transition', () => {
  it('exists', () => {
    expect(ex.Slide).toBeDefined();
  });

  it('can be constructed', () => {
    const sut = new ex.Slide({ duration: 1000, slideDirection: 'up' });
    expect(sut.duration).toBe(1000);
    expect(sut.name).toContain('Slide#');
  });
  describe('@visual', () => {
    it('can slide down', async () => {
      const engine = TestUtils.engine({ backgroundColor: ex.Color.ExcaliburBlue });
      const clock = engine.clock as ex.TestClock;
      await TestUtils.runToReady(engine);
      engine.add(
        new ex.Actor({
          pos: ex.vec(20, 20),
          width: 100,
          height: 100,
          color: ex.Color.Red
        })
      );

      const onDeactivateSpy = vi.fn();

      engine.director.getSceneInstance('root').onDeactivate = onDeactivateSpy;

      const sut = new ex.Slide({ duration: 1000, slideDirection: 'down' });
      const scene = new ex.Scene();
      scene.add(
        new ex.Actor({
          pos: ex.vec(200, 200),
          width: 40,
          height: 40,
          color: ex.Color.Violet
        })
      );
      engine.addScene('newScene', { scene, transitions: { in: sut } });

      const goto = engine.goToScene('newScene');
      await TestUtils.flushMicrotasks(clock, 15);
      await TestUtils.untilMacrotask(() => engine.currentSceneName !== 'root');
      clock.step(500);
      expect(onDeactivateSpy).toHaveBeenCalledTimes(1);
      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/SlideSpec/slide-down.png');
      engine.stop();
      engine.dispose();
    });

    it('can slide right', async () => {
      const engine = TestUtils.engine({ backgroundColor: ex.Color.ExcaliburBlue });
      const clock = engine.clock as ex.TestClock;
      await TestUtils.runToReady(engine);
      engine.add(
        new ex.Actor({
          pos: ex.vec(20, 20),
          width: 100,
          height: 100,
          color: ex.Color.Red
        })
      );

      const onDeactivateSpy = vi.fn();

      engine.director.getSceneInstance('root').onDeactivate = onDeactivateSpy;

      const sut = new ex.Slide({ duration: 1000, slideDirection: 'right' });
      const scene = new ex.Scene();
      scene.add(
        new ex.Actor({
          pos: ex.vec(200, 200),
          width: 40,
          height: 40,
          color: ex.Color.Violet
        })
      );
      engine.addScene('newScene', { scene, transitions: { in: sut } });

      const goto = engine.goToScene('newScene');
      await TestUtils.flushMicrotasks(clock, 15);
      await TestUtils.untilMacrotask(() => engine.currentSceneName !== 'root');
      clock.step(500);
      expect(onDeactivateSpy).toHaveBeenCalledTimes(1);
      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/SlideSpec/slide-right.png');
      engine.stop();
      engine.dispose();
    });

    it('can slide left', async () => {
      const engine = TestUtils.engine({ backgroundColor: ex.Color.ExcaliburBlue });
      const clock = engine.clock as ex.TestClock;
      await TestUtils.runToReady(engine);
      engine.add(
        new ex.Actor({
          pos: ex.vec(400, 200),
          width: 100,
          height: 100,
          color: ex.Color.Red
        })
      );

      const onDeactivateSpy = vi.fn();

      engine.director.getSceneInstance('root').onDeactivate = onDeactivateSpy;

      const sut = new ex.Slide({ duration: 1000, slideDirection: 'left' });
      const scene = new ex.Scene();
      scene.add(
        new ex.Actor({
          pos: ex.vec(200, 200),
          width: 40,
          height: 40,
          color: ex.Color.Violet
        })
      );
      engine.addScene('newScene', { scene, transitions: { in: sut } });

      const goto = engine.goToScene('newScene');
      await TestUtils.flushMicrotasks(clock, 15);
      await TestUtils.untilMacrotask(() => engine.currentSceneName !== 'root');
      clock.step(500);
      expect(onDeactivateSpy).toHaveBeenCalledTimes(1);
      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/SlideSpec/slide-left.png');
      engine.stop();
      engine.dispose();
    });

    it('can slide up', async () => {
      const engine = TestUtils.engine({ backgroundColor: ex.Color.ExcaliburBlue });
      const clock = engine.clock as ex.TestClock;
      await TestUtils.runToReady(engine);
      engine.add(
        new ex.Actor({
          pos: ex.vec(400, 400),
          width: 100,
          height: 100,
          color: ex.Color.Red
        })
      );

      const onDeactivateSpy = vi.fn();

      engine.director.getSceneInstance('root').onDeactivate = onDeactivateSpy;

      const sut = new ex.Slide({ duration: 1000, slideDirection: 'up' });
      const scene = new ex.Scene();
      scene.add(
        new ex.Actor({
          pos: ex.vec(200, 200),
          width: 40,
          height: 40,
          color: ex.Color.Violet
        })
      );
      engine.addScene('newScene', { scene, transitions: { in: sut } });

      const goto = engine.goToScene('newScene');
      await TestUtils.flushMicrotasks(clock, 15);
      await TestUtils.untilMacrotask(() => engine.currentSceneName !== 'root');
      clock.step(500);
      expect(onDeactivateSpy).toHaveBeenCalledTimes(1);
      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/SlideSpec/slide-up.png');
      engine.stop();
      engine.dispose();
    });

    it('can slide up  with custom easing', async () => {
      const engine = TestUtils.engine({ backgroundColor: ex.Color.ExcaliburBlue });
      const clock = engine.clock as ex.TestClock;
      await TestUtils.runToReady(engine);
      engine.add(
        new ex.Actor({
          pos: ex.vec(450, 450),
          width: 100,
          height: 100,
          color: ex.Color.Red
        })
      );

      const onDeactivateSpy = vi.fn();

      engine.director.getSceneInstance('root').onDeactivate = onDeactivateSpy;

      const sut = new ex.Slide({
        duration: 1000,
        slideDirection: 'up',
        easingFunction: ex.EasingFunctions.EaseInOutCubic
      });
      const scene = new ex.Scene();
      scene.add(
        new ex.Actor({
          pos: ex.vec(200, 200),
          width: 40,
          height: 40,
          color: ex.Color.Violet
        })
      );
      engine.addScene('newScene', { scene, transitions: { in: sut } });

      const goto = engine.goToScene('newScene');
      await TestUtils.flushMicrotasks(clock, 15);
      await TestUtils.untilMacrotask(() => engine.currentSceneName !== 'root');
      clock.step(700);
      expect(onDeactivateSpy).toHaveBeenCalledTimes(1);
      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/SlideSpec/slide-up-transition.png');
      engine.stop();
      engine.dispose();
    });
  });
});
