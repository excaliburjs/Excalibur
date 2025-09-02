import * as ex from '@excalibur';

import { TestUtils } from '../__util__/TestUtils';

describe('A actor can curve', () => {
  let engine: ex.Engine;
  let clock: ex.TestClock;
  beforeEach(async () => {
    engine = TestUtils.engine();
    await TestUtils.runToReady(engine);
    await engine.start();
    clock = engine.clock as ex.TestClock;
  });

  afterEach(() => {
    engine.stop();
    engine.dispose();
    engine = null;
  });

  it('exists', () => {
    expect(ex.CurveTo).toBeDefined();
  });

  it('an actor can curveTo ', () => {
    const actor = new ex.Actor({
      pos: ex.vec(200, 202)
    });
    const scene = engine.currentScene;
    scene.add(actor);

    actor.actions.curveTo({
      controlPoints: [ex.vec(100, 100), ex.vec(0, 0), ex.vec(100, 200)],
      duration: 1000
    });

    clock.step(0);
    clock.run(10, 100);

    expect(actor.pos).toBeVector(ex.vec(100, 200));
  });

  it('an actor can curveBy ', () => {
    const actor = new ex.Actor({
      pos: ex.vec(200, 202)
    });
    const scene = engine.currentScene;
    scene.add(actor);

    actor.actions.curveBy({
      controlPoints: [ex.vec(0, 100), ex.vec(0, 100), ex.vec(100, 200)],
      duration: 1000
    });

    clock.step(0);
    clock.run(10, 100);

    expect(actor.pos).toBeVector(ex.vec(300, 402));
  });

  it('curveBy can be stopped', () => {
    const actor = new ex.Actor({
      pos: ex.vec(200, 202)
    });
    const scene = engine.currentScene;
    scene.add(actor);

    actor.actions.curveBy({
      controlPoints: [ex.vec(0, 100), ex.vec(0, 100), ex.vec(100, 200)],
      duration: 1000
    });

    clock.step(0);
    clock.run(5, 100);
    const pos = actor.pos.clone();
    actor.actions.getQueue().getActions()[0].stop();
    expect(actor.pos).toBeVector(pos);
  });

  it('curveTo can be stopped', () => {
    const actor = new ex.Actor({
      pos: ex.vec(200, 202)
    });
    const scene = engine.currentScene;
    scene.add(actor);

    actor.actions.curveTo({
      controlPoints: [ex.vec(0, 100), ex.vec(0, 100), ex.vec(100, 200)],
      duration: 1000
    });

    clock.step(0);
    clock.run(5, 100);
    const pos = actor.pos.clone();
    actor.actions.getQueue().getActions()[0].stop();
    expect(actor.pos).toBeVector(pos);
  });
});
