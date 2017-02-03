import { Color } from './Color';
import * as Effects from './SpriteEffects';

import { IDrawable } from '../Interfaces/IDrawable';
import { Vector } from '../Algebra';

/**
 * Creates a closed polygon drawing given a list of [[Vector]]s.
 *
 * @warning Use sparingly as Polygons are performance intensive
 */
export class Polygon implements IDrawable {
   public flipVertical: boolean;
   public flipHorizontal: boolean;
   public width: number;
   public height: number;
   
   public naturalWidth: number;
   public naturalHeight: number;

   /**
    * The color to use for the lines of the polygon
    */
   public lineColor: Color;
   /**
    * The color to use for the interior of the polygon
    */
   public fillColor: Color;
   /**
    * The width of the lines of the polygon
    */
   public lineWidth: number = 5;
   /**
    * Indicates whether the polygon is filled or not.
    */
   public filled: boolean = false;
   
   private _points: Vector[] = [];
   public anchor = new Vector(0, 0);
   public rotation: number = 0;
   public scale = new Vector(1, 1);

   /**
    * @param points  The vectors to use to build the polygon in order
    */
   constructor(points: Vector[]) {
      this._points = points;

      var minX = this._points.reduce((prev: number, curr: Vector) => {
         return Math.min(prev, curr.x);
      }, 0);
      var maxX = this._points.reduce((prev: number, curr: Vector) => {
         return Math.max(prev, curr.x);
      }, 0);

      this.width = maxX - minX;

      var minY = this._points.reduce((prev: number, curr: Vector) => {
         return Math.min(prev, curr.y);
      }, 0);
      var maxY = this._points.reduce((prev: number, curr: Vector) => {
         return Math.max(prev, curr.y);
      }, 0);

      this.height = maxY - minY;
      
      this.naturalHeight = this.height;
      this.naturalWidth = this.width;
   }

   /**
    * @notimplemented Effects are not supported on `Polygon`
    */
   public addEffect(effect: Effects.ISpriteEffect) {
      // not supported on polygons
   }
   /**
    * @notimplemented Effects are not supported on `Polygon`
    */
   public removeEffect(index: number): any;
   /**
    * @notimplemented Effects are not supported on `Polygon`
    */
   public removeEffect(effect: Effects.ISpriteEffect): any;
   /**
    * @notimplemented Effects are not supported on `Polygon`
    */
   public removeEffect(param: any) {
      // not supported on polygons
   }

   /**
    * @notimplemented Effects are not supported on `Polygon`
    */
   public clearEffects() {
      // not supported on polygons
   }
   
   public reset() {
      //pass
   }

   public draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
      ctx.save();
      ctx.translate(x + this.anchor.x, y + this.anchor.y);
      ctx.scale(this.scale.x, this.scale.y);
      ctx.rotate(this.rotation);
      ctx.beginPath();
      ctx.lineWidth = this.lineWidth;

      // Iterate through the supplied points and construct a 'polygon'
      var firstPoint = this._points[0];
      ctx.moveTo(firstPoint.x, firstPoint.y);

      var i = 0, len = this._points.length;

      for (i; i < len; i++) {
         ctx.lineTo(this._points[i].x, this._points[i].y);
      }

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