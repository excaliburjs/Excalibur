import * as ex from 'excalibur';

// Adaptive music: start every stem on the same audio-clock tick, then crossfade
// them with the mixer as the player goes deeper. Lifted from Gem Jam (Ludum Dare 58).
// Art and audio are from Gem Jam: https://excaliburjs.com/ludum-58/
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
  dwarfIdle: new ex.ImageSource(gemJam + 'images/dwarf_idle.png'),
  dwarfMine1: new ex.ImageSource(gemJam + 'images/dwarf_mine1.png'),
  dwarfMine2: new ex.ImageSource(gemJam + 'images/dwarf_mine2.png')
};

// Stems from Gem Jam, loops of identical length so they stay in phase forever
const stems = gemJam + 'sounds/';
const surface = new ex.Sound({ name: 'surface', paths: [stems + 'surface_2.1.mp3'], loop: true });
const drums = new ex.Sound({ name: 'drums', paths: [stems + 'ind_drums_2.1.mp3'], loop: true });
const topper = new ex.Sound({ name: 'topper', paths: [stems + 'ind_top_2.1.mp3'], loop: true });

const mixer = new ex.SoundManager({
  channels: ['music', 'fx'],
  sounds: [
    { sound: surface, channel: 'music', volume: 0.5 },
    { sound: drums, channel: 'music', volume: 0 },
    { sound: topper, channel: 'music', volume: 0 },
    { name: 'dig', sound: new ex.Sound(stems + 'player_dig.mp3'), channel: 'fx', volume: 0.5 }
  ]
});

// The manager is Loadable, one resource loads every sound it manages
const loader = new ex.Loader([mixer, ...Object.values(images)]);

const font = new ex.Font({
  size: 16,
  family: 'sans-serif',
  color: ex.Color.White,
  textAlign: ex.TextAlign.Center,
  shadow: { blur: 2, offset: ex.vec(1, 1), color: ex.Color.Black }
});
const status = new ex.Label({ text: 'move the mouse down to dig deeper', pos: ex.vec(300, 20), font, z: 5 });
game.add(status);

// A grass surface over six rows of dirt, the miner digs a shaft straight down the middle
const TILE = 50;
const SHAFT_X = 275;
const destSize = { width: TILE, height: TILE };
const shaft: { tile: ex.Actor; dug: boolean }[] = [];
for (let col = 0; col < 12; col++) {
  const x = col * TILE + TILE / 2;
  const grass = new ex.Actor({ name: 'grass', pos: ex.vec(x, 85) });
  grass.graphics.use(images.grass.toSprite({ destSize }));
  game.add(grass);
  for (let row = 0; row < 6; row++) {
    const tile = new ex.Actor({ name: 'dirt', pos: ex.vec(x, 110 + row * TILE + TILE / 2) });
    tile.graphics.use(images.dirt.toSprite({ destSize }));
    game.add(tile);
    if (x === SHAFT_X) {
      shaft.push({ tile, dug: false });
    }
  }
}

const dwarf = new ex.Actor({ name: 'miner', pos: ex.vec(SHAFT_X, 72), z: 2 });
dwarf.graphics.add('idle', images.dwarfIdle.toSprite());
dwarf.graphics.add(
  'mine',
  new ex.Animation({ frames: [{ graphic: images.dwarfMine1.toSprite() }, { graphic: images.dwarfMine2.toSprite() }], frameDuration: 100 })
);
dwarf.graphics.use('idle');
game.add(dwarf);

// Level meters for the three stems
game.add(new ex.Actor({ name: 'meter panel', pos: ex.vec(520, 310), width: 150, height: 170, color: new ex.Color(0, 0, 0, 0.55), z: 3 }));
const meter = (name: string, x: number) => {
  const bar = new ex.Actor({ name, pos: ex.vec(x, 360), z: 4 });
  const rect = new ex.Rectangle({ width: 24, height: 1, color: ex.Color.fromHex('#8ecae6') });
  bar.graphics.use(rect);
  game.add(bar);
  game.add(new ex.Label({ text: name, pos: ex.vec(x, 372), font: new ex.Font({ size: 12, family: 'sans-serif', color: ex.Color.White, textAlign: ex.TextAlign.Center }), z: 4 }));
  return { bar, rect };
};
const meters = { surface: meter('surface', 480), drums: meter('drums', 520), topper: meter('topper', 560) };

function setLevel(name: 'surface' | 'drums' | 'topper', level: number) {
  mixer.setVolume(name, level); // the sound's mix gain, Sound.volume is untouched
  const height = 1 + level * 220;
  meters[name].rect.height = height;
  meters[name].bar.pos.y = 360 - height / 2; // grow upward from the baseline
}

let idleFor = 0;
game.input.pointers.primary.on('move', (evt) => {
  const depth = ex.clamp((evt.worldPos.y - 72) / 288, 0, 1);
  const y = 72 + depth * 288;
  if (Math.abs(y - dwarf.pos.y) > 0.5) {
    idleFor = 0;
    dwarf.graphics.use('mine');
  }
  dwarf.pos.y = y;
  // Dig out the shaft tiles the miner has reached, with a dig sound for each new one
  for (const entry of shaft) {
    if (!entry.dug && entry.tile.pos.y < y + 20) {
      entry.dug = true;
      entry.tile.graphics.use(images.tunnel.toSprite({ destSize }));
      mixer.play('dig', { pitch: (Math.random() - 0.5) * 400 });
    }
  }
  // 0..0.5: surface fades out while the drums come in, 0.5..1: the topper joins
  const dig = ex.clamp(depth / 0.5, 0, 1);
  const deep = ex.clamp((depth - 0.5) / 0.5, 0, 1);
  setLevel('surface', 0.5 * (1 - dig));
  setLevel('drums', 0.5 * dig);
  setLevel('topper', 0.5 * deep);
  status.text =
    depth < 0.05 ? 'surface' : depth < 0.5 ? `digging... ${Math.round(depth * 100)}m` : `deep underground ${Math.round(depth * 100)}m`;
});
dwarf.onPostUpdate = (_engine, elapsed) => {
  idleFor += elapsed;
  if (idleFor > 250) {
    dwarf.graphics.use('idle');
  }
};

game.start(loader).then(() => {
  setLevel('surface', 0.5);
  // Schedule every stem for the same moment on the audio clock so they are sample-aligned
  const start = ex.AudioContextFactory.currentTime() + 200;
  mixer.play('surface', { scheduledStartTime: start });
  mixer.play('drums', { scheduledStartTime: start });
  mixer.play('topper', { scheduledStartTime: start });
});
