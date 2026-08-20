import { System, SystemType } from '../entity-component-system/system';
import { SystemPriority } from '../entity-component-system/priority';
import type { World } from '../entity-component-system/world';
import type { Query } from '../entity-component-system/query';
import { PointLightComponent } from './point-light-component';
import { ConeLightComponent } from './cone-light-component';

/**
 * Modulates active light intensities ahead of the lighting render pass
 * utilizing deterministic layered sine waves.
 *
 * Writes {@apilink PointLightComponent.currentIntensity} and {@apilink ConeLightComponent.currentIntensity},
 * so it must run before the {@apilink LightingSystem} rasterizes the frame.
 */
export class FlickerSystem extends System {
  static priority = SystemPriority.Average;
  public readonly systemType = SystemType.Update;

  private _pointQuery!: Query<typeof PointLightComponent>;
  private _coneQuery!: Query<typeof ConeLightComponent>;
  private _elapsed = 0;

  public initialize(world: World): void {
    this._pointQuery = world.query([PointLightComponent]);
    this._coneQuery = world.query([ConeLightComponent]);
  }

  public update(elapsed: number): void {
    this._elapsed += elapsed / 1000;
    const t = this._elapsed;

    for (const entity of this._pointQuery.entities) {
      this._applyFlicker(entity.get(PointLightComponent)!, t);
    }
    for (const entity of this._coneQuery.entities) {
      this._applyFlicker(entity.get(ConeLightComponent)!, t);
    }
  }

  private _applyFlicker(light: PointLightComponent | ConeLightComponent, t: number): void {
    if (!light.enabled) {
      light.currentIntensity = 0;
      return;
    }

    if (!light.flicker) {
      light.currentIntensity = light.intensity;
      return;
    }

    const { speed, amplitude, secondarySpeed } = light.flicker;
    let offset = Math.sin(t * speed * Math.PI * 2) * amplitude;
    if (secondarySpeed) {
      offset += Math.sin(t * secondarySpeed * Math.PI * 2) * amplitude * 0.4;
      offset /= 1.4;
    }
    light.currentIntensity = Math.max(0, light.intensity + offset);
  }
}
