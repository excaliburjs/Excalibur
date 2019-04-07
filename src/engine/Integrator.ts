import { Vector } from './Algebra';
import { IntegratorType } from './Physics';

export interface HasTransform {
  pos: Vector;
  oldPos: Vector;

  rotation: number;
  oldRotation: number;

  scale: Vector;
  oldScale: Vector;
}

export interface HasMotion {
  vel: Vector;
  oldVel: Vector;

  acc: Vector;
  oldAcc: Vector;

  rx: number;
  oldRx: number;

  sx: number;
  sy: number;
}

export interface Integrator {
  type: IntegratorType;
  integrate(transform: HasTransform, motion: HasMotion, delta: number): HasTransform & HasMotion;
}
