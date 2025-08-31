import * as ex from '@excalibur';
import { TestUtils } from '../__util__/TestUtils';
import { Mocks } from '../__util__/Mocks';
import type { TestClock } from '@excalibur';

describe('The engine', () => {
  let engine: ex.Engine;
  let scene: ex.Scene;
  const mock = new Mocks.Mocker();
  let actor: ex.Actor;
  let stats: ex.FrameStats;

  beforeEach(async () => {
    engine = TestUtils.engine({
      width: 400,
      height: 400
    });
    scene = new ex.Scene();
    engine.addScene('newScene', scene);
    await engine.goToScene('newScene'); // TODO use new method
    actor = new ex.Actor({ x: 0, y: 0, width: 10, height: 10, color: ex.Color.Red });

    scene.add(actor);
    await TestUtils.runToReady(engine);
    const clock = engine.clock as TestClock;
    clock.step(16.6);
    stats = engine.stats.currFrame;
  });

  afterEach(() => {
    engine.stop();
    engine.dispose();
    engine = null;
  });

  it('should have current and previous frame stats defined', () => {
    expect(engine.stats.prevFrame).toBeDefined();
    expect(engine.stats.currFrame).toBeDefined();
  });

  describe('after frame is ended', () => {
    it('should collect frame elapsedMs', () => {
      expect(stats.elapsedMs, 'Frame stats elapsedMs should be ~16ms').toBeCloseTo(16.6, 0);
    });

    it('should collect frame fps', () => {
      expect(stats.fps, 'Frame stats fps should be ~60fps').toBeCloseTo(60);
    });

    it('should collect frame actor stats', () => {
      expect(stats.actors.total, 'Frame actor total is wrong').toBe(1);
      expect(stats.actors.alive, 'Frame actor alive is wrong').toBe(1);
      expect(stats.actors.killed, 'Frame actor killed is wrong').toBe(0);
      expect(stats.actors.remaining, 'Frame actor remaining is wrong').toBe(1);
      expect(stats.actors.ui, 'Frame actor ui count is wrong').toBe(0);
    });

    it('should collect frame duration stats', () => {
      expect(stats.duration.total, 'Frame duration total is wrong').toBeCloseTo(0, 1);
      expect(stats.duration.draw, 'Frame duration draw is wrong').toBeCloseTo(0, 1);
      expect(stats.duration.update, 'Frame duration update is wrong').toBeCloseTo(0, 1);
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
    sut.elapsedMs = 10;
    sut.actors.alive = 3;
    sut.actors.killed = 1;
    sut.actors.ui = 1;
    sut.duration.update = 10;
    sut.duration.draw = 10;

    const clone = sut.clone();

    expect(sut).toEqual(clone);
  });
});
