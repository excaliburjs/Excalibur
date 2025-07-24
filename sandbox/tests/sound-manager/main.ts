var game = new ex.Engine({
  width: 300,
  height: 300
});

var loader = new ex.Loader();
var jumpSnd = new ex.Sound('./jump.mp3');
loader.addResource(jumpSnd);

var forestSnd = new ex.Sound('./loop-forest.mp3');
forestSnd.loop = true;
loader.addResource(forestSnd);

var soundManager = new ex.SoundManger({
  mix: [
    { sound: jumpSnd, volume: 0.4, channels: ['fx'] },
    { sound: forestSnd, volume: 0.2, channels: ['music'] }
  ]
});

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
});

game.start(loader).then(() => {
  soundManager.play(forestSnd);
});
