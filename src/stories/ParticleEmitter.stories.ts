import { ParticleEmitter, EmitterType, Color, Vector } from '../engine';
import { withEngine, enumToKnobSelect } from './utils';

export default {
  title: 'ParticleEmitter'
};

export const main: Story = withEngine(
  async (
    game,
    {
      width,
      height,
      emitterType,
      radius,
      minVel,
      maxVel,
      minAngle,
      maxAngle,
      isEmitting,
      emitRate,
      opacity,
      fadeFlag,
      particleLife,
      minSize,
      maxSize,
      startSize,
      endSize,
      accelX,
      accelY,
      beginColor,
      endColor
    }
  ) => {
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
  }
);

main.argTypes = {
  width: { control: { type: 'number', range: true, min: 0, max: 100, step: 1 } },
  height: { control: { type: 'number', range: true, min: 0, max: 100, step: 1 } },
  emitterType: { control: { type: 'select' }, options: enumToKnobSelect(EmitterType) },
  radius: { control: { type: 'number', range: true, min: 0, max: 1000, step: 1 } },
  minVel: { control: { type: 'number', range: true, min: 0, max: 1000, step: 1 } },
  maxVel: { control: { type: 'number', range: true, min: 0, max: 1000, step: 1 } },
  minAngle: { control: { type: 'number', range: true, min: 0, max: 6.2, step: 0.1 } },
  maxAngle: { control: { type: 'number', range: true, min: 0, max: 6.2, step: 0.1 } },
  isEmitting: { control: { type: 'boolean' } },
  emitRate: { control: { type: 'number', range: true, min: 0, max: 1000, step: 1 } },
  opacity: { control: { type: 'number', range: true, min: 0, max: 1, step: 0.01 } },
  fadeFlag: { control: { type: 'boolean' } },
  particleLife: { control: { type: 'number', range: true, min: 0, max: 5000, step: 10 } },
  minSize: { control: { type: 'number', range: true, min: 0, max: 200, step: 1 } },
  maxSize: { control: { type: 'number', range: true, min: 0, max: 200, step: 1 } },
  startSize: { control: { type: 'number', range: true, min: 0, max: 200, step: 1 } },
  endSize: { control: { type: 'number', range: true, min: 0, max: 200, step: 1 } },
  accelX: { control: { type: 'number', range: true, min: -2000, max: 2000, step: 1 } },
  accelY: { control: { type: 'number', range: true, min: -2000, max: 2000, step: 1 } },
  beginColor: { control: { type: 'color' } },
  endColor: { control: { type: 'color' } }
};

main.args = {
  width: 1,
  height: 1,
  emitterType: EmitterType.Rectangle,
  radius: 5,
  minVel: 100,
  maxVel: 200,
  minAngle: 0,
  maxAngle: 6.2,
  isEmitting: true,
  emitRate: 300,
  opacity: 0.5,
  fadeFlag: true,
  particleLife: 1000,
  minSize: 1,
  maxSize: 10,
  startSize: 5,
  endSize: 10,
  accelX: 0,
  accelY: 0,
  beginColor: Color.Rose.toRGBA(),
  endColor: Color.Yellow.toRGBA()
};
