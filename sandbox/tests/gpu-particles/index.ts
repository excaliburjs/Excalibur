var game = new ex.Engine({
  width: 1000,
  height: 1000,
  displayMode: ex.DisplayMode.FitScreen
});

var particles = new ex.GpuParticleEmitter({
  pos: ex.vec(300, 500),
  particle: {
    beginColor: ex.Color.Orange,
    endColor: ex.Color.White,
    fade: true,
    startSize: 100,
    endSize: 0
  }
});
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

game.start();
