import { Graphic } from '../Graphics';
import { vec, Vector } from '../Math/vector';
import { ParticleTransform } from './Particles';

export class GpuParticleState {
  numParticles: number = 100;
  gravity = vec(100, 100);

  life = 2000;
  transform = ParticleTransform.Global;
  graphic?: Graphic = undefined;
  opacity = 1;
  angularVelocity = 0;
  focus?: Vector = undefined;
  focusAccel?: Vector = undefined;
  randomRotation = false;
}
