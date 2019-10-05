import * as ex from '../../build/dist/excalibur';
import { TestUtils } from './util/TestUtils';
import { Mocks } from './util/Mocks';

describe('A Collision', () => {
  let actor1: ex.Actor = null;
  let actor2: ex.Actor = null;
  const scene: ex.Scene = null;
  let engine: ex.Engine = null;
  const mock = new Mocks.Mocker();
  let loop: Mocks.GameLoopLike;

  beforeEach(() => {
    engine = TestUtils.engine({ width: 600, height: 400 });
    loop = mock.loop(engine);

    actor1 = new ex.Actor(0, 0, 10, 10);
    actor2 = new ex.Actor(5, 5, 10, 10);
    actor1.body.collider.type = ex.CollisionType.Active;
    actor2.body.collider.type = ex.CollisionType.Active;

    engine.start();
    engine.add(actor1);
    engine.add(actor2);
  });

  afterEach(() => {
    ex.Physics.collisionResolutionStrategy = ex.CollisionResolutionStrategy.Box;
    engine.stop();
    engine = null;
    actor1 = null;
    actor2 = null;
  });

  it('should throw one event for each actor participating', () => {
    let actor1Collision = 0;
    let actor2Collision = 0;
    actor1.on('precollision', (e: ex.PreCollisionEvent) => {
      e.other.kill();
      actor1Collision++;
    });

    actor2.on('precollision', (e: ex.PreCollisionEvent) => {
      actor2Collision++;
    });

    for (let i = 0; i < 50; i++) {
      loop.advance(100);
    }

    expect(actor1Collision).toBe(1);
    expect(actor2Collision).toBe(1);
  });

  it('order of actors collision should not matter when an Active and Active Collision', () => {
    const collisionTree = new ex.DynamicTreeCollisionBroadphase();

    actor1.body.collider.type = ex.CollisionType.Active;
    actor2.body.collider.type = ex.CollisionType.Active;
    collisionTree.track(actor1.body);
    collisionTree.track(actor2.body);

    let pairs = collisionTree.broadphase([actor1.body, actor2.body], 200);

    expect(pairs.length).toBe(1);

    pairs = collisionTree.broadphase([actor2.body, actor1.body], 200);

    expect(pairs.length).toBe(1);
  });

  it('order of actors collision should not matter when an Active and Passive Collision', () => {
    const collisionTree = new ex.DynamicTreeCollisionBroadphase();

    actor1.body.collider.type = ex.CollisionType.Active;
    actor2.body.collider.type = ex.CollisionType.Passive;
    collisionTree.track(actor1.body);
    collisionTree.track(actor2.body);

    let pairs = collisionTree.broadphase([actor1.body, actor2.body], 200);

    expect(pairs.length).toBe(1);

    pairs = collisionTree.broadphase([actor2.body, actor1.body], 200);

    expect(pairs.length).toBe(1);
  });

  it('order of actors collision should not matter when an Active and PreventCollision', () => {
    const collisionTree = new ex.DynamicTreeCollisionBroadphase();

    actor1.body.collider.type = ex.CollisionType.Active;
    actor2.body.collider.type = ex.CollisionType.PreventCollision;
    collisionTree.track(actor1.body);
    collisionTree.track(actor2.body);

    let pairs = collisionTree.broadphase([actor1.body, actor2.body], 200);

    expect(pairs.length).toBe(0);

    pairs = collisionTree.broadphase([actor2.body, actor1.body], 200);

    expect(pairs.length).toBe(0);
  });

  it('order of actors collision should not matter when an Active and Fixed', () => {
    const collisionTree = new ex.DynamicTreeCollisionBroadphase();

    actor1.body.collider.type = ex.CollisionType.Active;
    actor2.body.collider.type = ex.CollisionType.Fixed;
    collisionTree.track(actor1.body);
    collisionTree.track(actor2.body);

    let pairs = collisionTree.broadphase([actor1.body, actor2.body], 200);

    expect(pairs.length).toBe(1);

    pairs = collisionTree.broadphase([actor2.body, actor1.body], 200);

    expect(pairs.length).toBe(1);
  });

  it('order of actors collision should not matter when an Fixed and Fixed', () => {
    const collisionTree = new ex.DynamicTreeCollisionBroadphase();

    actor1.body.collider.type = ex.CollisionType.Fixed;
    actor2.body.collider.type = ex.CollisionType.Fixed;
    collisionTree.track(actor1.body);
    collisionTree.track(actor2.body);

    let pairs = collisionTree.broadphase([actor1.body, actor2.body], 200);

    expect(pairs.length).toBe(0);

    pairs = collisionTree.broadphase([actor2.body, actor1.body], 200);

    expect(pairs.length).toBe(0);
  });

  it('should only trigger one collision event per actor when an Active and Passive collide', () => {
    let actor1Collision = 0;
    let actor2Collision = 0;
    actor1.on('precollision', (e: ex.PreCollisionEvent) => {
      e.other.kill();
      actor1Collision++;
    });

    actor2.on('precollision', (e: ex.PreCollisionEvent) => {
      actor2Collision++;
    });

    actor2.body.collider.type = ex.CollisionType.Passive;

    for (let i = 0; i < 50; i++) {
      loop.advance(100);
    }

    expect(actor1Collision).toBe(1);
    expect(actor2Collision).toBe(1);
  });

  it('should not trigger when an actor is killed', () => {
    let actor1Collision = 0;
    let actor2Collision = 0;
    actor1.on('precollision', (e: ex.PreCollisionEvent) => {
      actor1Collision++;
    });

    actor2.on('precollision', (e: ex.PreCollisionEvent) => {
      actor2Collision++;
    });

    actor2.kill();

    for (let i = 0; i < 50; i++) {
      loop.advance(100);
    }

    expect(actor1Collision).toBe(0);
    expect(actor2Collision).toBe(0);
  });

  it('should recognize when actor bodies are touching', () => {
    let touching = false;
    actor1.on('postupdate', function() {
      if (actor1.body.collider.touching(actor2.body.collider)) {
        touching = true;
      }
    });

    for (let i = 0; i < 50; i++) {
      loop.advance(100);
    }

    expect(touching).toBe(true);
  });

  it('should not collide when active and passive', (done) => {
    ex.Physics.collisionResolutionStrategy = ex.CollisionResolutionStrategy.RigidBody;

    const activeBlock = new ex.Actor(200, 200, 50, 50, ex.Color.Red.clone());
    activeBlock.body.collider.type = ex.CollisionType.Active;
    activeBlock.vel.x = 100;
    engine.add(activeBlock);

    const passiveBlock = new ex.Actor(400, 200, 50, 50, ex.Color.DarkGray.clone());
    passiveBlock.body.collider.type = ex.CollisionType.Passive;
    passiveBlock.vel.x = -100;
    engine.add(passiveBlock);

    const collisionHandler = (ev: ex.PreCollisionEvent) => {
      engine.add(
        new ex.Timer(30, {
          fcn: () => {
            expect(activeBlock.vel.x).toBeGreaterThan(0);
            expect(passiveBlock.vel.x).toBeLessThan(0);
            done();
          },
          repeats: false
        })
      );
    };

    activeBlock.once('precollision', collisionHandler);

    for (let i = 0; i < 20; i++) {
      loop.advance(1000);
    }
  });

  it('should emit a start collision once when objects start colliding', () => {
    ex.Physics.collisionResolutionStrategy = ex.CollisionResolutionStrategy.RigidBody;

    const activeBlock = new ex.Actor(200, 200, 50, 50, ex.Color.Red.clone());
    activeBlock.body.collider.type = ex.CollisionType.Active;
    activeBlock.vel.x = 100;
    engine.add(activeBlock);

    const passiveBlock = new ex.Actor(400, 200, 50, 50, ex.Color.DarkGray.clone());
    passiveBlock.body.collider.type = ex.CollisionType.Passive;
    passiveBlock.vel.x = -100;
    engine.add(passiveBlock);

    let count = 0;

    const collisionStart = () => {
      count++;
    };

    activeBlock.on('collisionstart', collisionStart);

    for (let i = 0; i < 20; i++) {
      loop.advance(1000);
    }

    expect(count).toBe(1);
  });

  it('should emit a end collision once when objects stop colliding', () => {
    ex.Physics.collisionResolutionStrategy = ex.CollisionResolutionStrategy.RigidBody;

    const activeBlock = new ex.Actor(200, 200, 50, 50, ex.Color.Red.clone());
    activeBlock.body.collider.type = ex.CollisionType.Active;
    activeBlock.vel.x = 100;
    engine.add(activeBlock);

    const passiveBlock = new ex.Actor(400, 200, 50, 50, ex.Color.DarkGray.clone());
    passiveBlock.body.collider.type = ex.CollisionType.Passive;
    passiveBlock.vel.x = -100;
    engine.add(passiveBlock);

    let count = 0;

    const collisionEnd = () => {
      count++;
    };

    activeBlock.on('collisionend', collisionEnd);

    for (let i = 0; i < 20; i++) {
      loop.advance(1000);
    }

    expect(count).toBe(1);
  });

  it('should cancel out velocity when objects collide', () => {
    ex.Physics.collisionResolutionStrategy = ex.CollisionResolutionStrategy.Box;

    const activeBlock = new ex.Actor(200, 200, 50, 50, ex.Color.Red.clone());
    activeBlock.body.collider.type = ex.CollisionType.Active;
    activeBlock.vel.x = 100;
    engine.add(activeBlock);

    const fixedBlock = new ex.Actor(400, 200, 50, 50, ex.Color.DarkGray.clone());
    fixedBlock.body.collider.type = ex.CollisionType.Fixed;
    engine.add(fixedBlock);

    for (let i = 0; i < 20; i++) {
      loop.advance(1000);
    }

    expect(activeBlock.vel.x).toBe(0);
  });

  it('should not cancel out velocity when objects move away', () => {
    ex.Physics.collisionResolutionStrategy = ex.CollisionResolutionStrategy.Box;

    const activeBlock = new ex.Actor(350, 200, 50, 50, ex.Color.Red.clone());
    activeBlock.body.collider.type = ex.CollisionType.Active;
    engine.add(activeBlock);

    const fixedBlock = new ex.Actor(400, 200, 50, 50, ex.Color.DarkGray.clone());
    fixedBlock.body.collider.type = ex.CollisionType.Fixed;
    engine.add(fixedBlock);

    activeBlock.vel.x = -100;

    for (let i = 0; i < 20; i++) {
      loop.advance(1000);
    }

    expect(activeBlock.vel.x).toBe(-100);
  });

  it('should have the actor as the handler context for collisionstart', (done) => {
    ex.Physics.collisionResolutionStrategy = ex.CollisionResolutionStrategy.RigidBody;

    const activeBlock = new ex.Actor(200, 200, 50, 50, ex.Color.Red.clone());
    activeBlock.body.collider.type = ex.CollisionType.Active;
    activeBlock.vel.x = 100;
    engine.add(activeBlock);

    const passiveBlock = new ex.Actor(400, 200, 50, 50, ex.Color.DarkGray.clone());
    passiveBlock.body.collider.type = ex.CollisionType.Passive;
    passiveBlock.vel.x = -100;
    engine.add(passiveBlock);

    const collisionEnd = function() {
      expect(this).toBe(activeBlock);
      done();
    };

    activeBlock.on('collisionstart', collisionEnd);

    for (let i = 0; i < 20; i++) {
      loop.advance(1000);
    }
  });

  it('should have the actor as the handler context for collisionend', (done) => {
    ex.Physics.collisionResolutionStrategy = ex.CollisionResolutionStrategy.RigidBody;

    const activeBlock = new ex.Actor(200, 200, 50, 50, ex.Color.Red.clone());
    activeBlock.body.collider.type = ex.CollisionType.Active;
    activeBlock.vel.x = 100;
    engine.add(activeBlock);

    const passiveBlock = new ex.Actor(400, 200, 50, 50, ex.Color.DarkGray.clone());
    passiveBlock.body.collider.type = ex.CollisionType.Passive;
    passiveBlock.vel.x = -100;
    engine.add(passiveBlock);

    const collisionEnd = function() {
      expect(this).toBe(activeBlock);
      done();
    };

    activeBlock.on('collisionend', collisionEnd);

    for (let i = 0; i < 20; i++) {
      loop.advance(1000);
    }
  });
});
