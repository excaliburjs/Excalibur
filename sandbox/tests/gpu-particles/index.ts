var game = new ex.Engine({
  width: 1000,
  height: 1000,
  displayMode: ex.DisplayMode.FitScreen
});

var swordImg = new ex.ImageSource('https://cdn.rawgit.com/excaliburjs/Excalibur/7dd48128/assets/sword.png');

var particles = new ex.GpuParticleEmitter({
  pos: ex.vec(500, 500),
  z: 1,
  emitterType: ex.EmitterType.Circle,
  maxParticles: 1000,
  particle: {
    minSpeed: 1,
    maxSpeed: 10,
    minAngle: 3.4,
    maxAngle: 6,
    opacity: 0.7,
    life: 2000,
    maxSize: 5,
    minSize: 5,
    startSize: 5,
    endSize: 1,
    beginColor: ex.Color.fromRGB(23, 106, 170, 0.1),
    endColor: ex.Color.Transparent
  },
  radius: 1,
  emitRate: 1,
  isEmitting: true
});

game.input.pointers.primary.on('move', (evt) => {
  particles.pos.x = evt.worldPos.x;
  particles.pos.y = evt.worldPos.y;
});

particles.isEmitting = true;
game.add(particles);

game.add(
  new ex.Actor({
    width: 100,
    height: 100,
    color: ex.Color.Red,
    pos: ex.vec(400, 400)
  })
);

// var particles2 = new ex.GpuParticleEmitter({
//   pos: ex.vec(700, 500),
//   particle: {
//     beginColor: ex.Color.Blue,
//     endColor: ex.Color.Rose,
//     fade: true,
//     startSize: 50,
//     endSize: 20
//   }
// });
// game.add(particles2);

game.start(new ex.Loader([swordImg]));
