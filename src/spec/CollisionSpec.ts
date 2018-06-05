/// <reference path="Mocks.ts" />

describe('A Collision', () => {
  var actor1: ex.Actor = null;
  var actor2: ex.Actor = null;
  var scene: ex.Scene = null;
  var engine: ex.Engine = null;
  var mock = new Mocks.Mocker();
  var loop: Mocks.IGameLoop;

  beforeEach(() => {
    engine = TestUtils.engine({ width: 600, height: 400 });
    loop = mock.loop(engine);

    actor1 = new ex.Actor(0, 0, 10, 10);
    actor2 = new ex.Actor(5, 5, 10, 10);
    actor1.collisionType = ex.CollisionType.Active;
    actor2.collisionType = ex.CollisionType.Active;

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
    var actor1Collision = 0;
    var actor2Collision = 0;
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

  it('should only trigger one collision event per actor when an Active and Passive collide', () => {
    var actor1Collision = 0;
    var actor2Collision = 0;
    actor1.on('precollision', (e: ex.PreCollisionEvent) => {
      e.other.kill();
      actor1Collision++;
    });

    actor2.on('precollision', (e: ex.PreCollisionEvent) => {
      actor2Collision++;
    });

    actor2.collisionType = ex.CollisionType.Passive;

    for (let i = 0; i < 50; i++) {
      loop.advance(100);
    }

    expect(actor1Collision).toBe(1);
    expect(actor2Collision).toBe(1);
  });

  it('should not trigger when an actor is killed', () => {
    var actor1Collision = 0;
    var actor2Collision = 0;
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
    var touching = false;
    actor1.on('postupdate', function() {
      if (actor1.body.touching(actor2)) {
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

    var activeBlock = new ex.Actor(200, 200, 50, 50, ex.Color.Red.clone());
    activeBlock.collisionType = ex.CollisionType.Active;
    activeBlock.vel.x = 100;
    engine.add(activeBlock);

    var passiveBlock = new ex.Actor(400, 200, 50, 50, ex.Color.DarkGray.clone());
    passiveBlock.collisionType = ex.CollisionType.Passive;
    passiveBlock.vel.x = -100;
    engine.add(passiveBlock);

    let collisionHandler = (ev: ex.PreCollisionEvent) => {
      engine.add(
        new ex.Timer(
          () => {
            expect(activeBlock.vel.x).toBeGreaterThan(0);
            expect(passiveBlock.vel.x).toBeLessThan(0);
            done();
          },
          30,
          false
        )
      );
    };

    activeBlock.once('precollision', collisionHandler);

    for (let i = 0; i < 20; i++) {
      loop.advance(1000);
    }
  });

  it('should emit a start collision once when objects start colliding', () => {
    ex.Physics.collisionResolutionStrategy = ex.CollisionResolutionStrategy.RigidBody;

    var activeBlock = new ex.Actor(200, 200, 50, 50, ex.Color.Red.clone());
    activeBlock.collisionType = ex.CollisionType.Active;
    activeBlock.vel.x = 100;
    engine.add(activeBlock);

    var passiveBlock = new ex.Actor(400, 200, 50, 50, ex.Color.DarkGray.clone());
    passiveBlock.collisionType = ex.CollisionType.Passive;
    passiveBlock.vel.x = -100;
    engine.add(passiveBlock);

    let count = 0;

    let collisionStart = () => {
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

    var activeBlock = new ex.Actor(200, 200, 50, 50, ex.Color.Red.clone());
    activeBlock.collisionType = ex.CollisionType.Active;
    activeBlock.vel.x = 100;
    engine.add(activeBlock);

    var passiveBlock = new ex.Actor(400, 200, 50, 50, ex.Color.DarkGray.clone());
    passiveBlock.collisionType = ex.CollisionType.Passive;
    passiveBlock.vel.x = -100;
    engine.add(passiveBlock);

    let count = 0;

    let collisionEnd = () => {
      count++;
    };

    activeBlock.on('collisionend', collisionEnd);

    for (let i = 0; i < 20; i++) {
      loop.advance(1000);
    }

    expect(count).toBe(1);
  });

  it('should have the actor as the handler context for collisionstart', (done) => {
    ex.Physics.collisionResolutionStrategy = ex.CollisionResolutionStrategy.RigidBody;

    var activeBlock = new ex.Actor(200, 200, 50, 50, ex.Color.Red.clone());
    activeBlock.collisionType = ex.CollisionType.Active;
    activeBlock.vel.x = 100;
    engine.add(activeBlock);

    var passiveBlock = new ex.Actor(400, 200, 50, 50, ex.Color.DarkGray.clone());
    passiveBlock.collisionType = ex.CollisionType.Passive;
    passiveBlock.vel.x = -100;
    engine.add(passiveBlock);

    let collisionEnd = function() {
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

    var activeBlock = new ex.Actor(200, 200, 50, 50, ex.Color.Red.clone());
    activeBlock.collisionType = ex.CollisionType.Active;
    activeBlock.vel.x = 100;
    engine.add(activeBlock);

    var passiveBlock = new ex.Actor(400, 200, 50, 50, ex.Color.DarkGray.clone());
    passiveBlock.collisionType = ex.CollisionType.Passive;
    passiveBlock.vel.x = -100;
    engine.add(passiveBlock);

    let collisionEnd = function() {
      expect(this).toBe(activeBlock);
      done();
    };

    activeBlock.on('collisionend', collisionEnd);

    for (let i = 0; i < 20; i++) {
      loop.advance(1000);
    }
  });
});
