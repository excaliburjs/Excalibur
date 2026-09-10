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
    expect((actor.body as any)._cachedInertia).toBe(undefined);
    expect((actor.body as any)._cachedInverseInertia).toBe(undefined);
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

  it('invalidates the inverse inertia cache when collider geometry is added after the body', () => {
    // Body reads its inertia before any geometry exists, the cache gets filled with the no-geometry values
    const actor = new ex.Actor({ x: 0, y: 0, collisionType: ex.CollisionType.Active });
    expect(actor.body.inertia).toBe(0);
    expect(actor.body.inverseInertia).toBe(Infinity);

    actor.collider.use(ex.Shape.Box(10, 10));

    // Adding the collider geometry must invalidate both caches, no Infinity and no NaN rotation
    expect(actor.body.inertia).not.toBe(0);
    expect(Number.isFinite(actor.body.inverseInertia)).toBe(true);

    const reference = new ex.Actor({ x: 0, y: 0, width: 10, height: 10, collisionType: ex.CollisionType.Active });
    expect(actor.body.inverseInertia).toBeCloseTo(reference.body.inverseInertia, 10);

    actor.body.applyImpulse(ex.vec(5, 5), ex.vec(0, -10));
    expect(Number.isNaN(actor.body.angularVelocity)).toBe(false);
    expect(actor.body.angularVelocity).not.toBe(0);
  });

  it('invalidates the inverse inertia cache when a collider component is added after the body', () => {
    const entity = new ex.Entity([new ex.BodyComponent({ type: ex.CollisionType.Active })]);
    const body = entity.get(ex.BodyComponent);
    expect(body.inverseInertia).toBe(Infinity);

    entity.addComponent(new ex.ColliderComponent(ex.Shape.Box(10, 10)));

    expect(body.inertia).not.toBe(0);
    expect(Number.isFinite(body.inverseInertia)).toBe(true);
  });

  it('invalidates the inverse inertia cache when the collision type changes', () => {
    const actor = new ex.Actor({ x: 0, y: 0, width: 10, height: 10, collisionType: ex.CollisionType.Active });
    const activeInverseInertia = actor.body.inverseInertia;
    expect(Number.isFinite(activeInverseInertia)).toBe(true);
    expect(activeInverseInertia).not.toBe(0);

    actor.body.collisionType = ex.CollisionType.Fixed;
    expect(actor.body.inverseInertia).toBe(0);

    actor.body.collisionType = ex.CollisionType.Active;
    expect(actor.body.inverseInertia).toBeCloseTo(activeInverseInertia, 10);
  });

  it('does not leak collider subscriptions when inertia is read repeatedly', () => {
    const actor = new ex.Actor({ x: 0, y: 0, collisionType: ex.CollisionType.Active });
    const collider = actor.collider;

    // Every read misses the cache (no geometry), the body must stay wired exactly once
    for (let i = 0; i < 50; i++) {
      expect(actor.body.inertia).toBe(0);
      void actor.body.inverseInertia;
    }
    expect(collider.$colliderAdded.subscriptions.length).toBe(1);
    expect(collider.$colliderRemoved.subscriptions.length).toBe(1);

    collider.use(ex.Shape.Box(10, 10));
    expect(Number.isFinite(actor.body.inverseInertia)).toBe(true);
    expect(collider.$colliderAdded.subscriptions.length).toBe(1);
  });

  it('unwires collider subscriptions when the collider component is removed', () => {
    const actor = new ex.Actor({ x: 0, y: 0, width: 10, height: 10, collisionType: ex.CollisionType.Active });
    const collider = actor.get(ex.ColliderComponent);
    expect(collider.$colliderAdded.subscriptions.length).toBe(1);

    actor.removeComponent(ex.ColliderComponent);
    actor.processComponentRemoval();

    expect(collider.$colliderAdded.subscriptions.length).toBe(0);
    expect(collider.$colliderRemoved.subscriptions.length).toBe(0);
  });

  it('wires inertia invalidation independently after clone', () => {
    const actor = new ex.Actor({ x: 0, y: 0, width: 10, height: 10, color: ex.Color.Red, collisionType: ex.CollisionType.Active });
    const originalInverseInertia = actor.body.inverseInertia;

    const clone = actor.clone();
    const cloneBody = clone.get(ex.BodyComponent);
    const cloneCollider = clone.get(ex.ColliderComponent);

    // Clone is wired to its own collider, not the original's
    expect(cloneCollider.$colliderAdded.subscriptions.length).toBe(1);

    cloneCollider.use(ex.Shape.Box(40, 40));
    expect(cloneBody.inverseInertia).not.toBeCloseTo(originalInverseInertia, 10);
    // The original's cache is untouched by the clone's collider changing
    expect(actor.body.inverseInertia).toBeCloseTo(originalInverseInertia, 10);
  });
});
