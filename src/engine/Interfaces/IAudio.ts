/// <reference path="../Promises.ts" />

module ex {
   export interface IAudio {
      setVolume(volume: number);
      setLoop(loop: boolean);
      isPlaying(): boolean;
      play(): ex.Promise<any>;
      pause();
      stop();
   }
}