var game = new ex.Engine({
  width: 1000,
  height: 1000,
  displayMode: ex.DisplayMode.FitScreen
});

var particles = new ex.GpuParticleEmitter({
  pos: ex.vec(500, 500)
});
game.add(particles);

game.start();
