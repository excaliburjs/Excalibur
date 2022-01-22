import { ExcaliburGraphicsContext } from './Context/ExcaliburGraphicsContext';
import { Scene } from '../Scene';
import { GraphicsComponent } from './GraphicsComponent';
import { vec } from '../Math/vector';
import { CoordPlane, TransformComponent } from '../EntityComponentSystem/Components/TransformComponent';
import { Entity } from '../EntityComponentSystem/Entity';
import { Camera } from '../Camera';
import { System, SystemType, TagComponent } from '../EntityComponentSystem';
import { Engine } from '../Engine';
import { EnterViewPortEvent, ExitViewPortEvent } from '../Events';
import { GraphicsGroup } from '.';
import { Particle } from '../Particles';

export class GraphicsSystem extends System<TransformComponent | GraphicsComponent> {
  public readonly types = ['ex.transform', 'ex.graphics'] as const;
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

  public sort(a: Entity, b: Entity) {
    return a.get(TransformComponent).z - b.get(TransformComponent).z;
  }

  public update(entities: Entity[], delta: number): void {
    this._token++;
    let transform: TransformComponent;
    let graphics: GraphicsComponent;

    for (const entity of entities) {
      transform = entity.get(TransformComponent);
      graphics = entity.get(GraphicsComponent);

      // Figure out if entities are offscreen
      const entityOffscreen = this._isOffscreen(transform, graphics);
      if (entityOffscreen && !entity.hasTag('offscreen')) {
        entity.eventDispatcher.emit('exitviewport', new ExitViewPortEvent(entity));
        entity.addComponent(new TagComponent('offscreen'));
      }

      if (!entityOffscreen && entity.hasTag('offscreen')) {
        entity.eventDispatcher.emit('enterviewport', new EnterViewPortEvent(entity));
        entity.removeComponent('offscreen');
      }
      // Skip entities that have graphics offscreen
      if (entityOffscreen) {
        continue;
      }

      // This optionally sets our camera based on the entity coord plan (world vs. screen)
      this._pushCameraTransform(transform);

      this._graphicsContext.save();

      // Tick any graphics state (but only once) for animations and graphics groups
      graphics.update(delta, this._token);

      // Position the entity
      this._applyTransform(entity);

      // Optionally run the onPreDraw graphics lifecycle draw
      if (graphics.onPreDraw) {
        graphics.onPreDraw(this._graphicsContext, delta);
      }

      // TODO remove this hack on the particle redo
      const particleOpacity = (entity instanceof Particle) ? entity.opacity : 1;
      this._graphicsContext.opacity = graphics.opacity * particleOpacity;

      // Draw the graphics component
      this._drawGraphicsComponent(graphics);

      // Optionally run the onPostDraw graphics lifecycle draw
      if (graphics.onPostDraw) {
        graphics.onPostDraw(this._graphicsContext, delta);
      }

      this._graphicsContext.restore();

      // Reset the transform back to the original
      this._popCameraTransform(transform);
    }
  }

  private _isOffscreen(transform: TransformComponent, graphics: GraphicsComponent) {
    if (transform.coordPlane === CoordPlane.World) {
      const graphicsOffscreen = !this._camera.viewport.intersect(graphics.localBounds.transform(transform.getGlobalMatrix()));
      return graphicsOffscreen;
    } else {
      // TODO screen coordinates
      return false;
    }
  }

  private _drawGraphicsComponent(graphicsComponent: GraphicsComponent) {
    if (graphicsComponent.visible) {
      // this should be moved to the graphics system
      for (const layer of graphicsComponent.layers.get()) {
        for (const { graphic, options } of layer.graphics) {
          let anchor = graphicsComponent.anchor;
          let offset = graphicsComponent.offset;
          if (options?.anchor) {
            anchor = options.anchor;
          }
          if (options?.offset) {
            offset = options.offset;
          }
          // See https://github.com/excaliburjs/Excalibur/pull/619 for discussion on this formula
          const offsetX = -graphic.width * anchor.x + offset.x;
          const offsetY = -graphic.height * anchor.y + offset.y;

          graphic?.draw(this._graphicsContext, offsetX + layer.offset.x, offsetY + layer.offset.y);

          if (this._engine?.isDebug && this._engine.debug.graphics.showBounds) {
            const offset = vec(offsetX + layer.offset.x, offsetY + layer.offset.y);
            if (graphic instanceof GraphicsGroup) {
              for (const g of graphic.members) {
                g.graphic?.localBounds.translate(offset.add(g.pos)).draw(this._graphicsContext, this._engine.debug.graphics.boundsColor);
              }
            } else {
              /* istanbul ignore next */
              graphic?.localBounds.translate(offset).draw(this._graphicsContext, this._engine.debug.graphics.boundsColor);
            }
          }
        }
      }
    }
  }

  /**
   * This applies the current entity transform to the graphics context
   * @param entity
   */
  private _applyTransform(entity: Entity): void {
    const ancestors = entity.getAncestors();
    for (const ancestor of ancestors) {
      const transform = ancestor?.get(TransformComponent);
      if (transform) {
        this._graphicsContext.translate(transform.pos.x, transform.pos.y);
        this._graphicsContext.scale(transform.scale.x, transform.scale.y);
        this._graphicsContext.rotate(transform.rotation);
      }
    }
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
}
