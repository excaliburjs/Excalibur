
module ex {

   export class CullingBox {
      private _topLeft: Point = new Point(0, 0);
      private _topRight: Point = new Point(0, 0);
      private _bottomLeft: Point = new Point(0, 0);
      private _bottomRight: Point = new Point(0, 0);

      private _xCoords: Array<number>;
      private _yCoords: Array<number>;
      private _xMin: number;
      private _yMin: number;
      private _xMax: number;
      private _yMax: number;

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

         var topLeftScreen = engine.worldToScreenCoordinates(this._topLeft);
         var topRightScreen = engine.worldToScreenCoordinates(this._topRight);
         var bottomLeftScreen = engine.worldToScreenCoordinates(this._bottomLeft);
         var bottomRightScreen = engine.worldToScreenCoordinates(this._bottomRight);
         this._xCoords = [];
         this._yCoords = [];

         this._xCoords.push(topLeftScreen.x, topRightScreen.x, bottomLeftScreen.x, bottomRightScreen.x);
         this._yCoords.push(topLeftScreen.y, topRightScreen.y, bottomLeftScreen.y, bottomRightScreen.y);

         this._xMin = Math.min.apply(null, this._xCoords);
         this._yMin = Math.min.apply(null, this._yCoords);
         this._xMax = Math.max.apply(null, this._xCoords);
         this._yMax = Math.max.apply(null, this._yCoords);

         var boundingPoints = new Array<Point>();
         boundingPoints.push(new Point(this._xMin, this._yMin), new Point(this._xMax, this._yMin), new Point(this._xMin, this._yMax), new Point(this._xMax, this._yMax));

         for (var i = 0; i < boundingPoints.length; i++) {
            if (boundingPoints[i].x > 0 &&
               boundingPoints[i].y > 0 &&
               boundingPoints[i].x < engine.width &&
               boundingPoints[i].y < engine.height) {
               return false;
            }
         }
         return true;
      }

      public debugDraw(ctx: CanvasRenderingContext2D) {

         // bounding rectangle
         ctx.beginPath();
         ctx.strokeStyle = Color.White.toString();
         ctx.rect(this._xMin, this._yMin, this._xMax - this._xMin, this._yMax - this._yMin);
         ctx.stroke();

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