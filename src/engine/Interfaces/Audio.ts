
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
   * Set the playbackRate, default is 1.0 at normal speed.
   * For example 2.0 is double speed, and 0.5 is half speed.
   */
  playbackRate: number;

  /**
   * Whether or not any audio is playing
   */
  isPlaying(): boolean;

  /**
   * Will play the sound or resume if paused
   */
  play(): Promise<any>;

  /**
   * Return the current time the playing track
   */
  getCurrentTime(): number;

  /**
   * Pause the sound
   */
  pause(): void;

  /**
   * Stop playing the sound and reset
   */
  stop(): void;
}
