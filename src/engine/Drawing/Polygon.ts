import { Color } from './Color';
import * as Effects from './SpriteEffects';

import { Drawable, DrawOptions } from '../Interfaces/Drawable';
import { Vector } from '../Algebra';
import { obsolete } from '../Util/Decorators';

/**
 * Creates a closed polygon drawing given a list of [[Vector]]s.
 *
 * @deprecated Use [["Graphics/Polygon".Polygon]]
 * @warning Use sparingly as Polygons are performance intensive
 */
@obsolete({
  message: 'Polygon will be removed in v0.26.0',
  alternateMethod: 'Use Graphics.Polygon'
})
export class Polygon implements Drawable {
  public flipVertical: boolean;
  public flipHorizontal: boolean;
  public drawWidth: number;
  public drawHeight: number;

  public width: number;
  public height: number;

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
  public anchor = Vector.Zero;
  public offset = Vector.Zero;
  public rotation: number = 0;
  public scale = Vector.One;
  public opacity: number = 1;

  /**
   * @param points  The vectors to use to build the polygon in order
   */
  constructor(points: Vector[]) {
    this._points = points;

    const minX = this._points.reduce((prev: number, curr: Vector) => {
      return Math.min(prev, curr.x);
    }, 0);
    const maxX = this._points.reduce((prev: number, curr: Vector) => {
      return Math.max(prev, curr.x);
    }, 0);

    this.drawWidth = maxX - minX;

    const minY = this._points.reduce((prev: number, curr: Vector) => {
      return Math.min(prev, curr.y);
    }, 0);
    const maxY = this._points.reduce((prev: number, curr: Vector) => {
      return Math.max(prev, curr.y);
    }, 0);

    this.drawHeight = maxY - minY;

    this.height = this.drawHeight;
    this.width = this.drawWidth;
  }

  /**
   * @notimplemented Effects are not supported on `Polygon`
   */
  public addEffect() {
    // not supported on polygons
  }
  /**
   * @notimplemented Effects are not supported on `Polygon`
   */
  public removeEffect(index: number): void;
  /**
   * @notimplemented Effects are not supported on `Polygon`
   */
  public removeEffect(effect: Effects.SpriteEffect): void;
  /**
   * @notimplemented Effects are not supported on `Polygon`
   */
  public removeEffect() {
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

  /**
   * Draws the sprite appropriately to the 2D rendering context, at an x and y coordinate.
   * @param ctx  The 2D rendering context
   * @param x    The x coordinate of where to draw
   * @param y    The y coordinate of where to draw
   */
  public draw(ctx: CanvasRenderingContext2D, x: number, y: number): void;
  /**
   * Draws the sprite with custom options to override internals without mutating them.
   * @param options
   */
  public draw(options: DrawOptions): void;
  public draw(ctxOrOptions: CanvasRenderingContext2D | DrawOptions, x?: number, y?: number): void {
    if (ctxOrOptions instanceof CanvasRenderingContext2D) {
      this._drawWithOptions({ ctx: ctxOrOptions, x, y });
    } else {
      this._drawWithOptions(ctxOrOptions);
    }
  }

  private _drawWithOptions(options: DrawOptions) {
    const { ctx, x, y, rotation, drawWidth, drawHeight, anchor, offset, opacity, flipHorizontal, flipVertical } = {
      ...options,
      rotation: options.rotation ?? this.rotation,
      drawWidth: options.drawWidth ?? this.drawWidth,
      drawHeight: options.drawHeight ?? this.drawHeight,
      flipHorizontal: options.flipHorizontal ?? this.flipHorizontal,
      flipVertical: options.flipVertical ?? this.flipVertical,
      anchor: options.anchor ?? this.anchor,
      offset: options.offset ?? this.offset,
      opacity: options.opacity ?? this.opacity
    };

    const xpoint = drawWidth * anchor.x + offset.x + x;
    const ypoint = drawHeight * anchor.y + offset.y + y;

    ctx.save();
    ctx.translate(xpoint, ypoint);
    ctx.scale(this.scale.x, this.scale.y);
    ctx.rotate(rotation);
    ctx.beginPath();
    ctx.lineWidth = this.lineWidth;

    // Iterate through the supplied points and construct a 'polygon'
    const firstPoint = this._points[0];
    ctx.moveTo(firstPoint.x, firstPoint.y);

    let i = 0;
    const len = this._points.length;

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

    if (flipHorizontal) {
      ctx.translate(drawWidth, 0);
      ctx.scale(-1, 1);
    }

    if (flipVertical) {
      ctx.translate(0, drawHeight);
      ctx.scale(1, -1);
    }

    const oldAlpha = ctx.globalAlpha;
    ctx.globalAlpha = opacity ?? 1;
    ctx.stroke();
    ctx.globalAlpha = oldAlpha;

    ctx.restore();
  }
}
