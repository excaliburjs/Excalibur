import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';

describe('A Transition', () => {

  it('exists', () => {
    expect(ex.Transition).toBeDefined();
  });

  it('can be constructed', () => {
    const sut = new ex.Transition({
      duration: 1000,
      direction: 'in',
      easing: ex.EasingFunctions.EaseInOutCubic,
      hideLoader: false,
      blockInput: false
    });

    expect(sut).toBeTruthy();
    expect(sut.name).toContain('Transition#');
    expect(sut.duration).toBe(1000);
    expect(sut.direction).toBe('in');
    expect(sut.blockInput).toBe(false);
    expect(sut.hideLoader).toBe(false);
    expect(sut.easing).toBe(ex.EasingFunctions.EaseInOutCubic);

    expect(sut.progress).toBe(1);
    expect(sut.complete).toBe(false);
    expect(sut.started).toBe(false);
  });

  it('can be constructed with defaults', () => {
    const sut = new ex.Transition({duration: 2000});
    expect(sut).toBeTruthy();
    expect(sut.name).toContain('Transition#');
    expect(sut.duration).toBe(2000);

    expect(sut.direction).toBe('out');
    expect(sut.blockInput).toBe(false);
    expect(sut.hideLoader).toBe(false);
    expect(sut.easing).toBe(ex.EasingFunctions.Linear);

    expect(sut.progress).toBe(0);
    expect(sut.complete).toBe(false);
    expect(sut.started).toBe(false);
  });

  it('can be started with execute()', () => {
    const engine = TestUtils.engine();
    const sut = new ex.Transition({duration: 3000});
    const onUpdateSpy = jasmine.createSpy('onUpdate');
    const onStartSpy = jasmine.createSpy('onStart');
    const onEndSpy = jasmine.createSpy('onEnd');
    sut.onUpdate = onUpdateSpy;
    sut.onStart = onStartSpy;
    sut.onEnd = onEndSpy;
    sut._initialize(engine);


    sut.execute();
    expect(sut.started).toBe(true);
    expect(sut.progress).toBe(0);
    expect(sut.onStart).toHaveBeenCalledWith(0);
    expect(sut.onUpdate).toHaveBeenCalledWith(0);

    sut.updateTransition(engine, 16);
    sut.execute();
    expect(onUpdateSpy.calls.argsFor(1)).toEqual([16/3000]);

    sut.updateTransition(engine, 16);
    sut.execute();
    expect(onUpdateSpy.calls.argsFor(2)).toEqual([32/3000]);

    sut.updateTransition(engine, 3200 -32);
    sut.execute();
    expect(onEndSpy).toHaveBeenCalledWith(1);
    expect(sut.complete).toBe(true);

    sut.updateTransition(engine, 4000);
    sut.execute();

    // Start and end should only be called once
    expect(onStartSpy).toHaveBeenCalledTimes(1);
    expect(onEndSpy).toHaveBeenCalledTimes(1);
  });

  it('can be reset()', () => {
    const engine = TestUtils.engine();
    const sut = new ex.Transition({duration: 3000});
    const onUpdateSpy = jasmine.createSpy('onUpdate');
    const onStartSpy = jasmine.createSpy('onStart');
    const onEndSpy = jasmine.createSpy('onEnd');
    sut.onUpdate = onUpdateSpy;
    sut.onStart = onStartSpy;
    sut.onEnd = onEndSpy;
    sut._initialize(engine);


    sut.execute();
    expect(sut.started).toBe(true);
    expect(sut.progress).toBe(0);
    expect(sut.onStart).toHaveBeenCalledWith(0);
    expect(sut.onUpdate).toHaveBeenCalledWith(0);

    sut.updateTransition(engine, 16);
    sut.execute();
    expect(onUpdateSpy.calls.argsFor(1)).toEqual([16/3000]);

    sut.updateTransition(engine, 16);
    sut.execute();
    expect(onUpdateSpy.calls.argsFor(2)).toEqual([32/3000]);

    sut.updateTransition(engine, 3200 -32);
    sut.execute();
    expect(onEndSpy).toHaveBeenCalledWith(1);
    expect(sut.complete).toBe(true);

    sut.updateTransition(engine, 4000);
    sut.execute();

    expect(sut.complete).toBe(true);

    sut.onReset = jasmine.createSpy('onReset');
    sut.reset();

    expect(sut.complete).toBe(false);
    expect(sut.started).toBe(false);
    expect(sut.onReset).toHaveBeenCalledTimes(1);
  });
});