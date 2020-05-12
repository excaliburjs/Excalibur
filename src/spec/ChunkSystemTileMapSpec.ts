import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';
import { ChunkSystemTileMap, wrapChunkGenerator, wrapCellGenerator } from '@excalibur';

const DEFAULT_OPTIONS = {
  x: -32,
  y: -32,
  cellWidth: 8,
  cellHeight: 8,
  chunkSize: 4,
  cols: 8,
  rows: 8,
  chunkGarbageCollectorPredicate: () => false,
  chunkGenerator: wrapChunkGenerator((chunk) => chunk)
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
          chunkGenerator: wrapChunkGenerator((chunk) => chunk),
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
          chunkGenerator: wrapChunkGenerator((chunk) => chunk),
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
          chunkGenerator: wrapChunkGenerator((chunk) => chunk),
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
        chunkGenerator: wrapChunkGenerator((chunk) => chunk),
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
        chunkGenerator: wrapChunkGenerator((chunk) => chunk),
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
      chunkGenerator: wrapCellGenerator((cell) => {
        cell.solid = !cell.x && !cell.y;
        return cell;
      })
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
      chunkGenerator: wrapCellGenerator((cell) => {
        cell.solid = !cell.x && !cell.y;
        return cell;
      })
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
    expect(chunk).toBeInstanceOf(ex.TileMap);
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
    expect(cell).toBeInstanceOf(ex.Cell);
    expect(cell.x).toBe(8);
    expect(cell.y).toBe(-24);
    expect(cell.width).toBe(chunkSystem.cellWidth);
    expect(cell.height).toBe(chunkSystem.cellHeight);
  });

  it('returns the cell at the specified pixel-based coordinates', () => {
    const chunkSystem = new ChunkSystemTileMap(DEFAULT_OPTIONS);
    chunkSystem.update(engine, 16);
    const cell = chunkSystem.getCellByPoint(6, 22);
    expect(cell).toBeInstanceOf(ex.Cell);
    expect(cell.x).toBe(0);
    expect(cell.y).toBe(16);
  });

  it('runs garbage collector before generating new chunks', () => {
    const chunkGarbageCollectorPredicate = jasmine
      .createSpy('garbageCollectorPredicate', (chunk) => {
        expect(cellGenerator).toHaveBeenCalledTimes(5184);
        return true;
      })
      .and.callThrough();
    const cellGenerator = jasmine
      .createSpy('cellGenerator', (cell) => {
        expect([0, 288].indexOf(chunkGarbageCollectorPredicate.calls.count())).toBeGreaterThan(-1);
        return cell;
      })
      .and.callThrough();
    const chunkSystem = new ChunkSystemTileMap({
      ...DEFAULT_OPTIONS,
      x: -4096,
      y: -4096,
      cols: 1024,
      rows: 1024,
      chunkGarbageCollectorPredicate,
      chunkGenerator: wrapCellGenerator(cellGenerator)
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
    const chunkGarbageCollectorPredicate = (chunk: ex.TileMap) => {
      const screenBounds = engine.getWorldBounds();
      const chunkBounds = new ex.BoundingBox(
        chunk.x,
        chunk.y,
        chunk.x + chunk.cellWidth * chunk.cols,
        chunk.y + chunk.cellHeight * chunk.rows
      );
      expect(chunkBounds.intersect(screenBounds)).toBeNull();
      return true;
    };
    const chunkSystem = new ChunkSystemTileMap({
      ...DEFAULT_OPTIONS,
      x: -4096,
      y: -4096,
      cols: 1024,
      rows: 1024,
      chunkGarbageCollectorPredicate
    });
    chunkSystem.update(engine, 16);
    engine.currentScene.camera.x += engine.canvas.width;
    chunkSystem.update(engine, 16);
  });

  it('executes the garbage collector with the chunk, chunk system and engine as arguments', () => {
    const chunkGarbageCollectorPredicate = (...args: unknown[]) => {
      expect(args[0]).toBeInstanceOf(ex.TileMap);
      expect(args.slice(1)).toEqual([chunkSystem, engine]);
      return true;
    };
    const chunkSystem = new ChunkSystemTileMap({
      ...DEFAULT_OPTIONS,
      x: -4096,
      y: -4096,
      cols: 1024,
      rows: 1024,
      chunkGarbageCollectorPredicate
    });
    chunkSystem.update(engine, 16);
    engine.currentScene.camera.x += engine.canvas.width;
    chunkSystem.update(engine, 16);
  });

  it('can handle teleporting the camera over a vast distance', () => {
    // Chromium 81 can handle only (sparse) arrays of up to 4_294_967_295 items before throwing an "Invalid array length" RangeError. This
    // test attempts to create a chunk matrix of 1_000_000_000_000×1_000_000_000_000 chunks and teleports the camera from one side of the
    // chunk system to the other. Iff the garbage collection is implemented correctly, the chunk system will not crash, otherwise this will
    // result in an array length error due to the chunk system attempting to allocate too large an array.
    // Note: if the garbage collector predicate prevents the chunk system from destroying the chunks, the array length
    // error is unavoidable on such large systems (this should be documented).

    const expectedMaximumSupportedArrayLength = 4_294_967_295;
    expect(() => new Array(expectedMaximumSupportedArrayLength + 1)).toThrowMatching((thrown) => thrown instanceof RangeError);

    const size = 1_000_000_000_000;
    expect(size).toBeGreaterThan(expectedMaximumSupportedArrayLength); // future-proof test's internal consistency check
    const chunkSystem = new ChunkSystemTileMap({
      x: -size / 2,
      y: -size / 2,
      cellWidth: 1,
      cellHeight: 1,
      chunkSize: 1,
      cols: size,
      rows: size,
      chunkGenerator: wrapCellGenerator(() => undefined),
      chunkGarbageCollectorPredicate: () => true
    });
    engine.currentScene.camera.x = chunkSystem.x;
    chunkSystem.update(engine, 16);
    engine.currentScene.camera.x = chunkSystem.x + chunkSystem.cols * chunkSystem.cellWidth;
    chunkSystem.update(engine, 16);
  });

  it('generates only the chunks that will be drawn', () => {
    const chunkSystem = new ChunkSystemTileMap({
      ...DEFAULT_OPTIONS,
      x: -4096,
      y: -4096,
      cols: 1024,
      rows: 1024,
      chunkGenerator: wrapChunkGenerator((chunk) => {
        const screenBounds = engine.getWorldBounds();
        const chunkBounds = new ex.BoundingBox(
          chunk.x,
          chunk.y,
          chunk.x + chunk.cellWidth * chunk.cols,
          chunk.y + chunk.cellHeight * chunk.rows
        );
        if (!chunkBounds.intersect(screenBounds)) {
          // There is a small intended overdraw to match the behavior of TileMap.
          const chunkDistance = chunkBounds.center.sub(screenBounds.center).size;
          const maxPermittedDistance = ex.vec(
            screenBounds.width + chunkSystem.chunkSize * chunkSystem.cellWidth,
            screenBounds.height + chunkSystem.chunkSize * chunkSystem.cellHeight
          ).size;
          expect(chunkDistance).toBeLessThanOrEqual(maxPermittedDistance);
        }
        return chunk;
      })
    });
    chunkSystem.update(engine, 16);
  });

  it('passes the chunk column and row, chunk system and engine to the chunk generator', () => {
    const chunkSystem = new ChunkSystemTileMap({
      ...DEFAULT_OPTIONS,
      chunkGenerator: (...args: unknown[]) => {
        expect(args.slice(0, 2).map((arg) => typeof arg)).toEqual(['number', 'number']);
        expect(args.slice(2)).toEqual([chunkSystem, engine]);
        return new ex.TileMap({
          x: 0,
          y: 0,
          cellWidth: 8,
          cellHeight: 8,
          cols: 4,
          rows: 4
        });
      }
    });
    chunkSystem.update(engine, 16);
  });

  it('passes the column and row of the chunk to generate within chunks matrix as arguments to the chunk generator', () => {
    // These are not cell columns/rows but chunk columns/rows - one step "higher"
    const expectedCoords = [] as [number, number][];
    const chunkSystem = new ChunkSystemTileMap({
      ...DEFAULT_OPTIONS,
      chunkGenerator: (col, row) => {
        expect(col).toBeGreaterThanOrEqual(0);
        expect(col).toBeLessThan(chunkSystem.cols / chunkSystem.chunkSize);
        expect(row).toBeGreaterThanOrEqual(0);
        expect(row).toBeLessThan(chunkSystem.rows / chunkSystem.chunkSize);
        const coordIndex = expectedCoords.reduce(
          // This is more-or-less the Array.prototype.find() method, just unoptimized
          (matchingIndex, coord, index) => (ex.vec(coord[0], coord[1]).equals(ex.vec(col, row)) ? index : matchingIndex),
          -1
        );
        expect(coordIndex).toBeGreaterThan(-1);
        expectedCoords.splice(coordIndex, 1);
        return new ex.TileMap({
          x: 0,
          y: 0,
          cellWidth: 8,
          cellHeight: 8,
          cols: 4,
          rows: 4
        });
      }
    });
    for (let col = 0; col < chunkSystem.cols / chunkSystem.chunkSize; col++) {
      for (let row = 0; row < chunkSystem.rows / chunkSystem.chunkSize; row++) {
        expectedCoords.push([col, row]);
      }
    }
    chunkSystem.update(engine, 16);
    expect(expectedCoords.length).toBe(0);
  });

  it('passes the chunk, chunk system and engine to the rendering cache predicate', () => {
    const chunkRenderingCachePredicate = jasmine
      .createSpy('renderingCachePredicate', (...args: unknown[]) => {
        expect(args[0]).toBeInstanceOf(ex.TileMap);
        expect(args.slice(1)).toEqual([chunkSystem, engine]);
        return false;
      })
      .and.callThrough();
    const chunkSystem = new ChunkSystemTileMap({
      ...DEFAULT_OPTIONS,
      chunkRenderingCachePredicate
    });
    chunkSystem.update(engine, 16);
    expect(chunkRenderingCachePredicate).toHaveBeenCalledTimes(4);
  });

  it('does not execute the rendering cache predicate for the same cached chunk until it is garbage collected', () => {
    const chunkCachingDecisionCounter = new Map<ex.TileMap, number>();
    const chunkSystem = new ChunkSystemTileMap({
      ...DEFAULT_OPTIONS,
      chunkGenerator: wrapChunkGenerator((chunk) => {
        chunkCachingDecisionCounter.set(chunk, 0);
        return chunk;
      }),
      chunkGarbageCollectorPredicate: () => true,
      chunkRenderingCachePredicate: (chunk) => {
        chunkCachingDecisionCounter.set(chunk, chunkCachingDecisionCounter.get(chunk) + 1);
        return true;
      }
    });
    chunkSystem.update(engine, 16);
    expect(Array.from(chunkCachingDecisionCounter.values()).every((callCount) => callCount === 1)).toBeTrue();
    chunkSystem.update(engine, 16);
    expect(Array.from(chunkCachingDecisionCounter.values()).every((callCount) => callCount === 1)).toBeTrue();
    engine.currentScene.camera.x += chunkSystem.cellWidth * (chunkSystem.cols + 2) + engine.canvasWidth;
    chunkSystem.update(engine, 16);
    expect(Array.from(chunkCachingDecisionCounter.values()).every((callCount) => callCount === 1)).toBeTrue();
    expect(chunkCachingDecisionCounter.size).toBe(4);
    expect((chunkSystem as any)._chunks.length).toBe(0);
    engine.currentScene.camera.x -= chunkSystem.cellWidth * (chunkSystem.cols + 2) + engine.canvasWidth;
    chunkSystem.update(engine, 16);
    expect(Array.from(chunkCachingDecisionCounter.values()).every((callCount) => callCount === 1)).toBeTrue();
    expect(chunkCachingDecisionCounter.size).toBe(8);
  });

  it('does not update chunks that are cached in render cache', () => {
    const updateSpies = new Set<jasmine.Spy>();
    const chunkSystem = new ChunkSystemTileMap({
      ...DEFAULT_OPTIONS,
      chunkRenderingCachePredicate: (chunk) => {
        updateSpies.add(spyOn(chunk, 'update'));
        return true;
      }
    });
    chunkSystem.update(engine, 16);
    expect(updateSpies.size).toBe(4);
    expect(Array.from(updateSpies).every((updateSpy) => updateSpy.calls.count() === 1)).toBeTrue();
    chunkSystem.update(engine, 16);
    expect(updateSpies.size).toBe(4);
    expect(Array.from(updateSpies).every((updateSpy) => updateSpy.calls.count() === 1)).toBeTrue();
  });

  it('passes a new chunk, absolute cell-level column and row, chunk system and engine to base chunk generator', () => {
    const pendingCoordinates = [] as [number, number][];
    const chunkSystem = new ChunkSystemTileMap({
      ...DEFAULT_OPTIONS,
      chunkGenerator: wrapChunkGenerator((chunk, col, row, chunkSystemTileMap, engine2) => {
        expect(chunk).toBeInstanceOf(ex.TileMap);
        expect([0, 4].includes(col)).toBeTrue();
        expect([0, 4].includes(row)).toBeTrue();
        expect(chunkSystemTileMap).toBe(chunkSystem);
        expect(engine2).toBe(engine);
        const coordinatesIndex = pendingCoordinates.findIndex((coord) => ex.vec(coord[0], coord[1]).equals(ex.vec(col, row)));
        expect(coordinatesIndex).toBeGreaterThan(-1);
        pendingCoordinates.splice(coordinatesIndex, 1);
        return chunk;
      })
    });
    for (const row of [0, 4]) {
      for (const col of [0, 4]) {
        pendingCoordinates.push([col, row]);
      }
    }
    chunkSystem.update(engine, 16);
    expect(pendingCoordinates.length).toBe(0);
  });

  it('uses the chunk that is returned by the base chunk generator instead of the provided one', () => {
    const preGeneratedChunks = new Set<ex.TileMap>();
    const generatedChunks = new Set<ex.TileMap>();
    const chunkSystem = new ChunkSystemTileMap({
      ...DEFAULT_OPTIONS,
      chunkGenerator: wrapChunkGenerator((chunk) => {
        spyOn(chunk, 'update');
        preGeneratedChunks.add(chunk);
        const chunkToUse = new ex.TileMap({
          x: chunk.x,
          y: chunk.y,
          cellWidth: DEFAULT_OPTIONS.cellWidth,
          cellHeight: DEFAULT_OPTIONS.cellHeight,
          cols: DEFAULT_OPTIONS.chunkSize,
          rows: DEFAULT_OPTIONS.chunkSize
        });
        spyOn(chunkToUse, 'update');
        generatedChunks.add(chunkToUse);
        return chunkToUse;
      })
    });
    chunkSystem.update(engine, 16);
    for (const chunk of Array.from(preGeneratedChunks)) {
      expect(chunk.update).not.toHaveBeenCalled();
    }
    for (const chunk of Array.from(generatedChunks)) {
      expect(chunk.update).toHaveBeenCalledTimes(1);
    }
  });

  it('passes a new cell, absolute cell-level column and row, chunk, chunk system and engine to base cell generator', () => {
    const pendingCoordinates = [] as [number, number][];
    const chunkSystem = new ChunkSystemTileMap({
      ...DEFAULT_OPTIONS,
      chunkGenerator: wrapCellGenerator((cell, col, row, chunk, chunkSystemTileMap, engine2) => {
        expect(cell).toBeInstanceOf(ex.Cell);
        expect([0, 1, 2, 3, 4, 5, 6, 7].includes(col)).toBeTrue();
        expect([0, 1, 2, 3, 4, 5, 6, 7].includes(row)).toBeTrue();
        expect(chunk).toBeInstanceOf(ex.TileMap);
        expect(chunkSystemTileMap).toBe(chunkSystem);
        expect(engine2).toBe(engine);
        const coordinatesIndex = pendingCoordinates.findIndex((coord) => ex.vec(coord[0], coord[1]).equals(ex.vec(col, row)));
        expect(coordinatesIndex).toBeGreaterThan(-1);
        pendingCoordinates.splice(coordinatesIndex, 1);
        return cell;
      })
    });
    for (const row of [0, 1, 2, 3, 4, 5, 6, 7]) {
      for (const col of [0, 1, 2, 3, 4, 5, 6, 7]) {
        pendingCoordinates.push([col, row]);
      }
    }
    chunkSystem.update(engine, 16);
    expect(pendingCoordinates.length).toBe(0);
  });

  it('uses the cell that is returned by the base cell generator instead of the provided one', () => {
    const secretValue = {};
    const chunkSystem = new ChunkSystemTileMap({
      ...DEFAULT_OPTIONS,
      chunkGenerator: wrapCellGenerator((pregeneratedCell) => {
        const cell = new ex.Cell({
          x: pregeneratedCell.x,
          y: pregeneratedCell.y,
          width: pregeneratedCell.width,
          height: pregeneratedCell.height,
          index: pregeneratedCell.index
        });
        (cell as any).secret = secretValue;
        return cell;
      })
    });
    chunkSystem.update(engine, 16);
    expect(
      (chunkSystem as any)._chunks
        .flat()
        .map((chunk) => chunk.data)
        .flat()
        .every((cell) => cell.secret === secretValue)
    ).toBeTrue();
  });
});
