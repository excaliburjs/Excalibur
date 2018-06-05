/**
 * Internal class used to build instances of AudioContext
 */
/* istanbul ignore next */
export class AudioContextFactory {
  private static _INSTANCE: AudioContext = null;

  public static create(): AudioContext {
    if (!this._INSTANCE) {
      if ((<any>window).AudioContext || (<any>window).webkitAudioContext) {
        this._INSTANCE = new (<any>window).AudioContext() || new (<any>window).webkitAudioContext();
      }
    }

    return this._INSTANCE;
  }
}
