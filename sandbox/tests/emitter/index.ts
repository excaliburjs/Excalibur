var game = new ex.Engine({
  width: 400,
  height: 400,
  displayMode: ex.DisplayMode.FitScreenAndFill
});

var swordImg = new ex.ImageSource('https://cdn.rawgit.com/excaliburjs/Excalibur/7dd48128/assets/sword.png');

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
  radius: 5,
  emitterType: ex.EmitterType.Rectangle,
  emitRate: 300,
  isEmitting: true,
  particle: {
    transform: ex.ParticleTransform.Global,
    opacity: 0.5,
    life: 1000,
    acc: ex.vec(10, 80),
    beginColor: ex.Color.Chartreuse,
    endColor: ex.Color.Magenta,
    startSize: 5,
    endSize: 100,
    minVel: 100,
    maxVel: 200,
    minAngle: 5.1,
    maxAngle: 6.2,
    fade: true,
    maxSize: 10,
    graphic: swordImg.toSprite(),
    randomRotation: true,
    minSize: 1
  }
});

game.start(new ex.Loader([swordImg]));
game.add(actor);

actor.angularVelocity = 2;

// doesn't work
actor.addChild(emitter);
