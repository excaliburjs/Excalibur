import { ExcaliburGraphicsContext } from './Context/ExcaliburGraphicsContext';
import { Scene } from '../Scene';
import { GraphicsComponent } from './GraphicsComponent';
import { vec, Vector } from '../Math/vector';
import { TransformComponent } from '../EntityComponentSystem/Components/TransformComponent';
import { Entity } from '../EntityComponentSystem/Entity';
import { Camera } from '../Camera';
import { AddedEntity, isAddedSystemEntity, RemovedEntity, System, SystemType } from '../EntityComponentSystem';
import { Engine } from '../Engine';
import { GraphicsGroup } from '.';
import { Particle } from '../Particles';
import { ParallaxComponent } from './ParallaxComponent';
import { CoordPlane } from '../Math/coord-plane';
import { BodyComponent } from '../Collision/BodyComponent';

export class GraphicsSystem extends System<TransformComponent | GraphicsComponent> {
  public readonly types = ['ex.transform', 'ex.graphics'] as const;
  public readonly systemType = SystemType.Draw;
  public priority = 0;
  private _token = 0;
  private _graphicsContext: ExcaliburGraphicsContext;
  private _camera: Camera;
  private _engine: Engine;

  private _sortedTransforms: TransformComponent[] = [];
  public get sortedTransforms() {
    return this._sortedTransforms;
  }

  public initialize(scene: Scene): void {
    this._camera = scene.camera;
    this._engine = scene.engine;
  }

  private _zHasChanged = false;
  private _zIndexUpdate = () => {
    this._zHasChanged = true;
  };

  public preupdate(): void {
    // Graphics context could be switched to fallback in a new frame
    this._graphicsContext = this._engine.graphicsContext;
    if (this._zHasChanged) {
      this._sortedTransforms.sort((a, b) => {
        return a.z - b.z;
      });
      this._zHasChanged = false;
    }
  }

  public notify(entityAddedOrRemoved: AddedEntity | RemovedEntity): void {
    if (isAddedSystemEntity(entityAddedOrRemoved)) {
      const tx = entityAddedOrRemoved.data.get(TransformComponent);
      this._sortedTransforms.push(tx);
      tx.zIndexChanged$.subscribe(this._zIndexUpdate);
      this._zHasChanged = true;
    } else {
      const tx = entityAddedOrRemoved.data.get(TransformComponent);
      tx.zIndexChanged$.unsubscribe(this._zIndexUpdate);
      const index = this._sortedTransforms.indexOf(tx);
      if (index > -1) {
        this._sortedTransforms.splice(index, 1);
      }
    }
  }

  public update(_entities: Entity[], delta: number): void {
    this._token++;
    let graphics: GraphicsComponent;

    // This is a performance enhancement, most things are in world space
    // so if we can only do this once saves a ton of transform updates
    this._graphicsContext.save();
    if (this._camera) {
      this._camera.draw(this._graphicsContext);
    }
    for (const transform of this._sortedTransforms) {
      const entity = transform.owner as Entity;

      // If the entity is offscreen skip
      if (entity.hasTag('ex.offscreen')) {
        continue;
      }

      graphics = entity.get(GraphicsComponent);
      // Exit if graphics set to not visible
      if (!graphics.visible) {
        continue;
      }

      // This optionally sets our camera based on the entity coord plan (world vs. screen)
      if (transform.coordPlane === CoordPlane.Screen) {
        this._graphicsContext.restore();
      }

      this._graphicsContext.save();

      // Tick any graphics state (but only once) for animations and graphics groups
      graphics.update(delta, this._token);

      // Apply parallax
      const parallax = entity.get(ParallaxComponent);
      if (parallax) {
        // We use the Tiled formula
        // https://doc.mapeditor.org/en/latest/manual/layers/#parallax-scrolling-factor
        // cameraPos * (1 - parallaxFactor)
        const oneMinusFactor = Vector.One.sub(parallax.parallaxFactor);
        const parallaxOffset = this._camera.pos.scale(oneMinusFactor);
        this._graphicsContext.translate(parallaxOffset.x, parallaxOffset.y);
      }

      // Position the entity + estimate lag
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

      // Reset the transform back to the original world space
      if (transform.coordPlane === CoordPlane.Screen) {
        this._graphicsContext.save();
        if (this._camera) {
          this._camera.draw(this._graphicsContext);
        }
      }
    }
    this._graphicsContext.restore();
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
      const optionalBody = ancestor?.get(BodyComponent);
      let interpolatedPos = transform.pos;
      let interpolatedScale = transform.scale;
      let interpolatedRotation = transform.rotation;
      if (optionalBody) {
        if (this._engine.fixedUpdateFps &&
            optionalBody.__oldTransformCaptured &&
            optionalBody.enableFixedUpdateInterpolate) {

          // Interpolate graphics if needed
          const blend = this._engine.currentFrameLagMs / (1000 / this._engine.fixedUpdateFps);
          interpolatedPos = transform.pos.scale(blend).add(
            optionalBody.oldPos.scale(1.0 - blend)
          );
          interpolatedScale = transform.scale.scale(blend).add(
            optionalBody.oldScale.scale(1.0 - blend)
          );
          // Rotational lerp https://stackoverflow.com/a/30129248
          const cosine = (1.0 - blend) * Math.cos(optionalBody.oldRotation) + blend * Math.cos(transform.rotation);
          const sine = (1.0 - blend) * Math.sin(optionalBody.oldRotation) + blend * Math.sin(transform.rotation);
          interpolatedRotation = Math.atan2(sine, cosine);
        }
      }

      if (transform) {
        this._graphicsContext.z = transform.z;
        this._graphicsContext.translate(interpolatedPos.x, interpolatedPos.y);
        this._graphicsContext.scale(interpolatedScale.x, interpolatedScale.y);
        this._graphicsContext.rotate(interpolatedRotation);
      }
    }
  }
}
