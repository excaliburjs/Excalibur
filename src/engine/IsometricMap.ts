import { Color, vec, Vector } from ".";
import { TransformComponent } from "./EntityComponentSystem/Components/TransformComponent";
import { Entity } from "./EntityComponentSystem/Entity";
import { DebugGraphicsComponent, ExcaliburGraphicsContext, Graphic, GraphicsComponent } from "./Graphics";

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

export class Tile {
  /**
   * Indicates whether this tile is solid
   */
  public solid: boolean;
  /**
   * Tile graphics
   */
  public graphics: Graphic[] = [];
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

  /**
   * Returns the top left corner of the Tile in world space
   */
  public get pos(): Vector {
    const mapPos = this._transform.globalPos;
    return mapPos.add(this.map.tileToWorld(vec(this.x, this.y)));
  }

  constructor(x: number, y: number, map: IsometricMap) {
    this.x = x;
    this.y = y;
    this.map = map;
    this._transform = this.map.get(TransformComponent);
  }
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
  public transform: TransformComponent;

  constructor(options: IsometricMapOptions) {
    super([
      new TransformComponent(),
      new GraphicsComponent({
        onPostDraw: (ctx, elapsed) => this.draw(ctx, elapsed)
      }),
      new DebugGraphicsComponent((ctx) => this.debug(ctx))
    ], options.name);
    const { pos, tileWidth, tileHeight, width, height, renderFromTopOfGraphic, graphicsOffset } = options;

    this.transform = this.get(TransformComponent);
    if (pos) {
      this.transform.pos = pos;
    }

    this.renderFromTopOfGraphic = renderFromTopOfGraphic ?? this.renderFromTopOfGraphic;
    this.graphicsOffset = graphicsOffset ?? this.graphicsOffset;

    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.width = width;
    this.height = height;

    this.tiles = new Array(width * height);

    // build up tile representation
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        this.tiles[x + y * width] = new Tile(x, y, this);
        // todo row/columns helpers
      }
    }
  }

  /**
   * Custom draw routine for tilemaps provided by the [[GraphicsComponent]]
   * @param ctx 
   * @param _elapsed 
   */
  public draw(ctx: ExcaliburGraphicsContext, _elapsed: number) {
    ctx.save();
    const halfTileWidth = this.tileWidth / 2;
    const halfTileHeight = this.tileHeight / 2;
    // shift left origin to corner of map, not the left corner of the first sprite
    ctx.translate(-halfTileWidth, 0);
    
    for (const tile of this.tiles) {
      for (const graphic of tile.graphics) {
        // TODO tick any graphics needing ticking

        // See https://clintbellanger.net/articles/isometric_math/ for formula
        // The x position shifts left with every y step
        let xPos = (tile.x - tile.y) * halfTileWidth;
        // The y position needs to go down with every x step
        let yPos = (tile.x + tile.y) * halfTileHeight;

        // apply any graphics offset
        xPos += this.graphicsOffset.x;
        yPos += this.graphicsOffset.y;

        graphic.draw(ctx, xPos, yPos - (this.renderFromTopOfGraphic ? 0 : (graphic.height - this.tileHeight)));
      }
    }
    ctx.restore();
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
      const right = this.tileToWorld(vec(this.width, y))
      gfx.drawLine(left, right, Color.Red, 2);
    }

    for (let x = 0; x < this.width + 1; x++) {
      const top = this.tileToWorld(vec(x, 0));
      const bottom = this.tileToWorld(vec(x, this.height));
      gfx.drawLine(top, bottom, Color.Red, 2);
    }

    for (let tile of this.tiles) {
      gfx.drawCircle(this.tileToWorld(vec(tile.x, tile.y)), 3, Color.Yellow);
    }
  }
}