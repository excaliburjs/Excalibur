import { Vector } from '../Algebra';
import { Graphic, DrawOptions } from './Graphic';
import { Animation } from './Animation';
import { BoundingBox } from '../Collision/Index';
import { ExcaliburGraphicsContext } from './ExcaliburGraphicsContext';

export interface GraphicsGrouping {
  pos: Vector;
  graphic: Graphic;
}

export class GraphicsGroup extends Graphic {
  public members: GraphicsGrouping[] = [];
  constructor(members: GraphicsGrouping[]) {
    super();
    this.members = members;
    Promise.all(this.members.map((g) => g.graphic.readyToRasterize)).then(() => {
      let groupBB: BoundingBox = this.members.reduce((bb, member) => {
        member.graphic.rasterize();
        return bb.combine(member.graphic.bounds.translate(member.pos));
      }, new BoundingBox());
      this.width = groupBB.width;
      this.height = groupBB.height;
      this.rasterize();
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
        this.rasterize();
      }
    }
  }

  public rasterize() {
    // TODO not sure doing this for each member is necessary
    this.members.forEach((m) => {
      m.graphic.rasterize();
    });
    super.rasterize();
  }

  public reset() {
    for (const member of this.members) {
      const maybeAnimation = member.graphic;
      if (this._isAnimationOrGroup(maybeAnimation)) {
        maybeAnimation.reset();
        this.rasterize();
      }
    }
  }

  public draw(ex: ExcaliburGraphicsContext, x: number, y: number) {
    for (const member of this.members) {
      ex.save();
      ex.translate(x, y);
      if (this.showDebug) {
        ex.drawDebugRect(0, 0, this.width, this.height);
      }
      member.graphic.draw(ex, member.pos.x, member.pos.y);
      ex.restore();
    }
  }

  public execute(_ctx: CanvasRenderingContext2D, _options?: DrawOptions) {
    // Nothing to raster
  }
}
