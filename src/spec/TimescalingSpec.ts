import * as ex from '../../build/dist/excalibur';
import { Mocks } from './util/Mocks';

describe('The engine', () => {
  let engine: ex.Engine;
  let scene: ex.Scene;
  const mock = new Mocks.Mocker();
  let loop: Mocks.GameLoopLike;
  let actor: ex.Actor;

  beforeEach(() => {
    engine = mock.engine(0, 0);
    scene = new ex.Scene(engine);
    engine.currentScene = scene;
    actor = new ex.Actor(0, 0, 10, 10, ex.Color.Red);
    loop = mock.loop(engine);

    scene.add(actor);
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
    loop.advance(1100);

    expect(actor.pos.x).toBe(10, 'actor did not move twice as fast');
  });

  it('should run at 1/2 speed when timescale is 0.5', () => {
    engine.timescale = 0.5;

    actor.actions.moveTo(10, 0, 5);

    // 5px per second
    // 2s = 10px
    // 10px * 0.5x = 5px
    // actor moves twice as slow
    loop.advance(2000);

    expect(actor.pos.x).toBeCloseTo(5, 0.2, 'actor did not move twice as slow');
  });
});
