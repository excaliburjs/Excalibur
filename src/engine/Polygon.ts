/// <reference path="Interfaces/IDrawable.ts" />
module ex {
   /**
    * Creates a closed polygon drawing given a list a of points. Polygons should be 
    * used sparingly as there is a <b>performance</b> impact for using them.
    * @class Polygon
    * @extends IDrawable
    * @constructor
    * @param points {Point[]} The points to use to build the polygon in order
    */
   export class Polygon implements IDrawable {
      public flipVertical: boolean;
      public flipHorizontal: boolean;
      public width: number;
      public height: number;

      /**
       * The color to use for the lines of the polygon
       * @property lineColor {Color}
       */
      public lineColor: Color;
      /**
       * The color to use for the interior of the polygon
       * @property fillColor {Color}
       */
      public fillColor: Color;
      /**
       * The width of the lines of the polygon
       * @property [lineWidth=5] {number} The width of the lines in pixels
       */
      public lineWidth: number = 5;
      /**
       * Indicates whether the polygon is filled or not.
       * @property [filled=false] {boolean}
       */
      public filled: boolean = false;
      
      private points: Point[] = [];
      private transformationPoint = new Point(0, 0);
      private rotation: number = 0;
      private scaleX: number = 1;
      private scaleY: number = 1;

      
      constructor(points : Point[]) {
         this.points = points;

         var minX = this.points.reduce((prev: number, curr: Point) => {
            return Math.min(prev, curr.x);
         }, 0);
         var maxX = this.points.reduce((prev: number, curr: Point) => {
            return Math.max(prev, curr.x);
         }, 0);

         this.width = maxX - minX;

         var minY = this.points.reduce((prev: number, curr: Point) => {
            return Math.min(prev, curr.y);
         }, 0);
         var maxY = this.points.reduce((prev: number, curr: Point) => {
            return Math.max(prev, curr.y);
         }, 0);

         this.height = maxY - minY;
      }

      /**
       * Effects are <b>not supported</b> on polygons
       * @method addEffect
       */
      public addEffect(effect: Effects.ISpriteEffect){
         // not supported on polygons
      }

      public removeEffect(index: number);
      public removeEffect(effect: Effects.ISpriteEffect);
      public removeEffect(param: any){
         // not supported on polygons
      }

      /**
       * Effects are <b>not supported</b> on polygons
       * @method clearEffects
       */
      public clearEffects(){
         // not supported on polygons
      }

      public transformAboutPoint(point: Point) {
         this.transformationPoint = point;
      }

      public setScaleX(scaleX: number) {
         this.scaleX = scaleX;
      }

      public setScaleY(scaleY: number) {
         this.scaleY = scaleY;
      }

      public getScaleX() {
         return this.scaleX;
      }

      public getScaleY() {
         return this.scaleY;
      }

      public setRotation(radians: number) {
         this.rotation = radians;
      }

      public getRotation() {
         return this.rotation;
      }

      public reset() {
         //pass
      }

      public draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
         ctx.save();
         ctx.translate(x + this.transformationPoint.x, y + this.transformationPoint.y);
         ctx.scale(this.scaleX, this.scaleY);
         ctx.rotate(this.rotation);
         ctx.beginPath();
         ctx.lineWidth = this.lineWidth;

         // Iterate through the supplied points and contruct a 'polygon'
         var firstPoint = this.points[0];
         ctx.moveTo(firstPoint.x, firstPoint.y);
         this.points.forEach((point)=> {
            ctx.lineTo(point.x, point.y);
         });
         ctx.lineTo(firstPoint.x, firstPoint.y);
         ctx.closePath();

         if (this.filled) {
            ctx.fillStyle = this.fillColor.toString();
            ctx.fill();
         }

         ctx.strokeStyle = this.lineColor.toString();

         if (this.flipHorizontal) {
            ctx.translate(this.width, 0);
            ctx.scale(-1, 1);
         }

         if (this.flipVertical) {
            ctx.translate(0, this.height);
            ctx.scale(1, -1);
         }

         ctx.stroke();
         ctx.restore();
      }
   }
}