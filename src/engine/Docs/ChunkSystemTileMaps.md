Chunk system tile maps are more advanced variants of [[TileMap|tile maps]]. Each chunk system is made of chunks, each represented by a
[[TileMap|tile map]], which can be loaded or generated on-demand and garbage-collected from the memory as needed. It is therefore strongly
recommended to familiarise yourself with [[TileMap|tile maps]] beforehand.

Chunk systems enable vast game worlds that can even be procedurally generated using the [[PerlinGenerator|perlin noise generator]] (or an
equivalent solution, such as [[https://en.wikipedia.org/wiki/OpenSimplex_noise|OpenSimplex noise]]).

## Creating a chunk system

A chunk system is always used with a [[ChunkGenerator|chunk generator]] that either loads or generates the chunks the chunk systems needs to
render. Just as with [[TileMap|tile maps]], you'll also need [[SpriteSheet|sprite sheets]] used for visual representation of the
[[Cell|Cells]].

The chunk generator can either use the low-level API, or can utility the [[wrapChunkGenerator]] or [[wrapCellGenerator]] helper that
simplify the creation of procedurally generated chunk systems.

Once the [[ChunkSystemTileMap|chunk system]] is added to a [[Scene]], it will be drawn and updated. The chunk system generates the missing
on-screen chunks for each frame and renders only the on-screen chunks, just like the [[TileMap|tile maps]] do.

```typescript
// Define sprites we're going to load and use in the chunk system
const dirtSprite = new TileSprite('surface', 0);
const waterSprite = new TileSprite('surface', 1);

const perlinNoiseGenerator = new ex.PerlinGenerator({
  amplitude: 2,
  frequency: 0.4,
  octaves: 3,
  persistance: 0.6
});
const chunkSystem = new ex.ChunkSystemTileMap({
  cellWidth: 32,
  cellHeight: 32,
  chunkSize: 8, // Each chunk is 8×8 cells, chunks are always rectangular (well, if their cells are rectangular)
  // Place the chunk system's center at [0, 0]
  x: -16384,
  y: -16384,
  cols: 1024, // Must be a multiple of chunkSize
  rows: 1024, // Must be a multiple of chunkSize
  chunkGenerator: ex.wrapCellGenerator(
    (cell: Cell, cellColumn: number, cellRow: number, chunk: TileMap): Cell => {
      // A more advanced world generator can use multiple noise generators, e.g. to generate various cell types within biomes
      const tileValue = perlinNoiseGenerator.noise(cellColumn / chunk.cols, cellRow / chunk.rows);
      if (tileValue >= 0.5) {
        cell.pushSprite(dirtSprite);
      } else {
        cell.pushSprite(waterSprite);
        cell.solid = true;
      }
      return cell;
    }
  )
});

const tilesTexture = new Texture('path/to/texture/containing/cell/sprites.png');

// Create a game
const game = new ex.Engine();
// Use a loader to load the texture and start the game loop afterwards
game.start(new Loader([tilesTexture])).then(() => {
  const spriteSheet = new SpriteSheet(tilesTexture, 2, 1, 32, 32);
  chunkSystem.registerSpriteSheet('surface', spriteSheet);

  game.add(chunkSystem);
});
```

## Collision checks

[[Actor|Actors]] use the [[CellMapCollisionDetection]] trait to collide and interact with [[Cell.solid|solid]] [[Cell|Cells]] of chunk
systems in the current scene. Alternatively, you can use [[CellMapCollisionDetection.collides]] to check if a give [[Actor]] is colliding
with a solid [[Cell]] of a [[ChunkSystemTileMap|chunk system]]. This method returns an intersection [[Vector]] that represents the smallest
overlap with colliding cells.

Please note that actors do not collide with chunks that have not been generated yet or have been garbage-collected (see below).

## Chunk garbage collection

A chunk system can be configured with a [[ChunkSystemGarbageCollectorPredicate|chunkGarbageCollectorPredicate]]. The chunk system calls the
predicate for every currently generated chunk that is completely off-screen. The chunk system then discards any chunk for which the
predicate returns `true`, allowing the chunk to be garbage-collected.

The chunk system would re-generate a discarded chunk using its [[ChunkGenerator|chunk generator]] should a chunk at the given location would
be needed for renderng again.

Note that discarding and generating chunks often does come with a performance cost due to larger workload for the browser's garbage
collector, however, this enables you to create worlds that could not otherwise fit into the memory.

## Caching of pre-rendered chunks

If rendering a large number of small [[Cell|Cells]] on a large viewport, especially when combined with a complex game logic, rendering
itself can become a bottleneck worth optimising. A chunk system can be configured with a
[[ChunkSystemTileMap.chunkRenderingCachePredicate|chunkRenderingCachePredicate]] for such special cases.

The chunk system invokes the predicate for every chunk it is about to render in the current frame, provided the given chunk has not been
pre-rendered already. The chunk system pre-renders the whole chunk and caches the result if the predicate returned `true` for the given
chunk.

Please note that caching pre-rendered chunks is lot more memory intensive. Profiling and benchmarking of your game is strongly recommended,
as is configuring the [[ChunkSystemGarbageCollectorPredicate|chunkGarbageCollectorPredicate]].
