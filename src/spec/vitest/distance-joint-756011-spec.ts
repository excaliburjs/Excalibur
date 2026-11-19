import * as ex from '@excalibur';
import { TestUtils } from './joint-fixtures-a14d9d';

describe('Rigid distance joints in a scene', () => {
  const slop = 0.25;
  const lengthTolerance = 6 * slop;

  async function world(options: { gravity?: ex.Vector; substep?: number; sleeping?: boolean } = {}) {
    const engine = TestUtils.engine({
      width: 1000,
      height: 800,
      physics: {
        solver: ex.SolverStrategy.Realistic,
        gravity: options.gravity ?? ex.vec(0, 0),
        substep: options.substep ?? 1,
        continuous: { checkForFastBodies: false },
        bodies: { canSleepByDefault: options.sleeping ?? false, sleepTimeThreshold: 80, sleepBias: 0.01 },
        realistic: { slop, positionIterations: 12, velocityIterations: 16 }
      }
    });
    await engine.start();
    const scene = engine.currentScene;
    const clock = engine.clock as ex.TestClock;
    function body(x: number, y = 100, fixed = false, width = 16, height = 16) {
      const actor = new ex.Actor({
        x,
        y,
        width,
        height,
        collisionType: fixed ? ex.CollisionType.Fixed : ex.CollisionType.Active
      });
      actor.body.canSleep = options.sleeping ?? false;
      actor.body.bounciness = 0;
      actor.body.friction = 0;
      scene.add(actor);
      return actor;
    }
    function link(a: ex.Actor, b: ex.Actor, length: number, anchorA = ex.vec(0, 0), anchorB = ex.vec(0, 0)) {
      const DistanceJoint = (ex as any).DistanceJoint;
      expect(DistanceJoint, 'DistanceJoint must be exported from the public engine API').toBeTypeOf('function');
      const joint = new DistanceJoint({ bodyA: a.body, bodyB: b.body, anchorA, anchorB, length });
      expect((scene.physics as any).addJoint).toBeTypeOf('function');
      (scene.physics as any).addJoint(joint);
      return joint;
    }
    function remove(joint: unknown) {
      expect((scene.physics as any).removeJoint).toBeTypeOf('function');
      (scene.physics as any).removeJoint(joint);
    }
    function run(count = 60, milliseconds = 16) {
      for (let i = 0; i < count; i++) {
        clock.step(milliseconds);
      }
    }
    return { engine, scene, clock, body, link, remove, run };
  }

  function anchor(actor: ex.Actor, local = ex.vec(0, 0)) {
    return actor.pos.add(local.rotate(actor.rotation));
  }

  function separation(a: ex.Actor, b: ex.Actor, localA = ex.vec(0, 0), localB = ex.vec(0, 0)) {
    return anchor(a, localA).distance(anchor(b, localB));
  }

  function expectLength(a: ex.Actor, b: ex.Actor, length: number, localA = ex.vec(0, 0), localB = ex.vec(0, 0)) {
    expect(Math.abs(separation(a, b, localA, localB) - length)).toBeLessThanOrEqual(lengthTolerance);
  }

  it('pulls an extended link back to length without moving its Fixed endpoint or creating contact', async () => {
    const w = await world();
    const a = w.body(100, 100, true);
    const b = w.body(240);
    const contact = vi.fn();
    b.on('precollision', contact);
    w.link(a, b, 100);
    w.run();
    for (let i = 0; i < 20; i++) {
      w.clock.step(16);
      expectLength(a, b, 100);
    }
    expect(a.pos.x).toBe(100);
    expect(a.pos.y).toBe(100);
    expect(a.rotation).toBe(0);
    expect(a.vel.magnitude).toBe(0);
    expect(contact).not.toHaveBeenCalled();
  });

  it('pushes a compressed link apart rather than behaving as a separation-only rope', async () => {
    const w = await world();
    const a = w.body(100, 100, true);
    const b = w.body(160);
    w.link(a, b, 100);
    w.run();
    expectLength(a, b, 100);
    expect(b.pos.x).toBeGreaterThan(195);
    b.vel = ex.vec(-80, 0);
    for (let i = 0; i < 40; i++) {
      w.clock.step(16);
      expectLength(a, b, 100);
    }
    expect(a.pos.x).toBe(100);
  });

  it('supports an Active body followed by a Fixed body under sustained gravity', async () => {
    const w = await world({ gravity: ex.vec(0, 240) });
    const a = w.body(200, 240);
    const b = w.body(200, 100, true);
    w.link(a, b, 100);
    w.run(90);
    for (let i = 0; i < 60; i++) {
      w.clock.step(16);
      expectLength(a, b, 100);
    }
    expect(b.pos.x).toBe(200);
    expect(b.pos.y).toBe(100);
    expect(b.vel.magnitude).toBe(0);
  });

  it('weights both extension and compression corrections by the bodies existing masses', async () => {
    for (const startingLength of [140, 60]) {
      const w = await world();
      const a = w.body(100);
      const b = w.body(100 + startingLength);
      a.body.mass = 2;
      b.body.mass = 6;
      const initialCenter = (2 * a.pos.x + 6 * b.pos.x) / 8;
      w.link(a, b, 100);
      w.run(90);
      expectLength(a, b, 100);
      expect(Math.abs((2 * a.pos.x + 6 * b.pos.x) / 8 - initialCenter)).toBeLessThan(lengthTolerance);
      const movementA = Math.abs(a.pos.x - 100);
      const movementB = Math.abs(b.pos.x - (100 + startingLength));
      expect(movementA).toBeGreaterThan(20);
      expect(movementA / movementB).toBeGreaterThan(2.5);
      expect(movementA / movementB).toBeLessThan(3.5);
    }
  });

  it('exchanges internal impulses while preserving Active-Active linear momentum and common motion', async () => {
    const w = await world();
    const a = w.body(100);
    const b = w.body(200);
    a.body.mass = 2;
    b.body.mass = 6;
    a.vel = ex.vec(90, 12);
    b.vel = ex.vec(-10, 12);
    w.link(a, b, 100);
    w.run(45);
    expectLength(a, b, 100);
    expect(Math.abs(2 * a.vel.x + 6 * b.vel.x - 120)).toBeLessThan(0.5);
    expect(Math.abs(2 * a.vel.y + 6 * b.vel.y - 96)).toBeLessThan(0.5);
    expect(Math.abs(a.vel.x - b.vel.x)).toBeLessThan(2);
    expect(a.pos.x).toBeGreaterThan(105);
    expect(a.pos.y).toBeGreaterThan(105);
    expect(b.pos.y).toBeGreaterThan(105);
  });

  it('transforms both body-local anchors as the bodies rotate', async () => {
    const w = await world();
    const a = w.body(200, 200, true);
    const b = w.body(300, 200);
    const localA = ex.vec(12, -8);
    const localB = ex.vec(-10, 7);
    a.rotation = 0.8;
    b.rotation = -0.6;
    b.pos = anchor(a, localA).add(ex.vec(100, 0).rotate(0.3)).sub(localB.rotate(b.rotation));
    b.vel = ex.vec(35, 15);
    b.angularVelocity = 1.2;
    w.link(a, b, 100, localA, localB);
    w.run(30);
    for (let i = 0; i < 60; i++) {
      w.clock.step(16);
      expectLength(a, b, 100, localA, localB);
    }
    expect(Math.abs(b.rotation + 0.6)).toBeGreaterThan(0.05);
    expect(a.rotation).toBeCloseTo(0.8, 12);
  });

  it('uses off-center lever arms and the existing rotational inertia when exchanging impulses', async () => {
    const responses: number[] = [];
    for (const size of [20, 80]) {
      const w = await world();
      const a = w.body(100, 100, true);
      const b = w.body(200, 100, false, size, size);
      b.body.mass = 4;
      b.vel = ex.vec(60, 0);
      w.link(a, b, 100, ex.vec(0, 10), ex.vec(0, 10));
      const inertia = b.body.inertia;
      w.clock.step(1);
      const linearImpulse = 4 * (b.vel.x - 60);
      const angularImpulse = inertia * b.angularVelocity;
      expect(linearImpulse).toBeLessThan(-1);
      expect(b.angularVelocity).toBeGreaterThan(0.05);
      // An off-center horizontal impulse carries equal and opposite orbital/spin angular momentum.
      expect(Math.abs(angularImpulse + 10 * linearImpulse)).toBeLessThan(0.1 * Math.abs(10 * linearImpulse) + 1);
      expectLength(a, b, 100, ex.vec(0, 10), ex.vec(0, 10));
      responses.push(b.angularVelocity);
    }
    expect(responses[0]).toBeGreaterThan(2 * responses[1]);
  });

  it('continues to constrain a moving offset anchor through multiple physics substeps', async () => {
    const w = await world({ substep: 4, gravity: ex.vec(0, 160) });
    const a = w.body(300, 250, true);
    const b = w.body(400, 240);
    const localB = ex.vec(0, 10);
    b.vel = ex.vec(0, 90);
    b.angularVelocity = 0.5;
    w.link(a, b, 100, ex.vec(0, 0), localB);
    w.run(10, 64);
    for (let i = 0; i < 40; i++) {
      w.clock.step(64);
      expectLength(a, b, 100, ex.vec(0, 0), localB);
    }
    expect(b.pos.distance(ex.vec(400, 240))).toBeGreaterThan(10);
  });

  it('allows a stationary joint-connected component without contacts to fall asleep together', async () => {
    const w = await world({ sleeping: true });
    const a = w.body(100);
    const b = w.body(200);
    const c = w.body(300);
    w.link(a, b, 100);
    w.link(b, c, 100);
    w.run(150);
    expect([a.body.isSleeping, b.body.isSleeping, c.body.isSleeping]).toEqual([true, true, true]);
    const positions = [a.pos.clone(), b.pos.clone(), c.pos.clone()];
    w.run(20);
    for (const [i, actor] of [a, b, c].entries()) {
      expect(actor.body.isSleeping).toBe(true);
      expect(actor.pos.distance(positions[i])).toBeLessThan(0.001);
    }
  });

  it('wakes the whole connected chain when one endpoint wakes, even without contact', async () => {
    const w = await world({ sleeping: true });
    const a = w.body(100);
    const b = w.body(200);
    const c = w.body(300);
    w.link(a, b, 100);
    w.link(b, c, 100);
    w.clock.step(16);
    for (const actor of [a, b, c]) {
      actor.body.sleep();
    }
    w.clock.step(16);
    expect([a.body.isSleeping, b.body.isSleeping, c.body.isSleeping]).toEqual([true, true, true]);
    a.body.wake();
    a.vel = ex.vec(-60, 0);
    w.clock.step(16);
    expect([a.body.isSleeping, b.body.isSleeping, c.body.isSleeping]).toEqual([false, false, false]);
    w.run(20);
    expectLength(a, b, 100);
    expectLength(b, c, 100);
    expect(c.pos.x).toBeLessThan(298);
  });

  it('wakes a resting link when its Fixed endpoint starts moving', async () => {
    const w = await world({ sleeping: true });
    const a = w.body(100, 100, true);
    const b = w.body(200);
    const c = w.body(300);
    w.link(a, b, 100);
    w.link(b, c, 100);
    w.run(150);
    expect(b.body.isSleeping).toBe(true);
    expect(c.body.isSleeping).toBe(true);
    a.vel = ex.vec(-50, 0);
    w.run(60);
    expect(a.pos.x).toBeLessThan(60);
    expect(b.body.isSleeping).toBe(false);
    expect(c.body.isSleeping).toBe(false);
    expectLength(a, b, 100);
    expectLength(b, c, 100);
  });

  it('solves two links sharing a body at the same frame boundary', async () => {
    const w = await world();
    const a = w.body(100, 100, true);
    const b = w.body(220);
    const c = w.body(280);
    b.vel = ex.vec(30, 0);
    c.vel = ex.vec(-60, 0);
    w.link(a, b, 100);
    w.link(b, c, 100);
    w.run(90);
    for (let i = 0; i < 30; i++) {
      w.clock.step(16);
      expectLength(a, b, 100);
      expectLength(b, c, 100);
    }
    expect(a.pos.x).toBe(100);
  });

  it('propagates a collision-driven wake through a sleeping joint connection', async () => {
    const w = await world({ sleeping: true });
    const a = w.body(100);
    const b = w.body(200);
    w.link(a, b, 100);
    w.clock.step(16);
    a.body.sleep();
    b.body.sleep();
    const striker = w.body(240);
    striker.body.canSleep = false;
    striker.vel = ex.vec(-100, 0);
    const contact = vi.fn();
    b.on('precollision', contact);
    w.run(35);
    expect(contact).toHaveBeenCalled();
    expect(a.body.isSleeping).toBe(false);
    expect(b.body.isSleeping).toBe(false);
    expect(a.pos.x).toBeLessThan(99);
    expectLength(a, b, 100);
  });

  it('detaches only the removed joint while its neighboring link continues in the same update', async () => {
    const w = await world();
    const a = w.body(100, 100, true);
    const b = w.body(200);
    const c = w.body(300);
    const removed = w.link(a, b, 100);
    w.link(b, c, 100);
    w.run(10);
    w.remove(removed);
    b.vel = ex.vec(60, 0);
    c.vel = ex.vec(100, 0);
    w.run(50);
    expectLength(b, c, 100);
    expect(separation(a, b)).toBeGreaterThan(140);
    expect(b.vel.x).toBeGreaterThan(50);
    expect(Math.abs(b.vel.x - c.vel.x)).toBeLessThan(2);
  });

  it('detaches every joint on a removed scene body without reviving them when that body returns', async () => {
    const w = await world();
    const a = w.body(100, 100, true);
    const b = w.body(200);
    const c = w.body(300);
    const d = w.body(400);
    w.link(a, b, 100);
    w.link(b, c, 100);
    w.link(c, d, 100);
    w.run(10);
    w.scene.remove(b);
    w.clock.step(16);
    b.pos = ex.vec(650, 100);
    b.vel = ex.vec(70, 0);
    w.scene.add(b);
    c.vel = ex.vec(30, 0);
    d.vel = ex.vec(30, 0);
    w.run(50);
    expect(b.pos.x).toBeGreaterThan(695);
    expect(Math.abs(b.vel.x - 70)).toBeLessThan(0.1);
    expectLength(c, d, 100);
    expect(c.pos.x).toBeGreaterThan(320);
    expect(Math.abs(c.vel.x - 30)).toBeLessThan(0.1);
    expect(a.pos.x).toBe(100);
  });

  it('retains collision events and masks while enforcing a separate filtered link', async () => {
    const w = await world();
    const a = w.body(100, 100, true, 40, 40);
    const b = w.body(130, 100, false, 40, 40);
    const allowed = vi.fn();
    b.on('precollision', allowed);
    w.link(a, b, 30);
    const c = w.body(100, 300, true, 40, 40);
    const d = w.body(130, 300, false, 40, 40);
    const excluded = new ex.CollisionGroup('joint-filter', 1, 0);
    c.body.group = excluded;
    d.body.group = excluded;
    const denied = vi.fn();
    d.on('precollision', denied);
    w.link(c, d, 80);
    w.run(60);
    expect(allowed).toHaveBeenCalled();
    expect(denied).not.toHaveBeenCalled();
    expect(c.body.group.category).toBe(1);
    expect(c.body.group.mask).toBe(0);
    expect(d.body.group.category).toBe(1);
    expect(d.body.group.mask).toBe(0);
    expectLength(c, d, 80);
  });

  it('honors detachment from a collision callback before any further constraint response', async () => {
    const w = await world();
    const a = w.body(100, 100, true, 40, 40);
    const b = w.body(130, 100, false, 40, 40);
    const joint = w.link(a, b, 30);
    const contact = vi.fn(() => w.remove(joint));
    b.on('precollision', contact);
    w.clock.step(16);
    expect(contact).toHaveBeenCalled();
    expect(separation(a, b)).toBeGreaterThan(35);
    b.vel = ex.vec(60, 0);
    w.run(60);
    expect(b.pos.x).toBeGreaterThan(180);
  });

  it('keeps ordinary free motion and realistic contact response in a scene with no joints', async () => {
    const linked = await world();
    const endpoint = linked.body(100, 100, true);
    const linkedBody = linked.body(240);
    linked.link(endpoint, linkedBody, 100);
    linked.run();
    expectLength(endpoint, linkedBody, 100);

    const plain = await world();
    const free = plain.body(100, 300);
    free.vel = ex.vec(40, -10);
    const ball = plain.body(100);
    const wall = plain.body(150, 100, true);
    ball.body.bounciness = 1;
    wall.body.bounciness = 1;
    ball.vel = ex.vec(60, 0);
    const contact = vi.fn();
    ball.on('precollision', contact);
    plain.run(60);
    expect(Math.abs(free.pos.x - (100 + 40 * 0.96))).toBeLessThan(0.01);
    expect(Math.abs(free.pos.y - (300 - 10 * 0.96))).toBeLessThan(0.01);
    expect(free.vel.x).toBe(40);
    expect(free.vel.y).toBe(-10);
    expect(contact).toHaveBeenCalled();
    expect(ball.vel.x).toBeLessThan(0);
    expect(wall.pos.x).toBe(150);
    expect(wall.vel.magnitude).toBe(0);
  });
});
