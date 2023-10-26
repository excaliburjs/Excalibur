import { GraphicsComponent } from './GraphicsComponent';
import { EnterViewPortEvent, ExitViewPortEvent } from '../Events';
import { Scene } from '../Scene';
import { Screen } from '../Screen';
import { Entity } from '../EntityComponentSystem/Entity';
import { TransformComponent } from '../EntityComponentSystem/Components/TransformComponent';
import { Camera } from '../Camera';
import { System, SystemType } from '../EntityComponentSystem/System';
import { ParallaxComponent } from './ParallaxComponent';
import { Vector } from '../Math/vector';
import { CoordPlane } from '../Math/coord-plane';
import { BoundingBox } from '../Collision/BoundingBox';

export class OffscreenSystem extends System<TransformComponent | GraphicsComponent> {
  public readonly types = ['ex.transform', 'ex.graphics'] as const;
  public systemType = SystemType.Draw;
  priority: number = -1;
  private _camera: Camera;
  private _screen: Screen;
  private _worldBounds: BoundingBox;

  public initialize(scene: Scene): void {
    this._camera = scene.camera;
    this._screen = scene.engine.screen;
  }

  update(entities: Entity[]): void {
    this._worldBounds = this._screen.getWorldBounds();
    let transform: TransformComponent;
    let graphics: GraphicsComponent;
    let maybeParallax: ParallaxComponent;

    for (const entity of entities) {
      graphics = entity.get(GraphicsComponent);
      transform = entity.get(TransformComponent);
      maybeParallax = entity.get(ParallaxComponent);

      let parallaxOffset: Vector;
      if (maybeParallax) {
        // We use the Tiled formula
        // https://doc.mapeditor.org/en/latest/manual/layers/#parallax-scrolling-factor
        // cameraPos * (1 - parallaxFactor)
        const oneMinusFactor = Vector.One.sub(maybeParallax.parallaxFactor);
        parallaxOffset = this._camera.pos.scale(oneMinusFactor);
      }

      // Figure out if entities are offscreen
      const entityOffscreen = this._isOffscreen(transform, graphics, parallaxOffset);
      if (entityOffscreen && !entity.hasTag('ex.offscreen')) {
        entity.events.emit('exitviewport', new ExitViewPortEvent(entity));
        entity.addTag('ex.offscreen');
      }

      if (!entityOffscreen && entity.hasTag('ex.offscreen')) {
        entity.events.emit('enterviewport', new EnterViewPortEvent(entity));
        entity.removeTag('ex.offscreen');
      }
    }
  }

  private _isOffscreen(transform: TransformComponent, graphics: GraphicsComponent, parallaxOffset: Vector) {
    if (transform.coordPlane === CoordPlane.World) {
      let bounds = graphics.localBounds;
      if (parallaxOffset) {
        bounds = bounds.translate(parallaxOffset);
      }
      const transformedBounds = bounds.transform(transform.get().matrix);
      const graphicsOffscreen = !this._worldBounds.overlaps(transformedBounds);
      return graphicsOffscreen;
    } else {
      // TODO screen coordinates
      return false;
    }
  }

}