import * as ex from '@excalibur';
import { TestUtils } from '../__util__/test-utils';

describe('A Timer', () => {
  let timer;
  let scene: ex.Scene;
  let engine: ex.Engine;

  beforeEach(async () => {
    engine = TestUtils.engine({
      width: 600,
      height: 400
    });
    timer = new ex.Timer({
      interval: 500,
      fcn: function () {
        /*do nothing*/
      }
    });
    scene = new ex.Scene();
    engine.addScene('root', scene);

    await TestUtils.runToReady(engine);
  });

  afterEach(() => {
    engine.stop();
    engine.dispose();
    engine = null;
  });

  it('has a unique id', () => {
    const newtimer = new ex.Timer({
      interval: 500,
      fcn: function () {
        /*do nothing*/
      }
    });
    expect(timer.id).not.toBe(newtimer.id);
    expect(timer.id).toBe(newtimer.id - 1);

    const newtimer2 = new ex.Timer({
      interval: 500,
      fcn: function () {
        /*do nothing*/
      }
    });
    expect(timer.id).not.toBe(newtimer2.id);
    expect(timer.id).toBe(newtimer2.id - 2);
  });

  it('does not start when added to a scene', () => {
    const sut = new ex.Timer({
      interval: 42,
      fcn: () => {
        /* nothing */
      }
    });

    const scene = new ex.Scene();

    scene.add(sut);

    expect(sut.isRunning).toBe(false);
  });

  it('can be paused and resumed', () => {
    const timerSpy = vi.fn();
    const sut = new ex.Timer({
      interval: 42,
      fcn: timerSpy
    });

    scene.add(sut);
    sut.start();

    scene.update(engine, 40);
    expect(sut.timeToNextAction).toBe(2);
    expect(sut.timeElapsedTowardNextAction).toBe(40);

    sut.pause();
    scene.update(engine, 40);
    expect(sut.timeToNextAction).toBe(2);
    expect(sut.timeElapsedTowardNextAction).toBe(40);
    expect(timerSpy).not.toHaveBeenCalled();

    sut.resume();
    scene.update(engine, 40);
    expect(timerSpy).toHaveBeenCalledTimes(1);
    expect(sut.complete).toBe(true);
    expect(sut.isRunning).toBe(false);
    expect(sut.timeToNextAction).toBe(0);
    expect(sut.timeElapsedTowardNextAction).toBe(0);
  });

  it('does not warn when added to a scene', () => {
    const warnSpy = vi.spyOn(ex.Logger.getInstance(), 'warn');
    const timerSpy = vi.fn();
    const sut = new ex.Timer({
      interval: 42,
      fcn: timerSpy
    });

    scene.add(sut);

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('can be stopped and started', () => {
    const timerSpy = vi.fn();
    const sut = new ex.Timer({
      interval: 42,
      fcn: timerSpy
    });

    scene.add(sut);
    sut.start();

    scene.update(engine, 40);
    expect(sut.timeToNextAction).toBe(2);
    expect(sut.timeElapsedTowardNextAction).toBe(40);

    sut.stop();
    expect(sut.timeElapsedTowardNextAction).toBe(0);
    expect(sut.timeToNextAction).toBe(42);
    expect(sut.complete).toBe(false);
    expect(sut.isRunning).toBe(false);

    sut.start();
    scene.update(engine, 40);
    expect(sut.timeToNextAction).toBe(2);
    expect(sut.timeElapsedTowardNextAction).toBe(40);
  });

  it('fires after a specific interval', () => {
    const timerSpy = vi.fn();
    const sut = new ex.Timer({
      interval: 500,
      fcn: timerSpy
    });
    sut.start();
    sut.update(501);
    sut.update(501);
    expect(sut.complete).toBe(true);
    expect(timerSpy).toHaveBeenCalledTimes(1);
  });

  it('can repeat itself indefinitely at a specified interval', () => {
    const timerSpy = vi.fn();
    timer = new ex.Timer({
      interval: 500,
      fcn: timerSpy,
      repeats: true
    });

    timer.start();
    timer.update(501);
    timer.update(501);
    timer.update(501);

    expect(timerSpy).toHaveBeenCalledTimes(3);
  });

  it('can repeat itself a finite number of times', () => {
    const timerSpy = vi.fn();
    timer = new ex.Timer({
      interval: 500,
      fcn: timerSpy,
      repeats: true,
      numberOfRepeats: 2
    });

    timer.start();
    timer.update(501);
    timer.update(501);
    timer.update(501);
    timer.update(501);
    timer.update(501);

    expect(timerSpy).toHaveBeenCalledTimes(2);
  });

  it('can return how long it has been running', () => {
    timer.start();
    timer.update(372);

    expect(timer.getTimeRunning()).toEqual(372);
  });

  it('can be canceled', () => {
    const timerSpy = vi.fn();
    timer = new ex.Timer({
      interval: 500,
      fcn: timerSpy,
      repeats: true
    });
    scene.addTimer(timer);
    timer.start();

    scene.update(engine, 501);
    scene.update(engine, 501);
    scene.update(engine, 501);
    timer.cancel();
    scene.update(engine, 501);
    scene.update(engine, 501);
    scene.update(engine, 501);

    expect(timerSpy).toHaveBeenCalledTimes(3);
  });

  it('is no longer active in the scene when it is completed', () => {
    scene.addTimer(timer);
    timer.start();

    expect(scene.isTimerActive(timer)).toBeTruthy();
    scene.update(engine, 501);
    expect(scene.isTimerActive(timer)).toBeFalsy();
  });

  it('is in the completed state once it is finished', () => {
    scene.addTimer(timer);
    timer.start();
    scene.update(engine, 501);
    expect(timer.complete).toBeTruthy();
  });

  it('has no completed state when running forever', () => {
    const timerSpy = vi.fn();
    timer = new ex.Timer({
      interval: 500,
      fcn: timerSpy,
      repeats: true
    });
    scene.addTimer(timer);
    timer.start();

    scene.update(engine, 501);
    expect(timerSpy).toHaveBeenCalledTimes(1);
    expect(timer.repeats).toBeTruthy();
    expect(timer.complete).toBeFalsy();

    scene.update(engine, 501);
    expect(timerSpy).toHaveBeenCalledTimes(2);
    expect(timer.repeats).toBeTruthy();
    expect(timer.complete).toBeFalsy();

    scene.update(engine, 501);
    expect(timerSpy).toHaveBeenCalledTimes(3);
    expect(timer.repeats).toBeTruthy();
    expect(timer.complete).toBeFalsy();
  });

  it('can be reset at the same interval', () => {
    const timerSpy = vi.fn();
    // non-repeating timer
    timer = new ex.Timer({
      interval: 500,
      fcn: timerSpy,
      repeats: false
    });
    scene.add(timer);
    timer.start();

    // tick the timer
    scene.update(engine, 501);
    expect(timerSpy).toHaveBeenCalledTimes(1);

    // tick the timer again, but it shouldn't fire until reset
    scene.update(engine, 501);
    expect(timerSpy).toHaveBeenCalledTimes(1);
    expect(timer.complete).toBe(true);

    // once reset the timer should fire again
    timer.reset();
    timer.start();
    expect(timer.complete).toBe(false);
    scene.update(engine, 501);
    expect(timerSpy).toHaveBeenCalledTimes(2);
  });

  it('can be reset at a different interval', () => {
    let count = 0;
    // non-repeating timer
    timer = new ex.Timer({
      interval: 500,
      fcn: function () {
        count++;
      },
      repeats: false
    });
    scene.add(timer);
    timer.start();

    // tick the timer
    scene.update(engine, 501);
    expect(count).toBe(1);

    // tick the timer again, but it shouldn't fire until reset
    scene.update(engine, 501);
    expect(count).toBe(1);
    expect(timer.complete).toBe(true);

    // once reset at a larger the timer should fire again
    timer.reset(900);
    timer.start();
    expect(timer.complete).toBe(false);
    scene.update(engine, 901);
    expect(count).toBe(2);
  });

  it('can be reset on a repeating timer', () => {
    let count = 0;
    // non-repeating timer
    timer = new ex.Timer({
      interval: 500,
      fcn: function () {
        count++;
      },
      repeats: true
    });
    scene.add(timer);
    timer.start();

    // tick the timer
    scene.update(engine, 501);
    expect(count).toBe(1);

    timer.reset(30);

    for (let i = 0; i < 100; i++) {
      scene.update(engine, 31);
      expect(count).toBe(2 + i);
      expect(timer.complete).toBe(false);
    }
  });

  it('can be reset with a different number of maximum iterations', () => {
    // non-repeating timer
    timer = new ex.Timer({
      interval: 500,
      fcn: function () {
        const dummy = 0;
      },
      repeats: true,
      numberOfRepeats: 3
    });
    scene.add(timer);
    timer.start();

    // tick the timer
    scene.update(engine, 501);
    scene.update(engine, 501);
    scene.update(engine, 501);
    expect(timer.timesRepeated).toBe(3);

    // tick the timer again, but it shouldn't fire until reset
    scene.update(engine, 501);
    expect(timer.timesRepeated).toBe(3);
    expect(timer.complete).toBe(true);

    // once reset the timer should fire again
    timer.reset(500, 4);
    timer.start();
    expect(timer.complete).toBe(false);
    scene.update(engine, 501);
    scene.update(engine, 501);
    scene.update(engine, 501);
    scene.update(engine, 501);
    expect(timer.timesRepeated).toBe(4);
  });

  it('can be paused', () => {
    let count = 0;
    // arrange
    const timer = new ex.Timer({
      interval: 100,
      fcn: () => {
        count++;
      },
      repeats: true
    });
    scene.add(timer);
    timer.start();

    // act
    timer.pause();
    scene.update(engine, 200);

    // assert
    expect(count).toBe(0);
    expect(timer.complete).toBe(false);
  });

  it('can be unpaused', () => {
    let count = 0;
    // arrange
    const timer = new ex.Timer({
      interval: 100,
      fcn: () => {
        count++;
      },
      repeats: true
    });
    scene.add(timer);
    timer.start();

    // act
    timer.pause();
    scene.update(engine, 200);
    timer.resume();
    scene.update(engine, 100);
    scene.update(engine, 100);

    // assert
    expect(count).toBe(2);
    expect(timer.complete).toBe(false);
  });

  it('it can be initialized with without a callback function and add one later', () => {
    let count = 0;
    // arrange
    const timer = new ex.Timer({
      interval: 100,
      repeats: true
    });
    scene.add(timer);
    timer.start();
    scene.update(engine, 100);

    // assert
    expect(count).toBe(0);

    timer.on(() => {
      count++;
    });
    scene.update(engine, 100);

    // assert
    expect(count).toBe(1);
  });

  it('it supports multiple callback functions', () => {
    let count = 0;
    // arrange
    const timer = new ex.Timer({
      interval: 100,
      repeats: true
    });

    scene.add(timer);
    timer.start();

    timer.on(() => {
      count++;
    });
    scene.update(engine, 100);

    // assert
    expect(count).toBe(1);

    timer.on(() => {
      count++;
    });
    timer.on(() => {
      count++;
    });
    scene.update(engine, 100);

    // assert
    expect(count).toBe(4);
  });

  it('it supports removing a callback function', () => {
    let count = 0;
    // arrange
    const timer = new ex.Timer({
      interval: 100,
      repeats: true
    });

    scene.add(timer);
    timer.start();

    const fnc = () => {
      count++;
    };

    timer.on(fnc);
    scene.update(engine, 100);

    // assert
    expect(count).toBe(1);

    timer.off(fnc);
    scene.update(engine, 100);

    // assert
    expect(count).toBe(1);
  });

  it('can be initialized with random time range', () => {
    const timer = new ex.Timer({
      interval: 100,
      randomRange: [0, 200]
    });
    scene.add(timer);
    timer.start();
    expect(timer.complete).toBe(false);
    scene.update(engine, 100);
    expect(timer.interval).toBeGreaterThanOrEqual(100);
    expect(timer.interval).toBeLessThanOrEqual(300);
  });

  it('has a random interval even with repetition', () => {
    const timer = new ex.Timer({
      interval: 100,
      randomRange: [0, 200],
      repeats: true
    });
    scene.add(timer);
    timer.start();
    timer.update(301);
    expect(timer.interval).toBeGreaterThanOrEqual(100);
    expect(timer.interval).toBeLessThanOrEqual(300);
  });

  it('an Random instance can be passed, if specified', () => {
    const randomMock = {
      integer: vi.fn(() => 11)
    } as any;
    const timer = new ex.Timer({ interval: 500, repeats: false, randomRange: [0, 100], random: randomMock });
    scene.add(timer);
    timer.start();
    expect(timer.interval).toBe(511);
    timer.update(511);
  });

  it('has a randomly set interval with repetition and Random instance passed', () => {
    const randomMock = {
      integer: vi
        .fn()
        .mockImplementationOnce(() => 11)
        .mockImplementationOnce(() => 5)
        .mockImplementationOnce(() => 2)
        .mockImplementationOnce(() => 99)
    } as any;
    const timer = new ex.Timer({ interval: 500, repeats: true, randomRange: [0, 100], random: randomMock });
    scene.add(timer);
    timer.start();
    expect(timer.interval).toBe(511);
    timer.update(511);
    expect(timer.interval).toBe(505);
    timer.update(505);
    expect(timer.interval).toBe(502);
    timer.update(502);
    expect(timer.interval).toBe(599);
  });

  it('is random after reset with Random instance passed and no repeats are added', () => {
    const randomMock = {
      integer: vi
        .fn()
        .mockImplementationOnce(() => 11)
        .mockImplementationOnce(() => 5)
    } as any;

    const timer = new ex.Timer({ interval: 500, repeats: false, randomRange: [0, 100], random: randomMock });
    scene.add(timer);
    timer.start();
    expect(timer.interval).toBe(511);
    timer.update(511);
    timer.reset();
    timer.start();
    expect(timer.interval).toBe(505);
    timer.update(505);
  });

  it('produces random intervals even with new interval passed during reset', () => {
    const randomMock = {
      integer: vi
        .fn()
        .mockImplementationOnce(() => 11)
        .mockImplementationOnce(() => 11)
        .mockImplementationOnce(() => 5)
    } as any;
    const timer = new ex.Timer({ interval: 500, repeats: true, randomRange: [0, 100], random: randomMock });
    scene.add(timer);
    timer.start();
    expect(timer.interval).toBe(511);
    timer.update(511);
    timer.reset(900);
    timer.start();
    expect(timer.interval).toBe(900);
    timer.update(901);
    expect(timer.interval).toBe(905);
    timer.update(905);
  });

  describe('events', () => {
    it("fires 'action' event for every timer tick", () => {
      const actionSpy = vi.fn();
      const actionEventSpy = vi.fn();

      const sut = new ex.Timer({
        interval: 42,
        repeats: true,
        numberOfRepeats: 2,
        action: actionSpy
      });
      sut.events.on('action', actionEventSpy);

      scene.add(sut);

      expect(actionSpy).not.toHaveBeenCalled();
      expect(actionEventSpy).not.toHaveBeenCalled();
      sut.start();
      expect(actionSpy).not.toHaveBeenCalled();
      expect(actionEventSpy).not.toHaveBeenCalledOnce();

      scene.update(engine, 43);
      scene.update(engine, 43);
      scene.update(engine, 43);
      scene.update(engine, 43);

      expect(actionSpy).toHaveBeenCalledTimes(2);
      expect(actionEventSpy).toHaveBeenCalledTimes(2);
    });

    it("fires 'complete' event when the timer has fired its last action", () => {
      const completeSpy = vi.fn();
      const completeEventSpy = vi.fn();

      const sut = new ex.Timer({
        interval: 42,
        repeats: true,
        numberOfRepeats: 2,
        onComplete: completeSpy
      });
      sut.events.on('complete', completeEventSpy);

      scene.add(sut);

      expect(completeSpy).not.toHaveBeenCalled();
      expect(completeEventSpy).not.toHaveBeenCalled();
      sut.start();
      expect(completeSpy).not.toHaveBeenCalled();
      expect(completeEventSpy).not.toHaveBeenCalledOnce();

      scene.update(engine, 43);
      scene.update(engine, 43);
      scene.update(engine, 43);
      scene.update(engine, 43);

      expect(completeSpy).toHaveBeenCalledTimes(1);
      expect(completeEventSpy).toHaveBeenCalledTimes(1);
    });

    it("fires 'start' event when started", () => {
      const startSpy = vi.fn();

      const sut = new ex.Timer({
        interval: 42
      });
      sut.events.on('start', startSpy);

      scene.add(sut);

      expect(startSpy).not.toHaveBeenCalled();
      sut.start();
      expect(startSpy).toHaveBeenCalledOnce();
    });

    it("fires 'pause' event when paused", () => {
      const pauseSpy = vi.fn();

      const sut = new ex.Timer({
        interval: 42
      });
      sut.events.on('pause', pauseSpy);

      scene.add(sut);

      expect(pauseSpy).not.toHaveBeenCalled();
      sut.start();
      expect(pauseSpy).not.toHaveBeenCalled();

      scene.update(engine, 40);

      sut.pause();
      expect(pauseSpy).toHaveBeenCalledOnce();
    });

    it("fires 'resume' event when resumed", () => {
      const resumeSpy = vi.fn();

      const sut = new ex.Timer({
        interval: 42
      });
      sut.events.on('resume', resumeSpy);

      scene.add(sut);

      expect(resumeSpy).not.toHaveBeenCalled();
      sut.start();
      expect(resumeSpy).not.toHaveBeenCalled();

      scene.update(engine, 40);

      sut.pause();
      expect(resumeSpy).not.toHaveBeenCalledOnce();

      scene.update(engine, 40);
      sut.resume();

      expect(resumeSpy).toHaveBeenCalledOnce();
    });

    it("fires 'stop' event when stopped", () => {
      const stopSpy = vi.fn();

      const sut = new ex.Timer({
        interval: 42
      });
      sut.events.on('stop', stopSpy);

      scene.add(sut);

      expect(stopSpy).not.toHaveBeenCalled();
      sut.start();
      expect(stopSpy).not.toHaveBeenCalled();

      scene.update(engine, 40);

      sut.pause();
      expect(stopSpy).not.toHaveBeenCalledOnce();

      scene.update(engine, 40);
      sut.resume();

      expect(stopSpy).not.toHaveBeenCalledOnce();

      scene.update(engine, 40);
      sut.stop();

      expect(stopSpy).toHaveBeenCalledOnce();
    });

    it("fires 'cancel' event when cancelled", () => {
      const cancelSpy = vi.fn();

      const sut = new ex.Timer({
        interval: 42
      });
      sut.events.on('cancel', cancelSpy);

      scene.add(sut);

      expect(cancelSpy).not.toHaveBeenCalled();
      sut.start();
      expect(cancelSpy).not.toHaveBeenCalled();

      scene.update(engine, 40);

      sut.pause();
      expect(cancelSpy).not.toHaveBeenCalledOnce();

      scene.update(engine, 40);
      sut.resume();

      expect(cancelSpy).not.toHaveBeenCalledOnce();

      scene.update(engine, 40);
      sut.stop();
      sut.cancel();

      expect(cancelSpy).toHaveBeenCalledOnce();
    });
  });
});
