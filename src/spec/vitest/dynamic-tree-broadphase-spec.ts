import * as ex from '@excalibur';
import { getDefaultPhysicsConfig } from '../../engine/collision/physics-config';

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
