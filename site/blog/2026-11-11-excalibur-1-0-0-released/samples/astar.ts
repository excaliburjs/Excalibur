import * as ex from 'excalibur';

// Art and sound effects are from the Excalibur sample tactics game: https://excaliburjs.com/sample-tactics/
const game = new ex.Engine({
  canvasElementId: 'preview-canvas',
  displayMode: ex.DisplayMode.FillContainer,
  backgroundColor: ex.Color.fromHex('#3f8fd2'),
  pixelArt: true
});

const tactics = 'https://raw.githubusercontent.com/excaliburjs/sample-tactics/main/res/';
const images = {
  terrain: new ex.ImageSource(tactics + 'TerrainSheet.png'),
  highlight: new ex.ImageSource(tactics + 'HighlightSheet.png'),
  knight: new ex.ImageSource(tactics + 'KnightSheet.png'),
  spider: new ex.ImageSource(tactics + 'SpiderSheet.png'),
  explosion: new ex.ImageSource(tactics + 'explosion.png'),
  cloud: new ex.ImageSource(tactics + 'Cloud.png')
};
const sounds = {
  select: new ex.Sound({ paths: [tactics + 'targetselect.wav'], volume: 0.5 }),
  move: new ex.Sound({ paths: [tactics + 'move.wav'], volume: 0.4 }),
  hit: new ex.Sound({ paths: [tactics + 'hit.wav'], volume: 0.5 }),
  explosion: new ex.Sound({ paths: [tactics + 'explosion.wav'], volume: 0.3 })
};

const grid32 = (columns: number, rows = 1) => ({ rows, columns, spriteWidth: 32, spriteHeight: 32 });
// Terrain tiles are 32x48: a 32px face with a little depth drawn below it. 0-1 grass, 2-3 sand, 4-5 stone
const terrain = ex.SpriteSheet.fromImageSource({ image: images.terrain, grid: { rows: 1, columns: 6, spriteWidth: 32, spriteHeight: 48 } });
const pathHighlight = ex.SpriteSheet.fromImageSource({ image: images.highlight, grid: grid32(5) }).sprites[1];
const knightIdle = ex.Animation.fromSpriteSheet(ex.SpriteSheet.fromImageSource({ image: images.knight, grid: grid32(4) }), [0, 1, 2, 3], 200);
const spiderSheet = ex.SpriteSheet.fromImageSource({ image: images.spider, grid: grid32(4) });
const explosionSheet = ex.SpriteSheet.fromImageSource({ image: images.explosion, grid: grid32(5, 2) });

const TILE = 32;
const COLS = 18;
const ROWS = 11;
const tileMap = new ex.TileMap({ pos: ex.vec(12, 44), tileWidth: TILE, tileHeight: TILE, columns: COLS, rows: ROWS });
game.add(tileMap);
// World position of the middle of a tile's face
const tileCenter = (tile: { x: number; y: number }) => tileMap.pos.add(ex.vec(tile.x * TILE + TILE / 2, tile.y * TILE + TILE / 2 - 6));

const random = new ex.Random(3);
function setTerrain(tile: ex.Tile, kind: 'grass' | 'sand' | 'stone') {
  tile.isSolid = kind === 'stone';
  tile.clearGraphics();
  const first = kind === 'grass' ? 0 : kind === 'sand' ? 2 : 4;
  tile.addGraphic(terrain.sprites[first + random.integer(0, 1)]);
}

// Meadow with some sand, and stone walls with gaps so the straight line is never the answer
for (const tile of tileMap.tiles) {
  setTerrain(tile, random.bool(0.12) ? 'sand' : 'grass');
}
for (let x = 4; x < COLS; x += 5) {
  const gap = random.integer(1, ROWS - 3);
  for (let y = 0; y < ROWS; y++) {
    if (Math.abs(y - gap) > 1) {
      setTerrain(tileMap.getTile(x, y)!, 'stone');
    }
  }
}

const knight = new ex.Actor({ name: 'knight', pos: tileCenter({ x: 0, y: 5 }), z: 2 });
knight.graphics.use(knightIdle);
game.add(knight);

// Spiders block a tile too, until you squash them
const spiders = new Map<ex.Tile, ex.Actor>();
while (spiders.size < 5) {
  const tile = tileMap.getTile(random.integer(1, COLS - 1), random.integer(0, ROWS - 1))!;
  if (tile.isSolid || spiders.has(tile)) {
    continue;
  }
  tile.isSolid = true;
  const spider = new ex.Actor({ name: 'spider', pos: tileCenter(tile), z: 2 });
  spider.graphics.use(ex.Animation.fromSpriteSheet(spiderSheet, [0, 1, 2, 3], 200, ex.AnimationStrategy.PingPong));
  spiders.set(tile, spider);
  game.add(spider);
}

// Drifting clouds, purely decorative
for (let i = 0; i < 3; i++) {
  const cloud = new ex.Actor({ name: 'cloud', pos: ex.vec(random.integer(0, 600), random.integer(40, 360)), vel: ex.vec(-random.integer(15, 35), 0), z: 5 });
  cloud.graphics.use(images.cloud.toSprite());
  cloud.graphics.opacity = 0.6;
  cloud.onPostUpdate = () => {
    if (cloud.pos.x < -60) {
      cloud.pos.x = 660;
    }
  };
  game.add(cloud);
}

const font = new ex.Font({
  size: 14,
  family: 'monospace',
  color: ex.Color.White,
  shadow: { blur: 2, offset: ex.vec(1, 1), color: ex.Color.Black }
});
const status = new ex.Label({ text: 'click a tile to walk there, click stone or a spider to clear it', pos: ex.vec(12, 10), font, z: 6 });
game.add(status);

let highlighted: ex.Tile[] = [];
function walkTo(target: ex.Tile) {
  // Build an ex.Graph with a node for every walkable tile and an edge to each walkable neighbor,
  // then search from the knight's tile to the target with the core A*.
  const here = tileMap.getTileByPoint(knight.pos)!;
  const start = performance.now();
  const graph = new ex.Graph<ex.Tile>();
  const nodes = new Map<ex.Tile, ex.PositionNode<ex.Tile>>();
  for (const tile of tileMap.tiles) {
    if (!tile.isSolid) {
      nodes.set(tile, graph.addNode(tile, ex.vec(tile.x, tile.y)) as ex.PositionNode<ex.Tile>);
    }
  }
  for (const [tile, node] of nodes) {
    // Right, down, and the two down diagonals, edges are undirected so every pair is linked both ways
    for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [-1, 1]]) {
      const neighbor = tileMap.getTile(tile.x + dx, tile.y + dy);
      const other = neighbor && nodes.get(neighbor);
      // Don't cut diagonally around the corner of a wall
      const cutsCorner = dx !== 0 && dy !== 0 && (tileMap.getTile(tile.x + dx, tile.y)?.isSolid || tileMap.getTile(tile.x, tile.y + dy)?.isSolid);
      if (other && !cutsCorner) {
        graph.addEdge(node, other, { useEuclidean: true });
      }
    }
  }
  const result = graph.aStar(nodes.get(here)!, nodes.get(target)!);
  const duration = performance.now() - start;
  // The path starts on the knight's own tile, so skip it
  const path = (result.path ?? []).slice(1).map((node) => node.data);
  status.text = path.length ? `${path.length} steps, solved in ${duration.toFixed(2)} ms` : 'no path to that tile';

  // Tiles can carry more than one graphic, the path is a second layer on top of the terrain
  highlighted.forEach((tile) => tile.removeGraphic(pathHighlight));
  highlighted = path;
  highlighted.forEach((tile) => tile.addGraphic(pathHighlight, { offset: ex.vec(0, -6) }));

  knight.actions.clearActions();
  let previous: { x: number; y: number } = here;
  for (const node of path) {
    const facingLeft = node.x < previous.x;
    knight.actions
      .callMethod(() => {
        knight.graphics.flipHorizontal = facingLeft;
        sounds.move.play();
      })
      .moveTo({ pos: tileCenter(node), duration: 90 });
    previous = node;
  }
}

game.input.pointers.primary.on('down', (evt) => {
  const tile = tileMap.getTileByPoint(evt.worldPos);
  if (!tile) {
    return;
  }
  const spider = spiders.get(tile);
  if (spider) {
    spiders.delete(tile);
    spider.kill();
    tile.isSolid = false;
    const boom = new ex.Actor({ name: 'explosion', pos: spider.pos, z: 3 });
    boom.graphics.use(ex.Animation.fromSpriteSheet(explosionSheet, [0, 1, 2, 3, 4, 5, 6, 7], 100, ex.AnimationStrategy.End));
    boom.actions.delay(800).die();
    game.add(boom);
    sounds.explosion.play();
  } else if (tile.isSolid) {
    setTerrain(tile, 'grass');
    sounds.hit.play();
  } else {
    sounds.select.play();
    walkTo(tile);
  }
});

game.start(new ex.Loader([...Object.values(images), ...Object.values(sounds)]));
