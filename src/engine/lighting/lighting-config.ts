import type { DeepRequired } from '../util/required';

/**
 * Lighting simulation configuration, normalized from {@apilink EngineOptions.lighting}
 */
export interface LightingConfig {
  /**
   * Enables the scene {@apilink LightingSystem} and {@apilink FlickerSystem}. Default false.
   *
   * The lighting overlay is rendered with the 2D Canvas API and re-uploaded to the GPU every frame,
   * which carries a performance penalty — this is why lighting is opt-in.
   */
  enabled: boolean;
  /**
   * The z-index of the provisioned lighting overlay. Default 100.
   *
   * Overridden per-instance by {@apilink LightingSystemOptions.zIndex}.
   */
  zIndex?: number;
  /**
   * World-pixel padding added around the camera frustum when culling lights/occluders. Default 64.
   */
  cullPadding?: number;
  /**
   * Ambient brightness floor (0.0 to 1.0) assumed when no {@apilink AmbientLightComponent} is present
   * in the scene. Default 0.05.
   */
  ambientIntensity?: number;
  /**
   * Fraction of a light's intensity used when painting its colored tint (0.0 to 1.0). Default 0.35.
   */
  tintAlphaFactor?: number;
  /**
   * Occluder shadow radial gradient opacity at the occluder (near) edge (0.0 to 1.0). Default 0.92.
   */
  shadowNearOpacity?: number;
  /**
   * Occluder shadow radial gradient opacity at 40% of the shadow's reach (0.0 to 1.0). Default 0.6.
   */
  shadowMidOpacity?: number;
}

export const getDefaultLightingConfig: () => DeepRequired<LightingConfig> = () => ({
  enabled: false,
  zIndex: 100,
  cullPadding: 64,
  ambientIntensity: 0.05,
  tintAlphaFactor: 0.35,
  shadowNearOpacity: 0.92,
  shadowMidOpacity: 0.6
});
