/// <reference path="../Drawing/Color.ts" />

module ex.Util.DrawUtil {

   /**
    * Draw a line on canvas context
    * 
    * @param ctx The canvas context
    * @param color The color of the line
    * @param x1 The start x coordinate
    * @param y1 The start y coordinate
    * @param x2 The ending x coordinate
    * @param y2 The ending y coordinate
    */
   export function line(ctx: CanvasRenderingContext2D, color: ex.Color, x1: number, y1: number, x2: number, y2: number) {
      ctx.beginPath();
      ctx.strokeStyle = color.toString();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.closePath();
      ctx.stroke();  
   }

   /**
    * Represents border radius values
    */
   export interface IBorderRadius {

      /**
       * Top-left
       */
      tl: number;
      /**
       * Top-right
       */
      tr: number;
      /**
       * Bottom-right
       */
      br: number;
      /**
       * Bottom-left
       */
      bl: number;
   }

   /**
    * Draw a round rectange on a canvas context
    * 
    * @param ctx The canvas context
    * @param x The top-left x coordinate
    * @param y The top-left y coordinate
    * @param width The width of the rectangle
    * @param height The height of the rectangle
    * @param radius The border radius of the rectangle
    * @param fill The [[ex.Color]] to fill rectangle with
    * @param stroke The [[ex.Color]] to stroke rectangle with
    */
   export function roundRect(ctx: CanvasRenderingContext2D, 
      x: number, y: number, width: number, height: number, 
      radius: number|IBorderRadius = 5, stroke: Color = ex.Color.White, fill: Color = null) {
      var br: IBorderRadius;

      if (typeof radius === 'number') {
         br = {tl: radius, tr: radius, br: radius, bl: radius};
      } else {
         var defaultRadius: IBorderRadius = {tl: 0, tr: 0, br: 0, bl: 0};
         for (var side in defaultRadius) {
            br[side] = radius[side] || defaultRadius[side];
         }
      }

      ctx.beginPath();
      ctx.moveTo(x + br.tl, y);
      ctx.lineTo(x + width - br.tr, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + br.tr);
      ctx.lineTo(x + width, y + height - br.br);
      ctx.quadraticCurveTo(x + width, y + height, x + width - br.br, y + height);
      ctx.lineTo(x + br.bl, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - br.bl);
      ctx.lineTo(x, y + br.tl);
      ctx.quadraticCurveTo(x, y, x + br.tl, y);
      ctx.closePath();

      if (fill) {
         ctx.fillStyle = fill.toString();
         ctx.fill();
      }

      if (stroke) {
         ctx.strokeStyle = stroke.toString();
         ctx.stroke();
      }
   }

}