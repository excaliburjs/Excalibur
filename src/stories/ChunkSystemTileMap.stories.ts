import {
  Actor,
  Cell,
  ChunkSystemTileMap,
  CollisionType,
  Engine,
  Input,
  Loader,
  PerlinGenerator,
  SpriteSheet,
  Texture,
  TileMap,
  TileSprite,
  vec,
  Vector,
  wrapSimpleChunkGenerator
} from '../engine';
import { withEngine } from './utils';

import tilesTexturePath from './assets/tiles.png';

export default {
  title: 'Chunk system tile map'
};

export const demo: Story = withEngine(async (game: Engine) => {
  const PLAYER_SPEED = 400; // pixels/s
  const CHUNK_CELL_WIDTH = 32;
  const CHUNK_CELL_HEIGHT = 32;
  const CHUNK_SIZE = 8;
  const CHUNK_COLS = 128;
  const CHUNK_ROWS = 128;

  const tilesTexture = new Texture(tilesTexturePath);
  const loader = new Loader([tilesTexture]);

  game.isDebug = true;
  await game.start(loader);

  const player = new Player(CHUNK_CELL_WIDTH, CHUNK_CELL_HEIGHT, PLAYER_SPEED);
  game.add(player);
  game.currentScene.camera.strategy.elasticToActor(player, 0.5, 0.7);
  game.currentScene.camera.pos = player.pos;

  game.add(new CameraZoomController());

  const spriteSheet = new SpriteSheet(tilesTexture, 2, 1, CHUNK_CELL_WIDTH, CHUNK_CELL_HEIGHT);
  const dirtSprite = new TileSprite('surface', 0);
  const waterSprite = new TileSprite('surface', 1);
  const chunkSystem = new ChunkSystemTileMap({
    cellWidth: CHUNK_CELL_WIDTH,
    cellHeight: CHUNK_CELL_HEIGHT,
    chunkGarbageCollectorPredicate: (_chunk: TileMap, _engine: Engine) => true,
    chunkSize: CHUNK_SIZE,
    x: -(CHUNK_COLS * CHUNK_SIZE * CHUNK_CELL_WIDTH) / 2,
    y: -(CHUNK_ROWS * CHUNK_SIZE * CHUNK_CELL_HEIGHT) / 2,
    cols: CHUNK_COLS * CHUNK_SIZE,
    rows: CHUNK_ROWS * CHUNK_SIZE,
    chunkGenerator: wrapSimpleChunkGenerator(chunkGenerator),
    chunkRenderingCachePredicate: (_chunk: TileMap): boolean => true
  });
  chunkSystem.registerSpriteSheet('surface', spriteSheet);
  game.add(chunkSystem);

  const perlinNoiseGenerator = new PerlinGenerator({
    amplitude: 1,
    frequency: 1,
    octaves: 1,
    persistance: 0.5
  });
  function chunkGenerator(
    chunk: TileMap,
    chunkCellColumn: number,
    chunkCellRow: number,
    chunkSystemTileMap: ChunkSystemTileMap,
    engine: Engine
  ): ex.TileMap {
    for (let y = 0, cols = chunk.cols, rows = chunk.rows; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cell = chunk.getCell(x, y);
        cellGenerator(cell, chunkCellColumn + x, chunkCellRow + y, chunkSystemTileMap, engine);
      }
    }
    return chunk;
  }
  function cellGenerator(cell: Cell, cellColumn: number, cellRow: number, chunkSystemTileMap: ChunkSystemTileMap, _engine: Engine): void {
    const tileValue = perlinNoiseGenerator.noise(cellColumn / chunkSystemTileMap.chunkSize, cellRow / chunkSystemTileMap.chunkSize);
    if (tileValue >= 0.5) {
      cell.pushSprite(dirtSprite);
    } else {
      cell.pushSprite(waterSprite);
      cell.solid = true;
    }
  }
});

class Player extends Actor {
  constructor(public width: number, public height: number, private readonly speed: number) {
    super();

    this.body.collider.type = CollisionType.Active;
  }

  public update(engine: ex.Engine, delta: number): void {
    super.update(engine, delta);

    const Keys = Input.Keys;
    let newVelocity = vec(0, 0);
    if (this.isKeyHeld(engine, Keys.W, Keys.Up)) {
      newVelocity = newVelocity.add(Vector.Up);
    }
    if (this.isKeyHeld(engine, Keys.S, Keys.Down)) {
      newVelocity = newVelocity.add(Vector.Down);
    }
    if (this.isKeyHeld(engine, Keys.A, Keys.Left)) {
      newVelocity = newVelocity.add(Vector.Left);
    }
    if (this.isKeyHeld(engine, Keys.D, Keys.Right)) {
      newVelocity = newVelocity.add(Vector.Right);
    }
    this.vel = newVelocity.size === 0 ? newVelocity : newVelocity.normalize().scale(this.speed);
  }

  private isKeyHeld(engine: ex.Engine, key: ex.Input.Keys, ...moreKeys: ex.Input.Keys[]): boolean {
    return [key].concat(moreKeys).some((candidateKey) => engine.input.keyboard.isHeld(candidateKey));
  }
}

class CameraZoomController extends Actor {
  constructor() {
    super();

    this.body.collider.type = CollisionType.PreventCollision;
  }

  public update(engine: ex.Engine, delta: number): void {
    super.update(engine, delta);
    const { camera } = engine.currentScene;
    if (engine.input.keyboard.isHeld(107)) {
      // Plus
      camera.z = Math.min(camera.z + 0.1, 2);
    }
    if (engine.input.keyboard.isHeld(109)) {
      // Minus
      camera.z = Math.max(camera.z - 0.1, 0.1);
    }
  }

  public draw(): void {}

  public debugDraw(): void {}
}
