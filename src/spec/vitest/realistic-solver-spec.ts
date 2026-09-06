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
      player.collider.get()!,
      block.collider.get()!,
      ex.Vector.Down,
      ex.Vector.Down,
      ex.Vector.Up.perpendicular(),
      [],
      [],
      null as any
    );

    contact.mtv = ex.vec(-0, 0);

    realisticSolver.preSolve([contact]);
    // Considers infinitesimally overlapping to no longer be overlapping and thus cancels the contact
    expect(contact.isCanceled()).toBe(true);
  });

  it('should run the configured number of position and velocity iterations without variable shadowing issues', () => {
    const config = { ...getDefaultPhysicsConfig().realistic, positionIterations: 3, velocityIterations: 4 };
    const realisticSolver = new ex.RealisticSolver(config);

    const actor1 = new ex.Actor({ x: 0, y: 0, width: 40, height: 40, collisionType: ex.CollisionType.Active });
    const actor2 = new ex.Actor({ x: 30, y: 0, width: 40, height: 40, collisionType: ex.CollisionType.Active });

    const contact = actor1.collider.collide(actor2.collider);

    // Should not throw and should complete successfully with multiple iterations
    realisticSolver.preSolve(contact);
    realisticSolver.solvePosition(contact);
    realisticSolver.solveVelocity(contact);
    realisticSolver.postSolve(contact);
  });

  it('should drop stale constraint points when a contact manifold shrinks', () => {
    const realisticSolver = new ex.RealisticSolver(getDefaultPhysicsConfig().realistic);

    // Two boxes overlapping face-on produce a 2 point manifold
    const bottom = new ex.Actor({ x: 0, y: 0, width: 40, height: 40, collisionType: ex.CollisionType.Active });
    const top = new ex.Actor({ x: 0, y: -35, width: 40, height: 40, collisionType: ex.CollisionType.Active });

    const twoPoint = bottom.collider.collide(top.collider);
    expect(twoPoint.length).toBe(1);
    expect(twoPoint[0].points.length).toBe(2);

    realisticSolver.preSolve(twoPoint);
    expect(realisticSolver.getContactConstraints(twoPoint[0].id).length).toBe(2);

    // Same contact id next frame, but the manifold shrank to a single point
    const onePoint = bottom.collider.collide(top.collider);
    onePoint[0].points = [onePoint[0].points[0]];
    onePoint[0].localPoints = [onePoint[0].localPoints[0]];

    realisticSolver.preSolve(onePoint);
    const constraints = realisticSolver.getContactConstraints(onePoint[0].id);
    expect(constraints.length).toBe(1);
    // The surviving point must be bound to the live contact, not the previous frame's
    expect(constraints[0].contact).toBe(onePoint[0]);

    // And an empty manifold leaves nothing to solve
    const noPoint = bottom.collider.collide(top.collider);
    noPoint[0].points = [];
    noPoint[0].localPoints = [];
    realisticSolver.preSolve(noPoint);
    expect(realisticSolver.getContactConstraints(noPoint[0].id).length).toBe(0);
  });
});
