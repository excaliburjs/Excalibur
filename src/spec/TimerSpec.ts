import * as ex from '../../build/dist/excalibur';
import { TestUtils } from './util/TestUtils';

describe('A Timer', () => {
  var timer;
  var scene: ex.Scene;
  var engine: ex.Engine;

  beforeEach(() => {
    engine = TestUtils.engine({
      width: 600,
      height: 400
    });
    timer = new ex.Timer(function() {
      /*do nothing*/
    }, 500);
    scene = new ex.Scene(engine);
    engine.currentScene = scene;
  });

  it('has a unique id', () => {
    var newtimer = new ex.Timer(function() {
      /*do nothing*/
    }, 500);
    expect(timer.id).not.toBe(newtimer.id);
    expect(timer.id).toBe(newtimer.id - 1);

    var newtimer2 = new ex.Timer(function() {
      /*do nothing*/
    }, 500);
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
    var count = 0;
    timer = new ex.Timer(
      function() {
        count++;
      },
      500,
      true
    );

    timer.update(501);
    timer.update(501);
    timer.update(501);

    expect(count).toBe(3);
  });

  it('can repeat itself a finite number of times', () => {
    // count the number of fires
    timer = new ex.Timer(
      function() {
        var dummy = 0;
      },
      500,
      true,
      2
    );

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
    var count = 0;
    timer = new ex.Timer(
      function() {
        count++;
      },
      500,
      true
    );
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
    var count = 0;
    timer = new ex.Timer(
      function() {
        count++;
      },
      500,
      true
    );
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
    var count = 0;
    // non-repeating timer
    timer = new ex.Timer(
      function() {
        count++;
      },
      500,
      false
    );
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
    var count = 0;
    // non-repeating timer
    timer = new ex.Timer(
      function() {
        count++;
      },
      500,
      false
    );
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
    var count = 0;
    // non-repeating timer
    timer = new ex.Timer(
      function() {
        count++;
      },
      500,
      true
    );
    scene.add(timer);

    // tick the timer
    scene.update(engine, 501);
    expect(count).toBe(1);

    timer.reset(30);

    for (var i = 0; i < 100; i++) {
      scene.update(engine, 31);
      expect(count).toBe(2 + i);
      expect(timer.complete).toBe(false);
    }
  });

  it('can be reset with a different number of maximum iterations', () => {
    // non-repeating timer
    timer = new ex.Timer(
      function() {
        var dummy = 0;
      },
      500,
      true,
      3
    );
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
    var count = 0;
    // arrange
    var timer = new ex.Timer(
      () => {
        count++;
      },
      100,
      true
    );
    scene.add(timer);

    // act
    timer.pause();
    scene.update(engine, 200);

    // assert
    expect(count).toBe(0);
    expect(timer.complete).toBe(false);
  });

  it('can be unpaused', () => {
    var count = 0;
    // arrange
    var timer = new ex.Timer(
      () => {
        count++;
      },
      100,
      true
    );
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
});
