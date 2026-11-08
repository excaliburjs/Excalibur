import * as ex from 'excalibur';
// The pathfinding plugin runs A* over a grid of walkable/solid cells, here the cells of a TileMap
import { ExcaliburAStar } from 'https://unpkg.com/@excaliburjs/plugin-pathfinding@0.32.0/dist/excalibur-pathfinding.js';

const game = new ex.Engine({
  canvasElementId: 'preview-canvas',
  displayMode: ex.DisplayMode.FillContainer,
  backgroundColor: ex.Color.fromHex('#1b1f2a')
});

const TILE = 20;
const COLS = 30;
const ROWS = 20;
const tileMap = new ex.TileMap({ pos: ex.vec(0, 0), tileWidth: TILE, tileHeight: TILE, columns: COLS, rows: ROWS });
game.add(tileMap);

const wallGraphic = new ex.Rectangle({ width: TILE, height: TILE, color: ex.Color.fromHex('#4b5563') });
const floorGraphic = new ex.Rectangle({ width: TILE - 1, height: TILE - 1, color: ex.Color.fromHex('#232838') });
function setWall(tile: ex.Tile, solid: boolean) {
  tile.isSolid = solid;
  tile.clearGraphics();
  tile.addGraphic(solid ? wallGraphic : floorGraphic);
}

// A few walls with gaps so the straight line is never the answer
const random = new ex.Random(3);
for (const tile of tileMap.tiles) {
  setWall(tile, false);
}
for (let x = 5; x < COLS; x += 6) {
  const gap = random.integer(1, ROWS - 3);
  for (let y = 0; y < ROWS; y++) {
    if (Math.abs(y - gap) > 1) {
      setWall(tileMap.getTile(x, y)!, true);
    }
  }
}

const hero = new ex.Actor({ pos: ex.vec(TILE / 2, TILE / 2), radius: 7, color: ex.Color.fromHex('#fbbf24'), z: 2 });
game.add(hero);

// The computed path is drawn on a Canvas graphic we redraw when it changes
let path: { x: number; y: number }[] = [];
const pathCanvas = new ex.Canvas({
  width: COLS * TILE,
  height: ROWS * TILE,
  draw: (ctx) => {
    ctx.strokeStyle = '#6ee7b7';
    ctx.lineWidth = 3;
    ctx.beginPath();
    path.forEach((node, i) => ctx[i === 0 ? 'moveTo' : 'lineTo'](node.x * TILE + TILE / 2, node.y * TILE + TILE / 2));
    ctx.stroke();
  }
});
const pathActor = new ex.Actor({ pos: ex.vec(0, 0), anchor: ex.Vector.Zero, z: 1 });
pathActor.graphics.use(pathCanvas);
game.add(pathActor);

const font = new ex.Font({ size: 14, family: 'monospace', color: ex.Color.fromHex('#e5e7eb') });
const status = new ex.Label({ text: 'click a floor tile to walk there, click a wall to knock it down', pos: ex.vec(8, 6), font, z: 3 });
game.add(status);

function walkTo(target: ex.Tile) {
  // Build the grid from the map's solid tiles, then search from the hero's tile to the target.
  // (You can also pass the TileMap itself once the plugin reads v1's `tile.isSolid`)
  const astar = new ExcaliburAStar({ cols: COLS, rows: ROWS, tiles: tileMap.tiles.map((tile) => ({ collider: tile.isSolid })) });
  const start = astar.getNodeByCoord(Math.floor(hero.pos.x / TILE), Math.floor(hero.pos.y / TILE));
  const end = astar.getNodeByCoord(target.x, target.y);
  path = astar.astar(start, end, true);
  pathCanvas.flagDirty();
  status.text = path.length ? `${path.length} steps, solved in ${astar.duration.toFixed(2)} ms` : 'no path to that tile';

  hero.actions.clearActions();
  for (const node of path) {
    hero.actions.moveTo({ pos: ex.vec(node.x * TILE + TILE / 2, node.y * TILE + TILE / 2), duration: 60 });
  }
}

game.input.pointers.primary.on('down', (evt) => {
  const tile = tileMap.getTileByPoint(evt.worldPos);
  if (!tile) {
    return;
  }
  if (tile.isSolid) {
    setWall(tile, false);
  } else {
    walkTo(tile);
  }
});

game.start();
