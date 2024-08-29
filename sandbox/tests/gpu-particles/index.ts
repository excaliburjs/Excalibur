var game = new ex.Engine({
  width: 1000,
  height: 1000,
  displayMode: ex.DisplayMode.FitScreen
});

var swordImg = new ex.ImageSource('https://cdn.rawgit.com/excaliburjs/Excalibur/7dd48128/assets/sword.png');

var particles = new ex.GpuParticleEmitter({
  pos: ex.vec(300, 500),
  maxParticles: 100_000,
  emitRate: 1000,
  particle: {
    beginColor: ex.Color.Orange,
    endColor: ex.Color.White,
    fade: true,
    startSize: 100,
    endSize: 0,
    life: 5500,
    graphic: swordImg.toSprite()
  }
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
