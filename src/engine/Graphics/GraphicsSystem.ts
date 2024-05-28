import { ExcaliburGraphicsContext } from './Context/ExcaliburGraphicsContext';
import { Scene } from '../Scene';
import { GraphicsComponent } from './GraphicsComponent';
import { vec, Vector } from '../Math/vector';
import { TransformComponent } from '../EntityComponentSystem/Components/TransformComponent';
import { Entity } from '../EntityComponentSystem/Entity';
import { Camera } from '../Camera';
import { Query, System, SystemPriority, SystemType, World } from '../EntityComponentSystem';
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
import { Graphic } from './Graphic';

export class GraphicsSystem extends System {
  public readonly systemType = SystemType.Draw;
  public priority = SystemPriority.Average;
  private _token = 0;
  private _graphicsContext: ExcaliburGraphicsContext;
  private _camera: Camera;
  private _engine: Engine;
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

  public update(delta: number): void {
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
      const particleOpacity = entity instanceof Particle ? entity.opacity : 1;
      this._graphicsContext.opacity *= graphics.opacity * particleOpacity;

      // Draw the graphics component
      this._drawGraphicsComponent(graphics, transform);

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

  private _drawGraphicsComponent(graphicsComponent: GraphicsComponent, transformComponent: TransformComponent) {
    if (graphicsComponent.visible) {
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

        // TODO move debug code out?
        if (this._engine?.isDebug && this._engine.debug.graphics.showBounds) {
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
                g?.localBounds.translate(offset.add(pos)).draw(this._graphicsContext, this._engine.debug.graphics.boundsColor);
              } else {
                g?.localBounds.translate(pos).draw(this._graphicsContext, this._engine.debug.graphics.boundsColor);
              }
            }
          } else {
            /* istanbul ignore next */
            graphic?.localBounds.translate(offset).draw(this._graphicsContext, this._engine.debug.graphics.boundsColor);
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
      if (transform) {
        let tx = transform.get();
        if (optionalBody) {
          if (this._engine.fixedUpdateFps && optionalBody.__oldTransformCaptured && optionalBody.enableFixedUpdateInterpolate) {
            // Interpolate graphics if needed
            const blend = this._engine.currentFrameLagMs / (1000 / this._engine.fixedUpdateFps);
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
}
