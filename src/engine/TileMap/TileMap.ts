import { BoundingBox } from '../Collision/BoundingBox';
import { Engine } from '../Engine';
import { Vector, vec } from '../Math/vector';
import { Logger } from '../Util/Log';
import * as Events from '../Events';
import { Entity } from '../EntityComponentSystem/Entity';
import { TransformComponent } from '../EntityComponentSystem/Components/TransformComponent';
import { BodyComponent } from '../Collision/BodyComponent';
import { CollisionType } from '../Collision/CollisionType';
import { Shape } from '../Collision/Colliders/Shape';
import { ExcaliburGraphicsContext, Graphic, GraphicsComponent, hasGraphicsTick, ParallaxComponent } from '../Graphics';
import { removeItemFromArray } from '../Util/Util';
import { MotionComponent } from '../EntityComponentSystem/Components/MotionComponent';
import { ColliderComponent } from '../Collision/ColliderComponent';
import { CompositeCollider } from '../Collision/Colliders/CompositeCollider';
import { Color } from '../Color';
import { DebugGraphicsComponent } from '../Graphics/DebugGraphicsComponent';
import { Collider } from '../Collision/Colliders/Collider';

export interface TileMapOptions {
  /**
   * Optionally name the isometric tile map
   */
  name?: string;
  /**
   * Optionally specify the position of the isometric tile map
   */
  pos?: Vector;
  /**
   * Width of an individual tile in pixels
   */
  tileWidth: number;
  /**
   * Height of an individual tile in pixels
   */
  tileHeight: number;
  /**
   * The number of tile columns, or the number of tiles wide
   */
  columns: number;
  /**
   * The number of tile  rows, or the number of tiles high
   */
  rows: number;

  /**
   * Optionally render from the top of the graphic, by default tiles are rendered from the bottom
   */
  renderFromTopOfGraphic?: boolean;
}

/**
 * The TileMap provides a mechanism for doing flat 2D tiles rendered in a grid.
 *
 * TileMaps are useful for top down or side scrolling grid oriented games.
 */
export class TileMap extends Entity {
  private _token = 0;
  private _onScreenXStart: number = 0;
  private _onScreenXEnd: number = Number.MAX_VALUE;
  private _onScreenYStart: number = 0;
  private _onScreenYEnd: number = Number.MAX_VALUE;

  public logger: Logger = Logger.getInstance();
  public readonly tiles: Tile[] = [];
  private _rows: Tile[][] = [];
  private _cols: Tile[][] = [];

  public readonly tileWidth: number;
  public readonly tileHeight: number;
  public readonly rows: number;
  public readonly columns: number;

  public renderFromTopOfGraphic = false;

  private _collidersDirty = true;
  public flagCollidersDirty() {
    this._collidersDirty = true;

  }
  private _transform: TransformComponent;
  private _motion: MotionComponent;
  private _graphics: GraphicsComponent;
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

  private _oldPos: Vector;
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
   * @param options
   */
  constructor(options: TileMapOptions) {
    super(null, options.name);
    this.addComponent(new TransformComponent());
    this.addComponent(new MotionComponent());
    this.addComponent(
      new BodyComponent({
        type: CollisionType.Fixed
      })
    );
    this.addComponent(
      new GraphicsComponent({
        onPostDraw: (ctx, delta) => this.draw(ctx, delta)
      })
    );
    this.addComponent(new DebugGraphicsComponent((ctx) => this.debug(ctx)));
    this.addComponent(new ColliderComponent());
    this._graphics = this.get(GraphicsComponent);
    this._transform = this.get(TransformComponent);
    this._motion = this.get(MotionComponent);
    this._collider = this.get(ColliderComponent);
    this._composite = this._collider.useCompositeCollider([]);

    this._transform.pos = options.pos ?? Vector.Zero;
    this._oldPos = this._transform.pos;
    this.renderFromTopOfGraphic = options.renderFromTopOfGraphic ?? this.renderFromTopOfGraphic;
    this.tileWidth = options.tileWidth;
    this.tileHeight = options.tileHeight;
    this.rows = options.rows;
    this.columns = options.columns;
    this.tiles = new Array<Tile>(this.rows * this.columns);
    this._rows = new Array(this.rows);
    this._cols = new Array(this.columns);
    let currentCol: Tile[] = [];
    for (let i = 0; i < this.columns; i++) {
      for (let j = 0; j < this.rows; j++) {
        const cd = new Tile({
          x: i,
          y: j,
          map: this
        });
        cd.map = this;
        this.tiles[i + j * this.columns] = cd;
        currentCol.push(cd);
        if (!this._rows[j]) {
          this._rows[j] = [];
        }
        this._rows[j].push(cd);
      }
      this._cols[i] = currentCol;
      currentCol = [];
    }

    this._graphics.localBounds = new BoundingBox({
      left: 0,
      top: 0,
      right: this.columns * this.tileWidth,
      bottom: this.rows * this.tileHeight
    });
  }

  public _initialize(engine: Engine) {
    super._initialize(engine);
  }


  private _originalOffsets = new WeakMap<Collider, Vector>();
  private _getOrSetColliderOriginalOffset(collider: Collider): Vector {
    if (!this._originalOffsets.has(collider)) {
      const originalOffset = collider.offset;
      this._originalOffsets.set(collider, originalOffset);
      return originalOffset;
    } else {
      return this._originalOffsets.get(collider);
    }
  }
  /**
   * Tiles colliders based on the solid tiles in the tilemap.
   */
  private _updateColliders(): void {
    this._composite.clearColliders();
    const colliders: BoundingBox[] = [];
    this._composite = this._collider.useCompositeCollider([]);
    let current: BoundingBox;
    // Bad square tesselation algo
    for (let i = 0; i < this.columns; i++) {
      // Scan column for colliders
      for (let j = 0; j < this.rows; j++) {
        // Columns start with a new collider
        if (j === 0) {
          current = null;
        }
        const tile = this.tiles[i + j * this.columns];
        // Current tile in column is solid build up current collider
        if (tile.solid) {
          // Use custom collider otherwise bounding box
          if (tile.getColliders().length > 0) {
            for (const collider of tile.getColliders()) {
              const originalOffset = this._getOrSetColliderOriginalOffset(collider);
              collider.offset = vec(tile.x * this.tileWidth, tile.y * this.tileHeight).add(originalOffset);
              collider.owner = this;
              this._composite.addCollider(collider);
            }
            current = null;
          } else {
            if (!current) {
              current = tile.bounds;
            } else {
              current = current.combine(tile.bounds);
            }
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

    for (const c of colliders) {
      const collider = Shape.Box(c.width, c.height, Vector.Zero, vec(c.left - this.pos.x, c.top - this.pos.y));
      collider.owner = this;
      this._composite.addCollider(collider);
    }
    this._collider.update();
  }

  /**
   * Returns the [[Tile]] by index (row major order)
   */
  public getTileByIndex(index: number): Tile {
    return this.tiles[index];
  }
  /**
   * Returns the [[Tile]] by its x and y integer coordinates
   */
  public getTile(x: number, y: number): Tile {
    if (x < 0 || y < 0 || x >= this.columns || y >= this.rows) {
      return null;
    }
    return this.tiles[x + y * this.columns];
  }
  /**
   * Returns the [[Tile]] by testing a point in world coordinates,
   * returns `null` if no Tile was found.
   */
  public getTileByPoint(point: Vector): Tile {
    const x = Math.floor((point.x - this.pos.x) / this.tileWidth);
    const y = Math.floor((point.y - this.pos.y) / this.tileHeight);
    const tile = this.getTile(x, y);
    if (x >= 0 && y >= 0 && x < this.columns && y < this.rows && tile) {
      return tile;
    }
    return null;
  }

  public getRows(): readonly Tile[][] {
    return this._rows;
  }

  public getColumns(): readonly Tile[][] {
    return this._cols;
  }

  public update(engine: Engine, delta: number) {
    this.onPreUpdate(engine, delta);
    this.emit('preupdate', new Events.PreUpdateEvent(engine, delta, this));
    if (!this._oldPos.equals(this.pos)) {
      this.flagCollidersDirty();
      for (let i = 0; i < this.tiles.length; i++) {
        if (this.tiles[i]) {
          this.tiles[i].flagDirty();
        }
      }
    }
    if (this._collidersDirty) {
      this._collidersDirty = false;
      this._updateColliders();
    }

    this._token++;
    const worldBounds = engine.getWorldBounds();
    const worldCoordsUpperLeft = vec(worldBounds.left, worldBounds.top);
    const worldCoordsLowerRight = vec(worldBounds.right, worldBounds.bottom);

    let pos = this.pos;
    const maybeParallax = this.get(ParallaxComponent);
    let parallaxOffset = Vector.One;
    if (maybeParallax) {
      const oneMinusFactor = Vector.One.sub(maybeParallax.parallaxFactor);
      parallaxOffset = engine.currentScene.camera.pos.scale(oneMinusFactor);
      pos = pos.add(parallaxOffset);
    }

    this._onScreenXStart = Math.max(Math.floor((worldCoordsUpperLeft.x - pos.x) / this.tileWidth) - 2, 0);
    this._onScreenYStart = Math.max(Math.floor((worldCoordsUpperLeft.y - pos.y) / this.tileHeight) - 2, 0);
    this._onScreenXEnd = Math.max(Math.floor((worldCoordsLowerRight.x - pos.x) / this.tileWidth) + 2, 0);
    this._onScreenYEnd = Math.max(Math.floor((worldCoordsLowerRight.y - pos.y) / this.tileHeight) + 2, 0);
    // why are we resetting pos?
    this._transform.pos = vec(this.x, this.y);

    this.onPostUpdate(engine, delta);
    this.emit('postupdate', new Events.PostUpdateEvent(engine, delta, this));
  }

  /**
   * Draws the tile map to the screen. Called by the [[Scene]].
   * @param ctx ExcaliburGraphicsContext
   * @param delta  The number of milliseconds since the last draw
   */
  public draw(ctx: ExcaliburGraphicsContext, delta: number): void {
    this.emit('predraw', new Events.PreDrawEvent(ctx as any, delta, this)); // TODO fix event

    let x = this._onScreenXStart;
    const xEnd = Math.min(this._onScreenXEnd, this.columns);
    let y = this._onScreenYStart;
    const yEnd = Math.min(this._onScreenYEnd, this.rows);

    let graphics: readonly Graphic[], graphicsIndex: number, graphicsLen: number;

    for (x; x < xEnd; x++) {
      for (y; y < yEnd; y++) {
        // get non-negative tile sprites
        graphics = this.getTile(x, y).getGraphics();

        for (graphicsIndex = 0, graphicsLen = graphics.length; graphicsIndex < graphicsLen; graphicsIndex++) {
          // draw sprite, warning if sprite doesn't exist
          const graphic = graphics[graphicsIndex];
          if (graphic) {
            if (hasGraphicsTick(graphic)) {
              graphic?.tick(delta, this._token);
            }
            const offsetY = this.renderFromTopOfGraphic ? 0 : (graphic.height - this.tileHeight);
            graphic.draw(ctx, x * this.tileWidth, y * this.tileHeight - offsetY);
          }
        }
      }
      y = this._onScreenYStart;
    }

    this.emit('postdraw', new Events.PostDrawEvent(ctx as any, delta, this));
  }

  public debug(gfx: ExcaliburGraphicsContext) {
    const width = this.tileWidth * this.columns;
    const height = this.tileHeight * this.rows;
    const pos = Vector.Zero;
    for (let r = 0; r < this.rows + 1; r++) {
      const yOffset = vec(0, r * this.tileHeight);
      gfx.drawLine(pos.add(yOffset), pos.add(vec(width, yOffset.y)), Color.Red, 2);
    }

    for (let c = 0; c < this.columns + 1; c++) {
      const xOffset = vec(c * this.tileWidth, 0);
      gfx.drawLine(pos.add(xOffset), pos.add(vec(xOffset.x, height)), Color.Red, 2);
    }

    const colliders = this._composite.getColliders();
    for (const collider of colliders) {
      const grayish = Color.Gray;
      grayish.a = 0.5;
      const bounds = collider.localBounds;
      const pos = collider.worldPos.sub(this.pos);
      gfx.drawRectangle(pos, bounds.width, bounds.height, grayish);
    }
  }
}

export interface TileOptions {
  /**
   * Integer tile x coordinate
   */
  x: number;
  /**
   * Integer tile y coordinate
   */
  y: number;
  map: TileMap;
  solid?: boolean;
  graphics?: Graphic[];
}

/**
 * TileMap Tile
 *
 * A light-weight object that occupies a space in a collision map. Generally
 * created by a [[TileMap]].
 *
 * Tiles can draw multiple sprites. Note that the order of drawing is the order
 * of the sprites in the array so the last one will be drawn on top. You can
 * use transparency to create layers this way.
 */
export class Tile extends Entity {
  private _bounds: BoundingBox;
  private _pos: Vector;
  private _posDirty = false;
  // private _transform: TransformComponent;

  /**
   * Return the world position of the top left corner of the tile
   */
  public get pos() {
    if (this._posDirty) {
      this._recalculate();
      this._posDirty = false;
    }
    return this._pos;
  }

  /**
   * Integer x coordinate of the tile
   */
  public readonly x: number;

  /**
   * Integer y coordinate of the tile
   */
  public readonly y: number;

  /**
   * Width of the tile in pixels
   */
  public readonly width: number;

  /**
   * Height of the tile in pixels
   */
  public readonly height: number;

  /**
   * Reference to the TileMap this tile is associated with
   */
  public map: TileMap;

  private _solid = false;
  /**
   * Wether this tile should be treated as solid by the tilemap
   */
  public get solid(): boolean {
    return this._solid;
  }
  /**
   * Wether this tile should be treated as solid by the tilemap
   */
  public set solid(val: boolean) {
    this.map?.flagCollidersDirty();
    this._solid = val;
  }

  private _graphics: Graphic[] = [];

  /**
   * Current list of graphics for this tile
   */
  public getGraphics(): readonly Graphic[] {
    return this._graphics;
  }

  /**
   * Add another [[Graphic]] to this TileMap tile
   * @param graphic
   */
  public addGraphic(graphic: Graphic) {
    this._graphics.push(graphic);
  }

  /**
   * Remove an instance of a [[Graphic]] from this tile
   */
  public removeGraphic(graphic: Graphic) {
    removeItemFromArray(graphic, this._graphics);
  }

  /**
   * Clear all graphics from this tile
   */
  public clearGraphics() {
    this._graphics.length = 0;
  }

  /**
   * Current list of colliders for this tile
   */
  private _colliders: Collider[] = [];

  /**
   * Returns the list of colliders
   */
  public getColliders(): readonly Collider[] {
    return this._colliders;
  }

  /**
   * Adds a custom collider to the [[Tile]] to use instead of it's bounds
   *
   * If no collider is set but [[Tile.solid]] is set, the tile bounds are used as a collider.
   *
   * **Note!** the [[Tile.solid]] must be set to true for it to act as a "fixed" collider
   * @param collider
   */
  public addCollider(collider: Collider) {
    this._colliders.push(collider);
    this.map.flagCollidersDirty();
  }

  /**
   * Removes a collider from the [[Tile]]
   * @param collider
   */
  public removeCollider(collider: Collider) {
    const index = this._colliders.indexOf(collider);
    if (index > -1) {
      this._colliders.splice(index, 1);
    }
    this.map.flagCollidersDirty();
  }

  /**
   * Clears all colliders from the [[Tile]]
   */
  public clearColliders() {
    this._colliders.length = 0;
    this.map.flagCollidersDirty();
  }

  /**
   * Arbitrary data storage per tile, useful for any game specific data
   */
  public data = new Map<string, any>();

  constructor(options: TileOptions) {
    super();
    this.x = options.x;
    this.y = options.y;
    this.map = options.map;
    this.width = options.map.tileWidth;
    this.height = options.map.tileHeight;
    this.solid = options.solid ?? this.solid;
    this._graphics = options.graphics ?? [];
    this._recalculate();
  }

  public flagDirty() {
    return this._posDirty = true;
  }

  private _recalculate() {
    this._pos = this.map.pos.add(
      vec(
        this.x * this.map.tileWidth,
        this.y * this.map.tileHeight));
    this._bounds = new BoundingBox(this._pos.x, this._pos.y, this._pos.x + this.width, this._pos.y + this.height);
    this._posDirty = false;
  }

  public get bounds() {
    if (this._posDirty) {
      this._recalculate();
    }
    return this._bounds;
  }

  public get center(): Vector {
    if (this._posDirty) {
      this._recalculate();
    }
    return new Vector(this._pos.x + this.width / 2, this._pos.y + this.height / 2);
  }
}