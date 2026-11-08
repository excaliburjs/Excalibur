import * as ex from 'excalibur';

// GpuParticleEmitter simulates particles on the GPU, so tens of thousands cost about the same as a handful
const game = new ex.Engine({
  canvasElementId: 'preview-canvas',
  displayMode: ex.DisplayMode.FillContainer,
  backgroundColor: ex.Color.fromHex('#050816')
});

const emitter = new ex.GpuParticleEmitter({
  pos: ex.vec(300, 200),
  emitterType: ex.EmitterType.Circle,
  radius: 4,
  maxParticles: 30000,
  emitRate: 4000,
  isEmitting: true,
  particle: {
    life: 2500,
    minSpeed: 20,
    maxSpeed: 140,
    minAngle: 0,
    maxAngle: Math.PI * 2,
    acc: ex.vec(0, 60),
    startSize: 4,
    endSize: 0,
    opacity: 0.8,
    beginColor: ex.Color.fromHex('#67e8f9'),
    endColor: ex.Color.fromHex('#a21caf')
  }
});
game.add(emitter);

// Follow the pointer, click for a burst
game.input.pointers.primary.on('move', (evt) => (emitter.pos = evt.worldPos));
game.input.pointers.primary.on('down', () => {
  emitter.emitRate = 40000;
  game.clock.schedule(() => (emitter.emitRate = 4000), 150);
});

const font = new ex.Font({ size: 14, family: 'monospace', color: ex.Color.fromHex('#e2e8f0') });
const hud = new ex.Label({ text: '', pos: ex.vec(8, 6), font, z: 1 });
hud.onPostUpdate = (engine) => {
  hud.text = `${emitter.maxParticles} particles max, ${engine.stats.prevFrame.fps.toFixed(0)} fps, move the pointer, click to burst`;
};
game.add(hud);

game.start();
