import { Vector } from './Algebra';
import { IntegratorType } from './Physics';

export interface HasTransform {
  pos: Vector;
  rotation: number;
  scale: Vector;
}

export interface HasMotion {
  vel: Vector;
  acc: Vector;
  rx: number;
  sx: number;
  sy: number;
}

export interface Integrator {
  type: IntegratorType;
  integrate(transform: HasTransform, motion: HasMotion, delta: number): HasTransform & HasMotion;
}

export class EulerIntegrator implements Integrator {
  readonly type = IntegratorType.Euler;
  integrate(transform: HasTransform, motion: HasMotion, delta: number): HasTransform & HasMotion {
    // Update placements based on linear algebra
    let seconds = delta / 1000;

    let totalAcc = motion.acc.clone();
    // global physics acceleration

    motion.vel.addEqual(totalAcc.scale(seconds));
    motion.rx += this.torque * (1.0 / this.moi) * seconds;

    transform.pos.addEqual(motion.vel.scale(seconds)).addEqual(totalAcc.scale(0.5 * seconds * seconds));
    transform.rotation += motion.rx * seconds;
    transform.scale.x += (motion.sx * delta) / 1000;
    transform.scale.y += (motion.sy * delta) / 1000;

    return { ...transform, ...motion };
  }
}
