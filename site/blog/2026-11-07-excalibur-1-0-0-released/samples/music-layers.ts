import * as ex from 'excalibur';

// Adaptive music: start every stem on the same audio-clock tick, then crossfade
// them with the mixer as the player goes deeper. Lifted from Gem Jam (Ludum Dare 58).
const game = new ex.Engine({
  canvasElementId: 'preview-canvas',
  displayMode: ex.DisplayMode.FillContainer,
  backgroundColor: ex.Color.fromHex('#2b1d0e')
});

// Stems from Gem Jam, loops of identical length so they stay in phase forever
const stems = 'https://excaliburjs.com/ludum-58/sounds/';
const surface = new ex.Sound({ name: 'surface', paths: [stems + 'surface_2.1.mp3'], loop: true });
const drums = new ex.Sound({ name: 'drums', paths: [stems + 'ind_drums_2.1.mp3'], loop: true });
const topper = new ex.Sound({ name: 'topper', paths: [stems + 'ind_top_2.1.mp3'], loop: true });

const mixer = new ex.SoundManager({
  channels: ['music'],
  sounds: [
    { sound: surface, channel: 'music', volume: 0.5 },
    { sound: drums, channel: 'music', volume: 0 },
    { sound: topper, channel: 'music', volume: 0 }
  ]
});

// The manager is Loadable, one resource loads every stem it manages
const loader = new ex.Loader([mixer]);

// A "depth" meter the mouse drives
const font = new ex.Font({ size: 16, family: 'sans-serif', color: ex.Color.fromHex('#f3e2c0'), textAlign: ex.TextAlign.Center });
const status = new ex.Label({ text: 'move the mouse down to dig deeper', pos: ex.vec(300, 30), font, z: 1 });
game.add(status);

const ground = new ex.Actor({ name: 'ground', pos: ex.vec(300, 230), width: 600, height: 340, color: ex.Color.fromHex('#5a3b1c') });
game.add(ground);
const sky = new ex.Actor({ name: 'sky', pos: ex.vec(300, 30), width: 600, height: 60, color: ex.Color.fromHex('#7fb7e6') });
game.add(sky);
const miner = new ex.Actor({ name: 'miner', pos: ex.vec(300, 60), width: 18, height: 26, color: ex.Color.fromHex('#ffd166') });
game.add(miner);

const meter = (name: string, x: number) => {
  const bar = new ex.Actor({ name, pos: ex.vec(x, 360) });
  const rect = new ex.Rectangle({ width: 24, height: 1, color: ex.Color.fromHex('#8ecae6') });
  bar.graphics.use(rect);
  game.add(bar);
  game.add(
    new ex.Label({
      text: name,
      pos: ex.vec(x, 380),
      font: new ex.Font({ size: 12, family: 'sans-serif', color: ex.Color.White, textAlign: ex.TextAlign.Center })
    })
  );
  return { bar, rect };
};
const meters = { surface: meter('surface', 500), drums: meter('drums', 540), topper: meter('topper', 580) };

function setLevel(name: 'surface' | 'drums' | 'topper', level: number) {
  mixer.setVolume(name, level); // the sound's mix gain, Sound.volume is untouched
  const height = 1 + level * 120;
  meters[name].rect.height = height;
  meters[name].bar.pos.y = 360 - height / 2; // grow upward from the baseline
}

game.input.pointers.primary.on('move', (evt) => {
  const depth = ex.clamp((evt.worldPos.y - 60) / 300, 0, 1);
  miner.pos.y = 60 + depth * 300;
  // 0..0.5: surface fades out while the drums come in, 0.5..1: the topper joins
  const dig = ex.clamp(depth / 0.5, 0, 1);
  const deep = ex.clamp((depth - 0.5) / 0.5, 0, 1);
  setLevel('surface', 0.5 * (1 - dig));
  setLevel('drums', 0.5 * dig);
  setLevel('topper', 0.5 * deep);
  status.text =
    depth < 0.05 ? 'surface' : depth < 0.5 ? `digging... ${Math.round(depth * 100)}m` : `deep underground ${Math.round(depth * 100)}m`;
});

game.start(loader).then(() => {
  // Schedule every stem for the same moment on the audio clock so they are sample-aligned
  const start = ex.AudioContextFactory.currentTime() + 200;
  mixer.play('surface', { scheduledStartTime: start });
  mixer.play('drums', { scheduledStartTime: start });
  mixer.play('topper', { scheduledStartTime: start });
});
