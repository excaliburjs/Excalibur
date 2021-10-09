import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';
import { ExcaliburMatchers } from 'excalibur-jasmine';
import { canonicalizeAngle } from '../engine/Util/Util';

describe('Action', () => {
  let actor: ex.Actor;

  let engine: ex.Engine & any;
  let scene: ex.Scene;

  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    engine = TestUtils.engine({ width: 100, height: 100 });

    actor = new ex.Actor();
    scene = new ex.Scene();
    scene.add(actor);
    engine.addScene('test', scene);
    engine.goToScene('test');
    engine.start();

    spyOn(scene, 'draw').and.callThrough();
    spyOn(actor, 'draw');
  });

  afterEach(() => {
    engine.stop();
    engine = null;
  });

  describe('blink', () => {
    it('can blink on and off', () => {
      expect(actor.visible).toBe(true);
      actor.actions.blink(200, 200);

      scene.update(engine, 200);
      expect(actor.visible).toBe(false);

      scene.update(engine, 250);
      expect(actor.visible).toBe(true);
    });

    it('can blink at a frequency forever', () => {
      expect(actor.visible).toBe(true);
      actor.actions.repeatForever((ctx) => ctx.blink(200, 200));
      scene.update(engine, 200);

      for (let i = 0; i < 2; i++) {
        expect(actor.visible).toBe(false);
        scene.update(engine, 200);

        expect(actor.visible).toBe(true);
        scene.update(engine, 200);
      }
    });

    it('can be stopped', () => {
      expect(actor.visible).toBe(true);
      actor.actions.blink(1, 3000);

      scene.update(engine, 500);
      expect(actor.visible).toBe(false);

      actor.actions.clearActions();

      scene.update(engine, 500);
      scene.update(engine, 500);
      expect(actor.visible).toBe(true);
    });
  });

  describe('color', () => {
    it('is cloned from constructor', () => {
      const color = ex.Color.Azure;
      const sut = new ex.Actor({ color });

      expect(sut.color).not.toBe(color, 'Color is not expected to be same instance');
    });

    it('is cloned from property setter', () => {
      const color = ex.Color.Azure;
      const sut = new ex.Actor();

      sut.color = color;

      expect(sut.color).not.toBe(color, 'Color is not expected to be same instance');
    });
  });

  describe('die', () => {
    it('can remove actor from scene', () => {
      scene.add(actor);
      expect(scene.actors.length).toBe(1);
      actor.actions.die();
      scene.update(engine, 100);
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

    it('can be a promise', (done) => {
      const spy = jasmine.createSpy();
      actor.actions.delay(1000);
      actor.actions.callMethod(spy);
      actor.actions.asPromise().then(() => {
        expect(spy).toHaveBeenCalled();
        done();
      });
      scene.update(engine, 1000);
      scene.update(engine, 0);
      scene.update(engine, 0);
    });
  });

  describe('moveBy', () => {
    it('can be moved to a location by a certain time (x,y) overload', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      actor.actions.moveBy(100, 0, 50);

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
  });

  describe('moveTo', () => {
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
  });

  describe('easeTo', () => {
    it('can be eased to a location given an easing function (x,y) overload', () => {
      expect(actor.pos).toBeVector(ex.vec(0, 0));

      actor.actions.easeTo(100, 0, 1000, ex.EasingFunctions.EaseInOutCubic);

      scene.update(engine, 500);
      expect(actor.pos).toBeVector(ex.vec(50, 0));
      expect(actor.vel).toBeVector(ex.vec(100, 0));

      scene.update(engine, 500);
      expect(actor.pos).toBeVector(ex.vec(100, 0));
      expect(actor.vel).toBeVector(ex.vec(0, 0));

      scene.update(engine, 500);
      expect(actor.pos).toBeVector(ex.vec(100, 0));
      expect(actor.vel).toBeVector(ex.vec(0, 0));
    });

    it('can be eased to a location given an easing function vector overload', () => {
      expect(actor.pos).toBeVector(ex.vec(0, 0));

      actor.actions.easeTo(ex.vec(100, 0), 1000, ex.EasingFunctions.EaseInOutCubic);

      scene.update(engine, 500);
      expect(actor.pos).toBeVector(ex.vec(50, 0));
      expect(actor.vel).toBeVector(ex.vec(100, 0));

      scene.update(engine, 500);
      expect(actor.pos).toBeVector(ex.vec(100, 0));
      expect(actor.vel).toBeVector(ex.vec(0, 0));

      scene.update(engine, 500);
      expect(actor.pos).toBeVector(ex.vec(100, 0));
      expect(actor.vel).toBeVector(ex.vec(0, 0));
    });

    it('can be eased to a location given an easing function vector overload', () => {
      expect(actor.pos).toBeVector(ex.vec(0, 0));

      actor.actions.easeTo(ex.vec(100, 0), 1000, ex.EasingFunctions.EaseInOutCubic);

      scene.update(engine, 500);
      expect(actor.pos).toBeVector(ex.vec(50, 0));
      expect(actor.vel).toBeVector(ex.vec(100, 0));

      scene.update(engine, 500);
      expect(actor.pos).toBeVector(ex.vec(100, 0));
      expect(actor.vel).toBeVector(ex.vec(0, 0));

      scene.update(engine, 500);
      expect(actor.pos).toBeVector(ex.vec(100, 0));
      expect(actor.vel).toBeVector(ex.vec(0, 0));
    });

    it('can be stopped', () => {
      expect(actor.pos).toBeVector(ex.vec(0, 0));

      actor.actions.easeTo(100, 0, 1000, ex.EasingFunctions.EaseInOutCubic);

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
      const repeatCallback = jasmine.createSpy('repeat');
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
      const repeatCallback = jasmine.createSpy('repeat');
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
      const repeatCallback = jasmine.createSpy('repeat');
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
      const repeatCallback = jasmine.createSpy('repeat');
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
      const repeatCallback = jasmine.createSpy('repeat');
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

    it('can be rotated to an angle at a speed via LongestPath', () => {
      expect(actor.rotation).toBe(0);

      actor.actions.rotateTo(Math.PI / 2, Math.PI / 2, ex.RotationType.LongestPath);

      scene.update(engine, 1000);
      //rotation is currently incremented by rx delta ,so will be negative while moving counterclockwise
      expect(actor.rotation).toBe(canonicalizeAngle((-1 * Math.PI) / 2));

      scene.update(engine, 2000);
      expect(actor.rotation).toBe(canonicalizeAngle((-3 * Math.PI) / 2));

      scene.update(engine, 500);
      expect(actor.rotation).toBe(canonicalizeAngle(Math.PI / 2));
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

    it('can be rotated to an angle at a speed via CounterClockwise', () => {
      expect(actor.rotation).toBe(0);

      actor.actions.rotateTo(Math.PI / 2, Math.PI / 2, ex.RotationType.CounterClockwise);
      scene.update(engine, 2000);
      expect(actor.rotation).toBe(canonicalizeAngle(-Math.PI));

      scene.update(engine, 1000);
      expect(actor.rotation).toBe(canonicalizeAngle((-3 * Math.PI) / 2));

      scene.update(engine, 500);
      expect(actor.rotation).toBe(canonicalizeAngle(Math.PI / 2));
      expect(actor.angularVelocity).toBe(0);

      // rotating back to 0, starting at PI / 2
      actor.actions.rotateTo(0, Math.PI / 2, ex.RotationType.CounterClockwise);
      scene.update(engine, 1000);
      expect(actor.rotation).toBe(canonicalizeAngle(0));

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
  });

  describe('rotateBy', () => {
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

    it('can be rotated to an angle by a certain time via LongestPath', () => {
      expect(actor.rotation).toBe(0);

      actor.actions.rotateBy(Math.PI / 2, Math.PI / 2, ex.RotationType.LongestPath);

      scene.update(engine, 1000);
      expect(actor.rotation).toBe(canonicalizeAngle((-1 * Math.PI) / 2));

      scene.update(engine, 2000);
      expect(actor.rotation).toBe(canonicalizeAngle((-3 * Math.PI) / 2));

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

    it('can be rotated to an angle by a certain time via CounterClockwise', () => {
      expect(actor.rotation).toBe(0);

      actor.actions.rotateBy(Math.PI / 2, Math.PI / 2, ex.RotationType.LongestPath);

      scene.update(engine, 1000);
      expect(actor.rotation).toBe(canonicalizeAngle((-1 * Math.PI) / 2));

      scene.update(engine, 2000);
      expect(actor.rotation).toBe(canonicalizeAngle((-3 * Math.PI) / 2));

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
  });

  describe('scaleTo', () => {
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
  });

  describe('scaleBy', () => {
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
  });

  describe('follow', () => {
    it('can work with another actor', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      const actorToFollow = new ex.Actor({ x: 10, y: 0 });
      scene.add(actorToFollow);
      actorToFollow.actions.moveTo(100, 0, 10);
      actor.actions.follow(actorToFollow);
      // scene.update(engine, 1000);
      // expect(actor.pos.x).toBe(actorToFollow.x);

      for (let i = 1; i < 10; i++) {
        // actor.follow(actorToFollow);
        actorToFollow.update(engine, 1000);
        scene.update(engine, 1000);
        expect(actor.pos.x).toBe(actorToFollow.pos.x - 10);
      }
    });
  });

  describe('meet', () => {
    it('can meet another actor', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      // testing basic meet
      const actorToMeet = new ex.Actor({ x: 10, y: 0 });
      scene.add(actorToMeet);
      actorToMeet.actions.moveTo(100, 0, 10);
      actor.actions.meet(actorToMeet);

      for (let i = 0; i < 9; i++) {
        actorToMeet.update(engine, 1000);
        scene.update(engine, 1000);
        expect(actor.pos.x).toBe(actorToMeet.pos.x - 10);
      }

      // actor should have caught up to actorToFollow since it stopped moving
      actorToMeet.update(engine, 1000);
      scene.update(engine, 1000);
      expect(actor.pos.x).toBe(actorToMeet.pos.x);
    });
  });

  describe('fade', () => {
    it('can go from 1 from 0', () => {
      actor.opacity = 0;

      actor.actions.fade(1, 200);
      for (let i = 0; i < 10; i++) {
        scene.update(engine, 20);
      }

      expect(actor.opacity).toBe(1);
    });

    it('can go back and forth from 0 to 1 (#512)', () => {
      actor.opacity = 0;

      actor.actions.fade(1, 200).fade(0, 200);
      for (let i = 0; i < 20; i++) {
        scene.update(engine, 20);
      }

      expect(actor.opacity).toBe(0);
    });

    it('can go back and forth from 0 to 1 more than once (#512)', () => {
      actor.opacity = 0;

      actor.actions.repeat((ctx) => ctx.fade(1, 200).fade(0, 200), 1);
      for (let i = 0; i < 40; i++) {
        scene.update(engine, 20);
      }

      expect(actor.opacity).toBe(0);
    });
  });
});
