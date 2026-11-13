import * as ex from 'excalibur';

// The SoundManager is a real Web Audio mixer: Sound -> channel -> master -> speakers.
// Every bus exposes its nodes, so effects can be inserted anywhere in the graph.
// Art and audio are from Gem Jam, our Ludum Dare 58 entry: https://excaliburjs.com/ludum-58/
const game = new ex.Engine({
  canvasElementId: 'preview-canvas',
  displayMode: ex.DisplayMode.FillContainer,
  backgroundColor: ex.Color.fromHex('#7fb7e6')
});

const gemJam = 'https://excaliburjs.com/ludum-58/';
const images = {
  grass: new ex.ImageSource(gemJam + 'images/grass.png'),
  dirt: new ex.ImageSource(gemJam + 'images/dirt_front.png'),
  tunnel: new ex.ImageSource(gemJam + 'images/dirt_back.png'),
  emerald: new ex.ImageSource(gemJam + 'images/emerald.png'),
  ruby: new ex.ImageSource(gemJam + 'images/ruby.png'),
  gold: new ex.ImageSource(gemJam + 'images/gold.png'),
  dwarfIdle: new ex.ImageSource(gemJam + 'images/dwarf_idle.png'),
  dwarfMine1: new ex.ImageSource(gemJam + 'images/dwarf_mine1.png'),
  dwarfMine2: new ex.ImageSource(gemJam + 'images/dwarf_mine2.png')
};

// Effect nodes can be created up front on the engine's shared AudioContext
const audioContext = ex.AudioContextFactory.create();
const muffle = audioContext.createBiquadFilter();
muffle.type = 'lowpass';
muffle.frequency.value = 20000; // wide open, nothing is filtered yet

const mixer = new ex.SoundManager({
  volume: 0.9, // master volume
  channels: [
    // Channels can cap simultaneous tracks; voiceStealing stops the oldest instead of dropping the new one
    { name: 'fx', maxConcurrentTracks: 4, voiceStealing: true },
    {
      name: 'music',
      volume: 0.5,
      // Channel bus effects: every sound on the music channel runs through the low-pass filter
      onConnect: ({ input, output }) => {
        input.connect(muffle).connect(output);
      }
    }
  ],
  sounds: [
    { name: 'dig', sound: new ex.Sound(gemJam + 'sounds/player_dig.mp3'), channel: 'fx', volume: 0.6 },
    { name: 'common', sound: new ex.Sound(gemJam + 'sounds/get_common.mp3'), channel: 'fx' },
    { name: 'rare', sound: new ex.Sound(gemJam + 'sounds/get_rare.mp3'), channel: 'fx' },
    { name: 'legendary', sound: new ex.Sound(gemJam + 'sounds/get_legendary.mp3'), channel: 'fx' },
    { name: 'music', sound: new ex.Sound({ paths: [gemJam + 'sounds/title.mp3'], loop: true }), channel: 'music' }
  ],
  // Master bus effects: a compressor keeps a pile of overlapping digs and pickups from clipping
  onConnect: ({ audioContext, input, output }) => {
    const compressor = audioContext.createDynamicsCompressor();
    compressor.threshold.value = -18;
    input.connect(compressor).connect(output);
  }
});

// Pan a single playback to a stereo position with the per-play `onPlay` audio graph hook
const panTo =
  (pan: number): ex.AudioGraphBuilder =>
  ({ audioContext, source, destination }) => {
    const panner = audioContext.createStereoPanner();
    panner.pan.value = pan;
    source.connect(panner).connect(destination);
  };

const font = new ex.Font({
  size: 16,
  family: 'sans-serif',
  color: ex.Color.White,
  textAlign: ex.TextAlign.Center,
  baseAlign: ex.BaseAlign.Middle,
  shadow: { blur: 2, offset: ex.vec(1, 1), color: ex.Color.Black }
});
const status = new ex.Label({ text: 'click the dirt to dig, digs are panned to where you click', pos: ex.vec(300, 24), font, z: 5 });
game.add(status);

// The surface: a row of grass with the miner standing on it
const TILE = 50;
const destSize = { width: TILE, height: TILE };
for (let col = 0; col < 12; col++) {
  const grass = new ex.Actor({ name: 'grass', pos: ex.vec(col * TILE + TILE / 2, 75) });
  grass.graphics.use(images.grass.toSprite({ destSize }));
  game.add(grass);
}

const dwarf = new ex.Actor({ name: 'dwarf', pos: ex.vec(25, 62), z: 2 });
dwarf.graphics.add('idle', images.dwarfIdle.toSprite());
dwarf.graphics.add(
  'mine',
  new ex.Animation({ frames: [{ graphic: images.dwarfMine1.toSprite() }, { graphic: images.dwarfMine2.toSprite() }], frameDuration: 100 })
);
dwarf.graphics.use('idle');
game.add(dwarf);

// Four rows of dirt, about a third of the tiles hide a gem (better ones deeper down)
type Rarity = 'common' | 'rare' | 'legendary';
const gemImages: Record<Rarity, ex.ImageSource> = { common: images.emerald, rare: images.ruby, legendary: images.gold };
const random = new ex.Random(58);
for (let row = 0; row < 4; row++) {
  for (let col = 0; col < 12; col++) {
    const pos = ex.vec(col * TILE + TILE / 2, 100 + row * TILE + TILE / 2);
    const tile = new ex.Actor({ name: `dirt-${col}-${row}`, pos, width: TILE, height: TILE });
    tile.graphics.use(images.dirt.toSprite({ destSize }));
    const roll = random.next();
    const hidden: Rarity | null = roll < 0.2 ? 'common' : roll < 0.3 && row > 0 ? 'rare' : roll < 0.34 && row > 2 ? 'legendary' : null;
    let dug = false;
    tile.on('pointerdown', () => {
      if (dug) {
        return;
      }
      dug = true;
      tile.graphics.use(images.tunnel.toSprite({ destSize }));

      // The miner runs over and swings, the sound plays right away
      dwarf.graphics.flipHorizontal = pos.x > dwarf.pos.x;
      dwarf.graphics.use('mine');
      dwarf.actions.clearActions();
      dwarf.actions.moveTo(ex.vec(pos.x, 62), 500).callMethod(() => dwarf.graphics.use('idle'));

      const pan = ex.clamp((pos.x / game.drawWidth) * 2 - 1, -1, 1);
      // Per-play overrides never change the Sound's configuration: a random pitch so no two digs sound alike
      mixer.play('dig', { pitch: random.integer(-300, 300), onPlay: panTo(pan) });
      status.text = `dig at pan ${pan.toFixed(2)}, fx tracks playing: ${mixer.getChannel('fx').playingCount()}`;

      if (hidden) {
        const gem = new ex.Actor({ name: hidden, pos, z: 1, scale: ex.vec(0, 0) });
        gem.graphics.use(gemImages[hidden].toSprite({ destSize: { width: 36, height: 36 } }));
        gem.actions.delay(150).callMethod(() => {
          mixer.play(hidden, { onPlay: panTo(pan) });
          status.text = `found a ${hidden} gem! fx tracks playing: ${mixer.getChannel('fx').playingCount()}`;
        });
        gem.actions.scaleTo({ scale: ex.vec(1, 1), duration: 250 });
        game.add(gem);
      }
    });
    game.add(tile);
  }
}

// Mixer controls
game.add(new ex.Actor({ name: 'panel', pos: ex.vec(300, 350), width: 600, height: 100, color: ex.Color.fromHex('#10221c') }));
function button(text: string, pos: ex.Vector, onClick: () => void) {
  const actor = new ex.Actor({ name: text, pos, width: 170, height: 44, color: ex.Color.fromHex('#2d6a4f') });
  actor.addChild(new ex.Label({ text, font }));
  actor.on('pointerdown', onClick);
  game.add(actor);
  return actor;
}

const musicChannel = mixer.getChannel('music');
let playing = false;
button('music on/off', ex.vec(130, 350), () => {
  playing = !playing;
  if (playing) {
    mixer.play('music');
  } else {
    mixer.stop('music');
  }
  status.text = playing ? 'music playing on the music channel' : 'music stopped';
});

button('mute music', ex.vec(300, 350), () => {
  mixer.channel.toggle('music');
  // Muting is gain-based now, so a muted track keeps playing and is mid-clip when unmuted
  status.text = musicChannel.muted ? 'music channel muted (still advancing)' : 'music channel unmuted';
});

let muffled = false;
button('muffle music', ex.vec(470, 350), () => {
  muffled = !muffled;
  // The filter is a live node in the channel's graph, so automating it changes the mix in place
  muffle.frequency.setTargetAtTime(muffled ? 400 : 20000, audioContext.currentTime, 0.1);
  status.text = muffled ? 'music low-passed at 400 Hz, like hearing it from underground' : 'music filter opened back up';
});

// The manager is Loadable, one resource loads every sound it manages
const loader = new ex.Loader([mixer, ...Object.values(images)]);
// Browsers only allow audio after a user gesture, the loader's play button takes care of that
game.start(loader);
