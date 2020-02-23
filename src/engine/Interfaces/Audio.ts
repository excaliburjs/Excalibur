/**
 * Represents an audio control implementation
 */
export interface Audio {
  /**
   * Whether the audio should loop (repeat forever)
   */
  loop: boolean;
  /**
   * The volume (between 0 and 1)
   */
  volume: number;

  /**
   * Whether or not any audio is playing
   */
  isPlaying(): boolean;

  /**
   * Will play the sound or resume if paused
   */
  play(): Promise<any>;

  /**
   * Pause the sound
   */
  pause(): void;

  /**
   * Stop playing the sound and reset
   */
  stop(): void;
}
