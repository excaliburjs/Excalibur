import { Actor } from '../Actor';
import { ExcaliburGraphicsContext } from './Context/ExcaliburGraphicsContext';
import { ScreenElement } from '../ScreenElement';
import { Scene } from '../Scene';

export class GraphicsSystem {
  constructor(public ctx: ExcaliburGraphicsContext, public scene: Scene) {}

  public update(actors: Actor[], delta: number): void {
    this._clearScreen();
    // assuming actors are in z order
    for (let actor of actors) {
      if (actor.isOffScreen) continue;
      this._pushCameraTransform(actor);

      this.ctx.save();
      this._applyEntityTransform(actor);
      actor.graphics.update(delta);
      actor.graphics.draw(this.ctx, 0, 0);
      this.ctx.restore();

      this._popCameraTransform(actor);
    }
    this.ctx.flush();
  }

  private _clearScreen(): void {
    this.ctx.clear();
  }

  private _applyEntityTransform(actor: Actor): void {
    this.ctx.translate(actor.pos.x, actor.pos.y);
    this.ctx.rotate(actor.rotation);
    this.ctx.scale(actor.scale.x, actor.scale.y);
  }

  private _pushCameraTransform(actor: Actor) {
    // Establish camera offset per entity
    if (!(actor instanceof ScreenElement)) {
      this.ctx.save();
      if (this?.scene?.camera) {
        this.scene.camera.draw(this.ctx);
      }
    }
  }

  private _popCameraTransform(actor: Actor) {
    if (!(actor instanceof ScreenElement)) {
      // Apply camera world offset
      this.ctx.restore();
    }
  }
}
