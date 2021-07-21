import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';

describe('A Timer', () => {
  let timer;
  let scene: ex.Scene;
  let engine: ex.Engine;

  beforeEach(() => {
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
    scene = new ex.Scene(engine);
    engine.addScene('root', scene);
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
    const timerSpy = jasmine.createSpy('timer');
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

  it('can be stopped and started', () => {
    const timerSpy = jasmine.createSpy('timer');
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
    const timerSpy = jasmine.createSpy('timer');
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
    const timerSpy = jasmine.createSpy('timer');
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
    const timerSpy = jasmine.createSpy('timer');
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
    const timerSpy = jasmine.createSpy('timer');
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
    const timerSpy = jasmine.createSpy('timer');
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
    const timerSpy = jasmine.createSpy('timer');
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
});
