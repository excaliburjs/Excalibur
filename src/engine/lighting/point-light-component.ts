import { Component } from '../entity-component-system/component';
import { Color } from '../color';
import { Logger } from '../util/log';
import type { FlickerOptions } from './flicker-options';

export interface PointLightComponentOptions {
  /**
   * Color of the light. Non-white colors are painted as an additive tint. Default Color.White
   */
  color?: Color;
  /**
   * Base intensity of the light (0.0 to 1.0). Default 1.0
   */
  intensity?: number;
  /**
   * Radius of the light in world pixels. Default 150
   */
  radius?: number;
  /**
   * Optional flicker animation applied by the {@apilink FlickerSystem}
   */
  flicker?: FlickerOptions;
  /**
   * Default true
   */
  enabled?: boolean;
}

/**
 * Emits light uniformly in all directions from the owning entity's position,
 * cutting through any {@apilink DarknessComponent} veil.
 */
export class PointLightComponent extends Component {
  // @ts-ignore
  private static _NAME = 'PointLightComponent';

  public color: Color;
  public intensity: number;
  public radius: number;
  public flicker?: FlickerOptions;
  public enabled: boolean;

  private _currentIntensity: number | null = null;
  /**
   * Runtime intensity after flicker calculations are applied, written by the {@apilink FlickerSystem}.
   * Until a {@apilink FlickerSystem} writes a value (e.g. a {@apilink LightingSystem} added manually
   * without one), reads track the live {@apilink PointLightComponent.intensity} value.
   */
  public get currentIntensity(): number {
    return this._currentIntensity ?? this.intensity;
  }
  public set currentIntensity(value: number) {
    this._currentIntensity = value;
  }

  constructor(options?: PointLightComponentOptions) {
    super();
    this.color = options?.color ?? Color.White;
    this.intensity = options?.intensity ?? 1.0;
    this.radius = options?.radius ?? 150;
    this.flicker = options?.flicker;
    this.enabled = options?.enabled ?? true;
    if (process.env.NODE_ENV === 'development') {
      if (this.radius < 0 || this.intensity < 0) {
        Logger.getInstance().warn(
          `PointLightComponent created with negative radius (${this.radius}) or intensity (${this.intensity}), this is likely a bug`
        );
      }
    }
  }
}
