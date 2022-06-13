import { Vector } from '../Math/vector';
import { TransformComponent } from '../EntityComponentSystem';
import { MotionComponent } from '../EntityComponentSystem/Components/MotionComponent';

export class EulerIntegrator {
  private static _POS = new Vector(0, 0);
  private static _SCALE = new Vector(1, 1);

  static integrate(transform: TransformComponent, motion: MotionComponent, totalAcc: Vector, elapsedMs: number): void {
    const seconds = elapsedMs / 1000;
    motion.vel.addEqual(totalAcc.scale(seconds));
    transform.pos.add(motion.vel.scale(seconds), EulerIntegrator._POS).addEqual(totalAcc.scale(0.5 * seconds * seconds));

    motion.angularVelocity += motion.torque * (1.0 / motion.inertia) * seconds;
    const rotation = transform.rotation + motion.angularVelocity * seconds;

    transform.scale.add(motion.scaleFactor.scale(seconds), EulerIntegrator._SCALE);
    const tx = transform.get();
    tx.setTransform(EulerIntegrator._POS, rotation, EulerIntegrator._SCALE);
  }
}
