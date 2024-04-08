import * as ex from '@excalibur';
import { Mocks } from './util/Mocks';
import { TestUtils } from './util/TestUtils';

describe('The engine', () => {
  let engine: ex.Engine;
  let scene: ex.Scene;
  let actor: ex.Actor;
  let clock: ex.TestClock;

  beforeEach(async () => {
    engine = TestUtils.engine({ width: 0, height: 0 });
    scene = new ex.Scene();
    engine.add('test', scene);
    engine.goToScene('test');
    actor = new ex.Actor({ x: 0, y: 0, width: 10, height: 10, color: ex.Color.Red });
    scene.add(actor);
    clock = engine.clock as ex.TestClock;
    await TestUtils.runToReady(engine);
  });

  afterEach(() => {
    engine.stop();
    engine.dispose();
    engine = null;
  });

  it('should default to a timescale of 1.0', () => {
    expect(engine.timescale).toBe(1.0);
  });

  it('should run at 2x speed when timescale is 2.0', () => {
    engine.timescale = 2.0;

    actor.actions.moveTo(10, 0, 5);

    // 5px per second
    // 1s = 5px
    // 5px * 2x = 10px
    // actor moves twice as fast
    clock.step(1000);

    expect(actor.pos.x).toBe(10, 'actor did not move twice as fast');
  });

  it('should run at 1/2 speed when timescale is 0.5', () => {
    engine.timescale = 0.5;

    actor.actions.moveTo(10, 0, 5);

    // 5px per second
    // 2s = 10px
    // 10px * 0.5x = 5px
    // actor moves twice as slow
    clock.step(2000);

    expect(actor.pos.x).toBeCloseTo(5, 0.2, 'actor did not move twice as slow');
  });
});
