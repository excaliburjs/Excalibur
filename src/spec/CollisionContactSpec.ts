import * as ex from '@excalibur';

describe('A CollisionContact', () => {
  let actorA: ex.Actor;
  let actorB: ex.Actor;

  beforeEach(() => {
    actorA = new ex.Actor(0, 0, 20, 20);
    const colliderA = actorA.body.collider;
    colliderA.type = ex.CollisionType.Active;
    colliderA.shape = new ex.Circle({
      radius: 10,
      body: actorA.body
    });

    actorB = new ex.Actor(20, 0, 20, 20);
    const colliderB = actorB.body.collider;
    colliderB.type = ex.CollisionType.Active;

    colliderB.shape = new ex.Circle({
      radius: 10,
      body: actorB.body
    });
  });

  it('exists', () => {
    expect(ex.CollisionContact).toBeDefined();
  });

  it('can be created', () => {
    const cc = new ex.CollisionContact(
      actorA.body.collider,
      actorB.body.collider,
      ex.Vector.Zero.clone(),
      new ex.Vector(10, 0),
      ex.Vector.Right.clone()
    );
    expect(cc).not.toBe(null);
  });

  it('can reslove in the Box system', () => {
    actorB.pos.x = 19;
    const cc = new ex.CollisionContact(
      actorA.body.collider,
      actorB.body.collider,
      ex.Vector.Right.clone(),
      new ex.Vector(10, 0),
      ex.Vector.Right.clone()
    );
    cc.resolve(ex.CollisionResolutionStrategy.Box);

    expect(actorA.pos.x).toBe(-0.5);
    expect(actorA.pos.y).toBe(0);

    expect(actorB.pos.x).toBe(19.5);
    expect(actorB.pos.y).toBe(0);
  });

  it('emits a collision event on both in the Box system', () => {
    let emittedA = false;
    let emittedB = false;

    actorA.on('precollision', () => {
      emittedA = true;
    });

    actorB.on('precollision', () => {
      emittedB = true;
    });

    actorB.pos.x = 19;
    const cc = new ex.CollisionContact(
      actorA.body.collider,
      actorB.body.collider,
      ex.Vector.Right.clone(),
      new ex.Vector(10, 0),
      ex.Vector.Right.clone()
    );
    cc.resolve(ex.CollisionResolutionStrategy.Box);

    expect(emittedA).toBe(true);
    expect(emittedB).toBe(true);
  });

  it('can reslove in the Dynamic system', () => {
    expect(actorA.pos.x).toBe(0, 'Actor A should be y=10');
    expect(actorA.pos.y).toBe(0, 'Actor A should be y=0');
    expect(actorB.pos.x).toBe(20, 'Actor B should be x=20');
    expect(actorB.pos.y).toBe(0, 'Actor B should be y=0');
    expect(actorA.vel.x).toBe(0, 'Actor A should not be moving in x');
    expect(actorB.vel.x).toBe(0, 'Actor B should not be moving in x');
    actorA.vel.x = 10;
    actorB.vel.x = -10;
    actorB.pos.x = 19;
    actorA.body.collider.shape.recalc();
    actorB.body.collider.shape.recalc();
    const cc = new ex.CollisionContact(
      actorA.body.collider,
      actorB.body.collider,
      ex.Vector.Right.clone(),
      new ex.Vector(10, 0),
      ex.Vector.Right.clone()
    );
    cc.resolve(ex.CollisionResolutionStrategy.RigidBody);

    // mtv's are cached and not applied until all pairs are resolved, so we need to call it manually here
    actorA.body.applyMtv();
    actorB.body.applyMtv();

    expect(actorA.pos.x).toBe(-0.5);
    expect(actorA.pos.y).toBe(0);
    expect(actorA.vel.x).toBeLessThan(0);
    expect(actorA.vel.y).toBe(0);

    expect(actorB.pos.x).toBe(19.5);
    expect(actorB.pos.y).toBe(0);
    expect(actorB.vel.x).toBeGreaterThan(0);
    expect(actorB.vel.y).toBe(0);
  });

  it('emits a collision event on both in the Dynamic system', () => {
    let emittedA = false;
    let emittedB = false;

    actorA.on('precollision', () => {
      emittedA = true;
    });

    actorB.on('precollision', () => {
      emittedB = true;
    });

    actorB.pos.x = 19;
    const cc = new ex.CollisionContact(
      actorA.body.collider,
      actorB.body.collider,
      ex.Vector.Right.clone(),
      new ex.Vector(10, 0),
      ex.Vector.Right.clone()
    );
    cc.resolve(ex.CollisionResolutionStrategy.RigidBody);

    expect(emittedA).toBe(true);
    expect(emittedB).toBe(true);
  });
});
