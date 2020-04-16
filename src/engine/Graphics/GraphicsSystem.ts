import { Actor } from '../Actor';
import { ExcaliburGraphicsContext } from './Context/ExcaliburGraphicsContext';
import { ScreenElement } from '../ScreenElement';
import { Scene } from '../Scene';

export class GraphicsSystem {
  constructor(public ctx: ExcaliburGraphicsContext, public scene: Scene) {}

  public update(actors: Actor[], delta: number): void {
    this._clearScreen();
    // sort actors in z order
    actors.sort((a, b) => a.z - b.z);
    for (let actor of actors) {
      if (actor.isOffScreen) continue;
      this._pushCameraTransform(actor);

      this.ctx.save();
      this._applyEntityTransform(actor);
      const [x, y] = this._applyActorAnchor(actor);
      this.ctx.z = actor.z;
      this.ctx.opacity = actor.graphics.opacity * actor.opacity;
      actor.graphics.update(delta);
      actor.graphics.draw(this.ctx, x, y);
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

  private _applyActorAnchor(actor: Actor): [number, number] {
    this.ctx.translate(-(actor.width * actor.anchor.x), -(actor.height * actor.anchor.y));

    const gfx = actor.graphics.current;
    if (gfx) {
      // See https://github.com/excaliburjs/Excalibur/pull/619 for discussion on this formula
      const offsetX = (actor.width - gfx.width * gfx.scale.x) * actor.anchor.x;
      const offsetY = (actor.height - gfx.height * gfx.scale.y) * actor.anchor.y;
      return [offsetX, offsetY];
    }
    return [0, 0];
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
