import * as ex from 'excalibur';

// NineSlice stretches or tiles a small source image into any size without distorting its corners,
// the classic trick for UI panels. The source here is an inline SVG so there is nothing to download.
const game = new ex.Engine({
  canvasElementId: 'preview-canvas',
  displayMode: ex.DisplayMode.FillContainer,
  backgroundColor: ex.Color.fromHex('#1e1b2e')
});

const panelSource = ex.ImageSource.fromSvgString(`
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48">
    <rect x="2" y="2" width="44" height="44" rx="10" fill="#4c1d95" stroke="#c4b5fd" stroke-width="4"/>
    <circle cx="24" cy="24" r="6" fill="#c4b5fd"/>
  </svg>`);

function panel(label: string, stretch: ex.NineSliceStretch, pos: ex.Vector) {
  const nineSlice = new ex.NineSlice({
    width: 160,
    height: 100,
    source: panelSource,
    // the 12px border is kept crisp, only the middle region grows
    sourceConfig: { width: 48, height: 48, topMargin: 12, leftMargin: 12, bottomMargin: 12, rightMargin: 12 },
    destinationConfig: { drawCenter: true, horizontalStretch: stretch, verticalStretch: stretch }
  });
  const actor = new ex.Actor({ pos });
  actor.graphics.use(nineSlice);
  actor.addChild(
    new ex.Label({
      text: label,
      pos: ex.vec(0, -75),
      font: new ex.Font({ size: 14, family: 'sans-serif', color: ex.Color.White, textAlign: ex.TextAlign.Center })
    })
  );
  // breathe between 90x60 and 180x130 so you can watch the corners stay put
  let t = 0;
  actor.onPostUpdate = (_engine, elapsed) => {
    t += elapsed / 1000;
    nineSlice.setTargetWidth(135 + Math.sin(t * 1.3) * 45, true);
    nineSlice.setTargetHeight(95 + Math.cos(t) * 35, true);
  };
  game.add(actor);
}

panel('stretch', ex.NineSliceStretch.Stretch, ex.vec(110, 210));
panel('tile', ex.NineSliceStretch.Tile, ex.vec(300, 210));
panel('tile-fit', ex.NineSliceStretch.TileFit, ex.vec(490, 210));

game.start(new ex.Loader([panelSource]));
