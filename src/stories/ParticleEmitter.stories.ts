import { withKnobs, number, select, boolean, color } from '@storybook/addon-knobs';
import { ParticleEmitter, EmitterType, Color, Vector } from '../engine';
import { withEngine, enumToKnobSelect } from './utils';

export default {
  title: 'ParticleEmitter',
  decorators: [withKnobs]
};

export const main = withEngine(async (game) => {
  // Knobs
  const width = number('width', 1, { range: true, min: 0, max: 100, step: 1 });
  const height = number('height', 1, { range: true, min: 0, max: 100, step: 1 });
  const emitterType = select('emitterType', enumToKnobSelect(EmitterType), EmitterType.Rectangle);
  const radius = number('radius', 5, { range: true, min: 0, max: 1000, step: 1 });
  const minVel = number('minVel', 100, { range: true, min: 0, max: 1000, step: 1 });
  const maxVel = number('maxVel', 200, { range: true, min: 0, max: 1000, step: 1 });
  const minAngle = number('minAngle', 0, { range: true, min: 0, max: 6.2, step: 0.1 });
  const maxAngle = number('maxAngle', 6.2, { range: true, min: 0, max: 6.2, step: 0.1 });
  const isEmitting = boolean('isEmitting', true);
  const emitRate = number('emitRate', 300, { range: true, min: 0, max: 1000, step: 1 });
  const opacity = number('opacity', 0.5, { range: true, min: 0, max: 1, step: 0.01 });
  const fadeFlag = boolean('fadeFlag', true);
  const particleLife = number('particleLife (ms)', 1000, { range: true, min: 0, max: 5000, step: 10 });
  const minSize = number('minSize', 1, { range: true, min: 0, max: 200, step: 1 });
  const maxSize = number('maxSize', 10, { range: true, min: 0, max: 200, step: 1 });
  const startSize = number('startSize', 5, { range: true, min: 0, max: 200, step: 1 });
  const endSize = number('endSize', 10, { range: true, min: 0, max: 200, step: 1 });
  const accelX = number('Accel X', 0, { range: true, min: -2000, max: 2000, step: 1 });
  const accelY = number('Accel Y', 0, { range: true, min: -2000, max: 2000, step: 1 });
  const beginColor = color('beginColor', Color.Rose.toRGBA());
  const endColor = color('endColor', Color.Yellow.toRGBA());

  // Default Scenario
  game.backgroundColor = Color.Black;

  // Particle Emitter
  const emitter = new ParticleEmitter(game.currentScene.camera.x, game.currentScene.camera.y);
  emitter.width = width;
  emitter.height = height;
  emitter.emitterType = emitterType;
  emitter.radius = radius;
  emitter.minVel = minVel;
  emitter.maxVel = maxVel;
  emitter.minAngle = minAngle;
  emitter.maxAngle = maxAngle;
  emitter.isEmitting = isEmitting;
  emitter.emitRate = emitRate;
  emitter.opacity = opacity;
  emitter.fadeFlag = fadeFlag;
  emitter.particleLife = particleLife;
  emitter.minSize = minSize;
  emitter.maxSize = maxSize;
  emitter.startSize = startSize;
  emitter.endSize = endSize;
  emitter.acceleration = new Vector(accelX, accelY);
  emitter.beginColor = Color.fromRGBString(beginColor);
  emitter.endColor = Color.fromRGBString(endColor);
  emitter.focusAccel = 800;
  game.add(emitter);

  await game.start();
});
