import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';
import { Mocks } from './util/Mocks';

describe('The engine', () => {
  let engine: ex.Engine;
  let scene: ex.Scene;
  const mock = new Mocks.Mocker();
  let loop: Mocks.GameLoopLike;
  let actor: ex.Actor;
  let stats: ex.FrameStats;

  beforeEach(() => {
    engine = TestUtils.engine({
      width: 400,
      height: 400
    });
    scene = new ex.Scene(engine);
    engine.currentScene = scene;
    actor = new ex.Actor(0, 0, 10, 10, ex.Color.Red);
    loop = mock.loop(engine);

    scene.add(actor);
    engine.start();

    loop.advance(100);

    stats = engine.stats.currFrame;
  });

  afterEach(() => {
    engine.stop();
    engine = null;
  });

  it('should have current and previous frame stats defined', () => {
    expect(engine.stats.prevFrame).toBeDefined();
    expect(engine.stats.currFrame).toBeDefined();
  });

  describe('after frame is ended', () => {
    it('should collect frame delta', () => {
      expect(stats.delta).toBe(16, 'Frame stats delta is wrong');
    });

    it('should collect frame fps', () => {
      expect(stats.fps).toBe(62.5, 'Frame stats fps is wrong');
    });

    it('should collect frame actor stats', () => {
      expect(stats.actors.total).toBe(1, 'Frame actor total is wrong');
      expect(stats.actors.alive).toBe(1, 'Frame actor alive is wrong');
      expect(stats.actors.killed).toBe(0, 'Frame actor killed is wrong');
      expect(stats.actors.remaining).toBe(1, 'Frame actor remaining is wrong');
      expect(stats.actors.ui).toBe(0, 'Frame actor ui count is wrong');
    });

    it('should collect frame duration stats', () => {
      expect(stats.duration.total).toBeCloseTo(0, 1, 'Frame duration total is wrong');
      expect(stats.duration.draw).toBeCloseTo(0, 1, 'Frame duration draw is wrong');
      expect(stats.duration.update).toBeCloseTo(0, 1, 'Frame duration update is wrong');
    });
  });
});

describe('FrameStats', () => {
  let sut: ex.FrameStats;

  beforeEach(() => {
    sut = new ex.FrameStats();
  });

  it('can be cloned', () => {
    sut.id = 10;
    sut.fps = 10;
    sut.delta = 10;
    sut.actors.alive = 3;
    sut.actors.killed = 1;
    sut.actors.ui = 1;
    sut.duration.update = 10;
    sut.duration.draw = 10;

    const clone = sut.clone();

    expect(sut).toEqual(clone);
  });
});
