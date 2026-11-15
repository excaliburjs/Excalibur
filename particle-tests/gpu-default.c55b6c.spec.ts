import * as ex from '@excalibur';
import { TestUtils } from '../src/spec/__util__/test-utils';

it('unscheduled GPU emitters retain the disabled emission default', async () => {
  expect(new ex.GpuParticleEmitter({}).isEmitting).toBe(false);
  const e = TestUtils.engine({ width: 220, height: 220, backgroundColor: ex.Color.Transparent });
  try {
    await TestUtils.runToReady(e);
    const actual = new ex.GpuParticleEmitter({
      x: 110, y: 110, width: 80, height: 80, emitRate: 50, random: new ex.Random(374),
      particle: { life: 2000, size: 7, minSpeed: 0, maxSpeed: 0, beginColor: ex.Color.Red, endColor: ex.Color.Red, fade: false }
    });
    e.add(actual);
    const clock = e.clock as ex.TestClock;
    const hasVisiblePixels = () => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 220;
      const context = canvas.getContext('2d')!;
      context.drawImage(e.canvas, 0, 0);
      return context.getImageData(0, 0, 220, 220).data.some((value, index) => index % 4 === 3 && value > 0);
    };
    for (let i = 0; i < 10; i++) clock.step(20);
    expect(actual.isEmitting).toBe(false);
    expect(hasVisiblePixels()).toBe(false);
    actual.isEmitting = true;
    clock.step(100);
    expect(hasVisiblePixels()).toBe(true);
  } finally {
    e.stop();
    e.dispose();
  }
});
