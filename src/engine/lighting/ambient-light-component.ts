import { Component } from '../entity-component-system/component';
import { Color } from '../color';

export interface AmbientLightComponentOptions {
  /**
   * Color of the ambient light, blended into any {@apilink DarknessComponent} veil proportional to `intensity`. Default Color.White
   */
  color?: Color;
  /**
   * Minimum brightness floor (0.0 to 1.0), subtracted from darkness intensity. Default 0.05
   */
  intensity?: number;
  /**
   * Default true
   */
  enabled?: boolean;
}

/**
 * Raises the uniform minimum brightness floor, ensuring absolute darkness is never pitch black.
 *
 * The ambient `color` tints the {@apilink DarknessComponent} veil toward it proportional to `intensity`
 * (e.g. a blue ambient at low intensity produces a moonlit veil).
 *
 * If multiple ambient lights exist in a scene, the last one wins — they are not blended.
 */
export class AmbientLightComponent extends Component {
  public color: Color;
  public intensity: number;
  public enabled: boolean;

  constructor(options?: AmbientLightComponentOptions) {
    super();
    this.color = options?.color ?? Color.White;
    this.intensity = options?.intensity ?? 0.05;
    this.enabled = options?.enabled ?? true;
  }
}
