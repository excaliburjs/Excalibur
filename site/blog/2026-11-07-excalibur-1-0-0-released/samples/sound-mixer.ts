import * as ex from 'excalibur';

// The SoundManager is a real Web Audio mixer: Sound -> channel -> master -> speakers.
// Every bus exposes its nodes, so effects can be inserted anywhere in the graph.
const game = new ex.Engine({
  canvasElementId: 'preview-canvas',
  displayMode: ex.DisplayMode.FillContainer,
  backgroundColor: ex.Color.fromHex('#10221c')
});

// Synthesize short clips so this sample ships with zero audio files.
// `Sound.fromBlob` decodes any Blob the browser can play (here: generated WAV).
function tone(frequency: number, durationMs: number, type: 'sine' | 'square' | 'triangle'): Blob {
  const sampleRate = 22050;
  const length = Math.floor((sampleRate * durationMs) / 1000);
  const buffer = new ArrayBuffer(44 + length * 2);
  const view = new DataView(buffer);
  const writeString = (offset: number, s: string) => [...s].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)));
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length * 2, true);
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const phase = (t * frequency) % 1;
    let sample =
      type === 'sine' ? Math.sin(phase * Math.PI * 2) : type === 'square' ? (phase < 0.5 ? 1 : -1) : 1 - 4 * Math.abs(phase - 0.5);
    sample *= 1 - i / length; // fade out
    view.setInt16(44 + i * 2, sample * 0.6 * 0x7fff, true);
  }
  return new Blob([buffer], { type: 'audio/wav' });
}

const [blip, thud, hum] = await Promise.all([
  ex.Sound.fromBlob(tone(880, 180, 'square')),
  ex.Sound.fromBlob(tone(110, 400, 'triangle')),
  ex.Sound.fromBlob(tone(220, 2000, 'sine'))
]);
hum.loop = true;

const mixer = new ex.SoundManager({
  volume: 0.9, // master volume
  // Channels can cap simultaneous tracks; voiceStealing stops the oldest instead of dropping the new one
  channels: [
    { name: 'fx', maxConcurrentTracks: 3, voiceStealing: true },
    { name: 'music', volume: 0.4 }
  ],
  sounds: [
    { name: 'blip', sound: blip, channel: 'fx', volume: 0.8 },
    { name: 'thud', sound: thud, channel: 'fx' },
    { name: 'hum', sound: hum, channel: 'music' }
  ],
  // Insert effects on the master bus: a compressor keeps stacked blips from clipping
  onConnect: ({ audioContext, input, output }) => {
    const compressor = audioContext.createDynamicsCompressor();
    compressor.threshold.value = -18;
    input.connect(compressor).connect(output);
  }
});

const musicChannel = mixer.getChannel('music');
// Channels expose their nodes too: muffle the music through a low-pass filter
const muffle = musicChannel.audioContext.createBiquadFilter();
muffle.type = 'lowpass';
muffle.frequency.value = 600;
musicChannel.input.disconnect();
musicChannel.input.connect(muffle).connect(musicChannel.output);

const font = new ex.Font({
  size: 16,
  family: 'sans-serif',
  color: ex.Color.fromHex('#d6f5e3'),
  textAlign: ex.TextAlign.Center,
  baseAlign: ex.BaseAlign.Middle
});

// The stage is where blips get played, click anywhere on it
const stage = new ex.Actor({ name: 'stage', pos: ex.vec(300, 150), width: 600, height: 300, color: ex.Color.fromHex('#16302a') });
game.add(stage);
const status = new ex.Label({ text: 'click the stage to play a blip, panned to where you clicked', pos: ex.vec(300, 40), font, z: 1 });
game.add(status);

function button(text: string, pos: ex.Vector, onClick: () => void) {
  const actor = new ex.Actor({ name: text, pos, width: 170, height: 44, color: ex.Color.fromHex('#2d6a4f') });
  actor.addChild(new ex.Label({ text, font }));
  actor.on('pointerdown', onClick);
  game.add(actor);
  return actor;
}

let humming = false;
button('music on/off', ex.vec(130, 340), () => {
  humming = !humming;
  if (humming) {
    mixer.play('hum');
  } else {
    mixer.stop('hum');
  }
  status.text = humming ? 'music playing through a low-pass filter' : 'music stopped';
});

button('mute music', ex.vec(300, 340), () => {
  mixer.channel.toggle('music');
  // Muting is gain-based now, so a muted track keeps playing and is mid-clip when unmuted
  status.text = musicChannel.muted ? 'music channel muted (still advancing)' : 'music channel unmuted';
});

button('thud, low pitch', ex.vec(470, 340), () => {
  // Per-play overrides never change the Sound's configuration
  mixer.play('thud', { pitch: -400, volume: 1 });
  status.text = `thud! fx tracks playing: ${mixer.getChannel('fx').playingCount()}`;
});

// Pan each blip to where the click landed using the per-play `onPlay` audio graph hook
stage.on('pointerdown', (evt) => {
  const pan = ex.clamp((evt.worldPos.x / game.drawWidth) * 2 - 1, -1, 1);
  mixer.play('blip', {
    pitch: (evt.worldPos.y / 300) * 1200 - 600, // cents, higher up the stage is higher pitched
    onPlay: ({ audioContext, source, destination }) => {
      const panner = audioContext.createStereoPanner();
      panner.pan.value = pan;
      source.connect(panner).connect(destination);
    }
  });
  status.text = `blip at pan ${pan.toFixed(2)}, fx tracks playing: ${mixer.getChannel('fx').playingCount()}`;
});

// Browsers only allow audio after a user gesture, the engine unlocks it on the first click/tap
await game.start();
