import * as ex from 'excalibur';

// Spatial audio: a Sound's `onPlay` hook wires each playback through a Web Audio PannerNode and the
// AudioContext listener follows the player, so sounds pan and fade with distance as you walk around.
// Art and audio are from Gem Jam, our Ludum Dare 58 entry: https://excaliburjs.com/ludum-58/
const game = new ex.Engine({
  canvasElementId: 'preview-canvas',
  displayMode: ex.DisplayMode.FillContainer,
  backgroundColor: ex.Color.fromHex('#1b0f12')
});

const gemJam = 'https://excaliburjs.com/ludum-58/';
const images = {
  dirt: new ex.ImageSource(gemJam + 'images/dirt_back.png'),
  dwarfIdle: new ex.ImageSource(gemJam + 'images/dwarf_idle.png'),
  dwarfWalk1: new ex.ImageSource(gemJam + 'images/dwarf_walk1.png'),
  dwarfWalk2: new ex.ImageSource(gemJam + 'images/dwarf_walk2.png'),
  beetle1: new ex.ImageSource(gemJam + 'images/beetle1.png'),
  beetle2: new ex.ImageSource(gemJam + 'images/beetle2.png'),
  chest: new ex.ImageSource(gemJam + 'images/chest.png'),
  ruby: new ex.ImageSource(gemJam + 'images/ruby.png')
};

const mixer = new ex.SoundManager({
  channels: [{ name: 'fx', maxConcurrentTracks: 6, voiceStealing: true }, { name: 'music', volume: 0.8 }],
  sounds: [
    { name: 'scurry', sound: new ex.Sound({ paths: [gemJam + 'sounds/beetle_move.mp3'], loop: true }), channel: 'fx', volume: 0.6 },
    { name: 'bite', sound: new ex.Sound(gemJam + 'sounds/beetle_bite.mp3'), channel: 'fx' },
    { name: 'step', sound: new ex.Sound(gemJam + 'sounds/player_step.mp3'), channel: 'fx', volume: 0.25 },
    { name: 'pickup', sound: new ex.Sound(gemJam + 'sounds/get_rare.mp3'), channel: 'fx', volume: 0.7 },
    { name: 'musicbox', sound: new ex.Sound({ paths: [gemJam + 'sounds/title.mp3'], loop: true }), channel: 'music' }
  ]
});

const audioContext = ex.AudioContextFactory.create();
const REF_DISTANCE = 60; // pixels, a source is at full volume this close

// Wire one playback through a PannerNode at a world position. The panner is remembered by track so
// moving emitters can update it later: a track is the key the `onPlay` context hands you.
const panners = new WeakMap<ex.SoundTrack, PannerNode>();
const spatialize =
  (pos: ex.Vector): ex.AudioGraphBuilder =>
  ({ audioContext, source, destination, track }) => {
    const panner = new PannerNode(audioContext, {
      panningModel: 'HRTF', // head-related transfer function: real left/right/behind cues on headphones
      distanceModel: 'inverse',
      refDistance: REF_DISTANCE,
      maxDistance: 1000,
      rolloffFactor: 1.5,
      positionX: pos.x,
      positionZ: pos.y // the listener faces "up" the screen, so world y is the forward/back axis
    });
    source.connect(panner).connect(destination);
    panners.set(track, panner);
  };

// Automate parameters instead of assigning them, an abrupt jump in position clicks
function glide(param: AudioParam, value: number) {
  param.setTargetAtTime(value, audioContext.currentTime, 0.05);
}
function moveSource(track: ex.SoundTrack | null, pos: ex.Vector) {
  const panner = track && panners.get(track);
  if (panner) {
    glide(panner.positionX, pos.x);
    glide(panner.positionZ, pos.y);
  }
}
function moveListener(pos: ex.Vector) {
  const listener = audioContext.listener;
  glide(listener.positionX, pos.x);
  glide(listener.positionZ, pos.y);
}

// A cave bigger than the screen so there is somewhere to walk, the camera follows the miner
const WORLD = new ex.BoundingBox(0, 0, 1200, 800);
const cave = new ex.Actor({ name: 'cave', pos: WORLD.center, z: -2 });
cave.graphics.use(new ex.TiledSprite({ image: images.dirt, width: WORLD.width, height: WORLD.height }));
game.add(cave);

const font = new ex.Font({
  size: 14,
  family: 'sans-serif',
  color: ex.Color.White,
  textAlign: ex.TextAlign.Center,
  shadow: { blur: 2, offset: ex.vec(1, 1), color: ex.Color.Black }
});

// Marks an emitter on the map: a ring at refDistance and a label
function emitterMarker(actor: ex.Actor, label: string) {
  const ring = new ex.Actor({ name: 'ring', z: -1 });
  ring.graphics.use(new ex.Circle({ radius: REF_DISTANCE, color: ex.Color.Transparent, strokeColor: ex.Color.fromHex('#ffd16688'), lineWidth: 2 }));
  actor.addChild(ring);
  actor.addChild(new ex.Label({ text: label, pos: ex.vec(0, 44), font }));
}

const random = new ex.Random(58);
const dwarf = new ex.Actor({ name: 'dwarf', pos: WORLD.center, z: 2 });
dwarf.graphics.add('idle', images.dwarfIdle.toSprite());
dwarf.graphics.add(
  'walk',
  new ex.Animation({ frames: [{ graphic: images.dwarfWalk1.toSprite() }, { graphic: images.dwarfWalk2.toSprite() }], frameDuration: 200 })
);
dwarf.graphics.use('idle');
game.add(dwarf);

// A music box in the far corner, a stationary looping source: walk towards it and it swells
const musicBox = new ex.Actor({ name: 'music box', pos: ex.vec(1040, 150) });
musicBox.graphics.use(images.chest.toSprite());
emitterMarker(musicBox, 'music box');
game.add(musicBox);

// A beetle on patrol, a moving looping source: it scurries past you from one ear to the other
const beetle = new ex.Actor({ name: 'beetle', pos: ex.vec(150, 250), z: 1 });
beetle.graphics.use(
  new ex.Animation({ frames: [{ graphic: images.beetle1.toSprite() }, { graphic: images.beetle2.toSprite() }], frameDuration: 150 })
);
emitterMarker(beetle, 'beetle');
beetle.actions.repeatForever((ctx) =>
  ctx.moveTo(ex.vec(1050, 250), 90).moveTo(ex.vec(1050, 550), 90).moveTo(ex.vec(150, 550), 90).moveTo(ex.vec(150, 250), 90)
);
let scurry: ex.SoundTrack | null = null;
let biteCooldown = 0;
beetle.onPostUpdate = (_engine, elapsed) => {
  if (beetle.vel.x !== 0) {
    beetle.graphics.flipHorizontal = beetle.vel.x > 0;
  }
  // Follow the beetle with its sound every frame
  moveSource(scurry, beetle.pos);

  // One-shots are positioned the same way, at the beetle's position the moment it bites
  biteCooldown -= elapsed;
  if (biteCooldown <= 0 && beetle.pos.distance(dwarf.pos) < 90) {
    biteCooldown = 1500;
    mixer.play('bite', { onPlay: spatialize(beetle.pos) });
    dwarf.actions.blink(80, 80, 3);
  }
};
game.add(beetle);

// Gems to go collect, a reason to walk around the cave
let gemsLeft = 0;
for (let i = 0; i < 8; i++) {
  const gem = new ex.Actor({ name: 'gem', pos: ex.vec(random.integer(80, 1120), random.integer(80, 720)) });
  gem.graphics.use(images.ruby.toSprite({ destSize: { width: 36, height: 36 } }));
  gem.onPostUpdate = () => {
    if (gem.pos.distance(dwarf.pos) < 30) {
      gem.kill();
      gemsLeft--;
      mixer.play('pickup');
    }
  };
  game.add(gem);
  gemsLeft++;
}

// Walk with a click or with WASD / arrow keys
game.input.pointers.primary.on('down', (evt) => {
  dwarf.actions.clearActions();
  dwarf.actions.moveTo(evt.worldPos, 140);
});
const keys = game.input.keyboard;
let walkingByKey = false;
let stepTimer = 0;
dwarf.onPostUpdate = (_engine, elapsed) => {
  const dir = ex.vec(0, 0);
  dir.x += keys.isHeld(ex.Keys.D) || keys.isHeld(ex.Keys.Right) ? 1 : 0;
  dir.x -= keys.isHeld(ex.Keys.A) || keys.isHeld(ex.Keys.Left) ? 1 : 0;
  dir.y += keys.isHeld(ex.Keys.S) || keys.isHeld(ex.Keys.Down) ? 1 : 0;
  dir.y -= keys.isHeld(ex.Keys.W) || keys.isHeld(ex.Keys.Up) ? 1 : 0;
  if (dir.x !== 0 || dir.y !== 0) {
    dwarf.actions.clearActions();
    dwarf.vel = dir.normalize().scale(140);
    walkingByKey = true;
  } else if (walkingByKey) {
    dwarf.vel = ex.Vector.Zero;
    walkingByKey = false;
  }
  dwarf.pos.x = ex.clamp(dwarf.pos.x, WORLD.left + 32, WORLD.right - 32);
  dwarf.pos.y = ex.clamp(dwarf.pos.y, WORLD.top + 32, WORLD.bottom - 32);

  const moving = dwarf.vel.x !== 0 || dwarf.vel.y !== 0;
  dwarf.graphics.use(moving ? 'walk' : 'idle');
  if (dwarf.vel.x !== 0) {
    dwarf.graphics.flipHorizontal = dwarf.vel.x > 0;
  }
  stepTimer += elapsed;
  if (moving && stepTimer > 350) {
    stepTimer = 0;
    mixer.play('step', { pitch: random.integer(-200, 200) });
  }

  // The listener is the miner: everything else is heard relative to this point
  moveListener(dwarf.pos);
};

// HUD in screen space, so it stays put while the camera follows the miner
for (const y of [0, 366]) {
  game.add(new ex.ScreenElement({ pos: ex.vec(0, y), width: 600, height: 30, color: new ex.Color(0, 0, 0, 0.5), z: 9 }));
}
const hud = new ex.Label({ pos: ex.vec(300, 20), font, coordPlane: ex.CoordPlane.Screen, z: 10 });
hud.onPostUpdate = () => {
  hud.text =
    `beetle ${Math.round(beetle.pos.distance(dwarf.pos))}px   music box ${Math.round(musicBox.pos.distance(dwarf.pos))}px   ` +
    `gems left ${gemsLeft}`;
};
game.add(hud);
game.add(
  new ex.Label({ text: 'click or use WASD to walk, headphones recommended', pos: ex.vec(300, 380), font, coordPlane: ex.CoordPlane.Screen, z: 10 })
);

const camera = game.currentScene.camera;
camera.strategy.lockToActor(dwarf);
camera.strategy.limitCameraBounds(WORLD);

const loader = new ex.Loader([mixer, ...Object.values(images)]);
game.start(loader).then(() => {
  // Looping sources start once, `start()` hands back the track so the emitter can keep moving it
  scurry = mixer.start('scurry', { onPlay: spatialize(beetle.pos) });
  mixer.start('musicbox', { onPlay: spatialize(musicBox.pos) });
});
