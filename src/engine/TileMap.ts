import { BoundingBox } from './Collision/BoundingBox';
import { Color } from './Drawing/Color';
import { Class } from './Class';
import { Engine } from './Engine';
import { Vector } from './Algebra';
import { Actor } from './Actor';
import { Logger } from './Util/Log';
import { SpriteSheet } from './Drawing/SpriteSheet';
import * as Events from './Events';

/**
 * The [[TileMap]] class provides a lightweight way to do large complex scenes with collision
 * without the overhead of actors.
 *
 * [[include:TileMaps.md]]
 */
export class TileMap extends Class {
   private _collidingX: number = -1;
   private _collidingY: number = -1;
   private _onScreenXStart: number = 0;
   private _onScreenXEnd: number = 9999;
   private _onScreenYStart: number = 0;
   private _onScreenYEnd: number = 9999;
   private _spriteSheets: { [key: string]: SpriteSheet } = {};
   public logger: Logger = Logger.getInstance();
   public data: Cell[] = [];

   public on(eventName: Events.preupdate, handler: (event?: Events.PreUpdateEvent) => void): any;
   public on(eventName: Events.postupdate, handler: (event?: Events.PostUpdateEvent) => void): any;
   public on(eventName: Events.predraw, handler: (event?: Events.PreDrawEvent) => void): any;
   public on(eventName: Events.postdraw, handler: (event?: Events.PostDrawEvent) => void): any;
   public on(eventName: string, handler: (event?: Events.GameEvent<any>) => void): any;
   public on(eventName: string, handler: (event?: Events.GameEvent<any>) => void): any {
      super.on(eventName, handler);
   }

   /**
    * @param x             The x coordinate to anchor the TileMap's upper left corner (should not be changed once set)
    * @param y             The y coordinate to anchor the TileMap's upper left corner (should not be changed once set)
    * @param cellWidth     The individual width of each cell (in pixels) (should not be changed once set)
    * @param cellHeight    The individual height of each cell (in pixels) (should not be changed once set)
    * @param rows          The number of rows in the TileMap (should not be changed once set)
    * @param cols          The number of cols in the TileMap (should not be changed once set)
    */
   constructor(
      public x: number,
      public y: number,
      public cellWidth: number,
      public cellHeight: number,
      public rows: number,
      public cols: number) {
      super();
      this.data = new Array<Cell>(rows * cols);
      for (var i = 0; i < cols; i++) {
         for (var j = 0; j < rows; j++) {
            (() => {
               var cd = new Cell(
                  i * cellWidth + x,
                  j * cellHeight + y,
                  cellWidth,
                  cellHeight,
                  i + j * cols);
               this.data[i + j * cols] = cd;
            })();
         }
      }
   }

   public registerSpriteSheet(key: string, spriteSheet: SpriteSheet) {
      this._spriteSheets[key] = spriteSheet;
   }
   /**
    * Returns the intersection vector that can be used to resolve collisions with actors. If there
    * is no collision null is returned.
    */
   public collides(actor: Actor): Vector {
      var width = actor.pos.x + actor.getWidth();
      var height = actor.pos.y + actor.getHeight();
      var actorBounds = actor.getBounds();
      var overlaps: Vector[] = [];
      // trace points for overlap
      for (var x = actorBounds.left; x <= width; x += Math.min(actor.getWidth() / 2, this.cellWidth / 2)) {
         for (var y = actorBounds.top; y <= height; y += Math.min(actor.getHeight() / 2, this.cellHeight / 2)) {
            var cell = this.getCellByPoint(x, y);
            if (cell && cell.solid) {
               var overlap = actorBounds.collides(cell.getBounds());
               var dir = actor.getCenter().sub(cell.getCenter());
               if (overlap && overlap.dot(dir) > 0) {
                  overlaps.push(overlap);
               }
            }
         }
      }
      if (overlaps.length === 0) {
         return null;
      }
      // Return the smallest change other than zero
      var result = overlaps.reduce((accum, next) => {
         var x = accum.x;
         var y = accum.y;
         if (Math.abs(accum.x) < Math.abs(next.x)) {
            x = next.x;
         }
         if (Math.abs(accum.y) < Math.abs(next.y)) {
            y = next.y;
         }
         return new Vector(x, y);
      });
      return result;
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
      x = Math.floor((x - this.x) / this.cellWidth);
      y = Math.floor((y - this.y) / this.cellHeight);
      var cell = this.getCell(x, y);
      if (x >= 0 && y >= 0 && x < this.cols && y < this.rows && cell) {
         return cell;
      }
      return null;
   }

   public update(engine: Engine, delta: number) {
      this.emit('preupdate', new Events.PreUpdateEvent(engine, delta, this));

      var worldCoordsUpperLeft = engine.screenToWorldCoordinates(new Vector(0, 0));
      var worldCoordsLowerRight = engine.screenToWorldCoordinates(new Vector(engine.canvas.clientWidth, engine.canvas.clientHeight));

      this._onScreenXStart = Math.max(Math.floor(worldCoordsUpperLeft.x / this.cellWidth) - 2, 0);
      this._onScreenYStart = Math.max(Math.floor((worldCoordsUpperLeft.y - this.y) / this.cellHeight) - 2, 0);
      this._onScreenXEnd = Math.max(Math.floor(worldCoordsLowerRight.x / this.cellWidth) + 2, 0);
      this._onScreenYEnd = Math.max(Math.floor((worldCoordsLowerRight.y - this.y) / this.cellHeight) + 2, 0);

      this.emit('postupdate', new Events.PostUpdateEvent(engine, delta, this));
   }

   /**
    * Draws the tile map to the screen. Called by the [[Scene]].
    * @param ctx    The current rendering context
    * @param delta  The number of milliseconds since the last draw
    */
   public draw(ctx: CanvasRenderingContext2D, delta: number) {
      this.emit('predraw', new Events.PreDrawEvent(ctx, delta, this));

      ctx.save();
      ctx.translate(this.x, this.y);

      var x = this._onScreenXStart, xEnd = Math.min(this._onScreenXEnd, this.cols);
      var y = this._onScreenYStart, yEnd = Math.min(this._onScreenYEnd, this.rows);

      var cs: TileSprite[], csi: number, cslen: number;

      for (x; x < xEnd; x++) {
         for (y; y < yEnd; y++) {

            // get non-negative tile sprites
            cs = this.getCell(x, y).sprites.filter((s) => {
               return s.spriteId > -1;
            });

            for (csi = 0, cslen = cs.length; csi < cslen; csi++) {
               var ss = this._spriteSheets[cs[csi].spriteSheetKey];

               // draw sprite, warning if sprite doesn't exist
               if (ss) {
                  var sprite = ss.getSprite(cs[csi].spriteId);
                  if (sprite) {
                     sprite.draw(ctx, x * this.cellWidth, y * this.cellHeight);
                  } else {
                     this.logger.warn('Sprite does not exist for id',
                        cs[csi].spriteId,
                        'in sprite sheet',
                        cs[csi].spriteSheetKey, sprite, ss);
                  }
               } else {
                  this.logger.warn('Sprite sheet', cs[csi].spriteSheetKey, 'does not exist', ss);
               }
            }
         }
         y = this._onScreenYStart;
      }
      ctx.restore();

      this.emit('postdraw', new Events.PostDrawEvent(ctx, delta, this));
   }

   /**
    * Draws all the tile map's debug info. Called by the [[Scene]].
    * @param ctx  The current rendering context
    */
   public debugDraw(ctx: CanvasRenderingContext2D) {
      var width = this.cols * this.cellWidth;
      var height = this.rows * this.cellHeight;
      ctx.save();
      ctx.strokeStyle = Color.Red.toString();
      for (var x = 0; x < this.cols + 1; x++) {
         ctx.beginPath();
         ctx.moveTo(this.x + x * this.cellWidth, this.y);
         ctx.lineTo(this.x + x * this.cellWidth, this.y + height);
         ctx.stroke();
      }
      for (var y = 0; y < this.rows + 1; y++) {
         ctx.beginPath();
         ctx.moveTo(this.x, this.y + y * this.cellHeight);
         ctx.lineTo(this.x + width, this.y + y * this.cellHeight);
         ctx.stroke();
      }
      var solid = Color.Red.clone();
      solid.a = .3;
      this.data.filter(function (cell) {
         return cell.solid;
      }).forEach(function (cell) {
         ctx.fillStyle = solid.toString();
         ctx.fillRect(cell.x, cell.y, cell.width, cell.height);
      });
      if (this._collidingY > -1 && this._collidingX > -1) {
         ctx.fillStyle = Color.Cyan.toString();
         ctx.fillRect(this.x + this._collidingX * this.cellWidth,
            this.y + this._collidingY * this.cellHeight,
            this.cellWidth,
            this.cellHeight);
      }
      ctx.restore();
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
   constructor(public spriteSheetKey: string, public spriteId: number) { }
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
export class Cell {
   private _bounds: BoundingBox;

   /**
    * @param x       Gets or sets x coordinate of the cell in world coordinates
    * @param y       Gets or sets y coordinate of the cell in world coordinates
    * @param width   Gets or sets the width of the cell 
    * @param height  Gets or sets the height of the cell 
    * @param index   The index of the cell in row major order
    * @param solid   Gets or sets whether this cell is solid
    * @param sprites The list of tile sprites to use to draw in this cell (in order)
    */
   constructor(
      public x: number,
      public y: number,
      public width: number,
      public height: number,
      public index: number,
      public solid: boolean = false,
      public sprites: TileSprite[] = []) {
      this._bounds = new BoundingBox(this.x, this.y, this.x + this.width, this.y + this.height);
   }

   /**
    * Returns the bounding box for this cell
    */
   public getBounds() {
      return this._bounds;
   }
   /**
    * Gets the center coordinate of this cell
    */
   public getCenter(): Vector {
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
      var index = -1;
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