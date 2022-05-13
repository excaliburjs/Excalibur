import { BodyComponent, BoundingBox, Collider, ColliderComponent, CollisionType, Color, CompositeCollider, vec, Vector } from '..';
import { TransformComponent } from '../EntityComponentSystem/Components/TransformComponent';
import { Entity } from '../EntityComponentSystem/Entity';
import { DebugGraphicsComponent, ExcaliburGraphicsContext, Graphic, GraphicsComponent } from '../Graphics';
import { IsometricEntityComponent } from './IsometricEntityComponent';

export class IsometricTile extends Entity {
  /**
   * Indicates whether this tile is solid
   */
  public solid: boolean = false;

  private _gfx: GraphicsComponent;
  private _tileBounds = new BoundingBox();
  private _graphics: Graphic[] = [];
  public getGraphics(): readonly Graphic[] {
    return this._graphics;
  }
  /**
   * Tile graphics
   */
  public addGraphic(graphic: Graphic) {
    this._graphics.push(graphic);
    this._gfx.visible = true;
    this._gfx.localBounds = this._recalculateBounds();
  }

  private _recalculateBounds(): BoundingBox {
    let bounds = this._tileBounds.clone();
    for (const graphic of this._graphics) {
      const offset = vec(
        this.map.graphicsOffset.x - this.map.tileWidth / 2,
        this.map.graphicsOffset.y - (this.map.renderFromTopOfGraphic ? 0 : (graphic.height - this.map.tileHeight)));
      bounds = bounds.combine(graphic.localBounds.translate(offset));
    }
    return bounds;
  }

  public removeGraphic(graphic: Graphic) {
    const index = this._graphics.indexOf(graphic);
    if (index > -1) {
      this._graphics.splice(index, 1);
    }
    this._gfx.localBounds = this._recalculateBounds();
  }

  public clearGraphics() {
    this._graphics.length = 0;
    this._gfx.visible = false;
    this._gfx.localBounds = this._recalculateBounds();
  }

  /**
   * Tile colliders
   */
  private _colliders: Collider[] = [];
  public getColliders(): readonly Collider[] {
    return this._colliders;
  }

  /**
   * Adds a collider to the IsometricTile
   *
   * **Note!** the [[Tile.solid]] must be set to true for it to act as a "fixed" collider
   * @param collider
   */
  public addCollider(collider: Collider) {
    this._colliders.push(collider);
    this.map.flagCollidersDirty();
  }

  /**
   * Removes a collider from the IsometricTile
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
   * Clears all colliders from the IsometricTile
   */
  public clearColliders(): void {
    this._colliders.length = 0;
    this.map.flagCollidersDirty();
  }

  /**
   * Integer tile x coordinate
   */
  public readonly x: number;
  /**
   * Integer tile y coordinate
   */
  public readonly y: number;
  /**
   * Reference to the [[IsometricMap]] this tile is part of
   */
  public readonly map: IsometricMap;

  private _transform: TransformComponent;
  private _isometricEntityComponent: IsometricEntityComponent;

  /**
   * Returns the top left corner of the [[IsometricTile]] in world space
   */
  public get pos(): Vector {
    return this.map.tileToWorld(vec(this.x, this.y));
  }

  /**
   * Returns the center of the [[IsometricTile]]
   */
  public get center(): Vector {
    return this.pos.add(vec(0, this.map.tileHeight / 2));
  }

  /**
   * Construct a new IsometricTile
   * @param x tile coordinate in x (not world position)
   * @param y tile coordinate in y (not world position)
   * @param graphicsOffset offset that tile should be shifted by (default (0, 0))
   * @param map reference to owning IsometricMap
   */
  constructor(x: number, y: number, graphicsOffset: Vector | null, map: IsometricMap) {
    super([
      new TransformComponent(),
      new GraphicsComponent({
        offset: graphicsOffset ?? Vector.Zero,
        onPostDraw: (gfx, elapsed) => this.draw(gfx, elapsed)
      }),
      new IsometricEntityComponent(map)
    ]);
    this.x = x;
    this.y = y;
    this.map = map;
    this._transform = this.get(TransformComponent);
    this._isometricEntityComponent = this.get(IsometricEntityComponent);

    const halfTileWidth = this.map.tileWidth / 2;
    const halfTileHeight = this.map.tileHeight / 2;
    // See https://clintbellanger.net/articles/isometric_math/ for formula
    // The x position shifts left with every y step
    const xPos = (this.x - this.y) * halfTileWidth;
    // The y position needs to go down with every x step
    const yPos = (this.x + this.y) * halfTileHeight;
    this._transform.pos = vec(xPos, yPos);
    this._isometricEntityComponent.elevation = 0;

    this._gfx = this.get(GraphicsComponent);
    this._gfx.visible = false; // start not visible
    const totalWidth = this.map.tileWidth;
    const totalHeight = this.map.tileHeight;

    // initial guess at gfx bounds based on the tile
    const offset = vec(0, (this.map.renderFromTopOfGraphic ? totalHeight : 0));
    this._gfx.localBounds = this._tileBounds = new BoundingBox({
      left: -totalWidth / 2,
      top: -totalHeight,
      right: totalWidth / 2,
      bottom: totalHeight
    }).translate(offset);
  }

  draw(gfx: ExcaliburGraphicsContext, _elapsed: number) {
    const halfTileWidth = this.map.tileWidth / 2;
    gfx.save();
    // shift left origin to corner of map, not the left corner of the first sprite
    gfx.translate(-halfTileWidth, 0);
    for (const graphic of this._graphics) {
      graphic.draw(
        gfx,
        this.map.graphicsOffset.x,
        this.map.graphicsOffset.y - (this.map.renderFromTopOfGraphic ? 0 : (graphic.height - this.map.tileHeight)));
    }
    gfx.restore();
  }
}

export interface IsometricMapOptions {
  /**
   * Optionally name the isometric tile map
   */
  name?: string;
  /**
   * Optionally specify the position of the isometric tile map
   */
  pos?: Vector;
  /**
   * Optionally render from the top of the graphic, by default tiles are rendered from the bottom
   */
  renderFromTopOfGraphic?: boolean;
  /**
   * Optionally present a graphics offset, this can be useful depending on your tile graphics
   */
  graphicsOffset?: Vector;
  /**
   * Width of an individual tile in pixels, this should be the width of the parallelogram of the base of the tile art asset.
   */
  tileWidth: number;
  /**
   * Height of an individual tile in pixels, this should be the height of the parallelogram of the base of the tile art asset.
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
}

/**
 * The IsometricMap is a special tile map that provides isometric rendering support to Excalibur
 *
 * The tileWidth and tileHeight should be the height and width in pixels of the parallelogram of the base of the tile art asset.
 * The tileWidth and tileHeight is not necessarily the same as your graphic pixel width and height.
 *
 * Please refer to the docs https://excaliburjs.com for more details calculating what your tile width and height should be given
 * your art assets.
 */
export class IsometricMap extends Entity {
  /**
   * Width of individual tile in pixels
   */
  public readonly tileWidth: number;
  /**
   * Height of individual tile in pixels
   */
  public readonly tileHeight: number;
  /**
   * Number of tiles wide
   */
  public readonly columns: number;
  /**
   * Number of tiles high
   */
  public readonly rows: number;
  /**
   * List containing all of the tiles in IsometricMap
   */
  public readonly tiles: IsometricTile[];

  /**
   * Render the tile graphic from the top instead of the bottom
   *
   * default is `false` meaning rendering from the bottom
   */
  public renderFromTopOfGraphic: boolean = false;
  public graphicsOffset: Vector = vec(0, 0);

  /**
   * Isometric map [[TransformComponent]]
   */
  public transform: TransformComponent;

  /**
   * Isometric map [[ColliderComponent]]
   */
  public collider: ColliderComponent;

  private _composite: CompositeCollider;

  constructor(options: IsometricMapOptions) {
    super([
      new TransformComponent(),
      new BodyComponent({
        type: CollisionType.Fixed
      }),
      new ColliderComponent(),
      new DebugGraphicsComponent((ctx) => this.debug(ctx), false)
    ], options.name);
    const { pos, tileWidth, tileHeight, columns: width, rows: height, renderFromTopOfGraphic, graphicsOffset } = options;

    this.transform = this.get(TransformComponent);
    if (pos) {
      this.transform.pos = pos;
    }

    this.collider = this.get(ColliderComponent);
    if (this.collider) {
      this.collider.set(this._composite = new CompositeCollider([]));
    }


    this.renderFromTopOfGraphic = renderFromTopOfGraphic ?? this.renderFromTopOfGraphic;
    this.graphicsOffset = graphicsOffset ?? this.graphicsOffset;

    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.columns = width;
    this.rows = height;

    this.tiles = new Array(width * height);

    // build up tile representation
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tile = new IsometricTile(x, y, this.graphicsOffset, this);
        this.tiles[x + y * width] = tile;
        this.addChild(tile);
        // TODO row/columns helpers
      }
    }
  }

  public update(): void {
    if (this._collidersDirty) {
      this.updateColliders();
      this._collidersDirty = false;
    }
  }

  private _collidersDirty = false;
  public flagCollidersDirty() {
    this._collidersDirty = true;
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
  public updateColliders() {
    this._composite.clearColliders();
    const pos = this.get(TransformComponent).pos;
    for (const tile of this.tiles) {
      if (tile.solid) {
        for (const collider of tile.getColliders()) {
          const originalOffset = this._getOrSetColliderOriginalOffset(collider);
          collider.offset = this.tileToWorld(vec(tile.x, tile.y))
            .sub(pos)
            .add(originalOffset)
            .sub(vec(this.tileWidth / 2, this.tileHeight)); // We need to unshift height based on drawing
          collider.owner = this;
          this._composite.addCollider(collider);
        }
      }
    }
    this.collider.update();
  }

  /**
   * Convert world space coordinates to the tile x, y coordinate
   * @param worldCoordinate
   */
  public worldToTile(worldCoordinate: Vector): Vector {
    worldCoordinate = worldCoordinate.sub(this.transform.globalPos);

    const halfTileWidth = this.tileWidth / 2;
    const halfTileHeight = this.tileHeight / 2;
    // See https://clintbellanger.net/articles/isometric_math/ for formula
    return vec(
      ~~((worldCoordinate.x / halfTileWidth + (worldCoordinate.y / halfTileHeight)) / 2),
      ~~((worldCoordinate.y / halfTileHeight - (worldCoordinate.x / halfTileWidth)) / 2));
  }

  /**
   * Given a tile coordinate, return the top left corner in world space
   * @param tileCoordinate
   */
  public tileToWorld(tileCoordinate: Vector): Vector {
    const halfTileWidth = this.tileWidth / 2;
    const halfTileHeight = this.tileHeight / 2;
    // The x position shifts left with every y step
    const xPos = (tileCoordinate.x - tileCoordinate.y) * halfTileWidth;
    // The y position needs to go down with every x step
    const yPos = (tileCoordinate.x + tileCoordinate.y) * halfTileHeight;
    return vec(xPos, yPos).add(this.transform.pos);
  }

  /**
   * Returns the [[IsometricTile]] by its x and y coordinates
   */
  public getTile(x: number, y: number): IsometricTile | null {
    if (x < 0 || y < 0 || x >= this.columns || y >= this.rows) {
      return null;
    }
    return this.tiles[x + y * this.columns];
  }

  /**
   * Returns the [[IsometricTile]] by testing a point in world coordinates,
   * returns `null` if no Tile was found.
   */
  public getTileByPoint(point: Vector): IsometricTile | null {
    const tileCoord = this.worldToTile(point);
    const tile = this.getTile(tileCoord.x, tileCoord.y);
    return tile;
  }

  private _getMaxZIndex(): number {
    let maxZ = Number.NEGATIVE_INFINITY;
    for (const tile of this.tiles) {
      const currentZ = tile.get(TransformComponent).z;
      if (currentZ > maxZ) {
        maxZ =  currentZ;
      }
    }
    return maxZ;
  }

  /**
   * Debug draw for IsometricMap, called internally by excalibur when debug mode is toggled on
   * @param gfx
   */
  public debug(gfx: ExcaliburGraphicsContext) {
    gfx.save();
    gfx.z = this._getMaxZIndex() + 0.5;
    for (let y = 0; y < this.rows + 1; y++) {
      const left = this.tileToWorld(vec(0, y));
      const right = this.tileToWorld(vec(this.columns, y));
      gfx.drawLine(left, right, Color.Red, 2);
    }

    for (let x = 0; x < this.columns + 1; x++) {
      const top = this.tileToWorld(vec(x, 0));
      const bottom = this.tileToWorld(vec(x, this.rows));
      gfx.drawLine(top, bottom, Color.Red, 2);
    }

    for (const tile of this.tiles) {
      gfx.drawCircle(this.tileToWorld(vec(tile.x, tile.y)), 3, Color.Yellow);
    }
    gfx.restore();
  }
}