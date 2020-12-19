import { ExResponse } from '../../Interfaces/AudioImplementation';
import { Audio } from '../../Interfaces/Audio';
import { Engine } from '../../Engine';
import { Resource } from '../Resource';
import { WebAudioInstance } from './WebAudioInstance';
import { AudioContextFactory } from './AudioContext';
import { NativeSoundEvent, NativeSoundProcessedEvent } from '../../Events/MediaEvents';
import { canPlayFile } from '../../Util/Sound';
import { Loadable } from '../../Interfaces/Index';
import { Logger } from '../../Util/Log';
import { Class } from '../../Class';

/**
 * The [[Sound]] object allows games built in Excalibur to load audio
 * components, from soundtracks to sound effects. [[Sound]] is an [[Loadable]]
 * which means it can be passed to a [[Loader]] to pre-load before a game or level.
 */
export class Sound extends Class implements Audio, Loadable<AudioBuffer> {
  public logger: Logger = Logger.getInstance();
  public data: AudioBuffer;
  private _resource: Resource<ArrayBuffer>;
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

    this.emit('volumechange', new NativeSoundEvent(this));

    this.logger.debug('Set loop for all instances of sound', this.path, 'to', this._volume);
  }
  public get volume(): number {
    return this._volume;
  }

  public get duration(): number | undefined {
    return this._duration;
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

  private _loop = false;
  private _volume = 1;
  private _duration: number | undefined = undefined;
  private _isStopped = false;
  private _isPaused = false;
  private _tracks: Audio[] = [];
  private _engine: Engine;
  private _wasPlayingOnHidden: boolean = false;
  private _audioContext = AudioContextFactory.create();

  /**
   * @param paths A list of audio sources (clip.wav, clip.mp3, clip.ogg) for this audio clip. This is done for browser compatibility.
   */
  constructor(...paths: string[]) {
    super();
    this._resource = new Resource('', ExResponse.type.arraybuffer);
    /** Chrome : MP3, WAV, Ogg
     * Firefox : WAV, Ogg,
     * IE : MP3, WAV coming soon
     * Safari MP3, WAV, Ogg
     */
    for (const path of paths) {
      if (canPlayFile(path)) {
        this.path = path;
        break;
      }
    }

    if (!this.path) {
      this.logger.warn('This browser does not support any of the audio files specified:', paths.join(', '));
      this.logger.warn('Attempting to use', paths[0]);
      this.path = paths[0]; // select the first specified
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
    this._duration = typeof audiobuffer === 'object' ? audiobuffer.duration : undefined;
    this.emit('processed', new NativeSoundProcessedEvent(this, audiobuffer));
    return this.data = audiobuffer;
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

  /**
   * Play the sound, returns a promise that resolves when the sound is done playing
   * An optional volume argument can be passed in to play the sound. Max volume is 1.0
   */
  public play(volume?: number): Promise<boolean> {
    if (!this.isLoaded()) {
      this.logger.warn('Cannot start playing. Resource', this.path, 'is not loaded yet');

      return Promise.resolve(true);
    }

    if (this._isStopped) {
      this.logger.warn('Cannot start playing. Engine is in a stopped state.');
      return Promise.resolve(false);
    }

    this.volume = volume || this.volume;

    if (this._isPaused) {
      return this._resumePlayback();
    } else {
      return this._startPlayback();
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

    this._isPaused = true;

    this.emit('pause', new NativeSoundEvent(this));

    this.logger.debug('Paused all instances of sound', this.path);
  }

  /**
   * Stop the sound if it is currently playing and rewind the track. If the sound is not playing, rewinds the track.
   */
  public stop() {
    for (const track of this._tracks) {
      track.stop();
    }

    this.emit('stop', new NativeSoundEvent(this));

    this._isPaused = false;
    this._tracks.length = 0;
    this.logger.debug('Stopped all instances of sound', this.path);
  }



  /**
   * Get Id of provided AudioInstance in current trackList
   * @param track [[AudioInstance]] which Id is to be given
   */
  public getTrackId(track: Audio): number {
    return this._tracks.indexOf(track);
  }

  private async _resumePlayback(): Promise<boolean> {
    if (this._isPaused) {
      const resumed: Promise<boolean>[] = [];
      // ensure we resume *current* tracks (if paused)
      for (const track of this._tracks) {
        resumed.push(track.play());
      }

      this._isPaused = false;

      this.emit('resume', new NativeSoundEvent(this));

      this.logger.debug('Resuming paused instances for sound', this.path, this._tracks);
      // resolve when resumed tracks are done
      await Promise.all(resumed);
    }
    return true;
  }

  /**
   * Starts playback, returns a promise that resolves when playback is complete
   */
  private async _startPlayback(): Promise<boolean> {
    const track = await this._getTrackInstance(this.data);

    const complete = await track.play(() => {
      this.emit('playbackstart', new NativeSoundEvent(this, track));
      this.logger.debug('Playing new instance for sound', this.path);
    });

    // when done, remove track
    this.emit('playbackend', new NativeSoundEvent(this, track));
    this._tracks.splice(this.getTrackId(track), 1);

    return complete;
  }

  private _getTrackInstance(data: AudioBuffer): WebAudioInstance {
    const newTrack = new WebAudioInstance(data);

    newTrack.loop = this.loop;
    newTrack.volume = this.volume;
    newTrack.duration = this.duration;

    this._tracks.push(newTrack);

    return newTrack;
  }
}
