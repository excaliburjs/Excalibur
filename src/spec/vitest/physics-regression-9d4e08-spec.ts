import * as ex from '@excalibur';
import { TestUtils } from './joint-fixtures-a14d9d';
import { getDefaultPhysicsConfig } from '../../engine/collision/physics-config';
import { buildContactIslands } from '../../engine/collision/island';

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

describe('A RealisticSolver', () => {
  it('should exist', () => {
    expect(ex.RealisticSolver).toBeDefined();
  });

  it('should cancel zero overlap collisions during presolve', () => {
    const realisticSolver = new ex.RealisticSolver(getDefaultPhysicsConfig().realistic);

    const player = new ex.Actor({
      x: 0,
      y: 0,
      width: 40,
      height: 40,
      collisionType: ex.CollisionType.Active,
      color: ex.Color.Red
    });

    const block = new ex.Actor({
      x: 40,
      y: 0,
      width: 40 + 0.00005,
      height: 40,
      collisionType: ex.CollisionType.Fixed,
      color: ex.Color.Green
    });

    const contact = new ex.CollisionContact(
      player.collider.get()!,
      block.collider.get()!,
      ex.Vector.Down,
      ex.Vector.Down,
      ex.Vector.Up.perpendicular(),
      [],
      [],
      null as any
    );

    contact.mtv = ex.vec(-0, 0);

    realisticSolver.preSolve([contact]);
    // Considers infinitesimally overlapping to no longer be overlapping and thus cancels the contact
    expect(contact.isCanceled()).toBe(true);
  });

  it('should run the configured number of position and velocity iterations without variable shadowing issues', () => {
    const config = { ...getDefaultPhysicsConfig().realistic, positionIterations: 3, velocityIterations: 4 };
    const realisticSolver = new ex.RealisticSolver(config);

    const actor1 = new ex.Actor({ x: 0, y: 0, width: 40, height: 40, collisionType: ex.CollisionType.Active });
    const actor2 = new ex.Actor({ x: 30, y: 0, width: 40, height: 40, collisionType: ex.CollisionType.Active });

    const contact = actor1.collider.collide(actor2.collider);

    // Should not throw and should complete successfully with multiple iterations
    realisticSolver.preSolve(contact);
    realisticSolver.solvePosition(contact);
    realisticSolver.solveVelocity(contact);
    realisticSolver.postSolve(contact);
  });

  it('should drop stale constraint points when a contact manifold shrinks', () => {
    const realisticSolver = new ex.RealisticSolver(getDefaultPhysicsConfig().realistic);

    // Two boxes overlapping face-on produce a 2 point manifold
    const bottom = new ex.Actor({ x: 0, y: 0, width: 40, height: 40, collisionType: ex.CollisionType.Active });
    const top = new ex.Actor({ x: 0, y: -35, width: 40, height: 40, collisionType: ex.CollisionType.Active });

    const twoPoint = bottom.collider.collide(top.collider);
    expect(twoPoint.length).toBe(1);
    expect(twoPoint[0].points.length).toBe(2);

    realisticSolver.preSolve(twoPoint);
    expect(realisticSolver.getContactConstraints(twoPoint[0].id).length).toBe(2);

    // Same contact id next frame, but the manifold shrank to a single point
    const onePoint = bottom.collider.collide(top.collider);
    onePoint[0].points = [onePoint[0].points[0]];
    onePoint[0].localPoints = [onePoint[0].localPoints[0]];

    realisticSolver.preSolve(onePoint);
    const constraints = realisticSolver.getContactConstraints(onePoint[0].id);
    expect(constraints.length).toBe(1);
    // The surviving point must be bound to the live contact, not the previous frame's
    expect(constraints[0].contact).toBe(onePoint[0]);

    // And an empty manifold leaves nothing to solve
    const noPoint = bottom.collider.collide(top.collider);
    noPoint[0].points = [];
    noPoint[0].localPoints = [];
    realisticSolver.preSolve(noPoint);
    expect(realisticSolver.getContactConstraints(noPoint[0].id).length).toBe(0);
  });

  it('does not solve contacts that touch a sleeping body', () => {
    const realisticSolver = new ex.RealisticSolver(getDefaultPhysicsConfig().realistic);

    const floor = new ex.Actor({ x: 0, y: 20, width: 200, height: 40, collisionType: ex.CollisionType.Fixed });
    const box = new ex.Actor({ x: 0, y: -18, width: 40, height: 40, collisionType: ex.CollisionType.Active });
    box.body.canSleep = true;
    floor.collider.update();
    box.collider.update();

    const solveOnce = () => {
      const contacts = box.collider.collide(floor.collider);
      expect(contacts.length).toBe(1);
      realisticSolver.preSolve(contacts);
      realisticSolver.solveVelocity(contacts);
      realisticSolver.solvePosition(contacts);
      realisticSolver.postSolve(contacts);
    };

    box.body.sleep();
    solveOnce();
    // a sleeping body is never integrated, so it must not receive impulses or corrections either
    expect(box.pos.y).toBe(-18);
    expect(box.vel.distance(ex.vec(0, 0))).toBeLessThanOrEqual(0.01);
    expect(box.body.angularVelocity).toBe(0);

    box.body.wake();
    solveOnce();
    // once awake the overlap is corrected as usual
    expect(box.pos.y).toBeLessThan(-18);
  });
});

describe('A contact Island', () => {
  const makeStack = () => {
    const bottom = new ex.Actor({ x: 0, y: 0, width: 40, height: 40, collisionType: ex.CollisionType.Active });
    const top = new ex.Actor({ x: 0, y: -38, width: 40, height: 40, collisionType: ex.CollisionType.Active });
    bottom.body.canSleep = true;
    top.body.canSleep = true;
    bottom.collider.update();
    top.collider.update();
    // the motion system normally captures these before integrating, without them a body looks like it moved from the origin
    bottom.body.captureOldTransform();
    top.body.captureOldTransform();
    const contacts = bottom.collider.collide(top.collider);
    expect(contacts.length).toBe(1);
    return { bottom, top, contacts };
  };

  it('groups bodies connected through contacts', () => {
    const { bottom, top, contacts } = makeStack();
    const islands = buildContactIslands(getDefaultPhysicsConfig().bodies, [bottom.body, top.body], contacts);
    expect(islands.length).toBe(1);
    expect(islands[0].bodies).toContain(bottom.body);
    expect(islands[0].bodies).toContain(top.body);
  });

  it('wakes every body when the island is only partially asleep', () => {
    const { bottom, top, contacts } = makeStack();
    bottom.body.sleep();
    expect(bottom.body.isSleeping).toBe(true);
    expect(top.body.isSleeping).toBe(false);

    const [island] = buildContactIslands(getDefaultPhysicsConfig().bodies, [bottom.body, top.body], contacts);
    island.updateSleepState(16);

    expect(bottom.body.isSleeping).toBe(false);
    expect(top.body.isSleeping).toBe(false);
  });

  it('leaves a fully sleeping island asleep', () => {
    const { bottom, top, contacts } = makeStack();
    bottom.body.sleep();
    top.body.sleep();

    const [island] = buildContactIslands(getDefaultPhysicsConfig().bodies, [bottom.body, top.body], contacts);
    island.updateSleepState(16);

    expect(bottom.body.isSleeping).toBe(true);
    expect(top.body.isSleeping).toBe(true);
  });
});
