
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
   * Returns if the audio is paused
   */
  isPaused(): boolean;

  /**
   * Will play the sound or resume if paused
   */
  play(): Promise<any>;

  /**
   * Seek to a position (in seconds) in the audio
   * @param position
   */
  seek(position: number): void;

  /**
   * Return the duration of the sound
   */
  getTotalPlaybackDuration(): number;

  /**
   * Return the current playback time of the playing track in seconds from the start
   */
  getPlaybackPosition(): number;

  /**
   * Pause the sound
   */
  pause(): void;

  /**
   * Stop playing the sound and reset
   */
  stop(): void;
}
