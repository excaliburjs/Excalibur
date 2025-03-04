import * as ex from '@excalibur';

describe('A Motion Component', () => {
  it('can be cloned', () => {
    const motion = new ex.MotionComponent();
    const owner = new ex.Entity([motion]);
    motion.vel = ex.vec(1, 2);
    motion.acc = ex.vec(3, 4);
    motion.scaleFactor = ex.vec(5, 6);
    motion.angularVelocity = 7;
    motion.torque = 8;
    motion.inertia = 9;

    const clone = owner.clone();

    const sut = clone.get(ex.MotionComponent);

    // Should be same value
    expect(sut.vel).toBeVector(motion.vel);
    expect(sut.acc).toBeVector(motion.acc);
    expect(sut.scaleFactor).toBeVector(motion.scaleFactor);
    expect(sut.angularVelocity).toBe(motion.angularVelocity);
    expect(sut.torque).toBe(motion.torque);
    expect(sut.inertia).toBe(motion.inertia);

    // Should be new refs
    expect(sut).not.toBe(motion);
    expect(sut.vel).not.toBe(motion.vel);
    expect(sut.acc).not.toBe(motion.acc);
    expect(sut.scaleFactor).not.toBe(motion.scaleFactor);

    // Should have a new owner
    expect(sut.owner).toBe(clone);
  });
});
