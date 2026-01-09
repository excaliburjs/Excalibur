import * as ex from '@excalibur';
import { getDefaultPhysicsConfig } from '../../engine/collision/physics-config';

describe('A RealisticSolver', () => {
  it('should exist', () => {
    expect(ex.RealisticSolver).toBeDefined();
  });

  it('should cancel zero overlap collisions during presolve', () => {
    const realisticSolver = new ex.RealisticSolver(getDefaultPhysicsConfig().realistic);

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
      width: 40 + 0.00005,
      height: 40,
      collisionType: ex.CollisionType.Fixed,
      color: ex.Color.Green
    });

    const contact = new ex.CollisionContact(
      player.collider.get(),
      block.collider.get(),
      ex.Vector.Down,
      ex.Vector.Down,
      ex.Vector.Up.perpendicular(),
      [],
      [],
      null
    );

    contact.mtv = ex.vec(-0, 0);

    realisticSolver.preSolve([contact]);
    // Considers infinitesimally overlapping to no longer be overlapping and thus cancels the contact
    expect(contact.isCanceled()).toBe(true);
  });
});
