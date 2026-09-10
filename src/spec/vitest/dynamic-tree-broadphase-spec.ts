import * as ex from '@excalibur';
import { getDefaultPhysicsConfig } from '../../engine/collision/physics-config';
import { TestUtils } from '../__util__/test-utils';

describe('A DynamicTree Broadphase', () => {
  let actorA: ex.Actor;
  let actorB: ex.Actor;
  let actorC: ex.Actor;

  beforeEach(() => {
    actorA = new ex.Actor({ x: 0, y: 0, width: 20, height: 20 });
    actorA.collider.useCircleCollider(10);
    actorA.body.collisionType = ex.CollisionType.Active;
    actorA.collider.update();

    actorB = new ex.Actor({ x: 20, y: 0, width: 20, height: 20 });
    actorB.collider.useCircleCollider(10);
    actorB.body.collisionType = ex.CollisionType.Active;
    actorB.collider.update();

    actorC = new ex.Actor({ x: 1000, y: 0, width: 20, height: 20 });
    actorC.collider.useCircleCollider(10);
    actorC.body.collisionType = ex.CollisionType.Active;
    actorC.collider.update();
  });

  it('exists', () => {
    expect(ex.DynamicTreeCollisionProcessor).toBeDefined();
  });

  it('can be constructed', () => {
    const dt = new ex.DynamicTreeCollisionProcessor(getDefaultPhysicsConfig());

    expect(dt).not.toBe(null);
  });

  it('can find collision pairs for actors that are potentially colliding', () => {
    const dt = new ex.DynamicTreeCollisionProcessor({
      ...getDefaultPhysicsConfig()
    });
    dt.track(actorA.collider.get());
    dt.track(actorB.collider.get());
    dt.track(actorC.collider.get());

    // only should be 1 pair since C is very far away
    const pairs = dt.broadphase([actorA.collider.get(), actorB.collider.get(), actorC.collider.get()], 100);

    expect(pairs.length).toBe(1);
  });

  it('should not find pairs for a composite collider', () => {
    const circle = ex.Shape.Circle(50);
    const box = ex.Shape.Box(200, 10);
    const compCollider = new ex.CompositeCollider([circle, box]);
    const actor = new ex.Actor({ collider: compCollider });
    const dt = new ex.DynamicTreeCollisionProcessor({
      ...getDefaultPhysicsConfig()
    });
    dt.track(compCollider);

    const pairs = dt.broadphase([circle, box], 100);
    expect(pairs).toEqual([]);
  });

  it('should not find pairs for a composite collider when moving fast', () => {
    const circle = ex.Shape.Circle(50);
    const box = ex.Shape.Box(200, 10);
    const compCollider = new ex.CompositeCollider([circle, box]);
    const actor = new ex.Actor({ collider: compCollider, collisionType: ex.CollisionType.Active });
    actor.body.vel = ex.vec(2000, 0); // extra fast to trigger the fast object detection
    const dt = new ex.DynamicTreeCollisionProcessor({
      ...getDefaultPhysicsConfig()
    });
    dt.track(compCollider);

    const pairs = dt.broadphase([circle, box], 100);
    expect(pairs).toEqual([]);
  });

  it('can rayCast with default options, only 1 hit is returned, searches all groups', () => {
    const sut = new ex.DynamicTreeCollisionProcessor({
      ...getDefaultPhysicsConfig()
    });
    const actor1 = new ex.Actor({ x: 100, y: 0, width: 50, height: 50 });
    sut.track(actor1.collider.get());
    const actor2 = new ex.Actor({ x: 200, y: 0, width: 50, height: 50 });
    sut.track(actor2.collider.get());

    const ray = new ex.Ray(ex.vec(0, 0), ex.Vector.Right);
    const hits = sut.rayCast(ray);

    expect(hits.length).toBe(1);
    expect(hits[0].body).toEqual(actor1.body);
    expect(hits[0].collider).toEqual(actor1.collider.get());
    expect(hits[0].distance).toBe(75);
    expect(hits[0].point).toEqual(ex.vec(75, 0));
  });

  it('can rayCast with searchAllColliders on, all hits is returned, searches all groups', () => {
    const sut = new ex.DynamicTreeCollisionProcessor({
      ...getDefaultPhysicsConfig()
    });
    const actor1 = new ex.Actor({ x: 100, y: 0, width: 50, height: 50 });
    sut.track(actor1.collider.get());
    const actor2 = new ex.Actor({ x: 200, y: 0, width: 50, height: 50 });
    sut.track(actor2.collider.get());

    const ray = new ex.Ray(ex.vec(0, 0), ex.Vector.Right);
    const hits = sut.rayCast(ray, {
      searchAllColliders: true
    });

    expect(hits.length).toBe(2);
    expect(hits[0].body).toEqual(actor1.body);
    expect(hits[0].collider).toEqual(actor1.collider.get());
    expect(hits[0].distance).toBe(75);
    expect(hits[0].point).toEqual(ex.vec(75, 0));

    expect(hits[1].body).toEqual(actor2.body);
    expect(hits[1].collider).toEqual(actor2.collider.get());
    expect(hits[1].distance).toBe(175);
    expect(hits[1].point).toEqual(ex.vec(175, 0));
  });

  it('can rayCast with searchAllColliders on & collision group on, only specified group is returned', () => {
    ex.CollisionGroupManager.reset();
    const sut = new ex.DynamicTreeCollisionProcessor({
      ...getDefaultPhysicsConfig()
    });
    const collisionGroup1 = ex.CollisionGroupManager.create('somegroup1');
    const collisionGroup2 = ex.CollisionGroupManager.create('somegroup2');
    const actor1 = new ex.Actor({ x: 100, y: 0, width: 50, height: 50, collisionGroup: collisionGroup1 });
    sut.track(actor1.collider.get());
    const actor2 = new ex.Actor({ x: 200, y: 0, width: 50, height: 50, collisionGroup: collisionGroup2 });
    sut.track(actor2.collider.get());

    const ray = new ex.Ray(ex.vec(0, 0), ex.Vector.Right);
    const hits = sut.rayCast(ray, {
      searchAllColliders: true,
      collisionGroup: collisionGroup1
    });

    expect(hits.length).toBe(1);
    expect(hits[0].body).toEqual(actor1.body);
    expect(hits[0].collider).toEqual(actor1.collider.get());
    expect(hits[0].distance).toBe(75);
    expect(hits[0].point).toEqual(ex.vec(75, 0));
  });

  it('can rayCast with searchAllColliders on with actors that have collision groups are searched', () => {
    ex.CollisionGroupManager.reset();
    const sut = new ex.DynamicTreeCollisionProcessor({
      ...getDefaultPhysicsConfig()
    });
    const collisionGroup1 = ex.CollisionGroupManager.create('somegroup1');
    const collisionGroup2 = ex.CollisionGroupManager.create('somegroup2');
    const actor1 = new ex.Actor({ x: 100, y: 0, width: 50, height: 50, collisionGroup: collisionGroup1 });
    sut.track(actor1.collider.get());
    const actor2 = new ex.Actor({ x: 200, y: 0, width: 50, height: 50, collisionGroup: collisionGroup2 });
    sut.track(actor2.collider.get());

    const ray = new ex.Ray(ex.vec(0, 0), ex.Vector.Right);
    const hits = sut.rayCast(ray, {
      searchAllColliders: true
    });

    expect(hits.length).toBe(2);
    expect(hits[0].body).toEqual(actor1.body);
    expect(hits[0].collider).toEqual(actor1.collider.get());
    expect(hits[0].distance).toBe(75);
    expect(hits[0].point).toEqual(ex.vec(75, 0));

    expect(hits[1].body).toEqual(actor2.body);
    expect(hits[1].collider).toEqual(actor2.collider.get());
    expect(hits[1].distance).toBe(175);
    expect(hits[1].point).toEqual(ex.vec(175, 0));
  });

  it('can rayCast with searchAllColliders on and max distance set, returns 1 hit', () => {
    const sut = new ex.DynamicTreeCollisionProcessor({
      ...getDefaultPhysicsConfig()
    });
    const actor1 = new ex.Actor({ x: 100, y: 0, width: 50, height: 50 });
    sut.track(actor1.collider.get());
    const actor2 = new ex.Actor({ x: 200, y: 0, width: 50, height: 50 });
    sut.track(actor2.collider.get());

    const ray = new ex.Ray(ex.vec(0, 0), ex.Vector.Right);
    const hits = sut.rayCast(ray, {
      searchAllColliders: true,
      maxDistance: 100
    });

    expect(hits.length).toBe(1);
    expect(hits[0].body).toEqual(actor1.body);
    expect(hits[0].collider).toEqual(actor1.collider.get());
    expect(hits[0].distance).toBe(75);
    expect(hits[0].point).toEqual(ex.vec(75, 0));
  });

  it('can rayCast with ignoreCollisionGroupAll, returns 1 hit', () => {
    const sut = new ex.DynamicTreeCollisionProcessor({
      ...getDefaultPhysicsConfig()
    });
    const actor1 = new ex.Actor({ x: 100, y: 0, width: 50, height: 50 });
    sut.track(actor1.collider.get());
    const actor2 = new ex.Actor({ x: 200, y: 0, width: 50, height: 50 });
    sut.track(actor2.collider.get());
    const actor3 = new ex.Actor({ x: 300, y: 0, width: 50, height: 50, collisionGroup: new ex.CollisionGroup('test', 0b1, ~0b1) });
    sut.track(actor3.collider.get());

    const ray = new ex.Ray(ex.vec(0, 0), ex.Vector.Right);
    const hits = sut.rayCast(ray, {
      searchAllColliders: true,
      collisionMask: 0b1,
      ignoreCollisionGroupAll: true
    });

    expect(hits.length).toBe(1);
    expect(hits[0].body).toEqual(actor3.body);
    expect(hits[0].collider).toEqual(actor3.collider.get());
    expect(hits[0].distance).toBe(275);
    expect(hits[0].point).toEqual(ex.vec(275, 0));
  });

  it('can rayCast with filter, returns 1 hit', () => {
    const sut = new ex.DynamicTreeCollisionProcessor({
      ...getDefaultPhysicsConfig()
    });
    const actor1 = new ex.Actor({ x: 100, y: 0, width: 50, height: 50 });
    sut.track(actor1.collider.get());
    const actor2 = new ex.Actor({ x: 200, y: 0, width: 50, height: 50 });
    sut.track(actor2.collider.get());
    const actor3 = new ex.Actor({ x: 300, y: 0, width: 50, height: 50, collisionGroup: new ex.CollisionGroup('test', 0b1, ~0b1) });
    sut.track(actor3.collider.get());

    const ray = new ex.Ray(ex.vec(0, 0), ex.Vector.Right);
    const hits = sut.rayCast(ray, {
      searchAllColliders: true,
      filter: (hit) => {
        return hit.body.group.name === 'test';
      }
    });

    expect(hits.length).toBe(1);
    expect(hits[0].body).toEqual(actor3.body);
    expect(hits[0].collider).toEqual(actor3.collider.get());
    expect(hits[0].distance).toBe(275);
    expect(hits[0].point).toEqual(ex.vec(275, 0));
  });

  it('exposes tracked colliders via getColliders', () => {
    const dt = new ex.DynamicTreeCollisionProcessor(getDefaultPhysicsConfig());
    dt.track(actorA.collider.get());
    dt.track(actorB.collider.get());

    expect(dt.getColliders()).toEqual([actorA.collider.get(), actorB.collider.get()]);
  });

  it('can query by point', () => {
    const dt = new ex.DynamicTreeCollisionProcessor(getDefaultPhysicsConfig());
    dt.track(actorA.collider.get());
    dt.track(actorB.collider.get());
    dt.track(actorC.collider.get());

    const results = dt.query(ex.vec(0, 0));
    expect(results).toEqual([actorA.collider.get()]);
  });

  it('can query by bounds', () => {
    const dt = new ex.DynamicTreeCollisionProcessor(getDefaultPhysicsConfig());
    dt.track(actorA.collider.get());
    dt.track(actorB.collider.get());
    dt.track(actorC.collider.get());

    const results = dt.query(new ex.BoundingBox(-15, -15, 35, 15));
    expect(results.length).toBe(2);
    expect(results).toEqual(expect.arrayContaining([actorA.collider.get(), actorB.collider.get()]));
  });

  it('warns and no-ops tracking a null collider', () => {
    const dt = new ex.DynamicTreeCollisionProcessor(getDefaultPhysicsConfig());
    const logger = ex.Logger.getInstance();
    vi.spyOn(logger, 'warn');

    dt.track(null as any);

    expect(logger.warn).toHaveBeenCalledWith('Cannot track null collider');
    expect(dt.getColliders()).toEqual([]);
  });

  it('warns and no-ops untracking a null collider', () => {
    const dt = new ex.DynamicTreeCollisionProcessor(getDefaultPhysicsConfig());
    const logger = ex.Logger.getInstance();
    vi.spyOn(logger, 'warn');

    dt.untrack(null as any);

    expect(logger.warn).toHaveBeenCalledWith('Cannot untrack a null collider');
  });

  it('can untrack a collider', () => {
    const dt = new ex.DynamicTreeCollisionProcessor(getDefaultPhysicsConfig());
    dt.track(actorA.collider.get());
    dt.track(actorB.collider.get());
    expect(dt.getColliders().length).toBe(2);

    expect(dt.query(ex.vec(0, 0))).toEqual([actorA.collider.get()]);

    dt.untrack(actorA.collider.get());

    expect(dt.getColliders()).toEqual([actorB.collider.get()]);
    // actorA's own position (0,0) is outside actorB's bounds (centered at 20,0),
    // so the tree should no longer report anything there once actorA is untracked
    expect(dt.query(ex.vec(0, 0))).toEqual([]);
  });

  it('can untrack a composite collider, removing every sub-collider', () => {
    const circle = ex.Shape.Circle(50);
    const box = ex.Shape.Box(200, 10);
    const compCollider = new ex.CompositeCollider([circle, box]);
    const actor = new ex.Actor({ collider: compCollider });
    const dt = new ex.DynamicTreeCollisionProcessor(getDefaultPhysicsConfig());
    dt.track(compCollider);
    expect(dt.getColliders().length).toBe(2);

    dt.untrack(compCollider);

    expect(dt.getColliders()).toEqual([]);
  });

  it('applies narrowphase to collision pairs and returns actual contacts', () => {
    const overlapping = new ex.Actor({ x: 0, y: 0, radius: 10, collisionType: ex.CollisionType.Active });
    const overlapping2 = new ex.Actor({ x: 15, y: 0, radius: 10, collisionType: ex.CollisionType.Active });
    const dt = new ex.DynamicTreeCollisionProcessor(getDefaultPhysicsConfig());
    dt.track(overlapping.collider.get());
    dt.track(overlapping2.collider.get());

    const pairs = dt.broadphase([overlapping.collider.get(), overlapping2.collider.get()], 100);
    expect(pairs.length).toBe(1);

    const contacts = dt.narrowphase(pairs);
    expect(contacts.length).toBe(1);
  });

  it('narrowphase returns no contacts for non-overlapping pairs', () => {
    const dt = new ex.DynamicTreeCollisionProcessor(getDefaultPhysicsConfig());
    dt.track(actorA.collider.get());
    dt.track(actorC.collider.get());

    const contacts = dt.narrowphase([new ex.Pair(actorA.collider.get(), actorC.collider.get())]);
    expect(contacts).toEqual([]);
  });

  it('update() reports how many tracked colliders actually moved', () => {
    const dt = new ex.DynamicTreeCollisionProcessor(getDefaultPhysicsConfig());
    dt.track(actorA.collider.get());
    dt.track(actorB.collider.get());

    // no movement yet
    expect(dt.update([actorA.collider.get(), actorB.collider.get()])).toBe(0);

    actorA.pos = ex.vec(500, 500);
    actorA.collider.update();

    expect(dt.update([actorA.collider.get(), actorB.collider.get()])).toBe(1);
  });

  it('debug delegates to the underlying dynamic tree without throwing', () => {
    const dt = new ex.DynamicTreeCollisionProcessor(getDefaultPhysicsConfig());
    dt.track(actorA.collider.get());
    const engine = TestUtils.engine({ width: 100, height: 100 });

    expect(() => dt.debug(engine.graphicsContext)).not.toThrow();

    engine.dispose();
  });

  it('catches a fast moving object via continuous collision detection and repositions it on contact', () => {
    const dt = new ex.DynamicTreeCollisionProcessor(getDefaultPhysicsConfig());
    const stationary = new ex.Actor({ x: 200, y: 0, radius: 10, collisionType: ex.CollisionType.Active });
    const fast = new ex.Actor({ x: 0, y: 0, radius: 10, collisionType: ex.CollisionType.Active });
    fast.body.vel = ex.vec(5000, 0);

    dt.track(stationary.collider.get());
    dt.track(fast.collider.get());

    const stats = { physics: { pairs: 0, fastBodies: 0, fastBodyCollisions: 0, contacts: new Map(), collisions: 0 } } as any;
    // naive integration (uncaught) would put the fast body at 5000 * (100/1000) = 500,
    // tunneling straight through the stationary collider at x=200
    const naiveTunneledPosition = 500;

    dt.broadphase([stationary.collider.get(), fast.collider.get()], 100, stats);

    expect(stats.physics.fastBodies).toBe(1);
    expect(stats.physics.fastBodyCollisions).toBe(1);
    // continuous collision detection should have caught it and pulled it back to
    // somewhere near the stationary collider's surface, short of tunneling through
    expect(fast.body.globalPos.x).toBeGreaterThan(0);
    expect(fast.body.globalPos.x).toBeLessThan(naiveTunneledPosition);
  });

  it('can rayCast with filter and search all colliders false, returns 1 hit', () => {
    const sut = new ex.DynamicTreeCollisionProcessor({
      ...getDefaultPhysicsConfig()
    });
    const actor1 = new ex.Actor({ x: 100, y: 0, width: 50, height: 50 });
    sut.track(actor1.collider.get());
    const actor2 = new ex.Actor({ x: 200, y: 0, width: 50, height: 50 });
    sut.track(actor2.collider.get());
    const actor3 = new ex.Actor({ x: 300, y: 0, width: 50, height: 50, collisionGroup: new ex.CollisionGroup('test', 0b1, ~0b1) });
    sut.track(actor3.collider.get());

    const ray = new ex.Ray(ex.vec(0, 0), ex.Vector.Right);
    const hits = sut.rayCast(ray, {
      searchAllColliders: false,
      filter: (hit) => {
        return hit.body.group.name === 'test';
      }
    });

    expect(hits.length).toBe(1);
    expect(hits[0].body).toEqual(actor3.body);
    expect(hits[0].collider).toEqual(actor3.collider.get());
    expect(hits[0].distance).toBe(275);
    expect(hits[0].point).toEqual(ex.vec(275, 0));
  });
});
