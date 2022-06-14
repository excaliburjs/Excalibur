import * as ex from '@excalibur';
import { ExcaliburMatchers } from 'excalibur-jasmine';
import { TestUtils } from './util/TestUtils';

describe('An ArcadeSolver', () => {
  beforeAll(() => {
    jasmine.addMatchers(ExcaliburMatchers);
  });

  it('should exist', () => {
    expect(ex.ArcadeSolver).toBeDefined();
  });

  it('should only solve position for overlapping contacts', ()=> {

    const wall1 = new ex.Actor({x: 0, y: 0, width: 100, height: 100, collisionType: ex.CollisionType.Fixed});
    const wall2 = new ex.Actor({x: 100, y: 0, width: 100, height: 100, collisionType: ex.CollisionType.Fixed});

    const player = new ex.Actor({x: 50, y: 99, width: 100, height: 100, collisionType: ex.CollisionType.Active});

    const pair1 = new ex.Pair(player.collider.get(), wall1.collider.get());
    const pair2 = new ex.Pair(player.collider.get(), wall2.collider.get());

    const contacts = [...pair1.collide(), ...pair2.collide()];
    expect(contacts.length).toBe(2);

    const sut = new ex.ArcadeSolver();

    for (const contact of contacts) {
      sut.solvePosition(contact);
    }

    // Each contact has the same mtv
    expect(contacts[0].mtv).toBeVector(ex.vec(0, -1));
    expect(contacts[1].mtv).toBeVector(ex.vec(0, -1));

    // Only 1 contact mtv is applied
    expect(player.pos.y).toBe(100);
    expect(player.pos.x).toBe(50);
  });

  it('should not catch on a seam (left/right)', async () => {
    ex.Physics.acc = new ex.Vector(0, 800);
    const game = TestUtils.engine({
      width: 1000,
      height: 1000
    });
    const clock = game.clock as ex.TestClock;
    await TestUtils.runToReady(game);
    // many small tiles
    for (let x = 0; x < 500; x += 16) {
      game.add(
        new ex.Actor({
          name: 'floor-tile',
          x,
          y: 300,
          width: 16,
          height: 16,
          color: ex.Color.Green,
          collisionType: ex.CollisionType.Fixed
        })
      );
    }

    const player = new ex.Actor({
      x: 100,
      y: 100,
      width: 40,
      height: 40,
      collisionType: ex.CollisionType.Active,
      color: ex.Color.Red
    });

    // place player on tiles
    player.pos.y = 270;
    game.add(player);

    // run simulation and ensure now left/right contacts are generated
    player.on('postcollision', evt => {
      expect(evt.side).not.toBe(ex.Side.Left);
      expect(evt.side).not.toBe(ex.Side.Right);
      expect(evt.side).toBe(ex.Side.Bottom);
    });

    for (let i = 0; i < 200; i++) {
      clock.step(16);
    }

    // give player right velocity
    ex.Physics.acc = ex.Vector.Zero;
  });

  it('should cancel collision contacts where there is no more overlap', () => {
    const arcadeSolver = new ex.ArcadeSolver();

    const player = new ex.Actor({
      x: 0,
      y: 0,
      width: 40,
      height: 40,
      collisionType: ex.CollisionType.Active,
      color: ex.Color.Red
    });
    player.vel = ex.vec(0, 10); // moving away from the contact

    const block = new ex.Actor({
      x: 0,
      y: 39,
      width: 40,
      height: 40,
      collisionType: ex.CollisionType.Fixed,
      color: ex.Color.Green
    });

    // 1 pixel overlap
    const contact = new ex.CollisionContact(
      player.collider.get(), block.collider.get(), ex.Vector.Down, ex.Vector.Down, ex.Vector.Down.perpendicular(), [], [], null);
    arcadeSolver.solvePosition(contact);
    expect(player.pos).toBeVector(ex.vec(0, -1));

    // No more overlap
    const contact2 = new ex.CollisionContact(
      player.collider.get(), block.collider.get(), ex.Vector.Down, ex.Vector.Down, ex.Vector.Down.perpendicular(), [], [], null);
    arcadeSolver.solvePosition(contact2);
    expect(contact2.isCanceled()).toBeTrue();
  });

  it('should NOT cancel collisions where the bodies are moving away from the contact', () => {

    const arcadeSolver = new ex.ArcadeSolver();

    const player = new ex.Actor({
      x: 0,
      y: 0,
      width: 40,
      height: 40,
      collisionType: ex.CollisionType.Active,
      color: ex.Color.Red
    });
    player.vel = ex.vec(0, -10); // moving away from the contact

    const block = new ex.Actor({
      x: 39,
      y: 39,
      width: 40,
      height: 40,
      collisionType: ex.CollisionType.Fixed,
      color: ex.Color.Green
    });

    // Player moving away from contact
    const contact = new ex.CollisionContact(
      player.collider.get(), block.collider.get(), ex.Vector.Down, ex.Vector.Down, ex.Vector.Up.perpendicular(), [], [], null);
    arcadeSolver.solveVelocity(contact);
    expect(contact.isCanceled()).toBeFalse();
    expect(player.vel).toBeVector(ex.vec(0, -10)); // Velocity is not adjusted

    // Player moving towards contact
    player.vel = player.vel.negate();
    const contact2 = new ex.CollisionContact(
      player.collider.get(), block.collider.get(), ex.Vector.Down, ex.Vector.Down, ex.Vector.Down.perpendicular(), [], [], null);

    arcadeSolver.solveVelocity(contact2);
    expect(contact2.isCanceled()).toBeFalse();
    expect(player.vel).toBeVector(ex.Vector.Zero); // Velocity is adjusted
  });

  it('should cancel near zero mtv collisions', () => {
    const arcadeSolver = new ex.ArcadeSolver();

    const player = new ex.Actor({
      x: 0,
      y: 0,
      width: 40,
      height: 40,
      collisionType: ex.CollisionType.Active,
      color: ex.Color.Red
    });

    const block = new ex.Actor({
      x: 39.9999,
      y: 39.9999,
      width: 40,
      height: 40,
      collisionType: ex.CollisionType.Fixed,
      color: ex.Color.Green
    });

    const contact = new ex.CollisionContact(
      player.collider.get(),
      block.collider.get(),
      ex.Vector.Down.scale(.00009),
      ex.Vector.Down,
      ex.Vector.Up.perpendicular(),
      [],
      [],
      null
    );

    arcadeSolver.solvePosition(contact);

    expect(contact.isCanceled()).toBe(true);
  });

  it('should cancel near zero overlap collisions', () => {
    const arcadeSolver = new ex.ArcadeSolver();

    const player = new ex.Actor({
      x: 0,
      y: 0,
      width: 40,
      height: 40,
      collisionType: ex.CollisionType.Active,
      color: ex.Color.Red
    });

    const block = new ex.Actor({
      x: 40,
      y: 0,
      width: 40 + .00005,
      height: 40,
      collisionType: ex.CollisionType.Fixed,
      color: ex.Color.Green
    });

    const contact = new ex.CollisionContact(
      player.collider.get(), block.collider.get(), ex.Vector.Down, ex.Vector.Down, ex.Vector.Up.perpendicular(), [], [], null);

    arcadeSolver.solvePosition(contact);
    // Considers infinitesimally overlapping to no longer be overlapping and thus cancels the contact
    expect(contact.isCanceled()).toBe(true);
  });
});