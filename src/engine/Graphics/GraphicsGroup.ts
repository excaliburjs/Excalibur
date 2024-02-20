import { Vector } from '../Math/vector';
import { Graphic, GraphicOptions } from './Graphic';
import { Animation, HasTick } from './Animation';
import { ExcaliburGraphicsContext } from './Context/ExcaliburGraphicsContext';
import { BoundingBox } from '../Collision/Index';
import { Logger } from '../Util/Log';

export interface GraphicsGroupingOptions {
  members: (GraphicsGrouping | Graphic)[];
}

export interface GraphicsGrouping {
  offset: Vector;
  graphic: Graphic;
  /**
   * Optionally disable this graphics bounds as part of group calculation, default true
   * if unspecified
   *
   * You may want to do this if you're using text because their bounds will affect
   * the centering of the whole group
   */
  useBounds?: boolean;
}

export class GraphicsGroup extends Graphic implements HasTick {
  private _logger = Logger.getInstance();
  public members: (GraphicsGrouping | Graphic)[] = [];

  constructor(options: GraphicsGroupingOptions & GraphicOptions) {
    super(options);
    this.members = options.members;
    this._updateDimensions();
  }

  public clone(): GraphicsGroup {
    return new GraphicsGroup({
      members: [...this.members],
      ...this.cloneGraphicOptions()
    });
  }

  private _updateDimensions(): BoundingBox {
    const bb = this.localBounds;
    this.width = bb.width;
    this.height = bb.height;
    return bb;
  }

  public get localBounds(): BoundingBox {
    let bb = new BoundingBox();
    for (const member of this.members) {
      if (member instanceof Graphic) {
        bb = member.localBounds.combine(bb);
      } else {
        const { graphic, offset: pos, useBounds } = member;
        const shouldUseBounds = useBounds === undefined ? true : useBounds;
        if (graphic) {
          if (shouldUseBounds) {
            bb = graphic.localBounds.translate(pos).combine(bb);
          }
        } else {
          this._logger.warnOnce(`Graphics group member has an null or undefined graphic, member definition: ${JSON.stringify(member)}.`);
        }
      }
    }
    return bb;
  }

  private _isAnimationOrGroup(graphic: Graphic): graphic is Animation | GraphicsGroup {
    return graphic instanceof Animation || graphic instanceof GraphicsGroup;
  }

  public tick(elapsedMilliseconds: number, idempotencyToken?: number) {
    for (const member of this.members) {
      let graphic: Graphic;
      if (member instanceof Graphic) {
        graphic = member;
      } else {
        graphic = member.graphic;
      }
      if (this._isAnimationOrGroup(graphic)) {
        graphic.tick(elapsedMilliseconds, idempotencyToken);
      }
    }
  }

  public reset() {
    for (const member of this.members) {
      let graphic: Graphic;
      if (member instanceof Graphic) {
        graphic = member;
      } else {
        graphic = member.graphic;
      }
      if (this._isAnimationOrGroup(graphic)) {
        graphic.reset();
      }
    }
  }

  protected _preDraw(ex: ExcaliburGraphicsContext, x: number, y: number) {
    this._updateDimensions();
    super._preDraw(ex, x, y);
  }

  protected _drawImage(ex: ExcaliburGraphicsContext, x: number, y: number) {
    const pos = Vector.Zero;
    for (const member of this.members) {
      let graphic: Graphic;
      if (member instanceof Graphic) {
        graphic = member;
      } else {
        graphic = member.graphic;
        member.offset.clone(pos);
      }
      if (!graphic) {
        continue;
      }
      ex.save();
      ex.translate(x, y);
      graphic.draw(ex, pos.x, pos.y);
      if (this.showDebug) {
        /* istanbul ignore next */
        ex.debug.drawRect(0, 0, this.width, this.height);
      }
      ex.restore();
    }
  }
}
