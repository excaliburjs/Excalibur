var game = new ex.Engine({
  width: 400,
  height: 400
});

var actor = new ex.Actor({
  anchor: ex.vec(0.5, 0.5),
  pos: game.screen.center,
  color: ex.Color.Red,
  radius: 5
});

actor.actions.repeatForever((ctx) => {
  ctx.moveBy(ex.vec(100, 100), 100);
  ctx.moveBy(ex.vec(-100, -100), 100);
});

var emitter = new ex.ParticleEmitter({
  width: 10,
  height: 10,
  emitterType: ex.EmitterType.Rectangle,
  particleTransform: ex.ParticleTransform.Global,
  radius: 5,
  minVel: 100,
  maxVel: 200,
  minAngle: 5.1,
  maxAngle: 6.2,
  emitRate: 300,
  opacity: 0.5,
  fadeFlag: true,
  particleLife: 1000,
  maxSize: 10,
  minSize: 1,
  startSize: 5,
  endSize: 100,
  acceleration: ex.vec(10, 80),
  beginColor: ex.Color.Chartreuse,
  endColor: ex.Color.Magenta
});
emitter.isEmitting = true;

game.start();
game.add(actor);

actor.angularVelocity = 2;

// doesn't work
actor.addChild(emitter);
