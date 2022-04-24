import { Camera } from '../Camera';
import { Entity, System, SystemType, TransformComponent } from '../EntityComponentSystem';
import { Scene } from '../Scene';
import { ParallaxComponent } from './ParallaxComponent';


export class ParallaxSystem extends System<TransformComponent | ParallaxComponent> {
  public readonly types = ['ex.transform', 'ex.parallax'] as const;
  priority: number = -2;
  systemType = SystemType.Draw;
  camera: Camera;

  initialize(scene: Scene): void {
    this.camera = scene.camera;
  }

  update(entities: Entity[], _delta: number): void {
    let transform: TransformComponent;
    let parallax: ParallaxComponent;
    for (const entity of entities) {
      transform = entity.get(TransformComponent);
      parallax = entity.get(ParallaxComponent);

      if (!parallax.startingPosition) {
        parallax.startingPosition = transform.pos.clone();
      }

      transform.pos = parallax.startingPosition.add(this.camera.pos.scale(parallax.parallaxFactor));
    }
  }
}