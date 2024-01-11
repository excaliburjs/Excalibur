import { ExcaliburGraphicsContext } from './Context/ExcaliburGraphicsContext';
import { Scene } from '../Scene';
import { GraphicsComponent } from './GraphicsComponent';
import { vec, Vector } from '../Math/vector';
import { TransformComponent } from '../EntityComponentSystem/Components/TransformComponent';
import { Entity } from '../EntityComponentSystem/Entity';
import { Camera } from '../Camera';
import { AddedEntity, isAddedSystemEntity, RemovedEntity, System, SystemType } from '../EntityComponentSystem';
import { Engine } from '../Engine';
import { GraphicsGroup } from './GraphicsGroup';
import { Particle } from '../Particles'; // this import seems to bomb wallaby
import { ParallaxComponent } from './ParallaxComponent';
import { CoordPlane } from '../Math/coord-plane';
import { BodyComponent } from '../Collision/BodyComponent';
import { FontCache } from './FontCache';
import { PostDrawEvent, PostTransformDrawEvent, PreDrawEvent, PreTransformDrawEvent } from '../Events';
import { Transform } from '../Math/transform';
import { blendTransform } from './TransformInterpolation';

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
    FontCache.checkAndClearCache();

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

      // Optionally run the onPreTransformDraw graphics lifecycle draw
      if (graphics.onPreTransformDraw) {
        graphics.onPreTransformDraw(this._graphicsContext, delta);
      }
      entity.events.emit('pretransformdraw', new PreTransformDrawEvent(this._graphicsContext, delta, entity));

      // This optionally sets our camera based on the entity coord plan (world vs. screen)
      if (transform.coordPlane === CoordPlane.Screen) {
        this._graphicsContext.restore();
      }

      this._graphicsContext.save();
      if (transform.coordPlane === CoordPlane.Screen) {
        this._graphicsContext.translate(this._engine.screen.contentArea.left, this._engine.screen.contentArea.top);
      }

      // Tick any graphics state (but only once) for animations and graphics groups
      graphics.update(delta, this._token);

      // Apply parallax
      const parallax = entity.get(ParallaxComponent);
      if (parallax) {
        // We use the Tiled formula
        // https://doc.mapeditor.org/en/latest/manual/layers/#parallax-scrolling-factor
        // cameraPos * (1 - parallaxFactor)
        const oneMinusFactor = Vector.One.sub(parallax.parallaxFactor);
        const parallaxOffset = this._camera.drawPos.scale(oneMinusFactor);
        this._graphicsContext.translate(parallaxOffset.x, parallaxOffset.y);
      }

      // Position the entity + estimate lag
      this._applyTransform(entity);

      // If there is a material enable it on the context
      if (graphics.material) {
        this._graphicsContext.material = graphics.material;
      }

      // Optionally run the onPreDraw graphics lifecycle draw
      if (graphics.onPreDraw) {
        graphics.onPreDraw(this._graphicsContext, delta);
      }
      entity.events.emit('predraw', new PreDrawEvent(this._graphicsContext, delta, entity));

      // TODO remove this hack on the particle redo
      // Remove this line after removing the wallaby import
      const particleOpacity = (entity instanceof Particle) ? entity.opacity : 1;
      this._graphicsContext.opacity *= graphics.opacity * particleOpacity;

      // Draw the graphics component
      this._drawGraphicsComponent(graphics);

      // Optionally run the onPostDraw graphics lifecycle draw
      if (graphics.onPostDraw) {
        graphics.onPostDraw(this._graphicsContext, delta);
      }
      entity.events.emit('postdraw', new PostDrawEvent(this._graphicsContext, delta, entity));

      this._graphicsContext.restore();

      // Reset the transform back to the original world space
      if (transform.coordPlane === CoordPlane.Screen) {
        this._graphicsContext.save();
        if (this._camera) {
          this._camera.draw(this._graphicsContext);
        }
      }

      // Optionally run the onPreTransformDraw graphics lifecycle draw
      if (graphics.onPostTransformDraw) {
        graphics.onPostTransformDraw(this._graphicsContext, delta);
      }
      entity.events.emit('posttransformdraw', new PostTransformDrawEvent(this._graphicsContext, delta, entity));
    }
    this._graphicsContext.restore();
  }

  private _drawGraphicsComponent(graphicsComponent: GraphicsComponent) {
    if (graphicsComponent.visible) {
      const flipHorizontal = graphicsComponent.flipHorizontal;
      const flipVertical = graphicsComponent.flipVertical;

      for (const layer of graphicsComponent.layers.get()) {
        for (const { graphic, options } of layer.graphics) {
          let anchor = graphicsComponent.anchor;
          let offset = graphicsComponent.offset;

          // handle layer specific overrides
          if (options?.anchor) {
            anchor = options.anchor;
          }
          if (options?.offset) {
            offset = options.offset;
          }
          // See https://github.com/excaliburjs/Excalibur/pull/619 for discussion on this formula
          const offsetX = -graphic.width * anchor.x + offset.x;
          const offsetY = -graphic.height * anchor.y + offset.y;

          const oldFlipHorizontal = graphic.flipHorizontal;
          const oldFlipVertical = graphic.flipVertical;
          if (flipHorizontal || flipVertical) {

            // flip any currently flipped graphics
            graphic.flipHorizontal = flipHorizontal ? !oldFlipHorizontal : oldFlipHorizontal;
            graphic.flipVertical = flipVertical ? !oldFlipVertical : oldFlipVertical;
          }

          graphic?.draw(
            this._graphicsContext,
            offsetX + layer.offset.x,
            offsetY + layer.offset.y);

          if (flipHorizontal || flipVertical) {
            graphic.flipHorizontal = oldFlipHorizontal;
            graphic.flipVertical = oldFlipVertical;
          }

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

  private _targetInterpolationTransform = new Transform();
  /**
   * This applies the current entity transform to the graphics context
   * @param entity
   */
  private _applyTransform(entity: Entity): void {
    const ancestors = entity.getAncestors();
    for (const ancestor of ancestors) {
      const transform = ancestor?.get(TransformComponent);
      const optionalBody = ancestor?.get(BodyComponent);
      let tx = transform.get();
      if (optionalBody) {
        if (this._engine.fixedUpdateFps &&
            optionalBody.__oldTransformCaptured &&
            optionalBody.enableFixedUpdateInterpolate) {
          // Interpolate graphics if needed
          const blend = this._engine.currentFrameLagMs / (1000 / this._engine.fixedUpdateFps);
          tx = blendTransform(optionalBody.oldTransform, transform.get(), blend, this._targetInterpolationTransform);
        }
      }

      if (transform) {
        this._graphicsContext.z = transform.z;
        this._graphicsContext.translate(tx.pos.x, tx.pos.y);
        this._graphicsContext.scale(tx.scale.x, tx.scale.y);
        this._graphicsContext.rotate(tx.rotation);
      }
    }
  }
}
