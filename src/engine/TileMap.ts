import { BoundingBox } from './Collision/BoundingBox';
import { Engine } from './Engine';
import { vec, Vector } from './Algebra';
import { Logger } from './Util/Log';
import { SpriteSheet } from './Drawing/SpriteSheet';
import * as Events from './Events';
import { Configurable } from './Configurable';
import { Entity } from './EntityComponentSystem/Entity';
import { CanvasDrawComponent } from './Drawing/CanvasDrawComponent';
import { TransformComponent } from './EntityComponentSystem/Components/TransformComponent';
import { BodyComponent } from './Collision/Body';
import { CollisionType } from './Collision/CollisionType';
import { MotionComponent } from './EntityComponentSystem/Components/MotionComponent';
import { Collider, Shape } from './Collision/Index';

/**
 * @hidden
 */
export class TileMapImpl extends Entity<TransformComponent | MotionComponent | BodyComponent | CanvasDrawComponent> {
  private _onScreenXStart: number = 0;
  private _onScreenXEnd: number = 9999;
  private _onScreenYStart: number = 0;
  private _onScreenYEnd: number = 9999;
  private _spriteSheets: { [key: string]: SpriteSheet } = {};
  public logger: Logger = Logger.getInstance();
  public data: Cell[] = [];
  public visible = true;
  public isOffscreen = false;
  public cellWidth: number;
  public cellHeight: number;
  public rows: number;
  public cols: number;

  private _dirty = true;
  public flagDirty() {
    this._dirty = true;
  }

  public get transform(): TransformComponent {
    return this.components.transform;
  }

  public get motion(): MotionComponent {
    return this.components.motion;
  }

  public get pos(): Vector {
    return this.transform.pos;
  }
  
  public set pos(val: Vector) {
    this.transform.pos = val
  }

  public get scale(): Vector {
    return this.transform.scale;
  }

  public set scale(val: Vector) {
    this.transform.scale = val;
  }

  public get rotation(): number {
    return this.transform.rotation;
  }

  public set rotation(val: number) {
    this.transform.rotation = val;
  }

  public get z(): number {
    return this.transform.z; 
  }

  public set z(val: number) {
    this.transform.z = val;
  }
  
  public get vel(): Vector {
    return this.motion.vel;
  }

  public set vel(val: Vector) {
    this.motion.vel = val;
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
    this.addComponent(new BodyComponent({
      box: { width: cellWidth * cols, height: cellHeight * rows },
      type: CollisionType.Fixed,
      anchor: Vector.Zero
    }));
    this.addComponent(new CanvasDrawComponent((ctx, delta) => this.draw(ctx, delta)));

    this.transform.pos.setTo(<number>xOrConfig, y);
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
    this.rows = rows;
    this.cols = cols;
    this.data = new Array<Cell>(rows * cols);
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        (() => {
          const cd = new Cell(i * cellWidth + <number>xOrConfig, j * cellHeight + y, cellWidth, cellHeight, i + j * cols);
          cd.map = this;
          this.data[i + j * cols] = cd;
        })();
      }
    }
  }

  /**
   * Tiles colliders based on the solid tiles in the tilemap.
   */
  private _updateColliders(): void {
    this.components.body.clearColliders();
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
        if (prev && prev.top === current.top && prev.bottom == current.bottom) {
          colliders[colliders.length - 1] = prev.combine(current);
        } else { // else new collider
          colliders.push(current);
        }
      }
    }

    for (let c of colliders) {
      this.components.body.addCollider(new Collider({
        shape: Shape.Box(c.width, c.height, Vector.Zero),
        offset: vec(c.left - this.pos.x, c.top - this.pos.y)
      }));
    }
  }

  public registerSpriteSheet(key: string, spriteSheet: SpriteSheet) {
    this._spriteSheets[key] = spriteSheet;
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

    const worldCoordsUpperLeft = engine.screenToWorldCoordinates(new Vector(0, 0));
    const worldCoordsLowerRight = engine.screenToWorldCoordinates(new Vector(engine.canvas.clientWidth, engine.canvas.clientHeight));

    this._onScreenXStart = Math.max(Math.floor((worldCoordsUpperLeft.x - this.pos.x) / this.cellWidth) - 2, 0);
    this._onScreenYStart = Math.max(Math.floor((worldCoordsUpperLeft.y - this.pos.y) / this.cellHeight) - 2, 0);
    this._onScreenXEnd = Math.max(Math.floor((worldCoordsLowerRight.x - this.pos.x) / this.cellWidth) + 2, 0);
    this._onScreenYEnd = Math.max(Math.floor((worldCoordsLowerRight.y - this.pos.y) / this.cellHeight) + 2, 0);

    this.onPostUpdate(engine, delta);
    this.emit('postupdate', new Events.PostUpdateEvent(engine, delta, this));
  }

  /**
   * Draws the tile map to the screen. Called by the [[Scene]].
   * @param ctx    The current rendering context
   * @param delta  The number of milliseconds since the last draw
   */
  public draw(ctx: CanvasRenderingContext2D, delta: number) {
    this.emit('predraw', new Events.PreDrawEvent(ctx, delta, this));

    let x = this._onScreenXStart;
    const xEnd = Math.min(this._onScreenXEnd, this.cols);
    let y = this._onScreenYStart;
    const yEnd = Math.min(this._onScreenYEnd, this.rows);

    let cs: TileSprite[], csi: number, cslen: number;

    for (x; x < xEnd; x++) {
      for (y; y < yEnd; y++) {
        // get non-negative tile sprites
        cs = this.getCell(x, y).sprites.filter((s) => {
          return s.spriteId > -1;
        });

        for (csi = 0, cslen = cs.length; csi < cslen; csi++) {
          const ss = this._spriteSheets[cs[csi].spriteSheetKey];

          // draw sprite, warning if sprite doesn't exist
          if (ss) {
            const sprite = ss.getSprite(cs[csi].spriteId);
            if (sprite) {
              sprite.draw(ctx, x * this.cellWidth, y * this.cellHeight);
            } else {
              this.logger.warn('Sprite does not exist for id', cs[csi].spriteId, 'in sprite sheet', cs[csi].spriteSheetKey, sprite, ss);
            }
          } else {
            this.logger.warn('Sprite sheet', cs[csi].spriteSheetKey, 'does not exist', ss);
          }
        }
      }
      y = this._onScreenYStart;
    }

    this.emit('postdraw', new Events.PostDrawEvent(ctx, delta, this));
  }

  public debugDraw(_ctx: CanvasRenderingContext2D) {

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
 * Tile sprites are used to render a specific sprite from a [[TileMap]]'s spritesheet(s)
 */
export class TileSprite {
  /**
   * @param spriteSheetKey  The key of the spritesheet to use
   * @param spriteId        The index of the sprite in the [[SpriteSheet]]
   */
  constructor(public spriteSheetKey: string, public spriteId: number) {}
}

/**
 * @hidden
 */
export class CellImpl {
  private _bounds: BoundingBox;
  public readonly x: number;
  public readonly y: number;
  public readonly width: number;
  public readonly height: number;
  public readonly index: number;
  public map: TileMap;

  private _solid = false;
  public get solid(): boolean {
    return this._solid;
  }
  public set solid(val: boolean) {
    this.map?.flagDirty();
    this._solid = val;
  }
  public sprites: TileSprite[] = [];

  /**
   * @param xOrConfig Gets or sets x coordinate of the cell in world coordinates or cell option bag
   * @param y       Gets or sets y coordinate of the cell in world coordinates
   * @param width   Gets or sets the width of the cell
   * @param height  Gets or sets the height of the cell
   * @param index   The index of the cell in row major order
   * @param solid   Gets or sets whether this cell is solid
   * @param sprites The list of tile sprites to use to draw in this cell (in order)
   */
  constructor(
    xOrConfig: number | CellArgs,
    y: number,
    width: number,
    height: number,
    index: number,
    solid: boolean = false,
    sprites: TileSprite[] = []
  ) {
    if (xOrConfig && typeof xOrConfig === 'object') {
      const config = xOrConfig;
      xOrConfig = config.x;
      y = config.y;
      width = config.width;
      height = config.height;
      index = config.index;
      solid = config.solid;
      sprites = config.sprites;
    }
    this.x = <number>xOrConfig;
    this.y = y;
    this.width = width;
    this.height = height;
    this.index = index;
    this.solid = solid;
    this.sprites = sprites;
    this._bounds = new BoundingBox(this.x, this.y, this.x + this.width, this.y + this.height);
  }

  public get bounds() {
    return this._bounds;
  }

  public get center(): Vector {
    return new Vector(this.x + this.width / 2, this.y + this.height / 2);
  }

  /**
   * Add another [[TileSprite]] to this cell
   */
  public pushSprite(tileSprite: TileSprite) {
    this.sprites.push(tileSprite);
  }
  /**
   * Remove an instance of [[TileSprite]] from this cell
   */
  public removeSprite(tileSprite: TileSprite) {
    let index = -1;
    if ((index = this.sprites.indexOf(tileSprite)) > -1) {
      this.sprites.splice(index, 1);
    }
  }
  /**
   * Clear all sprites from this cell
   */
  public clearSprites() {
    this.sprites.length = 0;
  }
}

export interface CellArgs extends Partial<CellImpl> {
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  solid?: boolean;
  sprites?: TileSprite[];
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
  constructor(x: number, y: number, width: number, height: number, index: number, solid?: boolean, sprites?: TileSprite[]);
  constructor(
    xOrConfig: number | CellArgs,
    y?: number,
    width?: number,
    height?: number,
    index?: number,
    solid?: boolean,
    sprites?: TileSprite[]
  ) {
    super(xOrConfig, y, width, height, index, solid, sprites);
  }
}
