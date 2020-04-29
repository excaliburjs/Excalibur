import { Actor } from './Actor';
import { Vector } from './Algebra';
import { Class } from './Class';
import { BoundingBox } from './Collision/BoundingBox';
import { Configurable } from './Configurable';
import { Engine } from './Engine';
import * as Events from './Events';
import { SpriteSheet } from './Drawing/SpriteSheet';
import { Cell, TileMap } from './TileMap';

export type ChunkGenerator = (chunkColumn: number, chunkRow: number, chunkSystemTileMap: ChunkSystemTileMap, engine: Engine) => TileMap;
export type SimpleChunkGenerator = (
  chunk: TileMap,
  chunkCellColumn: number,
  chunkCellRow: number,
  chunkSystemTileMap: ChunkSystemTileMap,
  engine: Engine
) => TileMap;
export type SimpleCellGenerator = (
  cell: Cell,
  cellColumn: number,
  cellRow: number,
  chunk: TileMap,
  chunkSystemTileMape: ChunkSystemTileMap,
  engine: Engine
) => void;

export type ChunkSystemGarbageCollectorPredicate = (chunk: TileMap, chunkSystemTileMap: ChunkSystemTileMap, engine: Engine) => boolean;

export type ChunkRenderingCachePredicate = (chunk: TileMap, chunkSystemTileMap: ChunkSystemTileMap, engine: Engine) => boolean;

type CachedTileMap = TileMap & { renderingCache: null | HTMLCanvasElement };

interface ChunkSystemTileMapArgs {
  x: number;
  y: number;
  chunkSize: number;
  cellWidth: number;
  cellHeight: number;
  rows: number;
  cols: number;
  chunkGenerator: ChunkGenerator;
  chunkGarbageCollectorPredicate: ChunkSystemGarbageCollectorPredicate;
  chunkRenderingCachePredicate?: null | ChunkRenderingCachePredicate;
}

/**
 * @hidden
 */
export class ChunkSystemTileMapImpl extends Class {
  public readonly x: number;
  public readonly y: number;
  public readonly cellWidth: number;
  public readonly cellHeight: number;
  public readonly chunkSize: number;
  public readonly cols: number;
  public readonly rows: number;
  public readonly chunkCols: number;
  public readonly chunkRows: number;
  public readonly chunkGenerator: ChunkGenerator;
  public readonly chunkGarbageCollectorPredicate: ChunkSystemGarbageCollectorPredicate;
  private readonly _chunks: Array<Array<CachedTileMap | undefined> | undefined>;
  private _chunksXOffset: number;
  private _chunksYOffset: number;
  private readonly _chunksToRender: CachedTileMap[];
  private readonly _spriteSheets: { [key: string]: SpriteSheet };
  private readonly _chunkRenderingCachePredicate: null | ChunkRenderingCachePredicate;

  constructor(config: ChunkSystemTileMapArgs) {
    if (config.chunkSize <= 0 || !isSafeInteger(config.chunkSize)) {
      throw new TypeError(`The chunkSize option must be a positive integer, ${config.chunkSize} was provided`);
    }
    if (config.rows <= 0 || !isSafeInteger(config.rows)) {
      throw new TypeError(`The rows option must be a positive integer, ${config.rows} was provided`);
    }
    if (config.cols <= 0 || !isSafeInteger(config.cols)) {
      throw new TypeError(`The cols option must be a positive integer, ${config.cols} was provided`);
    }
    if (config.cols % config.chunkSize) {
      throw new Error(
        `The cols option must be a multiple of the chunkSize option, ${config.cols} was provided for the cols option, ${config.chunkSize}` +
          ' was provided for the chunkSize option.'
      );
    }
    if (config.rows % config.chunkSize) {
      throw new Error(
        `The rows option must be a multiple of the chunkSize option, ${config.rows} was provided for the rows option, ${config.chunkSize}` +
          ' was provided for the chunkSize option.'
      );
    }

    super();

    this.x = config.x;
    this.y = config.y;
    this.cellWidth = config.cellWidth;
    this.cellHeight = config.cellHeight;
    this.chunkSize = config.chunkSize;
    this.cols = config.cols;
    this.rows = config.rows;
    this.chunkCols = this.cols / this.chunkSize;
    this.chunkRows = this.rows / this.chunkSize;
    this.chunkGenerator = config.chunkGenerator;
    this.chunkGarbageCollectorPredicate = config.chunkGarbageCollectorPredicate;
    this._chunks = [];
    this._chunksXOffset = 0;
    this._chunksYOffset = 0;
    this._chunksToRender = [];
    this._spriteSheets = {};
    this._chunkRenderingCachePredicate = config.chunkRenderingCachePredicate || null;
  }

  public registerSpriteSheet(key: string, spriteSheet: SpriteSheet): void {
    this._spriteSheets[key] = spriteSheet;
    for (let rowIndex = 0; rowIndex < this._chunks.length; rowIndex++) {
      const chunkRow = this._chunks[rowIndex];
      for (let columnIndex = 0; columnIndex < chunkRow.length; columnIndex++) {
        const chunk = chunkRow[columnIndex];
        if (chunk) {
          chunk.registerSpriteSheet(key, spriteSheet);
        }
      }
    }
  }

  public collides(actor: Actor): Vector | null {
    const horizontalStep = Math.max(Math.min(actor.width / 2, this.cellWidth / 2), 1);
    const verticalStep = Math.max(Math.min(actor.height / 2, this.cellHeight / 2), 1);
    const rightBound = actor.pos.x + actor.width;
    const bottomBound = actor.pos.y + actor.height;
    const actorBounds = actor.body.collider.bounds;
    const overlaps: Vector[] = [];
    // trace points for overlap
    for (let x = actorBounds.left; x <= rightBound; x += horizontalStep) {
      for (let y = actorBounds.top; y <= bottomBound; y += verticalStep) {
        const cell = this.getCellByPoint(x, y);
        if (cell && cell.solid) {
          const overlap = actorBounds.intersect(cell.bounds);
          const dir = actor.center.sub(cell.center);
          if (overlap && overlap.dot(dir) > 0) {
            overlaps.push(overlap);
          }
        }
      }
    }
    if (!overlaps.length) {
      return null;
    }
    // Return the smallest change other than zero
    return overlaps.reduce((accum, next) => {
      let x = accum.x;
      let y = accum.y;
      if (Math.abs(accum.x) < Math.abs(next.x)) {
        x = next.x;
      }
      if (Math.abs(accum.y) < Math.abs(next.y)) {
        y = next.y;
      }
      return new Vector(x, y);
    });
  }

  public getChunk(cellX: number, cellY: number): TileMap | null {
    const chunkX = Math.floor(cellX / this.chunkSize);
    const chunkY = Math.floor(cellY / this.chunkSize);
    const chunkRow = this._chunks[chunkY - this._chunksYOffset];
    const chunk = chunkRow && chunkRow[chunkX - this._chunksXOffset];
    return chunk || null;
  }

  public getCell(cellX: number, cellY: number): Cell | null {
    const chunk = this.getChunk(cellX, cellY);
    if (!chunk) {
      return null;
    }

    return chunk.getCell(cellX % this.chunkSize, cellY % this.chunkSize);
  }

  public getCellByPoint(x: number, y: number): Cell | null {
    const cellX = Math.floor((x - this.x) / this.cellWidth);
    const cellY = Math.floor((y - this.y) / this.cellHeight);
    return this.getCell(cellX, cellY);
  }

  public update(engine: Engine, delta: number): void {
    this.emit('preupdate', new Events.PreUpdateEvent(engine, delta, this));

    const worldCoordsUpperLeft = engine.screenToWorldCoordinates(new Vector(0, 0));
    const worldCoordsLowerRight = engine.screenToWorldCoordinates(new Vector(engine.canvas.clientWidth, engine.canvas.clientHeight));

    const cellOnScreenXStart = Math.floor((worldCoordsUpperLeft.x - this.x) / this.cellWidth) - 2;
    const cellOnScreenYStart = Math.floor((worldCoordsUpperLeft.y - this.y) / this.cellHeight) - 2;
    const cellOnScreenXEnd = Math.floor((worldCoordsLowerRight.x - this.x) / this.cellWidth) + 2;
    const cellOnScreenYEnd = Math.floor((worldCoordsLowerRight.y - this.y) / this.cellHeight) + 2;

    const chunkOnScreenXStart = Math.floor(cellOnScreenXStart / this.chunkSize);
    const chunkOnScreenYStart = Math.floor(cellOnScreenYStart / this.chunkSize);
    const chunkOnScreenXEnd = Math.floor(cellOnScreenXEnd / this.chunkSize);
    const chunkOnScreenYEnd = Math.floor(cellOnScreenYEnd / this.chunkSize);

    this._garbageCollectChunks(chunkOnScreenXStart, chunkOnScreenYStart, chunkOnScreenXEnd, chunkOnScreenYEnd, engine);

    const renderChunkXStart = Math.min(Math.max(chunkOnScreenXStart, 0), this.cols / this.chunkSize - 1);
    const renderChunkYStart = Math.min(Math.max(chunkOnScreenYStart, 0), this.rows / this.chunkSize - 1);
    const renderChunkXEnd = Math.min(Math.max(chunkOnScreenXEnd, 0), this.cols / this.chunkSize - 1);
    const renderChunkYEnd = Math.min(Math.max(chunkOnScreenYEnd, 0), this.rows / this.chunkSize - 1);
    if (!this._chunks.length) {
      this._chunksXOffset = renderChunkXStart;
      this._chunksYOffset = renderChunkYStart;
    }

    this._chunksToRender.splice(0);
    if (
      new BoundingBox(renderChunkXStart, renderChunkYStart, renderChunkXEnd, renderChunkYEnd).intersect(
        new BoundingBox(chunkOnScreenXStart, chunkOnScreenYStart, chunkOnScreenXEnd, chunkOnScreenYEnd)
      )
    ) {
      for (let chunkY = renderChunkYStart; chunkY <= renderChunkYEnd; chunkY++) {
        for (let chunkX = renderChunkXStart; chunkX <= renderChunkXEnd; chunkX++) {
          this._chunksToRender.push(this._updateChunk(chunkX, chunkY, engine, delta));
        }
      }
    }

    this.emit('postupdate', new Events.PostUpdateEvent(engine, delta, this));
  }

  public draw(ctx: CanvasRenderingContext2D, delta: number): void {
    this.emit('predraw', new Events.PreDrawEvent(ctx, delta, this));

    for (let i = 0, len = this._chunksToRender.length; i < len; i++) {
      const chunk = this._chunksToRender[i];
      if (chunk.renderingCache) {
        ctx.drawImage(chunk.renderingCache, chunk.x, chunk.y);
      } else {
        chunk.draw(ctx, delta);
      }
    }

    this.emit('postdraw', new Events.PostDrawEvent(ctx, delta, this));
  }

  public debugDraw(ctx: CanvasRenderingContext2D): void {
    for (let i = 0, len = this._chunksToRender.length; i < len; i++) {
      this._chunksToRender[i].debugDraw(ctx);
    }
  }

  private _updateChunk(chunkX: number, chunkY: number, engine: Engine, delta: number): CachedTileMap {
    const spritesToRegister = objectEntries(this._spriteSheets);

    // Update the chunks matrix by adding rows/columns to accomodate the chunk at the specified coordinates
    if (chunkX < this._chunksXOffset) {
      for (const row of this._chunks) {
        row.unshift(...new Array(this._chunksXOffset - chunkX));
      }
      this._chunksXOffset = chunkX;
    }
    if (this._chunks.length && chunkX >= this._chunksXOffset + this._chunks[0].length) {
      for (const row of this._chunks) {
        row.push(...new Array(chunkX - (this._chunksXOffset + row.length) + 1));
      }
    }
    const expectedChunkRowLength = this._chunks.length ? this._chunks[0].length : 1;
    while (chunkY < this._chunksYOffset) {
      this._chunks.unshift([...new Array(expectedChunkRowLength)]);
      this._chunksYOffset--;
    }
    while (chunkY >= this._chunksYOffset + this._chunks.length) {
      this._chunks.push([...new Array(expectedChunkRowLength)]);
    }

    // Create the chunk if it does not exist already and update it
    const chunkRow = this._chunks[chunkY - this._chunksYOffset];
    if (!chunkRow[chunkX - this._chunksXOffset]) {
      const chunk = this.chunkGenerator(chunkX, chunkY, this, engine);
      for (let spriteIndex = 0; spriteIndex < spritesToRegister.length; spriteIndex++) {
        const [key, spriteSheet] = spritesToRegister[spriteIndex];
        chunk.registerSpriteSheet(key, spriteSheet);
      }
      chunkRow[chunkX - this._chunksXOffset] = assign(chunk, { renderingCache: null });
    }
    const chunk = chunkRow[chunkX - this._chunksXOffset];

    if (!chunk.renderingCache) {
      if (this._chunkRenderingCachePredicate && this._chunkRenderingCachePredicate(chunk, this, engine)) {
        // We trick the TileMap chunk into assuming it is entirely visible on the screen, forcing it to render all its cells so that we may
        // cache the rendering result.
        const virtualEngine = Object.create(engine);
        virtualEngine.screenToWorldCoordinates = (point: Vector): Vector => {
          if (!point.x && !point.y) {
            return new Vector(chunk.x, chunk.y);
          }
          return new Vector(chunk.x + chunk.cols * chunk.cellWidth, chunk.y + chunk.rows * chunk.cellHeight);
        };
        chunk.update(virtualEngine, delta);

        chunk.renderingCache = document.createElement('canvas');
        chunk.renderingCache.width = chunk.cols * chunk.cellWidth;
        chunk.renderingCache.height = chunk.rows * chunk.cellHeight;
        const cacheRenderingContext = chunk.renderingCache.getContext('2d');
        cacheRenderingContext.translate(-chunk.x, -chunk.y);
        chunk.draw(cacheRenderingContext, delta);
      } else {
        chunk.update(engine, delta);
      }
    }

    return chunk;
  }

  private _garbageCollectChunks(
    chunkOnScreenXStart: number,
    chunkOnScreenYStart: number,
    chunkOnScreenXEnd: number,
    chunkOnScreenYEnd: number,
    engine: Engine
  ): void {
    const onScreenRowIndexStart = chunkOnScreenYStart - this._chunksYOffset;
    const onScreenRowIndexEnd = chunkOnScreenYEnd - this._chunksYOffset;
    const onScreenColumnIndexStart = chunkOnScreenXStart - this._chunksXOffset;
    const onScreenColumnIndexEnd = chunkOnScreenXEnd - this._chunksXOffset;

    let leadingRowsToRemove = 0;
    let trailingRowsToRemove = 0;
    let leadingColumnsToRemove = Number.POSITIVE_INFINITY;
    let trailingColumnsToRemove = Number.POSITIVE_INFINITY;

    for (let chunkRowIndex = 0; chunkRowIndex < this._chunks.length; chunkRowIndex++) {
      const chunkRow = this._chunks[chunkRowIndex];
      let rowCleared = true;

      let removedLeadingChunks = 0;
      let removedTrailingChunks = 0;
      for (let chunkColumnIndex = 0; chunkColumnIndex < chunkRow.length; chunkColumnIndex++) {
        if (
          chunkRowIndex >= onScreenRowIndexStart &&
          chunkRowIndex <= onScreenRowIndexEnd &&
          chunkColumnIndex >= onScreenColumnIndexStart &&
          chunkColumnIndex <= onScreenColumnIndexEnd
        ) {
          rowCleared = false;
          continue;
        }

        const chunk = chunkRow[chunkColumnIndex];
        if (chunk) {
          if (this.chunkGarbageCollectorPredicate(chunk, this, engine)) {
            chunkRow[chunkColumnIndex] = undefined;
          } else {
            rowCleared = false;
          }
        }

        if (chunkColumnIndex < onScreenColumnIndexStart) {
          if (rowCleared) {
            removedLeadingChunks++;
          }
        } else {
          if (chunkRow[chunkColumnIndex]) {
            removedTrailingChunks = 0;
          } else {
            removedTrailingChunks++;
          }
        }
      }
      leadingColumnsToRemove = Math.min(leadingColumnsToRemove, removedLeadingChunks);
      trailingColumnsToRemove = Math.min(trailingColumnsToRemove, removedTrailingChunks);

      if (chunkRowIndex < onScreenRowIndexStart) {
        if (rowCleared && leadingRowsToRemove === chunkRowIndex) {
          leadingRowsToRemove++;
        }
      } else {
        if (rowCleared) {
          trailingRowsToRemove++;
        } else {
          trailingRowsToRemove = 0;
        }
      }
    }

    this._chunks.splice(this._chunks.length - trailingRowsToRemove);
    this._chunks.splice(0, leadingRowsToRemove);
    this._chunksYOffset += leadingRowsToRemove;
    for (let rowIndex = 0; rowIndex < this._chunks.length; rowIndex++) {
      const chunkRow = this._chunks[rowIndex];
      chunkRow.splice(chunkRow.length - trailingColumnsToRemove);
      chunkRow.splice(0, leadingColumnsToRemove);
    }
    this._chunksXOffset += leadingColumnsToRemove;
  }
}

/**
 * The [[ChunkSystemTileMap]] class provides a way to do extremally large scenes with collision
 * without the overhead of actors. As the name implies, the ChunkSystemTileMap is used as a regular
 * [[TileMap]], however its cells are organized into tiled square chunks. This allows loading of the
 * currently needed chunks on demand and unloading the currently unneeded chunks from the memory.
 */
export class ChunkSystemTileMap extends Configurable(ChunkSystemTileMapImpl) {}

export function wrapSimpleChunkGenerator(simpleGenerator: SimpleChunkGenerator): ChunkGenerator {
  return (chunkColumn: number, chunkRow: number, chunkSystemTileMap: ChunkSystemTileMap, engine: Engine) => {
    const chunkCellColumn = chunkColumn * chunkSystemTileMap.chunkSize;
    const chunkCellRow = chunkRow * chunkSystemTileMap.chunkSize;
    const chunk = new TileMap({
      x: chunkSystemTileMap.x + chunkCellColumn * chunkSystemTileMap.cellWidth,
      y: chunkSystemTileMap.y + chunkCellRow * chunkSystemTileMap.cellHeight,
      cellWidth: chunkSystemTileMap.cellWidth,
      cellHeight: chunkSystemTileMap.cellHeight,
      rows: chunkSystemTileMap.chunkSize,
      cols: chunkSystemTileMap.chunkSize
    });
    return simpleGenerator(chunk, chunkCellColumn, chunkCellRow, chunkSystemTileMap, engine);
  };
}

export function wrapSimpleCellGenerator(simpleGenerator: SimpleCellGenerator): ChunkGenerator {
  return wrapSimpleChunkGenerator((chunk, chunkCellColumn, chunkCellRow, chunkSystemTileMap, engine) => {
    const { cols, rows } = chunk;
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < cols; column++) {
        simpleGenerator(chunk.getCell(column, row), chunkCellColumn + column, chunkCellRow + row, chunk, chunkSystemTileMap, engine);
      }
    }
    return chunk;
  });
}

function isSafeInteger(number: number): boolean {
  type AugmentedNumber = typeof Number & { isSafeInteger(number: number): boolean };
  if (typeof (Number as AugmentedNumber).isSafeInteger === 'function') {
    return (Number as AugmentedNumber).isSafeInteger(number);
  }

  return Math.floor(number) === number && Math.abs(number) <= 9007199254740991;
}

function assign<T extends object, E extends object>(target: T, extension: E): T & E {
  type AugmentedObject = typeof Object & { assign<T extends object, E extends object>(target: T, extension: E): T & E };
  if (typeof (Object as AugmentedObject).assign === 'function') {
    return (Object as AugmentedObject).assign(target, extension);
  }

  const extendedTarget = target as T & E;
  for (const [key, value] of objectEntries(extension as { [key: string]: any })) {
    extendedTarget[key as keyof E] = value;
  }

  return extendedTarget;
}

function objectEntries<T>(object: { [s: string]: T } | ArrayLike<T>): [string, T][] {
  type AugmentedObject = typeof Object & { entries<T>(object: { [s: string]: T } | ArrayLike<T>): [string, T][] };
  if (typeof (Object as AugmentedObject).entries === 'function') {
    return (Object as AugmentedObject).entries(object);
  }

  const entries: [string, T][] = [];
  for (const key in object) {
    entries.push([key, object[key as keyof object]]);
  }
  return entries;
}
