var game = new ex.Engine({
  width: 1000,
  height: 1000,
  displayMode: ex.DisplayMode.FitScreen
});

var swordImg = new ex.ImageSource('https://cdn.rawgit.com/excaliburjs/Excalibur/7dd48128/assets/sword.png');

var particles = new ex.GpuParticleEmitter({
  pos: ex.vec(300, 500),
  maxParticles: 10_000,
  emitRate: 500,
  particle: {
    beginColor: ex.Color.Orange,
    endColor: ex.Color.Purple,
    fade: true,
    startSize: 100,
    endSize: 10,
    life: 5000,
    minVel: -100,
    maxVel: 100,
    randomRotation: true,
    graphic: swordImg.toSprite()
  }
});

game.input.pointers.primary.on('move', (evt) => {
  particles.transform.pos.x = evt.worldPos.x;
  particles.transform.pos.y = evt.worldPos.y;
});

particles.isEmitting = true;
game.add(particles);

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
