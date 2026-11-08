import * as ex from 'excalibur';

// Color.lerp now takes a color space. HSL is the default, RGB and linear RGB are available.
const game = new ex.Engine({
  canvasElementId: 'preview-canvas',
  displayMode: ex.DisplayMode.FillContainer,
  backgroundColor: ex.Color.fromHex('#1e1e1e')
});

const from = ex.Color.fromHex('#ff3b30');
const to = ex.Color.fromHex('#1e90ff');
const spaces = ['hsl', 'rgb', 'lrgb'] as const;
const font = new ex.Font({ size: 16, family: 'monospace', color: ex.Color.White });

spaces.forEach((space, row) => {
  const y = 80 + row * 100;
  game.add(new ex.Label({ text: `Color.lerp(a, b, t, '${space}')`, pos: ex.vec(60, y - 40), font }));
  const steps = 24;
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const swatch = new ex.Actor({
      name: `${space}-${i}`,
      pos: ex.vec(60 + i * 20 + 10, y),
      width: 20,
      height: 40,
      color: ex.Color.lerp(from, to, t, space)
    });
    game.add(swatch);
  }
});

// Colors also round-trip to float arrays for shader uniforms
const asFloats = to.toFloatArray(); // [r, g, b, a] in 0..1
game.add(new ex.Label({ text: `toFloatArray() -> [${asFloats.map((f) => f.toFixed(2)).join(', ')}]`, pos: ex.vec(60, 360), font }));

game.start();
