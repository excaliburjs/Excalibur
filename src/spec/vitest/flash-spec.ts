import * as ex from '@excalibur';
import { TestUtils } from '../__util__/test-utils';

describe('A Flash action', () => {
  let actor: ex.Actor;
  let engine: ex.Engine & any;
  let scene: ex.Scene;

  beforeEach(async () => {
    engine = TestUtils.engine({ width: 100, height: 100 });

    actor = new ex.Actor();
    scene = new ex.Scene();
    scene.add(actor);
    engine.addScene('test', scene);
    await engine.goToScene('test');
    await engine.start();
    const clock = engine.clock as ex.TestClock;
    clock.step(100);
    engine.stop();
  });

  afterEach(() => {
    engine.stop();
    engine.dispose();
    engine = null;
  });

  it('exists', () => {
    expect(ex.Flash).toBeDefined();
  });

  it('can be constructed', () => {
    const flash = new ex.Flash(actor, ex.Color.Red, 500);
    expect(flash).toBeDefined();
  });

  it('applies a material to the actor graphics on first update', () => {
    const flash = new ex.Flash(actor, ex.Color.Red, 500);
    expect(actor.graphics.material).toBeNull();

    flash.update(0);

    expect(actor.graphics.material).toBeDefined();
    expect(actor.graphics.material).not.toBeNull();
  });

  it('is not complete until the duration elapses', () => {
    const flash = new ex.Flash(actor, ex.Color.Red, 1000);

    flash.update(0);
    expect(flash.isComplete()).toBe(false);

    flash.update(500);
    expect(flash.isComplete()).toBe(false);

    flash.update(500);
    expect(flash.isComplete()).toBe(true);
  });

  it('clears the material once complete', () => {
    const flash = new ex.Flash(actor, ex.Color.Red, 200);

    flash.update(0);
    expect(actor.graphics.material).not.toBeNull();

    flash.update(200);
    expect(flash.isComplete()).toBe(true);
    expect(actor.graphics.material).toBeNull();
  });

  it('can be stopped early', () => {
    const flash = new ex.Flash(actor, ex.Color.Red, 1000);

    flash.update(0);
    flash.update(100);
    expect(flash.isComplete()).toBe(false);

    flash.stop();

    expect(flash.isComplete()).toBe(true);
    expect(actor.graphics.isVisible).toBe(true);
  });

  it('can be reset and re-run after completing', () => {
    const flash = new ex.Flash(actor, ex.Color.Red, 200);

    flash.update(0);
    flash.update(200);
    expect(flash.isComplete()).toBe(true);

    // reset() clears the started/stopped flags, but isComplete() only reads
    // true again once update() re-primes _currentDuration from _duration
    flash.reset();
    flash.update(0);
    expect(flash.isComplete()).toBe(false);
  });

  it('can be reset after being stopped', () => {
    const flash = new ex.Flash(actor, ex.Color.Red, 200);

    flash.update(0);
    flash.stop();
    expect(flash.isComplete()).toBe(true);

    flash.reset();
    expect(flash.isComplete()).toBe(false);
  });

  it('can be run through the actor action context', () => {
    actor.actions.flash(ex.Color.Red, 200);

    scene.update(engine, 100);
    expect(actor.graphics.material).not.toBeNull();

    scene.update(engine, 100);
    expect(actor.graphics.material).toBeNull();
  });
});
