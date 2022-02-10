import { GraphicsComponent } from "./GraphicsComponent";
import { EnterViewPortEvent, ExitViewPortEvent, } from "../Events";
import { Scene } from "../Scene";
import { Entity } from "../EntityComponentSystem/Entity";
import { TransformComponent, CoordPlane } from "../EntityComponentSystem/Components/TransformComponent";
import { Camera } from "../Camera";
import { System, SystemType } from "../EntityComponentSystem/System"

export class OffscreenSystem extends System<TransformComponent | GraphicsComponent> {
  public readonly types = ["ex.transform", "ex.graphics"] as const;
  public systemType = SystemType.Draw;
  priority: number = -1;
  private _camera: Camera;
  
  public initialize(scene: Scene): void {
    this._camera = scene.camera;
  }

  update(entities: Entity[]): void {
    let transform: TransformComponent;
    let graphics: GraphicsComponent;

    for (const entity of entities) {
      graphics = entity.get(GraphicsComponent);
      transform = entity.get(TransformComponent);

      // Figure out if entities are offscreen
      const entityOffscreen = this._isOffscreen(transform, graphics);
      if (entityOffscreen && !entity.hasTag('ex.offscreen')) {
        entity.eventDispatcher.emit('exitviewport', new ExitViewPortEvent(entity));
        entity.addTag('ex.offscreen');
      }

      if (!entityOffscreen && entity.hasTag('ex.offscreen')) {
        entity.eventDispatcher.emit('enterviewport', new EnterViewPortEvent(entity));
        entity.removeTag('ex.offscreen');
      }
    }
  }

  private _isOffscreen(transform: TransformComponent, graphics: GraphicsComponent) {
    if (transform.coordPlane === CoordPlane.World) {
      const transformedBounds = graphics.localBounds.transform(transform.getGlobalMatrix());
      const graphicsOffscreen = !this._camera.viewport.overlaps(transformedBounds);
      return graphicsOffscreen;
    } else {
      // TODO screen coordinates
      return false;
    }
  }

}