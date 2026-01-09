import { Vector } from '../math/vector';
import type { GraphicOptions } from './graphic';
import { Graphic } from './graphic';
import type { HasTick } from './animation';
import { Animation } from './animation';
import type { ExcaliburGraphicsContext } from './context/excalibur-graphics-context';
import { BoundingBox } from '../collision/index';
import { Logger } from '../util/log';

export interface GraphicsGroupingOptions {
  members: (GraphicsGrouping | Graphic)[];
  /**
   * Default true, GraphicsGroup will use the anchor to position all the graphics based on their combined bounds
   *
   * Setting to false will ignore anchoring from parent components and position the top left of all graphics at the actor's position,
   * positioning graphics in the group is done with the `offset` property.
   */
  useAnchor?: boolean;
}

export interface GraphicsGrouping {
  offset: Vector;
  graphic: Graphic;
  /**
   * Optionally disable this graphics bounds as part of group calculation, default true
   * if unspecified
   *
   * You may want disable this if you're using text because their bounds will affect
   * the centering of the whole group.
   *
   * **WARNING** having inaccurate bounds can cause offscreen culling issues.
   */
  useBounds?: boolean;
}

export class GraphicsGroup extends Graphic implements HasTick {
  private _logger = Logger.getInstance();
  public useAnchor: boolean = true;
  public members: (GraphicsGrouping | Graphic)[] = [];

  constructor(options: GraphicsGroupingOptions & GraphicOptions) {
    super(options);
    this.members = options.members;
    this.useAnchor = options.useAnchor ?? this.useAnchor;
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
    const bb = new BoundingBox();
    for (const member of this.members) {
      if (member instanceof Graphic) {
        member.localBounds.combine(bb, bb);
      } else {
        const { graphic, offset: pos, useBounds } = member;
        const shouldUseBounds = useBounds === undefined ? true : useBounds;
        if (graphic) {
          if (shouldUseBounds) {
            graphic.localBounds.translate(pos).combine(bb, bb);
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

  public tick(elapsed: number, idempotencyToken?: number) {
    for (const member of this.members) {
      let graphic: Graphic;
      if (member instanceof Graphic) {
        graphic = member;
      } else {
        graphic = member.graphic;
      }
      if (this._isAnimationOrGroup(graphic)) {
        graphic.tick(elapsed, idempotencyToken);
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
    super._preDraw(ex, this.useAnchor ? x : 0, this.useAnchor ? y : 0);
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
