import * as ex from '@excalibur';
import { BodyComponent } from '@excalibur';

describe('A body component', () => {
  it('exists', () => {
    expect(ex.BodyComponent).toBeDefined();
  });

  it('can set the mass and cache their values', () => {
    const actor = new ex.Actor({
      x: 0,
      y: 0,
      width: 10,
      height: 10
    });

    actor.body.mass = 100;

    expect(actor.body.mass).toBe(100);
    expect(actor.body.inertia).toBeCloseTo(1666.6, 0);
    expect(actor.body.inverseInertia).toBeCloseTo(0.0006, 0);

    expect((actor.body as any)._cachedInertia).toBeCloseTo(1666.6, 0);
    expect((actor.body as any)._cachedInverseInertia).toBeCloseTo(0.0006, 0);

    actor.body.mass = 1;
    expect((actor.body as any)._cachedInertia).toBeNull();
    expect((actor.body as any)._cachedInverseInertia).toBeNull();
  });

  it('will reflect the transform positions', () => {
    const actor = new ex.Actor({
      pos: ex.vec(100, 100)
    });

    const child = new ex.Actor({
      pos: ex.vec(10, 10)
    });

    actor.addChild(child);

    const body = child.get(BodyComponent);
    expect(body.pos).toBeVector(ex.vec(10, 10));
    expect(body.globalPos).toBeVector(ex.vec(110, 110));
  });

  it('can be cloned', () => {
    ex.CollisionGroupManager.reset();
    const body = new ex.BodyComponent();
    const owner = new ex.Entity([body]);
    body.collisionType = ex.CollisionType.Fixed;
    body.group = ex.CollisionGroupManager.create('somegroup');
    body.mass = 100;
    body.canSleep = true;
    body.bounciness = 1;
    body.friction = 0.5;
    body.useGravity = false;
    body.limitDegreeOfFreedom.push(ex.DegreeOfFreedom.Rotation);
    body.vel = ex.vec(1, 2);
    body.acc = ex.vec(3, 4);
    body.scaleFactor = ex.vec(5, 6);
    body.angularVelocity = 7;
    body.torque = 8;

    const clone = owner.clone();

    const sut = clone.get(ex.BodyComponent);

    // Should be same value
    expect(sut.vel).toBeVector(body.vel);
    expect(sut.acc).toBeVector(body.acc);
    expect(sut.scaleFactor).toBeVector(body.scaleFactor);
    expect(sut.angularVelocity).toBe(body.angularVelocity);
    expect(sut.torque).toBe(body.torque);
    expect(sut.inertia).toBe(body.inertia);
    expect(sut.collisionType).toEqual(body.collisionType);
    expect(sut.group).toEqual(body.group);
    expect(sut.mass).toEqual(body.mass);
    expect(sut.canSleep).toEqual(body.canSleep);
    expect(sut.bounciness).toEqual(body.bounciness);
    expect(sut.friction).toEqual(body.friction);
    expect(sut.useGravity).toEqual(body.useGravity);
    expect(sut.limitDegreeOfFreedom).toEqual(body.limitDegreeOfFreedom);

    // Should be new refs
    expect(sut).not.toBe(body);
    expect(sut.vel).not.toBe(body.vel);
    expect(sut.acc).not.toBe(body.acc);
    expect(sut.scaleFactor).not.toBe(body.scaleFactor);

    // Should have a new owner
    expect(sut.owner).toBe(clone);
  });

  it('applies scalar impulses at an offset the same as applyImpulse', () => {
    const viaVector = new ex.Actor({ x: 0, y: 0, width: 40, height: 40, collisionType: ex.CollisionType.Active });
    const viaScalar = new ex.Actor({ x: 0, y: 0, width: 40, height: 40, collisionType: ex.CollisionType.Active });

    viaVector.body.applyImpulse(ex.vec(20, 20), ex.vec(0, -100));
    viaScalar.body.applyImpulseAtOffset(20, 20, 0, -100);

    expect(viaScalar.vel).toBeVector(viaVector.vel);
    expect(viaScalar.body.angularVelocity).toBeCloseTo(viaVector.body.angularVelocity, 6);
    expect(viaScalar.body.angularVelocity).not.toBe(0);
  });

  it('honors limited degrees of freedom for scalar impulses', () => {
    const noRotation = new ex.Actor({ x: 0, y: 0, width: 40, height: 40, collisionType: ex.CollisionType.Active });
    noRotation.body.limitDegreeOfFreedom = [ex.DegreeOfFreedom.Rotation];
    noRotation.body.applyImpulseAtOffset(20, 20, 30, -100);
    expect(noRotation.body.angularVelocity).toBe(0);
    expect(noRotation.vel.y).toBeLessThan(0);
    expect(noRotation.vel.x).toBeGreaterThan(0);

    const noX = new ex.Actor({ x: 0, y: 0, width: 40, height: 40, collisionType: ex.CollisionType.Active });
    noX.body.limitDegreeOfFreedom = [ex.DegreeOfFreedom.X];
    noX.body.applyImpulseAtOffset(20, 20, 30, -100);
    expect(noX.vel.x).toBe(0);
    expect(noX.vel.y).toBeLessThan(0);

    const fixed = new ex.Actor({ x: 0, y: 0, width: 40, height: 40, collisionType: ex.CollisionType.Fixed });
    fixed.body.applyImpulseAtOffset(20, 20, 30, -100);
    expect(fixed.vel).toBeVector(ex.vec(0, 0));
  });

  describe('physics config updates', () => {
    const sceneConfig = (overrides: any = {}) => ({ ...ex.getDefaultPhysicsConfig().bodies, ...overrides });

    it('follows the scene config by default', () => {
      const body = new ex.BodyComponent();
      expect(body.canSleep).toBe(true);
      body.updatePhysicsConfig(sceneConfig({ canSleepByDefault: false, wakeThreshold: 99 }));
      expect(body.canSleep).toBe(false);
      expect(body.wakeThreshold).toBe(99);
    });

    it('keeps a per-body canSleep / wakeThreshold across config updates', () => {
      const body = new ex.BodyComponent();
      body.canSleep = false;
      body.wakeThreshold = 5;
      body.updatePhysicsConfig(sceneConfig({ canSleepByDefault: true, wakeThreshold: 99 }));
      expect(body.canSleep).toBe(false);
      expect(body.wakeThreshold).toBe(5);

      body.canSleep = undefined;
      body.wakeThreshold = undefined;
      expect(body.canSleep).toBe(true);
      expect(body.wakeThreshold).toBe(99);
    });

    it('keeps per-body constructor config across scene config updates', () => {
      const body = new ex.BodyComponent({ config: { canSleepByDefault: false, wakeThreshold: 7 } as any });
      body.updatePhysicsConfig(sceneConfig({ canSleepByDefault: true, wakeThreshold: 99, sleepEpsilon: 0.5 }));
      expect(body.canSleep).toBe(false);
      expect(body.wakeThreshold).toBe(7);
    });

    it('does not reset sleepMotion when the config changes', () => {
      const body = new ex.BodyComponent();
      body.sleepMotion = 0.001;
      body.updatePhysicsConfig(sceneConfig({ gravity: ex.vec(0, 10) }));
      expect(body.sleepMotion).toBe(0.001);
    });
  });
});
