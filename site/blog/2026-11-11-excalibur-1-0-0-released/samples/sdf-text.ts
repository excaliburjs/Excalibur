import * as ex from 'excalibur';
// A plugin can install a custom renderer. This one draws signed distance field text: an atlas is
// generated from any font at load time, and a WebGL renderer draws glyphs as batched quads that
// stay crisp at any size, rotation or zoom.
import { SDFFont, SDFText, SDFTextPlugin } from 'https://excaliburjs.com/plugins/excalibur-sdf-text/1.0.0/excalibur-sdf-text.js';

const game = new ex.Engine({
  canvasElementId: 'preview-canvas',
  displayMode: ex.DisplayMode.FillContainer,
  backgroundColor: ex.Color.fromHex('#1b1b2a'),
  plugins: [new SDFTextPlugin()] // registers 'ex.sdf-text-renderer' on the graphics context
});

// One 64px atlas from the browser's serif font, no font file to download
const sdfFont = new SDFFont({ fontFamily: 'Georgia, serif', fontSize: 64, fontWeight: 700, color: ex.Color.White });

const label = (text: string, pos: ex.Vector) =>
  new ex.Label({
    text,
    pos,
    font: new ex.Font({ size: 13, family: 'sans-serif', color: ex.Color.fromHex('#9aa0c8'), textAlign: ex.TextAlign.Center })
  });

// Left: regular ex.Text, rasterized once at 12px. Right: SDFText, also 12px from the atlas.
// Move the mouse to scale both: the raster goes soft, the distance field stays sharp.
const rasterFont = new ex.Font({ family: 'Georgia, serif', size: 12, bold: true, color: ex.Color.White });
const raster = new ex.Actor({ name: 'raster', pos: ex.vec(150, 110) });
raster.graphics.use(new ex.Text({ text: 'Aa', font: rasterFont }));
game.add(raster);
game.add(label('ex.Text rasterized at 12px', ex.vec(150, 200)));

const sdf = new ex.Actor({ name: 'sdf', pos: ex.vec(450, 110) });
sdf.graphics.use(new SDFText({ sdf: sdfFont, text: 'Aa', size: 12 }));
game.add(sdf);
game.add(label('SDFText at 12px, same atlas', ex.vec(450, 200)));

game.input.pointers.primary.on('move', (evt) => {
  const scale = 1 + (evt.worldPos.x / game.drawWidth) * 11; // 1x..12x
  raster.scale = ex.vec(scale, scale);
  sdf.scale = ex.vec(scale, scale);
});

// Sizes from tiny to huge all come from the same atlas
let y = 230;
for (const [size, color] of [
  [10, '#cfd2ff'],
  [16, '#8ecae6'],
  [24, '#ffd166'],
  [36, '#f78c6b']
] as const) {
  const line = new ex.Actor({ pos: ex.vec(20, y), anchor: ex.Vector.Zero });
  line.graphics.use(new SDFText({ sdf: sdfFont, text: `${size}px from a 64px atlas`, size, color: ex.Color.fromHex(color) }));
  game.add(line);
  y += size * 1.25;
}

// Rotating text and a typewriter, wrapped and centered
const spinner = new ex.Actor({ pos: ex.vec(470, 300), angularVelocity: 0.7 });
spinner.graphics.use(new SDFText({ sdf: sdfFont, text: 'SDF', size: 56, color: ex.Color.fromHex('#ffd166') }));
game.add(spinner);

const typewriter = new SDFText({
  sdf: sdfFont,
  text: 'every glyph on screen is one quad in a single batched draw call',
  size: 14,
  maxWidth: 300,
  textAlign: 'center',
  visibleCharacters: 0,
  color: ex.Color.fromHex('#9aa0c8')
});
const caption = new ex.Actor({ pos: ex.vec(20, 350), anchor: ex.Vector.Zero });
caption.graphics.use(typewriter);
let typed = 0;
caption.onPostUpdate = (_engine, elapsed) => {
  typed += elapsed / 40;
  typewriter.visibleCharacters = Math.floor(typed) % (typewriter.text.length + 30);
};
game.add(caption);

// The font is Loadable, the atlas is generated while the loader runs
game.start(new ex.Loader([sdfFont]));
