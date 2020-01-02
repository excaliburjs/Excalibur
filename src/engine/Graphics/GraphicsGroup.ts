import { Vector } from '../Algebra';
import { Graphic, DrawOptions } from './Graphic';
import { Animation } from './Animation';
import { BoundingBox } from '../Collision/Index';

export interface GraphicsGrouping {
  pos: Vector;
  graphic: Graphic;
}

export class GraphicsGroup extends Graphic {
  public members: GraphicsGrouping[] = [];
  constructor(members: GraphicsGrouping[]) {
    super();
    this.members = members;
    Promise.all(this.members.map((g) => g.graphic.readyToPaint)).then(() => {
      let groupBB: BoundingBox = this.members.reduce((bb, grouping) => {
        return bb.combine(grouping.graphic.bounds.translate(grouping.pos));
      }, new BoundingBox());
      this.width = groupBB.width;
      this.height = groupBB.height;
      this.paint();
    });
  }

  private _isAnimationOrGroup(graphic: Graphic): graphic is Animation | GraphicsGroup {
    return graphic instanceof Animation || graphic instanceof GraphicsGroup;
  }

  public tick(elapsedMilliseconds: number) {
    for (const member of this.members) {
      const maybeAnimation = member.graphic;
      if (this._isAnimationOrGroup(maybeAnimation)) {
        maybeAnimation.tick(elapsedMilliseconds);
        this.paint();
      }
    }
  }

  public paint() {
    this.members.forEach((m) => {
      m.graphic.paint();
    });
    super.paint();
  }

  public reset() {
    for (const member of this.members) {
      const maybeAnimation = member.graphic;
      if (this._isAnimationOrGroup(maybeAnimation)) {
        maybeAnimation.reset();
        this.paint();
      }
    }
  }

  public get canFinish(): boolean {
    return this.members.every((g) => g.graphic.canFinish);
  }

  public draw(ctx: CanvasRenderingContext2D, _options?: DrawOptions) {
    for (const member of this.members) {
      ctx.save();
      ctx.imageSmoothingEnabled = false; // todo this is odd can this be on graphic?
      ctx.translate(member.pos.x, member.pos.y);
      ctx.drawImage(member.graphic.image, 0, 0);
      ctx.restore();
    }
  }
}
