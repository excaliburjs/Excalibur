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

var soundManager = new ex.SoundManger({
  channels: ['fx', 'music', 'background'],
  sounds: [
    { sound: jumpSnd, volume: 0.4, channels: ['fx'] },
    { sound: forestSnd, volume: 0.2, channels: ['music', 'background'] },
    { sound: challengeMusic, volume: 0.2, channels: ['music'] },
    { sound: guitarLoop, volume: 0.2, channels: ['music'] }
  ]
});

var toggleMusic = new ex.Label({
  pos: ex.vec(100, 100),
  text: 'Toggle Music'
});
toggleMusic.on('pointerdown', () => {
  soundManager.toggle(['music']);
});
game.add(toggleMusic);
soundManager.getVolume(jumpSnd);
console.log('getSounds()', soundManager.getSounds());
console.log('tag count', soundManager.getSoundsForTag('music'));

game.input.keyboard.on('press', (evt) => {
  if (evt.key === ex.Keys.J) {
    soundManager.play(jumpSnd);
  }

  if (evt.key === ex.Keys.M) {
    soundManager.mute(['music']);
  }

  if (evt.key === ex.Keys.A) {
    soundManager.mute();
  }

  if (evt.key === ex.Keys.S) {
    soundManager.unmute();
  }

  if (evt.key === ex.Keys.U) {
    soundManager.unmute(['music']);
  }

  if (evt.key === ex.Keys.P) {
    soundManager.play(['music']);
  }

  if (evt.key === ex.Keys.V) {
    soundManager.setVolume(['music'], 0.9);
  }
});

game.start(loader).then(() => {
  soundManager.play(forestSnd);
  soundManager.play(challengeMusic);
});
