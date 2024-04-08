import * as ex from '@excalibur';
import { TransformComponent } from '@excalibur';
import { EulerIntegrator } from '../engine/Collision/Integrator';
import { MotionComponent } from '../engine/EntityComponentSystem/Components/MotionComponent';
import { DefaultPhysicsConfig } from '../engine/Collision/PhysicsConfig';

describe('A CollisionContact', () => {
  let actorA: ex.Actor;
  let actorB: ex.Actor;

  let colliderA: ex.Collider;
  let colliderB: ex.Collider;

  beforeEach(() => {
    actorA = new ex.Actor({ x: 0, y: 0, width: 20, height: 20 });
    actorA.collider.useCircleCollider(10);
    actorA.body.collisionType = ex.CollisionType.Active;

    actorB = new ex.Actor({ x: 20, y: 0, width: 20, height: 20 });
    actorB.collider.useCircleCollider(10);

    actorB.body.collisionType = ex.CollisionType.Active;

    colliderA = actorA.collider.get();
    colliderB = actorB.collider.get();
  });

  it('exists', () => {
    expect(ex.CollisionContact).toBeDefined();
  });

  it('can be created', () => {
    const cc = new ex.CollisionContact(
      colliderA,
      colliderB,
      ex.Vector.Right,
      ex.Vector.Right,
      ex.Vector.Right.perpendicular(),
      [new ex.Vector(10, 0)],
      [new ex.Vector(10, 0)],
      null
    );
    expect(cc).not.toBe(null);
  });

  it('can resolve in the Box system', () => {
    actorB.pos = ex.vec(19, actorB.pos.y);
    const cc = new ex.CollisionContact(
      colliderA,
      colliderB,
      ex.Vector.Right,
      ex.Vector.Right,
      ex.Vector.Right.perpendicular(),
      [new ex.Vector(10, 0)],
      [new ex.Vector(10, 0)],
      null
    );

    const solver = new ex.ArcadeSolver(DefaultPhysicsConfig.arcade);
    solver.solve([cc]);

    expect(actorA.pos.x).toBe(-0.5);
    expect(actorA.pos.y).toBe(0);

    expect(actorB.pos.x).toBe(19.5);
    expect(actorB.pos.y).toBe(0);
  });

  it('emits a collision event on both actors in the Arcade solver', () => {
    const actorAPreCollide = jasmine.createSpy('precollision A');
    const actorBPreCollide = jasmine.createSpy('precollision B');
    actorA.on('precollision', actorAPreCollide);

    actorB.on('precollision', actorBPreCollide);

    actorB.pos = ex.vec(19, actorB.pos.y);
    const cc = new ex.CollisionContact(
      colliderA,
      colliderB,
      ex.Vector.Right.clone(),
      ex.Vector.Right.clone(),
      ex.Vector.Right.perpendicular(),
      [new ex.Vector(10, 0)],
      [new ex.Vector(10, 0)],
      null
    );

    const solver = new ex.ArcadeSolver(DefaultPhysicsConfig.arcade);
    solver.solve([cc]);

    expect(actorAPreCollide).toHaveBeenCalledTimes(1);
    expect(actorBPreCollide).toHaveBeenCalledTimes(1);
  });

  it('can resolve in the Realistic solver', () => {
    expect(actorA.pos.x).toBe(0, 'Actor A should be y=10');
    expect(actorA.pos.y).toBe(0, 'Actor A should be y=0');
    expect(actorB.pos.x).toBe(20, 'Actor B should be x=20');
    expect(actorB.pos.y).toBe(0, 'Actor B should be y=0');
    expect(actorA.vel.x).toBe(0, 'Actor A should not be moving in x');
    expect(actorB.vel.x).toBe(0, 'Actor B should not be moving in x');
    actorA.vel.x = 10;
    actorB.vel.x = -10;
    actorB.pos.x = 19;
    actorA.body.bounciness = 0;
    actorB.body.bounciness = 0;
    actorA.collider.update();
    actorB.collider.update();
    const cc = new ex.CollisionContact(
      colliderA,
      colliderB,
      ex.Vector.Right.clone(),
      ex.Vector.Right.clone(),
      ex.Vector.Right.perpendicular(),
      [new ex.Vector(10, 0)],
      [new ex.Vector(10, 0)],
      null
    );
    // slop is normally 1 pixel, we are testing at a pixel scale here
    const solver = new ex.RealisticSolver({ ...DefaultPhysicsConfig.realistic, slop: 0 });
    // Realistic solver converges over time
    for (let i = 0; i < 4; i++) {
      solver.solve([cc]);
      // Realistic solver uses velocity impulses to correct overlap
      EulerIntegrator.integrate(actorA.get(TransformComponent), actorA.get(MotionComponent), ex.Vector.Zero, 1000);
      EulerIntegrator.integrate(actorB.get(TransformComponent), actorB.get(MotionComponent), ex.Vector.Zero, 1000);
    }

    expect(actorA.pos.x).toBeCloseTo(-0.5, 1);
    expect(actorA.pos.y).toBe(0);
    expect(actorA.vel.x).toBe(0);
    expect(actorA.vel.y).toBe(0);

    expect(actorB.pos.x).toBeCloseTo(19.5, 1);
    expect(actorB.pos.y).toBe(0);
    expect(actorB.vel.x).toBe(0);
    expect(actorB.vel.y).toBe(0);
  });

  it('can resolve perfectly elastic collisions in the Realistic solver', () => {
    expect(actorA.pos.x).toBe(0, 'Actor A should be y=10');
    expect(actorA.pos.y).toBe(0, 'Actor A should be y=0');
    expect(actorB.pos.x).toBe(20, 'Actor B should be x=20');
    expect(actorB.pos.y).toBe(0, 'Actor B should be y=0');
    expect(actorA.vel.x).toBe(0, 'Actor A should not be moving in x');
    expect(actorB.vel.x).toBe(0, 'Actor B should not be moving in x');
    actorA.vel.x = 10;
    actorB.vel.x = -10;
    actorB.pos.x = 19;
    actorA.body.bounciness = 1.0;
    actorB.body.bounciness = 1.0;
    actorA.collider.update();
    actorB.collider.update();
    const cc = new ex.CollisionContact(
      colliderA,
      colliderB,
      ex.Vector.Right.clone(),
      ex.Vector.Right.clone(),
      ex.Vector.Right.perpendicular(),
      [new ex.Vector(10, 0)],
      [new ex.Vector(10, 0)],
      null
    );
    // slop is normally 1 pixel, we are testing at a pixel scale here
    const solver = new ex.RealisticSolver({ ...DefaultPhysicsConfig.realistic, slop: 0 });

    solver.solve([cc]);
    // Realistic solver uses velocity impulses to correct overlap
    EulerIntegrator.integrate(actorA.get(TransformComponent), actorA.get(MotionComponent), ex.Vector.Zero, 30);
    EulerIntegrator.integrate(actorB.get(TransformComponent), actorB.get(MotionComponent), ex.Vector.Zero, 30);

    expect(actorA.pos.x).toBeCloseTo(-0.5, 1);
    expect(actorA.pos.y).toBe(0);
    expect(actorA.vel.x).toBe(-10);
    expect(actorA.vel.y).toBe(0);

    expect(actorB.pos.x).toBeCloseTo(19.5, 1);
    expect(actorB.pos.y).toBe(0);
    expect(actorB.vel.x).toBe(10);
    expect(actorB.vel.y).toBe(0);
  });

  it('can limit the rotation degree of freedom', () => {
    expect(actorA.pos.x).toBe(0, 'Actor A should be y=10');
    expect(actorA.pos.y).toBe(0, 'Actor A should be y=0');
    expect(actorB.pos.x).toBe(20, 'Actor B should be x=20');
    expect(actorB.pos.y).toBe(0, 'Actor B should be y=0');
    expect(actorA.vel.x).toBe(0, 'Actor A should not be moving in x');
    expect(actorB.vel.x).toBe(0, 'Actor B should not be moving in x');
    actorA.vel.x = 10;
    actorB.vel.x = -10;
    actorB.pos.x = 19;
    actorB.pos.y = 10;
    actorA.body.bounciness = 0;
    actorB.body.bounciness = 0;
    actorB.body.limitDegreeOfFreedom.push(ex.DegreeOfFreedom.Rotation);
    actorA.collider.update();
    actorB.collider.update();
    const cc = new ex.CollisionContact(
      colliderA,
      colliderB,
      ex.Vector.Right.clone(),
      ex.Vector.Right.clone(),
      ex.Vector.Right.perpendicular(),
      [new ex.Vector(10, 0), new ex.Vector(10, 10)],
      [new ex.Vector(10, 0), new ex.Vector(10, 10)],
      null
    );
    const solver = new ex.RealisticSolver(DefaultPhysicsConfig.realistic);
    solver.solve([cc]);
    // Realistic solver uses velocity impulses to correct overlap
    EulerIntegrator.integrate(actorA.get(TransformComponent), actorA.get(MotionComponent), ex.Vector.Zero, 30);
    EulerIntegrator.integrate(actorB.get(TransformComponent), actorB.get(MotionComponent), ex.Vector.Zero, 30);
    expect(actorA.rotation).not.toBe(0);
    expect(actorA.angularVelocity).not.toBe(0);
    expect(actorB.rotation).toBe(0);
    expect(actorB.angularVelocity).toBe(0);
  });

  it('can limit the y degree of freedom', () => {
    expect(actorA.pos.x).toBe(0, 'Actor A should be y=10');
    expect(actorA.pos.y).toBe(0, 'Actor A should be y=0');
    expect(actorB.pos.x).toBe(20, 'Actor B should be x=20');
    expect(actorB.pos.y).toBe(0, 'Actor B should be y=0');
    expect(actorA.vel.x).toBe(0, 'Actor A should not be moving in x');
    expect(actorB.vel.x).toBe(0, 'Actor B should not be moving in x');
    actorA.vel.x = 10;
    actorB.vel.x = -10;
    actorB.pos.x = 19;
    actorB.pos.y = 10;
    actorA.body.bounciness = 0;
    actorB.body.bounciness = 0;
    actorB.body.limitDegreeOfFreedom.push(ex.DegreeOfFreedom.Y);
    actorA.collider.update();
    actorB.collider.update();
    const cc = new ex.CollisionContact(
      colliderA,
      colliderB,
      ex.Vector.Right.clone(),
      ex.Vector.Right.clone(),
      ex.Vector.Right.perpendicular(),
      [new ex.Vector(10, 0), new ex.Vector(10, 10)],
      [new ex.Vector(10, 0), new ex.Vector(10, 10)],
      null
    );
    ex.Physics.slop = 0; // slop is normally 1 pixel, we are testing at a pixel scale here
    const solver = new ex.RealisticSolver({
      ...DefaultPhysicsConfig.realistic,
      slop: 0
    });
    solver.solve([cc]);
    // Realistic solver uses velocity impulses to correct overlap
    EulerIntegrator.integrate(actorA.get(TransformComponent), actorA.get(MotionComponent), ex.Vector.Zero, 30);
    EulerIntegrator.integrate(actorB.get(TransformComponent), actorB.get(MotionComponent), ex.Vector.Zero, 30);
    expect(actorA.rotation).not.toBe(0);
    expect(actorA.angularVelocity).not.toBe(0);
    expect(actorB.pos.x).toBeCloseTo(19, 1);
    expect(actorB.pos.y).toBe(10);
  });

  it('can limit the x degree of freedom', () => {
    expect(actorA.pos.x).toBe(0, 'Actor A should be y=10');
    expect(actorA.pos.y).toBe(0, 'Actor A should be y=0');
    expect(actorB.pos.x).toBe(20, 'Actor B should be x=20');
    expect(actorB.pos.y).toBe(0, 'Actor B should be y=0');
    expect(actorA.vel.x).toBe(0, 'Actor A should not be moving in x');
    expect(actorB.vel.x).toBe(0, 'Actor B should not be moving in x');
    actorA.vel.x = 10;
    actorB.pos.x = 19;
    actorB.pos.y = 10;
    actorA.body.bounciness = 0;
    actorB.body.bounciness = 0;
    actorB.body.limitDegreeOfFreedom.push(ex.DegreeOfFreedom.X);
    actorA.collider.update();
    actorB.collider.update();
    const cc = new ex.CollisionContact(
      colliderA,
      colliderB,
      ex.Vector.Right.clone(),
      ex.Vector.Right.clone(),
      ex.Vector.Right.perpendicular(),
      [new ex.Vector(10, 0), new ex.Vector(10, 10)],
      [new ex.Vector(10, 0), new ex.Vector(10, 10)],
      null
    );
    ex.Physics.slop = 0; // slop is normally 1 pixel, we are testing at a pixel scale here
    const solver = new ex.RealisticSolver(DefaultPhysicsConfig.realistic);
    solver.solve([cc]);
    // Realistic solver uses velocity impulses to correct overlap
    EulerIntegrator.integrate(actorA.get(TransformComponent), actorA.get(MotionComponent), ex.Vector.Zero, 30);
    EulerIntegrator.integrate(actorB.get(TransformComponent), actorB.get(MotionComponent), ex.Vector.Zero, 30);
    expect(actorA.rotation).not.toBe(0);
    expect(actorA.angularVelocity).not.toBe(0);
    expect(actorB.pos.x).toBe(19);
    expect(actorB.pos.y).toBeCloseTo(10, 0);
  });

  it('emits a collision event on both in the Realistic solver', () => {
    let emittedA = false;
    let emittedB = false;

    actorA.on('precollision', () => {
      emittedA = true;
    });

    actorB.on('precollision', () => {
      emittedB = true;
    });

    actorB.pos = ex.vec(19, actorB.pos.y);
    const cc = new ex.CollisionContact(
      colliderA,
      colliderB,
      ex.Vector.Right.clone(),
      ex.Vector.Right.clone(),
      ex.Vector.Right.perpendicular(),
      [new ex.Vector(10, 0)],
      [new ex.Vector(10, 0)],
      null
    );

    const solver = new ex.RealisticSolver(DefaultPhysicsConfig.realistic);
    solver.solve([cc]);

    expect(emittedA).toBe(true);
    expect(emittedB).toBe(true);
  });
});
