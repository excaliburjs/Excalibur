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
  private _token = 0;
  constructor(public ctx: ExcaliburGraphicsContext, public scene: Scene) {}

  public update(entities: Entity<GraphicsComponent | TransformComponent>[], delta: number): void {
    this._clearScreen();
    this._token++;
    // sort entities in z order
    entities.sort((a, b) => a.components.transform.z - b.components.transform.z);
    let transform: TransformComponent;
    let graphics: GraphicsComponent;
    for (let entity of entities) {
      transform = entity.components.transform;
      graphics = entity.components.graphics;

      // Skip entities that have graphics offscreen
      if (this._isOffscreen(transform, graphics)) continue;

      // This optionally sets our camera based on the entity coord plan (world vs. screen)
      this._pushCameraTransform(transform);

      this.ctx.save();

      // Optionally run the onPreDraw graphics lifecycle draw
      if (graphics.onPreDraw) {
        graphics.onPreDraw(this.ctx);
      }

      // Tick any graphics state (but only once) for animations and graphics groups
      graphics.update(delta, this._token);

      // Position the entity
      this._applyTransform(transform);

      this._graphicsPositionDebugDraw();

      // TODO should this be in apply transform???
      this.ctx.z = transform.z;
      this.ctx.opacity = graphics.opacity * ((entity as any).opacity ?? 1);

      // Draw the graphics component
      graphics.draw(this.ctx, 0, 0);

      // Optionally run the onPostDraw graphics lifecycle draw
      if (graphics.onPostDraw) {
        graphics.onPostDraw(this.ctx);
      }

      this.ctx.restore();

      // Draw the graphics bounds
      this._graphicsBoundsDebugDraw(entity, transform, graphics);

      // Reset the transform back to the original
      this._popCameraTransform(transform);
    }

    this.scene.legacyLifecycleDraw(this.ctx);
    this.ctx.flush();
  }

  private _clearScreen(): void {
    this.ctx.clear();
  }

  private _isOffscreen(transform: TransformComponent, graphics: GraphicsComponent) {
    if (transform.coordPlane === CoordPlane.World) {
      const graphicsOffscreen = !this.scene.camera.viewport.intersect(graphics.localBounds.translate(transform.pos));
      return graphicsOffscreen;
    } else {
      // TODO sceen coordinates
      return false;
    }
  }

  /**
   * This applies the current entity transform to the graphics context
   * @param transform
   */
  private _applyTransform(transform: TransformComponent): void {
    this.ctx.translate(transform.pos.x, transform.pos.y);
    this.ctx.rotate(transform.rotation);
    this.ctx.scale(transform.scale.x, transform.scale.y);
  }

  /**
   * Applies the current camera transform if in world coordinates
   * @param transform
   */
  private _pushCameraTransform(transform: TransformComponent) {
    // Establish camera offset per entity
    if (transform.coordPlane === CoordPlane.World) {
      this.ctx.save();
      if (this?.scene?.camera) {
        this.scene.camera.draw(this.ctx);
      }
    }
  }

  /**
   * Resets the current camera transform if in world coordinates
   * @param transform
   */
  private _popCameraTransform(transform: TransformComponent) {
    if (transform.coordPlane === CoordPlane.World) {
      // Apply camera world offset
      this.ctx.restore();
    }
  }

  private _graphicsPositionDebugDraw() {
    if ((this.scene as any)._engine.isDebug) {
      this.ctx.drawPoint(Vector.Zero, { color: Color.Yellow, size: 5 });
    }
  }

  private _graphicsBoundsDebugDraw(
    entity: Entity<GraphicsComponent | TransformComponent>,
    transform: TransformComponent,
    graphics: GraphicsComponent
  ) {
    if ((this.scene as any)._engine.isDebug) {
      if (isActor(entity)) {
        const bb = entity.body.collider.localBounds.translate(entity.getWorldPos());
        bb._debugDraw(this.ctx);
      }

      this.ctx.save();
      this._applyTransform(transform);
      graphics.debugDraw(this.ctx, 0, 0);
      this.ctx.restore();
    }
  }
}
