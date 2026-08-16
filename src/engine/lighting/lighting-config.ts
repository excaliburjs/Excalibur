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
}

export const getDefaultLightingConfig: () => LightingConfig = () => ({
  enabled: false
});
