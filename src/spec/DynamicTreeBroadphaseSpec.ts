import * as ex from '@excalibur';

describe('A DynamicTree Broadphase', () => {
  let actorA: ex.Actor;
  let actorB: ex.Actor;
  let actorC: ex.Actor;

  beforeEach(() => {
    actorA = new ex.Actor({x: 0, y: 0, width: 20, height: 20});
    actorA.collider.useCircleCollider(10);
    actorA.body.collisionType = ex.CollisionType.Active;
    actorA.collider.update();

    actorB = new ex.Actor({x: 20, y: 0, width: 20, height: 20});
    actorB.collider.useCircleCollider(10);
    actorB.body.collisionType = ex.CollisionType.Active;
    actorB.collider.update();

    actorC = new ex.Actor({x: 1000, y: 0, width: 20, height: 20});
    actorC.collider.useCircleCollider(10);
    actorC.body.collisionType = ex.CollisionType.Active;
    actorC.collider.update();
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
    dt.track(actorA.collider.collider);
    dt.track(actorB.collider.collider);
    dt.track(actorC.collider.collider);

    // only should be 1 pair since C is very far away
    const pairs = dt.broadphase([actorA.collider.collider, actorB.collider.collider, actorC.collider.collider], 100);

    expect(pairs.length).toBe(1);
  });
});
