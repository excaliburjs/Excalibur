import * as ex from 'excalibur';

// pixelArt: true turns on a special pixel art sampler shader (plus matching filtering and uv padding), so
// low-res sprites stay crisp but can rotate, scale and move at sub-pixel speeds without shimmer.
const game = new ex.Engine({
  canvasElementId: 'preview-canvas',
  displayMode: ex.DisplayMode.FillContainer,
  backgroundColor: ex.Color.fromHex('#0f172a'),
  pixelArt: true
});

// Paint a 12x12 sprite on a canvas so there is nothing to download
const pixels = [
  '..yyyyyy....',
  '.yyyyyyyy...',
  'yybbyybbyy..',
  'yyyyyyyyyy..',
  'yyrrrrrryy..',
  '.yyyyyyyy...',
  '..ggggggg...',
  '.gggggggg...',
  'gggggggggg..',
  '.gg....gg...',
  '.bb....bb...',
  'bbb....bbb..'
];
const palette: Record<string, string> = { y: '#fde047', b: '#1e3a8a', r: '#dc2626', g: '#16a34a' };
const canvas = document.createElement('canvas');
canvas.width = canvas.height = 12;
const ctx = canvas.getContext('2d')!;
pixels.forEach((row, y) =>
  [...row].forEach((ch, x) => {
    if (palette[ch]) {
      ctx.fillStyle = palette[ch];
      ctx.fillRect(x, y, 1, 1);
    }
  })
);
const spriteSource = ex.ImageSource.fromHtmlCanvasElement(canvas);

// One big slow spinner, and a row of small ones drifting at fractional pixel speeds
const hero = new ex.Actor({ pos: ex.vec(300, 170), scale: ex.vec(12, 12), angularVelocity: 0.4 });
hero.graphics.use(spriteSource.toSprite());
hero.onPostUpdate = (_engine, elapsed) => {
  const s = 10 + Math.sin(Date.now() / 900) * 3;
  hero.scale = ex.vec(s, s);
};
game.add(hero);

for (let i = 0; i < 6; i++) {
  const little = new ex.Actor({ pos: ex.vec(60 + i * 96, 340), scale: ex.vec(4, 4), vel: ex.vec(0, 0) });
  little.graphics.use(spriteSource.toSprite());
  little.onPostUpdate = (_engine, elapsed) => {
    little.pos.x += Math.sin(Date.now() / 1500 + i) * 0.35; // deliberately sub-pixel
  };
  game.add(little);
}

game.add(
  new ex.Label({
    text: 'new ex.Engine({ pixelArt: true })',
    pos: ex.vec(300, 24),
    font: new ex.Font({ size: 16, family: 'monospace', color: ex.Color.fromHex('#e2e8f0'), textAlign: ex.TextAlign.Center })
  })
);

game.start(new ex.Loader([spriteSource]));
