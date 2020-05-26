import { Vector } from './Algebra';
import { Class } from './Class';
import { BoundingBox } from './Collision/BoundingBox';
import { Configurable } from './Configurable';
import { Engine } from './Engine';
import * as Events from './Events';
import { SpriteSheet } from './Drawing/SpriteSheet';
import { Cell, TileMap } from './TileMap';

export type ChunkGenerator = (chunkColumn: number, chunkRow: number, chunkSystemTileMap: ChunkSystemTileMap, engine: Engine) => TileMap;
export type BaseChunkGenerator = (
  chunk: TileMap,
  chunkCellColumn: number,
  chunkCellRow: number,
  chunkSystemTileMap: ChunkSystemTileMap,
  engine: Engine
) => TileMap;
export type BaseCellGenerator = (
  cell: Cell,
  cellColumn: number,
  cellRow: number,
  chunk: TileMap,
  chunkSystemTileMape: ChunkSystemTileMap,
  engine: Engine
) => Cell;

export type ChunkSystemGarbageCollectorPredicate = (chunk: TileMap, chunkSystemTileMap: ChunkSystemTileMap, engine: Engine) => boolean;

export type ChunkRenderingCachePredicate = (chunk: TileMap, chunkSystemTileMap: ChunkSystemTileMap, engine: Engine) => boolean;

type CachedTileMap = TileMap & { renderingCache: null | HTMLCanvasElement };

/**
 * [[include:Constructors.md]]
 */
export interface ChunkSystemTileMapArgs {
  /**
   * The position of this chunk system's top left corner in the scene on the horizontal axis, in pixels.
   */
  x: number;
  /**
   * The position of this chunk system's top left corner in the scene on the verical axis, in pixels.
   */
  y: number;
  /**
   * The number of columns and rows of [[Cell|Cells]] in a single [[TileMap]] chunk used by the chunk system. The chunk size must be a
   * positive safe integer.
   */
  chunkSize: number;
  /**
   * Width of a single [[Cell]] in pixels.
   */
  cellWidth: number;
  /**
   * Height of a single [[Cell]] in pixels.
   */
  cellHeight: number;
  /**
   * The total number of rows of [[Cell|Cells]] in the chunk system. This must be a positive safe integer that is a multiple of
   * [[`chunkSize`]].
   */
  rows: number;
  /**
   * The total number of columns of [[Cell|Cells]] in the chunk system. This must be a positive safe integer that is a multiple of
   * [[`chunkSize`]].
   */
  cols: number;
  /**
   * The callback the chunk system invokes whenever it is about to render a [[TileMap]] chunk that has not been generated yet (or has been
   * garbage collected previously). The chunk system only calls the chunk generator for chunks that will be rendered.
   *
   * Note that the returned chunk will receive all sprite sheets that are registered with the chunk system; there is no need to register
   * sprite sheets with chunks manually.
   *
   * See also: [[`wrapChunkGenerator`]], [[`wrapCellGenerator`]].
   */
  chunkGenerator: ChunkGenerator;
  /**
   * Optional predicate callback that enables chunk garbage collection. When configured to a function, the chunk system will call the
   * provided callback for every off-screen chunk every update. Chunks for which the callback returns `true` are discarded by the chunk
   * system.
   *
   * The use of a chunk garbage collector allows for chunk systems that are larger than can be allocated or fit into memory by the browser.
   */
  chunkGarbageCollectorPredicate?: null | ChunkSystemGarbageCollectorPredicate;
  /**
   * Optional predicate callback that enables pre-rendering of individual chunks, removing the need of rendering every [[Cell]] in a chunk,
   * thus improving rendering performance at the cost of greater memory usage. When configured to a function, the chunk system will call the
   * provided callback for every chunk the system is about to render that has not been pre-rendered yet.
   *
   * Returning `true` for a given chunk will result in the chunk being rendered in full and cached by the chunk system. It is adviced not to
   * cache chunks containing animated [[Cell|Cells]], since that would prevent the animation being played. Please note that the rendered
   * chunk will remain in memory until discarded by the [[chunkGarbageCollectorPredicate]] returning `true` when called with it.
   */
  chunkRenderingCachePredicate?: null | ChunkRenderingCachePredicate;
}

/**
 * @hidden
 */
export class ChunkSystemTileMapImpl extends Class {
  /**
   * The position of this chunk system's top left corner in the scene on the horizontal axis, in pixels.
   */
  public readonly x: number;
  /**
   * The position of this chunk system's top left corner in the scene on the verical axis, in pixels.
   */
  public readonly y: number;
  /**
   * Width of a single [[Cell]] in pixels.
   */
  public readonly cellWidth: number;
  /**
   * Height of a single [[Cell]] in pixels.
   */
  public readonly cellHeight: number;
  /**
   * The number of columns and rows of [[Cell|Cells]] in a single [[TileMap]] chunk used by the chunk system.
   */
  public readonly chunkSize: number;
  /**
   * The total number of columns of [[Cell|Cells]] in the chunk system.
   */
  public readonly cols: number;
  /**
   * The total number of rows of [[Cell|Cells]] in the chunk system.
   */
  public readonly rows: number;
  /**
   * The total number of columns of [[TileMap]] chunks in the chunk system.
   */
  public readonly chunkCols: number;
  /**
   * The total number of rows of [[TileMap]] chunks in the chunk system.
   */
  public readonly chunkRows: number;
  /**
   * The callback the chunk system invokes whenever it is about to render a [[TileMap]] chunk that has not been generated yet (or has been
   * garbage collected previously). The chunk system only calls the chunk generator for chunks that will be rendered.
   *
   * See also: [[`wrapChunkGenerator`]], [[`wrapCellGenerator`]].
   */
  public readonly chunkGenerator: ChunkGenerator;
  /**
   * Predicate callback that enables chunk garbage collection. The chunk system will call the callback for every off-screen chunk every
   * update. Chunks for which the callback returns `true` are discarded by the chunk system.
   *
   * The use of a chunk garbage collector allows for chunk systems that are larger than can be allocated or fit into memory by the browser.
   */
  public readonly chunkGarbageCollectorPredicate: ChunkSystemGarbageCollectorPredicate | null;
  /**
   * Predicate callback that enables pre-rendering of individual chunks, removing the need of rendering every [[Cell]] in a chunk, thus
   * improving rendering performance at the cost of greater memory usage. The chunk system will call the provided callback for every chunk
   * the system is about to render that has not been pre-rendered yet.
   */
  public readonly chunkRenderingCachePredicate: ChunkRenderingCachePredicate | null;
  private readonly _chunks: Array<Array<CachedTileMap | undefined> | undefined>;
  private _chunksXOffset: number;
  private _chunksYOffset: number;
  private readonly _chunksToRender: CachedTileMap[];
  private readonly _spriteSheets: { [key: string]: SpriteSheet };

  /**
   * @param config [[ChunkSystemTileMap]]'s configuration.
   */
  constructor(config: ChunkSystemTileMapArgs) {
    if (config.chunkSize <= 0 || !Number.isSafeInteger(config.chunkSize)) {
      throw new TypeError(`The chunkSize option must be a positive integer, ${config.chunkSize} was provided`);
    }
    if (config.rows <= 0 || !Number.isSafeInteger(config.rows)) {
      throw new TypeError(`The rows option must be a positive integer, ${config.rows} was provided`);
    }
    if (config.cols <= 0 || !Number.isSafeInteger(config.cols)) {
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
    this.chunkGarbageCollectorPredicate = config.chunkGarbageCollectorPredicate || null;
    this.chunkRenderingCachePredicate = config.chunkRenderingCachePredicate || null;
    this._chunks = [];
    this._chunksXOffset = 0;
    this._chunksYOffset = 0;
    this._chunksToRender = [];
    this._spriteSheets = {};
  }

  /**
   * Register sprite sheet with the chunk system and all its [[TileMap]] chunks (both present and generated in the future), allowing sprites
   * from the sprite sheet to be used by the chunk system's [[Cell|Cells]].
   *
   * @param key The key identifying the sprite sheet among all sprite sheets used by this chunk system and its [[TileMap]] chunks. This can
   * be any string.
   * @param spriteSheet The sprite sheet to associate with this chunk system.
   */
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

  /**
   * Returns the [[TileMap]] chunk that owns the cell at the specified column and row of all chunk system's cells. The method returns `null`
   * if the cell's coordinates are out of bounds of the chunk system, the chunk itself has not been generated yet or the chunk has been
   * garbage collected.
   *
   * @param cellX The column of the cell for which the chunk should be retrieved.
   * @param cellY The row of the cell for which the chunk should be retrieved.
   * @return The [[TileMap]] chunk containing the cell at the specified coordinates.
   */
  public getChunk(cellX: number, cellY: number): TileMap | null {
    const chunkX = Math.floor(cellX / this.chunkSize);
    const chunkY = Math.floor(cellY / this.chunkSize);
    const chunkRow = this._chunks[chunkY - this._chunksYOffset];
    const chunk = chunkRow && chunkRow[chunkX - this._chunksXOffset];
    return chunk || null;
  }

  /**
   * Returns the [[Cell]] at the specified column and row of all chunk system's cells. The method returns `null` if the cell's coordinates
   * are out of bounds of the chunk system, the chunk containing the cell has not been generated yet or has been garbage collected.
   *
   * @param cellX The column of the cell.
   * @param cellY The row of the cel.
   * @return The [[Cell]] at the specified coordinates.
   */
  public getCell(cellX: number, cellY: number): Cell | null {
    const chunk = this.getChunk(cellX, cellY);
    if (!chunk) {
      return null;
    }

    return chunk.getCell(cellX % this.chunkSize, cellY % this.chunkSize);
  }

  /**
   * Returns the [[Cell]] at the specified pixel-based coordinates. The method returns `null` if the cell's coordinates are out of bounds of
   * the chunk system, the chunk containing the cell has not been generated yet or the chunk has been garbage collected.
   *
   * @param x The position of any point within the cell's area on the horizontal axis.
   * @param y The position of any point within the cell's area on the vertical axis.
   * @return The [[Cell]] at the specified coordinates.
   */
  public getCellByPoint(x: number, y: number): Cell | null {
    const cellX = Math.floor((x - this.x) / this.cellWidth);
    const cellY = Math.floor((y - this.y) / this.cellHeight);
    return this.getCell(cellX, cellY);
  }

  /**
   * Updates the chunk system for rendering. This method is invoked by the engine itself, direct use of it is discouradged in general.
   *
   * The method determines which chunks will be rendered in the current frame, runs garbage collection on the off-screen chunks if
   * configured to do so, generates the missing chunks and updates the chunks to render. Chunks that are to be cached pre-rendered are
   * pre-rendered by this method.
   *
   * @param engine The game engine that uses this chunk system.
   * @param delta The time since the last frame was rendered, in milliseconds.
   */
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

    if (this.chunkGarbageCollectorPredicate) {
      this._garbageCollectChunks(chunkOnScreenXStart, chunkOnScreenYStart, chunkOnScreenXEnd, chunkOnScreenYEnd, engine);
    }

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

  /**
   * Renders the chunk system's [[Cell|Cells]] that are on-screen. This method is invoked by the engine itself, direct use of it is
   * discouradged in general.
   *
   * @param ctx The engine's rendering context.
   * @param delta The time since the last frame was rendered, in milliseconds.
   */
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

  /**
   * Renders debugging information (cell borders) for the [[Cell|Cells]] that are on-screen. This method is invoked by the engine itself,
   * direct use of it is discouradged in general.
   *
   * @param ctx The engine's rendering context.
   */
  public debugDraw(ctx: CanvasRenderingContext2D): void {
    for (let i = 0, len = this._chunksToRender.length; i < len; i++) {
      this._chunksToRender[i].debugDraw(ctx);
    }
  }

  private _updateChunk(chunkX: number, chunkY: number, engine: Engine, delta: number): CachedTileMap {
    this._growChunkMatrixForChunkAt(chunkX, chunkY);

    // Create the chunk if it does not exist already and update it
    const chunkRow = this._chunks[chunkY - this._chunksYOffset];
    if (!chunkRow[chunkX - this._chunksXOffset]) {
      const chunk = this.chunkGenerator(chunkX, chunkY, this, engine);
      const spritesToRegister = Object.entries(this._spriteSheets);
      for (let spriteIndex = 0; spriteIndex < spritesToRegister.length; spriteIndex++) {
        const [key, spriteSheet] = spritesToRegister[spriteIndex];
        chunk.registerSpriteSheet(key, spriteSheet);
      }
      chunkRow[chunkX - this._chunksXOffset] = Object.assign(chunk, { renderingCache: null });
    }
    const chunk = chunkRow[chunkX - this._chunksXOffset];

    if (!chunk.renderingCache) {
      if (this.chunkRenderingCachePredicate && this.chunkRenderingCachePredicate(chunk, this, engine)) {
        this._preRenderChunk(chunk, engine, delta);
      } else {
        chunk.update(engine, delta);
      }
    }

    return chunk;
  }

  private _growChunkMatrixForChunkAt(chunkX: number, chunkY: number): void {
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
  }

  private _preRenderChunk(chunk: CachedTileMap, engine: Engine, delta: number): void {
    const chunkOffScreenCulling = chunk.offScreenCulling;
    chunk.offScreenCulling = false;
    chunk.update(engine, delta);

    chunk.renderingCache = document.createElement('canvas');
    chunk.renderingCache.width = chunk.cols * chunk.cellWidth;
    chunk.renderingCache.height = chunk.rows * chunk.cellHeight;
    const cacheRenderingContext = chunk.renderingCache.getContext('2d');
    cacheRenderingContext.translate(-chunk.x, -chunk.y);
    chunk.draw(cacheRenderingContext, delta);

    chunk.offScreenCulling = chunkOffScreenCulling;
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
 * The [[ChunkSystemTileMap]] class provides a way to do extremely large tile maps (up to 9_007_199_254_740_991×9_007_199_254_740_991
 * [[Cell|Cells]] with some tricks). As the name implies, the [[ChunkSystemTileMap]] is used in a way similar to a [[TileMap]], however its
 * cells are organized into tiled square [[TileMap]] chunks. This allows loading or procedural generation of the currently needed chunks
 * on-demand and unloading the currently unneeded chunks from the memory.
 *
 * [[include:TileMaps.md]]
 */
export class ChunkSystemTileMap extends Configurable(ChunkSystemTileMapImpl) {}

/**
 * Returns a new [[ChunkGenerator]] that is based on the provided [[BaseChunkGenerator]]. This helper provides basic common business logic
 * used in [[ChunkGenerator|ChunkGenerators]] for [[ChunkSystemTileMap|ChunkSystemTileMaps]], namely creating a new [[TileMap]] instance at
 * the correct location, with the correct number of columns, rows and [[Cell]] dimensions, as well as doing some of the required
 * calculations for the [[BaseChunkGenerator]].
 *
 * This allows for streamlining the chunk generation logic somewhat in most cases.
 *
 * The returned chunk generator will return the [[TileMap|TileMaps]] returned by the provided base chunk generator.
 *
 * @param chunkGenerator The base chunk generator to wrap into a regular chunk generator.
 * @return A [[ChunkGenerator]] that is based on the provided base chunk generator.
 */
export function wrapChunkGenerator(chunkGenerator: BaseChunkGenerator): ChunkGenerator {
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
    return chunkGenerator(chunk, chunkCellColumn, chunkCellRow, chunkSystemTileMap, engine);
  };
}

/**
 * Returns a new [[ChunkGenerator]] that is based on the provided [[BaseCellGenerator]]. This helper provides basic common business logic
 * used in [[ChunkGenerator|ChunkGenerators]] for [[ChunkSystemTileMap|ChunkSystemTileMaps]], namely creating a new [[TileMap]] instance at
 * the correct location, with the correct number of columns, rows as [[Cell]] dimensions, as well as doing some of the calculations for the
 * [[BaseCellGenerator]].
 *
 * This allows for streamlining the chunk generation logic somewhat in most cases.
 *
 * The returned chunk generator will use the [[Cell|Cells]] returned by the provided base cell generator.
 *
 * @param cellGenerator The base cell generator tor wrap into a regular chunk generator.
 * @return A [[ChunkGenerator]] that is based on the provided base cell generator.
 */
export function wrapCellGenerator(cellGenerator: BaseCellGenerator): ChunkGenerator {
  return wrapChunkGenerator((chunk, chunkCellColumn, chunkCellRow, chunkSystemTileMap, engine) => {
    const { cols, rows } = chunk;
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < cols; column++) {
        const cellIndex = column + row * cols;
        const pregeneratedCell = chunk.getCellByIndex(cellIndex);
        const cell = cellGenerator(pregeneratedCell, chunkCellColumn + column, chunkCellRow + row, chunk, chunkSystemTileMap, engine);
        chunk.data[cellIndex] = cell;
      }
    }
    return chunk;
  });
}
