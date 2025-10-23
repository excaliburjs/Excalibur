/**
 * Internal class used to build instances of AudioContext
 */
/* istanbul ignore next */
export class AudioContextFactory {
  private static _INSTANCE?: AudioContext;

  public static create(): AudioContext {
    if (!this._INSTANCE) {
      if ((<any>window).AudioContext || (<any>window).webkitAudioContext) {
        this._INSTANCE = new AudioContext();
      }
    }

    return this._INSTANCE!;
  }

  public static currentTime(): number {
    return AudioContextFactory.create().currentTime;
  }
}
