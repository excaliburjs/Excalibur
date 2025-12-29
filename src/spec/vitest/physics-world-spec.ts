import * as ex from '@excalibur';
import { TestUtils } from '../__util__/test-utils';

describe('A physics world', () => {
  beforeEach(() => {
    ex.CollisionGroupManager.reset();
  });
  it('exists', () => {
    expect(ex.PhysicsWorld).toBeDefined();
  });

  it('can rayCast with default options, only 1 hit is returned, searches all groups', () => {
    const sut = TestUtils.engine();
    const actor1 = new ex.Actor({ x: 100, y: 0, width: 50, height: 50 });
    sut.currentScene.add(actor1);
    const actor2 = new ex.Actor({ x: 200, y: 0, width: 50, height: 50 });
    sut.currentScene.add(actor2);

    const ray = new ex.Ray(ex.vec(0, 0), ex.Vector.Right);
    const hits = sut.currentScene.physics.rayCast(ray);

    expect(hits.length).toBe(1);
    expect(hits[0].body).toEqual(actor1.body);
    expect(hits[0].collider).toEqual(actor1.collider.get());
    expect(hits[0].distance).toBe(75);
    expect(hits[0].point).toEqual(ex.vec(75, 0));
    sut.dispose();
  });

  it('can rayCast with searchAllColliders on, all hits is returned, searches all groups', () => {
    const sut = TestUtils.engine();
    const actor1 = new ex.Actor({ x: 100, y: 0, width: 50, height: 50 });
    sut.currentScene.add(actor1);
    const actor2 = new ex.Actor({ x: 200, y: 0, width: 50, height: 50 });
    sut.currentScene.add(actor2);

    const ray = new ex.Ray(ex.vec(0, 0), ex.Vector.Right);
    const hits = sut.currentScene.physics.rayCast(ray, {
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
    sut.dispose();
  });

  it('can rayCast with searchAllColliders on & collision group on, only specified group is returned', () => {
    const sut = TestUtils.engine();
    const collisionGroup1 = ex.CollisionGroupManager.create('somegroup1');
    const collisionGroup2 = ex.CollisionGroupManager.create('somegroup2');
    const actor1 = new ex.Actor({ x: 100, y: 0, width: 50, height: 50, collisionGroup: collisionGroup1 });
    sut.currentScene.add(actor1);
    const actor2 = new ex.Actor({ x: 200, y: 0, width: 50, height: 50, collisionGroup: collisionGroup2 });
    sut.currentScene.add(actor2);

    const ray = new ex.Ray(ex.vec(0, 0), ex.Vector.Right);
    const hits = sut.currentScene.physics.rayCast(ray, {
      searchAllColliders: true,
      collisionGroup: collisionGroup1
    });

    expect(hits.length).toBe(1);
    expect(hits[0].body).toEqual(actor1.body);
    expect(hits[0].collider).toEqual(actor1.collider.get());
    expect(hits[0].distance).toBe(75);
    expect(hits[0].point).toEqual(ex.vec(75, 0));
    sut.dispose();
  });

  it('can rayCast with searchAllColliders on with actors that have collision groups are searched', () => {
    const sut = TestUtils.engine();
    const collisionGroup1 = ex.CollisionGroupManager.create('somegroup1');
    const collisionGroup2 = ex.CollisionGroupManager.create('somegroup2');
    const actor1 = new ex.Actor({ x: 100, y: 0, width: 50, height: 50, collisionGroup: collisionGroup1 });
    sut.currentScene.add(actor1);
    const actor2 = new ex.Actor({ x: 200, y: 0, width: 50, height: 50, collisionGroup: collisionGroup2 });
    sut.currentScene.add(actor2);

    const ray = new ex.Ray(ex.vec(0, 0), ex.Vector.Right);
    const hits = sut.currentScene.physics.rayCast(ray, {
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
    sut.dispose();
  });

  it('can rayCast with searchAllColliders on and max distance set, returns 1 hit', () => {
    const sut = TestUtils.engine();
    const actor1 = new ex.Actor({ x: 100, y: 0, width: 50, height: 50 });
    sut.currentScene.add(actor1);
    const actor2 = new ex.Actor({ x: 200, y: 0, width: 50, height: 50 });
    sut.currentScene.add(actor2);

    const ray = new ex.Ray(ex.vec(0, 0), ex.Vector.Right);
    const hits = sut.currentScene.physics.rayCast(ray, {
      searchAllColliders: true,
      maxDistance: 100
    });

    expect(hits.length).toBe(1);
    expect(hits[0].body).toEqual(actor1.body);
    expect(hits[0].collider).toEqual(actor1.collider.get());
    expect(hits[0].distance).toBe(75);
    expect(hits[0].point).toEqual(ex.vec(75, 0));
    sut.dispose();
  });

  it('can rayCast with ignoreCollisionGroupAll, returns 1 hit', () => {
    const sut = TestUtils.engine();
    const actor1 = new ex.Actor({ x: 100, y: 0, width: 50, height: 50 });
    sut.currentScene.add(actor1);
    const actor2 = new ex.Actor({ x: 200, y: 0, width: 50, height: 50 });
    sut.currentScene.add(actor2);
    const actor3 = new ex.Actor({ x: 300, y: 0, width: 50, height: 50, collisionGroup: new ex.CollisionGroup('test', 0b1, ~0b1) });
    sut.currentScene.add(actor3);

    const ray = new ex.Ray(ex.vec(0, 0), ex.Vector.Right);
    const hits = sut.currentScene.physics.rayCast(ray, {
      searchAllColliders: true,
      collisionMask: 0b1,
      ignoreCollisionGroupAll: true
    });

    expect(hits.length).toBe(1);
    expect(hits[0].body).toEqual(actor3.body);
    expect(hits[0].collider).toEqual(actor3.collider.get());
    expect(hits[0].distance).toBe(275);
    expect(hits[0].point).toEqual(ex.vec(275, 0));
    sut.dispose();
  });

  it('can rayCast with filter, returns 1 hit', () => {
    const sut = TestUtils.engine();
    const actor1 = new ex.Actor({ x: 100, y: 0, width: 50, height: 50 });
    sut.currentScene.add(actor1);
    const actor2 = new ex.Actor({ x: 200, y: 0, width: 50, height: 50 });
    sut.currentScene.add(actor2);
    const actor3 = new ex.Actor({ x: 300, y: 0, width: 50, height: 50, collisionGroup: new ex.CollisionGroup('test', 0b1, ~0b1) });
    sut.currentScene.add(actor3);

    const ray = new ex.Ray(ex.vec(0, 0), ex.Vector.Right);
    const hits = sut.currentScene.physics.rayCast(ray, {
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
    sut.dispose();
  });

  it('can rayCast with filter and search all colliders false, returns 1 hit', () => {
    const sut = TestUtils.engine();
    const actor1 = new ex.Actor({ x: 100, y: 0, width: 50, height: 50 });
    sut.currentScene.add(actor1);
    const actor2 = new ex.Actor({ x: 200, y: 0, width: 50, height: 50 });
    sut.currentScene.add(actor2);
    const actor3 = new ex.Actor({ x: 300, y: 0, width: 50, height: 50, collisionGroup: new ex.CollisionGroup('test', 0b1, ~0b1) });
    sut.currentScene.add(actor3);

    const ray = new ex.Ray(ex.vec(0, 0), ex.Vector.Right);
    const hits = sut.currentScene.physics.rayCast(ray, {
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
    sut.dispose();
  });
});
