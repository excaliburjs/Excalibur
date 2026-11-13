import * as ex from 'excalibur';

// NineSlice stretches or tiles a small source image into any size without distorting its corners,
// the classic trick for UI panels and textured platforms. The source is the 20x15 brick tile from
// the Excalibur sample platformer: https://excaliburjs.com/sample-platformer/
const game = new ex.Engine({
  canvasElementId: 'preview-canvas',
  displayMode: ex.DisplayMode.FillContainer,
  backgroundColor: ex.Color.fromHex('#1e1b2e'),
  pixelArt: true
});

const brickSource = new ex.ImageSource('https://excaliburjs.com/sample-platformer/res/block.png');
const font = new ex.Font({ size: 14, family: 'sans-serif', color: ex.Color.White, textAlign: ex.TextAlign.Center });

function panel(label: string, stretch: ex.NineSliceStretch, pos: ex.Vector) {
  const nineSlice = new ex.NineSlice({
    width: 160,
    height: 100,
    source: brickSource,
    // a 2px frame stays crisp, the brick pattern in the middle is what grows
    sourceConfig: { width: 20, height: 15, topMargin: 2, leftMargin: 2, bottomMargin: 2, rightMargin: 2 },
    destinationConfig: { drawCenter: true, horizontalStretch: stretch, verticalStretch: stretch }
  });
  const actor = new ex.Actor({ pos });
  actor.graphics.use(nineSlice);
  actor.addChild(new ex.Label({ text: label, pos: ex.vec(0, -80), font }));
  // breathe between 100x60 and 190x130 so you can watch the bricks: stretched, tiled, or fitted
  let t = 0;
  actor.onPostUpdate = (_engine, elapsed) => {
    t += elapsed / 1000;
    nineSlice.setTargetWidth(145 + Math.sin(t * 1.3) * 45, true);
    nineSlice.setTargetHeight(95 + Math.cos(t) * 35, true);
  };
  game.add(actor);
}

panel('stretch', ex.NineSliceStretch.Stretch, ex.vec(110, 210));
panel('tile', ex.NineSliceStretch.Tile, ex.vec(300, 210));
panel('tile-fit', ex.NineSliceStretch.TileFit, ex.vec(490, 210));

game.start(new ex.Loader([brickSource]));
