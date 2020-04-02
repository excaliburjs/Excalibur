import * as ex from '@excalibur';
import { TestUtils } from '../util/TestUtils';

describe('ChunkSystemTileMapCollisionDetection', () => {
  type SimpleCellGenerator = (cell: ex.Cell, chunk: ex.TileMap, chunkSystem: ex.ChunkSystemTileMap, engine: ex.Engine) => ex.Cell;

  const trait = new ex.Traits.ChunkSystemTileMapCollisionDetection();
  const actor = new ex.Actor({
    with: 32,
    height: 32
  } as ex.ActorArgs);
  const engine = TestUtils.engine();
  let chunkSystem: ex.ChunkSystemTileMap;
  let currentCellGenerator: SimpleCellGenerator;

  beforeAll(() => {
    engine.add(actor);
  });

  beforeEach(() => {
    for (const previousChunkSytem of engine.currentScene.chunkSystems) {
      engine.currentScene.remove(previousChunkSytem);
    }

    chunkSystem = new ex.ChunkSystemTileMap({
      x: -64,
      y: -64,
      cellWidth: 8,
      cellHeight: 8,
      chunkSize: 16,
      cols: 16,
      rows: 16,
      chunkGarbageCollectorPredicate: () => false,
      chunkRenderingCachePredicate: () => false,
      chunkGenerator: ex.wrapSimpleChunkGenerator(
        wrapSimpleCellGenerator(
          (cell: ex.Cell, chunk: ex.TileMap, chunkSystem: ex.ChunkSystemTileMap, engine: ex.Engine): ex.Cell => {
            return currentCellGenerator(cell, chunk, chunkSystem, engine);
          }
        )
      )
    });
    actor.pos = ex.vec(0, 0);
    actor.body.collider.type = ex.CollisionType.PreventCollision;
    engine.add(chunkSystem);
  });

  describe('update', () => {
    it('has no effect if the colliding actor has the PreventCollision collider', () => {
      currentCellGenerator = (cell) => {
        cell.solid = true;
        return cell;
      };
      chunkSystem.update(engine, 16);
      spyOn(chunkSystem, 'collides').and.callThrough();
      trait.update(actor, engine);
      expect(chunkSystem.collides).not.toHaveBeenCalled();
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);
    });
  });

  function wrapSimpleCellGenerator(
    cellGenerator: (cell: ex.Cell, chunk: ex.TileMap, chunkSystem: ex.ChunkSystemTileMap, engine: ex.Engine) => ex.Cell
  ): ex.SimpleChunkGenerator {
    return (
      chunk: ex.TileMap,
      chunkCellColumn: number,
      chunkCellRow: number,
      chunkSystemTileMap: ex.ChunkSystemTileMap,
      engine: ex.Engine
    ) => {
      for (let y = 0, cols = chunk.cols, rows = chunk.rows; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const cell = chunk.getCell(x, y);
          cellGenerator(cell, chunk, chunkSystemTileMap, engine);
        }
      }
      return chunk;
    };
  }
});
