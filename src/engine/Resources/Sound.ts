import { IAudioImplementation, ExResponseType } from '../Interfaces/IAudioImplementation';
import { IAudio } from '../Interfaces/IAudio';
import { Logger } from '../Util/Log';
import * as Util from '../Util/Util';
import { Engine } from '../Engine';
import { Promise } from '../Promises';
import { Resource } from './Index';

// set up audio context reference
// when we introduce multi-tracking, we may need to move this to a factory method
if ((<any>window).AudioContext) {
   var audioContext: AudioContext = new (<any>window).AudioContext();
}

/**
 * Factory method that gets the audio implementation to use
 */
export function getAudioImplementation(): IAudioImplementation {
   if ((<any>window).AudioContext) {
      return new WebAudio();
   } else {
      return new AudioTag();
   }
};

/**
 * An audio implementation for HTML5 audio.
 */
export class AudioTag implements IAudioImplementation {
   public responseType: ExResponseType = 'blob';

   /**
    * Transforms raw Blob data into a object URL for use in audio tag
    */
   public processData(data: Blob): Promise<string> {
      var url = URL.createObjectURL(data);
      return Promise.resolve(url);
   }

   /**
    * Creates a new instance of an audio tag referencing the provided audio URL
    */
   public createInstance(url: string): IAudio {
      return new AudioTagInstance(url);
   }
}

/**
 * An audio implementation for Web Audio API.
 */
export class WebAudio implements IAudioImplementation {
   private _logger = Logger.getInstance();

   public responseType: ExResponseType  = 'arraybuffer';

   /**
    * Processes raw arraybuffer data and decodes into WebAudio buffer (async).
    */
   public processData(data: ArrayBuffer): Promise<AudioBuffer> {
      var complete = new Promise<AudioBuffer>();

      audioContext.decodeAudioData(data,
         (buffer) => {
            complete.resolve(buffer);
         },
         () => {
            this._logger.error('Unable to decode ' +
               ' this browser may not fully support this format, or the file may be corrupt, ' +
               'if this is an mp3 try removing id3 tags and album art from the file.');
            complete.resolve(undefined);
         });

      return complete;
   }

   /**
    * Creates a new WebAudio AudioBufferSourceNode to play a sound instance
    */
   public createInstance(buffer: AudioBuffer): IAudio {
      return new WebAudioInstance(buffer);
   }

   private static _unlocked: boolean = false;

   /**
    * Play an empty sound to unlock Safari WebAudio context. Call this function
    * right after a user interaction event. Typically used by [[PauseAfterLoader]]
    * @source https://paulbakaus.com/tutorials/html5/web-audio-on-ios/
    */
   static unlock() {

      if (WebAudio._unlocked || !audioContext) {
         return;
      }

      // create empty buffer and play it
      var buffer = audioContext.createBuffer(1, 1, 22050);
      var source = audioContext.createBufferSource();
      var ended = false;
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

/**
 * The [[Sound]] object allows games built in Excalibur to load audio
 * components, from soundtracks to sound effects. [[Sound]] is an [[ILoadable]]
 * which means it can be passed to a [[Loader]] to pre-load before a game or level.
 *
 * [[include:Sounds.md]]
 */
export class Sound extends Resource<string|AudioBuffer> implements IAudio {
   public set loop(value: boolean) {
      for (const track of this._tracks) {
         track.loop = value;
      }

      this._loop = value;
      this.logger.debug('Set loop for all instances of sound', this.path, 'to', loop);
   }
   public get loop(): boolean {
      return this._loop;
   }

   /**
    * Populated once loading is complete
    */
   public sound: IAudioImplementation;
   public path: string;
   public volume = 1;

   private _loop = true;
   private _isPaused = false;
   private _tracks: IAudio[] = [];
   private _engine: Engine;
   private _wasPlayingOnHidden: boolean = false;

   /**
    * @param paths A list of audio sources (clip.wav, clip.mp3, clip.ogg) for this audio clip. This is done for browser compatibility.
    */
   constructor(...paths: string[]) {
      super('', '');

      /* Chrome : MP3, WAV, Ogg
         * Firefox : WAV, Ogg,
         * IE : MP3, WAV coming soon
         * Safari MP3, WAV, Ogg
         */
      for (var path of paths) {
         if (Util.Sound.canPlayFile(path)) {
            this.path = path;
            break;
         }
      }

      if (!this.path) {
         this.logger.warn('This browser does not support any of the audio files specified:', paths.join(', '));
         this.logger.warn('Attempting to use', paths[0]);
         this.path = paths[0]; // select the first specified
      }

      this.sound = getAudioImplementation();
   }

   public wireEngine(engine: Engine) {
      if (engine) {
         this._engine = engine;

         this._engine.on('hidden', () => {
            if (engine.pauseAudioWhenHidden && this.isPlaying()) {
               this._wasPlayingOnHidden = true;
               this.pause();
            }
         });

         this._engine.on('visible', () => {
            if (engine.pauseAudioWhenHidden && this._wasPlayingOnHidden) {
               this.play();
               this._wasPlayingOnHidden = false;
            }
         });
      }
   }

   /**
    * Returns how many instances of the sound are currently playing
    */
   public instanceCount(): number {
      return this._tracks.length;
   }

   /**
    * Sets the volume of the sound clip
    * @param volume  A volume value between 0-1.0
    */
   public setVolume(volume: number) {
      for (var track of this._tracks) {
         track.volume = volume;
      }

      this.logger.debug('Set volume for all instances of sound', this.path, 'to', volume);
   }

   /**
    * Indicates whether the clip should loop when complete
    * @param loop  Set the looping flag
    */

   /**
    * Whether or not the sound is playing right now
    */
   public isPlaying(): boolean {
      return this._tracks.some(t => t.isPlaying());
   }

   /**
    * Play the sound, returns a promise that resolves when the sound is done playing
    * An optional volume argument can be passed in to play the sound. Max volume is 1.0
    */
   public play(volume?: number): Promise<boolean> {
      if (!this.isLoaded()) {
         this.logger.warn('Cannot start playing. Resource', this.path, 'is not loaded yet');

         return Promise.resolve(true);
      }

      this.volume = volume || this.volume;

      if (this._isPaused) {
         return this._resume();
      } else {
         return this._start();
      }
   }

   /**
    * Stop the sound, and do not rewind
    */
   public pause() {
      for (const track of this._tracks) {
         track.pause();
      }

      this._isPaused = true;
      this.logger.debug('Paused all instances of sound', this.path);
   }

   /**
    * Stop the sound and rewind
    */
   public stop() {
      this._isPaused = false;

      const tracks = this._tracks.concat([]);

      for (const track of tracks) {
         track.stop();
      }

      this.logger.debug('Stopped all instances of sound', this.path);
   }

   /**
    * Sets raw sound data and returns a Promise that is resolved when sound data is processed
    *
    * @param data The XHR data for the sound implementation to process (Blob or ArrayBuffer)
    */
   public setData(data: any): Promise<any> {
      return this.sound.processData(data).then(data => {
         super.setData(data);

         return data;
      });
   }

   private _resume(): Promise<boolean> {
      if (this._isPaused) {
         const resumed = [];
         // ensure we resume *current* tracks (if paused)
         for (const track of this._tracks) {
            resumed.push(track.play());
         }

         this._isPaused = false;

         this.logger.debug('Resuming paused instances for sound', this.path, this._tracks);
               // resolve when resumed tracks are done
         return Promise.join(resumed);
      } else {
         return Promise.resolve(true);
      }
   }

   private _start(): Promise<boolean> {
      // push a new track
      this._createNewTrack();

      const newTrack = this._tracks[this._tracks.length - 1];

      this.logger.debug('Playing new instance for sound', this.path);

      return newTrack.play().then(() => {
         // when done, remove track
         this._tracks.splice(this._tracks.indexOf(newTrack), 1);

         return true;
      });
   }

   private _createNewTrack() {
      const newTrack = this.sound.createInstance(this.data);

      newTrack.loop = this.loop;
      newTrack.volume = this.volume;

      this._tracks.push(newTrack);
   }
}

export class AudioInstance implements IAudio {
   public set loop(value: boolean) {
      this._loop = value;
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
   protected _boolSrc: string = null;
   protected _audioBufferSrc: AudioBuffer = null;

   constructor(_src: string|AudioBuffer) {
      if (typeof _src === 'string') {
         this._boolSrc = _src;
      }

      if (_src instanceof AudioBuffer) {
         this._audioBufferSrc = _src;
      }
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
      if (!this._isPlaying) {
         this._start();
      }

      if (this._isPaused) {
         this._resume();
      }

      return this._playingPromise;
   }

   protected _start() {
      this._isPlaying = true;
      this._isPaused = false;
   }

   protected _resume() {
      if (!this._isPaused) {
         return;
      }

      this._isPaused = false;
      this._isPlaying = true;
   }
}

/**
 * Internal class representing a HTML5 audio instance
 */
/* istanbul ignore next */
class AudioTagInstance extends AudioInstance {
   public set loop(value: boolean) {
      this._loop = value;

      this._audioElement.loop = value;
      this._wireUpOnEnded();
   }

   public set volume(value: number) {
      this._volume = value;
      this._audioElement.volume = Util.clamp(value, 0, 1.0);
   }

   private _audioElement: HTMLAudioElement;

   constructor(src: string) {
      super(src);
      this._audioElement = new Audio(src);
   }

   public pause() {
      if (!this._isPlaying) {
         return;
      }

      this._audioElement.pause();
      this._isPaused = true;
      this._isPlaying = false;
   }

   public stop() {
      super.stop();

      this._audioElement.pause();
      this._audioElement.currentTime = 0;
      this._handleOnEnded();
   }

   protected _start() {
      super._start();

      this._audioElement.load();
      this._audioElement.loop = this.loop;
      this._audioElement.play();

      this._playingPromise = new Promise();
      this._wireUpOnEnded();
   }

   protected _resume() {
      super._resume();

      this._audioElement.play();
      this._wireUpOnEnded();
   }

   protected _wireUpOnEnded() {
      if (!this.loop) {
         this._audioElement.onended = () => this._handleOnEnded();
      }
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
class WebAudioInstance extends AudioInstance {
   public set volume(value: number) {
      value = Util.clamp(value, 0, 1.0);

      this._volume = value;

      if (this._volumeNode.gain.setTargetAtTime) {
         this._volumeNode.gain.setTargetAtTime(value, audioContext.currentTime, 0);
      } else {
         this._volumeNode.gain.value = value;
      }
   }

   public set loop(value: boolean) {
      this._loop = value;

      if (this._bufferSource) {
         this._bufferSource.loop = value;
         this._wireUpOnEnded();
      }
   }

   private _bufferSource: AudioBufferSourceNode;
   private _volumeNode = audioContext.createGain();
   private _startTime: number;
   /**
    * Current playback offset (in seconds)
    */
   private _currentOffset = 0;

   constructor(_src: AudioBuffer) {
      super(_src);

      this._createBufferSource();
   }

   public setLoop(value: boolean) {
      this._loop = value;


   }

   public pause() {
      super.pause();

      this._bufferSource.stop(0);
      // Playback rate will be a scale factor of how fast/slow the audio is being played
      // default is 1.0
      // we need to invert it to get the time scale
      const pbRate = 1 / (this._bufferSource.playbackRate.value || 1.0);
      this._currentOffset = ((new Date().getTime() - this._startTime) * pbRate) / 1000; // in seconds
   }

   public stop() {
      super.stop();

      this._bufferSource.stop(0);

      // handler will not be wired up if we were looping
      if (!this._bufferSource.onended) {
         this._handleOnEnded();
      }

      this._currentOffset = 0;
   }

   protected _start() {
      super._start();

      if (!this._bufferSource) {
         this._createBufferSource();
      }

      this._volumeNode.connect(audioContext.destination);
      this._bufferSource.start(0, 0);
      this._startTime = new Date().getTime();
      this._currentOffset = 0;

      this._playingPromise = new Promise();
      this._wireUpOnEnded();
   }

   protected _resume() {
      super._resume();

      // a buffer source can only be started once
      // so we need to dispose of the previous instance before
      // "resuming" the next one
      this._bufferSource.onended = null; // dispose of any previous event handler
      this._createBufferSource();

      const duration = (1 / this._bufferSource.playbackRate.value) * this._audioBufferSrc.duration;

      this._bufferSource.start(0, this._currentOffset % duration);
      this._wireUpOnEnded();
   }

   protected _wireUpOnEnded()  {
      if (!this.loop) {
         this._bufferSource.onended = () => this._handleOnEnded();
      }
   }

   protected _handleOnEnded() {
      // pausing calls stop(0) which triggers onended event
      // so we don't "resolve" yet (when we resume we'll try again)
      if (!this._isPaused) {
         this._isPlaying = false;
         this._playingPromise.resolve(true);
      }
   }

   private _createBufferSource() {
      if (this._audioBufferSrc) {
         this._bufferSource = audioContext.createBufferSource();
         this._bufferSource.buffer = this._audioBufferSrc;
         this._bufferSource.loop = this.loop;
         this._bufferSource.playbackRate.setValueAtTime(1.0, 0);

         this._bufferSource.connect(this._volumeNode);
      }
   }
}
