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

  it('fires after a specific interval', () => {
    //scene.addTimer(timer);
    //scene.update(null, 501);
    timer.update(501);
    timer.update(501);
    expect(timer.complete).toBeTruthy();
  });

  it('can repeat itself indefinitely at a specified interval', () => {
    // count the number of fires
    let count = 0;
    timer = new ex.Timer({
      interval: 500,
      fcn: function () {
        count++;
      },
      repeats: true
    });

    timer.update(501);
    timer.update(501);
    timer.update(501);

    expect(count).toBe(3);
  });

  it('can repeat itself a finite number of times', () => {
    // count the number of fires
    timer = new ex.Timer({
      interval: 500,
      fcn: function () {
        const dummy = 0;
      },
      repeats: true,
      numberOfRepeats: 2
    });

    timer.update(501);
    timer.update(501);
    timer.update(501);

    expect(timer.timesRepeated).toBe(2);
  });

  it('can return how long it has been running', () => {
    timer.update(372);

    expect(timer.getTimeRunning()).toEqual(372);
  });

  it('can be canceled', () => {
    let count = 0;
    timer = new ex.Timer({
      interval: 500,
      fcn: function () {
        count++;
      },
      repeats: true
    });
    scene.addTimer(timer);

    scene.update(engine, 501);
    scene.update(engine, 501);
    scene.update(engine, 501);
    timer.cancel();
    scene.update(engine, 501);
    scene.update(engine, 501);
    scene.update(engine, 501);

    expect(count).toBe(3);
  });

  it('is no longer active in the scene when it is completed', () => {
    scene.addTimer(timer);

    expect(scene.isTimerActive(timer)).toBeTruthy();
    scene.update(engine, 501);
    expect(scene.isTimerActive(timer)).toBeFalsy();
  });

  it('is in the completed state once it is finished', () => {
    scene.addTimer(timer);
    scene.update(engine, 501);
    expect(timer.complete).toBeTruthy();
  });

  it('has no completed state when running forever', () => {
    // count the number of fires
    let count = 0;
    timer = new ex.Timer({
      interval: 500,
      fcn: function () {
        count++;
      },
      repeats: true
    });
    scene.addTimer(timer);

    scene.update(engine, 501);
    expect(count).toBe(1);
    expect(timer.repeats).toBeTruthy();
    expect(timer.complete).toBeFalsy();

    scene.update(engine, 501);
    expect(count).toBe(2);
    expect(timer.repeats).toBeTruthy();
    expect(timer.complete).toBeFalsy();

    scene.update(engine, 501);
    expect(count).toBe(3);
    expect(timer.repeats).toBeTruthy();
    expect(timer.complete).toBeFalsy();
  });

  it('can be reset at the same interval', () => {
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

    // tick the timer
    scene.update(engine, 501);
    expect(count).toBe(1);

    // tick the timer again, but it shouldn't fire until reset
    scene.update(engine, 501);
    expect(count).toBe(1);
    expect(timer.complete).toBe(true);

    // once reset the timer should fire again
    timer.reset();
    expect(timer.complete).toBe(false);
    scene.update(engine, 501);
    expect(count).toBe(2);
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

    // tick the timer
    scene.update(engine, 501);
    expect(count).toBe(1);

    // tick the timer again, but it shouldn't fire until reset
    scene.update(engine, 501);
    expect(count).toBe(1);
    expect(timer.complete).toBe(true);

    // once reset at a larger the timer should fire again
    timer.reset(900);
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

    // act
    timer.pause();
    scene.update(engine, 200);
    timer.unpause();
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
