/**
 * Options for light flicker driven by the {@apilink FlickerSystem} using deterministic layered sine waves.
 */
export interface FlickerOptions {
  /**
   * Frequency of the flicker oscillation in Hz.
   */
  frequency: number;
  /**
   * Maximum deviation from base intensity (0.0 to 1.0).
   */
  amplitude: number;
  /**
   * Optional secondary wave frequency for asymmetrical, organic modulation.
   */
  secondaryFrequency?: number;
}
