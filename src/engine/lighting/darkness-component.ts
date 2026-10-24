import { Component } from '../entity-component-system/component';
import { Color } from '../color';

export interface DarknessComponentOptions {
  /**
   * Color of the darkness veil. Default rgb(0, 0, 10)
   */
  color?: Color;
  /**
   * Opacity of the darkness veil (0.0 to 1.0). Default 0.85
   */
  intensity?: number;
  /**
   * Width of the darkness boundary in world pixels. Set to Infinity for global coverage. Default Infinity
   */
  width?: number;
  /**
   * Height of the darkness boundary in world pixels. Set to Infinity for global coverage. Default Infinity
   */
  height?: number;
}

/**
 * Controls the darkness veil drawn over a scene or room by the {@apilink LightingSystem}.
 *
 * With `width`/`height` of `Infinity` (the default) the veil covers the whole screen. With finite
 * dimensions the veil is a "room" rectangle in world pixels centered on the owning entity's position.
 */
export class DarknessComponent extends Component {
  // @ts-ignore
  private static _NAME = 'DarknessComponent';

  public color: Color;
  public intensity: number;
  public width: number;
  public height: number;

  constructor(options?: DarknessComponentOptions) {
    super();
    this.color = options?.color ?? Color.fromRGB(0, 0, 10);
    this.intensity = options?.intensity ?? 0.85;
    this.width = options?.width ?? Infinity;
    this.height = options?.height ?? Infinity;
  }
}
