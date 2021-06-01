import * as ex from '@excalibur';

describe('A DynamicTree Broadphase', () => {
  let actorA: ex.Actor;
  let actorB: ex.Actor;
  let actorC: ex.Actor;

  beforeEach(() => {
    actorA = new ex.Actor({x: 0, y: 0, width: 20, height: 20});
    actorA.body.useCircleCollider(10);
    actorA.body.collisionType = ex.CollisionType.Active;
    actorA.body.update();

    actorB = new ex.Actor({x: 20, y: 0, width: 20, height: 20});
    actorB.body.useCircleCollider(10);
    actorB.body.collisionType = ex.CollisionType.Active;
    actorB.body.update();

    actorC = new ex.Actor({x: 1000, y: 0, width: 20, height: 20});
    actorC.body.useCircleCollider(10);
    actorC.body.collisionType = ex.CollisionType.Active;
    actorC.body.update();
  });

  it('exists', () => {
    expect(ex.DynamicTreeCollisionProcessor).toBeDefined();
  });

  it('can be constructed', () => {
    const dt = new ex.DynamicTreeCollisionProcessor();

    expect(dt).not.toBe(null);
  });

  it('can find collision pairs for actors that are potentially colliding', () => {
    const dt = new ex.DynamicTreeCollisionProcessor();
    dt.track(actorA.body.getColliders()[0]);
    dt.track(actorB.body.getColliders()[0]);
    dt.track(actorC.body.getColliders()[0]);

    // only should be 1 pair since C is very far away
    const pairs = dt.broadphase([actorA.body.getColliders()[0], actorB.body.getColliders()[0], actorC.body.getColliders()[0]], 100);

    expect(pairs.length).toBe(1);
  });
});
