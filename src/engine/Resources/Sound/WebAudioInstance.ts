import { Audio } from '../../Interfaces/Audio';
import * as Util from '../../Util/Util';
import { AudioContextFactory } from './AudioContext';

/**
 * Internal class representing a Web Audio AudioBufferSourceNode instance
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
 */
export class WebAudioInstance implements Audio {
  private _volume = 1;
  private _duration: number | undefined = undefined;

  private _playingPromise: Promise<boolean>;
  private _playingResolve: (value: boolean) => void;

  private _loop = false;
  public set loop(value: boolean) {
    this._loop = value;

    if (this._instance) {
      this._instance.loop = value;
      this._wireUpOnEnded();
    }
  }
  public get loop(): boolean {
    return this._loop;
  }

  public set volume(value: number) {
    value = Util.clamp(value, 0, 1.0);

    this._volume = value;

    if (this._isPlaying && this._volumeNode.gain.setTargetAtTime) {
      // https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/setTargetAtTime
      // After each .1 seconds timestep, the target value will ~63.2% closer to the target value.
      // This exponential ramp provides a more pleasant transition in gain
      this._volumeNode.gain.setTargetAtTime(value, this._audioContext.currentTime, 0.1);
    } else {
      this._volumeNode.gain.value = value;
    }
  }
  public get volume(): number {
    return this._volume;
  }

  public set duration(value: number | undefined) {
    this._duration = value;
  }

  /**
   * Duration of the sound, in seconds.
   */
  public get duration() {
    return this._duration;
  }

  private get _playbackRate(): number {
    return this._instance ? 1 / (this._instance.playbackRate.value || 1.0) : null;
  }

  private _isPlaying = false;
  private _isPaused = false;
  private _instance: AudioBufferSourceNode;
  private _audioContext: AudioContext = AudioContextFactory.create();
  private _volumeNode = this._audioContext.createGain();
  private _startTime: number;

  /**
   * Current playback offset (in seconds)
   */
  private _currentOffset = 0;

  constructor(private _src: AudioBuffer) {
    this._createNewBufferSource();
  }

  public isPlaying() {
    return this._isPlaying;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public play(playStarted: () => any = () => {}) {
    if (this._isPaused) {
      this._resumePlayBack();
      playStarted();
    }

    if (!this._isPlaying) {
      this._startPlayBack();
      playStarted();
    }

    return this._playingPromise;
  }

  public pause() {
    if (!this._isPlaying) {
      return;
    }

    this._isPaused = true;
    this._isPlaying = false;

    this._instance.stop(0);
    // Playback rate will be a scale factor of how fast/slow the audio is being played
    // default is 1.0
    // we need to invert it to get the time scale

    this._setPauseOffset();
  }

  public stop() {
    if (!this._isPlaying) {
      return;
    }

    this._isPlaying = false;
    this._isPaused = false;

    this._currentOffset = 0;
    this._instance.stop(0);

    // handler will not be wired up if we were looping
    if (!this._instance.onended) {
      this._handleOnEnded();
    }
  }

  private _startPlayBack() {
    this._isPlaying = true;
    this._isPaused = false;
    this._playingPromise = new Promise<boolean>((resolve) => {
      this._playingResolve = resolve;
    });

    if (!this._instance) {
      this._createNewBufferSource();
    }

    this._rememberStartTime();

    this._volumeNode.connect(this._audioContext.destination);
    this._instance.start(0, 0);
    this._currentOffset = 0;

    this._wireUpOnEnded();
  }

  private _resumePlayBack() {
    if (!this._isPaused) {
      return;
    }

    this._isPaused = false;
    this._isPlaying = true;

    // a buffer source can only be started once
    // so we need to dispose of the previous instance before
    // "resuming" the next one
    this._instance.onended = null; // dispose of any previous event handler
    this._createNewBufferSource();

    const duration = this._playbackRate * this._src.duration;
    const restartTime = this._currentOffset % duration;

    this._rememberStartTime(restartTime * -1000);
    this._instance.start(0, restartTime);
    this._wireUpOnEnded();
  }

  private _wireUpOnEnded() {
    if (!this.loop) {
      this._instance.onended = () => this._handleOnEnded();
    }
  }

  private _handleOnEnded() {
    // pausing calls stop(0) which triggers onended event
    // so we don't "resolve" yet (when we resume we'll try again)
    if (!this._isPaused) {
      this._isPlaying = false;
      this._playingResolve(true);
    }
  }

  private _rememberStartTime(amend?: number) {
    this._startTime = new Date().getTime() + (amend | 0);
  }

  private _setPauseOffset() {
    this._currentOffset = ((new Date().getTime() - this._startTime) * this._playbackRate) / 1000; // in seconds
  }

  private _createNewBufferSource() {
    this._instance = this._audioContext.createBufferSource();
    this._instance.buffer = this._src;
    this._instance.loop = this.loop;
    this._instance.playbackRate.setValueAtTime(1.0, 0);

    this._instance.connect(this._volumeNode);
  }
}
