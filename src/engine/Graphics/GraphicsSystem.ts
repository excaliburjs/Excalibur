import { isActor } from '../Actor';
import { ExcaliburGraphicsContext } from './Context/ExcaliburGraphicsContext';
import { Scene } from '../Scene';
import { GraphicsComponent } from './GraphicsComponent';
import { vec, Vector } from '../Algebra';
import { Color } from '../Drawing/Color';
import { CoordPlane, TransformComponent } from '../EntityComponentSystem/Components/TransformComponent';
import { Entity } from '../EntityComponentSystem/Entity';
import { Camera } from '../Camera';
import { System, SystemType } from '../EntityComponentSystem';
import { Engine } from '../Engine';
import { GraphicsDiagnostics } from './GraphicsDiagnostics';

export class GraphicsSystem extends System<TransformComponent | GraphicsComponent> {
  public readonly types = ['transform', 'graphics'] as const;
  public readonly systemType = SystemType.Draw;
  public priority = 0;
  private _token = 0;
  private _graphicsContext: ExcaliburGraphicsContext;
  private _camera: Camera;
  private _engine: Engine;

  public initialize(scene: Scene): void {
    this._graphicsContext = scene.engine.graphicsContext;
    this._camera = scene.camera;
    this._engine = scene.engine;
  }

  public sort(a: Entity<TransformComponent | GraphicsComponent>, b: Entity<TransformComponent | GraphicsComponent>) {
    return a.components.transform.z - b.components.transform.z;
  }

  public update(entities: Entity<GraphicsComponent | TransformComponent>[], delta: number): void {
    this._clearScreen();
    this._token++;
    let transform: TransformComponent;
    let graphics: GraphicsComponent;

    for (const entity of entities) {
      transform = entity.components.transform;
      graphics = entity.components.graphics;

      // Skip entities that have graphics offscreen
      if (this._isOffscreen(transform, graphics)) {
        continue;
      }

      // This optionally sets our camera based on the entity coord plan (world vs. screen)
      this._pushCameraTransform(transform);

      this._graphicsContext.save();

      // Optionally run the onPreDraw graphics lifecycle draw
      if (graphics.onPreDraw) {
        graphics.onPreDraw(this._graphicsContext, delta);
      }

      // Tick any graphics state (but only once) for animations and graphics groups
      graphics.update(delta, this._token);

      // Position the entity
      this._applyTransform(transform);

      this._graphicsPositionDebugDraw();

      this._graphicsContext.opacity = graphics.opacity * ((entity as any).opacity ?? 1);

      // Draw the graphics component
      this._drawGraphicsComponent(graphics);

      // Optionally run the onPostDraw graphics lifecycle draw
      if (graphics.onPostDraw) {
        graphics.onPostDraw(this._graphicsContext, delta);
      }

      this._graphicsContext.restore();

      // Draw the graphics bounds
      this._graphicsBoundsDebugDraw(entity, transform, graphics);

      // Reset the transform back to the original
      this._popCameraTransform(transform);
    }

    this._graphicsContext.flush();
    this._engine.stats.currFrame.graphics.drawnImages = GraphicsDiagnostics.DrawnImagesCount;
    this._engine.stats.currFrame.graphics.drawCalls = GraphicsDiagnostics.DrawCallCount;
  }

  private _clearScreen(): void {
    this._graphicsContext.clear();
  }

  private _isOffscreen(transform: TransformComponent, graphics: GraphicsComponent) {
    if (transform.coordPlane === CoordPlane.World) {
      const graphicsOffscreen = !this._camera.viewport.intersect(graphics.localBounds.translate(transform.pos));
      return graphicsOffscreen;
    } else {
      // TODO sceen coordinates
      return false;
    }
  }

  private _drawGraphicsComponent(graphicsComponent: GraphicsComponent) {
    if (graphicsComponent.visible) {
      // this should be moved to the graphics system
      for (const layer of graphicsComponent.layers.get()) {
        for (const {
          graphic,
          options: { offset, anchor }
        } of layer.graphics) {
          // See https://github.com/excaliburjs/Excalibur/pull/619 for discussion on this formula
          const bounds = graphic.localBounds;
          const offsetX = -bounds.width * graphic.scale.x * anchor.x + offset.x;
          const offsetY = -bounds.height * graphic.scale.y * anchor.y + offset.y;
          graphic?.draw(this._graphicsContext, offsetX + layer.offset.x, offsetY + layer.offset.y);
          if (this._engine?.isDebug) {
            /* istanbul ignore next */
            graphic?.localBounds.translate(vec(offsetX + layer.offset.x, offsetY + layer.offset.y)).draw(this._graphicsContext, Color.Red);
          }
        }
      }
      if (this._engine?.isDebug) {
        /* istanbul ignore next */
        graphicsComponent.localBounds.draw(this._graphicsContext, Color.Red);
      }
    }
  }

  /**
   * This applies the current entity transform to the graphics context
   * @param transform
   */
  private _applyTransform(transform: TransformComponent): void {
    this._graphicsContext.translate(transform.pos.x, transform.pos.y);
    this._graphicsContext.rotate(transform.rotation);
    this._graphicsContext.scale(transform.scale.x, transform.scale.y);
  }

  /**
   * Applies the current camera transform if in world coordinates
   * @param transform
   */
  private _pushCameraTransform(transform: TransformComponent) {
    // Establish camera offset per entity
    if (transform.coordPlane === CoordPlane.World) {
      this._graphicsContext.save();
      if (this._camera) {
        this._camera.draw(this._graphicsContext);
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
      this._graphicsContext.restore();
    }
  }

  /* istanbul ignore next */
  private _graphicsPositionDebugDraw() {
    if (this._engine?.isDebug) {
      this._graphicsContext.debug.drawPoint(Vector.Zero, { color: Color.Yellow, size: 5 });
    }
  }

  /* istanbul ignore next */
  private _graphicsBoundsDebugDraw(
    entity: Entity<GraphicsComponent | TransformComponent>,
    _transform: TransformComponent,
    _graphics: GraphicsComponent
  ) {
    if (this._engine?.isDebug) {
      if (isActor(entity)) {
        const bb = entity.body.collider.localBounds.translate(entity.getWorldPos());
        bb.draw(this._graphicsContext);
      }
    }
  }
}
