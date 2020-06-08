import { isActor } from '../Actor';
import { ExcaliburGraphicsContext } from './Context/ExcaliburGraphicsContext';
import { Scene } from '../Scene';
import { Entity } from '../Entity';
import { GraphicsComponent } from './GraphicsComponent';
import { TransformComponent, CoordPlane } from '../Transform';
import { Vector } from '../Algebra';
import { Color } from '../Drawing/Color';

export class GraphicsSystem {
  public readonly types = [GraphicsComponent.type, TransformComponent.type];
  constructor(public ctx: ExcaliburGraphicsContext, public scene: Scene) {}
  private _token = 0;

  public update(entities: Entity<GraphicsComponent | TransformComponent>[], delta: number): void {
    this._clearScreen();
    this._token++;
    // sort actors in z order
    entities.sort((a, b) => a.components.transform.z - b.components.transform.z);
    let transform: TransformComponent;
    let graphics: GraphicsComponent;
    for (let entity of entities) {
      transform = entity.components.transform;
      graphics = entity.components.graphics;

      if (this._isOffscreen(transform, graphics)) continue;
      this._pushCameraTransform(transform);

      this.ctx.save();
      if (graphics.onPreDraw) {
        graphics.onPreDraw(this.ctx);
      }
      graphics.update(delta, this._token);
      this._applyEntityTransform(transform);
      if ((this.scene as any)._engine.isDebug) {
        this.ctx.drawPoint(Vector.Zero, { color: Color.Yellow, size: 5 });
      }
      this.ctx.z = transform.z;
      this.ctx.opacity = graphics.opacity * ((entity as any).opacity ?? 1);
      graphics.draw(this.ctx, 0, 0);
      if (graphics.onPostDraw) {
        graphics.onPostDraw(this.ctx);
      }
      this.ctx.restore();

      // TODO better debug draw system
      if ((this.scene as any)._engine.isDebug) {
        if (isActor(entity)) {
          const bb = entity.body.collider.localBounds.translate(entity.getWorldPos());
          bb._debugDraw(this.ctx);
        }

        this.ctx.save();
        this._applyEntityTransform(transform);
        graphics.debugDraw(this.ctx, 0, 0);
        graphics.localBounds._debugDraw(this.ctx, Color.Black);
        this.ctx.restore();
      }

      this._popCameraTransform(transform);
    }
    this.ctx.flush();
  }

  private _clearScreen(): void {
    this.ctx.clear();
  }

  private _isOffscreen(transform: TransformComponent, graphics: GraphicsComponent) {
    const graphicsOffscreen = !this.scene.camera.viewport.intersect(graphics.localBounds.translate(transform.pos));
    return graphicsOffscreen;
  }

  private _applyEntityTransform(transform: TransformComponent): void {
    this.ctx.translate(transform.pos.x, transform.pos.y);
    this.ctx.rotate(transform.rotation);
    this.ctx.scale(transform.scale.x, transform.scale.y);
  }

  private _pushCameraTransform(transform: TransformComponent) {
    // Establish camera offset per entity
    if (transform.coordPlane === CoordPlane.World) {
      this.ctx.save();
      if (this?.scene?.camera) {
        this.scene.camera.draw(this.ctx);
      }
    }
  }

  private _popCameraTransform(transform: TransformComponent) {
    if (transform.coordPlane === CoordPlane.World) {
      // Apply camera world offset
      this.ctx.restore();
    }
  }
}
