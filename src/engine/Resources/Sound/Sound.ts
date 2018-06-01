import { ExResponse } from '../../Interfaces/IAudioImplementation';
import { IAudio } from '../../Interfaces/IAudio';
import * as Util from '../../Util/Util';
import { Engine } from '../../Engine';
import { Resource } from '../Resource';
import { AudioInstance, AudioInstanceFactory } from './AudioInstance';
import { AudioContextFactory } from './AudioContext';
import { NativeSoundEvent } from '../../Events/MediaEvents';
import { obsolete } from '../../Util/Decorators';
import { Promise } from '../../Promises';

/**
 * The [[Sound]] object allows games built in Excalibur to load audio
 * components, from soundtracks to sound effects. [[Sound]] is an [[ILoadable]]
 * which means it can be passed to a [[Loader]] to pre-load before a game or level.
 *
 * [[include:Sounds.md]]
 */
export class Sound extends Resource<Blob | ArrayBuffer> implements IAudio {
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

   /**
    * Return array of Current AudioInstances playing or being paused
    */
   public get instances(): AudioInstance[] {
      return this._tracks;
   }

   public path: string;

   private _loop = false;
   private _volume = 1;
   private _isPaused = false;
   private _tracks: AudioInstance[] = [];
   private _engine: Engine;
   private _wasPlayingOnHidden: boolean = false;
   private _processedData = new Promise<string|AudioBuffer>();
   private _audioContext = AudioContextFactory.create();

   /**
    * @param paths A list of audio sources (clip.wav, clip.mp3, clip.ogg) for this audio clip. This is done for browser compatibility.
    */
   constructor(...paths: string[]) {
      super('', '');

      this._detectResponceType();
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
   }

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
    * Stop the sound and rewind
    */
   public stop() {
      if (!this.isPlaying()) {
         return;
      }

      for (const track of this._tracks) {
         track.stop();
      }

      this.emit('stop', new NativeSoundEvent(this));

      this._isPaused = false;
      this._tracks.length = 0;
      this.logger.debug('Stopped all instances of sound', this.path);
   }

   public setData(data: any) {
      this.emit('emptied', new NativeSoundEvent(this));

      this.data = data;
      this._processedData = new Promise<string|AudioBuffer>();
   }

   public processData(data: Blob | ArrayBuffer): Promise<string|AudioBuffer> {
      /**
       * Processes raw arraybuffer data and decodes into WebAudio buffer (async).
       */
      const processPromise: Promise<string|AudioBuffer> = (data instanceof ArrayBuffer)
         ? this._processArrayBufferData(data)
         : this._processBlobData(data);

      return processPromise.then(processedData => this._setProcessedData(processedData));
   }

   /**
    * Get Id of provided AudioInstance in current trackList
    * @param track [[AudioInstance]] which Id is to be given
    */
   public getTrackId(track: AudioInstance): number {
      return this._tracks.indexOf(track);
   }

   private _resumePlayback(): Promise<boolean> {
      if (this._isPaused) {
         const resumed = [];
         // ensure we resume *current* tracks (if paused)
         for (const track of this._tracks) {
            resumed.push(track.play());
         }

         this._isPaused = false;

         this.emit('resume', new NativeSoundEvent(this));

         this.logger.debug('Resuming paused instances for sound', this.path, this._tracks);
         // resolve when resumed tracks are done
         return Promise.join(resumed);
      } else {
         return Promise.resolve(true);
      }
   }

   private _startPlayback(): Promise<boolean> {
      const newTrack = this._createNewTrack();
      let playPromise = new Promise<boolean>();

      newTrack.then((track) => {
         track.play().then((resolved) => {
            // when done, remove track
            this.emit('playbackend', new NativeSoundEvent(this, track));
            this._tracks.splice(this.getTrackId(track), 1);

            playPromise.resolve(resolved);

            return resolved;
         });

         this.emit('playbackstart', new NativeSoundEvent(this, track));
         this.logger.debug('Playing new instance for sound', this.path);
      });

      return playPromise;
   }

   private _processArrayBufferData(data: ArrayBuffer): Promise<AudioBuffer> {
      const complete = new Promise<AudioBuffer>();

      this._audioContext.decodeAudioData(data,
         (buffer: AudioBuffer) => {
            complete.resolve(buffer);
         },
         () => {
            this.logger.error('Unable to decode ' +
               ' this browser may not fully support this format, or the file may be corrupt, ' +
               'if this is an mp3 try removing id3 tags and album art from the file.');
            complete.resolve(undefined);
         });

      return complete;
   }

   private _processBlobData(data: Blob): Promise<string> {
      return new Promise<string>().resolve(super.processData(data));
   }

   private _setProcessedData(processedData: string|AudioBuffer): void {
      this._processedData.resolve(processedData);
   }

   private _createNewTrack(): Promise<AudioInstance> {
      const aiPromise = new Promise<AudioInstance>();

      if (this._processedData.state() !== 0) {
         this.processData(this.data);
      }

      this._processedData.then((processedData) => {
         aiPromise.resolve(this._getTrackInstance(processedData));

         return processedData;
      }, (error) => {
         this.logger.error(error, 'Cannot create AudioInstance due to wrong processed data.');
      });

      return aiPromise;
   }

   private _getTrackInstance(data: string|AudioBuffer): AudioInstance {
      const newTrack = AudioInstanceFactory.create(data);

      newTrack.loop = this.loop;
      newTrack.volume = this.volume;

      this._tracks.push(newTrack);

      return newTrack;
   }

   private _detectResponceType() {
      if ((<any>window).AudioContext) {
         this.responseType = ExResponce.type.arraybuffer;
      } else {
         this.responseType = ExResponce.type.blob;
      }
   }
}
