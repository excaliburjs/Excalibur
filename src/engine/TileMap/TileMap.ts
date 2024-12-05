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
import { MotionComponent } from '../EntityComponentSystem/Components/MotionComponent';
import { ColliderComponent } from '../Collision/ColliderComponent';
import { CompositeCollider } from '../Collision/Colliders/CompositeCollider';
import { DebugGraphicsComponent } from '../Graphics/DebugGraphicsComponent';
import { Collider } from '../Collision/Colliders/Collider';
import { PostDrawEvent, PostUpdateEvent, PreDrawEvent, PreUpdateEvent } from '../Events';
import { EventEmitter, EventKey, Handler, Subscription } from '../EventEmitter';
import { CoordPlane } from '../Math/coord-plane';
import { DebugConfig } from '../Debug';
import { clamp } from '../Math/util';
import { PointerComponent } from '../Input/PointerComponent';
import { PointerEvent } from '../Input/PointerEvent';
import { PointerEventReceiver } from '../Input/PointerEventReceiver';
import { HasNestedPointerEvents, PointerEventsToObjectDispatcher } from '../Input/PointerEventsToObjectDispatcher';
import { GlobalCoordinates } from '../Math';

export interface TileMapOptions {
  /**
   * Optionally name the tile map
   */
  name?: string;
  /**
   * Optionally specify the position of the tile map
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

  /**
   * Optionally configure the meshing lookbehind for Tilemap, Tilemaps combine solid tiles into optimal
   * geometry and the lookbehind configures how far back the Tilemap to look for geometry when combining. Meshing
   * is an expensive operation, so when the Tilemap geometry is invalidated it must be recalculated.
   *
   * Default is 10 slots, but if your Tilemap does not change positions or solid tiles often you can increase this to
   * Infinity.
   */
  meshingLookBehind?: number;
}

export type TilePointerEvents = {
  pointerup: PointerEvent;
  pointerdown: PointerEvent;
  pointermove: PointerEvent;
  pointercancel: PointerEvent;
  pointerenter: PointerEvent;
  pointerleave: PointerEvent;
};

export type TileMapEvents = EntityEvents &
  TilePointerEvents & {
    preupdate: PreUpdateEvent<TileMap>;
    postupdate: PostUpdateEvent<TileMap>;
    predraw: PreDrawEvent;
    postdraw: PostDrawEvent;
  };

export const TileMapEvents = {
  PreUpdate: 'preupdate',
  PostUpdate: 'postupdate',
  PreDraw: 'predraw',
  PostDraw: 'postdraw',
  PointerUp: 'pointerup',
  PointerDown: 'pointerdown',
  PointerMove: 'pointermove',
  PointerCancel: 'pointercancel'
};

/**
 * The TileMap provides a mechanism for doing flat 2D tiles rendered in a grid.
 *
 * TileMaps are useful for top down or side scrolling grid oriented games.
 */
export class TileMap extends Entity implements HasNestedPointerEvents {
  public events = new EventEmitter<TileMapEvents>();
  private _token = 0;
  private _engine!: Engine;

  public logger: Logger = Logger.getInstance();
  public readonly tiles: Tile[] = [];
  private _rows: Tile[][] = [];
  private _cols: Tile[][] = [];

  public readonly tileWidth: number;
  public readonly tileHeight: number;
  public readonly rows: number;
  public readonly columns: number;

  public renderFromTopOfGraphic = false;
  public meshingLookBehind = 10;

  private _collidersDirty = true;
  private _pointerEventDispatcher: PointerEventsToObjectDispatcher<Tile>;
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

  public pointer: PointerComponent;
  public transform: TransformComponent;
  private _motion: MotionComponent;
  private _graphics: GraphicsComponent;
  public collider: ColliderComponent;
  private _composite: CompositeCollider;

  public get x(): number {
    return this.transform.pos.x ?? 0;
  }

  public set x(val: number) {
    if (this.transform?.pos) {
      this.get(TransformComponent).pos = vec(val, this.y);
    }
  }

  public get y(): number {
    return this.transform?.pos.y ?? 0;
  }

  public set y(val: number) {
    if (this.transform?.pos) {
      this.transform.pos = vec(this.x, val);
    }
  }

  public get z(): number {
    return this.transform.z ?? 0;
  }

  public set z(val: number) {
    if (this.transform) {
      this.transform.z = val;
    }
  }

  private _oldRotation: number = 0;
  public get rotation(): number {
    return this.transform?.rotation ?? 0;
  }

  public set rotation(val: number) {
    if (this.transform) {
      this.transform.rotation = val;
    }
  }

  private _oldScale: Vector;
  public get scale(): Vector {
    return this.transform?.scale ?? Vector.One;
  }

  public set scale(val: Vector) {
    if (this.transform?.scale) {
      this.transform.scale = val;
    }
  }

  private _oldPos: Vector;
  public get pos(): Vector {
    return this.transform.pos;
  }

  public set pos(val: Vector) {
    this.transform.pos = val;
  }

  public get vel(): Vector {
    return this._motion.vel;
  }

  public set vel(val: Vector) {
    this._motion.vel = val;
  }

  /**
   * Width of the whole tile map in pixels
   */
  public get width(): number {
    return this.tileWidth * this.columns * this.scale.x;
  }

  /**
   * Height of the whole tilemap in pixels
   */
  public get height(): number {
    return this.tileHeight * this.rows * this.scale.y;
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
    this.events.off(eventName, handler as any);
  }

  /**
   * @param options
   */
  constructor(options: TileMapOptions) {
    super([], options.name);
    this.meshingLookBehind = options.meshingLookBehind ?? this.meshingLookBehind;
    this.addComponent(new TransformComponent());
    this.addComponent(new MotionComponent());
    this.addComponent(
      new BodyComponent({
        type: CollisionType.Fixed
      })
    );
    this.addComponent(
      new GraphicsComponent({
        onPostDraw: (ctx, elapsed) => this.draw(ctx, elapsed)
      })
    );
    this.addComponent(new DebugGraphicsComponent((ctx, debugFlags) => this.debug(ctx, debugFlags), false));
    this.addComponent(new ColliderComponent());
    this.addComponent(new PointerComponent());
    this.pointer = this.get(PointerComponent);
    this._graphics = this.get(GraphicsComponent);
    this.transform = this.get(TransformComponent);
    this._motion = this.get(MotionComponent);
    this.collider = this.get(ColliderComponent);
    this._composite = this.collider.useCompositeCollider([]);

    this.transform.pos = options.pos ?? Vector.Zero;
    this._oldPos = this.transform.pos.clone();
    this._oldScale = this.transform.scale.clone();
    this.renderFromTopOfGraphic = options.renderFromTopOfGraphic ?? this.renderFromTopOfGraphic;
    this.tileWidth = options.tileWidth;
    this.tileHeight = options.tileHeight;
    this.rows = options.rows;
    this.columns = options.columns;

    this._pointerEventDispatcher = new PointerEventsToObjectDispatcher();

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
        this.tiles[i + j * this.columns] = tile;
        this._pointerEventDispatcher.addObject(
          tile,
          (vec: GlobalCoordinates) => {
            // TODO handle geometry/graphics
            return tile.bounds.contains(vec.worldPos);
          },
          () => true
        );
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
      return this._originalOffsets.get(collider) ?? Vector.Zero;
    }
  }

  /**
   * Tiles colliders based on the solid tiles in the tilemap.
   */
  private _updateColliders(): void {
    this.collider.$colliderRemoved.notifyAll(this._composite);
    this._composite.clearColliders();
    const colliders: BoundingBox[] = [];
    this._composite = this.collider.useCompositeCollider([]);
    let current: BoundingBox | null = null;

    /**
     * Returns wether or not the 2 boxes share an edge and are the same height
     * @param prev
     * @param next
     * @returns true if they share and edge, false if not
     */
    const shareEdges = (prev: BoundingBox, next: BoundingBox) => {
      if (prev && next) {
        // same top/bottom
        return (
          prev.top === next.top &&
          prev.bottom === next.bottom &&
          // Shared right/left edge
          prev.right === next.left
        );
      }
      return false;
    };

    /**
     * Potentially merges the current collider into a list of previous ones, mutating the list
     * If checkAndCombine returns true, the collider was successfully merged and should be thrown away
     * @param current current collider to test
     * @param colliders List of colliders to consider merging with
     * @param maxLookBack The amount of colliders to look back for combination
     * @returns false when no combination found, true when successfully combined
     */
    const checkAndCombine = (current: BoundingBox, colliders: BoundingBox[], maxLookBack = this.meshingLookBehind) => {
      if (!current) {
        return false;
      }
      // walk backwards through the list of colliders and combine with the first that shares an edge
      for (let i = colliders.length - 1; i >= 0; i--) {
        if (maxLookBack-- < 0) {
          // blunt the O(n^2) algorithm a bit
          return false;
        }
        const prev = colliders[i];
        if (shareEdges(prev, current)) {
          colliders[i] = prev.combine(current);
          return true;
        }
      }
      return false;
    };

    // ? configurable bias perhaps, horizontal strips vs. vertical ones
    // Bad tile collider packing algorithm
    for (let i = 0; i < this.columns; i++) {
      // Scan column for colliders
      for (let j = 0; j < this.rows; j++) {
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
            if (current && !checkAndCombine(current, colliders)) {
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
          // End of run check and combine
          if (current && !checkAndCombine(current, colliders)) {
            colliders.push(current);
          }
          current = null;
        }
      }
      // After a column is complete check to see if it can be merged into the last one
      // Eno of run check and combine
      if (current && !checkAndCombine(current, colliders)) {
        // else new collider if no combination
        colliders.push(current);
      }
      current = null;
    }

    for (const c of colliders) {
      const collider = Shape.Box(c.width, c.height, Vector.Zero, vec(c.left - this.pos.x, c.top - this.pos.y));
      collider.owner = this;
      this._composite.addCollider(collider);
    }
    this.collider.update();
    // Notify that colliders have been updated
    this.collider.$colliderAdded.notifyAll(this._composite);
  }

  /**
   * Returns the {@apilink Tile} by index (row major order)
   *
   * Returns null if out of bounds
   */
  public getTileByIndex(index: number): Tile | null {
    return this.tiles[index] ?? null;
  }
  /**
   * Returns the {@apilink Tile} by its x and y integer coordinates
   *
   * Returns null if out of bounds
   *
   * For example, if I want the tile in fifth column (x), and second row (y):
   * `getTile(4, 1)` 0 based, so 0 is the first in row/column
   */
  public getTile(x: number, y: number): Tile | null {
    if (x < 0 || y < 0 || x >= this.columns || y >= this.rows) {
      return null;
    }
    return this.tiles[x + y * this.columns];
  }
  /**
   * Returns the {@apilink Tile} by testing a point in world coordinates,
   * returns `null` if no Tile was found.
   */
  public getTileByPoint(point: Vector): Tile | null {
    const { x, y } = this._getTileCoordinates(point);
    const tile = this.getTile(x, y);
    if (x >= 0 && y >= 0 && x < this.columns && y < this.rows && tile) {
      return tile;
    }
    return null;
  }

  private _getTileCoordinates(point: Vector): { x: number; y: number } {
    // Convert to Tile Space point
    point = this.transform.applyInverse(point);

    const x = Math.floor(point.x / this.tileWidth);
    const y = Math.floor(point.y / this.tileHeight);
    return { x, y };
  }

  public getRows(): readonly Tile[][] {
    return this._rows;
  }

  public getColumns(): readonly Tile[][] {
    return this._cols;
  }

  /**
   * Returns the on screen tiles for a tilemap, this will overshoot by a small amount because of the internal quad tree data structure.
   *
   * Useful if you need to perform specific logic on onscreen tiles
   */
  public getOnScreenTiles(): readonly Tile[] {
    let worldBounds = this._engine.screen.getWorldBounds();
    const maybeParallax = this.get(ParallaxComponent);
    if (maybeParallax && this.isInitialized) {
      let pos = this.pos;
      const oneMinusFactor = Vector.One.sub(maybeParallax.parallaxFactor);
      const parallaxOffset = this._engine.currentScene.camera.pos.scale(oneMinusFactor);
      pos = pos.sub(parallaxOffset);
      // adjust world bounds by parallax factor
      worldBounds = worldBounds.translate(pos);
    }

    const bounds = this.transform.coordPlane === CoordPlane.Screen ? this._engine.screen.getScreenBounds() : worldBounds;
    const topLeft = this._getTileCoordinates(bounds.topLeft);
    const topRight = this._getTileCoordinates(bounds.topRight);
    const bottomRight = this._getTileCoordinates(bounds.bottomRight);
    const bottomLeft = this._getTileCoordinates(bounds.bottomLeft);

    const tileStartX = Math.min(clamp(topLeft.x, 0, this.columns - 1), clamp(topRight.x, 0, this.columns - 1));
    const tileStartY = Math.min(clamp(topLeft.y, 0, this.rows - 1), clamp(topRight.y, 0, this.rows - 1));
    const tileEndX = Math.max(clamp(bottomRight.x, 0, this.columns - 1), clamp(bottomLeft.x, 0, this.columns - 1));
    const tileEndY = Math.max(clamp(bottomRight.y, 0, this.rows - 1), clamp(bottomLeft.y, 0, this.rows - 1));

    const tiles: Tile[] = [];
    for (let x = tileStartX; x <= tileEndX; x++) {
      for (let y = tileStartY; y <= tileEndY; y++) {
        tiles.push(this.getTile(x, y)!);
      }
    }
    return tiles;
  }

  /**
   * @internal
   */
  public _processPointerToObject(receiver: PointerEventReceiver) {
    this._pointerEventDispatcher.processPointerToObject(receiver, this.tiles);
  }

  /**
   * @internal
   */
  public _dispatchPointerEvents(receiver: PointerEventReceiver) {
    this._pointerEventDispatcher.dispatchEvents(receiver, this.tiles);
  }

  public update(engine: Engine, elapsed: number) {
    this._initialize(engine);
    this.onPreUpdate(engine, elapsed);
    this.emit('preupdate', new PreUpdateEvent(engine, elapsed, this));

    // Update colliders
    if (!this._oldPos.equals(this.pos) || this._oldRotation !== this.rotation || !this._oldScale.equals(this.scale)) {
      this.flagCollidersDirty();
      this.flagTilesDirty();
    }
    if (this._collidersDirty) {
      this._collidersDirty = false;
      this._updateColliders();
    }

    // Clear last frame's events
    this._pointerEventDispatcher.clear();

    this._token++;

    this.pos.clone(this._oldPos);
    this._oldRotation = this.rotation;
    this.scale.clone(this._oldScale);
    this.transform.pos = this.pos;
    this.onPostUpdate(engine, elapsed);
    this.emit('postupdate', new PostUpdateEvent(engine, elapsed, this));
  }

  /**
   * Draws the tile map to the screen. Called by the {@apilink Scene}.
   * @param ctx ExcaliburGraphicsContext
   * @param elapsed  The number of milliseconds since the last draw
   */
  public draw(ctx: ExcaliburGraphicsContext, elapsed: number): void {
    if (!this.isInitialized) {
      return;
    }
    this.emit('predraw', new PreDrawEvent(ctx as any, elapsed, this)); // TODO fix event

    let graphics: readonly Graphic[], graphicsIndex: number, graphicsLen: number;

    const tiles = this.getOnScreenTiles();
    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i];
      // get non-negative tile sprites
      const offsets = tile.getGraphicsOffsets();
      graphics = tile.getGraphics();

      for (graphicsIndex = 0, graphicsLen = graphics.length; graphicsIndex < graphicsLen; graphicsIndex++) {
        // draw sprite, warning if sprite doesn't exist
        const graphic = graphics[graphicsIndex];
        const offset = offsets[graphicsIndex];
        if (graphic) {
          if (hasGraphicsTick(graphic)) {
            graphic?.tick(elapsed, this._token);
          }
          const offsetY = this.renderFromTopOfGraphic ? 0 : graphic.height - this.tileHeight;
          graphic.draw(ctx, tile.x * this.tileWidth + offset.x, tile.y * this.tileHeight - offsetY + offset.y);
        }
      }
    }
    this.emit('postdraw', new PostDrawEvent(ctx as any, elapsed, this));
  }

  public debug(gfx: ExcaliburGraphicsContext, debugFlags: DebugConfig) {
    const {
      showAll,
      showGrid,
      gridColor,
      gridWidth,
      showSolidBounds: showColliderBounds,
      solidBoundsColor: colliderBoundsColor,
      showColliderGeometry
    } = debugFlags.tilemap;
    const { geometryColor, geometryLineWidth, geometryPointSize } = debugFlags.collider;
    const width = this.tileWidth * this.columns * this.scale.x;
    const height = this.tileHeight * this.rows * this.scale.y;
    const pos = this.pos;
    if (showGrid || showAll) {
      for (let r = 0; r < this.rows + 1; r++) {
        const yOffset = vec(0, r * this.tileHeight * this.scale.y);
        gfx.drawLine(pos.add(yOffset), pos.add(vec(width, yOffset.y)), gridColor, gridWidth);
      }

      for (let c = 0; c < this.columns + 1; c++) {
        const xOffset = vec(c * this.tileWidth * this.scale.x, 0);
        gfx.drawLine(pos.add(xOffset), pos.add(vec(xOffset.x, height)), gridColor, gridWidth);
      }
    }

    if (showAll || showColliderBounds || showColliderGeometry) {
      const colliders = this._composite.getColliders();
      gfx.save();
      gfx.translate(this.pos.x, this.pos.y);
      gfx.scale(this.scale.x, this.scale.y);
      for (const collider of colliders) {
        const bounds = collider.localBounds;
        const pos = collider.worldPos.sub(this.pos);
        if (showColliderBounds) {
          gfx.drawRectangle(pos, bounds.width, bounds.height, colliderBoundsColor);
        }
      }
      gfx.restore();
      if (showColliderGeometry) {
        for (const collider of colliders) {
          collider.debug(gfx, geometryColor, { lineWidth: geometryLineWidth, pointSize: geometryPointSize });
        }
      }
    }

    if (showAll || showColliderBounds) {
      gfx.save();
      gfx.z = 999;
      if (showColliderBounds) {
        for (let i = 0; i < this.tiles.length; i++) {
          this.tiles[i].bounds.draw(gfx);
        }
      }
      gfx.restore();
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
 * created by a {@apilink TileMap}.
 *
 * Tiles can draw multiple sprites. Note that the order of drawing is the order
 * of the sprites in the array so the last one will be drawn on top. You can
 * use transparency to create layers this way.
 */
export class Tile {
  private _bounds!: BoundingBox;
  private _geometry!: BoundingBox;
  private _pos!: Vector;
  private _posDirty = false;

  public events = new EventEmitter<TilePointerEvents>();

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
  private _offsets: Vector[] = [];

  /**
   * Current list of graphics for this tile
   */
  public getGraphics(): readonly Graphic[] {
    return this._graphics;
  }

  /**
   * Current list of offsets for this tile's graphics
   */
  public getGraphicsOffsets(): readonly Vector[] {
    return this._offsets;
  }

  /**
   * Add another {@apilink Graphic} to this TileMap tile
   * @param graphic
   */
  public addGraphic(graphic: Graphic, options?: { offset?: Vector }) {
    this._graphics.push(graphic);
    if (options?.offset) {
      this._offsets.push(options.offset);
    } else {
      this._offsets.push(Vector.Zero);
    }
  }

  /**
   * Remove an instance of a {@apilink Graphic} from this tile
   */
  public removeGraphic(graphic: Graphic) {
    const index = this._graphics.indexOf(graphic);
    if (index > -1) {
      this._graphics.splice(index, 1);
      this._offsets.splice(index, 1);
    }
  }

  /**
   * Clear all graphics from this tile
   */
  public clearGraphics() {
    this._graphics.length = 0;
    this._offsets.length = 0;
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
   * Adds a custom collider to the {@apilink Tile} to use instead of it's bounds
   *
   * If no collider is set but {@apilink Tile.solid} is set, the tile bounds are used as a collider.
   *
   * **Note!** the {@apilink Tile.solid} must be set to true for it to act as a "fixed" collider
   * @param collider
   */
  public addCollider(collider: Collider) {
    this._colliders.push(collider);
    this.map.flagCollidersDirty();
  }

  /**
   * Removes a collider from the {@apilink Tile}
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
   * Clears all colliders from the {@apilink Tile}
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
    return (this._posDirty = true);
  }

  private _recalculate() {
    const geometryPos = this.map.pos.add(vec(this.x * this.map.tileWidth, this.y * this.map.tileHeight));
    this._geometry = new BoundingBox(geometryPos.x, geometryPos.y, geometryPos.x + this.map.tileWidth, geometryPos.y + this.map.tileHeight);

    this._width = this.map.tileWidth * this.map.scale.x;
    this._height = this.map.tileHeight * this.map.scale.y;

    this._pos = this.map.pos.add(vec(this.x * this._width, this.y * this._height));
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

  public emit<TEventName extends EventKey<TilePointerEvents>>(eventName: TEventName, event: TilePointerEvents[TEventName]): void;
  public emit(eventName: string, event?: any): void;
  public emit<TEventName extends EventKey<TilePointerEvents> | string>(eventName: TEventName, event?: any): void {
    this.events.emit(eventName, event);
  }

  public on<TEventName extends EventKey<TilePointerEvents>>(
    eventName: TEventName,
    handler: Handler<TilePointerEvents[TEventName]>
  ): Subscription;
  public on(eventName: string, handler: Handler<unknown>): Subscription;
  public on<TEventName extends EventKey<TilePointerEvents> | string>(eventName: TEventName, handler: Handler<any>): Subscription {
    return this.events.on(eventName, handler);
  }

  public once<TEventName extends EventKey<TilePointerEvents>>(
    eventName: TEventName,
    handler: Handler<TilePointerEvents[TEventName]>
  ): Subscription;
  public once(eventName: string, handler: Handler<unknown>): Subscription;
  public once<TEventName extends EventKey<TilePointerEvents> | string>(eventName: TEventName, handler: Handler<any>): Subscription {
    return this.events.once(eventName, handler);
  }

  public off<TEventName extends EventKey<TilePointerEvents>>(eventName: TEventName, handler: Handler<TilePointerEvents[TEventName]>): void;
  public off(eventName: string, handler: Handler<unknown>): void;
  public off(eventName: string): void;
  public off<TEventName extends EventKey<TilePointerEvents> | string>(eventName: TEventName, handler?: Handler<any>): void {
    if (handler) {
      this.events.off(eventName, handler);
    } else {
      this.events.off(eventName);
    }
  }
}
