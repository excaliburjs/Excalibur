import { TransformComponent, MotionComponent, Vector } from '../../engine';
import { EulerIntegrator } from '../../engine/collision/integrator';

describe('EulerIntegrator', () => {
  it('applies motion velocity', () => {
    const transform = new TransformComponent();
    const motion = new MotionComponent();
    const totalAcc = new Vector(0, 0);
    const elapsed = 500;

    motion.vel = new Vector(1, 2);

    EulerIntegrator.integrate(transform, motion, totalAcc, elapsed);

    expect(transform.pos.x).toEqual(0.5);
    expect(transform.pos.y).toEqual(1);
  });

  it('clamps motion velocity to maxVel', () => {
    const transform = new TransformComponent();
    const motion = new MotionComponent();
    const totalAcc = new Vector(0, 0);
    const elapsed = 500;

    motion.vel = new Vector(-5, 5);
    motion.maxVel = new Vector(-2, 2);

    EulerIntegrator.integrate(transform, motion, totalAcc, elapsed);

    expect(motion.vel.x).toEqual(-2);
    expect(motion.vel.y).toEqual(2);
    expect(transform.pos.x).toEqual(-1);
    expect(transform.pos.y).toEqual(1);
  });

  it('applies totalAcc', () => {
    const transform = new TransformComponent();
    const motion = new MotionComponent();
    const totalAcc = new Vector(1, 2);
    const elapsed = 500;

    EulerIntegrator.integrate(transform, motion, totalAcc, elapsed);

    expect(transform.pos.x).toEqual(0.375);
    expect(transform.pos.y).toEqual(0.75);
    expect(motion.vel.x).toEqual(0.5);
    expect(motion.vel.y).toEqual(1);
  });

  it('applies motion torque and inertia', () => {
    const transform = new TransformComponent();
    const motion = new MotionComponent();
    const totalAcc = new Vector(0, 0);
    const elapsed = 500;

    motion.torque = 2;
    motion.inertia = 1;

    EulerIntegrator.integrate(transform, motion, totalAcc, elapsed);

    expect(transform.rotation).toEqual(0.5);
    expect(motion.angularVelocity).toEqual(1);
  });

  it('applies motion scaleFactor', () => {
    const transform = new TransformComponent();
    const motion = new MotionComponent();
    const totalAcc = new Vector(0, 0);
    const elapsed = 500;

    motion.scaleFactor = new Vector(1, 2);

    EulerIntegrator.integrate(transform, motion, totalAcc, elapsed);

    expect(transform.scale.x).toEqual(1.5);
    expect(transform.scale.y).toEqual(2);
  });
});
