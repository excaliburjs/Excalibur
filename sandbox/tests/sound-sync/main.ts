var game = new ex.Engine({
  width: 300,
  height: 300
});

var loader = new ex.Loader();
var jumpSnd = new ex.Sound('./jump.mp3');
loader.addResource(jumpSnd);

var forestSnd = new ex.Sound({
  paths: ['./loop-forest.mp3'],
  loop: true,
  volume: 0.9
});
loader.addResource(forestSnd);

var challengeMusic = new ex.Sound('./challengeloopfixed.mp3');
challengeMusic.loop = true;
loader.addResource(challengeMusic);

var guitarLoop = new ex.Sound('./loop-guitar.mp3');
guitarLoop.loop = true;
loader.addResource(guitarLoop);

game.start(loader).then(() => {
  forestSnd.play({ volume: 0.5, scheduledStartTime: ex.AudioContextFactory.currentTime() + 1000 });
  guitarLoop.play({ volume: 0.5, scheduledStartTime: ex.AudioContextFactory.currentTime() + 1000 });
  challengeMusic.play({ volume: 0.5, scheduledStartTime: ex.AudioContextFactory.currentTime() + 1000 });
});
