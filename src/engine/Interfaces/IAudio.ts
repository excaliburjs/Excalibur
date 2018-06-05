import { Promise } from './../Promises';

/**
 * Represents an audio control implementation
 */
export interface IAudio {
  /**
   * Whether the audio should loop (repeat forever)
   */
  loop: boolean;
  /**
   * The volume (between 0 and 1)
   */
  volume: number;

  /**
   * Whether the audio should loop (repeat forever)
   * @param loop true to enable loop
   */
  setLoop(loop: boolean): void;

  /**
   * Sets the volume of the sound clip
   * @param volume  A volume value between 0-1.0
   */
  setVolume(value: number): void;

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
