import * as ex from '@excalibur';
import { TestUtils } from '../__util__/test-utils';
import { getDefaultPhysicsConfig } from '../../engine/collision/physics-config';

describe('A Collision', () => {
  let actor1: ex.Actor = null;
  let actor2: ex.Actor = null;
  let engine: ex.Engine = null;
  let clock: ex.TestClock = null;

  beforeEach(async () => {
    engine = TestUtils.engine({
      width: 600,
      height: 400,
      physics: {
        solver: ex.SolverStrategy.Arcade
      }
    });
    clock = engine.clock = engine.clock.toTestClock();

    actor1 = new ex.Actor({ x: 0, y: 0, width: 10, height: 10 });
    actor2 = new ex.Actor({ x: 5, y: 5, width: 10, height: 10 });
    actor1.body.collisionType = ex.CollisionType.Active;
    actor2.body.collisionType = ex.CollisionType.Active;

    await engine.start();
    engine.add(actor1);
    engine.add(actor2);
  });

  afterEach(() => {
    engine.stop();
    engine.dispose();
    engine = null;
    actor1 = null;
    actor2 = null;
  });

  it('should throw one event for each actor participating', () => {
    let actor1Collision = 0;
    let actor2Collision = 0;
    actor1.on('precollision', (e: ex.PreCollisionEvent) => {
      e.other.owner.kill();
      actor1Collision++;
    });

    actor2.on('precollision', (e: ex.PreCollisionEvent) => {
      actor2Collision++;
    });

    clock.run(1, 100);

    expect(actor1Collision).toBe(1);
    expect(actor2Collision).toBe(1);
  });

  it('order of actors collision should not matter when an Active and Active Collision', () => {
    const collisionTree = new ex.DynamicTreeCollisionProcessor({
      ...getDefaultPhysicsConfig()
    });

    actor1.body.collisionType = ex.CollisionType.Active;
    actor2.body.collisionType = ex.CollisionType.Active;
    collisionTree.track(actor1.collider.get());
    collisionTree.track(actor2.collider.get());

    let pairs = collisionTree.broadphase([actor1.collider.get(), actor2.collider.get()], 16);

    expect(pairs.length).toBe(1);

    pairs = collisionTree.broadphase([actor2.collider.get(), actor1.collider.get()], 16);

    expect(pairs.length).toBe(1);
  });

  it('order of actors collision should not matter when an Active and Passive Collision', () => {
    const collisionTree = new ex.DynamicTreeCollisionProcessor({
      ...getDefaultPhysicsConfig()
    });

    actor1.body.collisionType = ex.CollisionType.Active;
    actor2.body.collisionType = ex.CollisionType.Passive;
    collisionTree.track(actor1.collider.get());
    collisionTree.track(actor2.collider.get());

    let pairs = collisionTree.broadphase([actor1.collider.get(), actor2.collider.get()], 200);

    expect(pairs.length).toBe(1);

    pairs = collisionTree.broadphase([actor2.collider.get(), actor1.collider.get()], 200);

    expect(pairs.length).toBe(1);
  });

  it('order of actors collision should not matter when an Active and PreventCollision', () => {
    const collisionTree = new ex.SparseHashGridCollisionProcessor({ size: 10 });

    actor1.body.collisionType = ex.CollisionType.Active;
    actor2.body.collisionType = ex.CollisionType.PreventCollision;
    collisionTree.track(actor1.collider.get());
    collisionTree.track(actor2.collider.get());

    let pairs = collisionTree.broadphase([actor1.collider.get(), actor2.collider.get()], 200);

    expect(pairs.length).toBe(0);

    pairs = collisionTree.broadphase([actor2.collider.get(), actor1.collider.get()], 200);

    expect(pairs.length).toBe(0);
  });

  it('order of actors collision should not matter when an Active and Fixed', () => {
    const collisionTree = new ex.SparseHashGridCollisionProcessor({ size: 10 });

    actor1.body.collisionType = ex.CollisionType.Active;
    actor2.body.collisionType = ex.CollisionType.Fixed;
    collisionTree.track(actor1.collider.get());
    collisionTree.track(actor2.collider.get());

    let pairs = collisionTree.broadphase([actor1.collider.get(), actor2.collider.get()], 200);

    expect(pairs.length).toBe(1);

    pairs = collisionTree.broadphase([actor2.collider.get(), actor1.collider.get()], 200);

    expect(pairs.length).toBe(1);
  });

  it('order of actors collision should not matter when an Fixed and Fixed', () => {
    const collisionTree = new ex.SparseHashGridCollisionProcessor({ size: 10 });

    actor1.body.collisionType = ex.CollisionType.Fixed;
    actor2.body.collisionType = ex.CollisionType.Fixed;
    collisionTree.track(actor1.collider.get());
    collisionTree.track(actor2.collider.get());

    let pairs = collisionTree.broadphase([actor1.collider.get(), actor2.collider.get()], 200);

    expect(pairs.length).toBe(0);

    pairs = collisionTree.broadphase([actor2.collider.get(), actor1.collider.get()], 200);

    expect(pairs.length).toBe(0);
  });

  it('should only trigger one collision event per actor when an Active and Passive collide', () => {
    let actor1Collision = 0;
    let actor2Collision = 0;
    actor1.on('precollision', (e: ex.PreCollisionEvent) => {
      e.other.owner.kill();
      actor1Collision++;
    });

    actor2.on('precollision', (e: ex.PreCollisionEvent) => {
      actor2Collision++;
    });

    actor2.body.collisionType = ex.CollisionType.Passive;

    clock.run(1, 100);

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

    clock.run(1, 100);

    expect(actor1Collision).toBe(0);
    expect(actor2Collision).toBe(0);
  });

  it('should recognize when actor bodies are touching', () => {
    let touching = false;
    actor1.on('postupdate', function () {
      if (actor1.collider.get().touching(actor2.collider.get())) {
        touching = true;
      }
    });

    clock.run(5, 100);

    expect(touching).toBe(true);
  });

  it('should not collide when active and passive', () =>
    new Promise<void>((done) => {
      engine.stop();
      engine.dispose();
      engine = TestUtils.engine({
        width: 600,
        height: 400,
        physics: {
          solver: ex.SolverStrategy.Realistic
        }
      });
      clock = engine.clock = engine.clock.toTestClock();

      actor1 = new ex.Actor({ x: 0, y: 0, width: 10, height: 10 });
      actor2 = new ex.Actor({ x: 5, y: 5, width: 10, height: 10 });
      actor1.body.collisionType = ex.CollisionType.Active;
      actor2.body.collisionType = ex.CollisionType.Active;

      engine.start().then(() => {
        engine.add(actor1);
        engine.add(actor2);

        const activeBlock = new ex.Actor({ x: 200, y: 200, width: 50, height: 50, color: ex.Color.Red.clone() });
        activeBlock.body.collisionType = ex.CollisionType.Active;
        activeBlock.vel.x = 100;
        engine.add(activeBlock);

        const passiveBlock = new ex.Actor({ x: 400, y: 200, width: 50, height: 50, color: ex.Color.DarkGray.clone() });
        passiveBlock.body.collisionType = ex.CollisionType.Passive;
        passiveBlock.vel.x = -100;
        engine.add(passiveBlock);

        const collisionHandler = (ev: ex.PreCollisionEvent) => {
          const timer = new ex.Timer({
            interval: 30,
            fcn: () => {
              expect(activeBlock.vel.x).toBeGreaterThan(0);
              expect(passiveBlock.vel.x).toBeLessThan(0);
              done();
            },
            repeats: false
          });
          timer.start();
          engine.add(timer);
        };

        activeBlock.once('precollision', collisionHandler);

        clock.run(5, 1000);
      });
    }));

  it('should emit a start collision once when objects start colliding', () =>
    new Promise<void>((done) => {
      engine.stop();
      engine.dispose();
      engine = TestUtils.engine({
        width: 600,
        height: 400,
        physics: {
          solver: ex.SolverStrategy.Realistic
        }
      });
      clock = engine.clock = engine.clock.toTestClock();

      actor1 = new ex.Actor({ x: 0, y: 0, width: 10, height: 10 });
      actor2 = new ex.Actor({ x: 5, y: 5, width: 10, height: 10 });
      actor1.body.collisionType = ex.CollisionType.Active;
      actor2.body.collisionType = ex.CollisionType.Active;

      engine.start().then(() => {
        const activeBlock = new ex.Actor({ x: 200, y: 200, width: 50, height: 50, color: ex.Color.Red.clone() });
        activeBlock.body.collisionType = ex.CollisionType.Active;
        activeBlock.vel.x = 100;
        engine.add(activeBlock);

        const passiveBlock = new ex.Actor({ x: 400, y: 200, width: 50, height: 50, color: ex.Color.DarkGray.clone() });
        passiveBlock.body.collisionType = ex.CollisionType.Passive;
        passiveBlock.vel.x = -100;
        engine.add(passiveBlock);

        let count = 0;

        const collisionStart = () => {
          count++;
        };

        activeBlock.on('collisionstart', collisionStart);

        clock.run(5, 1000);

        expect(count).toBe(1);
        done();
      });
    }));

  it('should emit a end collision once when objects stop colliding', () =>
    new Promise<void>((done) => {
      engine.stop();
      engine.dispose();
      engine = TestUtils.engine({
        width: 600,
        height: 400,
        physics: {
          solver: ex.SolverStrategy.Realistic
        }
      });
      clock = engine.clock = engine.clock.toTestClock();

      actor1 = new ex.Actor({ x: 0, y: 0, width: 10, height: 10 });
      actor2 = new ex.Actor({ x: 5, y: 5, width: 10, height: 10 });
      actor1.body.collisionType = ex.CollisionType.Active;
      actor2.body.collisionType = ex.CollisionType.Active;

      engine.start().then(() => {
        const activeBlock = new ex.Actor({ x: 200, y: 200, width: 50, height: 50, color: ex.Color.Red.clone() });
        activeBlock.body.collisionType = ex.CollisionType.Active;
        activeBlock.vel.x = 100;
        engine.add(activeBlock);

        const passiveBlock = new ex.Actor({ x: 400, y: 200, width: 50, height: 50, color: ex.Color.DarkGray.clone() });
        passiveBlock.body.collisionType = ex.CollisionType.Passive;
        passiveBlock.vel.x = -100;
        engine.add(passiveBlock);

        let count = 0;

        const collisionEnd = () => {
          count++;
        };

        activeBlock.on('collisionend', collisionEnd);

        clock.run(5, 1000);

        expect(count).toBe(1);
        done();
      });
    }));

  it('should cancel out velocity when objects collide', () => {
    engine.currentScene.clear();
    const activeBlock = new ex.Actor({ name: 'active-block', x: 200, y: 200, width: 50, height: 50, color: ex.Color.Red.clone() });
    activeBlock.body.collisionType = ex.CollisionType.Active;
    activeBlock.vel.x = 100;
    engine.add(activeBlock);

    const fixedBlock = new ex.Actor({ name: 'fixed-block', x: 400, y: 200, width: 50, height: 50, color: ex.Color.DarkGray.clone() });
    fixedBlock.body.collisionType = ex.CollisionType.Fixed;
    engine.add(fixedBlock);

    clock.run(25, 100);

    expect(activeBlock.vel.x).toBe(0);
  });

  it('should not cancel out velocity when objects move away', () => {
    const activeBlock = new ex.Actor({ x: 350, y: 200, width: 50, height: 50, color: ex.Color.Red.clone() });
    activeBlock.body.collisionType = ex.CollisionType.Active;
    engine.add(activeBlock);

    const fixedBlock = new ex.Actor({ x: 400, y: 200, width: 50, height: 50, color: ex.Color.DarkGray.clone() });
    fixedBlock.body.collisionType = ex.CollisionType.Fixed;
    engine.add(fixedBlock);

    activeBlock.vel = ex.vec(-100, activeBlock.vel.y);

    clock.run(5, 1000);

    expect(activeBlock.vel.x).toBe(-100);
  });

  it('should have the actor as the handler context for collisionstart', () =>
    new Promise<void>((done) => {
      engine.stop();
      engine.dispose();
      engine = TestUtils.engine({
        width: 600,
        height: 400,
        physics: {
          solver: ex.SolverStrategy.Realistic
        }
      });
      clock = engine.clock = engine.clock.toTestClock();

      actor1 = new ex.Actor({ x: 0, y: 0, width: 10, height: 10 });
      actor2 = new ex.Actor({ x: 5, y: 5, width: 10, height: 10 });
      actor1.body.collisionType = ex.CollisionType.Active;
      actor2.body.collisionType = ex.CollisionType.Active;

      engine.start().then(() => {
        const activeBlock = new ex.Actor({ x: 200, y: 200, width: 50, height: 50, color: ex.Color.Red.clone() });
        activeBlock.body.collisionType = ex.CollisionType.Active;
        activeBlock.vel.x = 100;
        engine.add(activeBlock);

        const passiveBlock = new ex.Actor({ x: 400, y: 200, width: 50, height: 50, color: ex.Color.DarkGray.clone() });
        passiveBlock.body.collisionType = ex.CollisionType.Passive;
        passiveBlock.vel.x = -100;
        engine.add(passiveBlock);

        const collisionEnd = function (event: ex.GameEvent<unknown>) {
          expect((event as any).self.owner).toBe(activeBlock);
          done();
        };

        activeBlock.on('collisionstart', collisionEnd);

        clock.run(5, 1000);
      });
    }));

  it('should have the actor as the handler context for collisionend', () =>
    new Promise<void>((done) => {
      engine.stop();
      engine.dispose();
      engine = TestUtils.engine({
        width: 600,
        height: 400,
        physics: {
          solver: ex.SolverStrategy.Realistic
        }
      });
      clock = engine.clock as ex.TestClock;
      clock.start();
      clock.step(1);

      TestUtils.runToReady(engine).then(() => {
        const activeBlock = new ex.Actor({ x: 200, y: 200, width: 50, height: 50, color: ex.Color.Red.clone() });
        activeBlock.body.collisionType = ex.CollisionType.Active;
        activeBlock.vel.x = 100;
        engine.add(activeBlock);

        const passiveBlock = new ex.Actor({ x: 400, y: 200, width: 50, height: 50, color: ex.Color.DarkGray.clone() });
        passiveBlock.body.collisionType = ex.CollisionType.Passive;
        passiveBlock.vel.x = -100;
        engine.add(passiveBlock);

        const collisionEnd = function (event: ex.GameEvent<unknown>) {
          expect((event as any).self.owner).toBe(activeBlock);
          done();
        };

        activeBlock.on('collisionend', collisionEnd);
        clock.run(5, 1000);
      });
    }));

  it('should not fire onCollisionStart if the collision has been canceled', () => {
    const block1 = new ex.Actor({ x: 200, y: 200, width: 50, height: 50, color: ex.Color.Red.clone() });
    block1.body.collisionType = ex.CollisionType.Active;
    block1.vel.x = 100;

    const block2 = new ex.Actor({ x: 400, y: 200, width: 50, height: 50, color: ex.Color.DarkGray.clone() });
    block2.collider.useCompositeCollider([ex.Shape.Box(50, 50), ex.Shape.Box(50, 50)]);
    block2.body.collisionType = ex.CollisionType.Fixed;
    block2.vel.x = -100;

    block1.onCollisionStart = vi.fn();
    block2.onPreCollisionResolve = (self, other, side, contact) => {
      contact.cancel();
    };
    vi.spyOn(block2, 'onPreCollisionResolve');

    engine.add(block1);
    engine.add(block2);

    clock.run(1, 1000);

    expect(block2.onPreCollisionResolve).toHaveBeenCalled();
    expect(block1.onCollisionStart).not.toHaveBeenCalled();
  });

  it('should collisionend for a deleted collider', async () => {
    engine.stop();
    engine.dispose();
    engine = TestUtils.engine({ width: 600, height: 400, physics: { enabled: true, solver: ex.SolverStrategy.Arcade } });
    clock = engine.clock = engine.clock.toTestClock();
    await TestUtils.runToReady(engine);
    const activeBlock = new ex.Actor({
      x: 200,
      y: 200,
      width: 50,
      height: 50,
      color: ex.Color.Red.clone(),
      collisionType: ex.CollisionType.Active
    });
    activeBlock.acc.x = 100;
    engine.add(activeBlock);

    const fixedBlock = new ex.Actor({
      x: 400,
      y: 200,
      width: 50,
      height: 50,
      color: ex.Color.DarkGray.clone(),
      collisionType: ex.CollisionType.Fixed
    });
    engine.add(fixedBlock);

    const collisionStart = vi.fn();
    const collisionEnd = vi.fn();

    activeBlock.on('collisionstart', collisionStart);
    activeBlock.on('collisionend', collisionEnd);

    clock.run(20, 100);

    expect(collisionStart).toHaveBeenCalled();
    expect(collisionEnd).not.toHaveBeenCalled();

    activeBlock.collider.set(ex.Shape.Circle(5));

    clock.run(10, 100);

    expect(collisionEnd).toHaveBeenCalledTimes(1);
  });
});
