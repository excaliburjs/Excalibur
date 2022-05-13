import { System, SystemType } from '../EntityComponentSystem/System';
import { Entity } from '../EntityComponentSystem/Entity';
import { TransformComponent } from '../EntityComponentSystem/Components/TransformComponent';
import { IsometricEntityComponent } from './IsometricEntityComponent';


export class IsometricEntitySystem extends System<TransformComponent | IsometricEntityComponent> {
  public readonly types = ['ex.transform', 'ex.isometricentity'] as const;
  public readonly systemType = SystemType.Update;
  priority: number = 99;
  update(entities: Entity[], _delta: number): void {
    let transform: TransformComponent;
    let iso: IsometricEntityComponent;
    for (const entity of entities) {
      transform = entity.get(TransformComponent);
      iso = entity.get(IsometricEntityComponent);

      const maxZindexPerElevation = Math.max(iso.map.columns * iso.map.tileWidth, iso.map.rows * iso.map.tileHeight);

      const newZ = maxZindexPerElevation * iso.elevation + transform.pos.y;
      transform.z = newZ;
    }
  }
}