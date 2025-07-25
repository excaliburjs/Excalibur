import { Sound } from './Sound';

export interface TaggedSoundsConfiguration {
  sounds: Sound[];
}

export interface SoundConfig {
  sound: Sound;
  volume?: number;
  channels?: string[];
}

export interface SoundManagerOptions {
  /**
   * Optionally set the default volume for all sounds
   *
   * Default is 1 (100%)
   */
  volume?: number;
  /**
   * Optionally set the max `volume` for a `sound` to be when played. All other volume operations will be a fraction of the mix.
   *
   * You may also add a list of string `channels` to do group operations to sounds at once. For example mute all 'background' sounds.
   *
   */
  sounds: (Sound | { sound: Sound; volume?: number; channels?: string[] })[];
}

// export type IsEqual<T, U> = [T] extends [U] ? true : false;
// export type PossibleChannels2<T> = T extends SoundManagerOptions ? T : never;
// export type PossibleChannels<TSoundManagerOptions> = TSoundManagerOptions extends SoundManagerOptions
//   ? Extract<TSoundManagerOptions['sounds'][number]['channels'][number], string>
//   : never;

export class SoundManger<TSoundManagerOptions extends SoundManagerOptions, Channel = string> {
  private _tagToConfig: Map<Channel, TaggedSoundsConfiguration>;
  private _mix: Map<Sound, number>;
  private _muted = new Set<Sound>();
  private _all = new Set<Sound>();
  private _defaultVolume: number = 1;

  constructor(options: TSoundManagerOptions) {
    this._tagToConfig = new Map<Channel, TaggedSoundsConfiguration>();
    this._mix = new Map<Sound, number>();
    this._defaultVolume = options.volume ?? 1;
    if (options.sounds) {
      for (const soundOrConfig of options.sounds) {
        let sound: Sound;
        let volume: number | undefined;
        let channels: string[] | undefined;
        if (soundOrConfig instanceof Sound) {
          sound = soundOrConfig;
          volume = this._defaultVolume;
          channels = [];
        } else {
          ({ sound, volume, channels } = soundOrConfig);
        }
        this._mix.set(sound, volume ?? this._defaultVolume);
        this._all.add(sound);

        if (channels) {
          this.tag(sound, channels as Channel[]);
        }
      }
    }
  }

  public getSoundsForTag(tag: Channel): readonly Sound[] {
    const config = this._tagToConfig.get(tag);
    if (config) {
      return config.sounds;
    }

    return [];
  }

  private _isMuted(sound: Sound): boolean {
    return this._muted.has(sound);
  }

  private _getCurrentVolume(sound: Sound): number {
    if (this._isMuted(sound)) {
      return 0;
    }

    let mix = this._defaultVolume;

    if (this._mix.has(sound)) {
      mix *= this._mix.get(sound) ?? this._defaultVolume;
    }

    return mix;
  }

  /**
   * Play all Sounds that match a specific set of tags and optionally apply a custom temporary volume multiplied against the maximum volume
   */
  public play(tags: Channel[], volume?: number): Promise<void>;

  /**
   * Play a Sound and optionally apply a custom temporary volume multiplied against the maximum volume
   */
  public play(sound: Sound, volume?: number): Promise<void>;
  public play(tagsOrSound: Channel[] | Sound, volume: number = this._defaultVolume): Promise<void> {
    if (Array.isArray(tagsOrSound)) {
      const tags = tagsOrSound;

      const playing: Promise<boolean>[] = [];
      const playedAudio = new Set<Sound>();

      for (const tag of tags) {
        const sounds = this.getSoundsForTag(tag);
        for (const sound of sounds) {
          if (playedAudio.has(sound) || this._isMuted(sound)) {
            continue;
          }
          const mixVolume = this._getCurrentVolume(sound);

          playing.push(sound.play(mixVolume * volume));
          playedAudio.add(sound);
        }
      }

      return Promise.all(playing) as unknown as Promise<void>;
    }

    const sound = tagsOrSound;
    if (this._isMuted(sound)) {
      return Promise.resolve();
    }

    const effectiveVolume = volume * this._getCurrentVolume(sound);
    return sound.play(effectiveVolume) as unknown as Promise<void>;
  }

  /**
   * Set the volume of playing and non-playing sounds
   *
   * Adjusts the mixed volume to the supplied value
   *
   */
  public setVolume(tags: Channel[], volume: number) {
    for (const tag of tags) {
      const sounds = this.getSoundsForTag(tag);
      for (const sound of sounds) {
        if (this._isMuted(sound)) {
          continue;
        }
        this.mix(sound, volume);
      }
    }
  }

  /**
   * Set the maximum volume a sound, if not set assumed to be 1.0 (100% of the source volume)
   */
  public mix(sound: Sound, volume: number): void {
    this._mix.set(sound, volume);
    sound.volume = volume;
  }

  /**
   * Remove the maximum volume for a sound, will be 100% of the source volume
   */
  public unmix(sound: Sound): void {
    this._mix.delete(sound);
  }

  /**
   * Mute specific Sounds by tag, if none are provided all sounds are muted
   */
  public mute(tags?: Channel[]) {
    if (tags) {
      for (const tag of tags) {
        const sounds = this.getSoundsForTag(tag);
        for (let i = 0; i < sounds.length; i++) {
          this._muted.add(sounds[i]);
          sounds[i].pause();
        }
      }
    } else {
      this._muted = new Set(this._all);

      this._muted.forEach((s) => s.pause());
    }
  }

  public toggle(tags?: Channel[]) {
    if (tags) {
      for (const tag of tags) {
        const sounds = this.getSoundsForTag(tag);
        for (let i = 0; i < sounds.length; i++) {
          if (this._isMuted(sounds[i])) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            sounds[i].play();
            this._muted.delete(sounds[i]);
          } else {
            this._muted.add(sounds[i]);
            sounds[i].pause();
          }
        }
      }
    } else {
      if (this._muted.size > 0) {
         
        this._muted.forEach((s) => s.play());
        this._muted.clear();
      } else {
        this._muted = new Set(this._all);
        this._muted.forEach((s) => s.pause());
      }
    }
  }

  /**
   * Unmute specific Sounds by tag, if none are provided all sounds are unmuted
   */
  public unmute(tags?: Channel[]) {
    if (tags) {
      for (const tag of tags) {
        const sounds = this.getSoundsForTag(tag);
        for (let i = 0; i < sounds.length; i++) {
          if (this._muted.has(sounds[i])) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            sounds[i].play();
            this._muted.delete(sounds[i]);
          }
        }
      }
    } else {
       
      this._muted.forEach((s) => s.play());
      this._muted.clear();
    }
  }

  public tag(sound: Sound, tags: Channel[]) {
    for (const tag of tags) {
      let maybeConfiguration = this._tagToConfig.get(tag);
      if (!maybeConfiguration) {
        maybeConfiguration = {
          sounds: [sound]
        };
      }
      maybeConfiguration.sounds.push(sound);

      this._tagToConfig.set(tag, maybeConfiguration);
    }
  }
}

// const config = {
// 	sounds: [
// 		{ sound: null as unknown as Sound, volume: .2, channels: ['music', 'background'] },
// 		{ sound: null as unknown as Sound, volume: .2, channels: ['fx'] }
// 	]
// };
//
//
// export type _cf = typeof config;
// export type _eq = IsEqual<_cf, SoundManagerOptions>;
// export type tt<T> = T extends SoundManagerOptions ? T : never;
// export type _rf = Extract<_cf['sounds'][number]['channels'][number], string>
// export type _rt = tt<_cf>;
// export type _re = PossibleChannels<_cf>;
// export type _re2 = PossibleChannels2<_cf>;
//
// const sm = new SoundManger({
// 	sounds: [
// 		{ sound: null as unknown as Sound, volume: .2, channels: ['music', 'background'] },
// 		{ sound: null as unknown as Sound, volume: .2, channels: ['fx'] }
// 	]
// } as const);
// sm.play(['music', 'fx']);
// sm.play(['invalid'])
//
