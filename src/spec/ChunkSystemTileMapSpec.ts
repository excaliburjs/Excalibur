import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';
import { ChunkSystemTileMap } from '@excalibur';

describe('ChunkSystemTileMap', () => {
  const engine = TestUtils.engine();

  it('rejects zero, negative number or non-integer as chunk size', () => {
    const forbiddenValues = [0, -1, 1.25];
    for (const value of forbiddenValues) {
      expect(() => {
        new ex.ChunkSystemTileMap({
          cellWidth: 8,
          cellHeight: 8,
          chunkGarbageCollectorPredicate: () => true,
          chunkGenerator: ex.wrapSimpleChunkGenerator((chunk) => chunk),
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
          chunkGenerator: ex.wrapSimpleChunkGenerator((chunk) => chunk),
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
          chunkGenerator: ex.wrapSimpleChunkGenerator((chunk) => chunk),
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
        chunkGenerator: ex.wrapSimpleChunkGenerator((chunk) => chunk),
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
        chunkGenerator: ex.wrapSimpleChunkGenerator((chunk) => chunk),
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
    const chunkSystem = new ChunkSystemTileMap({
      x: -32,
      y: -32,
      cellWidth: 8,
      cellHeight: 8,
      chunkSize: 4,
      cols: 8,
      rows: 8,
      chunkGarbageCollectorPredicate: () => true,
      chunkGenerator: ex.wrapSimpleChunkGenerator((chunk) => chunk)
    });
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
    const chunkSystem = new ChunkSystemTileMap({
      x: -32,
      y: -32,
      cellWidth: 8,
      cellHeight: 8,
      chunkSize: 4,
      cols: 8,
      rows: 8,
      chunkGarbageCollectorPredicate: () => true,
      chunkGenerator: ex.wrapSimpleChunkGenerator((chunk) => chunk)
    });
    chunkSystem.registerSpriteSheet('anotherTestKey', sheet);
    chunkSystem.update(engine, 16);
    const chunks = [chunkSystem.getChunk(0, 0), chunkSystem.getChunk(4, 0), chunkSystem.getChunk(0, 4), chunkSystem.getChunk(4, 4)];
    for (const chunk of chunks) {
      expect((chunk as any)._spriteSheets).toEqual({ anotherTestKey: sheet });
    }
  });
});
