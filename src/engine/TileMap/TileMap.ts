import { BoundingBox } from '../Collision/BoundingBox';
import { Engine } from '../Engine';
import { Vector, vec } from '../Math/vector';
import { Logger } from '../Util/Log';
import { Entity, EntityEvents } from '../EntityComponentSystem/Entity';
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
import { PostDrawEvent, PostUpdateEvent, PreDrawEvent, PreUpdateEvent } from '../Events';
import { EventEmitter, EventKey, Handler, Subscription } from '../EventEmitter';
import { CoordPlane } from '../Math/coord-plane';
import { QuadTree } from '../Collision/Detection/QuadTree';

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

export type TileMapEvents = EntityEvents & {
  preupdate: PreUpdateEvent<TileMap>;
  postupdate: PostUpdateEvent<TileMap>;
  predraw: PreDrawEvent;
  postdraw: PostDrawEvent
}

export const TileMapEvents = {
  PreUpdate: 'preupdate',
  PostUpdate: 'postupdate',
  PreDraw: 'predraw',
  PostDraw: 'postdraw'
};

/**
 * The TileMap provides a mechanism for doing flat 2D tiles rendered in a grid.
 *
 * TileMaps are useful for top down or side scrolling grid oriented games.
 */
export class TileMap extends Entity {
  public events = new EventEmitter<TileMapEvents>();
  private _token = 0;
  private _engine: Engine;

  public logger: Logger = Logger.getInstance();
  private _quadTree: QuadTree<Tile>;
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

  public flagTilesDirty() {
    for (let i = 0; i < this.tiles.length; i++) {
      if (this.tiles[i]) {
        this.tiles[i].flagDirty();
      }
    }
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

  private _oldRotation: number;
  public get rotation(): number {
    return this._transform?.rotation ?? 0;
  }

  public set rotation(val: number) {
    if (this._transform) {
      this._transform.rotation = val;
    }
  }

  private _oldScale: Vector;
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

  public emit<TEventName extends EventKey<TileMapEvents>>(eventName: TEventName, event: TileMapEvents[TEventName]): void;
  public emit(eventName: string, event?: any): void;
  public emit<TEventName extends EventKey<TileMapEvents> | string>(eventName: TEventName, event?: any): void {
    this.events.emit(eventName, event);
  }

  public on<TEventName extends EventKey<TileMapEvents>>(eventName: TEventName, handler: Handler<TileMapEvents[TEventName]>): Subscription;
  public on(eventName: string, handler: Handler<unknown>): Subscription;
  public on<TEventName extends EventKey<TileMapEvents> | string>(eventName: TEventName, handler: Handler<any>): Subscription {
    return this.events.on(eventName, handler);
  }

  public once<TEventName extends EventKey<TileMapEvents>>(eventName: TEventName, handler: Handler<TileMapEvents[TEventName]>): Subscription;
  public once(eventName: string, handler: Handler<unknown>): Subscription;
  public once<TEventName extends EventKey<TileMapEvents> | string>(eventName: TEventName, handler: Handler<any>): Subscription {
    return this.events.once(eventName, handler);
  }

  public off<TEventName extends EventKey<TileMapEvents>>(eventName: TEventName, handler: Handler<TileMapEvents[TEventName]>): void;
  public off(eventName: string, handler: Handler<unknown>): void;
  public off(eventName: string): void;
  public off<TEventName extends EventKey<TileMapEvents> | string>(eventName: TEventName, handler?: Handler<any>): void {
    this.events.off(eventName, handler);
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
    this.addComponent(new DebugGraphicsComponent((ctx) => this.debug(ctx), false));
    this.addComponent(new ColliderComponent());
    this._graphics = this.get(GraphicsComponent);
    this._transform = this.get(TransformComponent);
    this._motion = this.get(MotionComponent);
    this._collider = this.get(ColliderComponent);
    this._composite = this._collider.useCompositeCollider([]);

    this._transform.pos = options.pos ?? Vector.Zero;
    this._oldPos = this._transform.pos.clone();
    this._oldScale = this._transform.scale.clone();
    this.renderFromTopOfGraphic = options.renderFromTopOfGraphic ?? this.renderFromTopOfGraphic;
    this.tileWidth = options.tileWidth;
    this.tileHeight = options.tileHeight;
    this.rows = options.rows;
    this.columns = options.columns;

    // TODO we need to invalidate the quad tree if the tilemap ever moves
    this._quadTree = new QuadTree<Tile>(
      BoundingBox.fromDimension(
        this.columns * this.tileWidth,
        this.rows * this.tileHeight, Vector.Zero, this.pos));
    this.tiles = new Array<Tile>(this.rows * this.columns);
    this._rows = new Array(this.rows);
    this._cols = new Array(this.columns);
    let currentCol: Tile[] = [];
    for (let i = 0; i < this.columns; i++) {
      for (let j = 0; j < this.rows; j++) {
        const tile = new Tile({
          x: i,
          y: j,
          map: this
        });
        tile.map = this;
        this._quadTree.insert(tile);
        this.tiles[i + j * this.columns] = tile;
        currentCol.push(tile);
        if (!this._rows[j]) {
          this._rows[j] = [];
        }
        this._rows[j].push(tile);
      }
      this._cols[i] = currentCol;
      currentCol = [];
    }

    this._graphics.localBounds = new BoundingBox({
      left: 0,
      top: 0,
      right: this.columns * this.tileWidth * this.scale.x,
      bottom: this.rows * this.tileHeight * this.scale.y
    });
  }

  public _initialize(engine: Engine) {
    super._initialize(engine);
    this._engine = engine;
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

  private _updateQuadTree() {
    this._quadTree = new QuadTree<Tile>(
      BoundingBox.fromDimension(this.columns * this.tileWidth, this.rows * this.tileHeight, Vector.Zero, Vector.Zero)
        .scale(this.scale)
        .translate(this.pos)
        .rotate(this.rotation, this.pos)
    );

    for (let i = 0; i < this.tiles.length; i++) {
      this._quadTree.insert(this.tiles[i]);
    }
  }

  /**
   * Tiles colliders based on the solid tiles in the tilemap.
   */
  private _updateColliders(): void {
    this._collider.$colliderRemoved.notifyAll(this._composite);
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
            // tile with custom collider interrupting the current run
            for (const collider of tile.getColliders()) {
              const originalOffset = this._getOrSetColliderOriginalOffset(collider);
              collider.offset = vec(tile.x * this.tileWidth * this.scale.x, tile.y * this.tileHeight * this.scale.y).add(originalOffset);
              collider.owner = this;
              this._composite.addCollider(collider);
            }
            //we push any current collider before nulling the current run
            if (current) {
              colliders.push(current);
            }
            current = null;
          // Use the bounding box
          } else {
            if (!current) {
              // no current run, start one
              current = tile.defaultGeometry;
            } else {
              // combine with current run
              current = current.combine(tile.defaultGeometry);
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
    // Notify that colliders have been updated
    this._collider.$colliderAdded.notifyAll(this._composite);
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
    const x = Math.floor((point.x - this.pos.x) / (this.tileWidth * this.scale.x));
    const y = Math.floor((point.y - this.pos.y) / (this.tileHeight * this.scale.y));
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
    this.emit('preupdate', new PreUpdateEvent(engine, delta, this));
    if (!this._oldPos.equals(this.pos) ||
       this._oldRotation !== this.rotation ||
      !this._oldScale.equals(this.scale)) {
      this.flagCollidersDirty();
      this.flagTilesDirty();
    }
    if (this._collidersDirty) {
      this._collidersDirty = false;
      this._updateColliders();
      this._updateQuadTree();
    }

    this._token++;

    this.pos.clone(this._oldPos);
    this._oldRotation = this.rotation;
    this.scale.clone(this._oldScale);
    this._transform.pos = this.pos;
    this.onPostUpdate(engine, delta);
    this.emit('postupdate', new PostUpdateEvent(engine, delta, this));
  }

  /**
   * Draws the tile map to the screen. Called by the [[Scene]].
   * @param ctx ExcaliburGraphicsContext
   * @param delta  The number of milliseconds since the last draw
   */
  public draw(ctx: ExcaliburGraphicsContext, delta: number): void {
    this.emit('predraw', new PreDrawEvent(ctx as any, delta, this)); // TODO fix event
    let worldBounds = this._engine.screen.getWorldBounds();
    const screenBounds = this._engine.screen.getScreenBounds();

    let graphics: readonly Graphic[], graphicsIndex: number, graphicsLen: number;
    const isScreenCoords = this._transform.coordPlane === CoordPlane.Screen;

    const maybeParallax = this.get(ParallaxComponent);
    if (maybeParallax) {
      let pos = this.pos;
      const oneMinusFactor = Vector.One.sub(maybeParallax.parallaxFactor);
      const parallaxOffset = this._engine.currentScene.camera.pos.scale(oneMinusFactor);
      pos = pos.sub(parallaxOffset);
      // adjust world bounds by parallax factor
      worldBounds = worldBounds.translate(pos);
    }

    const tiles = this._quadTree.query(isScreenCoords ? screenBounds : worldBounds);
    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i];
      // get non-negative tile sprites
      graphics = tile.getGraphics();

      for (graphicsIndex = 0, graphicsLen = graphics.length; graphicsIndex < graphicsLen; graphicsIndex++) {
        // draw sprite, warning if sprite doesn't exist
        const graphic = graphics[graphicsIndex];
        if (graphic) {
          if (hasGraphicsTick(graphic)) {
            graphic?.tick(delta, this._token);
          }
          const offsetY = this.renderFromTopOfGraphic ? 0 : (graphic.height - this.tileHeight);
          graphic.draw(ctx, tile.x * this.tileWidth, tile.y * this.tileHeight - offsetY);
        }
      }
    }

    this.emit('postdraw', new PostDrawEvent(ctx as any, delta, this));
  }

  public debug(gfx: ExcaliburGraphicsContext) {
    const width = this.tileWidth * this.columns * this.scale.x;
    const height = this.tileHeight * this.rows * this.scale.y;
    const pos = this.pos;
    for (let r = 0; r < this.rows + 1; r++) {
      const yOffset = vec(0, r * this.tileHeight * this.scale.y);
      gfx.drawLine(pos.add(yOffset), pos.add(vec(width, yOffset.y)), Color.Red, 2);
    }

    for (let c = 0; c < this.columns + 1; c++) {
      const xOffset = vec(c * this.tileWidth * this.scale.x, 0);
      gfx.drawLine(pos.add(xOffset), pos.add(vec(xOffset.x, height)), Color.Red, 2);
    }

    const colliders = this._composite.getColliders();
    gfx.save();
    gfx.translate(this.pos.x, this.pos.y);
    gfx.scale(this.scale.x, this.scale.y);
    for (const collider of colliders) {
      const grayish = Color.Gray;
      grayish.a = 0.5;
      const bounds = collider.localBounds;
      const pos = collider.worldPos.sub(this.pos);
      gfx.drawRectangle(pos, bounds.width, bounds.height, grayish);
    }
    gfx.restore();
    gfx.save();
    gfx.z = 999;
    this._quadTree.debug(gfx);
    for (let i = 0; i < this.tiles.length; i++) {
      this.tiles[i].bounds.draw(gfx);
    }
    gfx.restore();
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
  private _geometry: BoundingBox;
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

  private _width: number;
  /**
   * Width of the tile in pixels
   */
  public get width(): number {
    return this._width;
  }

  private _height: number;
  /**
   * Height of the tile in pixels
   */
  public get height(): number {
    return this._height;
  }

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
    this._width = options.map.tileWidth * this.map.scale.x;
    this._height = options.map.tileHeight * this.map.scale.y;
    this.solid = options.solid ?? this.solid;
    this._graphics = options.graphics ?? [];
    this._recalculate();
  }

  public flagDirty() {
    return this._posDirty = true;
  }

  private _recalculate() {
    const geometryPos = this.map.pos.add(vec(this.x * this.map.tileWidth, this.y * this.map.tileHeight));
    this._geometry = new BoundingBox(geometryPos.x, geometryPos.y, geometryPos.x + this.map.tileWidth, geometryPos.y + this.map.tileHeight);

    this._width = this.map.tileWidth * this.map.scale.x;
    this._height = this.map.tileHeight * this.map.scale.y;

    this._pos = this.map.pos.add(
      vec(
        this.x * this._width,
        this.y * this._height));
    this._bounds = new BoundingBox(this._pos.x, this._pos.y, this._pos.x + this._width, this._pos.y + this._height);

    if (this.map.rotation) {
      this._bounds = this._bounds.rotate(this.map.rotation, this.map.pos);
    }
    this._posDirty = false;
  }

  /**
   * Tile bounds in world space
   */
  public get bounds() {
    if (this._posDirty) {
      this._recalculate();
    }
    return this._bounds;
  }

  public get defaultGeometry() {
    return this._geometry;
  }

  /**
   * Tile position in world space
   */
  public get center(): Vector {
    if (this._posDirty) {
      this._recalculate();
    }
    return new Vector(this._pos.x + this._width / 2, this._pos.y + this._height / 2);
  }
}
