import * as ex from '../../build/dist/excalibur';

describe('A DynamicTree Broadphase', () => {
  var actorA: ex.Actor;
  var actorB: ex.Actor;
  var actorC: ex.Actor;

  beforeEach(() => {
    actorA = new ex.Actor(0, 0, 20, 20);
    let colliderA = actorA.body.collider;
    colliderA.collisionType = ex.CollisionType.Active;
    colliderA.shape = new ex.Circle({
      radius: 10,
      body: actorA.body
    });

    actorB = new ex.Actor(20, 0, 20, 20);
    let colliderB = actorB.body.collider;
    colliderB.collisionType = ex.CollisionType.Active;

    colliderB.shape = new ex.Circle({
      radius: 10,
      body: actorB.body
    });

    actorC = new ex.Actor(1000, 0, 20, 20);
    let colliderC = actorC.body.collider;
    colliderC.collisionType = ex.CollisionType.Active;

    colliderC.shape = new ex.Circle({
      radius: 10,
      body: actorC.body
    });
  });

  it('exists', () => {
    expect(ex.DynamicTreeCollisionBroadphase).toBeDefined();
  });

  it('can be constructed', () => {
    var dt = new ex.DynamicTreeCollisionBroadphase();

    expect(dt).not.toBe(null);
  });

  it('can find collision pairs for actors that are potentially colliding', () => {
    var dt = new ex.DynamicTreeCollisionBroadphase();
    dt.track(actorA.body);
    dt.track(actorB.body);
    dt.track(actorC.body);

    // only should be 1 pair since C is very far away
    var pairs = dt.broadphase([actorA, actorB, actorC], 100);

    expect(pairs.length).toBe(1);
  });
});
