var game = new ex.Engine({
  width: 1000,
  height: 1000,
  displayMode: ex.DisplayMode.FitScreen
});

var swordImg = new ex.ImageSource('https://cdn.rawgit.com/excaliburjs/Excalibur/7dd48128/assets/sword.png');

var particles = new ex.GpuParticleEmitter({
  pos: ex.vec(100, 0),
  z: 1,
  emitterType: ex.EmitterType.Circle,
  maxParticles: 1000,
  particle: {
    // transform: ex.ParticleTransform.Local,
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
  emitRate: 100,
  isEmitting: true
});

var cpuParticles = new ex.ParticleEmitter({
  pos: ex.vec(-100, 0),
  z: 1,
  emitterType: ex.EmitterType.Circle,
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
  emitRate: 100,
  isEmitting: true
});

particles.isEmitting = true;
// game.add(particles);

var particleParent = new ex.Actor({
  pos: ex.vec(400, 400),
  width: 10,
  height: 10,
  color: ex.Color.Red
});
game.add(particleParent);

game.input.pointers.primary.on('move', (evt) => {
  particleParent.pos.x = evt.worldPos.x;
  particleParent.pos.y = evt.worldPos.y;
});

game.input.pointers.primary.on('wheel', (ev) => {
  game.currentScene.camera.zoom += ev.deltaY / 1000;
  game.currentScene.camera.zoom = ex.clamp(game.currentScene.camera.zoom, 0.05, 100);
});

particleParent.addChild(particles);
particleParent.addChild(cpuParticles);

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
