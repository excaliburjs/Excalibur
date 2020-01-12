/// <reference path='../lib/excalibur.d.ts' />

(() => {
  const PLAYER_SPEED = 400; // pixels/s
  const CHUNK_CELL_WIDTH = 32;
  const CHUNK_CELL_HEIGHT = 32;
  const CHUNK_SIZE = 8;
  const CHUNK_COLS = 128;
  const CHUNK_ROWS = 128;

  const tilesTexture = new ex.Texture('/images/tiles.png');
  const loader = new ex.Loader([tilesTexture]);

  const game = new ex.Engine({
    width: 800,
    height: 600,
    canvasElementId: 'game'
  });
  game.isDebug = true;

  game.start(loader).then(() => {
    const player = new Player();
    game.add(player);
    game.currentScene.camera.strategy.elasticToActor(player, 0.5, 0.7);
    game.currentScene.camera.pos = player.pos;

    game.add(new CameraZoomController());

    const spriteSheet = new ex.SpriteSheet(tilesTexture, 2, 1, CHUNK_CELL_WIDTH, CHUNK_CELL_HEIGHT);
    const dirtSprite = new ex.TileSprite('surface', 0);
    const waterSprite = new ex.TileSprite('surface', 1);
    const chunkSystem = new ex.ChunkSystemTileMap({
      cellWidth: CHUNK_CELL_WIDTH,
      cellHeight: CHUNK_CELL_HEIGHT,
      chunkGarbageCollectorPredicate: (chunk: ex.TileMap, engine: ex.Engine) => true,
      chunkSize: CHUNK_SIZE,
      x: -(CHUNK_COLS * CHUNK_SIZE * CHUNK_CELL_WIDTH) / 2,
      y: -(CHUNK_ROWS * CHUNK_SIZE * CHUNK_CELL_HEIGHT) / 2,
      cols: CHUNK_COLS * CHUNK_SIZE,
      rows: CHUNK_ROWS * CHUNK_SIZE,
      chunkGenerator: ex.wrapSimpleChunkGenerator(chunkGenerator),
      chunkRenderingCachePredicate: (chunk: ex.TileMap): boolean => true
    });
    chunkSystem.registerSpriteSheet('surface', spriteSheet);
    game.add(chunkSystem);

    function chunkGenerator(chunk: ex.TileMap, chunkSystemTileMap: ex.ChunkSystemTileMap, engine: ex.Engine): ex.TileMap {
      for (let y = 0, cols = chunk.cols, rows = chunk.rows; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          chunk.getCell(x, y).pushSprite(Math.random() < 0.5 ? dirtSprite : waterSprite);
        }
      }
      return chunk;
    }
  });

  class Player extends ex.Actor {
    public update(engine: ex.Engine, delta: number): void {
      super.update(engine, delta);

      const Keys = ex.Input.Keys;
      let newVelocity = ex.vec(0, 0);
      if (this.isKeyHeld(engine, Keys.W, Keys.Up)) {
        newVelocity = newVelocity.add(ex.Vector.Up);
      }
      if (this.isKeyHeld(engine, Keys.S, Keys.Down)) {
        newVelocity = newVelocity.add(ex.Vector.Down);
      }
      if (this.isKeyHeld(engine, Keys.A, Keys.Left)) {
        newVelocity = newVelocity.add(ex.Vector.Left);
      }
      if (this.isKeyHeld(engine, Keys.D, Keys.Right)) {
        newVelocity = newVelocity.add(ex.Vector.Right);
      }
      this.vel = newVelocity.size === 0 ? newVelocity : newVelocity.normalize().scale(PLAYER_SPEED);
    }

    private isKeyHeld(engine: ex.Engine, key: ex.Input.Keys, ...moreKeys: ex.Input.Keys[]): boolean {
      return [key].concat(moreKeys).some((candidateKey) => engine.input.keyboard.isHeld(candidateKey));
    }
  }

  class CameraZoomController extends ex.Actor {
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
})();
