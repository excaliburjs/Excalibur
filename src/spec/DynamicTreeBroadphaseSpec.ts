import * as ex from '../../build/dist/excalibur';

describe('A DynamicTree Broadphase', () => {
  let actorA: ex.Actor;
  let actorB: ex.Actor;
  let actorC: ex.Actor;

  beforeEach(() => {
    actorA = new ex.Actor(0, 0, 20, 20);
    actorA.collisionType = ex.CollisionType.Active;
    actorA.collisionArea = new ex.CircleArea({
      radius: 10,
      body: actorA.body
    });

    actorB = new ex.Actor(20, 0, 20, 20);
    actorB.collisionType = ex.CollisionType.Active;

    actorB.collisionArea = new ex.CircleArea({
      radius: 10,
      body: actorB.body
    });

    actorC = new ex.Actor(1000, 0, 20, 20);
    actorC.collisionType = ex.CollisionType.Active;

    actorC.collisionArea = new ex.CircleArea({
      radius: 10,
      body: actorC.body
    });
  });

  it('exists', () => {
    expect(ex.DynamicTreeCollisionBroadphase).toBeDefined();
  });

  it('can be constructed', () => {
    const dt = new ex.DynamicTreeCollisionBroadphase();

    expect(dt).not.toBe(null);
  });

  it('can find collision pairs for actors that are potentially colliding', () => {
    const dt = new ex.DynamicTreeCollisionBroadphase();
    dt.track(actorA.body);
    dt.track(actorB.body);
    dt.track(actorC.body);

    // only should be 1 pair since C is very far away
    const pairs = dt.broadphase([actorA, actorB, actorC], 100);

    expect(pairs.length).toBe(1);
  });
});
