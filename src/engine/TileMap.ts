import { BoundingBox } from './Collision/BoundingBox';
import { Engine } from './Engine';
import { Vector, vec } from './Math/vector';
import { Logger } from './Util/Log';
import { SpriteSheet } from './Drawing/SpriteSheet';
import * as Events from './Events';
import { Configurable } from './Configurable';
import { Entity } from './EntityComponentSystem/Entity';
import { TransformComponent } from './EntityComponentSystem/Components/TransformComponent';
import { BodyComponent } from './Collision/BodyComponent';
import { CollisionType } from './Collision/CollisionType';
import { Shape } from './Collision/Colliders/Shape';
import { ExcaliburGraphicsContext, GraphicsComponent, hasGraphicsTick } from './Graphics';
import * as Graphics from './Graphics';
import { CanvasDrawComponent, Sprite } from './Drawing/Index';
import { Sprite as LegacySprite } from './Drawing/Index';
import { removeItemFromArray } from './Util/Util';
import { obsolete } from './Util/Decorators';
import { MotionComponent } from './EntityComponentSystem/Components/MotionComponent';
import { ColliderComponent } from './Collision/ColliderComponent';
import { CompositeCollider } from './Collision/Colliders/CompositeCollider';

/**
 * @hidden
 */
export class TileMapImpl extends Entity {
  private _token = 0;
  private _onScreenXStart: number = 0;
  private _onScreenXEnd: number = 9999;
  private _onScreenYStart: number = 0;
  private _onScreenYEnd: number = 9999;
  private _spriteSheets: { [key: string]: Graphics.SpriteSheet } = {};

  private _legacySpriteMap = new Map<Graphics.Sprite, Sprite>();
  public logger: Logger = Logger.getInstance();
  public readonly data: Cell[] = [];
  private _rows: Cell[][] = [];
  private _cols: Cell[][] = [];
  public visible = true;
  public isOffscreen = false;
  public readonly cellWidth: number;
  public readonly cellHeight: number;
  public readonly rows: number;
  public readonly cols: number;

  private _dirty = true;
  public flagDirty() {
    this._dirty = true;
  }
  private _transform: TransformComponent;
  private _motion: MotionComponent;
  private _collider: ColliderComponent;
  private _composite: CompositeCollider;

  public get x(): number {
    return this._transform.pos.x ?? 0;
  }

  public set x(val: number) {
    if (this._transform?.pos) {
      this.get(TransformComponent).pos = vec(val, this.y);
    }
  }

  public get y(): number {
    return this._transform?.pos.y ?? 0;
  }

  public set y(val: number) {
    if (this._transform?.pos) {
      this._transform.pos = vec(this.x, val);
    }
  }

  public get z(): number {
    return this._transform.z ?? 0;
  }

  public set z(val: number) {
    if (this._transform) {
      this._transform.z = val;
    }
  }

  public get rotation(): number {
    return this._transform?.rotation ?? 0;
  }

  public set rotation(val: number) {
    if (this._transform?.rotation) {
      this._transform.rotation = val;
    }
  }

  public get scale(): Vector {
    return this._transform?.scale ?? Vector.One;
  }
  public set scale(val: Vector) {
    if (this._transform?.scale) {
      this._transform.scale = val;
    }
  }

  public get pos(): Vector {
    return this._transform.pos;
  }

  public set pos(val: Vector) {
    this._transform.pos = val;
  }

  public get vel(): Vector {
    return this._motion.vel;
  }

  public set vel(val: Vector) {
    this._motion.vel = val;
  }

  public on(eventName: Events.preupdate, handler: (event: Events.PreUpdateEvent<TileMap>) => void): void;
  public on(eventName: Events.postupdate, handler: (event: Events.PostUpdateEvent<TileMap>) => void): void;
  public on(eventName: Events.predraw, handler: (event: Events.PreDrawEvent) => void): void;
  public on(eventName: Events.postdraw, handler: (event: Events.PostDrawEvent) => void): void;
  public on(eventName: string, handler: (event: Events.GameEvent<any>) => void): void;
  public on(eventName: string, handler: (event: any) => void): void {
    super.on(eventName, handler);
  }

  /**
   * @param xOrConfig     The x coordinate to anchor the TileMap's upper left corner (should not be changed once set) or TileMap option bag
   * @param y             The y coordinate to anchor the TileMap's upper left corner (should not be changed once set)
   * @param cellWidth     The individual width of each cell (in pixels) (should not be changed once set)
   * @param cellHeight    The individual height of each cell (in pixels) (should not be changed once set)
   * @param rows          The number of rows in the TileMap (should not be changed once set)
   * @param cols          The number of cols in the TileMap (should not be changed once set)
   */
  constructor(xOrConfig: number | TileMapArgs, y: number, cellWidth: number, cellHeight: number, rows: number, cols: number) {
    super();
    if (xOrConfig && typeof xOrConfig === 'object') {
      const config = xOrConfig;
      xOrConfig = config.x;
      y = config.y;
      cellWidth = config.cellWidth;
      cellHeight = config.cellHeight;
      rows = config.rows;
      cols = config.cols;
    }
    this.addComponent(new TransformComponent());
    this.addComponent(new MotionComponent());
    this.addComponent(
      new BodyComponent({
        type: CollisionType.Fixed
      })
    );
    this.addComponent(new CanvasDrawComponent((ctx, delta) => this.draw(ctx, delta)));
    this.addComponent(
      new GraphicsComponent({
        onPostDraw: (ctx, delta) => this.draw(ctx, delta)
      })
    );
    this.addComponent(new ColliderComponent());
    this._transform = this.get(TransformComponent);
    this._motion = this.get(MotionComponent);
    this._collider = this.get(ColliderComponent);
    this._composite = this._collider.useCompositeCollider([]);

    this.x = <number>xOrConfig;
    this.y = y;
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
    this.rows = rows;
    this.cols = cols;
    this.data = new Array<Cell>(rows * cols);
    this._rows = new Array(rows);
    this._cols = new Array(cols);
    let currentCol: Cell[] = [];
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const cd = new Cell(i * cellWidth + <number>xOrConfig, j * cellHeight + y, cellWidth, cellHeight, i + j * cols);
        cd.map = this;
        this.data[i + j * cols] = cd;
        currentCol.push(cd);
        if (!this._rows[j]) {
          this._rows[j] = [];
        }
        this._rows[j].push(cd);
      }
      this._cols[i] = currentCol;
      currentCol = [];
    }

    this.get(GraphicsComponent).localBounds = new BoundingBox({
      left: 0,
      top: 0,
      right: this.cols * this.cellWidth,
      bottom: this.rows * this.cellHeight
    });
  }

  public _initialize(engine: Engine) {
    super._initialize(engine);
  }

  /**
   *
   * @param key
   * @param spriteSheet
   * @deprecated No longer used, will be removed in v0.26.0
   */
  public registerSpriteSheet(key: string, spriteSheet: SpriteSheet): void;
  public registerSpriteSheet(key: string, spriteSheet: Graphics.SpriteSheet): void;
  @obsolete({ message: 'No longer used, will be removed in v0.26.0' })
  public registerSpriteSheet(key: string, spriteSheet: SpriteSheet | Graphics.SpriteSheet): void {
    if (spriteSheet instanceof Graphics.SpriteSheet) {
      this._spriteSheets[key] = spriteSheet;
    } else {
      this._spriteSheets[key] = Graphics.SpriteSheet.fromLegacySpriteSheet(spriteSheet);
    }
  }

  /**
   * Tiles colliders based on the solid tiles in the tilemap.
   */
  private _updateColliders(): void {
    this._composite.clearColliders();
    const colliders: BoundingBox[] = [];
    let current: BoundingBox;
    // Bad square tessalation algo
    for (let i = 0; i < this.cols; i++) {
      // Scan column for colliders
      for (let j = 0; j < this.rows; j++) {
        // Columns start with a new collider
        if (j === 0) {
          current = null;
        }
        const tile = this.data[i + j * this.cols];
        // Current tile in column is solid build up current collider
        if (tile.solid) {
          if (!current) {
            current = tile.bounds;
          } else {
            current = current.combine(tile.bounds);
          }
        } else {
          // Not solid skip and cut off the current collider
          if (current) {
            colliders.push(current);
          }
          current = null;
        }
      }
      // After a column is complete check to see if it can be merged into the last one
      if (current) {
        // if previous is the same combine it
        const prev = colliders[colliders.length - 1];
        if (prev && prev.top === current.top && prev.bottom === current.bottom) {
          colliders[colliders.length - 1] = prev.combine(current);
        } else {
          // else new collider
          colliders.push(current);
        }
      }
    }
    this._composite = this._collider.useCompositeCollider([]);
    for (const c of colliders) {
      const collider = Shape.Box(c.width, c.height, Vector.Zero, vec(c.left - this.pos.x, c.top - this.pos.y));
      collider.owner = this;
      this._composite.addCollider(collider);
    }
    this._collider.update();
  }

  /**
   * Returns the [[Cell]] by index (row major order)
   */
  public getCellByIndex(index: number): Cell {
    return this.data[index];
  }
  /**
   * Returns the [[Cell]] by its x and y coordinates
   */
  public getCell(x: number, y: number): Cell {
    if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) {
      return null;
    }
    return this.data[x + y * this.cols];
  }
  /**
   * Returns the [[Cell]] by testing a point in global coordinates,
   * returns `null` if no cell was found.
   */
  public getCellByPoint(x: number, y: number): Cell {
    x = Math.floor((x - this.pos.x) / this.cellWidth);
    y = Math.floor((y - this.pos.y) / this.cellHeight);
    const cell = this.getCell(x, y);
    if (x >= 0 && y >= 0 && x < this.cols && y < this.rows && cell) {
      return cell;
    }
    return null;
  }

  public getRows(): readonly Cell[][] {
    return this._rows;
  }

  public getColumns(): readonly Cell[][] {
    return this._cols;
  }

  public onPreUpdate(_engine: Engine, _delta: number) {
    // Override me
  }

  public onPostUpdate(_engine: Engine, _delta: number) {
    // Override me
  }

  public update(engine: Engine, delta: number) {
    this.onPreUpdate(engine, delta);
    this.emit('preupdate', new Events.PreUpdateEvent(engine, delta, this));
    if (this._dirty) {
      this._dirty = false;
      this._updateColliders();
    }

    this._token++;
    const worldBounds = engine.getWorldBounds();
    const worldCoordsUpperLeft = vec(worldBounds.left, worldBounds.top);
    const worldCoordsLowerRight = vec(worldBounds.right, worldBounds.bottom);

    this._onScreenXStart = Math.max(Math.floor((worldCoordsUpperLeft.x - this.x) / this.cellWidth) - 2, 0);
    this._onScreenYStart = Math.max(Math.floor((worldCoordsUpperLeft.y - this.y) / this.cellHeight) - 2, 0);
    this._onScreenXEnd = Math.max(Math.floor((worldCoordsLowerRight.x - this.x) / this.cellWidth) + 2, 0);
    this._onScreenYEnd = Math.max(Math.floor((worldCoordsLowerRight.y - this.y) / this.cellHeight) + 2, 0);
    this._transform.pos = vec(this.x, this.y);

    this.onPostUpdate(engine, delta);
    this.emit('postupdate', new Events.PostUpdateEvent(engine, delta, this));
  }

  /**
   * Draws the tile map to the screen. Called by the [[Scene]].
   * @param ctx CanvasRenderingContext2D or ExcaliburGraphicsContext
   * @param delta  The number of milliseconds since the last draw
   */
  public draw(ctx: CanvasRenderingContext2D | ExcaliburGraphicsContext, delta: number): void {
    this.emit('predraw', new Events.PreDrawEvent(ctx as any, delta, this)); // TODO fix event

    let x = this._onScreenXStart;
    const xEnd = Math.min(this._onScreenXEnd, this.cols);
    let y = this._onScreenYStart;
    const yEnd = Math.min(this._onScreenYEnd, this.rows);

    let graphics: Graphics.Graphic[], graphicsIndex: number, graphicsLen: number;

    for (x; x < xEnd; x++) {
      for (y; y < yEnd; y++) {
        // get non-negative tile sprites
        graphics = this.getCell(x, y).graphics;

        for (graphicsIndex = 0, graphicsLen = graphics.length; graphicsIndex < graphicsLen; graphicsIndex++) {
          // draw sprite, warning if sprite doesn't exist
          const graphic = graphics[graphicsIndex];
          if (graphic) {
            if (!(ctx instanceof CanvasRenderingContext2D)) {
              if (hasGraphicsTick(graphic)) {
                graphic?.tick(delta, this._token);
              }
              graphic.draw(ctx, x * this.cellWidth, y * this.cellHeight);
            } else if (graphic instanceof Graphics.Sprite) {
              // TODO legacy drawing mode
              if (!this._legacySpriteMap.has(graphic)) {
                this._legacySpriteMap.set(graphic, Graphics.Sprite.toLegacySprite(graphic));
              }
              this._legacySpriteMap.get(graphic).draw(ctx, x * this.cellWidth, y * this.cellHeight);
            }
          }
        }
      }
      y = this._onScreenYStart;
    }

    this.emit('postdraw', new Events.PostDrawEvent(ctx as any, delta, this));
  }
}

export interface TileMapArgs extends Partial<TileMapImpl> {
  x: number;
  y: number;
  cellWidth: number;
  cellHeight: number;
  rows: number;
  cols: number;
}

/**
 * The [[TileMap]] class provides a lightweight way to do large complex scenes with collision
 * without the overhead of actors.
 */
export class TileMap extends Configurable(TileMapImpl) {
  constructor(config: TileMapArgs);
  constructor(x: number, y: number, cellWidth: number, cellHeight: number, rows: number, cols: number);
  constructor(xOrConfig: number | TileMapArgs, y?: number, cellWidth?: number, cellHeight?: number, rows?: number, cols?: number) {
    super(xOrConfig, y, cellWidth, cellHeight, rows, cols);
  }
}

/**
 * @hidden
 */
export class CellImpl extends Entity {
  private _bounds: BoundingBox;
  /**
   * World space x coordinate of the left of the cell
   */
  public readonly x: number;
  /**
   * World space y coordinate of the top of the cell
   */
  public readonly y: number;
  /**
   * Width of the cell in pixels
   */
  public readonly width: number;
  /**
   * Height of the cell in pixels
   */
  public readonly height: number;
  /**
   * Current index in the tilemap
   */
  public readonly index: number;

  /**
   * Reference to the TileMap this Cell is associated with
   */
  public map: TileMap;

  private _solid = false;
  /**
   * Wether this cell should be treated as solid by the tilemap
   */
  public get solid(): boolean {
    return this._solid;
  }
  /**
   * Wether this cell should be treated as solid by the tilemap
   */
  public set solid(val: boolean) {
    this.map?.flagDirty();
    this._solid = val;
  }
  /**
   * Current list of graphics for this cell
   */
  public readonly graphics: Graphics.Graphic[] = [];
  /**
   * Abitrary data storage per cell, useful for any game specific data
   */
  public data = new Map<string, any>();

  /**
   * @param xOrConfig Gets or sets x coordinate of the cell in world coordinates or cell option bag
   * @param y       Gets or sets y coordinate of the cell in world coordinates
   * @param width   Gets or sets the width of the cell
   * @param height  Gets or sets the height of the cell
   * @param index   The index of the cell in row major order
   * @param solid   Gets or sets whether this cell is solid
   * @param graphics The list of tile graphics to use to draw in this cell (in order)
   */
  constructor(
    xOrConfig: number | CellArgs,
    y: number,
    width: number,
    height: number,
    index: number,
    solid: boolean = false,
    graphics: Graphics.Graphic[] = []
  ) {
    super();
    if (xOrConfig && typeof xOrConfig === 'object') {
      const config = xOrConfig;
      xOrConfig = config.x;
      y = config.y;
      width = config.width;
      height = config.height;
      index = config.index;
      solid = config.solid;
      graphics = config.sprites;
    }
    this.x = <number>xOrConfig;
    this.y = y;
    this.width = width;
    this.height = height;
    this.index = index;
    this.solid = solid;
    this.graphics = graphics;
    this._bounds = new BoundingBox(this.x, this.y, this.x + this.width, this.y + this.height);
  }

  public get bounds() {
    return this._bounds;
  }

  public get center(): Vector {
    return new Vector(this.x + this.width / 2, this.y + this.height / 2);
  }

  /**
   * Add another [[Sprite]] to this cell
   * @deprecated Use addSprite, will be removed in v0.26.0
   */
  @obsolete({ message: 'Will be removed in v0.26.0', alternateMethod: 'addSprite' })
  public pushSprite(sprite: Graphics.Sprite | LegacySprite) {
    this.addGraphic(sprite);
  }

  /**
   * Add another [[Graphic]] to this TileMap cell
   * @param graphic
   */
  public addGraphic(graphic: Graphics.Graphic | LegacySprite) {
    if (graphic instanceof LegacySprite) {
      this.graphics.push(Graphics.Sprite.fromLegacySprite(graphic));
    } else {
      this.graphics.push(graphic);
    }
  }

  /**
   * Remove an instance of a [[Graphic]] from this cell
   */
  public removeGraphic(graphic: Graphics.Graphic | LegacySprite) {
    removeItemFromArray(graphic, this.graphics);
  }

  /**
   * Clear all graphis from this cell
   */
  public clearGraphics() {
    this.graphics.length = 0;
  }
}

export interface CellArgs extends Partial<CellImpl> {
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  solid?: boolean;
  sprites?: Graphics.Sprite[];
}

/**
 * TileMap Cell
 *
 * A light-weight object that occupies a space in a collision map. Generally
 * created by a [[TileMap]].
 *
 * Cells can draw multiple sprites. Note that the order of drawing is the order
 * of the sprites in the array so the last one will be drawn on top. You can
 * use transparency to create layers this way.
 */
export class Cell extends Configurable(CellImpl) {
  constructor(config: CellArgs);
  constructor(x: number, y: number, width: number, height: number, index: number, solid?: boolean, sprites?: Graphics.Sprite[]);
  constructor(
    xOrConfig: number | CellArgs,
    y?: number,
    width?: number,
    height?: number,
    index?: number,
    solid?: boolean,
    sprites?: Graphics.Sprite[]
  ) {
    super(xOrConfig, y, width, height, index, solid, sprites);
  }
}
