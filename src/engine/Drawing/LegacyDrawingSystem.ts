import { Engine } from '../Engine';
import { Actor } from '../Actor';
import { Entity, System, SystemType } from '../EntityComponentSystem';
import { LegacyDrawComponent } from './LegacyDrawComponent';
import { ScreenElement } from '../ScreenElement';
import { Scene } from '../Scene';
import { Camera } from '../Camera';

/**
 * Draws anything with a transform and a "draw" method
 */
export class LegacyDrawingSystem extends System<LegacyDrawComponent> {
  public readonly types = ['legacydraw'];
  public systemType = SystemType.Draw;

  private _ctx: CanvasRenderingContext2D;
  private _camera: Camera;
  private _engine: Engine;

  public initialize(scene: Scene): void {
    this._ctx = scene.engine.ctx;
    this._engine = scene.engine;
    this._camera = scene.camera;
  }

  public update(entities: Entity[], delta: number) {
    this._clearScreen();

    // TODO these should be sorted by the query
    const sorted = (entities as Actor[]).sort((a, b) => a.z - b.z);

    const length = sorted.length;
    for (let i = 0; i < length; i++) {
      if (sorted[i].visible && !sorted[i].isOffScreen) {
        this._ctx.save();
        this._pushCameraTransform(sorted[i]);

        this._ctx.save();
        this._applyTransform(sorted[i]);
        this._draw(sorted[i], delta);
        this._ctx.restore();

        this._popCameraTransform(sorted[i]);
        this._ctx.restore();
      }
      if (this._engine.isDebug) {
        this._ctx.save();
        this._pushCameraTransform(sorted[i]);
        this._ctx.strokeStyle = 'yellow';
        sorted[i].debugDraw(this._ctx);
        this._popCameraTransform(sorted[i]);
        this._ctx.restore();
      }
    }
    if (this._engine.isDebug) {
      this._ctx.save();
      this._camera.draw(this._ctx);
      this._camera.debugDraw(this._ctx);
      this._ctx.restore();
    }
  }

  private _applyTransform(actor: Actor) {
    let parent = actor.parent;
    while (parent) {
      this._ctx.translate(parent.pos.x, parent.pos.y);
      this._ctx.rotate(parent.rotation);
      this._ctx.scale(parent.scale.x, parent.scale.y);
      parent = parent.parent;
    }

    this._ctx.translate(actor.pos.x, actor.pos.y);
    this._ctx.rotate(actor.rotation);
    this._ctx.scale(actor.scale.x, actor.scale.y);
  }

  private _draw(actor: Actor, delta: number) {
    actor.draw(this._ctx, delta);
  }

  private _clearScreen(): void {
    this._ctx.clearRect(0, 0, this._ctx.canvas.width, this._ctx.canvas.height);
    this._ctx.fillStyle = this._engine.backgroundColor.toString();
    this._ctx.fillRect(0, 0, this._ctx.canvas.width, this._ctx.canvas.height);
  }

  private _pushCameraTransform(actor: Actor) {
    // Establish camera offset per entity
    if (!(actor instanceof ScreenElement)) {
      this._ctx.save();
      if (this._camera) {
        this._camera.draw(this._ctx);
      }
    }
  }

  private _popCameraTransform(actor: Actor) {
    if (!(actor instanceof ScreenElement)) {
      // Apply camera world offset
      this._ctx.restore();
    }
  }
}
