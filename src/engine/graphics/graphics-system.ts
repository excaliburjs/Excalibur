import type { ExcaliburGraphicsContext } from './context/excalibur-graphics-context';
import type { Scene } from '../scene';
import { GraphicsComponent } from './graphics-component';
import { vec, Vector } from '../math/vector';
import { TransformComponent } from '../entity-component-system/components/transform-component';
import type { Entity } from '../entity-component-system/entity';
import type { Camera } from '../camera';
import type { Query, World } from '../entity-component-system';
import { System, SystemPriority, SystemType } from '../entity-component-system';
import type { Engine } from '../engine';
import { GraphicsGroup } from './graphics-group';
import { ParallaxComponent } from './parallax-component';
import { CoordPlane } from '../math/coord-plane';
import { BodyComponent } from '../collision/body-component';
import { FontCache } from './font-cache';
import { PostDrawEvent, PostTransformDrawEvent, PreDrawEvent, PreTransformDrawEvent } from '../events';
import { Transform } from '../math/transform';
import { blendTransform } from './transform-interpolation';
import { Graphic } from './graphic';

export class GraphicsSystem extends System {
  static priority = SystemPriority.Average;

  public readonly systemType = SystemType.Draw;
  private _token = 0;
  // Set in the initialize
  private _graphicsContext!: ExcaliburGraphicsContext;
  private _camera!: Camera;
  private _engine!: Engine;
  private _sortedTransforms: TransformComponent[] = [];
  query: Query<typeof TransformComponent | typeof GraphicsComponent>;
  public get sortedTransforms() {
    return this._sortedTransforms;
  }

  constructor(public world: World) {
    super();
    this.query = this.world.query([TransformComponent, GraphicsComponent]);
    this.query.entityAdded$.subscribe((e) => {
      const tx = e.get(TransformComponent);
      this._sortedTransforms.push(tx);
      tx.zIndexChanged$.subscribe(this._zIndexUpdate);
      this._zHasChanged = true;
    });
    this.query.entityRemoved$.subscribe((e) => {
      const tx = e.get(TransformComponent);
      tx.zIndexChanged$.unsubscribe(this._zIndexUpdate);
      const index = this._sortedTransforms.indexOf(tx);
      if (index > -1) {
        this._sortedTransforms.splice(index, 1);
      }
    });
  }

  public initialize(world: World, scene: Scene): void {
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
        return a.globalZ - b.globalZ;
      });
      this._zHasChanged = false;
    }
  }

  public update(elapsed: number): void {
    this._token++;
    let graphics: GraphicsComponent;
    FontCache.checkAndClearCache();

    // This is a performance enhancement, most things are in world space
    // so if we can only do this once saves a ton of transform updates
    this._graphicsContext.save();
    if (this._camera) {
      this._camera.draw(this._graphicsContext);
    }
    for (let transformIndex = 0; transformIndex < this._sortedTransforms.length; transformIndex++) {
      const transform = this._sortedTransforms[transformIndex];
      const entity = transform.owner as Entity;

      // If the entity is offscreen skip
      if (entity.hasTag('ex.offscreen')) {
        continue;
      }

      graphics = entity.get(GraphicsComponent);
      // Exit if graphics set to not visible
      if (!graphics.isVisible) {
        continue;
      }

      // Optionally run the onPreTransformDraw graphics lifecycle draw
      if (graphics.onPreTransformDraw) {
        graphics.onPreTransformDraw(this._graphicsContext, elapsed);
      }
      entity.events.emit('pretransformdraw', new PreTransformDrawEvent(this._graphicsContext, elapsed, entity));

      // This optionally sets our camera based on the entity coord plan (world vs. screen)
      if (transform.coordPlane === CoordPlane.Screen) {
        this._graphicsContext.restore();
      }

      this._graphicsContext.save();
      if (transform.coordPlane === CoordPlane.Screen) {
        this._graphicsContext.translate(this._engine.screen.contentArea.left, this._engine.screen.contentArea.top);
      }

      // Tick any graphics state (but only once) for animations and graphics groups
      graphics.update(elapsed, this._token);

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
        graphics.onPreDraw(this._graphicsContext, elapsed);
      }
      entity.events.emit('predraw', new PreDrawEvent(this._graphicsContext, elapsed, entity));

      // this._graphicsContext.opacity *= graphics.opacity;
      this._applyOpacity(entity);

      // Draw the graphics component
      this._drawGraphicsComponent(graphics, transform);

      // Optionally run the onPostDraw graphics lifecycle draw
      if (graphics.onPostDraw) {
        graphics.onPostDraw(this._graphicsContext, elapsed);
      }
      entity.events.emit('postdraw', new PostDrawEvent(this._graphicsContext, elapsed, entity));

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
        graphics.onPostTransformDraw(this._graphicsContext, elapsed);
      }
      entity.events.emit('posttransformdraw', new PostTransformDrawEvent(this._graphicsContext, elapsed, entity));
    }
    this._graphicsContext.restore();
  }

  private _drawGraphicsComponent(graphicsComponent: GraphicsComponent, transformComponent: TransformComponent) {
    if (graphicsComponent.isVisible) {
      const flipHorizontal = graphicsComponent.flipHorizontal;
      const flipVertical = graphicsComponent.flipVertical;

      const graphic = graphicsComponent.current;
      const options = graphicsComponent.currentOptions ?? {};

      if (graphic) {
        let anchor = graphicsComponent.anchor;
        let offset = graphicsComponent.offset;
        let scaleX = 1;
        let scaleY = 1;
        // handle specific overrides
        if (options?.anchor) {
          anchor = options.anchor;
        }
        if (options?.offset) {
          offset = options.offset;
        }
        const globalScale = transformComponent.globalScale;
        scaleX *= graphic.scale.x * globalScale.x;
        scaleY *= graphic.scale.y * globalScale.y;

        // See https://github.com/excaliburjs/Excalibur/pull/619 for discussion on this formula
        const offsetX = -graphic.width * anchor.x + offset.x * scaleX;
        const offsetY = -graphic.height * anchor.y + offset.y * scaleY;

        const oldFlipHorizontal = graphic.flipHorizontal;
        const oldFlipVertical = graphic.flipVertical;
        if (flipHorizontal || flipVertical) {
          // flip any currently flipped graphics
          graphic.flipHorizontal = flipHorizontal ? !oldFlipHorizontal : oldFlipHorizontal;
          graphic.flipVertical = flipVertical ? !oldFlipVertical : oldFlipVertical;
        }

        graphic?.draw(this._graphicsContext, offsetX, offsetY);

        if (flipHorizontal || flipVertical) {
          graphic.flipHorizontal = oldFlipHorizontal;
          graphic.flipVertical = oldFlipVertical;
        }

        // This debug code is in-situ to avoid recalculating the positioning of graphics
        if (this._engine?.isDebug && this._engine.debug.graphics.showBounds) {
          this._graphicsContext.save();
          const offset = vec(offsetX, offsetY);
          if (graphic instanceof GraphicsGroup) {
            for (const member of graphic.members) {
              let g: Graphic;
              let pos: Vector = Vector.Zero;
              if (member instanceof Graphic) {
                g = member;
              } else {
                g = member.graphic;
                pos = member.offset;
              }

              if (graphic.useAnchor) {
                g?.localBounds
                  .translate(offset.add(pos))
                  .debug(this._graphicsContext, { color: this._engine.debug.graphics.boundsColor, dashed: true });
              } else {
                g?.localBounds
                  .translate(pos)
                  .debug(this._graphicsContext, { color: this._engine.debug.graphics.boundsColor, dashed: true });
              }
            }
          } else {
            /* istanbul ignore next */
            graphic?.localBounds
              .translate(offset)
              .debug(this._graphicsContext, { color: this._engine.debug.graphics.boundsColor, dashed: true });
          }
          this._graphicsContext.restore();
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
    for (let i = 0; i < ancestors.length; i++) {
      const ancestor = ancestors[i];
      const transform = ancestor?.get(TransformComponent);
      const optionalBody = ancestor?.get(BodyComponent);
      if (transform) {
        let tx = transform.get();
        if (optionalBody && !optionalBody.isSleeping) {
          if (this._engine.fixedUpdateTimestep && optionalBody.__oldTransformCaptured && optionalBody.enableFixedUpdateInterpolate) {
            // Interpolate graphics if needed
            const blend = this._engine.currentFrameLagMs / this._engine.fixedUpdateTimestep;
            tx = blendTransform(optionalBody.oldTransform, transform.get(), blend, this._targetInterpolationTransform);
          }
        }
        this._graphicsContext.z = transform.globalZ;
        this._graphicsContext.translate(tx.pos.x, tx.pos.y);
        this._graphicsContext.scale(tx.scale.x, tx.scale.y);
        this._graphicsContext.rotate(tx.rotation);
      }
    }
  }

  private _applyOpacity(entity: Entity): void {
    const ancestors = entity.getAncestors();
    for (let i = 0; i < ancestors.length; i++) {
      const ancestor = ancestors[i];
      const maybeGraphics = ancestor?.get(GraphicsComponent);
      this._graphicsContext.opacity *= maybeGraphics?.opacity ?? 1;
    }
  }
}
