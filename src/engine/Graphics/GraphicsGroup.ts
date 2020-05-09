import { Vector } from '../Algebra';
import { Graphic, GraphicOptions } from './Graphic';
import { Animation, HasTick } from './Animation';
import { ExcaliburGraphicsContext, ImageSource } from './Context/ExcaliburGraphicsContext';

export interface GraphicsGroupingOptions {
  members: GraphicsGrouping[];
}

export interface GraphicsGrouping {
  pos: Vector;
  graphic: Graphic;
}

export class GraphicsGroup extends Graphic implements HasTick {
  public members: GraphicsGrouping[] = [];

  public getSource(): ImageSource {
    return null;
  }

  public get image(): HTMLImageElement | HTMLCanvasElement {
    return null;
  }
  constructor(options: GraphicsGroupingOptions & GraphicOptions) {
    super(options);
    this.members = options.members;
    this.width = 0;
    this.height = 0;
  }

  public clone(): GraphicsGroup {
    return new GraphicsGroup({
      members: [...this.members],
      ...this.cloneGraphicOptions()
    });
  }

  private _isAnimationOrGroup(graphic: Graphic): graphic is Animation | GraphicsGroup {
    return graphic instanceof Animation || graphic instanceof GraphicsGroup;
  }

  public tick(elapsedMilliseconds: number, idempotencyToken?: number) {
    for (const member of this.members) {
      const maybeAnimation = member.graphic;
      if (this._isAnimationOrGroup(maybeAnimation)) {
        maybeAnimation.tick(elapsedMilliseconds, idempotencyToken);
      }
    }
  }

  public reset() {
    for (const member of this.members) {
      const maybeAnimation = member.graphic;
      if (this._isAnimationOrGroup(maybeAnimation)) {
        maybeAnimation.reset();
      }
    }
  }

  protected _drawImage(ex: ExcaliburGraphicsContext, x: number, y: number) {
    for (const member of this.members) {
      ex.save();
      ex.translate(x, y);
      member.graphic.draw(ex, member.pos.x, member.pos.y);
      if (this.showDebug) {
        ex.drawDebugRect(0, 0, this.width, this.height);
      }
      ex.restore();
    }
  }
}
