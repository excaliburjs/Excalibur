import { IAudio } from '../../Interfaces/IAudio';
import { Promise } from '../../Promises';
import * as Util from '../../Util/Util';
import { AudioContextOperator } from './AudioContext';
import { obsolete } from '../../Index';

/**
 * Internal class for producing of AudioInstances
 */
/* istanbul ignore next */
export class AudioInstanceFactory {
   public static create(src: string | AudioBuffer): AudioInstance {
      if (typeof src === 'string') {
         return new AudioTagInstance(src);
      }

      if (src instanceof AudioBuffer) {
         return new WebAudioInstance(src);
      }

      return new AudioInstance(src);
   }
}

/**
 * Internal class representing base AudioInstance implementation
 */
/* istanbul ignore next */
export class AudioInstance implements IAudio {
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
      this._volume = Util.clamp(value, 0, 1.0);
   }
   public get volume(): number {
      return this._volume;
   }

   protected _volume = 1;
   protected _loop = true;
   protected _playingPromise: Promise<any>;
   protected _isPlaying = false;
   protected _isPaused = false;
   protected _instance: HTMLAudioElement | AudioBufferSourceNode;

   constructor(protected _src: string | AudioBuffer) {}

   /** @obsolete will be removed in v0.18, use loop */
   @obsolete({message: 'will be removed in v0.18, use loop instead'})
   public setLoop(loop: boolean) {
      this.loop = loop;
   }

   /** @obsolete will be removed in v0.18, use volume */
   @obsolete({message: 'will be removed in v0.18, use volume instead'})
   public setVolume(volume: number) {
      this.volume = volume;
   }

   public isPlaying() {
      return this._isPlaying;
   }

   public pause() {
      if (!this._isPlaying) {
         return;
      }

      this._isPaused = true;
      this._isPlaying = false;
   }

   public stop() {
      if (!this._isPlaying) {
         return;
      }

      this._isPlaying = false;
      this._isPaused = false;
   }

   public play() {
      if (this._isPaused) {
         this._resumePlayBack();
      }

      if (!this._isPlaying) {
         this._startPlayBack();
      }

      return this._playingPromise;
   }

   protected _startPlayBack() {
      this._isPlaying = true;
      this._isPaused = false;
      this._playingPromise = new Promise();
   }

   protected _resumePlayBack() {
      if (!this._isPaused) {
         return;
      }

      this._isPaused = false;
      this._isPlaying = true;
   }

   protected _wireUpOnEnded() {
      if (!this.loop) {
         this._instance.onended = () => this._handleOnEnded();
      }
   }

   protected _handleOnEnded() {
      /**
       * Override me
       */
   }
}

/**
 * Internal class representing a HTML5 audio instance
 */
/* istanbul ignore next */
export class AudioTagInstance extends AudioInstance {
   public set volume(value: number) {
      this._volume = value;
      this._instance.volume = Util.clamp(value, 0, 1.0);
   }

   protected _src: string;
   protected _instance: HTMLAudioElement;

   constructor(src: string) {
      super(src);

      this._instance = new Audio(src);
   }

   public pause() {
      if (!this._isPlaying) {
         return;
      }

      this._instance.pause();
      this._isPaused = true;
      this._isPlaying = false;
   }

   public stop() {
      super.stop();

      this._instance.pause();
      this._instance.currentTime = 0;

      this._handleOnEnded();
   }

   protected _startPlayBack() {
      super._startPlayBack();

      this._instance.load();
      this._instance.loop = this.loop;
      this._instance.play();

      this._wireUpOnEnded();
   }

   protected _resumePlayBack() {
      super._resumePlayBack();

      this._instance.play();
      this._wireUpOnEnded();
   }

   protected _handleOnEnded() {
      this._isPlaying = false;
      this._isPaused = false;
      this._playingPromise.resolve(true);
   }
}

/**
 * Internal class representing a Web Audio AudioBufferSourceNode instance
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
 */
/* istanbul ignore next */
export class WebAudioInstance extends AudioInstance {
   public set volume(value: number) {
      value = Util.clamp(value, 0, 1.0);

      this._volume = value;

      if (this._volumeNode.gain.setTargetAtTime) {
         this._volumeNode.gain.setTargetAtTime(value, this._audioContext.currentTime, 0);
      } else {
         this._volumeNode.gain.value = value;
      }
   }

   private get _playbackRate(): number {
      return (this._instance) ? 1 / (this._instance.playbackRate.value || 1.0) : null;
   }

   protected _src: AudioBuffer;
   protected _instance: AudioBufferSourceNode;
   private _audioContext: AudioContext = AudioContextOperator.getInstance().currentAudioCtxt;
   private _volumeNode = this._audioContext.createGain();
   private _startTime: number;

   /**
    * Current playback offset (in seconds)
    */
   private _currentOffset = 0;

   constructor(_src: AudioBuffer) {
      super(_src);

      this._createNewBufferSource();
   }

   public pause() {
      super.pause();

      this._instance.stop(0);
      // Playback rate will be a scale factor of how fast/slow the audio is being played
      // default is 1.0
      // we need to invert it to get the time scale

      this._setPauseOffset();
   }

   public stop() {
      super.stop();

      this._currentOffset = 0;
      this._instance.stop(0);

      // handler will not be wired up if we were looping
      if (!this._instance.onended) {
         this._handleOnEnded();
      }
   }

   protected _startPlayBack() {
      super._startPlayBack();

      if (!this._instance) {
         this._createNewBufferSource();
      }

      this._rememberStartTime();

      this._volumeNode.connect(this._audioContext.destination);
      this._instance.start(0, 0);
      this._currentOffset = 0;

      this._playingPromise = new Promise();
      this._wireUpOnEnded();
   }

   protected _resumePlayBack() {
      super._resumePlayBack();

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

   protected _handleOnEnded() {
      // pausing calls stop(0) which triggers onended event
      // so we don't "resolve" yet (when we resume we'll try again)
      if (!this._isPaused) {
         this._isPlaying = false;
         this._playingPromise.resolve(true);
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
