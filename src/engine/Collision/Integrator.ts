import { Vector } from "../Algebra";
import { TransformComponent } from "../EntityComponentSystem";
import { MotionComponent } from "../EntityComponentSystem/Components/MotionComponent";


export class EulerIntegrator {
  static integrate(transform: TransformComponent, motion: MotionComponent, totalAcc: Vector, elapsedMs: number): void {
    const seconds = elapsedMs / 1000;
    motion.vel.addEqual(totalAcc.scale(seconds));
    transform.pos.addEqual(motion.vel.scale(seconds)).addEqual(totalAcc.scale(0.5 * seconds * seconds));

    motion.angularVelocity += motion.torque * (1.0 / motion.inertia) * seconds;
    transform.rotation += motion.angularVelocity * seconds;

    transform.scale.addEqual(motion.scaleFactor.scale(seconds));
  }
} 