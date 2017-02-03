import { Promise } from './../Promises';

/**
 * Represents an audio control implementation
 */
export interface IAudio {

   /**
    * Set the volume (between 0 and 1)
    */
   setVolume(volume: number): any;

   /**
    * Set whether the audio should loop (repeat forever)
    */
   setLoop(loop: boolean): any;

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
   pause(): any;

   /**
    * Stop playing the sound and reset
    */
   stop(): any;
}