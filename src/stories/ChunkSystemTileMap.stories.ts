import { withKnobs, boolean, number } from '@storybook/addon-knobs';
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
  wrapSimpleCellGenerator
} from '../engine';
import { withEngine } from './utils';

import tilesTexturePath from './assets/tiles.png';

export default {
  title: 'Chunk system tile map',
  decorators: [withKnobs]
};

export const demo: Story = withEngine(async (game: Engine) => {
  const PLAYER_SPEED = number('Player speed', 400, { min: 1, max: 60000, step: 1 }); // pixels/s
  const CHUNK_CELL_WIDTH = 32;
  const CHUNK_CELL_HEIGHT = 32;
  const CHUNK_SIZE = 8;
  const CHUNK_COLS = 128;
  const CHUNK_ROWS = 128;
  const MIN_ZOOM_LEVEL = 0.2;
  const MAX_ZOOM_LEVEL = 2;
  const ZOOM_STEP = 0.1;
  const PERLIN_NOISE_GENERATOR_AMPLITUDE = number('Perlin noise generator aplitude', 2, { min: 1, max: 64, step: 1 });
  const PERLIN_NOISE_GENERATOR_FREQUENCY = number('Perlin noise generator frequency', 0.4, { min: 0.01, max: 100, step: 1 });
  const PERLIN_NOISE_GENERATOR_OCTAVES = number('Perlin noise generator octaves', 3, { min: 1, max: 8, step: 1 });
  const PERLIN_NOISE_GENERATOR_PERSISTANCE = number('Perlin noise generator persistance', 0.6, { min: 0, max: 1, step: 0.1 });

  const tilesTexture = new Texture(tilesTexturePath);
  const loader = new Loader([tilesTexture]);

  game.isDebug = boolean('Debug mode', false);
  await game.start(loader);

  const player = new Player(CHUNK_CELL_WIDTH, CHUNK_CELL_HEIGHT, PLAYER_SPEED);
  game.add(player);
  game.currentScene.camera.strategy.elasticToActor(player, 0.5, 0.7);
  game.currentScene.camera.pos = player.pos;

  game.add(new CameraZoomController(MIN_ZOOM_LEVEL, MAX_ZOOM_LEVEL, ZOOM_STEP));

  const spriteSheet = new SpriteSheet(tilesTexture, 2, 1, CHUNK_CELL_WIDTH, CHUNK_CELL_HEIGHT);
  const dirtSprite = new TileSprite('surface', 0);
  const waterSprite = new TileSprite('surface', 1);
  const chunkSystem = new ChunkSystemTileMap({
    cellWidth: CHUNK_CELL_WIDTH,
    cellHeight: CHUNK_CELL_HEIGHT,
    chunkGarbageCollectorPredicate: (_chunk: TileMap, _chunkSystem: ChunkSystemTileMap, _engine: Engine) => true,
    chunkSize: CHUNK_SIZE,
    x: -(CHUNK_COLS * CHUNK_SIZE * CHUNK_CELL_WIDTH) / 2,
    y: -(CHUNK_ROWS * CHUNK_SIZE * CHUNK_CELL_HEIGHT) / 2,
    cols: CHUNK_COLS * CHUNK_SIZE,
    rows: CHUNK_ROWS * CHUNK_SIZE,
    chunkGenerator: wrapSimpleCellGenerator(cellGenerator),
    chunkRenderingCachePredicate: (_chunk: TileMap): boolean => true
  });
  chunkSystem.registerSpriteSheet('surface', spriteSheet);
  game.add(chunkSystem);

  const perlinNoiseGenerator = new PerlinGenerator({
    amplitude: PERLIN_NOISE_GENERATOR_AMPLITUDE,
    frequency: PERLIN_NOISE_GENERATOR_FREQUENCY,
    octaves: PERLIN_NOISE_GENERATOR_OCTAVES,
    persistance: PERLIN_NOISE_GENERATOR_PERSISTANCE
  });
  function cellGenerator(cell: Cell, cellColumn: number, cellRow: number, chunk: TileMap): void {
    const tileValue = perlinNoiseGenerator.noise(cellColumn / chunk.cols, cellRow / chunk.rows);
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
  constructor(private readonly minZoomLevel: number, private readonly maxZoomLevel: number, private readonly zoomStep: number) {
    super();

    this.body.collider.type = CollisionType.PreventCollision;
  }

  public update(engine: ex.Engine, delta: number): void {
    super.update(engine, delta);
    const { camera } = engine.currentScene;
    if (engine.input.keyboard.isHeld(107)) {
      // Plus
      camera.z = Math.min(camera.z + this.zoomStep, this.maxZoomLevel);
    }
    if (engine.input.keyboard.isHeld(109)) {
      // Minus
      camera.z = Math.max(camera.z - this.zoomStep, this.minZoomLevel);
    }
  }

  public draw(): void {}

  public debugDraw(): void {}
}
