var game = new ex.Engine({
  width: 300,
  height: 300
});

var loader = new ex.Loader();
// var jumpSnd = new ex.Sound('./jump.mp3');
// loader.addResource(jumpSnd);
//
// var forestSnd = new ex.Sound({
//   paths: ['./loop-forest.mp3'],
//   loop: true,
//   volume: 0.9
// });
// loader.addResource(forestSnd);
//
// var challengeMusic = new ex.Sound('./challengeloopfixed.mp3');
// challengeMusic.loop = true;
// loader.addResource(challengeMusic);
//
// var guitarLoop = new ex.Sound('./loop-guitar.mp3');
// guitarLoop.loop = true;
// loader.addResource(guitarLoop);

// Maybe make sound manager a loadable

var testsnd = new ex.Sound({ name: 'test', paths: ['./jump.mp3'] });
var jumpsnd = new ex.Sound({ name: 'jump', paths: ['./jump.mp3'] });
var loopforest = new ex.Sound({ name: 'loop-forest', paths: ['./loop-forest.mp3'] });

var soundManager = new ex.SoundManager({
  channels: ['fx', 'music', 'background'],
  sounds: [
    { sound: jumpsnd, volume: 0.4, channel: 'fx' },
    { sound: loopforest, volume: 0.2, channel: 'music' },
    { sound: new ex.Sound({ name: 'challengeloopfixed', paths: ['./challengeloopfixed.mp3'] }), volume: 0.2, channel: 'music' },
    { sound: new ex.Sound({ name: 'loop-guitar', paths: ['./loop-guitar.mp3'] }), volume: 0.2, channel: 'music' }
  ]
});

loader.addResource(soundManager);

// var soundManager = new ex.SoundManger({
//   channels: ['fx', 'music', 'background'],
//   sounds: {
//     jumpSnd: { sound: jumpSnd, volume: 0.4, channels: ['fx'] },
//     forestSnd: { sound: forestSnd, volume: 0.2, channels: ['music', 'background'] },
//     challengeMusic: { sound: challengeMusic, volume: 0.2, channels: ['music'] },
//     guitarLoop: { sound: guitarLoop, volume: 0.2, channels: ['music'] }
//   }
// });

var toggleMusic = new ex.Label({
  pos: ex.vec(100, 100),
  text: 'Toggle Music'
});
toggleMusic.on('pointerdown', () => {
  soundManager.channel.toggle('music');
});
game.add(toggleMusic);
soundManager.getVolume(jumpSnd);
console.log('getSounds()', soundManager.getSounds());
console.log('channel count', soundManager.getSoundsForChannel('music'));

game.input.keyboard.on('press', (evt) => {
  if (evt.key === ex.Keys.J) {
    soundManager.play('jump');
  }

  if (evt.key === ex.Keys.M) {
    soundManager.channel.mute('music');
  }

  if (evt.key === ex.Keys.A) {
    soundManager.mute();
  }

  if (evt.key === ex.Keys.S) {
    soundManager.unmute();
  }

  if (evt.key === ex.Keys.U) {
    soundManager.channel.unmute('music');
  }

  if (evt.key === ex.Keys.P) {
    soundManager.channel.play('music');
  }

  if (evt.key === ex.Keys.V) {
    soundManager.channel.setVolume('music', 0.9);
  }
});

game.start(loader).then(() => {
  soundManager.play('loop-forest');
  soundManager.play('challengeloopfixed');
});
