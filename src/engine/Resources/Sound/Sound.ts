import { ExResponse } from '../../Interfaces/AudioImplementation';
import type { Audio } from '../../Interfaces/Audio';
import type { Engine } from '../../Engine';
import { Resource } from '../Resource';
import { WebAudioInstance } from './WebAudioInstance';
import { AudioContextFactory } from './AudioContext';
import { NativeSoundEvent, NativeSoundProcessedEvent } from '../../Events/MediaEvents';
import { canPlayFile } from '../../Util/Sound';
import type { Loadable } from '../../Interfaces/Index';
import { Logger } from '../../Util/Log';
import type { EventKey, Handler, Subscription } from '../../EventEmitter';
import { EventEmitter } from '../../EventEmitter';

export interface SoundEvents {
  volumechange: NativeSoundEvent;
  processed: NativeSoundProcessedEvent;
  pause: NativeSoundEvent;
  stop: NativeSoundEvent;
  playbackend: NativeSoundEvent;
  resume: NativeSoundEvent;
  playbackstart: NativeSoundEvent;
}

export const SoundEvents = {
  VolumeChange: 'volumechange',
  Processed: 'processed',
  Pause: 'pause',
  Stop: 'stop',
  PlaybackEnd: 'playbackend',
  Resume: 'resume',
  PlaybackStart: 'playbackstart'
};

export interface SoundOptions {
  /**
   * @param paths A list of audio sources (clip.wav, clip.mp3, clip.ogg) for this audio clip. This is done for browser compatibility.
   */
  paths: string[];
  /**
   * Optionally bust the cache on load
   *
   * Default is false
   */
  bustCache?: boolean;
  /**
   * [0-1] 0% to 100%
   *
   * By default 1 (100%)
   */
  volume?: number;
  /**
   * Loop infinitely
   */
  loop?: boolean;
  /**
   * Multiplyer
   *
   * By default 1
   */
  playbackRate?: number;
  /**
   * Seconds?
   *
   * By default unset, will play the natural length of the clip
   */
  duration?: number;

  /**
   * Advance to a position in the audio clip
   */
  position?: number;
}

export interface PlayOptions {
  /**
   * Volume to play between [0, 1]
   */
  volume?: number;

  /**
   * Schedule time to play in ms
   *
   * Compute using the audio context
   *
   * ```typescript
   * const sound: Sound = ...;
   * const oneThousandMillisecondsFromNow = AudioContextFactory.currentTime + 1000;
   *
   * sound.play({ scheduledStart: oneThousandMillisecondsFromNow });
   *
   * ```
   */
  scheduledStartTime?: number;
}

function isSoundOptions(x: any): x is SoundOptions[] {
  return !!x[0]?.paths;
}

/**
 * The {@apilink Sound} object allows games built in Excalibur to load audio
 * components, from soundtracks to sound effects. {@apilink Sound} is an {@apilink Loadable}
 * which means it can be passed to a {@apilink Loader} to pre-load before a game or level.
 */
export class Sound implements Audio, Loadable<AudioBuffer> {
  public events = new EventEmitter<SoundEvents>();
  public logger: Logger = Logger.getInstance();
  public data!: AudioBuffer;
  private _resource: Resource<ArrayBuffer>;

  public position: number | undefined;
  /**
   * Indicates whether the clip should loop when complete
   * @param value  Set the looping flag
   */
  public set loop(value: boolean) {
    this._loop = value;

    for (const track of this._tracks) {
      track.loop = this._loop;
    }

    this.logger.debug('Set loop for all instances of sound', this.path, 'to', this._loop);
  }
  public get loop(): boolean {
    return this._loop;
  }

  public set volume(value: number) {
    this._volume = value;

    for (const track of this._tracks) {
      track.volume = this._volume;
    }

    this.events.emit('volumechange', new NativeSoundEvent(this));

    this.logger.debug('Set loop for all instances of sound', this.path, 'to', this._volume);
  }
  public get volume(): number {
    return this._volume;
  }

  private _duration: number | undefined;
  /**
   * Get the duration that this audio should play. If unset the total natural playback duration will be used.
   */
  public get duration(): number | undefined {
    return this._duration;
  }
  /**
   * Set the duration that this audio should play. If unset the total natural playback duration will be used.
   *
   * Note: if you seek to a specific point the duration will start from that point, for example
   *
   * If you have a 10 second clip, seek to 5 seconds, then set the duration to 2, it will play the clip from 5-7 seconds.
   */
  public set duration(duration: number | undefined) {
    this._duration = duration;
  }

  /**
   * Return array of Current AudioInstances playing or being paused
   */
  public get instances(): Audio[] {
    return this._tracks;
  }

  public get path() {
    return this._resource.path;
  }

  public set path(val: string) {
    this._resource.path = val;
  }

  /**
   * Should excalibur add a cache busting querystring? By default false.
   * Must be set before loading
   */
  public get bustCache() {
    return this._resource.bustCache;
  }

  public set bustCache(val: boolean) {
    this._resource.bustCache = val;
  }

  public scheduledStart = 0;

  private _loop = false;
  private _volume = 1;
  private _isStopped = false;
  // private _isPaused = false;
  private _tracks: WebAudioInstance[] = [];
  private _engine?: Engine;
  private _wasPlayingOnHidden: boolean = false;
  private _playbackRate = 1.0;
  private _audioContext = AudioContextFactory.create();

  /**
   * @param paths A list of audio sources (clip.wav, clip.mp3, clip.ogg) for this audio clip. This is done for browser compatibility.
   */

  constructor(options: SoundOptions);
  constructor(...paths: string[]);
  constructor(...pathsOrSoundOption: string[] | SoundOptions[]) {
    let options: SoundOptions;
    if (isSoundOptions(pathsOrSoundOption)) {
      options = pathsOrSoundOption[0];
    } else {
      options = {
        paths: pathsOrSoundOption as string[]
      };
    }
    this._resource = new Resource('', ExResponse.type.arraybuffer);

    const { volume, position, playbackRate, loop, bustCache, duration } = options;

    this.volume = volume ?? this.volume;
    this.playbackRate = playbackRate ?? this.playbackRate;
    this.loop = loop ?? this.loop;
    this.duration = duration ?? this.duration;
    this.bustCache = bustCache ?? this.bustCache;
    this.position = position ?? this.position;

    /**
     * Chrome : MP3, WAV, Ogg
     * Firefox : WAV, Ogg,
     * IE : MP3, WAV coming soon
     * Safari MP3, WAV, Ogg
     */
    for (const path of options.paths) {
      if (canPlayFile(path)) {
        this.path = path;
        break;
      }
    }

    if (!this.path) {
      this.logger.warn('This browser does not support any of the audio files specified:', options.paths.join(', '));
      this.logger.warn('Attempting to use', options.paths[0]);
      this.path = options.paths[0]; // select the first specified
    }
  }

  public isLoaded() {
    return !!this.data;
  }

  public async load(): Promise<AudioBuffer> {
    if (this.data) {
      return this.data;
    }
    const arraybuffer = await this._resource.load();
    const audiobuffer = await this.decodeAudio(arraybuffer.slice(0));
    this._duration = this._duration ?? audiobuffer?.duration ?? undefined;
    this.events.emit('processed', new NativeSoundProcessedEvent(this, audiobuffer));
    return (this.data = audiobuffer);
  }

  public async decodeAudio(data: ArrayBuffer): Promise<AudioBuffer> {
    try {
      return await this._audioContext.decodeAudioData(data.slice(0));
    } catch (e) {
      this.logger.error(
        'Unable to decode ' +
          ' this browser may not fully support this format, or the file may be corrupt, ' +
          'if this is an mp3 try removing id3 tags and album art from the file.'
      );
      return await Promise.reject();
    }
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
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          this.play();
          this._wasPlayingOnHidden = false;
        }
      });

      this._engine.on('start', () => {
        this._isStopped = false;
      });

      this._engine.on('stop', () => {
        this.stop();
        this._isStopped = true;
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
   * Whether or not the sound is playing right now
   */
  public isPlaying(): boolean {
    return this._tracks.some((t) => t.isPlaying());
  }

  public isPaused(): boolean {
    return this._tracks.some((t) => t.isPaused());
  }

  public isStopped(): boolean {
    return this._tracks.some((t) => t.isStopped());
  }

  /**
   * Play the sound, returns a promise that resolves when the sound is done playing
   * An optional volume argument can be passed in to play the sound. Max volume is 1.0
   */
  public play(volumeOrConfig?: number | PlayOptions): Promise<boolean> {
    if (!this.isLoaded()) {
      this.logger.warn('Cannot start playing. Resource', this.path, 'is not loaded yet');

      return Promise.resolve(true);
    }

    if (this._isStopped) {
      this.logger.warn('Cannot start playing. Engine is in a stopped state.');
      return Promise.resolve(false);
    }

    let scheduledStart = 0;
    if (volumeOrConfig instanceof Object) {
      const { volume, scheduledStartTime } = volumeOrConfig;
      scheduledStart = scheduledStartTime ?? scheduledStart;
      this.volume = volume ?? this.volume;
    } else {
      this.volume = volumeOrConfig ?? this.volume;
    }

    if (this.isPaused()) {
      return this._resumePlayback();
    } else {
      if (this.position) {
        this.seek(this.position);
      }
      return this._startPlayback(scheduledStart);
    }
  }

  /**
   * Stop the sound, and do not rewind
   */
  public pause() {
    if (!this.isPlaying()) {
      return;
    }

    for (const track of this._tracks) {
      track.pause();
    }

    this.events.emit('pause', new NativeSoundEvent(this));

    this.logger.debug('Paused all instances of sound', this.path);
  }

  /**
   * Stop the sound if it is currently playing and rewind the track. If the sound is not playing, rewinds the track.
   */
  public stop() {
    for (const track of this._tracks) {
      track.stop();
    }

    this.events.emit('stop', new NativeSoundEvent(this));

    this._tracks.length = 0;
    this.logger.debug('Stopped all instances of sound', this.path);
  }

  public get playbackRate(): number {
    return this._playbackRate;
  }

  public set playbackRate(playbackRate: number) {
    this._playbackRate = playbackRate;
    this._tracks.forEach((t) => {
      t.playbackRate = this._playbackRate;
    });
  }

  public seek(position: number, trackId = 0) {
    if (this._tracks.length === 0) {
      this._getTrackInstance(this.data);
    }

    this._tracks[trackId].seek(position);
  }

  public getTotalPlaybackDuration() {
    if (!this.isLoaded()) {
      this.logger.warnOnce(
        `Sound from ${this.path} is not loaded, cannot return total playback duration.` +
          `Did you forget to add Sound to a loader? https://excaliburjs.com/docs/loaders/`
      );
      return 0;
    }
    return this.data.duration;
  }

  /**
   * Return the current playback time of the playing track in seconds from the start.
   *
   * Optionally specify the track to query if multiple are playing at once.
   * @param trackId
   */
  public getPlaybackPosition(trackId = 0) {
    if (this._tracks.length) {
      return this._tracks[trackId].getPlaybackPosition();
    }
    return 0;
  }

  /**
   * Get Id of provided AudioInstance in current trackList
   * @param track {@apilink Audio} which Id is to be given
   */
  public getTrackId(track: WebAudioInstance): number {
    return this._tracks.indexOf(track);
  }

  private async _resumePlayback(scheduledStart: number = 0): Promise<boolean> {
    if (this.isPaused()) {
      const resumed: Promise<boolean>[] = [];
      // ensure we resume *current* tracks (if paused)
      for (const track of this._tracks) {
        track.scheduledStart = scheduledStart;
        resumed.push(
          track.play().then(() => {
            this._tracks.splice(this.getTrackId(track), 1);
            return true;
          })
        );
      }

      this.events.emit('resume', new NativeSoundEvent(this));

      this.logger.debug('Resuming paused instances for sound', this.path, this._tracks);
      // resolve when resumed tracks are done
      await Promise.all(resumed);
    }
    return true;
  }

  /**
   * Starts playback, returns a promise that resolves when playback is complete
   */
  private async _startPlayback(scheduledStart: number = 0): Promise<boolean> {
    const track = this._getTrackInstance(this.data);
    track.scheduledStart = scheduledStart;

    const complete = await track.play(() => {
      this.events.emit('playbackstart', new NativeSoundEvent(this, track));
      this.logger.debug('Playing new instance for sound', this.path);
    });

    this.events.emit('playbackend', new NativeSoundEvent(this, track));

    // cleanup any done tracks
    const trackId = this.getTrackId(track);
    if (trackId !== -1) {
      this._tracks.splice(trackId, 1);
    }

    return complete;
  }

  private _getTrackInstance(data: AudioBuffer): WebAudioInstance {
    const newTrack = new WebAudioInstance(data);

    newTrack.loop = this.loop;
    newTrack.volume = this.volume;
    newTrack.duration = this.duration ?? 0;
    newTrack.playbackRate = this._playbackRate;

    this._tracks.push(newTrack);

    return newTrack;
  }

  public emit<TEventName extends EventKey<SoundEvents>>(eventName: TEventName, event: SoundEvents[TEventName]): void;
  public emit(eventName: string, event?: any): void;
  public emit<TEventName extends EventKey<SoundEvents> | string>(eventName: TEventName, event?: any): void {
    this.events.emit(eventName, event);
  }

  public on<TEventName extends EventKey<SoundEvents>>(eventName: TEventName, handler: Handler<SoundEvents[TEventName]>): Subscription;
  public on(eventName: string, handler: Handler<unknown>): Subscription;
  public on<TEventName extends EventKey<SoundEvents> | string>(eventName: TEventName, handler: Handler<any>): Subscription {
    return this.events.on(eventName, handler);
  }

  public once<TEventName extends EventKey<SoundEvents>>(eventName: TEventName, handler: Handler<SoundEvents[TEventName]>): Subscription;
  public once(eventName: string, handler: Handler<unknown>): Subscription;
  public once<TEventName extends EventKey<SoundEvents> | string>(eventName: TEventName, handler: Handler<any>): Subscription {
    return this.events.once(eventName, handler);
  }

  public off<TEventName extends EventKey<SoundEvents>>(eventName: TEventName, handler: Handler<SoundEvents[TEventName]>): void;
  public off(eventName: string, handler: Handler<unknown>): void;
  public off(eventName: string): void;
  public off<TEventName extends EventKey<SoundEvents> | string>(eventName: TEventName, handler?: Handler<any>): void {
    this.events.off(eventName, handler as any);
  }
}
