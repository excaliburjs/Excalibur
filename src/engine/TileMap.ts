/// <reference path="Engine.ts" />
/// <reference path="SpriteSheet.ts" />

module ex {

  /**
   * Tile sprites are used to render a specific sprite from a [[TileMap]]'s spritesheet(s)
   */
  export class TileSprite {
    /**
     * @param spriteSheetKey  The key of the spritesheet to use
     * @param spriteId        The index of the sprite in the [[SpriteSheet]]
     */
    constructor(public spriteSheetKey: string, public spriteId : number) { }
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
       public sprites: TileSprite[] = []){
       this._bounds = new BoundingBox(this.x, this.y, this.x + this.width, this.y + this.height);
    }
  
    /**
     * Returns the bounding box for this cell
     */
    public getBounds(){
       return this._bounds;
    }
    /**
     * Gets the center coordinate of this cell
     */
    public getCenter(): Vector {
        return new Vector(this.x+ this.width / 2, this.y + this.height / 2);
    }
    /**
     * Add another [[TileSprite]] to this cell
     */
    public pushSprite(tileSprite: TileSprite){
       this.sprites.push(tileSprite);
    }
    /**
     * Remove an instance of [[TileSprite]] from this cell
     */
    public removeSprite(tileSprite: TileSprite) {
       var index = -1;
       if((index = this.sprites.indexOf(tileSprite)) > -1)
       {
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

  /**
   * Tile Maps
   *
   * The `TileMap` object provides a lightweight way to do large complex scenes with collision
   * without the overhead of actors.
   *
   * Tile maps are made up of [[Cell]]s which can draw [[TileSprite]]s.
   *
   * Example usage: Load pre-built maps using the [Tiled map editor](http://www.mapeditor.org/).
   */
  export class TileMap {
    private _collidingX: number = -1;
    private _collidingY: number = -1;
    private _onScreenXStart: number = 0;
    private _onScreenXEnd: number = 9999;
    private _onScreenYStart: number = 0;
    private _onScreenYEnd: number = 9999;
    private _spriteSheets: {[key: string]: SpriteSheet} = {};
    public logger: Logger = Logger.getInstance();
    public data: Cell[] = [];

    /**
     * @param x             The x coordinate to anchor the TileMap's upper left corner (should not be changed once set)
     * @param y             The y coordinate to anchor the TileMap's upper left corner (should not be changed once set)
     * @param cellWidth     The individual width of each cell (in pixels) (should not be changed once set)
     * @param cellHeight    The individual height of each cell (in pixels) (should not be changed once set)
     * @param rows          The number of rows in the TileMap (should not be changed once set)
     * @param cols          The number of cols in the TileMap (should not be changed once set)
     * @param spriteSheet   The spriteSheet to use for drawing
     */
    constructor(
       public x: number, 
       public y: number, 
       public cellWidth: number, 
       public cellHeight: number, 
       public rows: number, 
       public cols: number){
       this.data = new Array<Cell>(rows*cols);
       for(var i = 0; i < cols; i++){
          for(var j = 0; j < rows; j++){
             (() => {
                var cd = new Cell(
                   i * cellWidth + x, 
                   j * cellHeight + y,
                   cellWidth,
                   cellHeight,
                   i+j*cols);
                this.data[i+j*cols] = cd;
             })()
          }
       }
    }
    
    public registerSpriteSheet(key: string, spriteSheet: SpriteSheet){
       this._spriteSheets[key] = spriteSheet;
    }
    /**
     * Returns the intersection vector that can be used to resolve collisions with actors. If there
     * is no collision null is returned.
     */
    public collides(actor: Actor): Vector {
       var points: Point[] = [];
       var width = actor.x + actor.getWidth();
       var height = actor.y + actor.getHeight();
       var actorBounds = actor.getBounds();
       var overlaps: Vector[] = [];
       // trace points for overlap
       for (var x = actorBounds.left; x <= width; x += Math.min(actor.getWidth()/2,this.cellWidth/2)){
          for (var y = actorBounds.top; y <= height; y += Math.min(actor.getHeight()/2, this.cellHeight/2)){
             var cell = this.getCellByPoint(x, y);
             if(cell && cell.solid){
                 var overlap = actorBounds.collides(cell.getBounds());
                 var dir = actor.getCenter().minus(cell.getCenter());
                if(overlap && overlap.dot(dir) > 0){
                   overlaps.push(overlap);                  
                }
             }
          }
       }
       if(overlaps.length === 0){
          return null;
       }
       // Return the smallest change other than zero
       var result = overlaps.reduce((accum, next)=>{
          var x = accum.x;
          var y = accum.y;
          if(Math.abs(accum.x) < Math.abs(next.x)){               
             x = next.x;
          }
          if(Math.abs(accum.y) < Math.abs(next.y)){
             y = next.y;
          }
          return new Vector(x, y);
       });
       return result;
    }

    /*
    public collidesActor(actor: Actor): boolean{
       
       var points: Point[] = [];
       var width = actor.x + actor.getWidth();
       var height = actor.y + actor.getHeight();
       for(var x = actor.x; x <= width; x += Math.min(actor.getWidth()/2,this.cellWidth/2)){
          for(var y = actor.y; y <= height; y += Math.min(actor.getHeight()/2, this.cellHeight/2)){
             points.push(new Point(x,y))
          }
       }
       var result = points.some((p) => {
          return this.collidesPoint(p.x, p.y);
       });
       return result;
    }*/
    /*      
    public collidesPoint(x: number, y: number): boolean{
       var x = Math.floor(x/this.cellWidth);// - Math.floor(this.x/this.cellWidth);
       var y = Math.floor(y/this.cellHeight);
       var cell = this.getCell(x, y);
       if(x >= 0 && y >= 0 && x < this.cols && y < this.rows && cell){
          if(cell.solid){
             this._collidingX = x;
             this._collidingY = y;
          }
          return cell.solid;
       }
       
       return false;
    }*/

    /**
     * Returns the [[Cell]] by index (row major order)
     */
    public getCellByIndex(index: number): Cell{
       return this.data[index];
    }
    /**
     * Returns the [[Cell]] by its x and y coordinates
     */
    public getCell(x: number, y: number): Cell{
       if(x < 0 || y < 0 || x >= this.cols || y >= this.rows){
          return null;
       }
       return this.data[x+y*this.cols];
    }
    /**
     * Returns the [[Cell]] by testing a point in global coordinates, 
     * returns `null` if no cell was found.
     */
    public getCellByPoint(x: number, y: number): Cell{
       var x = Math.floor((x-this.x)/this.cellWidth);// - Math.floor(this.x/this.cellWidth);
       var y = Math.floor((y-this.y)/this.cellHeight);
       var cell = this.getCell(x, y);
       if(x >= 0 && y >= 0 && x < this.cols && y < this.rows && cell){
          return cell;
       }
       return null;
    }

    public update(engine: Engine, delta: number){
       var worldCoordsUpperLeft = engine.screenToWorldCoordinates(new Point(0, 0));
       var worldCoordsLowerRight = engine.screenToWorldCoordinates(new Point(engine.width, engine.height));
       
       this._onScreenXStart = Math.max(Math.floor(worldCoordsUpperLeft.x/this.cellWidth)-2,0);
       this._onScreenYStart = Math.max(Math.floor((worldCoordsUpperLeft.y-this.y)/this.cellHeight)-2,0);
       this._onScreenXEnd = Math.max(Math.floor(worldCoordsLowerRight.x/this.cellWidth)+2,0);
       this._onScreenYEnd = Math.max(Math.floor((worldCoordsLowerRight.y-this.y)/this.cellHeight)+2,0);
    }

    /**
     * Draws the tile map to the screen. Called by the [[Scene]].
     * @param ctx    The current rendering context
     * @param delta  The number of milliseconds since the last draw
     */
    public draw(ctx: CanvasRenderingContext2D, delta: number){
       ctx.save();
       ctx.translate(this.x, this.y);
       for(var x = this._onScreenXStart; x < Math.min(this._onScreenXEnd, this.cols); x++){
          for(var y = this._onScreenYStart; y < Math.min(this._onScreenYEnd, this.rows); y++){
             this.getCell(x,y).sprites.filter((s)=>{
                return s.spriteId > -1;
             }).forEach((ts)=>{
                var ss = this._spriteSheets[ts.spriteSheetKey];
                if(ss){
                   var sprite = ss.getSprite(ts.spriteId);
                   if(sprite){
                      sprite.draw(ctx, x * this.cellWidth, y * this.cellHeight);                        
                   }else{
                      this.logger.warn("Sprite does not exist for id", ts.spriteId, "in sprite sheet", ts.spriteSheetKey, sprite, ss);
                   }
                }else{
                   this.logger.warn("Sprite sheet", ts.spriteSheetKey, "does not exist", ss)
                }
             });
          }
       }
       ctx.restore();
    }

    /**
     * Draws all the tile map's debug info. Called by the [[Scene]].
     * @param ctx  The current rendering context
     */
    public debugDraw(ctx: CanvasRenderingContext2D){
       var width = this.cols * this.cellWidth;
       var height = this.rows * this.cellHeight;
       ctx.save();
       ctx.strokeStyle = Color.Red.toString();
       for(var x = 0; x < this.cols+1; x++){
          ctx.beginPath();
          ctx.moveTo(this.x + x*this.cellWidth, this.y)
          ctx.lineTo(this.x + x*this.cellWidth, this.y + height);
          ctx.stroke();
       }  
       for(var y = 0; y < this.rows+1; y++){
          ctx.beginPath();
          ctx.moveTo(this.x, this.y + y*this.cellHeight);
          ctx.lineTo(this.x + width, this.y + y*this.cellHeight);
          ctx.stroke()
       }
       var solid = ex.Color.Red.clone();
       solid.a = .3;
       this.data.filter(function(cell){
          return cell.solid;
       }).forEach(function(cell){
          ctx.fillStyle = solid.toString();
          ctx.fillRect(cell.x, cell.y, cell.width, cell.height);
       });
       if(this._collidingY > -1 && this._collidingX > -1){
          ctx.fillStyle = ex.Color.Cyan.toString();
          ctx.fillRect(this.x + this._collidingX * this.cellWidth, this.y + this._collidingY * this.cellHeight, this.cellWidth, this.cellHeight);
       }
       ctx.restore();
    }
  }
}