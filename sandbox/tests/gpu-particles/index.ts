var game = new ex.Engine({
  width: 1000,
  height: 1000,
  displayMode: ex.DisplayMode.FitScreen
});

var particles = new ex.GpuParticleEmitter({
  pos: ex.vec(300, 500)
});
game.add(particles);
var particles2 = new ex.GpuParticleEmitter({
  pos: ex.vec(700, 500)
});
game.add(particles2);

game.start();
