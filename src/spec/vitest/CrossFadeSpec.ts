import * as ex from '@excalibur';
import { TestUtils } from '../__util__/TestUtils';

describe('A CrossFade transition', () => {
  it('exists', () => {
    expect(ex.CrossFade).toBeDefined();
  });

  it('can be constructed', () => {
    const sut = new ex.CrossFade({ duration: 1000 });
    expect(sut.duration).toBe(1000);
    expect(sut.name).toContain('CrossFade#');
  });

  /**
   *
   */
  async function nextTask() {
    const future = new ex.Future<void>();
    setTimeout(() => {
      future.resolve();
    });

    return await future.promise;
  }
  /**
   *
   */
  async function nextMicroTask() {
    const future = new ex.Future<void>();
    queueMicrotask(() => {
      future.resolve();
    });
    return await future.promise;
  }

  it.skip('@visual can cross fade', async () => {
    const engine = TestUtils.engine({ backgroundColor: ex.Color.ExcaliburBlue });
    const clock = engine.clock as ex.TestClock;
    await TestUtils.runToReady(engine);
    engine.rootScene.add(
      new ex.Actor({
        pos: ex.vec(20, 20),
        width: 100,
        height: 100,
        color: ex.Color.Red
      })
    );

    const onDeactivateSpy = vi.fn(() => Promise.resolve());

    engine.director.getSceneInstance('root').onDeactivate = onDeactivateSpy;

    const sut = new ex.CrossFade({ duration: 1000 });
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

    const goto = engine.goToScene('newScene', { destinationIn: sut });
    clock.step(1);
    await nextMicroTask();
    clock.step(1);
    await nextMicroTask();
    clock.step(1);
    await nextTask();
    clock.step(1);
    await nextTask();
    clock.step(1);
    await nextTask();
    clock.step(100);
    clock.step(100);
    clock.step(100);
    clock.step(100);
    clock.step(100);
    clock.step(100);

    expect(engine.currentSceneName).toBe('newScene');
    expect(onDeactivateSpy).toHaveBeenCalledTimes(1);
    await expect(engine.canvas).toEqualImage('/src/spec/assets/images/CrossFadeSpec/crossfade.png');
  });
});
