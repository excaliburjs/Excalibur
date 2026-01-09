import type { Meta, StoryObj } from '@storybook/html-vite';
import { ParticleEmitter, EmitterType, Color, Vector } from '../engine';
import { withEngine, enumToControlSelectOptions } from './utils';

export default {
  title: 'ParticleEmitter'
} as Meta;

export const Main: StoryObj = {
  render: withEngine(
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
        fade,
        life,
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
      const emitter = new ParticleEmitter({
        x: game.halfDrawWidth,
        y: game.halfDrawHeight,
        width,
        height,
        emitterType,
        radius,
        isEmitting,
        emitRate,
        focusAccel: 800,
        particle: {
          minSpeed: minVel,
          maxSpeed: maxVel,
          minAngle,
          maxAngle,
          opacity,
          fade,
          life,
          minSize,
          maxSize,
          startSize,
          endSize,
          acc: new Vector(accelX, accelY),
          beginColor: Color.fromRGBString(beginColor),
          endColor: Color.fromRGBString(endColor)
        }
      });

      game.add(emitter);

      await game.start();
    }
  ),
  argTypes: {
    width: { control: { type: 'number', range: true, min: 0, max: 100, step: 1 } },
    height: { control: { type: 'number', range: true, min: 0, max: 100, step: 1 } },
    emitterType: { control: { type: 'select' }, options: enumToControlSelectOptions(EmitterType) },
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
  },
  args: {
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
    fade: true,
    life: 1000,
    minSize: 1,
    maxSize: 10,
    startSize: 5,
    endSize: 10,
    accelX: 0,
    accelY: 0,
    beginColor: Color.Rose.toRGBA(),
    endColor: Color.Yellow.toRGBA()
  }
};
