import { System, SystemType } from '../EntityComponentSystem/System';
import { TransformComponent } from '../EntityComponentSystem/Components/TransformComponent';
import { IsometricEntityComponent } from './IsometricEntityComponent';
import { Query, SystemPriority, World } from '../EntityComponentSystem';

export class IsometricEntitySystem extends System {
  static priority: number = SystemPriority.Lower;

  public readonly systemType = SystemType.Update;
  query: Query<typeof TransformComponent | typeof IsometricEntityComponent>;
  constructor(public world: World) {
    super();
    this.query = this.world.query([TransformComponent, IsometricEntityComponent]);
  }

  update(): void {
    let transform: TransformComponent;
    let iso: IsometricEntityComponent;
    for (let i = 0; i < this.query.entities.length; i++) {
      const entity = this.query.entities[i];
      transform = entity.get(TransformComponent);
      iso = entity.get(IsometricEntityComponent);

      const maxZindexPerElevation = Math.max(iso.columns * iso.tileWidth, iso.rows * iso.tileHeight);

      const newZ = maxZindexPerElevation * iso.elevation + transform.pos.y;
      transform.z = newZ;
    }
  }
}
