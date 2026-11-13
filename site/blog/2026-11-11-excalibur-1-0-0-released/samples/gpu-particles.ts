import * as ex from 'excalibur';

const game = new ex.Engine({
  canvasElementId: 'preview-canvas',
  displayMode: ex.DisplayMode.FillContainer,
  backgroundColor: ex.Color.fromHex('#0b0712')
});

const UP = Math.PI * 1.5; // y is down, so "up" is three quarters of a turn
const random = new ex.Random(1);

// Builds one fire out of four emitters parented to a single actor, `scale` sets the size of the flames
function fire(pos: ex.Vector, scale = 1, logs = true) {
  const root = new ex.Actor({ name: 'fire', pos });

  if (logs) {
    for (const rotation of [-0.5, 0.5]) {
      const log = new ex.Actor({
        pos: ex.vec(0, 10 * scale),
        width: 60 * scale,
        height: 10 * scale,
        rotation,
        color: ex.Color.fromHex('#4a2c1a'),
        z: -1,
      });
      root.addChild(log);
    }
  }

  const emit = (z: number, maxParticles: number, emitRate: number, particle: ex.GpuParticleConfig) => {
    const emitter = new ex.GpuParticleEmitter({
      z,
      emitterType: ex.EmitterType.Rectangle,
      width: 28 * scale,
      height: 6,
      maxParticles,
      emitRate,
      isEmitting: true,
      random,
      particle
    });
    root.addChild(emitter);
    return emitter;
  };

  // 1. Outer glow: big, faint, orange to deep red, dies quickly
  emit(0, 1500, 900, {
    life: 1100,
    minSpeed: 20 * scale,
    maxSpeed: 60 * scale,
    minAngle: UP - 0.5,
    maxAngle: UP + 0.5,
    acc: ex.vec(0, -50 * scale),
    startSize: 30 * scale,
    endSize: 0,
    opacity: 0.16,
    fade: true,
    beginColor: ex.Color.fromHex('#ff7a1a'),
    endColor: ex.Color.fromHex('#5a0f08')
  });

  // 2. Core flame: hot and bright, shrinks as it rises
  emit(1, 4000, 4000, {
    life: 800,
    minSpeed: 40 * scale,
    maxSpeed: 150 * scale,
    minAngle: UP - 0.35,
    maxAngle: UP + 0.35,
    acc: ex.vec(0, -120 * scale),
    startSize: 12 * scale,
    endSize: 2,
    opacity: 0.4,
    fade: true,
    beginColor: ex.Color.fromHex('#fff2a8'),
    endColor: ex.Color.fromHex('#e0321c')
  });

  // 3. Embers: a few fast sparks that drift and wink out
  const embers = emit(2, 600, 80, {
    life: 2200,
    minSpeed: 60 * scale,
    maxSpeed: 220 * scale,
    minAngle: UP - 0.7,
    maxAngle: UP + 0.7,
    acc: ex.vec(0, -30 * scale),
    startSize: 3,
    endSize: 1,
    opacity: 1,
    fade: true,
    beginColor: ex.Color.fromHex('#ffd75e'),
    endColor: ex.Color.fromHex('#ff5a1a')
  });

  // 4. Smoke: slow, growing, almost transparent, lives longest
  emit(-2, 300, 50, {
    life: 3500,
    minSpeed: 15 * scale,
    maxSpeed: 40 * scale,
    minAngle: UP - 0.25,
    maxAngle: UP + 0.25,
    acc: ex.vec(0, -12 * scale),
    startSize: 16 * scale,
    endSize: 70 * scale,
    opacity: 0.18,
    fade: true,
    beginColor: ex.Color.fromHex('#5a4e5e'),
    endColor: ex.Color.fromHex('#15121a')
  });

  game.add(root);
  return { root, embers };
}

// Ground and three campfires of different sizes
game.add(new ex.Actor({ name: 'ground', pos: ex.vec(300, 380), width: 600, height: 40, color: ex.Color.fromHex('#1a1220'), z: -3 }));
const fires = [
  fire(ex.vec(300, 355), 0.8),
];

// A torch that follows the pointer, click to throw a handful of embers from every fire
const torch = fire(ex.vec(300, 150), 0.5, false);
game.input.pointers.primary.on('move', (evt) => (torch.root.pos = evt.worldPos));
game.input.pointers.primary.on('down', () => {
  for (const { embers } of [...fires, torch]) {
    embers.emitRate = 3000;
    game.clock.schedule(() => (embers.emitRate = 80), 120);
  }
});

const font = new ex.Font({ size: 14, family: 'monospace', color: ex.Color.fromHex('#e2e8f0') });
const hud = new ex.Label({ text: '', pos: ex.vec(8, 6), font, z: 10 });
const emitterCount = game.currentScene.entities.filter((e) => e instanceof ex.GpuParticleEmitter).length;
const maxParticles = game.currentScene.entities.reduce((sum, e) => sum + (e instanceof ex.GpuParticleEmitter ? e.maxParticles : 0), 0);
hud.onPostUpdate = (engine) => {
  hud.text = `${emitterCount} emitters, ${maxParticles} particles, ${engine.stats.prevFrame.fps.toFixed(0)} fps. move: torch, click: embers`;
};
game.add(hud);

game.start();
