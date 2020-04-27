import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';
import { ChunkSystemTileMap, wrapSimpleChunkGenerator, wrapSimpleCellGenerator } from '@excalibur';

const DEFAULT_OPTIONS = {
  x: -32,
  y: -32,
  cellWidth: 8,
  cellHeight: 8,
  chunkSize: 4,
  cols: 8,
  rows: 8,
  chunkGarbageCollectorPredicate: () => false,
  chunkGenerator: wrapSimpleChunkGenerator((chunk) => chunk)
};

describe('ChunkSystemTileMap', () => {
  let engine: ex.Engine;

  beforeEach(() => {
    engine = TestUtils.engine();
  });

  it('rejects zero, negative number or non-integer as chunk size', () => {
    const forbiddenValues = [0, -1, 1.25];
    for (const value of forbiddenValues) {
      expect(() => {
        new ex.ChunkSystemTileMap({
          cellWidth: 8,
          cellHeight: 8,
          chunkGarbageCollectorPredicate: () => true,
          chunkGenerator: wrapSimpleChunkGenerator((chunk) => chunk),
          chunkSize: value,
          cols: 5,
          rows: 5,
          x: 0,
          y: 0
        });
      }).toThrowMatching((thrown) => thrown.message.includes('chunkSize') && thrown.message.includes(value));
    }
  });

  it('rejects zero, negative number or non-integer as rows count', () => {
    const forbiddenValues = [0, -1, 1.25];
    for (const value of forbiddenValues) {
      expect(() => {
        new ex.ChunkSystemTileMap({
          cellWidth: 8,
          cellHeight: 8,
          chunkGarbageCollectorPredicate: () => true,
          chunkGenerator: wrapSimpleChunkGenerator((chunk) => chunk),
          chunkSize: 1,
          cols: 5,
          rows: value,
          x: 0,
          y: 0
        });
      }).toThrowMatching((thrown) => thrown.message.includes('rows') && thrown.message.includes(value));
    }
  });

  it('rejects zero, negative number or non-integer as cols count', () => {
    const forbiddenValues = [0, -1, 1.25];
    for (const value of forbiddenValues) {
      expect(() => {
        new ex.ChunkSystemTileMap({
          cellWidth: 8,
          cellHeight: 8,
          chunkGarbageCollectorPredicate: () => true,
          chunkGenerator: wrapSimpleChunkGenerator((chunk) => chunk),
          chunkSize: 1,
          cols: value,
          rows: 1,
          x: 0,
          y: 0
        });
      }).toThrowMatching((thrown) => thrown.message.includes('cols') && thrown.message.includes(value));
    }
  });

  it('rejects a cols count that is not a multiple of the chunkSize option', () => {
    expect(() => {
      new ex.ChunkSystemTileMap({
        cellWidth: 8,
        cellHeight: 8,
        chunkGarbageCollectorPredicate: () => true,
        chunkGenerator: wrapSimpleChunkGenerator((chunk) => chunk),
        chunkSize: 7,
        cols: 20,
        rows: 21,
        x: 0,
        y: 0
      });
    }).toThrowMatching((thrown) => thrown.message.includes('cols') && thrown.message.includes(20) && thrown.message.includes(7));
  });

  it('rejects a rows count that is not a multiple of the chunkSize option', () => {
    expect(() => {
      new ex.ChunkSystemTileMap({
        cellWidth: 8,
        cellHeight: 8,
        chunkGarbageCollectorPredicate: () => true,
        chunkGenerator: wrapSimpleChunkGenerator((chunk) => chunk),
        chunkSize: 11,
        cols: 22,
        rows: 27,
        x: 0,
        y: 0
      });
    }).toThrowMatching((thrown) => thrown.message.includes('rows') && thrown.message.includes(27) && thrown.message.includes(11));
  });

  it('registers sprite sheets with all already generated chunks', () => {
    const sheet = new ex.SpriteSheet([]);
    const chunkSystem = new ChunkSystemTileMap(DEFAULT_OPTIONS);
    chunkSystem.update(engine, 16);
    const chunks = [chunkSystem.getChunk(0, 0), chunkSystem.getChunk(4, 0), chunkSystem.getChunk(0, 4), chunkSystem.getChunk(4, 4)];
    for (const chunk of chunks) {
      spyOn(chunk, 'registerSpriteSheet');
    }
    chunkSystem.registerSpriteSheet('testKey', sheet);
    for (const chunk of chunks) {
      expect(chunk.registerSpriteSheet).toHaveBeenCalledTimes(1);
      expect(chunk.registerSpriteSheet).toHaveBeenCalledWith('testKey', sheet);
    }
  });

  it('registers sprite sheets with all chunks that are generated afterwards', () => {
    const sheet = new ex.SpriteSheet([]);
    const chunkSystem = new ChunkSystemTileMap(DEFAULT_OPTIONS);
    chunkSystem.registerSpriteSheet('anotherTestKey', sheet);
    chunkSystem.update(engine, 16);
    const chunks = [chunkSystem.getChunk(0, 0), chunkSystem.getChunk(4, 0), chunkSystem.getChunk(0, 4), chunkSystem.getChunk(4, 4)];
    for (const chunk of chunks) {
      expect((chunk as any)._spriteSheets).toEqual({ anotherTestKey: sheet });
    }
  });

  it('does not collide an non-colliding actor', () => {
    const chunkSystem = new ChunkSystemTileMap({
      ...DEFAULT_OPTIONS,
      chunkGenerator: wrapSimpleCellGenerator((cell) => (cell.solid = !cell.x && !cell.y))
    });
    const actor = new ex.Actor({
      x: -34,
      y: -34,
      width: 16,
      height: 16,
      collisionType: ex.CollisionType.Active
    });
    chunkSystem.update(engine, 16);
    expect(chunkSystem.collides(actor)).toBeNull();
  });

  it('collides a colliding actor', () => {
    const chunkSystem = new ChunkSystemTileMap({
      ...DEFAULT_OPTIONS,
      chunkGenerator: wrapSimpleCellGenerator((cell) => (cell.solid = !cell.x && !cell.y))
    });
    const actor = new ex.Actor({
      x: 0,
      y: 0,
      width: 16,
      height: 16,
      collisionType: ex.CollisionType.Active
    });
    chunkSystem.update(engine, 16);
    expect(chunkSystem.collides(actor)).toEqual(ex.vec(0, -8));
  });

  it('returns null for an out-of-bounds chunk', () => {
    const chunkSystem = new ChunkSystemTileMap(DEFAULT_OPTIONS);
    chunkSystem.update(engine, 16);
    expect(chunkSystem.getChunk(8, 0)).toBeNull();
  });

  it('returns null for a non-initialized chunk', () => {
    const chunkSystem = new ChunkSystemTileMap(DEFAULT_OPTIONS);
    expect(chunkSystem.getChunk(0, 0)).toBeNull();
  });

  it('returns an initialized chunk at the specified column and row', () => {
    const chunkSystem = new ChunkSystemTileMap(DEFAULT_OPTIONS);
    chunkSystem.update(engine, 16);
    const chunk = chunkSystem.getChunk(3, 5);
    expect(chunk instanceof ex.TileMap).toBeTrue();
    expect(chunk.x).toBe(-32);
    expect(chunk.y).toBe(0);
    expect(chunk.cols).toBe(chunkSystem.chunkSize);
    expect(chunk.rows).toBe(chunkSystem.chunkSize);
  });

  it('returns null for an out-of-bounds cell', () => {
    const chunkSystem = new ChunkSystemTileMap(DEFAULT_OPTIONS);
    chunkSystem.update(engine, 16);
    expect(chunkSystem.getCell(8, 0)).toBeNull();
  });

  it('returns null for a cell in a non-initialized chunk', () => {
    const chunkSystem = new ChunkSystemTileMap(DEFAULT_OPTIONS);
    expect(chunkSystem.getCell(0, 0)).toBeNull();
  });

  it('returns an initialized cell at the specified column and row', () => {
    const chunkSystem = new ChunkSystemTileMap(DEFAULT_OPTIONS);
    chunkSystem.update(engine, 16);
    const cell = chunkSystem.getCell(5, 1);
    expect(cell instanceof ex.Cell).toBeTrue();
    expect(cell.x).toBe(8);
    expect(cell.y).toBe(-24);
    expect(cell.width).toBe(chunkSystem.cellWidth);
    expect(cell.height).toBe(chunkSystem.cellHeight);
  });

  it('returns the cell at the specified pixel-based coordinates', () => {
    const chunkSystem = new ChunkSystemTileMap(DEFAULT_OPTIONS);
    chunkSystem.update(engine, 16);
    const cell = chunkSystem.getCellByPoint(6, 22);
    expect(cell instanceof ex.Cell).toBeTrue();
    expect(cell.x).toBe(0);
    expect(cell.y).toBe(16);
  });

  it('runs garbage collector before generating new chunks', () => {
    const chunkGarbageCollectorPredicate = jasmine.createSpy('garbageCollectorPredicate', (chunk) => {
      expect(cellGenerator).toHaveBeenCalledTimes(5184);
      return true;
    });
    const cellGenerator = jasmine.createSpy('cellGenerator', (cell) => {
      expect([0, 288].indexOf(chunkGarbageCollectorPredicate.calls.count())).toBeGreaterThan(-1);
      return cell;
    });
    const chunkSystem = new ChunkSystemTileMap({
      ...DEFAULT_OPTIONS,
      x: -4096,
      y: -4096,
      cols: 1024,
      rows: 1024,
      chunkGarbageCollectorPredicate,
      chunkGenerator: wrapSimpleCellGenerator(cellGenerator)
    });
    chunkSystem.update(engine, 16);
    expect(chunkGarbageCollectorPredicate).not.toHaveBeenCalled();
    expect(cellGenerator).toHaveBeenCalledTimes(5184);

    engine.currentScene.camera.x += engine.canvas.width;
    chunkSystem.update(engine, 16);
    expect(chunkGarbageCollectorPredicate).toHaveBeenCalledTimes(288);
    expect(cellGenerator).toHaveBeenCalledTimes(9504);
  });

  it('run the gargage collector only for off-screen chunks', () => {
    //
  });

  it('executes the garbage collector with the chunk, chunk system and engine as arguments', () => {
    //
  });

  it('can handle teleporting the camera over a vast distance', () => {
    //
  });

  it('generates only the chunks that will be drawn', () => {
    //
  });

  it('passed the chunk column and row, chunk system and engine to the chunk generator', () => {
    //
  });

  it('passes the column and row of the chunk to generate within chunks matrix as arguments to the generator', () => {
    // These are not cell columns/rows but chunk columns/rows - one step "higher"
  });

  it('passes the chunk, chunk system and engine to the rendering cache predicate', () => {
    //
  });

  it('does not execute the rendering cache predicate for the same chunk until it is garbage collected', () => {
    //
  });

  it('does not update chunks that are cached in render cache', () => {
    //
  });

  it('passes a new chunk, absolute cell-level column and row, chunk system and engine to simple chunk generator', () => {
    //
  });

  it('uses the chunk that is returned by the simple chunk generator instead of the provided one', () => {
    //
  });

  it('passes a new cell, absolute cell-level column and row, chunk, chunk system and engine to simple cell generator', () => {
    //
  });
});
