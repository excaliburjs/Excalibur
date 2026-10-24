var game = new ex.Engine({
  width: 300,
  height: 300
});

var loader = new ex.Loader();

var testsnd = new ex.Sound({ name: 'test', paths: ['./jump.mp3'] });
var jumpsnd = new ex.Sound({
  name: 'jump',
  paths: ['./jump.mp3']
  // maxConcurrentTracks: 2
});
var loopforest = new ex.Sound({ name: 'loop-forest', paths: ['./loop-forest.mp3'] });
var soundManager = new ex.SoundManager({
  // voiceStealing: true,
  // maxConcurrentTracks: 1,
  channels: ['fx', 'music', 'background'],
  sounds: [
    {
      sound: jumpsnd,
      volume: 0.4,
      channel: 'fx'
    },
    {
      sound: loopforest,
      volume: 0.2,
      channel: 'background'
    },
    {
      sound: new ex.Sound({
        name: 'challengeloopfixed',
        loop: true,
        paths: ['./challengeloopfixed.mp3']
      }),
      volume: 0.6,
      channel: 'music',
      maxConcurrentTracks: 1,
      voiceStealing: true
    }
    // {
    //   sound: new ex.Sound({
    //     name: 'loop-guitar',
    //     paths: ['./loop-guitar.mp3'],
    //     loop: true
    //   }),
    //   volume: 0.2,
    //   channel: 'music'
    // }
  ]
});

soundManager.getChannel('fx').voiceStealing = true;
soundManager.getChannel('fx').maxConcurrentTracks = 1;

soundManager.getChannel('music').voiceStealing = true;
soundManager.getChannel('music').maxConcurrentTracks = 2;

loader.addResource(soundManager);

var toggleMusic = new ex.Label({
  pos: ex.vec(100, 100),
  text: 'Toggle Music'
});
toggleMusic.on('pointerdown', () => {
  soundManager.channel.toggle('music');
});
game.add(toggleMusic);
soundManager.getVolume(jumpsnd);

console.log('getSounds()', soundManager.getSounds());
console.log('channel count', soundManager.getSoundsForChannel('music'));

game.input.keyboard.on('press', (evt) => {
  if (evt.key === ex.Keys.J) {
    soundManager.play('jump');
  }

  if (evt.key === ex.Keys.M) {
    soundManager.channel.mute('music');
  }

  if (evt.key === ex.Keys.B) {
    soundManager.channel.play('background');
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
  // soundManager.play('loop-forest');
  // soundManager.play('challengeloopfixed');
});
