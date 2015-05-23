
module ex {

   export class CullingBox {
      private _topLeft: Point = new Point(0, 0);
      private _topRight: Point = new Point(0, 0);
      private _bottomLeft: Point = new Point(0, 0);
      private _bottomRight: Point = new Point(0, 0);

      private _screenCoords: Array<Point>;

      public isSpriteOffScreen(actor: Actor, engine: Engine): boolean {
         var drawingWidth = actor.currentDrawing.width * actor.currentDrawing.scale.x;
         var drawingHeight = actor.currentDrawing.height * actor.currentDrawing.scale.y;
         var rotation = actor.rotation;
         var anchor = actor.getCenter().toPoint();

         this._topLeft.x = actor.getWorldX() - (drawingWidth / 2)
         this._topLeft.y = actor.getWorldY() - (drawingHeight / 2);
         this._topLeft = this._topLeft.rotate(rotation, anchor);

         this._topRight.x = actor.getWorldX() + (drawingWidth / 2);
         this._topRight.y = actor.getWorldY() - (drawingHeight / 2);
         this._topRight = this._topRight.rotate(rotation, anchor);

         this._bottomLeft.x = actor.getWorldX() - (drawingWidth / 2)
         this._bottomLeft.y = actor.getWorldY() + (drawingHeight / 2);
         this._bottomLeft = this._bottomLeft.rotate(rotation, anchor);

         this._bottomRight.x = actor.getWorldX() + (drawingWidth / 2)
         this._bottomRight.y = actor.getWorldY() + (drawingHeight / 2);
         this._bottomRight = this._bottomRight.rotate(rotation, anchor);

         ///

         this._screenCoords = new Array<Point>();

         var topLeftScreen = engine.worldToScreenCoordinates(this._topLeft);
         var topRightScreen = engine.worldToScreenCoordinates(this._topRight);
         var bottomLeftScreen = engine.worldToScreenCoordinates(this._bottomLeft);
         var bottomRightScreen = engine.worldToScreenCoordinates(this._bottomRight);

         this._screenCoords.push(topLeftScreen, topRightScreen, bottomLeftScreen, bottomRightScreen);

         for (var i = 0; i < this._screenCoords.length; i++) {
            if (this._screenCoords[i].x > 0 &&
               this._screenCoords[i].y > 0 &&
               this._screenCoords[i].x < engine.width &&
               this._screenCoords[i].y < engine.height) {
               return false;
            }
         }
         return true;
      }

      public debugDraw(ctx: CanvasRenderingContext2D) {
         ctx.fillStyle = Color.Red.toString();
         ctx.beginPath();
         ctx.arc(this._topLeft.x, this._topLeft.y, 5, 0, Math.PI * 2);
         ctx.closePath();
         ctx.fill();

         ctx.fillStyle = Color.Green.toString();
         ctx.beginPath();
         ctx.arc(this._topRight.x, this._topRight.y, 5, 0, Math.PI * 2);
         ctx.closePath();
         ctx.fill();

         ctx.fillStyle = Color.Blue.toString();
         ctx.beginPath();
         ctx.arc(this._bottomLeft.x, this._bottomLeft.y, 5, 0, Math.PI * 2);
         ctx.closePath();
         ctx.fill();

         ctx.fillStyle = Color.Magenta.toString();
         ctx.beginPath();
         ctx.arc(this._bottomRight.x, this._bottomRight.y, 5, 0, Math.PI * 2);
         ctx.closePath();
         ctx.fill();
      }
   }

}