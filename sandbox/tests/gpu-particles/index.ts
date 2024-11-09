var game = new ex.Engine({
  width: 1000,
  height: 1000,
  displayMode: ex.DisplayMode.FitScreen
});

var swordImg = new ex.ImageSource('https://cdn.rawgit.com/excaliburjs/Excalibur/7dd48128/assets/sword.png');

var particles = new ex.GpuParticleEmitter({
  pos: ex.vec(300, 500),
  maxParticles: 10_000,
  emitRate: 1000,
  radius: 100,
  width: 200,
  height: 100,
  emitterType: ex.EmitterType.Rectangle,
  particle: {
    acc: ex.vec(0, -100),
    opacity: 0.1,
    beginColor: ex.Color.Orange,
    endColor: ex.Color.Purple,
    fade: true,
    focus: ex.vec(0, -400),
    focusAccel: 1000,
    startSize: 100,
    endSize: 0,
    life: 3000,
    minVel: -100,
    maxVel: 100,
    angularVelocity: 2,
    randomRotation: true,
    transform: ex.ParticleTransform.Local,
    graphic: swordImg.toSprite()
  }
});

game.input.pointers.primary.on('move', (evt) => {
  particles.pos.x = evt.worldPos.x;
  particles.pos.y = evt.worldPos.y;
});

particles.isEmitting = true;
game.add(particles);

game.add(
  new ex.Actor({
    width: 200,
    height: 100,
    color: ex.Color.Red,
    pos: ex.vec(400, 400)
  })
);

var particles2 = new ex.GpuParticleEmitter({
  pos: ex.vec(700, 500),
  particle: {
    beginColor: ex.Color.Blue,
    endColor: ex.Color.Rose,
    fade: true,
    startSize: 50,
    endSize: 20
  }
});
game.add(particles2);

game.start(new ex.Loader([swordImg]));
