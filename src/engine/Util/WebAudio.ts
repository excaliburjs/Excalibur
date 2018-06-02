import { AudioContextFactory } from '../Resources/Sound/AudioContext';

export class WebAudio {
   private static _unlocked: boolean = false;

   /**
    * Play an empty sound to unlock Safari WebAudio context. Call this function
    * right after a user interaction event. Typically used by [[PauseAfterLoader]]
    * @source https://paulbakaus.com/tutorials/html5/web-audio-on-ios/
    */
   static unlock() {

      if (WebAudio._unlocked || !AudioContextFactory.create()) {
         return;
      }

      const audioContext = AudioContextFactory.create();
      // create empty buffer and play it
      const buffer = audioContext.createBuffer(1, 1, 22050);
      const source = audioContext.createBufferSource();
      let ended = false;

      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.onended = () => ended = true;

      if ((<any>source).noteOn) {
         // deprecated
         (<any>source).noteOn(0);
      } else {
         source.start(0);
      }

      // by checking the play state after some time, we know if we're really unlocked
      setTimeout(function () {
         if ((<any>source).playbackState) {
            var legacySource = (<any>source);
            if (legacySource.playbackState === legacySource.PLAYING_STATE ||
               legacySource.playbackState === legacySource.FINISHED_STATE) {
               WebAudio._unlocked = true;
            }
         } else {
            if (audioContext.currentTime > 0 || ended) {
               WebAudio._unlocked = true;
            }
         }
      }, 0);

   }

   static isUnlocked() {
      return this._unlocked;
   }
}