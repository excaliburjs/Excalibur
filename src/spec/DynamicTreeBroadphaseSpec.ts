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
    const compCollider = new ex.CompositeCollider([
      circle,
      box
    ]);
    const actor = new ex.Actor({collider: compCollider});
    const dt = new ex.DynamicTreeCollisionProcessor();
    dt.track(compCollider);

    const pairs = dt.broadphase([circle, box], 100);
    expect(pairs).toEqual([]);
  });

  it('should not find pairs for a composite collider when moving fast', () => {
    const circle = ex.Shape.Circle(50);
    const box = ex.Shape.Box(200, 10);
    const compCollider = new ex.CompositeCollider([
      circle,
      box
    ]);
    const actor = new ex.Actor({collider: compCollider, collisionType: ex.CollisionType.Active});
    actor.body.vel = ex.vec(2000, 0); // extra fast to trigger the fast object detection
    const dt = new ex.DynamicTreeCollisionProcessor();
    dt.track(compCollider);

    const pairs = dt.broadphase([circle, box], 100);
    expect(pairs).toEqual([]);
  });
});
