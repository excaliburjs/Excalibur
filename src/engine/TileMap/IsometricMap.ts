import { BodyComponent, BoundingBox, Collider, ColliderComponent, CollisionType, Color, CompositeCollider, vec, Vector } from '..';
import { TransformComponent } from '../EntityComponentSystem/Components/TransformComponent';
import { Entity } from '../EntityComponentSystem/Entity';
import { DebugGraphicsComponent, ExcaliburGraphicsContext, Graphic, GraphicsComponent } from '../Graphics';
import { IsometricEntityComponent } from './IsometricEntityComponent';

export class Tile extends Entity {
  /**
   * Indicates whether this tile is solid
   */
  public solid: boolean = false;

  private _graphicsBounds = new BoundingBox();
  private _graphics: Graphic[] = [];
  private _gfx: GraphicsComponent;
  /**
   * Tile graphics
   */
  public addGraphic(graphic: Graphic) {
    this._graphics.push(graphic);
    this._gfx.visible = true;
    const offset = vec(
      this.map.graphicsOffset.x - this.map.tileWidth / 2,
      this.map.graphicsOffset.y - (this.map.renderFromTopOfGraphic ? 0 : (graphic.height - this.map.tileHeight)));
    this._graphicsBounds = this._graphicsBounds.combine(graphic.localBounds.translate(offset));
    this._gfx.localBounds = this._graphicsBounds;
  }

  private _recalculateBounds(): BoundingBox {
    let bounds = new BoundingBox();
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
    this._graphicsBounds = this._recalculateBounds();
    this._gfx.localBounds = this._graphicsBounds;
  }

  public clearGraphics() {
    this._graphics.length = 0;
    this._gfx.visible = false;
    this._gfx.localBounds = new BoundingBox();
  }

  /**
   * Tile colliders
   */
  public colliders: Collider[] = [];
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
   * Returns the top left corner of the Tile in world space
   */
  public get pos(): Vector {
    const mapPos = this._transform.globalPos;
    return mapPos.add(this.map.tileToWorld(vec(this.x, this.y)));
  }

  constructor(x: number, y: number, map: IsometricMap) {
    super([
      new TransformComponent(),
      new GraphicsComponent({
        onPostDraw: (gfx, elapsed) => this.draw(gfx, elapsed)
      }),
      new IsometricEntityComponent()
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
    this._isometricEntityComponent.map = map;

    this._gfx = this.get(GraphicsComponent);
    this._gfx.visible = false; // start not visible
    const totalWidth = this.map.tileWidth;
    const totalHeight = this.map.tileHeight;

    // initial guess at gfx bounds
    this._gfx.localBounds = new BoundingBox({
      left: -totalWidth / 2,
      top: -totalHeight,
      right: totalWidth / 2,
      bottom: totalHeight
    });
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
   * Optionally specify additional padding to the graphics bounds to prevent offscreen culling,
   * may be needed if your art assets reach outside the grid.
   */
  graphicsBoundsPadding?: Vector;
  /**
   * Width of an individual tile in pixels
   */
  tileWidth: number;
  /**
   * Height of an individual tile in pixels
   */
  tileHeight: number;
  /**
   * Number of tiles wide
   */
  width: number;
  /**
   * Number of tiles high
   */
  height: number;
}

/**
 * The IsometricMap is a special tile map that provides isometric rendering support to Excalibur
 *
 * Please refer to the docs for calculating what your tile width and height should be given your art assets.
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
  public readonly width: number;
  /**
   * Number of tiles high
   */
  public readonly height: number;
  /**
   * List containing all of the tiles in IsometricMap
   */
  public readonly tiles: Tile[];

  public renderFromTopOfGraphic: boolean = false;
  public graphicsOffset: Vector = vec(0, 0);
  public graphicsBoundsPadding: Vector = vec(0, 0);
  public transform: TransformComponent;
  public collider: ColliderComponent;

  private _composite: CompositeCollider;

  constructor(options: IsometricMapOptions) {
    super([
      new TransformComponent(),
      new BodyComponent({
        type: CollisionType.Fixed
      }),
      new ColliderComponent(),
      new DebugGraphicsComponent((ctx) => this.debug(ctx))
    ], options.name);
    const { pos, tileWidth, tileHeight, width, height, renderFromTopOfGraphic, graphicsOffset, graphicsBoundsPadding } = options;

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
    this.graphicsBoundsPadding = graphicsBoundsPadding ?? this.graphicsBoundsPadding;

    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.width = width;
    this.height = height;

    this.tiles = new Array(width * height);

    // build up tile representation
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tile = new Tile(x, y, this);
        this.tiles[x + y * width] = tile;
        this.addChild(tile);
        // TODO row/columns helpers
      }
    }
  }

  // TODO Update automagically
  public updateColliders() {
    for (const tile of this.tiles) {
      for (const collider of tile.colliders) {
        collider.offset = this.tileToWorld(vec(tile.x, tile.y))
          .add(collider.offset)
          .sub(vec(this.tileWidth / 2, this.tileHeight)); // TODO we need to unshift based on drawing
        collider.owner = this;
        this._composite.addCollider(collider);
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
      (worldCoordinate.x / halfTileWidth + (worldCoordinate.y / halfTileHeight)) / 2,
      (worldCoordinate.y / halfTileHeight - (worldCoordinate.x / halfTileWidth)) / 2);
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
    return vec(xPos, yPos);
  }

  /**
   * Debug draw for IsometricMap, called internally by excalibur when debug mode is toggled on
   * @param gfx
   */
  public debug(gfx: ExcaliburGraphicsContext) {

    for (let y = 0; y < this.height + 1; y++) {
      const left = this.tileToWorld(vec(0, y));
      const right = this.tileToWorld(vec(this.width, y));
      gfx.drawLine(left, right, Color.Red, 2);
    }

    for (let x = 0; x < this.width + 1; x++) {
      const top = this.tileToWorld(vec(x, 0));
      const bottom = this.tileToWorld(vec(x, this.height));
      gfx.drawLine(top, bottom, Color.Red, 2);
    }

    for (const tile of this.tiles) {
      gfx.drawCircle(this.tileToWorld(vec(tile.x, tile.y)), 3, Color.Yellow);
    }
  }
}