/// <reference path="../Promises.ts" />

module ex {

   /**
    * Represents an audio control implementation
    */
   export interface IAudio {

      /**
       * Set the volume (between 0 and 1)
       */
      setVolume(volume: number);

      /**
       * Set whether the audio should loop (repeat forever)
       */
      setLoop(loop: boolean);

      /**
       * Whether or not any audio is playing
       */
      isPlaying(): boolean;

      /**
       * Will play the sound or resume if paused
       */
      play(): ex.Promise<any>;

      /**
       * Pause the sound
       */
      pause();

      /**
       * Stop playing the sound and reset
       */
      stop();
   }
}