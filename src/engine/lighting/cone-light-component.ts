import { Component } from '../entity-component-system/component';
import { Color } from '../color';
import { Logger } from '../util/log';
import type { FlickerOptions } from './flicker-options';
import type { PointLightComponentOptions } from './point-light-component';

export interface ConeLightComponentOptions extends PointLightComponentOptions {
  /**
   * Radius of the light in world pixels. Default 200
   */
  radius?: number;
  /**
   * Total angle arc of the wedge in radians. Default Math.PI / 3
   */
  angle?: number;
  /**
   * Heading angle in radians relative to the owning entity's world rotation
   * (0 = Right when the entity is unrotated). Default 0
   */
  direction?: number;
  /**
   * Edge smoothing ratio. 0.0 represents hard cuts, 1.0 represents full dissipation. Default 0.25
   */
  softness?: number;
}

/**
 * Emits light restricted to a directional angular wedge,
 * cutting through any {@apilink DarknessComponent} veil.
 */
export class ConeLightComponent extends Component {
  // @ts-ignore
  private static _NAME = 'ConeLightComponent';

  public color: Color;
  public intensity: number;
  public radius: number;
  public angle: number;
  public direction: number;
  public softness: number;
  public flicker?: FlickerOptions;
  public enabled: boolean;

  private _currentIntensity: number | null = null;
  /**
   * Runtime intensity after flicker calculations are applied, written by the {@apilink FlickerSystem}.
   * Until a {@apilink FlickerSystem} writes a value (e.g. a {@apilink LightingSystem} added manually
   * without one), reads track the live {@apilink ConeLightComponent.intensity} value.
   */
  public get currentIntensity(): number {
    return this._currentIntensity ?? this.intensity;
  }
  public set currentIntensity(value: number) {
    this._currentIntensity = value;
  }

  constructor(options?: ConeLightComponentOptions) {
    super();
    this.color = options?.color ?? Color.White;
    this.intensity = options?.intensity ?? 1.0;
    this.radius = options?.radius ?? 200;
    this.angle = options?.angle ?? Math.PI / 3;
    this.direction = options?.direction ?? 0;
    this.softness = options?.softness ?? 0.25;
    this.flicker = options?.flicker;
    this.enabled = options?.enabled ?? true;
    if (process.env.NODE_ENV === 'development') {
      if (this.radius < 0 || this.intensity < 0) {
        Logger.getInstance().warn(
          `ConeLightComponent created with negative radius (${this.radius}) or intensity (${this.intensity}), this is likely a bug`
        );
      }
      if (this.softness < 0 || this.softness > 1) {
        Logger.getInstance().warn(`ConeLightComponent softness (${this.softness}) should be between 0.0 and 1.0`);
      }
    }
  }
}
