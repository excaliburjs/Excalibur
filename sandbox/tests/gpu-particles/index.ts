var game = new ex.Engine({
  width: 1000,
  height: 1000,
  displayMode: ex.DisplayMode.FitScreen
});

game.currentScene.camera.zoom = 0.1;

var particles = new ex.Actor({
  pos: ex.vec(100, 100),
  width: 10,
  height: 10,
  color: ex.Color.Red
});
game.add(particles);

particles.graphics.onPostDraw = (ctx: ex.ExcaliburGraphicsContextWebGL, delta) => {
  ctx.draw<ex.ParticleRenderer>('ex.particle', new ex.GpuParticleState(), delta);
};

// game.onPostDraw = (ctx: ex.ExcaliburGraphicsContextWebGL, delta) => {

//   ctx.draw<ex.ParticleRenderer>('ex.particle', new ex.GpuParticleState(), delta);
// }

game.start();
