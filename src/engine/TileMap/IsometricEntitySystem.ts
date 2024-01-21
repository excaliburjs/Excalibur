import { System, SystemType } from '../EntityComponentSystem/System';
import { TransformComponent } from '../EntityComponentSystem/Components/TransformComponent';
import { IsometricEntityComponent } from './IsometricEntityComponent';
import { SystemPriority, World } from '../EntityComponentSystem';


export class IsometricEntitySystem extends System {
  public readonly systemType = SystemType.Update;
  priority: number = SystemPriority.Lower;
  query = this.world.query([TransformComponent, IsometricEntityComponent]);
  constructor(public world: World) {
    super();
  }

  update(): void {
    let transform: TransformComponent;
    let iso: IsometricEntityComponent;
    for (const entity of this.query.entities) {
      transform = entity.get(TransformComponent);
      iso = entity.get(IsometricEntityComponent);

      const maxZindexPerElevation = Math.max(iso.columns * iso.tileWidth, iso.rows * iso.tileHeight);

      const newZ = maxZindexPerElevation * iso.elevation + transform.pos.y;
      transform.z = newZ;
    }
  }
}