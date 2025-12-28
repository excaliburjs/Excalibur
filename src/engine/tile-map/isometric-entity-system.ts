import { System, SystemType } from '../entity-component-system/system';
import { TransformComponent } from '../entity-component-system/components/transform-component';
import { IsometricEntityComponent } from './isometric-entity-component';
import type { Query, World } from '../entity-component-system';
import { SystemPriority } from '../entity-component-system';

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
