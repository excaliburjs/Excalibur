/// <reference path="Core.ts" />


module ex {


   export class CollisionData {
      constructor(public solid: boolean, public spriteId: number){}
   }

   export class CollisionMap {
      private _collidingX: number = -1;
      private _collidingY: number = -1;

      constructor(
         public x: number, 
         public y: number, 
         public cellWidth: number, 
         public cellHeight: number, 
         public rows: number, 
         public cols: number, 
         public spriteSheet: SpriteSheet, 
         public data: CollisionData[]){
      }

      public collidesActor(actor: Actor): boolean{
         return (this.collidesPoint(actor.x, actor.y) ||
                 this.collidesPoint(actor.x + actor.getWidth(), actor.y)||
                 this.collidesPoint(actor.x + actor.getWidth(), actor.y + actor.getHeight())||
                 this.collidesPoint(actor.x, actor.y + actor.getHeight()));

      }
      public collidesPoint(x: number, y: number): boolean{
         var x = Math.floor(x/this.cellWidth);
         var y = Math.floor(y/this.cellHeight);
         var cell = this.getCell(x, y);
         if(cell){
            this._collidingX = x;
            this._collidingY = y;
            return cell.solid;
         }

         return false;
      }

      public getCell(x: number, y: number): CollisionData{
         return this.data[x+y*this.cols];
      }

      public draw(ctx: CanvasRenderingContext2D, delta: number){
         ctx.save();
         ctx.translate(this.x, this.y);
         for(var x = 0; x < this.cols; x++){
            for(var y = 0; y < this.rows; y++){
               var spriteId = this.getCell(x,y).spriteId;
               if(spriteId > -1){
                  this.spriteSheet.getSprite(spriteId).draw(ctx, x*this.cellWidth, y*this.cellHeight);
               }
            }
         }
         ctx.restore();
      }

      public debugDraw(ctx: CanvasRenderingContext2D){
         var width = this.cols * this.cellWidth;
         var height = this.rows * this.cellHeight;

         ctx.save();
         ctx.translate(this.x, this.y);

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

         if(this._collidingY > -1 && this._collidingX > -1){
            ctx.fillStyle = ex.Color.Cyan.toString();
            ctx.fillRect(this._collidingX * this.cellWidth, this._collidingY * this.cellHeight, this.cellWidth, this.cellHeight);
         }
         ctx.restore();

      }
   }
}