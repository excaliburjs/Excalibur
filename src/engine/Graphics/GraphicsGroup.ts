import { Vector } from '../Algebra';
import { Graphic, DrawOptions } from './Graphic';
import { Animation } from './Animation';

export interface GraphicsGrouping {
  pos: Vector;
  graphic: Graphic;
}

export class GraphicsGroup extends Graphic {
  public group: GraphicsGrouping[] = [];
  constructor(group: GraphicsGrouping[]) {
    super();
    this.group = group;
  }

  private _isAnimationOrGroup(graphic: Graphic): graphic is Animation | GraphicsGroup {
    return graphic instanceof Animation || graphic instanceof GraphicsGroup;
  }

  public tick(elapsedMilliseconds: number) {
    for (const member of this.group) {
      const maybeAnimation = member.graphic;
      if (this._isAnimationOrGroup(maybeAnimation)) {
        maybeAnimation.tick(elapsedMilliseconds);
      }
    }
  }

  public reset() {
    for (const member of this.group) {
      const maybeAnimation = member.graphic;
      if (this._isAnimationOrGroup(maybeAnimation)) {
        maybeAnimation.reset();
      }
    }
  }

  public get canFinish(): boolean {
    return this.group.every((g) => g.graphic.canFinish);
  }

  public draw(ctx: CanvasRenderingContext2D, options?: DrawOptions) {
    for (const member of this.group) {
      ctx.save();
      ctx.translate(member.pos.x, member.pos.y);
      member.graphic.draw(ctx, options);
      ctx.restore();
    }
  }
}
