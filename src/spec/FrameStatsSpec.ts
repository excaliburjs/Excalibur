import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';
import { Mocks } from './util/Mocks';
import { TestClock } from '@excalibur';

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
      expect(stats.elapsedMs).withContext('Frame stats elapsedMs should be ~16ms').toBeCloseTo(16.6, 0);
    });

    it('should collect frame fps', () => {
      expect(stats.fps).withContext('Frame stats fps should be ~60fps').toBeCloseTo(60);
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
