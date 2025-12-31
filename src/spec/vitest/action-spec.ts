import * as ex from '@excalibur';
import { TestUtils } from '../__util__/test-utils';

describe('Action', () => {
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

    vi.spyOn(scene, 'draw');
    engine.stop();
  });

  afterEach(() => {
    engine.stop();
    engine.dispose();
    engine = null;
  });

  describe('parallel actions', () => {
    it('can run actions in parallel', () => {
      const parallel = new ex.ParallelActions([new ex.MoveTo(actor, 100, 0, 100), new ex.RotateTo(actor, Math.PI / 2, Math.PI / 2)]);

      actor.actions.runAction(parallel);

      scene.update(engine, 1000);
      expect(actor.pos).toBeVector(ex.vec(100, 0));
      expect(actor.rotation).toBe(Math.PI / 2);
    });

    it('can run sequences in parallel', () => {
      const parallel = new ex.ParallelActions([
        new ex.ActionSequence(actor, (ctx) => ctx.moveTo(ex.vec(100, 0), 100)),
        new ex.ActionSequence(actor, (ctx) => ctx.rotateTo(Math.PI / 2, Math.PI / 2))
      ]);

      actor.actions.runAction(parallel);

      scene.update(engine, 1000);
      expect(actor.pos).toBeVector(ex.vec(100, 0));
      expect(actor.rotation).toBe(Math.PI / 2);
    });

    it('can repeat sequences in parallel', () => {
      const parallel = new ex.ParallelActions([
        new ex.ActionSequence(actor, (ctx) => ctx.moveTo(ex.vec(100, 0), 100).moveTo(ex.vec(0, 0), 100)),
        new ex.ActionSequence(actor, (ctx) => ctx.rotateTo(Math.PI / 2, Math.PI / 2).rotateTo(0, Math.PI / 2))
      ]);

      actor.actions.repeatForever((ctx) => {
        ctx.runAction(parallel);
      });

      scene.update(engine, 1000);
      expect(actor.pos).toBeVector(ex.vec(100, 0));
      expect(actor.rotation).toBe(Math.PI / 2);

      scene.update(engine, 0);
      scene.update(engine, 1000);
      expect(actor.pos).toBeVector(ex.vec(0, 0));
      expect(actor.rotation).toBe(0);

      scene.update(engine, 0);
      scene.update(engine, 1000);
      expect(actor.pos).toBeVector(ex.vec(100, 0));
      expect(actor.rotation).toBe(Math.PI / 2);
    });
  });

  describe('action sequence', () => {
    it('can specify a series of actions', () => {
      const sequence = new ex.ActionSequence(actor, (ctx) => {
        ctx.moveTo(ex.vec(100, 0), 100);
        ctx.moveTo(ex.vec(-200, 0), 100);
        ctx.moveTo(ex.vec(0, 0), 100);
      });

      actor.actions.runAction(sequence);

      scene.update(engine, 1000);
      expect(actor.pos).toBeVector(ex.vec(100, 0));

      scene.update(engine, 0);
      scene.update(engine, 1000);
      scene.update(engine, 1000);
      scene.update(engine, 1000);
      expect(actor.pos).toBeVector(ex.vec(-200, 0));

      scene.update(engine, 0);
      scene.update(engine, 1000);
      scene.update(engine, 1000);
      expect(actor.pos).toBeVector(ex.vec(0, 0));

      scene.update(engine, 0);
      expect(sequence.isComplete()).toBe(true);

      // Can re-run a sequence
      actor.actions.runAction(sequence);
      expect(sequence.isComplete()).toBe(false);
    });

    it('can be stopped', () => {
      const sequence = new ex.ActionSequence(actor, (ctx) => {
        ctx.moveTo(ex.vec(100, 0), 100);
        ctx.moveTo(ex.vec(-200, 0), 100);
        ctx.moveTo(ex.vec(0, 0), 100);
      });

      actor.actions.runAction(sequence);

      scene.update(engine, 1000);
      expect(actor.pos).toBeVector(ex.vec(100, 0));

      sequence.stop();
      scene.update(engine, 0);
      scene.update(engine, 1000);
      scene.update(engine, 1000);
      scene.update(engine, 1000);
      expect(actor.pos).toBeVector(ex.vec(100, 0));
    });

    it('can be cloned', () => {
      const sequence = new ex.ActionSequence(actor, (ctx) => {
        ctx.moveTo(ex.vec(100, 0), 100);
        ctx.moveTo(ex.vec(-200, 0), 100);
        ctx.moveTo(ex.vec(0, 0), 100);
      });

      const actor2 = new ex.Actor();
      scene.add(actor2);

      const clonedSequence = sequence.clone(actor2);

      actor2.actions.runAction(clonedSequence);

      scene.update(engine, 1000);
      expect(actor2.pos).toBeVector(ex.vec(100, 0));

      scene.update(engine, 0);
      scene.update(engine, 1000);
      scene.update(engine, 1000);
      scene.update(engine, 1000);
      expect(actor2.pos).toBeVector(ex.vec(-200, 0));

      scene.update(engine, 0);
      scene.update(engine, 1000);
      scene.update(engine, 1000);
      expect(actor2.pos).toBeVector(ex.vec(0, 0));

      scene.update(engine, 0);
      expect(clonedSequence.isComplete()).toBe(true);
    });
  });

  describe('blink', () => {
    it('can blink on and off', () => {
      expect(actor.graphics.isVisible).toBe(true);
      actor.actions.blink(200, 200);

      scene.update(engine, 200);
      expect(actor.graphics.isVisible).toBe(false);

      scene.update(engine, 250);
      expect(actor.graphics.isVisible).toBe(true);
    });

    it('can be reset', () => {
      const blink = new ex.Blink(actor, 200, 200);
      blink.update(200);
      blink.update(200);
      expect(blink.isComplete()).toBe(true);

      blink.reset();
      expect(blink.isComplete()).toBe(false);
    });

    it('can blink at a frequency forever', () => {
      expect(actor.graphics.isVisible).toBe(true);
      actor.actions.repeatForever((ctx) => ctx.blink(200, 200));
      scene.update(engine, 200);

      for (let i = 0; i < 2; i++) {
        expect(actor.graphics.isVisible).toBe(false);
        scene.update(engine, 200);

        expect(actor.graphics.isVisible).toBe(true);
        scene.update(engine, 200);
      }
    });

    it('can be stopped', () => {
      expect(actor.graphics.isVisible).toBe(true);
      actor.actions.blink(1, 3000);

      scene.update(engine, 500);
      expect(actor.graphics.isVisible).toBe(false);

      actor.actions.clearActions();

      scene.update(engine, 500);
      scene.update(engine, 500);
      expect(actor.graphics.isVisible).toBe(true);
    });
  });

  describe('color', () => {
    it('is cloned from constructor', () => {
      const color = ex.Color.Azure;
      const sut = new ex.Actor({ color });

      expect(sut.color, 'Color is not expected to be same instance').not.toBe(color);
    });

    it('is cloned from property setter', () => {
      const color = ex.Color.Azure;
      const sut = new ex.Actor();

      sut.color = color;

      expect(sut.color, 'Color is not expected to be same instance').not.toBe(color);
    });
  });

  describe('die', () => {
    it('can remove actor from scene', () => {
      scene.add(actor);
      expect(scene.actors.length).toBe(1);
      actor.actions.die();
      scene.update(engine, 100);
      expect(actor.isActive).toBe(false);
      expect(scene.actors.length).toBe(0);
    });

    it('can perform actions and then die', () => {
      scene.add(actor);
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);
      expect(scene.actors.length).toBe(1);

      actor.actions.moveTo(100, 0, 100).delay(1000).die();
      scene.update(engine, 1000);

      expect(actor.pos.x).toBe(100);
      expect(actor.pos.y).toBe(0);

      scene.update(engine, 500);
      expect(actor.pos.x).toBe(100);
      expect(actor.pos.y).toBe(0);

      scene.update(engine, 1000);
      scene.update(engine, 100);
      scene.update(engine, 1); // TODO extra update needed for die
      expect(scene.actors.length).toBe(0);
    });
  });

  describe('delay', () => {
    it('can be delay an action by an amount off time', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      actor.actions.delay(1000).moveTo(20, 0, 20);
      scene.update(engine, 1000);
      expect(actor.pos.x).toBe(0);

      scene.update(engine, 1000);
      expect(actor.pos.x).toBe(20);
    });

    it('can be reset', () => {
      const delay = new ex.Delay(1000);

      delay.update(1000);
      expect(delay.isComplete()).toBe(true);

      delay.reset();
      expect(delay.isComplete()).toBe(false);
    });

    it('can be stopped', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      actor.actions.delay(1000).moveTo(20, 0, 20);
      scene.update(engine, 1000);
      expect(actor.pos.x).toBe(0);

      actor.actions.clearActions();
      scene.update(engine, 1000);
      expect(actor.pos.x).toBe(0);
    });

    it('can be a promise', () =>
      new Promise<void>((done) => {
        const spy = vi.fn();
        actor.actions.delay(1000);
        actor.actions.callMethod(spy);
        actor.actions.toPromise().then(() => {
          expect(spy).toHaveBeenCalled();
          done();
        });
        scene.update(engine, 1000);
        scene.update(engine, 0);
        scene.update(engine, 0);
      }));
  });

  describe('moveBy', () => {
    it('can be reset', () => {
      const moveBy = new ex.MoveBy(actor, 100, 0, 100);
      actor.actions.runAction(moveBy);
      scene.update(engine, 1000);
      expect(moveBy.isComplete(actor)).toBe(true);

      moveBy.reset();
      actor.pos = ex.vec(0, 0);
      expect(moveBy.isComplete(actor)).toBe(false);
    });

    it('(with options) can be reset', () => {
      const moveBy = new ex.MoveByWithOptions(actor, { offset: ex.vec(100, 0), duration: 100 });
      actor.actions.runAction(moveBy);
      scene.update(engine, 1000);
      expect(moveBy.isComplete(actor)).toBe(true);

      moveBy.reset();
      actor.pos = ex.vec(0, 0);
      expect(moveBy.isComplete(actor)).toBe(false);
    });

    it('can be moved to a location by a certain time (x,y) overload', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      actor.actions.moveBy(100, 0, 50);

      scene.update(engine, 1000);
      expect(actor.pos.x).toBe(50);
      expect(actor.pos.y).toBe(0);
    });

    it('(with options) can be moved to a location by a certain time (x,y) overload', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      actor.actions.moveBy({ offset: ex.vec(100, 0), duration: 2000 });

      scene.update(engine, 1000);
      expect(actor.pos.x).toBe(50);
      expect(actor.pos.y).toBe(0);
    });

    it('can be moved to a location by a certain time vector overload', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      actor.actions.moveBy(ex.vec(100, 0), 50);

      scene.update(engine, 1000);
      expect(actor.pos.x).toBe(50);
      expect(actor.pos.y).toBe(0);
    });

    it('can be moved to a location by a certain time vector overload', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      actor.actions.moveBy(ex.vec(100, 0), 50);

      scene.update(engine, 1000);
      expect(actor.pos.x).toBe(50);
      expect(actor.pos.y).toBe(0);
    });

    it('can be stopped', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      actor.actions.moveBy(20, 0, 20);
      scene.update(engine, 500);

      actor.actions.clearActions();
      expect(actor.pos.x).toBe(10);
      expect(actor.pos.y).toBe(0);

      // Actor should not move after stop
      scene.update(engine, 500);
      expect(actor.pos.x).toBe(10);
      expect(actor.pos.y).toBe(0);
    });
    it('(with options) can be stopped', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      actor.actions.moveBy({ offset: ex.vec(20, 0), duration: 1000 });
      scene.update(engine, 500);

      actor.actions.clearActions();
      expect(actor.pos.x).toBe(10);
      expect(actor.pos.y).toBe(0);

      // Actor should not move after stop
      scene.update(engine, 500);
      expect(actor.pos.x).toBe(10);
      expect(actor.pos.y).toBe(0);
    });
  });

  describe('moveTo', () => {
    it('can be reset', () => {
      const moveTo = new ex.MoveToWithOptions(actor, { pos: ex.vec(100, 0), duration: 500 });
      actor.actions.runAction(moveTo);
      scene.update(engine, 1000);
      expect(moveTo.isComplete(actor)).toBe(true);

      moveTo.reset();
      actor.pos = ex.vec(0, 0);
      expect(moveTo.isComplete(actor)).toBe(false);
    });

    it('can be moved to a location at a speed (x,y) overload', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      actor.actions.moveTo(100, 0, 100);
      scene.update(engine, 500);

      expect(actor.pos.x).toBe(50);
      expect(actor.pos.y).toBe(0);

      scene.update(engine, 500);
      expect(actor.pos.x).toBe(100);
      expect(actor.pos.y).toBe(0);
    });
    it('(with options) can be moved to a location at a speed (x,y) overload', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      actor.actions.moveTo({ pos: ex.vec(100, 0), duration: 1000 });
      scene.update(engine, 500);

      expect(actor.pos.x).toBe(50);
      expect(actor.pos.y).toBe(0);

      scene.update(engine, 500);
      expect(actor.pos.x).toBe(100);
      expect(actor.pos.y).toBe(0);
    });

    it('can be moved to a location at a speed vector overload', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      actor.actions.moveTo(ex.vec(100, 0), 100);
      scene.update(engine, 500);

      expect(actor.pos.x).toBe(50);
      expect(actor.pos.y).toBe(0);

      scene.update(engine, 500);
      expect(actor.pos.x).toBe(100);
      expect(actor.pos.y).toBe(0);
    });

    it('can be moved to a location at a speed vector overload', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      actor.actions.moveTo(ex.vec(100, 0), 100);
      scene.update(engine, 500);

      expect(actor.pos.x).toBe(50);
      expect(actor.pos.y).toBe(0);

      scene.update(engine, 500);
      expect(actor.pos.x).toBe(100);
      expect(actor.pos.y).toBe(0);
    });

    it('can be stopped', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      actor.actions.moveTo(20, 0, 10);
      scene.update(engine, 500);

      actor.actions.clearActions();
      expect(actor.pos.x).toBe(5);
      expect(actor.pos.y).toBe(0);

      // Actor should not move after stop
      scene.update(engine, 500);
      expect(actor.pos.x).toBe(5);
      expect(actor.pos.y).toBe(0);
    });

    it('(with options) can be stopped', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      actor.actions.moveTo({ pos: ex.vec(20, 0), duration: 2000 });
      scene.update(engine, 500);

      actor.actions.clearActions();
      expect(actor.pos.x).toBe(5);
      expect(actor.pos.y).toBe(0);

      // Actor should not move after stop
      scene.update(engine, 500);
      expect(actor.pos.x).toBe(5);
      expect(actor.pos.y).toBe(0);
    });
  });

  describe('easeBy', () => {
    it('can be reset', () => {
      const easeTo = new ex.MoveByWithOptions(actor, {
        offset: ex.vec(100, 0),
        duration: 100,
        easing: ex.easeInOutCubic
      });
      easeTo.update(1000);
      expect(easeTo.isComplete(actor)).toBe(true);

      easeTo.reset();
      actor.pos = ex.vec(0, 0);
      expect(easeTo.isComplete(actor)).toBe(false);
    });
    it('can be eased to a location given an easing function (x,y) overload', () => {
      actor.pos = ex.vec(100, 100);
      expect(actor.pos).toBeVector(ex.vec(100, 100));

      actor.actions.moveBy({
        offset: ex.vec(100, 0),
        duration: 1000,
        easing: ex.easeInOutCubic
      });

      scene.update(engine, 500);
      expect(actor.pos).toBeVector(ex.vec(150, 100));
      expect(actor.vel).toBeVector(ex.vec(100, 0));

      scene.update(engine, 500);
      scene.update(engine, 1); // FIXME extra tick now
      expect(actor.pos).toBeVector(ex.vec(200, 100));
      expect(actor.vel).toBeVector(ex.vec(0, 0));

      scene.update(engine, 500);
      expect(actor.pos).toBeVector(ex.vec(200, 100));
      expect(actor.vel).toBeVector(ex.vec(0, 0));
    });

    it('can be eased to a location given an easing function vector overload', () => {
      actor.pos = ex.vec(100, 100);
      expect(actor.pos).toBeVector(ex.vec(100, 100));

      actor.actions.moveBy({
        offset: ex.vec(100, 0),
        duration: 1000,
        easing: ex.easeInOutCubic
      });

      scene.update(engine, 500);
      expect(actor.pos).toBeVector(ex.vec(150, 100));
      expect(actor.vel).toBeVector(ex.vec(100, 0));

      scene.update(engine, 500);
      scene.update(engine, 1); // FIXME extra tick required now
      expect(actor.pos).toBeVector(ex.vec(200, 100));
      expect(actor.vel).toBeVector(ex.vec(0, 0));

      scene.update(engine, 500);
      expect(actor.pos).toBeVector(ex.vec(200, 100));
      expect(actor.vel).toBeVector(ex.vec(0, 0));
    });

    it('can be stopped', () => {
      actor.pos = ex.vec(100, 100);
      expect(actor.pos).toBeVector(ex.vec(100, 100));

      actor.actions.moveBy({
        offset: ex.vec(100, 0),
        duration: 1000,
        easing: ex.easeInOutCubic
      });

      scene.update(engine, 500);
      expect(actor.pos).toBeVector(ex.vec(150, 100));
      expect(actor.vel).toBeVector(ex.vec(100, 0));

      actor.actions.clearActions();

      // actor should not move and should have zero velocity after stopping
      scene.update(engine, 500);
      expect(actor.pos).toBeVector(ex.vec(150, 100));
      expect(actor.vel).toBeVector(ex.vec(0, 0));
    });
  });

  describe('easeTo', () => {
    it('can be reset', () => {
      const easeTo = new ex.MoveToWithOptions(actor, {
        pos: ex.vec(100, 0),
        duration: 100,
        easing: ex.easeInOutCubic
      });
      easeTo.update(1000);
      expect(easeTo.isComplete(actor)).toBe(true);

      easeTo.reset();
      actor.pos = ex.vec(0, 0);
      expect(easeTo.isComplete(actor)).toBe(false);
    });
    it('can be eased to a location given an easing function (x,y) overload', () => {
      expect(actor.pos).toBeVector(ex.vec(0, 0));

      actor.actions.moveTo({
        pos: ex.vec(100, 0),
        duration: 1000,
        easing: ex.easeInOutCubic
      });

      scene.update(engine, 500);
      expect(actor.pos).toBeVector(ex.vec(50, 0));
      expect(actor.vel).toBeVector(ex.vec(100, 0));

      scene.update(engine, 500);
      scene.update(engine, 1); // FIXME extra tick required
      expect(actor.pos).toBeVector(ex.vec(100, 0));
      expect(actor.vel).toBeVector(ex.vec(0, 0));

      scene.update(engine, 500);
      expect(actor.pos).toBeVector(ex.vec(100, 0));
      expect(actor.vel).toBeVector(ex.vec(0, 0));
    });

    it('can be eased to a location given an easing function vector overload', () => {
      expect(actor.pos).toBeVector(ex.vec(0, 0));

      actor.actions.moveTo({
        pos: ex.vec(100, 0),
        duration: 1000,
        easing: ex.easeInOutCubic
      });

      scene.update(engine, 500);
      expect(actor.pos).toBeVector(ex.vec(50, 0));
      expect(actor.vel).toBeVector(ex.vec(100, 0));

      scene.update(engine, 500);
      scene.update(engine, 1); // FIXME extra tick required
      expect(actor.pos).toBeVector(ex.vec(100, 0));
      expect(actor.vel).toBeVector(ex.vec(0, 0));

      scene.update(engine, 500);
      expect(actor.pos).toBeVector(ex.vec(100, 0));
      expect(actor.vel).toBeVector(ex.vec(0, 0));
    });

    it('can be eased to a location given an easing function vector overload', () => {
      expect(actor.pos).toBeVector(ex.vec(0, 0));

      actor.actions.moveTo({
        pos: ex.vec(100, 0),
        duration: 1000,
        easing: ex.easeInOutCubic
      });

      scene.update(engine, 500);
      expect(actor.pos).toBeVector(ex.vec(50, 0));
      expect(actor.vel).toBeVector(ex.vec(100, 0));

      scene.update(engine, 500);
      scene.update(engine, 1);
      expect(actor.pos).toBeVector(ex.vec(100, 0));
      expect(actor.vel).toBeVector(ex.vec(0, 0));

      scene.update(engine, 500);
      expect(actor.pos).toBeVector(ex.vec(100, 0));
      expect(actor.vel).toBeVector(ex.vec(0, 0));
    });

    it('can be stopped', () => {
      expect(actor.pos).toBeVector(ex.vec(0, 0));

      actor.actions.moveTo({
        pos: ex.vec(100, 0),
        duration: 1000,
        easing: ex.easeInOutCubic
      });

      scene.update(engine, 500);
      expect(actor.pos).toBeVector(ex.vec(50, 0));
      expect(actor.vel).toBeVector(ex.vec(100, 0));

      actor.actions.clearActions();

      // actor should not move and should have zero velocity after stopping
      scene.update(engine, 500);
      expect(actor.pos).toBeVector(ex.vec(50, 0));
      expect(actor.vel).toBeVector(ex.vec(0, 0));
    });
  });

  describe('repeat', () => {
    it('can repeat X times', () => {
      const repeatCallback = vi.fn();
      actor.actions.repeat((ctx) => {
        ctx.callMethod(repeatCallback);
      }, 11);
      for (let i = 0; i < 12; i++) {
        scene.update(engine, 200);
      }
      // should run an action per update
      expect(repeatCallback).toHaveBeenCalledTimes(11);
    });

    it('recalls the builder every repeat', () => {
      const repeatCallback = vi.fn();
      actor.actions.repeat((ctx) => {
        ctx.delay(200);
        repeatCallback();
      }, 33);
      // Overshoot
      for (let i = 0; i < 50; i++) {
        scene.update(engine, 200);
      }
      // should run an action per update
      expect(repeatCallback).toHaveBeenCalledTimes(33);
    });

    it('can repeat moveBy X times', () => {
      const repeatCallback = vi.fn();
      actor.actions.repeat((ctx) => {
        ctx.moveBy(10, 0, 10); // move 10 pixels right at 10 px/sec
        ctx.callMethod(repeatCallback);
      }, 11);

      // Over shoot
      for (let i = 0; i < 50; i++) {
        scene.update(engine, 1000);
      }
      // should run an action per update
      expect(actor.pos.x).toBe(110);
      expect(actor.vel).toBeVector(ex.Vector.Zero);
      expect(repeatCallback).toHaveBeenCalledTimes(11);
    });

    it('can repeat 1 time', () => {
      const repeatCallback = vi.fn();
      actor.actions.repeat((ctx) => {
        ctx.callMethod(repeatCallback);
      }, 1);
      for (let i = 0; i < 20; i++) {
        actor.actions.update(200);
      }
      expect(repeatCallback).toHaveBeenCalledTimes(1);
    });

    it('can repeat previous actions', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      actor.actions.repeat((ctx) => ctx.moveTo(20, 0, 10).moveTo(0, 0, 10));

      scene.update(engine, 1000);
      expect(actor.pos.x).toBe(10);
      expect(actor.pos.y).toBe(0);

      scene.update(engine, 1000);
      expect(actor.pos.x).toBe(20);
      expect(actor.pos.y).toBe(0);

      scene.update(engine, 1);
      scene.update(engine, 1000);
      expect(actor.pos.x).toBe(10);
      expect(actor.pos.y).toBe(0);

      scene.update(engine, 1000);
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      scene.update(engine, 1);
      scene.update(engine, 1000);
      expect(actor.pos.x).toBe(10);
      expect(actor.pos.y).toBe(0);

      scene.update(engine, 1000);
      expect(actor.pos.x).toBe(20);
      expect(actor.pos.y).toBe(0);

      scene.update(engine, 1000);
      expect(actor.pos.x).toBe(20);
      expect(actor.pos.y).toBe(0);
    });

    it('can be stopped', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      actor.actions.repeat((ctx) => ctx.moveTo(20, 0, 10).moveTo(0, 0, 10));

      scene.update(engine, 1000);
      expect(actor.pos.x).toBe(10);
      expect(actor.pos.y).toBe(0);

      scene.update(engine, 1000);
      expect(actor.pos.x).toBe(20);
      expect(actor.pos.y).toBe(0);

      actor.actions.clearActions();
      scene.update(engine, 1);
      scene.update(engine, 1000);
      expect(actor.pos.x).toBe(20);
      expect(actor.pos.y).toBe(0);

      scene.update(engine, 1000);
      expect(actor.pos.x).toBe(20);
      expect(actor.pos.y).toBe(0);

      scene.update(engine, 1);
      scene.update(engine, 1000);
      expect(actor.pos.x).toBe(20);
      expect(actor.pos.y).toBe(0);

      scene.update(engine, 1000);
      expect(actor.pos.x).toBe(20);
      expect(actor.pos.y).toBe(0);

      scene.update(engine, 1000);
      expect(actor.pos.x).toBe(20);
      expect(actor.pos.y).toBe(0);
    });
  });

  describe('repeatForever', () => {
    it('can repeat previous actions forever', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      actor.actions.repeatForever((ctx) => ctx.moveTo(20, 0, 10).moveTo(0, 0, 10));

      for (let i = 0; i < 20; i++) {
        scene.update(engine, 1000);
        expect(actor.pos.x).toBe(10);
        expect(actor.pos.y).toBe(0);

        scene.update(engine, 1000);
        expect(actor.pos.x).toBe(20);
        expect(actor.pos.y).toBe(0);

        scene.update(engine, 1);
        scene.update(engine, 1000);
        expect(actor.pos.x).toBe(10);
        expect(actor.pos.y).toBe(0);

        scene.update(engine, 1000);
        expect(actor.pos.x).toBe(0);
        expect(actor.pos.y).toBe(0);

        scene.update(engine, 1);
      }
    });

    it('recalls the builder every repeat', () => {
      const repeatCallback = vi.fn();
      actor.actions.repeatForever((ctx) => {
        ctx.delay(200);
        repeatCallback();
      });
      // Overshoot
      for (let i = 0; i < 33; i++) {
        scene.update(engine, 200);
      }
      // should run an action per update
      expect(repeatCallback).toHaveBeenCalledTimes(33);
    });

    it('can be stopped', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      actor.actions.repeatForever((ctx) => ctx.moveTo(20, 0, 10).moveTo(0, 0, 10));

      scene.update(engine, 1000);
      expect(actor.pos.x).toBe(10);
      expect(actor.pos.y).toBe(0);

      actor.actions.clearActions();

      for (let i = 0; i < 20; i++) {
        scene.update(engine, 1000);
        expect(actor.pos.x).toBe(10);
        expect(actor.pos.y).toBe(0);
      }
    });
  });

  describe('rotateTo', () => {
    it('can be rotated to an angle at a speed via ShortestPath (default)', () => {
      expect(actor.rotation).toBe(0);

      actor.actions.rotateTo(Math.PI / 2, Math.PI / 2);

      scene.update(engine, 500);
      expect(actor.rotation).toBe(Math.PI / 4);

      scene.update(engine, 500);
      expect(actor.rotation).toBe(Math.PI / 2);

      scene.update(engine, 500);
      expect(actor.angularVelocity).toBe(0);
    });

    it('(with options) can be rotated to an angle at a speed via ShortestPath (default)', () => {
      expect(actor.rotation).toBe(0);

      actor.actions.rotateTo({ angle: Math.PI / 2, duration: 1000 });

      scene.update(engine, 500);
      expect(actor.rotation).toBe(Math.PI / 4);

      scene.update(engine, 500);
      expect(actor.rotation).toBe(Math.PI / 2);

      scene.update(engine, 500);
      expect(actor.angularVelocity).toBe(0);
    });

    it('can be rotated to an angle at a speed via LongestPath', () => {
      expect(actor.rotation).toBe(0);

      actor.actions.rotateTo(Math.PI / 2, Math.PI / 2, ex.RotationType.LongestPath);

      scene.update(engine, 1000);
      //rotation is currently incremented by rx delta ,so will be negative while moving counterclockwise
      expect(actor.rotation).toBe(ex.canonicalizeAngle((-1 * Math.PI) / 2));

      scene.update(engine, 2000);
      expect(actor.rotation).toBe(ex.canonicalizeAngle((-3 * Math.PI) / 2));

      scene.update(engine, 500);
      expect(actor.rotation).toBe(ex.canonicalizeAngle(Math.PI / 2));
      expect(actor.angularVelocity).toBe(0);
    });

    it('(with options) can be rotated to an angle at a speed via LongestPath', () => {
      expect(actor.rotation).toBe(0);

      actor.actions.rotateTo({ angle: Math.PI / 2, duration: 3000, rotationType: ex.RotationType.LongestPath });

      scene.update(engine, 1000);
      //rotation is currently incremented by rx delta ,so will be negative while moving counterclockwise
      expect(actor.rotation).toBe(ex.canonicalizeAngle((-1 * Math.PI) / 2));

      scene.update(engine, 2000);
      expect(actor.rotation).toBe(ex.canonicalizeAngle((-3 * Math.PI) / 2));

      scene.update(engine, 500);
      expect(actor.rotation).toBe(ex.canonicalizeAngle(Math.PI / 2));
      expect(actor.angularVelocity).toBe(0);
    });

    it('can be rotated to an angle at a speed via Clockwise', () => {
      expect(actor.rotation).toBe(0);

      actor.actions.rotateTo((3 * Math.PI) / 2, Math.PI / 2, ex.RotationType.Clockwise);

      scene.update(engine, 2000);
      expect(actor.rotation).toBe(Math.PI);

      scene.update(engine, 1000);
      expect(actor.rotation).toBe((3 * Math.PI) / 2);

      scene.update(engine, 500);
      expect(actor.rotation).toBe((3 * Math.PI) / 2);
      expect(actor.angularVelocity).toBe(0);
    });

    it('(with options) can be rotated to an angle at a speed via Clockwise', () => {
      expect(actor.rotation).toBe(0);

      actor.actions.rotateTo({ angle: (3 * Math.PI) / 2, duration: 3000, rotationType: ex.RotationType.Clockwise });

      scene.update(engine, 2000);
      expect(actor.rotation).toBe(Math.PI);

      scene.update(engine, 1000);
      expect(actor.rotation).toBe((3 * Math.PI) / 2);

      scene.update(engine, 500);
      expect(actor.rotation).toBe((3 * Math.PI) / 2);
      expect(actor.angularVelocity).toBe(0);
    });

    it('can be rotated to an angle at a speed via CounterClockwise', () => {
      expect(actor.rotation).toBe(0);

      actor.actions.rotateTo(Math.PI / 2, Math.PI / 2, ex.RotationType.CounterClockwise);
      scene.update(engine, 2000);
      expect(actor.rotation).toBe(ex.canonicalizeAngle(-Math.PI));

      scene.update(engine, 1000);
      expect(actor.rotation).toBe(ex.canonicalizeAngle((-3 * Math.PI) / 2));

      scene.update(engine, 500);
      expect(actor.rotation).toBe(ex.canonicalizeAngle(Math.PI / 2));
      expect(actor.angularVelocity).toBe(0);

      // rotating back to 0, starting at PI / 2
      actor.actions.rotateTo(0, Math.PI / 2, ex.RotationType.CounterClockwise);
      scene.update(engine, 1000);
      expect(actor.rotation).toBe(ex.canonicalizeAngle(0));

      scene.update(engine, 1);
      expect(actor.angularVelocity).toBe(0);
    });

    it('(with options) can be rotated to an angle at a speed via CounterClockwise', () => {
      expect(actor.rotation).toBe(0);

      actor.actions.rotateTo({ angle: Math.PI / 2, duration: 3000, rotationType: ex.RotationType.CounterClockwise });
      scene.update(engine, 2000);
      expect(actor.rotation).toBe(ex.canonicalizeAngle(-Math.PI));

      scene.update(engine, 1000);
      expect(actor.rotation).toBe(ex.canonicalizeAngle((-3 * Math.PI) / 2));

      scene.update(engine, 500);
      expect(actor.rotation).toBe(ex.canonicalizeAngle(Math.PI / 2));
      expect(actor.angularVelocity).toBe(0);

      // rotating back to 0, starting at PI / 2
      actor.actions.rotateTo(0, Math.PI / 2, ex.RotationType.CounterClockwise);
      scene.update(engine, 1000);
      expect(actor.rotation).toBe(ex.canonicalizeAngle(0));

      scene.update(engine, 1);
      expect(actor.angularVelocity).toBe(0);
    });

    it('can be stopped', () => {
      expect(actor.rotation).toBe(0);

      actor.actions.rotateTo(Math.PI / 2, Math.PI / 2);

      scene.update(engine, 500);
      expect(actor.rotation).toBe(Math.PI / 4);

      actor.actions.clearActions();

      scene.update(engine, 500);
      expect(actor.rotation).toBe(Math.PI / 4);
    });

    it('(with options) can be stopped', () => {
      expect(actor.rotation).toBe(0);

      actor.actions.rotateTo({ angle: Math.PI / 2, duration: 1000 });

      scene.update(engine, 500);
      expect(actor.rotation).toBe(Math.PI / 4);

      actor.actions.clearActions();

      scene.update(engine, 500);
      expect(actor.rotation).toBe(Math.PI / 4);
    });
  });

  describe('rotateBy', () => {
    it('can be reset', () => {
      const rotateBy = new ex.RotateBy(actor, Math.PI / 2, Math.PI / 2);
      actor.actions.runAction(rotateBy);
      scene.update(engine, 1000);
      expect(rotateBy.isComplete()).toBe(true);

      rotateBy.reset();
      actor.rotation = 0;
      expect(rotateBy.isComplete()).toBe(false);
    });
    it('(with options) can be reset', () => {
      const rotateBy = new ex.RotateByWithOptions(actor, { angleRadiansOffset: Math.PI / 2, duration: 500 });
      actor.actions.runAction(rotateBy);
      scene.update(engine, 1000);
      expect(rotateBy.isComplete()).toBe(true);

      rotateBy.reset();
      actor.rotation = 0;
      expect(rotateBy.isComplete()).toBe(false);
    });
    it('can be rotated to an angle by a certain time via ShortestPath (default)', () => {
      expect(actor.rotation).toBe(0);

      actor.actions.rotateBy(Math.PI / 2, Math.PI / 4);

      scene.update(engine, 1000);
      expect(actor.rotation).toBe(Math.PI / 4);

      scene.update(engine, 1000);
      expect(actor.rotation).toBe(Math.PI / 2);

      scene.update(engine, 500);
      expect(actor.angularVelocity).toBe(0);
    });

    it('(with options) can be rotated to an angle by a certain time via ShortestPath (default)', () => {
      expect(actor.rotation).toBe(0);

      actor.actions.rotateBy({ angleRadiansOffset: Math.PI / 2, duration: 2000 });

      scene.update(engine, 1000);
      expect(actor.rotation).toBe(Math.PI / 4);

      scene.update(engine, 1000);
      expect(actor.rotation).toBe(Math.PI / 2);

      scene.update(engine, 500);
      expect(actor.angularVelocity).toBe(0);
    });

    it('can be rotated to an angle by a certain time via LongestPath', () => {
      expect(actor.rotation).toBe(0);

      actor.actions.rotateBy(Math.PI / 2, Math.PI / 2, ex.RotationType.LongestPath);

      scene.update(engine, 1000);
      expect(actor.rotation).toBe(ex.canonicalizeAngle((-1 * Math.PI) / 2));

      scene.update(engine, 2000);
      expect(actor.rotation).toBe(ex.canonicalizeAngle((-3 * Math.PI) / 2));

      scene.update(engine, 500);
      expect(actor.rotation).toBe(Math.PI / 2);
      expect(actor.angularVelocity).toBe(0);
    });
    it('(with options) can be rotated to an angle by a certain time via LongestPath', () => {
      expect(actor.rotation).toBe(0);

      actor.actions.rotateBy({ angleRadiansOffset: Math.PI / 2, duration: 3000, rotationType: ex.RotationType.LongestPath });

      scene.update(engine, 1000);
      expect(actor.rotation).toBe(ex.canonicalizeAngle((-1 * Math.PI) / 2));

      scene.update(engine, 2000);
      expect(actor.rotation).toBe(ex.canonicalizeAngle((-3 * Math.PI) / 2));

      scene.update(engine, 500);
      expect(actor.rotation).toBe(Math.PI / 2);
      expect(actor.angularVelocity).toBe(0);
    });

    it('can be rotated to an angle by a certain time via Clockwise', () => {
      expect(actor.rotation).toBe(0);

      actor.actions.rotateBy(Math.PI / 2, Math.PI / 2, ex.RotationType.Clockwise);

      scene.update(engine, 500);
      expect(actor.rotation).toBe(Math.PI / 4);

      scene.update(engine, 500);
      expect(actor.rotation).toBe(Math.PI / 2);

      scene.update(engine, 500);
      expect(actor.rotation).toBe(Math.PI / 2);
      expect(actor.angularVelocity).toBe(0);
    });

    it('(with options) can be rotated to an angle by a certain time via Clockwise', () => {
      expect(actor.rotation).toBe(0);

      actor.actions.rotateBy({ angleRadiansOffset: Math.PI / 2, duration: 1000, rotationType: ex.RotationType.Clockwise });

      scene.update(engine, 500);
      expect(actor.rotation).toBe(Math.PI / 4);

      scene.update(engine, 500);
      expect(actor.rotation).toBe(Math.PI / 2);

      scene.update(engine, 500);
      expect(actor.rotation).toBe(Math.PI / 2);
      expect(actor.angularVelocity).toBe(0);
    });

    it('can be rotated to an angle by a certain time via CounterClockwise', () => {
      expect(actor.rotation).toBe(0);

      actor.actions.rotateBy(Math.PI / 2, Math.PI / 2, ex.RotationType.LongestPath);

      scene.update(engine, 1000);
      expect(actor.rotation).toBe(ex.canonicalizeAngle((-1 * Math.PI) / 2));

      scene.update(engine, 2000);
      expect(actor.rotation).toBe(ex.canonicalizeAngle((-3 * Math.PI) / 2));

      scene.update(engine, 500);
      expect(actor.rotation).toBe(Math.PI / 2);
      expect(actor.angularVelocity).toBe(0);
    });

    it('(with options) can be rotated to an angle by a certain time via CounterClockwise', () => {
      expect(actor.rotation).toBe(0);

      actor.actions.rotateBy({ angleRadiansOffset: Math.PI / 2, duration: 3000, rotationType: ex.RotationType.LongestPath });

      scene.update(engine, 1000);
      expect(actor.rotation).toBe(ex.canonicalizeAngle((-1 * Math.PI) / 2));

      scene.update(engine, 2000);
      expect(actor.rotation).toBe(ex.canonicalizeAngle((-3 * Math.PI) / 2));

      scene.update(engine, 500);
      expect(actor.rotation).toBe(Math.PI / 2);
      expect(actor.angularVelocity).toBe(0);
    });

    it('can be stopped', () => {
      expect(actor.rotation).toBe(0);

      actor.actions.rotateBy(Math.PI / 2, Math.PI / 4);

      scene.update(engine, 1000);
      actor.actions.clearActions();
      expect(actor.rotation).toBe(Math.PI / 4);

      scene.update(engine, 1000);
      expect(actor.rotation).toBe(Math.PI / 4);
    });

    it('(with options) can be stopped', () => {
      expect(actor.rotation).toBe(0);

      actor.actions.rotateBy({ angleRadiansOffset: Math.PI / 2, duration: 2000 });

      scene.update(engine, 1000);
      actor.actions.clearActions();
      expect(actor.rotation).toBe(Math.PI / 4);

      scene.update(engine, 1000);
      expect(actor.rotation).toBe(Math.PI / 4);
    });
  });

  describe('scaleTo', () => {
    it('can be reset', () => {
      const scaleTo = new ex.ScaleTo(actor, 2, 2, 1, 1);
      actor.actions.runAction(scaleTo);
      scene.update(engine, 1000);
      expect(scaleTo.isComplete()).toBe(true);

      scaleTo.reset();
      actor.scale = ex.vec(1, 1);
      expect(scaleTo.isComplete()).toBe(false);
    });
    it('(with options) can be reset', () => {
      const scaleTo = new ex.ScaleToWithOptions(actor, { scale: ex.vec(2, 2), duration: 500 });
      actor.actions.runAction(scaleTo);
      scene.update(engine, 1000);
      expect(scaleTo.isComplete()).toBe(true);

      scaleTo.reset();
      actor.scale = ex.vec(1, 1);
      expect(scaleTo.isComplete()).toBe(false);
    });
    it('can be scaled at a speed (x,y) overload', () => {
      expect(actor.scale.x).toBe(1);
      expect(actor.scale.y).toBe(1);

      actor.actions.scaleTo(2, 4, 0.5, 0.5);
      scene.update(engine, 1000);

      expect(actor.scale.x).toBe(1.5);
      expect(actor.scale.y).toBe(1.5);
      scene.update(engine, 1000);

      expect(actor.scale.x).toBe(2);
      expect(actor.scale.y).toBe(2);
      scene.update(engine, 1000);

      expect(actor.scale.x).toBe(2);
      expect(actor.scale.y).toBe(2.5);
    });

    it('(with options) can be scaled at a speed (x,y) overload', () => {
      expect(actor.scale.x).toBe(1);
      expect(actor.scale.y).toBe(1);

      actor.actions.scaleTo({ scale: ex.vec(2, 4), duration: 2000 });
      scene.update(engine, 1000);

      expect(actor.scale.x).toBe(1.5);
      expect(actor.scale.y).toBe(2.5);
      scene.update(engine, 1000);

      expect(actor.scale.x).toBe(2);
      expect(actor.scale.y).toBe(4);
      scene.update(engine, 1000);

      expect(actor.scale.x).toBe(2);
      expect(actor.scale.y).toBe(4);
    });

    it('can be scaled at a speed vector overload', () => {
      expect(actor.scale.x).toBe(1);
      expect(actor.scale.y).toBe(1);

      actor.actions.scaleTo(ex.vec(2, 4), ex.vec(0.5, 0.5));
      scene.update(engine, 1000);

      expect(actor.scale.x).toBe(1.5);
      expect(actor.scale.y).toBe(1.5);
      scene.update(engine, 1000);

      expect(actor.scale.x).toBe(2);
      expect(actor.scale.y).toBe(2);
      scene.update(engine, 1000);

      expect(actor.scale.x).toBe(2);
      expect(actor.scale.y).toBe(2.5);
    });

    it('can be scaled at a speed vector overload', () => {
      expect(actor.scale.x).toBe(1);
      expect(actor.scale.y).toBe(1);

      actor.actions.scaleTo(ex.vec(2, 4), ex.vec(0.5, 0.5));
      scene.update(engine, 1000);

      expect(actor.scale.x).toBe(1.5);
      expect(actor.scale.y).toBe(1.5);
      scene.update(engine, 1000);

      expect(actor.scale.x).toBe(2);
      expect(actor.scale.y).toBe(2);
      scene.update(engine, 1000);

      expect(actor.scale.x).toBe(2);
      expect(actor.scale.y).toBe(2.5);
    });

    it('can be stopped', () => {
      expect(actor.scale.x).toBe(1);
      expect(actor.scale.y).toBe(1);

      actor.actions.scaleTo(2, 2, 0.5, 0.5);
      scene.update(engine, 1000);

      actor.actions.clearActions();
      expect(actor.scale.x).toBe(1.5);
      expect(actor.scale.y).toBe(1.5);

      scene.update(engine, 1000);
      expect(actor.scale.x).toBe(1.5);
      expect(actor.scale.y).toBe(1.5);
    });

    it('completes when scaling on the x-axis', () => {
      expect(actor.scale.x).toBe(1);

      const scaleTo = new ex.ScaleTo(actor, 2, 1, 1, 1);
      actor.actions.runAction(scaleTo);
      expect(scaleTo.isComplete()).toBe(false);

      scene.update(engine, 1000);
      expect(actor.scale.x).toBe(2);
      expect(actor.scale.y).toBe(1);
      expect(scaleTo.isComplete()).toBe(true);
    });
  });

  describe('scaleBy', () => {
    it('can be reset', () => {
      const scaleBy = new ex.ScaleBy(actor, 1, 1, 1);
      actor.actions.runAction(scaleBy);
      scene.update(engine, 1000);
      expect(scaleBy.isComplete()).toBe(true);

      scaleBy.reset();
      actor.scale = ex.vec(1, 1);
      expect(scaleBy.isComplete()).toBe(false);
    });
    it('(with options) can be reset', () => {
      const scaleBy = new ex.ScaleByWithOptions(actor, { scaleOffset: ex.vec(1, 1), duration: 500 });
      actor.actions.runAction(scaleBy);
      scene.update(engine, 1000);
      expect(scaleBy.isComplete()).toBe(true);

      scaleBy.reset();
      actor.scale = ex.vec(1, 1);
      expect(scaleBy.isComplete()).toBe(false);
    });

    it('can be scaled by a certain time (x,y) overload', () => {
      expect(actor.scale.x).toBe(1);
      expect(actor.scale.y).toBe(1);

      actor.actions.scaleBy(4, 4, 4);

      scene.update(engine, 500);
      expect(actor.scale.x).toBe(3);
      expect(actor.scale.y).toBe(3);

      scene.update(engine, 500);
      scene.update(engine, 1);
      expect(actor.scale.x).toBe(5);
      expect(actor.scale.y).toBe(5);
    });
    it('(with options) can be scaled by a certain time (x,y) overload', () => {
      expect(actor.scale.x).toBe(1);
      expect(actor.scale.y).toBe(1);

      actor.actions.scaleBy({ scaleOffset: ex.vec(4, 4), duration: 1000 });

      scene.update(engine, 500);
      expect(actor.scale.x).toBe(3);
      expect(actor.scale.y).toBe(3);

      scene.update(engine, 500);
      scene.update(engine, 1);
      expect(actor.scale.x).toBe(5);
      expect(actor.scale.y).toBe(5);
    });

    it('can be scaled by a certain time vector overload', () => {
      expect(actor.scale.x).toBe(1);
      expect(actor.scale.y).toBe(1);

      actor.actions.scaleBy(ex.vec(4, 4), 4);

      scene.update(engine, 500);
      expect(actor.scale.x).toBe(3);
      expect(actor.scale.y).toBe(3);

      scene.update(engine, 500);
      scene.update(engine, 1);
      expect(actor.scale.x).toBe(5);
      expect(actor.scale.y).toBe(5);
    });

    it('can be scaled by a certain time vector overload', () => {
      expect(actor.scale.x).toBe(1);
      expect(actor.scale.y).toBe(1);

      actor.actions.scaleBy(ex.vec(4, 4), 4);

      scene.update(engine, 500);
      expect(actor.scale.x).toBe(3);
      expect(actor.scale.y).toBe(3);

      scene.update(engine, 500);
      scene.update(engine, 1);
      expect(actor.scale.x).toBe(5);
      expect(actor.scale.y).toBe(5);
    });

    it('can be stopped', () => {
      expect(actor.scale.x).toBe(1);
      expect(actor.scale.y).toBe(1);

      actor.actions.scaleBy(4, 4, 3);

      scene.update(engine, 500);

      actor.actions.clearActions();
      expect(actor.scale.x).toBe(2.5);
      expect(actor.scale.y).toBe(2.5);

      scene.update(engine, 500);
      expect(actor.scale.x).toBe(2.5);
      expect(actor.scale.y).toBe(2.5);
    });

    it('(with options) can be stopped', () => {
      expect(actor.scale.x).toBe(1);
      expect(actor.scale.y).toBe(1);

      actor.actions.scaleBy({ scaleOffset: ex.vec(4, 4), duration: 1250 });

      scene.update(engine, 500);

      actor.actions.clearActions();
      expect(actor.scale.x).toBe(2.6);
      expect(actor.scale.y).toBe(2.6);

      scene.update(engine, 500);
      expect(actor.scale.x).toBe(2.6);
      expect(actor.scale.y).toBe(2.6);
    });
  });

  describe('follow', () => {
    it('can work with another actor', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      const actorToFollow = new ex.Actor({ x: 10, y: 0 });
      scene.add(actorToFollow);
      actorToFollow.actions.moveTo(100, 0, 10);
      actor.actions.follow(actorToFollow);

      scene.update(engine, 0); // TODO extra update
      for (let i = 1; i < 10; i++) {
        scene.update(engine, 1000);
        expect(actor.pos.x).toBe(actorToFollow.pos.x - 10);
      }
    });
  });

  describe('meet', () => {
    it('can be reset', () => {
      const target = new ex.Actor({ x: 100, y: 0 });
      const meet = new ex.Meet(actor, target, 100);
      actor.actions.runAction(meet);

      scene.update(engine, 1000);
      scene.update(engine, 1000);
      expect(meet.isComplete()).toBe(true);

      meet.reset();
      actor.pos = ex.vec(0, 0);
      expect(meet.isComplete()).toBe(false);
    });

    it('can meet another actor', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      // testing basic meet
      const actorToMeet = new ex.Actor({ x: 10, y: 0 });
      scene.add(actorToMeet);
      actorToMeet.actions.moveTo(100, 0, 10);
      actor.actions.meet(actorToMeet);

      scene.update(engine, 0); // TODO extra updated
      for (let i = 0; i < 9; i++) {
        scene.update(engine, 1000);
        expect(actor.pos.x).toBe(actorToMeet.pos.x - 10);
      }

      // actor should have caught up to actorToFollow since it stopped moving
      scene.update(engine, 1000);
      expect(actor.pos.x).toBe(actorToMeet.pos.x);
    });
  });

  describe('fade', () => {
    it('can be reset', () => {
      const fade = new ex.Fade(actor, 0, 1000);
      fade.update(1000);
      expect(fade.isComplete()).toBe(true);

      fade.reset();
      actor.graphics.opacity = 1;
      expect(fade.isComplete()).toBe(false);
    });

    it('can go from 1 from 0', () => {
      actor.graphics.opacity = 0;

      actor.actions.fade(1, 200);
      for (let i = 0; i < 10; i++) {
        scene.update(engine, 20);
      }

      expect(actor.graphics.opacity).toBe(1);
    });

    it('can go from 1 from 0 with large time steps', () => {
      actor.graphics.opacity = 0;

      actor.actions.fade(1, 200);
      for (let i = 0; i < 10; i++) {
        scene.update(engine, 115);
      }

      expect(actor.graphics.opacity).toBe(1);
    });

    it('can go back and forth from 0 to 1 (#512)', () => {
      actor.graphics.opacity = 0;

      actor.actions.fade(1, 200).fade(0, 200);
      for (let i = 0; i < 20; i++) {
        scene.update(engine, 20);
      }

      expect(actor.graphics.opacity).toBe(0);
    });

    it('can go back and forth from 0 to 1 more than once (#512)', () => {
      actor.graphics.opacity = 0;

      actor.actions.repeat((ctx) => ctx.fade(1, 200).fade(0, 200), 1);
      for (let i = 0; i < 40; i++) {
        scene.update(engine, 20);
      }

      expect(actor.graphics.opacity).toBe(0);
    });
  });

  describe('events', () => {
    it('emits actionstart event', () => {
      const spy = vi.fn();
      actor.actions.moveTo(20, 0, 20);
      actor.on('actionstart', spy);
      scene.update(engine, 500);
      scene.update(engine, 500);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ target: actor, action: expect.any(ex.MoveTo) }));
    });

    it('emits actioncomplete event', () => {
      const spy = vi.fn();
      actor.actions.moveTo(20, 0, 20);
      actor.on('actioncomplete', spy);
      for (let i = 0; i < 10; i++) {
        scene.update(engine, 200);
      }
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ target: actor, action: expect.any(ex.MoveTo) }));
    });

    it('emits actioncomplete with an action with ids', () => {
      const spy = vi.fn();
      // actor.actions.moveTo(20, 0, 20);
      const moveTo = new ex.MoveTo(actor, 20, 0, 20);
      const moveTo2 = new ex.MoveTo(actor, 20, 0, 20);
      actor.actions.runAction(moveTo);
      actor.on('actioncomplete', spy);
      for (let i = 0; i < 10; i++) {
        scene.update(engine, 200);
      }
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ target: actor, action: moveTo }));
      expect(moveTo.id).not.toEqual(moveTo2.id);
      expect(moveTo2.id).toEqual(moveTo.id + 1);
    });

    it('emits actionstart and actioncomplete events for each action in a repeat', () => {
      const startSpy = vi.fn();
      const completeSpy = vi.fn();
      actor.actions.repeat((ctx) => ctx.moveTo(20, 0, 20).moveTo(0, 0, 20), 1);
      actor.on('actionstart', startSpy);
      actor.on('actioncomplete', completeSpy);

      for (let i = 0; i < 10; i++) {
        scene.update(engine, 500);
      }

      const startCalls = startSpy.mock.calls;
      expect(startSpy).toHaveBeenCalledTimes(3);
      expect(startCalls[0][0]).toEqual(expect.objectContaining({ target: actor, action: expect.any(ex.Repeat) }));
      expect(startCalls[1][0]).toEqual(expect.objectContaining({ target: actor, action: expect.any(ex.MoveTo) }));
      expect(startCalls[2][0]).toEqual(expect.objectContaining({ target: actor, action: expect.any(ex.MoveTo) }));

      const completeCalls = completeSpy.mock.calls;
      expect(completeSpy).toHaveBeenCalledTimes(3);
      expect(completeCalls[0][0]).toEqual(expect.objectContaining({ target: actor, action: expect.any(ex.MoveTo) }));
      expect(completeCalls[1][0]).toEqual(expect.objectContaining({ target: actor, action: expect.any(ex.MoveTo) }));
      expect(completeCalls[2][0]).toEqual(expect.objectContaining({ target: actor, action: expect.any(ex.Repeat) }));
    });
  });
});
