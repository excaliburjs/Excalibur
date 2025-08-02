import { Sound } from './Sound';

export type AnyString = {} & string;

export interface ChannelSoundsConfiguration {
  sounds: Sound[];
}

export interface SoundConfig<Channel extends string = string> {
  sound: Sound;

  /**
   * Maximum volume for the sound manager to use, all soundManager.play(.5) calls will
   */
  volume?: number;

  /**
   *
   * You may also add a list of string `channels` to do group operations to sounds at once. For example mute all 'background' sounds.
   */
  channels?: Channel[];
}

export interface SoundManagerOptions<Channel extends string = string> {
  /**
   * Optionally specify the possible channels to avoid typo's
   */
  channels?: readonly Channel[];
  /**
   * Optionally set the default maximum volume for all sounds
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
  sounds: (Sound | SoundConfig<NoInfer<Channel> | AnyString>)[];
}

export type PossibleChannels<T> = T extends SoundManagerOptions<infer Channels> ? Channels : never;

export class SoundManger<Channel extends string> {
  private _tagToConfig: Map<Channel, ChannelSoundsConfiguration>;
  private _mix: Map<Sound, number>;
  private _muted = new Set<Sound>();
  private _all = new Set<Sound>();
  private _defaultVolume: number = 1;

  constructor(options: SoundManagerOptions<Channel>) {
    this._tagToConfig = new Map<Channel, ChannelSoundsConfiguration>();
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
          this.addChannel(sound, channels as Channel[]);
        }
      }
    }
  }

  public getSounds(): readonly Sound[] {
    return Array.from(this._all);
  }

  public getSoundsForChannel(channel: Channel | AnyString): readonly Sound[] {
    const config = this._tagToConfig.get(channel as Channel);
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
   * Play all Sounds that match a specific set of channels and optionally apply a custom temporary volume multiplied against the maximum volume
   */
  public play(channels: Channel[], volume?: number): Promise<void>;
  /**
   * Play a Sound and optionally apply a custom temporary volume multiplied against the maximum volume
   */
  public play(sound: Sound, volume?: number): Promise<void>;
  public play(channelsOrSound: Channel[] | Sound, volume: number = this._defaultVolume): Promise<void> {
    if (Array.isArray(channelsOrSound)) {
      const tags = channelsOrSound;

      const playing: Promise<boolean>[] = [];
      const playedAudio = new Set<Sound>();

      for (const tag of tags) {
        const sounds = this.getSoundsForChannel(tag);
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

    const sound = channelsOrSound;
    if (this._isMuted(sound)) {
      return Promise.resolve();
    }

    const effectiveVolume = volume * this._getCurrentVolume(sound);
    return sound.play(effectiveVolume) as unknown as Promise<void>;
  }

  /**
   * Set the volume of a playing or non-playing sound
   *
   * Adjusts the mixed volume to the supplied value
   */
  public setVolume(sound: Sound, volume: number): void;
  /**
   * Set the volume of playing and non-playing sounds
   *
   * Adjusts the mixed volume to the supplied value
   *
   */
  public setVolume(channels: Channel[], volume: number): void;
  public setVolume(channelsOrSound: Channel[] | Sound, volume: number): void {
    if (channelsOrSound instanceof Sound) {
      const sound = channelsOrSound;
      this._setMix(sound, volume);
      return;
    }
    const tags = channelsOrSound;
    for (const tag of tags) {
      const sounds = this.getSoundsForChannel(tag);
      for (const sound of sounds) {
        if (this._isMuted(sound)) {
          continue;
        }
        this._setMix(sound, volume);
      }
    }
  }

  /**
   * Gets the volumn for a sound
   */
  public getVolume(sound: Sound): number {
    return this._mix.get(sound) ?? 0;
  }

  /**
   * Set the maximum volume a sound, if not set assumed to be 1.0 (100% of the source volume)
   */
  private _setMix(sound: Sound, volume: number): void {
    this._mix.set(sound, volume);
    sound.volume = volume;
  }

  /**
   * Remove the maximum volume for a sound, will be 100% of the source volume
   *
   * Untracks the Sound in the sound manager
   */
  public untrack(sound: Sound): void {
    this._mix.delete(sound);
  }

  /**
   * Mut specific sound by instance, in none provided all sounds are muted
   */
  public mute(sound?: Sound): void;
  /**
   * Mute specific Sounds by channel, if none are provided all sounds are muted
   */
  public mute(channels?: Channel[]): void;
  public mute(channelsOrSound?: Channel[] | Sound): void {
    if (channelsOrSound instanceof Sound) {
      const sound = channelsOrSound;
      this._muted.add(sound);
      sound.pause();
      return;
    }
    const tags = channelsOrSound;
    if (tags) {
      for (const tag of tags) {
        const sounds = this.getSoundsForChannel(tag);
        for (let i = 0; i < sounds.length; i++) {
          this._muted.add(sounds[i]);
          sounds[i].pause();
        }
      }
      return;
    }

    this._muted = new Set(this._all);
    this._muted.forEach((s) => s.pause());
  }

  public toggle(sound?: Sound): void;
  public toggle(channels?: Channel[]): void;
  public toggle(channelsOrSound?: Channel[] | Sound): void {
    if (channelsOrSound instanceof Sound) {
      const sound = channelsOrSound;
      if (this._isMuted(sound)) {
        this.unmute(sound);
      } else {
        this.mute(sound);
      }
      return;
    }

    const tags = channelsOrSound;
    if (tags) {
      for (const tag of tags) {
        const sounds = this.getSoundsForChannel(tag);
        for (let i = 0; i < sounds.length; i++) {
          if (this._isMuted(sounds[i])) {
            this.unmute(sounds[i]);
          } else {
            this.mute(sounds[i]);
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
   * Unmute specific Sounds by instance, if none are provided all sounds are unmuted
   */
  public unmute(sound?: Sound): void;
  /**
   * Unmute specific Sounds by tag, if none are provided all sounds are unmuted
   */
  public unmute(channels?: Channel[]): void;
  public unmute(channelsOrSound?: Channel[] | Sound): void {
    if (channelsOrSound instanceof Sound) {
      const sound = channelsOrSound;
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      sound.play();
      this._muted.delete(sound);
      return;
    }
    const tags = channelsOrSound;
    if (tags) {
      for (const tag of tags) {
        const sounds = this.getSoundsForChannel(tag);
        for (let i = 0; i < sounds.length; i++) {
          if (this._muted.has(sounds[i])) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            sounds[i].play();
            this._muted.delete(sounds[i]);
          }
        }
      }
      return;
    }

    this._muted.forEach((s) => s.play());
    this._muted.clear();
  }

  /**
   * Apply a list of channels to a sound instance
   */
  public addChannel(sound: Sound, channels: Channel[] | AnyString[]) {
    const currentVolume = this._mix.get(sound);

    this._mix.set(sound, currentVolume ?? this._defaultVolume);
    this._all.add(sound);
    for (const tag of channels) {
      let maybeConfiguration = this._tagToConfig.get(tag as Channel);
      if (!maybeConfiguration) {
        maybeConfiguration = {
          sounds: [sound]
        };
      }
      if (maybeConfiguration.sounds.indexOf(sound) === -1) {
        maybeConfiguration.sounds.push(sound);
      }

      this._tagToConfig.set(tag as Channel, maybeConfiguration);
    }
  }
}
